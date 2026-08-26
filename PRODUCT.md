# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: **Siswa (student)** — learners practicing MikroTik RouterOS configuration, in a lab/class setting or self-directed. They generate practice scenarios (soal) and jobsheet tutorials, configure a real or virtual router, and get assessed.
Secondary: **Guru (teacher/instructor)** — creates scenarios, reviews assessment output, and grades. The product is built student-first; teacher tooling is present but secondary.

## Product Purpose

A web app that helps students learn and practice MikroTik RouterOS by doing. It generates practice scenarios and jobsheet-style tutorials, then — its defining feature — assesses the student's actual router configuration through **read-only SSH** (or pasted `/export` output) with graded hints (L1→L2→L3) that teach rather than reveal. An embedded AI chat assistant explains concepts and the current context (scenario/tutorial) in Bahasa Indonesia.

## Positioning

**Read-only AI juri.** The meaningful, copy-resistant mechanism: the AI acts as a jury/grader over a *real* router configuration captured safely via read-only SSH — it never modifies the router, never runs destructive commands, and shows every command before running it. Students get authentic, risk-free assessment of real configs.

## Operating Context

- Students work on physical or virtual MikroTik routers (RouterOS) in labs or at home.
- Practice sources: AI-generated scenarios, AI-generated jobsheet tutorials (sourced from PDF jobsheets + the mikrotik-praktik-juri skill references), or pasted config output.
- Assessment modes: live read-only SSH audit, or paste of router output.
- AI is OpenAI-compatible (currently a local model); configured via a Settings page.
- Classroom language: Bahasa Indonesia.

## Capabilities and Constraints

Capabilities:
- Generate scenarios (soal) with server-side hidden success criteria.
- Generate tutorials/jobsheets (GUI + CLI steps) from PDF sources + skill references.
- Assess router config via read-only SSH or pasted output; graded L1→L2→L3 hints.
- Context-aware AI chat assistant tied to the current view/scenario/tutorial.

Binding constraints (must be preserved by future work):
- **Read-only SSH**: assessment must never modify the router — read-only commands only; destructive commands are rejected.
- **Bahasa Indonesia**: UI and copy stay in Indonesian.

Current implementation (not flagged as binding): local/offline LLM; no build step (plain HTML/CSS/JS + Node/Express server).

## Brand Commitments

- Name: **MikroTik Praktik — Guru & Juri AI**.
- Voice: friendly, educational Bahasa Indonesia; the AI is a patient tutor and a fair jury.
- No external brand assets, logos, or legal/proof materials confirmed.

## Evidence on Hand

- Skill references (domain truth): `/home/nyaw/.config/opencode/skills/mikrotik-praktik-juri/references/` (command-reference.md, bank-skenario.md, checklist-audit.md, checklist-gui-winbox.md).
- Jobsheet PDFs in `sources/`.
- The application source itself (server.js, src/*, public/*).
- No testimonials, case studies, press, or customer data. Do not fabricate any.

## Product Principles

1. **Safety first, always.** Assessment is read-only; the AI never alters the student's router.
2. **Learn by doing.** Real router configs, real feedback — not simulations.
3. **Guide, don't give.** Graded hints (L1→L2→L3) teach the student to find the answer.
4. **Indonesian-first.** Accessible to local students and teachers by default.

## Accessibility & Inclusion

Web app; should be usable by students with basic web access. No specific disability requirements established beyond standard web usability. Future work should meet WCAG AA where feasible.
