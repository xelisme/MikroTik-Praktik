/* ============================================================
   MikroTik Praktik — Guru & Juri AI  (frontend, no build)
   All state kept here. Only endpoints from the API contract are used.
   ============================================================ */

(() => {
  "use strict";

  /* ---------------- State ---------------- */
  const state = {
    scenarios: [],        // [{ id, title, level, topic, mode, ...full }]
    templates: [],        // [{ id, title, level, topic }]
    settings: null,       // { configured, baseURL, model }
    tutorials: [],        // [{ id, title, level, topic, mode, ...full }]
    currentScenario: null, // active scenario object (from generate/select)
    chat: [],             // [{ role: "user"|"assistant", content, error? }]
    chatOpen: false,
    chatBusy: false,
    currentView: "buat",
    sshAbort: null,       // AbortController for streaming
    sshContext: null,     // { host, output } from last live audit, for "Tanya AI"
    activeScenarioId: null,
    activeTutorial: null,
    modeTouched: false,   // user has explicitly chosen an assess mode
  };

  /* ---------------- Tiny helpers ---------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") node.className = v;
      else if (k === "html") node.innerHTML = v;
      else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
      else if (v !== null && v !== undefined) node.setAttribute(k, v);
    }
    for (const c of children) {
      if (c == null) continue;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return node;
  }

  function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  let toastTimer = 0;
  function toast(message, type = "info", title = "") {
    const wrap = $("#toast-wrap");
    const node = el("div", { class: `toast ${type}` },
      title ? el("strong", {}, title) : null,
      el("span", {}, message)
    );
    wrap.appendChild(node);
    setTimeout(() => {
      node.classList.add("is-leaving");
      setTimeout(() => node.remove(), 300);
    }, 4200);
    return node;
  }

  async function copyText(text, btn) {
    let ok = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        ok = true;
      }
    } catch (e) { /* fall through to legacy path */ }
    if (!ok) {
      // Fallback for non-secure contexts (e.g. accessing the app over LAN via http://192.168.x.x)
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.top = "-1000px";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch (e) { ok = false; }
    }
    if (ok) {
      if (btn) {
        const old = btn.textContent;
        btn.textContent = "Tersalin";
        btn.classList.add("is-done");
        setTimeout(() => { btn.textContent = old; btn.classList.remove("is-done"); }, 1400);
      }
    } else {
      toast("Tidak bisa menyalin ke clipboard.", "err", "Copy gagal");
    }
  }

  /* ---------------- Unified frontend helpers (U4) ---------------- */
  // Toggle a button into a busy/loading state, run fn(), then restore it.
  async function withButton(btn, busyLabel, fn) {
    const labelEl = btn.querySelector(".btn__label");
    const prev = labelEl ? labelEl.textContent : btn.textContent;
    btn.disabled = true;
    btn.classList.add("is-loading");
    if (labelEl) labelEl.textContent = busyLabel;
    else btn.textContent = busyLabel;
    try {
      await fn();
    } finally {
      btn.disabled = false;
      btn.classList.remove("is-loading");
      if (labelEl) labelEl.textContent = prev;
      else btn.textContent = prev;
    }
  }

  // Properly parse Server-Sent Events delimited by blank lines ("\n\n").
  // The server emits: 'data: ' + JSON.stringify(obj) + '\n\n'
  async function readSSE(response, onEvent) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop(); // keep last (possibly partial) event
      for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed) continue;
        let raw = trimmed;
        if (raw.startsWith("data:")) raw = raw.slice(5).trim();
        try { onEvent(JSON.parse(raw)); } catch (_) { /* ignore malformed */ }
      }
    }
    const tail = buffer.trim();
    if (tail) {
      let raw = tail;
      if (raw.startsWith("data:")) raw = raw.slice(5).trim();
      try { onEvent(JSON.parse(raw)); } catch (_) {}
    }
  }

  // Fetch `url`, fill `sel` with options (emptyLabel first). labelFn(item)
  // returns { value, text } for each item; falsy values are skipped.
  async function populateSelect(sel, url, emptyLabel, labelFn, errTitle) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const list = await res.json();
      const items = Array.isArray(list) ? list : [];
      sel.innerHTML = "";
      sel.appendChild(el("option", { value: "" }, emptyLabel));
      items.forEach((item) => {
        const r = labelFn(item);
        if (!r || r.value == null || r.value === "") return;
        const value = r.value;
        const text = r.text != null ? r.text : r.value;
        sel.appendChild(el("option", { value }, text));
      });
    } catch (e) {
      sel.innerHTML = "";
      sel.appendChild(el("option", { value: "" }, emptyLabel));
      toast("Gagal memuat daftar dari server.", "err", errTitle);
    }
  }

  // Build the shared result-header card (title + tag-row + id + Salin ID + open-in-assess).
  function renderResultHeader(d, isTutorial = false) {
    const openBtn = el("button", {
      class: "btn btn--primary open-assess-btn", type: "button",
      onclick: () => activateAndAssess({ id: d.id, tutorial: isTutorial }),
    }, "Buka di Nilai Konfigurasi →");
    return el("div", { class: "card" },
      el("div", { class: "scenario-head" },
        el("div", {},
          el("h2", {}, d.title || (isTutorial ? "Tutorial" : "Skenario")),
          el("div", { class: "tag-row" },
            el("span", { class: "tag" }, cap(d.level)),
            el("span", { class: "tag" }, d.topic || "Bebas"),
            el("span", { class: "tag tag--mode" }, modeLabel(d.mode))
          ),
          el("div", { class: "scenario-id-row" },
            el("span", { class: "scenario-id" }, "ID: " + d.id),
            el("button", { class: "copy-btn", type: "button", onclick: (ev) => copyText(d.id, ev.currentTarget) }, "Salin ID")
          )
        )
      ),
      openBtn
    );
  }

  // Navigate to Nilai, ensure the item is listed, select it, and activate it.
  function activateAndAssess({ id, tutorial }) {
    showView("nilai");
    const sel = $("#assess-scenario");
    if (![...sel.options].some((o) => o.value === id)) {
      refreshScenarioOptions();
    }
    sel.value = id;
    onScenarioSelected(id);
    if (tutorial) {
      const t = state.tutorials.find((x) => x.id === id);
      if (t) toast("Jobsheet aktif: " + t.title, "ok");
    }
  }

  // Apply the assess-mode radio for a given mode (unless the user overrode it).
  function applyModeRadio(mode) {
    if (mode && !state.modeTouched) {
      const r = $(`input[name="assess-mode"][value="${mode}"]`);
      if (r) r.checked = true;
    }
  }

  /* ---------------- View switching ---------------- */
  function showView(name) {
    state.currentView = name;
    $$(".nav__tab").forEach((t) => t.classList.toggle("is-active", t.dataset.view === name));
    $$(".view").forEach((v) => v.classList.toggle("is-active", v.id === `view-${name}`));
    if (name === "nilai") refreshScenarioOptions();
  }

  $$(".nav__tab").forEach((tab) => {
    tab.addEventListener("click", () => showView(tab.dataset.view));
  });

  /* ---------------- Input tabs (SSH / Paste) ---------------- */
  $$("#input-tabs .tabs__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const which = btn.dataset.input;
      $$("#input-tabs .tabs__btn").forEach((b) => b.classList.toggle("is-active", b === btn));
      $("#panel-ssh").classList.toggle("is-active", which === "ssh");
      $("#panel-paste").classList.toggle("is-active", which === "paste");
    });
  });

  /* ---------------- SSH auth toggle ---------------- */
  $$('input[name="ssh-auth"]').forEach((r) => {
    r.addEventListener("change", () => {
      const isKey = r.value === "key" && r.checked;
      $("#field-ssh-password").hidden = isKey;
      $("#field-ssh-key").hidden = !isKey;
    });
  });

  /* =========================================================
     VIEW 1 — Buat Soal
     ========================================================= */
  async function loadTemplates() {
    await populateSelect(
      $("#gen-topic"),
      "/api/scenario-templates",
      "Bebas (ai pilih)",
      (t) => ({ value: t.title, text: `${t.title} — ${cap(t.level)}` }),
      "Template"
    );
  }

  function cap(s) { return String(s || "").charAt(0).toUpperCase() + String(s || "").slice(1); }

  $("#form-generate").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = $("#btn-generate");
    const level = $("#gen-level").value;
    const topic = $("#gen-topic").value;        // "" => bebas
    const mode = $('input[name="mode"]:checked').value;
    const notes = $("#gen-notes").value.trim() || undefined;

    try {
      await withButton(btn, "Membuat…", async () => {
        const res = await fetch("/api/scenarios/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ level, topic, mode, notes }),
        });
        let data = {};
        try { data = await res.json(); } catch (_) {}
        if (!res.ok) throw new Error(data.error || ("HTTP " + res.status));

        // keep in memory
        const existing = state.scenarios.find((s) => s.id === data.id);
        if (!existing) state.scenarios.push(data);
        else Object.assign(existing, data);
        state.activeScenarioId = data.id;
        state.currentScenario = existing || data;

        renderScenarioResult(data);
        toast("Skenario berhasil dibuat.", "ok", "Selesai");
      });
    } catch (err) {
      toast("Generate gagal: " + (err.message || "cek koneksi/settings AI"), "err", "Generate gagal");
    }
  });

  function sectionBlock(title, bodyText) {
    return el("div", { class: "section" },
      el("div", { class: "section__top" },
        el("h4", { class: "section__title" }, title),
        el("button", {
          class: "copy-btn", type: "button",
          onclick: (ev) => copyText(bodyText, ev.currentTarget),
        }, "Salin")
      ),
      el("p", { class: "section__body" }, bodyText || "—")
    );
  }

  function renderScenarioResult(d) {
    const box = $("#scenario-result");
    box.innerHTML = "";

    const head = renderResultHeader(d, false);
    const openBtn = head.querySelector(".open-assess-btn");
    head.insertBefore(sectionBlock("Konteks Bisnis", d.konteksBisnis), openBtn);
    head.insertBefore(sectionBlock("Requirement", d.requirement), openBtn);
    head.insertBefore(sectionBlock("Batasan", d.batasan), openBtn);
    head.insertBefore(el("div", { class: "hidden-note" },
      el("span", { html: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Zm-1 6h2v6h-2V8Zm0 8h2v2h-2v-2Z"/></svg>' }),
      el("span", {}, "Penilaian dan kriteria keberhasilan disimpan tersembunyi di server. Kamu hanya perlu menyelesaikan requirement di atas; juri AI yang akan menilai.")
    ), openBtn);

    box.appendChild(head);
    box.hidden = false;
    box.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* =========================================================
     VIEW 2 — Nilai Konfigurasi
     ========================================================= */
  function refreshScenarioOptions() {
    const sel = $("#assess-scenario");
    const current = sel.value;
    sel.innerHTML = "";
    sel.appendChild(el("option", { value: "" }, "— pilih skenario hasil generate —"));
    if (state.scenarios.length) {
      const g = el("optgroup", { label: "Skenario" });
      state.scenarios.forEach((s) => {
        g.appendChild(el("option", { value: s.id, "data-kind": "scenario" }, `${s.title} (${cap(s.level)})`));
      });
      sel.appendChild(g);
    }
    if (state.tutorials.length) {
      const g = el("optgroup", { label: "Jobsheet / Tutorial" });
      state.tutorials.forEach((t) => {
        g.appendChild(el("option", { value: t.id, "data-kind": "tutorial" }, `Jobsheet: ${t.title} (${cap(t.level)})`));
      });
      sel.appendChild(g);
    }
    sel.value = current || "";
  }

  $("#assess-scenario").addEventListener("change", (e) => {
    const id = e.target.value;
    $("#assess-scenario-id").value = "";
    if (id) onScenarioSelected(id);
  });

  $("#assess-scenario-id").addEventListener("change", async (e) => {
    const id = e.target.value.trim();
    if (!id) return;
    try {
      const res = await fetch(`/api/scenarios/${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const d = await res.json();
      const existing = state.scenarios.find((s) => s.id === d.id);
      if (!existing) state.scenarios.push(d);
      else Object.assign(existing, d);
      refreshScenarioOptions();
      $("#assess-scenario").value = d.id;
      onScenarioSelected(d.id);
      toast("Skenario dimuat dari server.", "ok");
    } catch (err) {
      toast("ID skenario tidak ditemukan di server.", "err", "Load gagal");
    }
  });

  function onScenarioSelected(id) {
    const sc = state.scenarios.find((s) => s.id === id);
    const tut = sc ? null : state.tutorials.find((t) => t.id === id);
    if (sc) {
      state.activeScenarioId = id;
      state.activeTutorial = null;
      state.currentScenario = sc;
      applyModeRadio(sc.mode);
    } else if (tut) {
      state.activeTutorial = tut;
      state.activeScenarioId = null;
      state.currentScenario = null;
      applyModeRadio(tut.mode);
      prefillSshExtraForTutorial(tut);
    }
    updateActiveTutorialNote();
  }

  function updateActiveTutorialNote() {
    const note = $("#active-tutorial-note");
    if (!note) return;
    if (state.activeTutorial) {
      note.hidden = false;
      note.textContent = "Jobsheet aktif: " + state.activeTutorial.title + " — tempel hasil router atau jalankan SSH Live untuk dinilai.";
    } else {
      note.hidden = true;
    }
  }

  function defaultAuditCommands(tut) {
    const t = (tut && tut.topic ? tut.topic : "").toLowerCase();
    const base = ["/export terse", "/interface print", "/ip address print", "/ip route print",
      "/ip firewall filter print", "/ip firewall mangle print", "/queue print", "/system resource print"];
    if (/hotspot/.test(t)) {
      return ["/export terse", "/ip hotspot print", "/ip hotspot user print", "/ip hotspot active print",
        "/ip firewall filter print", "/ip firewall nat print", "/queue print", "/interface print", "/ip address print"];
    }
    if (/vlan|segment/.test(t)) {
      return ["/export terse", "/interface vlan print", "/interface bridge print", "/ip address print", "/ip route print"];
    }
    if (/queue|qos|prior/.test(t)) {
      return ["/export terse", "/queue print", "/queue tree print", "/ip firewall mangle print", "/interface print"];
    }
    return base;
  }

  function prefillSshExtraForTutorial(tut) {
    const ta = $("#ssh-extra");
    if (!ta || ta.value.trim()) return; // don't overwrite user input
    ta.value = defaultAuditCommands(tut).join("\n");
  }

  // remember explicit mode choice so scenario selection doesn't clobber it
  document.querySelectorAll('input[name="assess-mode"]').forEach((r) => {
    r.addEventListener("change", () => { state.modeTouched = true; });
  });

  /* ---------- SSH Live streaming ---------- */
  $("#form-ssh").addEventListener("submit", async (e) => {
    e.preventDefault();
    const { scenarioId, tutorialContext } = getAssessmentContext();
    const host = $("#ssh-host").value.trim();
    const port = parseInt($("#ssh-port").value, 10) || 22;
    const user = $("#ssh-user").value.trim();
    const authType = $('input[name="ssh-auth"]:checked').value;
    const password = authType === "password" ? $("#ssh-password").value : undefined;
    const key = authType === "key" ? $("#ssh-key").value : undefined;
    const extraCommands = $("#ssh-extra").value
      .split("\n").map((s) => s.trim()).filter(Boolean);

    if (!scenarioId && !extraCommands.length) {
      const msg = state.activeTutorial
        ? "Jobsheet tidak punya audit command bawaan. Isi Perintah tambahan dengan command READ-ONLY (mis. /export terse) untuk menilai via SSH."
        : "Pilih skenario (dengan audit command) atau isi Perintah tambahan.";
      toast(msg, "err", "Konteks kosong");
      return;
    }
    if (!host || !user || (authType === "password" && !password) || (authType === "key" && !key)) {
      toast("Lengkapi host, user, dan kredensial.", "err", "Input kurang");
      return;
    }

    const btn = $("#btn-audit");
    const stopBtn = $("#btn-stop");
    const term = $("#terminal");
    const body = $("#terminal-body");
    body.innerHTML = "";
    term.hidden = false;

    // reset previous results
    $("#results").hidden = true;

    const appendLog = (cls, text) => {
      body.appendChild(el("div", { class: `log-line ${cls}` }, text));
      body.scrollTop = body.scrollHeight;
    };
    appendLog("log-info", `Menghubungkan ke ${user}@${host}:${port} …`);

    const controller = new AbortController();
    state.sshAbort = controller;
    stopBtn.hidden = false;

    let fullOutput = "";

    try {
      await withButton(btn, "Mengaudit…", async () => {
        const res = await fetch("/api/assess/ssh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenarioId, host, port, user,
            auth: { type: authType, password, key },
            extraCommands: extraCommands.length ? extraCommands : undefined,
          }),
          signal: controller.signal,
        });
        if (!res.ok) {
          let msg = "HTTP " + res.status;
          try { const e = await res.json(); if (e && e.error) msg = e.error; } catch {}
          throw new Error(msg);
        }

        await readSSE(res, handleSSE);

        function handleSSE(evt) {
          if (evt.event === "command") {
            appendLog("log-cmd", evt.command);
          } else if (evt.event === "output") {
            appendLog("log-out", evt.text);
            fullOutput += evt.text + "\n";
          } else if (evt.event === "error") {
            appendLog("log-err", "ERROR: " + evt.message);
          } else if (evt.event === "done") {
            appendLog("log-done", "Audit selesai. Memproses penilaian…");
            fullOutput = evt.output || fullOutput;
          }
        }
      });

      // After done, analyze + enable "Tanya AI"
      if (fullOutput.trim()) {
        state.sshContext = { host, output: fullOutput };
        const askBtn = $("#btn-ssh-ask");
        if (askBtn) askBtn.hidden = false;
        await analyzeAndRender(scenarioId, getAssessMode(), fullOutput, tutorialContext);
      } else {
        toast("Tidak ada output yang didapat dari router.", "err", "Kosong");
      }
    } catch (err) {
      if (err.name === "AbortError") {
        appendLog("log-info", "Dihentikan oleh pengguna.");
      } else {
        appendLog("log-err", "STREAM ERROR: " + err.message);
        toast("Koneksi stream gagal: " + err.message, "err", "Audit gagal");
      }
    } finally {
      stopBtn.hidden = true;
      state.sshAbort = null;
    }
  });

  $("#btn-stop").addEventListener("click", () => {
    if (state.sshAbort) state.sshAbort.abort();
  });

  $("#btn-ssh-ask").addEventListener("click", () => {
    openChat("ssh");
  });

  /* ---------- Paste output ---------- */
  $("#form-paste").addEventListener("submit", async (e) => {
    e.preventDefault();
    const { scenarioId, tutorialContext } = getAssessmentContext();
    const output = $("#paste-output").value.trim();
    if (!scenarioId && !tutorialContext) { toast("Pilih skenario atau jobsheet dulu.", "err", "Konteks kosong"); return; }
    if (!output) { toast("Tempel hasil output router dulu.", "err", "Output kosong"); return; }

    const btn = $("#btn-paste");
    await withButton(btn, "Menilai…", async () => {
      await analyzeAndRender(scenarioId, getAssessMode(), output, tutorialContext);
    });
  });

  function getAssessMode() {
    return $('input[name="assess-mode"]:checked').value;
  }

  function getAssessmentContext() {
    const sel = $("#assess-scenario");
    const kind = sel.selectedOptions[0] && sel.selectedOptions[0].dataset.kind;
    let scenarioId = state.activeScenarioId || sel.value || $("#assess-scenario-id").value.trim();
    const tutorialContext = state.activeTutorial || null;
    if (kind === "tutorial") scenarioId = "";
    return { scenarioId, tutorialContext };
  }

  /* ---------- Analyze + render results ---------- */
  async function analyzeAndRender(scenarioId, mode, output, tutorialContext) {
    const results = $("#results");
    results.hidden = true;
    try {
      const res = await fetch("/api/assess/paste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId, mode, output, tutorialContext: tutorialContext || undefined }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      renderResults(data);
    } catch (err) {
      toast("Gagal menganalisis hasil: " + err.message, "err", "Analisis gagal");
    }
  }

  function renderResults(data) {
    const box = $("#results");
    box.innerHTML = "";

    // summary banner
    box.appendChild(el("div", { class: "summary-banner" },
      el("h3", {}, "Ringkasan Penilaian"),
      el("p", {}, data.summary || "—")
    ));

    const issues = Array.isArray(data.issues) ? data.issues : [];
    if (issues.length === 0) {
      box.appendChild(el("div", { class: "issue-card" },
        el("p", { class: "hint-block" }, "Tidak ada masalah terdeteksi. Konfigurasi tampak sesuai requirement.")
      ));
    } else {
      box.appendChild(el("p", { class: "issues-head" }, `Ditemukan ${issues.length} catatan:`));
      issues.forEach((iss, i) => box.appendChild(renderIssueCard(iss, i)));
    }

    box.hidden = false;
    box.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderIssueCard(iss, idx) {
    const sevClass = iss.severity === "high" ? "high" : iss.severity === "medium" ? "med" : "low";
    const sevLabel = iss.severity === "high" ? "High" : iss.severity === "medium" ? "Medium" : "Low";

    const card = el("div", { class: `issue-card sev-${sevClass}` });
    card.appendChild(el("div", { class: "issue-top" },
      el("span", { class: "issue-area" }, iss.area || "Area"),
      el("span", { class: `sev-badge ${sevClass}` }, sevLabel)
    ));

    // L1 always shown
    card.appendChild(el("p", { class: "hint-block" },
      el("strong", {}, "Petunjuk (L1)"),
      iss.level1 || "—"
    ));

    const actions = el("div", { class: "issue-actions" });
    const l2Btn = el("button", { class: "btn btn--l2", type: "button" }, "Hint Lagi (L2)");
    const l3Btn = el("button", { class: "btn btn--l3", type: "button" }, "Kasih Tahu Jawaban (L3)");
    actions.appendChild(l2Btn);
    actions.appendChild(l3Btn);
    card.appendChild(actions);

    // L2 container
    const l2Box = el("div", {}, null);
    l2Box.hidden = true;
    card.appendChild(l2Box);

    // L3 container
    const l3Box = el("div", {}, null);
    l3Box.hidden = true;
    card.appendChild(l3Box);

    l2Btn.addEventListener("click", () => {
      l2Box.innerHTML = "";
      l2Box.appendChild(el("p", { class: "hint-block" },
        el("strong", {}, "Petunjuk lebih dalam (L2)"),
        iss.level2 || "—"
      ));
      l2Box.hidden = false;
      l2Btn.disabled = true;
    });

    l3Btn.addEventListener("click", () => {
      l3Box.innerHTML = "";

      l3Box.appendChild(el("div", { class: "warn-note" },
        el("span", { html: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2v-4h2v4Z"/></svg>' }),
        el("span", {}, "Command ini hanya saran — jalankan sendiri di router, audit read-only tidak mengubah apapun.")
      ));

      l3Box.appendChild(el("p", { class: "hint-block" },
        el("strong", {}, "Jawaban (L3)"),
        iss.level3 || "—"
      ));

      // fix commands code block
      const code = el("div", { class: "code-block" },
        el("div", { class: "code-block__bar" }, "saran perintah"),
        el("pre", {}, el("code", {}, iss.fixCommands || "")),
        el("button", {
          class: "copy-btn", type: "button",
          onclick: (ev) => copyText(iss.fixCommands || "", ev.currentTarget),
        }, "Salin")
      );
      l3Box.appendChild(code);

      // concept
      if (iss.concept) {
        l3Box.appendChild(el("div", { class: "concept" },
          el("strong", {}, "Konsep: "),
          iss.concept
        ));
      }

      l3Box.hidden = false;
      l3Btn.disabled = true;
      l2Btn.disabled = true;
    });

    return card;
  }

  /* =========================================================
     VIEW 4 — Tutorial / Latihan
     ========================================================= */
  async function loadTutorialSources() {
    await populateSelect(
      $("#tut-source"),
      "/api/tutorial-sources",
      "Bebas (ai pilih)",
      (x) => ({ value: x.name, text: x.name }),
      "Sumber"
    );
  }

  function modeLabel(m) {
    return m === "gui" ? "GUI Winbox" : m === "cli" ? "CLI" : "Keduanya";
  }

  $("#form-tutorial").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = $("#btn-tutorial");
    const level = $("#tut-level").value;
    const topic = $("#tut-topic").value.trim();   // "" => bebas
    const mode = $('input[name="tut-mode"]:checked').value;
    const source = $("#tut-source").value; // "" => none

    try {
      await withButton(btn, "Membuat…", async () => {
        const res = await fetch("/api/tutorials/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ level, topic, mode, source }),
        });
        let data = {};
        try { data = await res.json(); } catch (_) {}
        if (!res.ok) throw new Error(data.error || ("HTTP " + res.status));

        const existing = state.tutorials.find((t) => t.id === data.id);
        if (!existing) state.tutorials.push(data);
        else Object.assign(existing, data);

        renderTutorialResult(data);
        toast("Tutorial berhasil dibuat.", "ok", "Selesai");
      });
    } catch (err) {
      toast("Generate gagal: " + (err.message || "cek koneksi/settings AI"), "err", "Generate gagal");
    }
  });

  function renderTutorialResult(d) {
    const box = $("#tutorial-result");
    box.innerHTML = "";

    // Header
    box.appendChild(renderResultHeader(d, true));

    // Pengantar
    if (d.pengantar) box.appendChild(sectionBlock("Pengantar", d.pengantar));

    // Tujuan
    if (Array.isArray(d.tujuan) && d.tujuan.length) {
      box.appendChild(el("div", { class: "section" },
        el("div", { class: "section__top" }, el("h4", { class: "section__title" }, "Tujuan")),
        el("ul", { class: "tut-list" }, ...d.tujuan.map((t) => el("li", {}, t)))
      ));
    }

    // Bagian / langkah
    if (Array.isArray(d.bagian)) {
      d.bagian.forEach((bg) => {
        const steps = Array.isArray(bg.steps) ? bg.steps : [];
        const ol = el("ol", { class: "tut-steps" });
        steps.forEach((st) => {
          const li = el("li", { class: "tut-step" });
          if (st.gui) {
            li.appendChild(el("span", { class: "step-gui-label" }, "Winbox GUI"));
            li.appendChild(el("p", { class: "step-text" }, st.gui));
          }
          if (st.cli) {
            li.appendChild(el("div", { class: "code-block" },
              el("div", { class: "code-block__bar" }, "perintah CLI"),
              el("pre", {}, el("code", {}, st.cli)),
              el("button", {
                class: "copy-btn", type: "button",
                onclick: (ev) => copyText(st.cli, ev.currentTarget),
              }, "Salin")
            ));
          }
          if (st.note) {
            li.appendChild(el("p", { class: "step-note" }, st.note));
          }
          ol.appendChild(li);
        });
        box.appendChild(el("div", { class: "section" },
          el("div", { class: "section__top" }, el("h4", { class: "section__title" }, bg.judul || "Bagian")),
          ol
        ));
      });
    }

    // Latihan
    if (Array.isArray(d.latihan) && d.latihan.length) {
      box.appendChild(el("div", { class: "section" },
        el("div", { class: "section__top" }, el("h4", { class: "section__title" }, "Latihan")),
        el("ol", { class: "tut-list tut-list--ol" }, ...d.latihan.map((t) => el("li", {}, t)))
      ));
    }

    // Catatan
    if (d.catatan) box.appendChild(sectionBlock("Catatan", d.catatan));

    // Jump to Nilai Konfigurasi
    box.appendChild(el("button", {
      class: "btn btn--primary open-assess-btn", type: "button",
      onclick: () => activateAndAssess({ id: d.id, tutorial: true }),
    }, "Latihan di Router → Nilai Hasil"));

    refreshScenarioOptions();
    box.hidden = false;
    box.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* =========================================================
     VIEW 3 — Settings
     ========================================================= */
  async function loadSettings() {
    const dot = $("#status-dot");
    const text = $("#status-text");
    try {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("HTTP " + res.status);
      const d = await res.json();
      state.settings = d;

      $("#set-base").value = d.baseURL || "https://api.openai.com/v1";
      $("#set-model").value = d.model || "gpt-4o-mini";

      const formEls = ["#set-base", "#set-key", "#set-model", "#btn-save-settings"];
      const setFormDisabled = (v) => formEls.forEach(sel => { const el = $(sel); if (el) el.disabled = v; });

      if (d.source === "env") {
        // env is a fallback; the panel below can override it
        setFormDisabled(false);
        dot.className = "status-dot ok";
        text.textContent = d.configured
          ? "Dikonfigurasi via environment — bisa di-override lewat panel ini."
          : "Environment belum lengkap — isi panel di bawah untuk mengaktifkan.";
        $("#set-key-hint").textContent = d.configured
          ? "Kosongkan key untuk memakai key dari environment."
          : "Masukkan API key untuk mengaktifkan fitur AI.";
      } else {
        setFormDisabled(false);
        // apiKey NEVER returned — leave blank, hint that it's stored
        if (d.configured) {
          dot.className = "status-dot ok";
          text.textContent = "Sudah terkonfigurasi (kunci tersimpan di server, kedaluwarsa 30 mnt).";
          $("#set-key-hint").textContent = "Kosongkan jika tidak ingin mengubah kunci yang tersimpan.";
        } else {
          dot.className = "status-dot no";
          text.textContent = "Belum terkonfigurasi.";
          $("#set-key-hint").textContent = "Masukkan API key untuk mengaktifkan fitur AI.";
        }
      }
    } catch (e) {
      dot.className = "status-dot no";
      text.textContent = "Tidak bisa memuat status settings.";
    }
  }

  $("#form-settings").addEventListener("submit", async (e) => {
    e.preventDefault();
    const baseURL = $("#set-base").value.trim();
    const apiKey = $("#set-key").value;            // may be empty (don't overwrite)
    const model = $("#set-model").value.trim();

    if (!baseURL || !model) { toast("Base URL dan Model wajib diisi.", "err", "Input kurang"); return; }

    const btn = $("#btn-save-settings");
    try {
      await withButton(btn, "Menyimpan…", async () => {
        const body = { baseURL, model };
        if (apiKey) body.apiKey = apiKey;   // only send if provided
        const res = await fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const d = await res.json();
        if (d.ok) {
          toast("Settings disimpan.", "ok", "Tersimpan");
          $("#set-key").value = "";
          await loadSettings();
        } else {
          throw new Error("respon tidak ok");
        }
      });
    } catch (err) {
      toast("Gagal menyimpan settings: " + err.message, "err", "Save gagal");
    }
  });

  /* =========================================================
     Asisten AI — floating chat widget (all views)
     ========================================================= */
  function getActiveView() {
    const t = document.querySelector(".nav__tab.is-active");
    return t ? t.dataset.view : (state.currentView || "buat");
  }

  function renderChatMsg(m) {
    const cls = m.role === "user"
      ? "msg msg--user"
      : (m.error ? "msg msg--error" : "msg msg--assistant");
    const node = el("div", { class: cls },
      el("div", { class: "msg__role" }, m.role === "user" ? "Kamu" : (m.error ? "Error" : "Asisten")),
      el("div", { class: "msg__text" }, m.content || "")
    );
    return node;
  }

  function renderChatHistory() {
    const box = $("#chat-messages");
    box.innerHTML = "";
    state.chat.forEach((m) => box.appendChild(renderChatMsg(m)));
    box.scrollTop = box.scrollHeight;
  }

  function openChat(seed) {
    if (state.chatOpen) return;
    state.chatOpen = true;
    $("#chat").hidden = false;
    $("#chat-bubble").hidden = true;
    if (state.chat.length === 0) {
      let greeting;
      if (seed === "ssh" && state.sshContext && state.sshContext.output) {
        greeting = `Saya melihat hasil audit SSH langsung dari ${state.sshContext.host || "router"}. Tanya apa saja tentang state router ini — mis. "kenapa Queue Tree VoIP drop?" atau "bagaimana cara fix agar sesuai skenario?"`;
      } else {
        greeting = "Halo! Saya asisten AI untuk latihan MikroTik kamu. Tanya apa saja tentang soal, tutorial, atau konfigurasi router — saya tahu konteks yang sedang kamu buka.";
      }
      state.chat.push({ role: "assistant", content: greeting });
      renderChatHistory();
    }
    setTimeout(() => $("#chat-text").focus(), 60);
  }

  function closeChat() {
    state.chatOpen = false;
    $("#chat").hidden = true;
    $("#chat-bubble").hidden = false;
  }

  async function sendChat() {
    const input = $("#chat-text");
    const text = input.value.trim();
    if (!text || state.chatBusy) return;

    state.chat.push({ role: "user", content: text });
    input.value = "";
    autoGrow(input);
    renderChatHistory();

    const box = $("#chat-messages");
    const typing = el("div", { class: "typing" }, el("span"), el("span"), el("span"));
    box.appendChild(typing);
    box.scrollTop = box.scrollHeight;

    state.chatBusy = true;
    $("#chat-send").disabled = true;

    const payload = {
      messages: state.chat.map((m) => ({ role: m.role, content: m.content })),
      context: {
        view: getActiveView(),
        scenario: state.currentScenario || null,
        tutorial: (state.tutorials && state.tutorials.length)
          ? state.tutorials[state.tutorials.length - 1]
          : null,
        ssh: state.sshContext || null,
      },
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      let data = {};
      try { data = await res.json(); } catch (_) { /* ignore parse */ }
      typing.remove();

      if (!res.ok || data.error) {
        const msg = data.error || ("HTTP " + res.status);
        state.chat.push({ role: "assistant", content: msg, error: true });
      } else {
        state.chat.push({ role: "assistant", content: data.reply || "(tidak ada balasan)" });
      }
      renderChatHistory();
    } catch (err) {
      typing.remove();
      state.chat.push({ role: "assistant", content: "Gagal terhubung ke asisten: " + err.message, error: true });
      renderChatHistory();
    } finally {
      state.chatBusy = false;
      $("#chat-send").disabled = false;
    }
  }

  function autoGrow(ta) {
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }

  $("#chat-bubble").addEventListener("click", openChat);
  $("#chat-close").addEventListener("click", closeChat);
  $("#chat-form").addEventListener("submit", (e) => { e.preventDefault(); sendChat(); });
  $("#chat-text").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); }
  });
  $("#chat-text").addEventListener("input", (e) => autoGrow(e.target));

  /* =========================================================
     Boot
     ========================================================= */
  async function init() {
    await loadScenarioList();
    await Promise.allSettled([loadTemplates(), loadSettings(), loadTutorialSources()]);
  }

  async function loadScenarioList() {
    try {
      const res = await fetch("/api/scenarios");
      if (res.ok) {
        const list = await res.json();
        list.forEach((m) => {
          if (!state.scenarios.find((s) => s.id === m.id)) state.scenarios.push(m);
        });
      }
    } catch (_) { /* list unavailable — dropdown stays empty until a scenario is generated */ }
    refreshScenarioOptions();
  }

  init();
})();
