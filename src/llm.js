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
  const s = store.getSettings();
  if (!s.baseURL || !s.apiKey) {
    throw new Error('AI belum dikonfigurasi. Buka menu Settings untuk isi Base URL & API Key.');
  }
  const url = s.baseURL.replace(/\/$/, '') + '/chat/completions';
  const body = {
    model: opts.model || s.model || 'gpt-4o-mini',
    messages,
    temperature: opts.temperature != null ? opts.temperature : 0.3
  };
  if (opts.json) {
    body.response_format = { type: 'json_object' };
    body.max_tokens = opts.maxTokens || 8192;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + s.apiKey },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error('LLM error ' + res.status + ': ' + t.slice(0, 400));
  }
  // Endpoint may append SSE markers (e.g. "data: [DONE]"); extract the JSON object.
  const text = await res.text();
  const data = extractJSON(text);
  const msg = (data.choices && data.choices[0] && data.choices[0].message) || {};
  // Reasoning models may leave content empty and put the answer in reasoning_content.
  return msg.content || msg.reasoning_content || '';
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

function parseJSON(text) {
  return extractJSON(text);
}

module.exports = { chat, complete, parseJSON };
