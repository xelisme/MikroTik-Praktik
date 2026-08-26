---
name: MikroTik Praktik — Guru & Juri AI
description: Student-first MikroTik practice lab with a read-only AI juri that grades real router configs safely, styled in a friendly Ruangguru-inspired learning surface.
colors:
  primary: "#f26d0f"
  primary-tint: "#fdeee2"
  secondary: "#007bff"
  secondary-700: "#1480d8"
  secondary-tint: "#e0eefa"
  bg: "#f5f8fc"
  surface: "#ffffff"
  surface-2: "#eef4fb"
  ink: "#0a2540"
  ink-soft: "#46566b"
  ink-faint: "#8a98a8"
  line: "#e6eaf0"
  line-strong: "#d5dce5"
  sev-low: "#1fa971"
  sev-med: "#e08a0b"
  sev-high: "#e23b3b"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.9rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.5px"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.4rem"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.76rem"
    fontWeight: 600
    letterSpacing: "0.6px"
    textTransform: "uppercase"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.82rem"
rounded:
  sm: "10px"
  md: "12px"
  pill: "100px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#fafbfc"
    rounded: "100px"
    padding: "12px 26px"
  button-primary-hover:
    backgroundColor: "#d85f0c"
  button-secondary:
    backgroundColor: "{colors.secondary-tint}"
    textColor: "{colors.secondary-700}"
    rounded: "35px"
    padding: "11px 22px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "24px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "200px"
    padding: "11px 18px"
  tag:
    backgroundColor: "{colors.primary-tint}"
    textColor: "{colors.primary}"
    rounded: "999px"
    padding: "4px 11px"
  nav-tab:
    backgroundColor: "transparent"
    textColor: "#5b6b7d"
    rounded: "999px"
    padding: "9px 16px"
  chat-bubble:
    backgroundColor: "{colors.primary}"
    textColor: "#fafbfc"
    rounded: "999px"
    size: "56px"
---

# Design System: MikroTik Praktik — Guru & Juri AI

## Overview

**Creative North Star: "The Friendly Belajar Bench" (Ruangguru-inspired)**

A welcoming, high-energy learning surface where students practice real MikroTik configs with a calm safety net. The interface borrows the friendly, student-first language of Indonesia's favorite belajar platform: vibrant orange as the action color, a confident blue as the learning companion, white/very-light surfaces, Inter throughout, and pill-shaped, rounded components that feel approachable rather than technical. The product's read-only promise stays visible (a clear "READ-ONLY" banner on every assessment), but the mood is encouraging and energetic — learning should feel inviting, not clinical.

The system is student-first: big friendly CTAs ("Buat Soal", "Generate Tutorial", "Nilai Sekarang"), rounded card-based content, and the AI assistant (chat, hints) signalled with the orange accent so help is always one tap away. Motion is lively but smooth — short lifts and fades that make the app feel responsive and alive.

