# Design tokens

All tokens are exposed as CSS custom properties on `:root` (dark overrides in
`.dark`), so they can be overridden per deck or per slide. The authoritative
definitions live in `styles/layout.css`.

## Palette switch: `themeConfig.palette`

The theme ships two color palettes, picked from deck headmatter:

```yaml
---
theme: ../../slidev-theme-ket
themeConfig:
  palette: mono    # default — may be omitted; the alternative is `vivid`
---
```

- **`mono` (default)** — the projector-safe palette merged from the retired
  `slidev-theme-ket-mono` variant: neutral gray surfaces, one indigo focus
  color, restrained semantic fills.
- **`vivid`** — the original ket palette: parchment ground, deep indigo text,
  quantum-violet accent, saturated semantic fills.

The palette is deck-global — there is intentionally no per-slide switch. It
recolors tokens only: layout sizes, radii, shadows, typography, and the
component API are identical across palettes. Both palettes support light and
dark mode.

Migrating older decks:

- Decks on the removed `slidev-theme-ket-mono` submodule: change
  `theme:` to `../../slidev-theme-ket` — the mono look becomes the default.
- Existing ket decks that want the previous violet colors: set
  `palette: vivid`.
- Rename `<Bra …>` / `</Bra>` tags to `<Pad …>` / `</Pad>` — the theorem block
  component is `Pad` only; `Bra.vue` is gone.

## `mono` palette (default)

Neutral surfaces carry the hierarchy; the indigo family marks focus.

| Token | Light | Dark |
| --- | --- | --- |
| slide ground | `#F5F5F7` | `#111113` |
| `--ket-ac` | `#5856D6` | `#7D7AFF` |
| `--ket-ac-m` | `#5856D6` | `#7D7AFF` |
| `--ket-ac-lt` | `#F0EFFF` | `rgba(125, 122, 255, 0.13)` |
| `--ket-ac-bd` | `#D9D8F8` | `#4B496E` |
| `--ket-t1` | `#1D1D1F` | `#F5F5F7` |
| `--ket-t2` | `#424245` | `#D1D1D6` |
| `--ket-t3` | `#6E6E73` | `#8E8E93` |
| `--ket-surface` | `#FFFFFF` | `#1C1C1E` |
| `--ket-surface-2` | `#F5F5F7` | `#242426` |
| `--ket-border` | `#D2D2D7` | `#3A3A3C` |
| `--ket-gradient-cover` | `linear-gradient(108deg, #1D1D1F 0%, #5856D6 68%, #0071E3 100%)` | 同亮色 |

Semantic fills stay close to neutral so several `Pad` blocks can coexist
without turning a slide into a color chart. Each tone exposes a `-{bg,lbl}`
pair (for example `--ket-primary-bg` / `--ket-primary-lbl`), consumed by `Pad`
tones and badges:

| Tone | Light bg / lbl | Dark bg / lbl |
| --- | --- | --- |
| `default` | `#F3F2FC` / `#4D4BB7` | `rgba(125, 122, 255, 0.10)` / `#A7A5F5` |
| `primary` | `#F0F6FC` / `#0066CC` | `rgba(10, 132, 255, 0.10)` / `#64B5FF` |
| `success` | `#F1F7F3` / `#1A7440` | `rgba(48, 209, 88, 0.09)` / `#66D486` |
| `warning` | `#FBF7EE` / `#8A5A00` | `rgba(255, 159, 10, 0.09)` / `#E7B65E` |
| `danger` | `#FBF1F2` / `#B42336` | `rgba(255, 69, 58, 0.09)` / `#FF8A83` |
| `muted` | `#F5F5F7` / `#6E6E73` | `rgba(142, 142, 147, 0.10)` / `#AEAEB2` |

## `vivid` palette

The original ket ramp — parchment ground, three indigo text tiers, one
quantum-violet accent.

| Token | Light | Dark |
| --- | --- | --- |
| slide ground | `#F7F8FC` | `#1B1726` |
| `--ket-ac` | `#7229E8` | `#7229E8` |
| `--ket-ac-m` | `#8B3CF7` | `#8B3CF7` |
| `--ket-ac-lt` | `#EDE9FE` | `rgba(139, 60, 247, 0.20)` |
| `--ket-ac-bd` | `#C4B5FD` | `#C4B5FD` |
| `--ket-t1` | `#1B1840` | `#E8E6F0` |
| `--ket-t2` | `#46426E` | `#C4C0DC` |
| `--ket-t3` | `#8E8BAD` | `#8E8BAD` |
| `--ket-surface` | `#FFFFFF` | `#252134` |
| `--ket-surface-2` | `#F0F1F7` | `#2D2940` |
| `--ket-border` | `#E2E3EF` | `#3A3552` |
| `--ket-gradient-cover` | `linear-gradient(135deg, #FF6F00 0%, #DE5471 25%, #A948C9 50%, #6553D8 75%, #1C73FF 100%)` | 同亮色 |

Saturated semantic fills in light mode; dark mode switches to translucent
fills with luminous labels so `Pad` blocks read as tinted dark zones instead
of glowing pastel cards:

| Tone | Light bg / lbl | Dark bg / lbl |
| --- | --- | --- |
| `default` | `#EDEAFF` / `#6D28D9` | `rgba(139, 60, 247, 0.16)` / `#C4B5FD` |
| `primary` | `#DBEAFE` / `#1D4ED8` | `rgba(59, 130, 246, 0.16)` / `#93C5FD` |
| `success` | `#D1FAE5` / `#047857` | `rgba(16, 185, 129, 0.16)` / `#6EE7B7` |
| `warning` | `#FEF3C7` / `#B45309` | `rgba(245, 158, 11, 0.16)` / `#FBBF24` |
| `danger` | `#FFE4E6` / `#BE123C` | `rgba(244, 63, 94, 0.16)` / `#FDA4AF` |
| `muted` | `#F1F2F7` / `#64748B` | `rgba(148, 163, 184, 0.14)` / `#94A3B8` |

## Lists and content headings

Native Markdown lists keep hanging text alignment, modest marker sizes, and
consistent spacing for tight and loose items. Mixed ordered/unordered nesting
uses the same rhythm: bullets progress disc → circle → square; nested ordered
lists use letters then Roman numerals.
Nested markers use the palette's secondary tiers rather than enlarged accents.

Standard content and `two-cols-header` headings share a full-width 1px divider
in `--ket-border`, replacing the short gradient stroke in both palettes.
Covers and section dividers keep their own treatments.

## Global chrome

`global-bottom.vue` renders two elements on every slide:

- A **page counter** at the right bottom.
- A **progress bar** along the bottom, dyed with the palette accent.

Hide the page counter on a single slide with `hideFooter: true` in its
frontmatter.
