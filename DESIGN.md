---
name: MikroTik Praktik — Guru & Juri AI
description: Student-first MikroTik practice lab with a read-only AI juri that grades real router configs safely.
colors:
  primary: "#0a3a5c"
  primary-deep: "#072a43"
  primary-bright: "#11567f"
  teal: "#0d9488"
  teal-soft: "#14b8a6"
  teal-tint: "#e2f5f2"
  bg: "#eef3f7"
  surface: "#ffffff"
  surface-2: "#f6f9fb"
  ink: "#0c2233"
  ink-soft: "#41566a"
  ink-faint: "#7a8ea0"
  line: "#dbe5ec"
  line-strong: "#c4d4df"
  sev-low: "#2f9e6e"
  sev-med: "#d98a16"
  sev-high: "#cf3b3b"
typography:
  display:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "1.9rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.5px"
  title:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "1.4rem"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "IBM Plex Sans, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontSize: "0.76rem"
    fontWeight: 600
    letterSpacing: "0.6px"
    textTransform: "uppercase"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.82rem"
rounded:
  sm: "9px"
  md: "14px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.teal}"
    textColor: "#042b27"
    rounded: "{rounded.sm}"
    padding: "11px 22px"
  button-primary-hover:
    backgroundColor: "{colors.teal-soft}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.sm}"
    padding: "11px 22px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "24px"
  input:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "11px 13px"
  tag:
    backgroundColor: "{colors.teal-tint}"
    textColor: "{colors.primary}"
    rounded: "999px"
    padding: "4px 11px"
  nav-tab:
    backgroundColor: "transparent"
    textColor: "#cfe2ec"
    rounded: "999px"
    padding: "9px 16px"
  chat-bubble:
    backgroundColor: "{colors.teal}"
    textColor: "#042b27"
    rounded: "999px"
    size: "56px"
---

# Design System: MikroTik Praktik — Guru & Juri AI

## Overview

**Creative North Star: "The Safe Lab Bench"**

A calm, precise workspace where students tinker with real MikroTik routers without fear. The interface behaves like a well-kept lab bench: everything has its place, nothing shouts, and the one accent — a steady teal — marks the safe, guided path. Deep harbor-blue grounds the chrome (header, chat header, summary banners) while light cool surfaces keep the working area airy and readable. The product's promise is safety, so the visuals never feel alarming or gamified; they feel trustworthy and deliberate.

The system is student-first: primary reading surfaces (scenario, tutorial, assessment) are quiet and content-dense, while the AI's presence (chat, hints, read-only banner) is signalled with the teal accent so help is always one glance away. Motion is gentle and purposeful — short fades and lifts that confirm state without distracting from the task of learning.

**Key Characteristics:**
- Deep harbor-blue chrome on light, cool surfaces; teal as the single guiding accent.
- Calm & precise: soft, low-contrast shadows; restrained, professional components.
- Pill language (999px) for navigation and tags; 14px cards, 9px controls.
- Severity is the only place color gets loud — and only on the left border of an issue card.

## Colors

The palette is a calm lab: deep blues for structure, a single teal accent for guidance and action, and a quiet neutral ramp for text and surfaces. Severity colors are reserved exclusively for assessment feedback.