**Key Characteristics:**
- Vibrant orange (#f26d0f) primary on white/light-blue surfaces; blue (#007bff) as the learning companion.
- Friendly & high-energy: Inter, pill buttons (100px), rounded 12px cards, soft shadows.
- Student-first copy in Bahasa Indonesia; big welcoming CTAs.
- Severity is the only place color gets loud — on the left border of an issue card.

## Colors

The palette is a friendly belajar surface: vibrant orange for action, blue for the learning companion and links, light surfaces for airy readability, and a quiet neutral ramp for text. Severity colors are reserved for assessment feedback.

### Primary
- **Ruangguru Orange** (#f26d0f): primary buttons, active nav, tags, focus rings, chat bubble. The action color.
- **Orange Deep** (#d85f0c): hover/active state on primary buttons.
- **Orange Mist** (#fdeee2): orange-tinted backgrounds for tags and selected pills.

### Secondary
- **Learning Blue** (#007bff): links, headings emphasis, secondary accents.
- **Interactive Blue** (#1480d8): hover/active on blue elements, secondary button text/border.
- **Blue Mist** (#e0eefa): blue-tinted fills for secondary buttons and selected states.

### Neutral
- **Light Field** (#f5f8fc): page background base, often with a soft white→light-blue gradient.
- **Pure Surface** (#ffffff): cards and inputs.
- **Surface Tint** (#eef4fb): recessed fields, section blocks, chat message area.
- **Ink** (#0a2540): primary text (dark navy, not pure black — friendly).
- **Ink Muted** (#46566b): secondary text, descriptions, labels.
- **Ink Faint** (#8a98a8): hints, placeholders, disabled text.
- **Hairline** (#e6eaf0) / **Hairline Strong** (#d5dce5): borders and dividers.

### Severity (assessment only)
- **Pass Green** (#1fa971): low-severity issues and success states.
- **Caution Amber** (#e08a0b): medium-severity issues.
- **Alert Red** (#e23b3b): high-severity issues and errors.

### Named Rules
**The Orange Action Rule.** Orange (#f26d0f) is the only chromatic action color — it marks every primary CTA, active tab, and the AI assistant. Blue is the learning companion (links, secondary), not the primary action.

**The Severity-Only Loud Rule.** Full-saturation red/amber/green appear only on issue cards and badges. Everywhere else stays in the orange/blue/neutral friendly field.

## Typography

**Font:** Inter (with system-ui fallback) for everything — display, body, labels. **Mono:** JetBrains Mono for terminal logs, CLI commands, code.

**Character:** A friendly, modern belajar handout. Inter's rounded humanist forms keep the tone warm and approachable; JetBrains Mono makes the router's voice (commands, output) feel authentic. No serif, no technical display face — the goal is welcoming clarity.

### Hierarchy
- **Display** (700, 1.9rem, line-height 1.1, -0.5px): view titles and scenario headings.
- **Title** (700, 1.4rem): scenario/tutorial section headings and chat name.
- **Body** (400, 0.95rem, line-height 1.5): all instructional copy; max line length ~60–75ch.
- **Label** (600, 0.76rem, uppercase, 0.6px tracking): section eyebrows, tags, severity badges, message roles.
- **Mono** (0.82rem): terminal output, CLI commands, code.

### Named Rules
**The One-Font Rule.** Inter carries the entire UI — display, body, and labels. Don't mix in a second display face; weight and size do the differentiation.

## Layout

A single centered column, max-width **1080px**, with **22px** side padding and **30px** vertical rhythm. Each view is a stack of rounded cards; the header is sticky and full-width with a soft bottom border. Content is single-column on mobile, with a two-column `.grid-2` for paired fields (e.g., host/port) collapsing to one column under 720px. Density is comfortable — a reading-and-doing tool that still feels spacious and friendly.

## Elevation & Depth

Soft and friendly. Depth comes from two low-opacity shadows (`--shadow`, `--shadow-sm`) plus tonal layering (white cards on a light field). The header and summary banners use a slightly stronger shadow to read as "fixed chrome." Elevation responds to state (hover lift on buttons/bubble, focus ring on inputs) rather than resting heavy.

### Shadow Vocabulary
- **Ambient Rest** (`0 6px 22px -12px rgba(10,37,64,.18)`): cards and panels at rest.
- **Ambient Tight** (`0 4px 14px -8px rgba(10,37,64,.16)`): issue cards and smaller blocks.
- **Focus Ring** (`0 0 0 3px rgba(242,109,15,.22)`): input/radio focus — orange, never blue.

### Named Rules
**The Soft-Float Rule.** Surfaces are flat at rest; a gentle shadow appears as a response to state (hover, elevation, focus). The page field itself carries no shadow.

## Shapes

Friendly and rounded. Cards use **12px** (`--radius`); controls, inputs, buttons use pills — inputs **200px** (full pill), primary buttons **100px** (pill), secondary buttons **35px**. Navigation tabs and tags are full pills (**999px**). The terminal and chat bubble are the only strongly rounded objects (terminal 10px; bubble 50%). Borders are 1px hairlines; the header carries a 2px soft bottom border as the one consistent "live edge."

## Components

### Buttons
- **Shape:** pill (primary 100px, secondary 35px).
- **Primary:** solid orange (#f26d0f), white text (#fafbfc), 12×26px padding, subtle shadow; hover deepens to #d85f0c and lifts.
- **Secondary:** blue-mist fill (#e0eefa), blue text (#1480d8), 1px blue border, 35px radius; hover brightens.
- **Disabled:** 0.6 opacity. Loading state dims the label.

### Chips / Tags
- **Style:** orange-mist background (#fdeee2), orange text (#f26d0f), 999px pill, 4×11px padding.
- **Mode variant:** blue-tinted pill for the mode tag. Used for level/topic/mode metadata on scenarios and tutorials.

### Cards / Containers
- **Corner:** 12px. **Background:** pure surface. **Border:** 1px hairline. **Shadow:** ambient rest. **Padding:** 24px.
- Section blocks inside cards use Surface Tint with a 10px radius to nest without competing.

### Inputs / Fields
- **Style:** white background, hairline-strong border, 200px pill radius, 11×18px padding.
- **Focus:** border shifts to orange, orange focus ring.
- **Select:** custom chevron via CSS gradients; no native appearance.
- **Error/Disabled:** inherited from global disabled; no dedicated error style beyond the read-only banner and issue cards.

### Navigation
- **Style:** sticky top header, white/light with a soft bottom border. Tabs are 999px pills, muted ink text; active tab gets an orange-tinted fill and orange text. Hover lightens. Mobile: tabs shrink, subtitle hides.

### Signature Components
- **Read-Only Banner:** orange/blue-tinted strip stating the audit is READ-ONLY — the product's safety promise, made visible on every assessment view.
- **Terminal:** dark console with mac-style dots, mono text, color-coded command/output/error lines. The "real router" voice.
- **Issue Card:** white card with a 4px left border in the severity color (green/amber/red), a severity badge, and L1→L2→L3 hint buttons (blue for L2, red-tint for L3). The assessment deliverable.
- **Chat (Asisten AI):** fixed orange bubble (56px) bottom-right; panel is a 384px card with a friendly header, message bubbles (orange-tint for user, white for assistant, red-tint for errors), and a bouncing typing indicator.

## Do's and Don'ts

### Do:
- **Do** keep orange (#f26d0f) as the only action/accent color; use blue for links/secondary only.
- **Do** reserve red/amber/green for issue cards and severity badges.
- **Do** use Inter for the entire UI; differentiate by weight/size, not a second face.
- **Do** keep surfaces soft at rest; let shadows answer to hover/focus only.
- **Do** write all UI copy in Bahasa Indonesia and use big friendly CTAs.

### Don't:
- **Don't** introduce a second chromatic accent (no purple, teal, pink) outside the severity ramp.
- **Don't** use sharp corners on buttons/inputs — they are pills; cards stay at 12px.
- **Don't** make the UI feel clinical or technical — keep it welcoming and high-energy.
- **Don't** let the chat bubble or terminal break the orange/blue/neutral discipline.
