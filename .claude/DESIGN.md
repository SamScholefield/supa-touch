# Design System

Design tokens and component patterns used across the tournament app. All values are sourced from `public/styles.css` (lines 10-58) and inline styles in `public/score.html`.

---

## 1. Color Tokens

### Dark theme (default)

| Token | Value | Role |
|-------|-------|------|
| `--bg` | `#0c0c0c` | Page background |
| `--surface` | `#161616` | Card / panel background |
| `--surface2` | `#1f1f1f` | Hover / secondary surface |
| `--line` | `#2a2a2a` | Borders, dividers |
| `--line2` | `#333333` | Input borders, stronger dividers |
| `--text` | `#ffffff` | Primary text |
| `--muted` | `#a0a0a0` | Secondary text, placeholders |
| `--muted2` | `#b8b8b8` | Tertiary text (slightly brighter than muted) |
| `--accent` | `#ff8a6a` | Brand accent, links, active states |
| `--accent-lo` | `rgba(255, 138, 106, 0.14)` | Accent tint for badges / banners |
| `--cup` | `#f5c842` | Cup competition color |
| `--plate` | `#6da3ff` | Plate competition color |
| `--bowl` | `#a8aeb8` | Bowl competition color |
| `--win` | `#34d870` | Win highlight, live indicator |
| `--win-lo` | `rgba(52, 216, 112, 0.14)` | Win tint for badges / banners |

### Light theme (`data-theme="light"`)

| Token | Value | Role |
|-------|-------|------|
| `--bg` | `#f5f5f5` | Page background |
| `--surface` | `#ffffff` | Card / panel background |
| `--surface2` | `#eaeaea` | Hover / secondary surface |
| `--line` | `#d4d4d4` | Borders, dividers |
| `--line2` | `#c0c0c0` | Input borders, stronger dividers |
| `--text` | `#1a1a1a` | Primary text |
| `--muted` | `#636363` | Secondary text, placeholders |
| `--muted2` | `#4a4a4a` | Tertiary text |
| `--accent` | `#b5441f` | Brand accent (darkened for contrast) |
| `--accent-lo` | `rgba(181, 68, 31, 0.12)` | Accent tint |
| `--cup` | `#7c6000` | Cup competition color (darkened) |
| `--plate` | `#2563b0` | Plate competition color (darkened) |
| `--bowl` | `#555d68` | Bowl competition color (darkened) |
| `--win` | `#167a3c` | Win highlight (darkened) |
| `--win-lo` | `rgba(22, 122, 60, 0.1)` | Win tint |

Light theme is activated by setting `data-theme="light"` on `<html>`. Font smoothing switches from `antialiased` (dark) to `auto` (light).

---

## 2. Typography

### Font families

| Family | Weights loaded | Usage |
|--------|---------------|-------|
| **Barlow** | 400, 500, 600 | Body text, team names, form inputs |
| **Barlow Condensed** | 400, 600, 700, 900 | Headings, scores, buttons, time labels |
| **JetBrains Mono** | 400, 600 | Labels, badges, meta text, mono UI elements |

### Font-size scale

| Token | Value | Usage |
|-------|-------|-------|
| `--fs-title` | `clamp(2.6rem, 10vw, 4.2rem)` | Main page title |
| `--fs-title-sm` | `2.2rem` | Title at `<380px` breakpoint |
| `--fs-time` | `1.375rem` | Time group headings |
| `--fs-score` | `1.75rem` | Score display |
| `--fs-score-sm` | `1.5rem` | Score at `<380px` breakpoint |
| `--fs-body` | `1rem` | Default body text |
| `--fs-input` | `0.875rem` | Form inputs, search |
| `--fs-body-sm` | `0.8125rem` | Team names, rule text, bracket headings |
| `--fs-label` | `0.75rem` | Badges, meta, table headers, nav labels |
| `--fs-vs` | `0.6875rem` | "vs" indicator, error strip |

### Score entry page title (score.html)

`clamp(1.8rem, 8vw, 2.6rem)` — slightly smaller than the main title.

---

## 3. Spacing & Layout

### Horizontal padding

Most sections use `0 20px` horizontal padding (`match-list`, `standings-wrap`, `bracket-wrap`, `rules-section`, `legend`, `sponsors-grid`).

### Content widths

| Element | Max-width |
|---------|-----------|
| Standings table | `500px` |
| Score entry page | `480px` (centered with `margin: 0 auto`) |

### Border radius

| Context | Radius |
|---------|--------|
| Cards, inputs, dropdowns | `6px` |
| Sponsor cards | `10px` |
| Badges, complete tag | `3px` |
| Position badges | `4px` |
| Legend dots | `2px` |
| Pulse dot, spinner | `50%` (circle) |

### Bottom nav safe area

Main content has `padding-bottom: 72px` to clear the fixed bottom nav.

---

## 4. Component Patterns

### Match card (`.match`)

```
┌─────────────────────────────────┐
│ .match-top                      │  ← ID, label, badge
│ .match-body (3-col grid)        │  ← home | score | away
│ .match-foot                     │  ← time, pitch, refs
└─────────────────────────────────┘
```

- Background: `var(--surface)`, border: `1px solid var(--line)`, radius `6px`
- Highlight state: `border-color: var(--accent)`
- Body grid: `1fr auto 1fr`, gap `10px`, padding `10px 12px`
- Score block min-width: `68px`

### Badges (`.match-badge`)

