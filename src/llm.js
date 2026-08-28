const store = require('./store');

// Extract the first balanced { ... } JSON object from arbitrary text.
// Handles markdown fences, trailing SSE markers like "data: [DONE]", and prose.
function extractJSON(text) {
  if (!text) throw new Error('Respons AI kosong.');
  let t = String(text).trim();
  t = t.replace(/```(?:json)?/gi, '').trim();
  const start = t.indexOf('{');
  if (start === -1) throw new Error('Tidak ada object JSON dalam respons AI.');

  let depth = 0, inStr = false, esc = false, end = -1;
  for (let i = start; i < t.length; i++) {
    const c = t[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
    } else {
      if (c === '"') inStr = true;
      else if (c === '{') depth++;
      else if (c === '}') {
        depth--;
        if (depth === 0) { end = i; break; }
      }
    }
  }
  if (end === -1) throw new Error('Object JSON tidak tertutup dalam respons AI.');

  const candidate = t.slice(start, end + 1);
  try { return JSON.parse(candidate); }
  catch (e) { throw new Error('Gagal parse JSON dari AI: ' + e.message); }
}

async function chat(messages, opts = {}) {
  const s = (opts && opts.settings) || store.getSettings();
  if (!s.baseURL || !s.apiKey) {
    throw new Error('AI belum dikonfigurasi. Buka menu Settings untuk isi Base URL & API Key.');
  }
  const url = s.baseURL.replace(/\/$/, '') + '/chat/completions';
  const baseBody = {
    model: opts.model || s.model || 'gpt-4o-mini',
    messages,
    temperature: opts.temperature != null ? opts.temperature : 0.3
  };
  if (opts.json) baseBody.max_tokens = opts.maxTokens || 8192;

  const headers = { 'Content-Type': 'application/json' };
  if (s.apiKey) headers['Authorization'] = 'Bearer ' + s.apiKey;

  // Transport timeout so a hung LLM endpoint fails fast instead of hanging the request.
  const controller = new AbortController();
  const timeoutMs = opts.timeoutMs || 60000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  // Some OpenAI-compatible endpoints reject response_format: { type: 'json_object' }.
  // Try with it first (more reliable when supported); on a format-related error, retry
  // without it and rely on the prompt's "Balas hanya JSON" instruction + extractJSON.
  const variants = opts.json
    ? [{ ...baseBody, response_format: { type: 'json_object' } }, baseBody]
    : [baseBody];

  let lastErr;
  for (const body of variants) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal
      });
      clearTimeout(timer);
      if (!res.ok) {
        const t = await res.text();
        const msg = 'LLM error ' + res.status + ': ' + t.slice(0, 400);
        if (body.response_format && /response_format|json_object|invalid_request/i.test(t)) { lastErr = new Error(msg); continue; }
        throw new Error(msg);
      }
      // Endpoint may append SSE markers (e.g. "data: [DONE]"); extract the JSON envelope.
      const text = await res.text();
      const data = extractJSON(text);
      const msg = (data.choices && data.choices[0] && data.choices[0].message) || {};
      // Reasoning models may leave content empty and put the answer in reasoning_content.
      return msg.content || msg.reasoning_content || '';
    } catch (e) {
      clearTimeout(timer);
      if (e.name === 'AbortError') throw new Error('Permintaan ke LLM melebihi batas waktu (' + timeoutMs + ' ms).');
      if (body.response_format && /response_format|json_object|invalid_request/i.test(e.message)) { lastErr = e; continue; }
      throw e;
    }
  }
  throw lastErr || new Error('Permintaan ke LLM gagal.');
}

// High-level helper: for json calls, retry on parse failure (reasoning models
// sometimes emit empty content on the first attempt) and return the parsed object.
async function complete(messages, opts = {}) {
  const attempts = opts.json ? (opts.retries || 3) : 1;
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    const content = await chat(messages, opts);
    if (!opts.json) return content;
    try { return extractJSON(content); }
    catch (e) { lastErr = e; }
  }
  throw lastErr || new Error('Gagal mendapatkan JSON dari AI setelah beberapa percobaan.');
}

module.exports = { chat, complete, extractJSON };
