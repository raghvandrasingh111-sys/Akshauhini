# Design System: MediKiosk Clinical Intake Platform
**Project ID:** SIH26047 · Ministry of Ayush (AIIA)

## 1. Visual Theme & Atmosphere

MediKiosk embodies a **Calm Clinical Trust** aesthetic — airy, accessible, and purpose-built for high-throughput Indian public hospital OPDs. The interface prioritizes large touch targets, bilingual readability (Devanagari + Latin), and immediate visual hierarchy for emergency states. The mood is **reassuring yet authoritative**: patients feel guided, not interrogated; physicians receive dense clinical data in a scannable, professional layout.

Density is intentionally **moderate** — generous whitespace on kiosk screens reduces anxiety for elderly and low-literacy users, while the physician dashboard adopts a **utilitarian information-dense** layout appropriate for clinical workstations.

## 2. Color Palette & Roles

| Descriptive Name | Hex | Functional Role |
|---|---|---|
| Healing Teal (Primary) | `#0D9488` | Primary CTAs, progress bars, brand identity, trust signals |
| Deep Teal (Primary Dark) | `#0F766E` | Hover states, active navigation |
| Clinical Sky Blue (Secondary) | `#0284C7` | Links, demo prompts, secondary actions |
| Vital Green (Accent) | `#059669` | Success states, verification badges, completion |
| Emergency Crimson | `#DC2626` | Red-flag alerts, critical triage, severity ≥7 pain scale |
| Emergency Blush | `#FEE2E2` | Emergency alert backgrounds, abnormal lab highlights |
| Mint Surface | `#F0FDFA` | Page gradients, selected touch options, kiosk card accents |
| Slate Muted | `#64748B` | Secondary text, metadata, timestamps |
| Cloud Border | `#E2E8F0` | Card borders, input strokes, dividers |
| Ayurvedic Amber (AYUSH) | `#D97706` | AYUSH mode accents, Dashavidha sections |
| Warm Parchment (AYUSH Surface) | `#FFFBEB` | AYUSH profile containers |

## 3. Typography Rules

- **Primary Font:** Inter — clean, highly legible at kiosk viewing distances
- **Indic Script:** Noto Sans Devanagari — paired for Hindi/regional language UI
- **Headers:** Bold (700), 2xl–4xl on kiosk; xl on physician dashboard
- **Body:** Regular (400) at lg (18px) on kiosk inputs for touch accessibility
- **Labels:** Semibold uppercase tracking-wider at xs for clinical section headers (CC, HPI, ROS)
- **Letter-spacing:** Slightly expanded on uppercase clinical labels for scanability

## 4. Component Stylings

* **Buttons (Kiosk):** Pill-adjacent generously rounded corners (`rounded-2xl`), minimum 56px height for touch. Primary fills use Healing Teal with soft teal shadow (`shadow-kiosk`). Secondary uses white fill with 2px teal border.
* **Touch Options:** Large card-style selectors with 120px minimum height, 2px border transitioning to teal on hover/selection. Selected state adds ring glow.
* **Cards/Containers:** White background, `rounded-3xl`, whisper-soft shadow (`shadow-card`), 1px Cloud Border stroke. Kiosk cards use generous padding (p-6 to p-8).
* **Inputs/Forms:** 2px border, `rounded-xl`, 18px text, focus ring via border color change to Healing Teal. No harsh box-shadows.
* **Emergency Alerts:** Full-screen modal overlay with 4px Emergency Crimson border, pulsing icon, auto-dismiss after 8 seconds with persistent sidebar badge.
* **Progress Bar:** 8px height, rounded-full, teal fill on slate-200 track.

## 5. Layout Principles

- **Kiosk:** Single-column centered layout, max-width 768px (3xl), vertical flow with bottom-fixed dual-mode navigation (Patient Kiosk ↔ Physician EMR)
- **Physician Dashboard:** Two-panel split — 320px patient queue sidebar + fluid main content area
- **Whitespace:** 24–32px vertical rhythm between sections on kiosk; 16px grid gaps on form elements
- **Responsive:** Grid collapses from 3-column document scan to single column on mobile; physician dashboard sidebar remains fixed
- **Accessibility:** Touch targets ≥48px, high contrast emergency states, audio TTS fallback for consent and confirmation

## 6. Stitch Integration Notes

When Google Stitch MCP is connected, use this DESIGN.md as the source of truth for generating additional screens:
- Triage staff notification panel
- ABHA QR scanner overlay
- Waiting area token display
- Admin analytics dashboard

Prompt pattern: *"Generate a [screen name] for MediKiosk following DESIGN.md — Healing Teal primary, large touch targets, bilingual Hindi/English labels, clinical trust aesthetic."*