| Class | Background | Text color |
|-------|-----------|------------|
| `.badge-pool` | `var(--accent-lo)` | `var(--accent)` |
| `.badge-cup` | `rgba(240, 180, 41, 0.15)` | `var(--cup)` |
| `.badge-plate` | `rgba(75, 140, 245, 0.15)` | `var(--plate)` |
| `.badge-bowl` | `rgba(107, 114, 128, 0.2)` | `var(--bowl)` |

All badges: `font-family: JetBrains Mono`, `font-size: var(--fs-label)`, `padding: 2px 7px`, `border-radius: 3px`.

### Standings table (`.standings-table`)

- Full width, max `500px`, `border-collapse: collapse`, `table-layout: fixed`
- Header: JetBrains Mono, `var(--fs-label)`, `var(--muted)`, weight 400
- Cells: JetBrains Mono, `var(--fs-label)`, `var(--muted2)`, padding `11px 6px`
- Team name column: Barlow, weight 600, `var(--fs-body-sm)`, `var(--text)`
- Points column (`.td-pts`): `var(--text)`, weight 600

### Position indicators (`.pos-num`)

| Class | Background | Color |
|-------|-----------|-------|
| `.pos-cup` | `var(--win-lo)` | `var(--win)` |
| `.pos-plate` | `rgba(75, 140, 245, 0.12)` | `var(--plate)` |
| `.pos-bowl` | `rgba(107, 114, 128, 0.15)` | `var(--bowl)` |

20x20px, radius `4px`, centered text.

### Buttons (score.html `.btn`)

- Full width, padding `14px`, radius `6px`
- Font: Barlow Condensed, `1rem`, weight 700, uppercase, letter-spacing `0.08em`
- `.btn-accent`: `background: var(--accent)`, `color: #fff`
- `.btn-surface`: `background: var(--surface)`, `border: 1px solid var(--line2)`, `color: var(--text)`
- Hover: `opacity: 0.85`
- Disabled: `opacity: 0.4`, `cursor: not-allowed`

### Form inputs (`.form-input`)

- Background: `var(--surface)`, border: `1px solid var(--line2)`, radius `6px`
- Font: Barlow, `var(--fs-input)`, padding `12px 14px`
- Focus: `border-color: var(--accent)`
- Placeholder: `color: var(--muted)`

### PIN boxes (score.html `.pin-box`)

- 48x56px, same surface/border treatment as form inputs
- Font: Barlow Condensed, `var(--fs-score)`, weight 700, centered
- Number spinners hidden via vendor prefixes

### Banners

**Warning** (`.warning-banner`):
- Background: `var(--accent-lo)`, left border: `3px solid var(--accent)`, radius `4px`
- Font: JetBrains Mono, `var(--fs-label)`, `color: var(--accent)`

**Success** (`.success-banner`):
- Background: `var(--win-lo)`, left border: `3px solid var(--win)`, radius `4px`
- Title: Barlow Condensed, `1.125rem`, weight 700, uppercase, `color: var(--win)`
- Detail: JetBrains Mono, `var(--fs-label)`, `color: var(--muted2)`

**Error strip** (`.error-strip`):
- Border: `1px solid rgba(255, 77, 28, 0.3)`, radius `6px`
- Font: JetBrains Mono, `var(--fs-vs)`, `color: var(--accent)`

### Sponsor cards (`.sponsor-card`)

- Background: `#ffffff` (always white), border: `1px solid var(--line)`, radius `10px`
- Padding: `16px 12px`, hover: `border-color: var(--accent)`
- Image: `width: 100%`, `height: 80px`, `object-fit: contain`
- Name: Barlow, `var(--fs-label)`, `color: #555`
- Grid: `repeat(auto-fill, minmax(140px, 1fr))`, gap `16px`

### Section head (`.section-head`)

Label followed by a horizontal rule line (via `::after` pseudo-element).
- Font: JetBrains Mono, `var(--fs-label)`, letter-spacing `0.15em`, uppercase, `var(--muted)`

### Break block (`.break-block`)

- Left border: `2px solid var(--accent)`, padding `8px 12px`, margin `8px 20px`
- Text: JetBrains Mono, `var(--fs-label)`, uppercase, `var(--muted2)`

---

## 5. Responsive Breakpoints

### `max-width: 480px`

- Header date stacks vertically (column layout, dot separators removed)
- Status pill wraps

### `max-width: 380px`

- Title shrinks: `var(--fs-title-sm)` (2.2rem)
- Score shrinks: `var(--fs-score-sm)` (1.5rem)
- Team name shrinks: `var(--fs-label)` (0.75rem)

---

## 6. Animations

### Page fade-in (`fadein`)

```css
@keyframes fadein {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: none; }
}
```

Duration `0.15s ease`. Applied to `.page.active` and `.screen.active`.

### Live pulse (`pulse-anim`)

```css
@keyframes pulse-anim {
  0%, 100% { opacity: 1; box-shadow: 0 0 6px 2px var(--win); }
  50%      { opacity: 0.3; box-shadow: 0 0 2px 0px var(--win); }
}
```

Duration `2s ease infinite`. Applied to `.pulse-dot.live`.

### Loading spinner (`spin`)

```css
@keyframes spin {
  to { transform: rotate(360deg); }
}
```

Duration `0.7s linear infinite`. Spinner is 28x28px, `border: 2.5px solid var(--line2)`, `border-top-color: var(--accent)`.

### Transitions

Most interactive elements use `transition: <property> 0.15s` for hover/focus state changes (color, border-color, opacity).
