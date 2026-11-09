---
name: Obsidian Sentinel
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#d0bcff'
  on-secondary: '#3c0091'
  secondary-container: '#571bc1'
  on-secondary-container: '#c4abff'
  tertiary: '#4cd7f6'
  on-tertiary: '#003640'
  tertiary-container: '#009eb9'
  on-tertiary-container: '#002f38'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#acedff'
  tertiary-fixed-dim: '#4cd7f6'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 16px
  code-xs:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '400'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 0.75rem
  gutter-mobile: 0.5rem
  margin: 1rem
  margin-mobile: 0.75rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system targets Tier-3 Security Operations Center (SOC) analysts, incident responders, and threat hunters managing complex multi-vector attacks. The user experience balances absolute clarity under duress with the computational intelligence of an automated AI correlation engine. 

The aesthetic is precision-driven dark minimalism anchored by structured data density. It eliminates superfluous decoration, relying instead on high-contrast semantic signaling, optical layering through deep obsidian and navy surfaces, fine hairline borders, and tactical micro-glows to indicate state urgency and operational telemetry. Visual hierarchy directs immediate focus toward critical signals, dampening noise across dense metric displays and active investigation graphs.

## Colors

The palette establishes an ultra-deep foundation that minimizes eye strain across multi-monitor control centers during prolonged operational cycles. Surface levels rise through deliberate charcoal, slate, and navy tiers:

