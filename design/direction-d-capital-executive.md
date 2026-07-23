---
name: Executive Oversight
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45464d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fc'
  on-secondary-container: '#57657a'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#0d1c2d'
  on-tertiary-container: '#768599'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d5e3fc'
  secondary-fixed-dim: '#b9c7df'
  on-secondary-fixed: '#0d1c2e'
  on-secondary-fixed-variant: '#3a485b'
  tertiary-fixed: '#d4e4fa'
  tertiary-fixed-dim: '#b9c8de'
  on-tertiary-fixed: '#0d1c2d'
  on-tertiary-fixed-variant: '#39485a'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-lg:
    fontFamily: IBM Plex Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: IBM Plex Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: IBM Plex Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: IBM Plex Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  financial-data:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: IBM Plex Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 24px
  margin-page: 40px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style
The brand personality is authoritative, transparent, and unwavering. This design system is engineered for high-stakes decision-making within the construction finance sector, specifically targeting boards of directors who require immediate clarity on capital expenditure and project health.

The design style is **Corporate / Modern** with a lean toward **Minimalism**. It prioritizes information density and legibility over decorative elements. By utilizing high-contrast text and a rigid structural grid, the interface projects a sense of stability and institutional trust. All communication uses sentence case to maintain a professional yet accessible tone, avoiding the urgency of all-caps or the informality of title case.

## Colors
The palette is rooted in Slate and Deep Navy to evoke the materials of industry—steel and stone.

- **Primary (#0F172A):** Deep Navy. Used for core branding, primary navigation, and high-level headings.
- **Secondary (#475569):** Slate. Used for sub-headings, icons, and secondary actions.
- **Neutral (#F8FAFC):** Off-white. Used for the global background to reduce eye strain while maintaining high contrast.

Data status is never communicated by color alone. Instead, color is paired with textural patterns or specific iconography to ensure accessibility and clarity. Financial "danger" or "success" states use these base colors with varied saturation or stroke weights rather than shifting to a traffic-light system.

## Typography
This design system utilizes **IBM Plex Sans** for all prose and UI labels due to its industrial, systematic heritage. For all financial figures, account balances, and tabular data, **JetBrains Mono** is employed to ensure tabular numerals align perfectly in vertical columns, facilitating instant comparison of large figures.

**Constraints:**
- Use sentence case for all headings, buttons, and labels.
- Never use all-caps, even for small labels.
- Financial data must always use the `financial-data` role to ensure monospacing for digits.

## Layout & Spacing
The layout follows a **Fixed Grid** model on desktop to maintain a controlled, executive reading experience. A 12-column grid is used with a maximum container width of 1440px.

- **Generous Whitespace:** Spacing is intentional and expansive to allow for legibility at a distance during boardroom presentations.
- **Mobile/Tablet:** The 12-column grid collapses to 4 columns on mobile, with margins reduced to 16px.
- **Rhythm:** An 8px linear scale governs all padding and margins. Vertical stacking of cards and sections should prioritize the `stack-lg` (48px) unit to clearly separate distinct financial categories.

## Elevation & Depth
In alignment with the sober brand personality, this design system rejects heavy shadows and neon glows. Depth is communicated through **Low-contrast outlines** and subtle tonal layering.

- **Borders:** Elements are defined by 1px solid borders in `Slate-200`.
- **Surface Tiers:** The main background is the lightest neutral. Cards and containers use a pure white surface.
- **Interactivity:** Hover states are indicated by a subtle shift in background tint (e.g., from white to a very light slate) rather than an increase in shadow depth.
- **Data Patterns:** To distinguish between "built-up" and "lump-sum" figures, use background patterns (diagonal hatches for built-up, solid fills for lump-sum) within the containers themselves.

## Shapes
The shape language is **Soft (0.25rem)**. This provides just enough rounding to feel modern and professional without appearing playful or "bubbly."

- **Cards & Inputs:** 4px (0.25rem) corner radius.
- **Selection Indicators:** 2px corner radius for smaller elements like checkboxes.
- **Charts:** Bar charts and data visualizations should maintain sharp (0px) corners to preserve the accuracy of the data representation.

## Components

### Buttons & Inputs
Buttons use a solid primary fill for the most important action and a thin 1px border for secondary actions. All text within buttons must be sentence case. Input fields use a 1px slate border that thickens slightly on focus; they never use "glow" effects.

### Data Tables
Tables are the core of the dashboard. They must use `financial-data` typography for numerical columns. Use subtle zebra striping (every other row) with a light slate tint to guide the eye across wide rows.

### Cards
Cards are the primary container for data modules. They feature a 1px border and no shadow. The header of the card should be separated from the body by a horizontal rule to maintain a structural, architectural feel.

### Status Indicators
Do not rely on green/red dots. Use a combination of text labels (e.g., "on track", "at risk") and icons (e.g., a circle for built-up costs, a square for lump-sum). When indicating "built-up" status in a progress bar or chart, apply a diagonal hatch pattern.

### Checkboxes & Radios
Standard 1px slate stroke. The "checked" state uses the primary navy color with a clear white interior checkmark or dot to ensure high contrast.