### Primary
- **Deep Harbor Blue** (#0a3a5c): header, chat header, summary banners, view titles, and primary text anchors. The structural color of the app.
- **Harbor Blue Deep** (#072a43): gradient terminus for headers/banners; adds depth without a second hue.
- **Harbor Blue Bright** (#11567f): hover/active states on ghost buttons and links; the "interactive blue."

### Secondary
- **Lab Teal** (#0d9488): the single accent. Primary buttons, active nav, tags, focus rings, and the chat bubble. It means "safe guidance."
- **Teal Glow** (#14b8a6): teal hover and gradient top-stop; gives buttons a gentle lift.
- **Teal Mist** (#e2f5f2): teal-tinted backgrounds for tags and selected pills.

### Neutral
- **Cool Mist** (#eef3f7): page background base, layered with faint radial blue/teal glows.
- **Pure Surface** (#ffffff): cards and inputs on the light field.
- **Surface Tint** (#f6f9fb): recessed fields, section blocks, and the chat message area.
- **Ink Slate** (#0c2233): primary text.
- **Ink Muted** (#41566a): secondary text, descriptions, labels.
- **Ink Faint** (#7a8ea0): hints, placeholders, disabled text.
- **Hairline** (#dbe5ec) / **Hairline Strong** (#c4d4df): borders and dividers.

### Severity (assessment only)
- **Pass Green** (#2f9e6e): low-severity issues and success states.
- **Caution Amber** (#d98a16): medium-severity issues.
- **Alert Red** (#cf3b3b): high-severity issues and errors.

### Named Rules
**The One Accent Rule.** Teal is the only chromatic action color and appears on ≤15% of any screen — its rarity is what makes "safe guidance" readable at a glance. Blue is structure, not action.

**The Severity-Only Loud Rule.** Full-saturation red/amber/green appear only on issue cards and badges. Everywhere else stays in the blue/teal/neutral calm.

## Typography

**Display Font:** Space Grotesk (with system-ui fallback) — geometric, confident, used for titles and the brand.
**Body Font:** IBM Plex Sans (with system-ui fallback) — humanist, highly readable for long Indonesian instructional text.
**Mono Font:** JetBrains Mono — terminal logs, CLI commands, and code blocks.

**Character:** A precise lab handout. Space Grotesk gives the chrome a modern, technical confidence; IBM Plex Sans keeps the learning content warm and legible; JetBrains Mono makes the router's voice (commands, output) feel authentic.

### Hierarchy
- **Display** (700, 1.9rem, line-height 1.1, -0.5px): view titles and scenario headings.
- **Title** (700, 1.4rem): scenario/tutorial section headings and chat name.
- **Body** (400, 0.95rem, line-height 1.5): all instructional copy; max line length ~60–75ch.
- **Label** (600, 0.76rem, uppercase, 0.6px tracking): section eyebrows, tags, severity badges, message roles.
- **Mono** (0.82rem): terminal output, CLI commands, code.

### Named Rules
**The Eyebrow Rule.** Section labels are uppercase Space Grotesk in teal (0.76rem) — they orient without adding weight. Body stays in IBM Plex Sans.

## Layout

A single centered column, max-width **1080px**, with **22px** side padding and **30px** vertical rhythm. Each view is a stack of cards; the header is sticky and full-width with a teal underline. Content is single-column on mobile, with a two-column `.grid-2` for paired fields (e.g., host/port) collapsing to one column under 720px. Density is comfortable, not compact — this is a reading-and-doing tool, not a dashboard.

## Elevation & Depth

Soft and restrained. Depth comes from two low-opacity shadows (`--shadow`, `--shadow-sm`) plus tonal layering (white cards on a cool mist field). The header and summary banners use a slightly stronger shadow to read as "fixed chrome." Nothing floats aggressively; elevation responds to state (hover lift on buttons/bubble, focus ring on inputs) rather than resting heavy.

### Shadow Vocabulary
- **Ambient Rest** (`0 1px 2px rgba(10,58,92,.05), 0 10px 30px -12px rgba(10,58,92,.18)`): cards and panels at rest.
- **Ambient Tight** (`0 1px 2px rgba(10,58,92,.06), 0 4px 14px -8px rgba(10,58,92,.20)`): issue cards and smaller blocks.
- **Focus Ring** (`0 0 0 3px rgba(13,148,136,.22)`): input/radio focus — teal, never blue.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest; shadows appear only as a response to state (hover, elevation, focus). The page field itself carries no shadow.

## Shapes

Rounded but not playful. Cards use **14px** (`--radius`); controls, inputs, buttons, and code blocks use **9px** (`--radius-sm`). Navigation tabs and tags are full pills (**999px**), reinforcing the "calm bench" softness. The terminal and chat bubble are the only strongly rounded objects (terminal 9px; bubble 50%). Borders are 1px hairlines; the header and chat header carry a 2px teal bottom border as the one consistent "live edge."

## Components

### Buttons
- **Shape:** 9px radius.
- **Primary:** teal→teal-soft gradient, deep-teal text (#042b27), 11×22px padding, soft teal shadow; hover brightens and lifts.
- **Ghost:** transparent with hairline-strong border, muted ink text; hover shifts border to harbor-blue-bright.
- **Disabled:** 0.6 opacity, `cursor: progress`. Loading state dims the label.

### Chips / Tags
- **Style:** teal-mist background, deep-blue text, 999px pill, 4×11px padding.
- **Mode variant:** blue-tinted pill for the mode tag. Used for level/topic/mode metadata on scenarios and tutorials.

### Cards / Containers
- **Corner:** 14px. **Background:** pure surface. **Border:** 1px hairline. **Shadow:** ambient rest. **Padding:** 24px.
- Section blocks inside cards use Surface Tint with a 9px radius to nest without competing.

### Inputs / Fields
- **Style:** Surface Tint background, hairline-strong border, 9px radius, 11×13px padding.
- **Focus:** border shifts to teal, background to white, teal focus ring.
- **Select:** custom chevron via CSS gradients; no native appearance.
- **Error/Disabled:** inherited from global disabled; no dedicated error style beyond the read-only banner and issue cards.

### Navigation
- **Style:** sticky top header, deep-blue gradient, teal 2px underline. Tabs are 999px pills, muted light text; active tab gets a teal-tinted fill and teal border. Hover lightens text. Mobile: tabs shrink, subtitle hides.

### Signature Components
- **Read-Only Banner:** blue-tinted strip with a teal/blue border stating the audit is READ-ONLY — the product's safety promise, made visible on every assessment view.
- **Terminal:** dark (#0b1f2e) console with mac-style dots, mono text, color-coded command/output/error lines. The "real router" voice.
- **Issue Card:** white card with a 4px left border in the severity color (green/amber/red), a severity badge, and L1→L2→L3 hint buttons (teal for L2, red-tint for L3). The assessment deliverable.
- **Chat (Asisten AI):** fixed teal bubble (56px) bottom-right; panel is a 384px card with deep-blue header, teal underline, message bubbles (teal for user, white for assistant, red-tint for errors), and a bouncing typing indicator.

## Do's and Don'ts

### Do:
- **Do** keep teal as the only action/accent color; use blue for structure only.
- **Do** reserve red/amber/green for issue cards and severity badges.
- **Do** use Space Grotesk for titles/labels and IBM Plex Sans for body; never swap.
- **Do** keep surfaces flat at rest; let shadows answer to hover/focus only.
- **Do** write all UI copy in Bahasa Indonesia.

### Don't:
- **Don't** introduce a second chromatic accent (no purple, orange, pink) outside the severity ramp.
- **Don't** use heavy drop shadows or neumorphism — the bench is calm, not sculpted.
- **Don't** make buttons or inputs sharper than 9px or cards sharper than 14px.
- **Don't** let the chat bubble or terminal break the blue/teal/neutral discipline.