- **Canvas & Base:** Canvas (#0A0E17), Primary Surface (#0F172A), Elevated Container/Card (#1E293B), Structural Layer (#334155).
- **AI Co-Pilot & Automation:** Primary Core (#6366F1) and Secondary Engine (#8B5CF6), dedicated strictly to autonomous correlation, copilot telemetry, neural summaries, and generative query inputs.
- **Threat & Alert Spectrum:**
  - **Critical:** #EF4444 (Base), #F43F5E (Pulsing highlight).
  - **High:** #F59E0B.
  - **Medium / Informational Threat:** #06B6D4.
  - **Low / Nominal:** #10B981.
- **Text & Foreground:** Bright White (#F8FAFC) for critical metrics and headers, Muted Slate (#94A3B8) for secondary telemetry, Dimmed Subtext (#64748B) for labels, and Hairline Alpha Borders (`rgba(148, 163, 184, 0.12)`).

## Typography

The type architecture separates qualitative narratives from quantitative data points:

- **Inter** handles dashboard titles, incident summaries, analyst notes, and executive briefs. Its neutral, systematic geometry delivers immediate readability without distracting personality.
- **JetBrains Mono** governs the functional core of SOC operations: IP addresses, CVE IDs, raw SIEM/EDR log payloads, memory hex addresses, micro-timestamps (UTC), and payload decoders.
- Use tabular figures (`font-variant-numeric: tabular-nums`) across all numerical telemetry, event velocity charts, and latency metrics to avoid layout jitter during live streaming feeds.

## Layout & Spacing

To maximize operational visibility, the system enforces a compact, fluid 12-column grid designed for dense information packing without visual collision.

- **Desktop (1440px+):** Fluid 12-column layout with 0.75rem (12px) gutters and 1rem (16px) canvas margin. Standard layouts feature a persistent vertical icon-rail (56px width), a secondary contextual tree or threat-filtering pane (280px width), a primary analytical correlation workspace (spanning 7-8 columns), and an expandable right-side AI Co-Pilot / triage inspector (spanning 4-5 columns).
- **Tablet / Responsive Displays (768px - 1439px):** Inspector transforms into an overlaid drawer. Gutters hold at 0.75rem. Panels collapse to stacked tabs.
- **Mobile Handheld (Field Triage):** Grid collapses to a 4-column flow with 0.5rem gutters and 0.75rem margins. Telemetry cards convert from multi-column metrics to concise vertical summary badges.
- **Internal Density:** Component internals strictly utilize compact scales: `space-xs` (4px) and `space-sm` (8px) for tightly grouped telemetry; `space-md` (12px) for card body padding.

## Elevation & Depth

Visual separation relies on sharp tonal planes and hairline micro-borders rather than diffuse lighting:

- **Layer 0 (Canvas):** Pure dark background (`#0A0E17`).
- **Layer 1 (Card/Container Surfaces):** Deep navy (`#0F172A`) structured with 1px borders of `rgba(148, 163, 184, 0.08)`.
- **Layer 2 (Hover/Active/Dropdowns):** Elevated slate (`#1E293B`) framed by `rgba(148, 163, 184, 0.16)`.
- **Layer 3 (Modals/Flyouts):** Slate-Navy (`#1E293B`) overlaid with backdrop filter blur (12px) and a subtle drop shadow (`0 12px 32px -4px rgba(0, 0, 0, 0.65)`).
- **Tactical Rings & Luminescence:** Critical alerts and active AI triage steps utilize focused status halos (`box-shadow: 0 0 12px -2px var(--status-color)` at 30% alpha), providing peripheral awareness across complex multi-panel views without breaking layout geometry.

## Shapes

The design language uses tight, disciplined geometry with a roundedness factor of `1` (0.25rem / 4px base radius):

- **Data Cells, Inputs, Buttons, & Tags:** Configured with a 4px corner radius (`rounded-sm`), delivering a sharp, mechanical aesthetic that aligns with technical terminal and hardware interfaces.
- **Cards, Panels, & Viewports:** Styled with 8px radius (`rounded-lg`), softening the macro bounding boxes while keeping inner items structurally rigid.
- **Pills / Status Dots:** Strict circular radii (`rounded-full`) reserved purely for telemetry status indicators, node-graph anchors, and live session avatars.

## Components

- **Buttons:**
  - *Primary (AI Execution):* Solid background of `#6366F1` with white text, crisp 4px corners, and a 1px inner border (`rgba(255, 255, 255, 0.15)`). Hover elevates with a subtle violet-indigo glow.
  - *Secondary / Utility:* Slate fill (`#1E293B`), text `#94A3B8`, framed with `rgba(148, 163, 184, 0.16)`. Hover changes text to `#F8FAFC` and border to `#6366F1`.
  - *Destructive / Containment:* Dark crimson background (`rgba(239, 68, 68, 0.12)`), text `#EF4444`, 1px border `#EF4444`. Hover brightens fill to 25% opacity.
- **Chips & Threat Badges:**
  - Compact height (20px), text in `label-sm` (JetBrains Mono).
  - Structured with a tinted background (10% opacity) and matching solid 1px border according to threat severity (Red, Amber, Cyan, Emerald).
  - Critical chips include a pulsing 6px radial dot at the leading edge.
- **Cards & Telemetry Containers:**
  - Background `#0F172A`, 1px hairline border `rgba(148, 163, 184, 0.08)`.
  - Header zones separated by a 1px border divider with integrated contextual action bars (time-window selectors, export toggles, full-screen expansion).
- **Data Tables & Log Lists:**
  - Alternating row banding using `#0F172A` and `#131D31`. Row height locked to 32px for high-density scanning.
  - Monospaced timestamp, source/destination IP, and event ID columns. Single-click opens an inline JSON drawer without breaking the page layout.
- **Input Fields & Query Bars:**
  - Inset fill `#0A0E17`, 1px border `rgba(148, 163, 184, 0.2)`. Text typed in `JetBrains Mono`.
  - Focus state shifts the border to `#8B5CF6` (AI query mode) or `#6366F1` (standard KQL/SQL) with a 2px outer micro-ring.
- **Checkboxes & Radios:**
  - Angular 4px squares/circles with `#0A0E17` fill and `#334155` border. Checked states feature solid `#6366F1` with crisp white check/dot glyphs.
- **Specialized SOC Component: AI Threat Correlation Graph Node:**
  - Hexagonal or 4px-curved node blocks with glowing contextual status halos indicating anomaly scoring, interconnected by vector path lines rendered in `#334155` (idle) or glowing `#8B5CF6` (active attack pathway).