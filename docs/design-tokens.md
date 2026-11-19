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
  color, and clearly visible mid-chroma semantic fills.
- **`vivid`** — the original ket palette: parchment ground, deep indigo text,
  quantum-violet accent, saturated semantic fills.

The palette is deck-global — there is intentionally no per-slide switch. It
recolors tokens only: layout sizes, radii, shadows, typography, and the
component API are identical across palettes. Both palettes support light and
dark mode.

### Independent cover gradient

Use `themeConfig.coverGradient: mono | vivid` to choose a title gradient
independently of body colors. Omitted or invalid values follow `palette`.
For example:

```yaml
themeConfig:
  palette: mono
  coverGradient: vivid
```

The low-saturation `mono` ramp runs clay → dusty rose → indigo → steel blue;
`vivid` runs orange → pink → violet → blue. Both use a near-horizontal 100°
angle and support light/dark backgrounds. `gradient: true/false` still controls
whether a layout uses gradient text. The choice is shared by `cover`,
`cover-deco`, `PaperCover`, and `thanks`, not `cover-cosmic`.
The named tokens `--ket-gradient-cover-mono` / `--ket-gradient-cover-vivid`
feed the resolved `--ket-gradient-cover` token.

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
| `--ket-ac` | `#4F4BD8` | `#9693FF` |
| `--ket-ac-m` | `#4F4BD8` | `#9693FF` |
| `--ket-ac-lt` | `#E3E5F8` | `#242344` |
| `--ket-ac-bd` | `#B9B9E9` | `#626099` |
| `--ket-t1` | `#1D1D1F` | `#F5F5F7` |
| `--ket-t2` | `#35353A` | `#D1D1D6` |
| `--ket-t3` | `#62626A` | `#A2A2AA` |
| `--ket-surface` | `#FFFFFF` | `#1C1C1E` |
| `--ket-surface-2` | `#F5F5F7` | `#242426` |
| `--ket-border` | `#D2D2D7` | `#3A3A3C` |
| `--ket-gradient-cover-mono` | `linear-gradient(100deg, #B5583A 0%, #A5506A 32%, #5A5BC8 70%, #2F72C0 100%)` | 同亮色 |
| `--ket-on-accent` | `#F5F5F7` | `#111113` |

Semantic fills have enough depth to separate from the neutral canvas, while
lower chroma and earthy labels keep them distinct from vivid. Dark fills are
opaque tinted zones rather than barely visible alpha overlays. Body text,
semantic labels, and step numbers are tested at ≥4.5:1 contrast; gradients
are sampled between stops at ≥3:1 for large headings on both palettes' grounds. Each tone exposes a `-{bg,lbl}`
pair (for example `--ket-primary-bg` / `--ket-primary-lbl`), consumed by `Pad`
tones and badges:

| Tone | Light bg / lbl | Dark bg / lbl |
| --- | --- | --- |
| `default` | `#E3E5F8` / `#4440B0` | `#242344` / `#B3B1FF` |
| `primary` | `#DDE9F7` / `#1757AD` | `#1C2D43` / `#82B7FF` |
| `success` | `#DBEEE3` / `#206840` | `#1C342A` / `#83D6A6` |
| `warning` | `#F5E7CB` / `#84530A` | `#3B2E1C` / `#EFBE70` |
| `danger` | `#F5DFE3` / `#A62D45` | `#3D232E` / `#F49BAE` |
| `muted` | `#E6E7EB` / `#555964` | `#292A30` / `#B7BAC4` |

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
| `--ket-gradient-cover-vivid` | `linear-gradient(100deg, #E8590C 0%, #E0457B 24%, #B23FD0 50%, #6A4CF0 74%, #1F7AF5 100%)` | 同亮色 |

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
uses the same rhythm: unordered bullets are small solid squares at every
depth. Level 1 uses `--ket-ac`; level 2 uses the softer same-hue
`--ket-marker-l2`; level 3 and deeper use neutral `--ket-t3`. Both ul and ol
ancestors count toward nesting depth. Body text, marker sizes, and indentation
are unchanged. Nested ordered lists keep letters then Roman numerals and
their separate secondary marker tiers.

| Palette / mode | Level 1 | Level 2 | Level 3+ |
| --- | --- | --- | --- |
| mono light | `#4F4BD8` | `#8885E5` | `#62626A` |
| mono dark | `#9693FF` | `#B8B6FF` | `#A2A2AA` |
| vivid light | `#7229E8` | `#A775F0` | `#8E8BAD` |
| vivid dark | `#7229E8` | `#A775F0` | `#8E8BAD` |

Standard content and `two-cols-header` headings render no divider: the
full-width 1px hairline and the earlier short gradient stroke are both gone;
title-to-body spacing comes from the heading's own bottom margin. Covers and
section dividers keep their own treatments.

## Global chrome

`global-bottom.vue` renders two elements on every slide:

- A **page counter** at the right bottom.
- A **progress bar** along the bottom, dyed with the palette accent.

Hide the page counter on a single slide with `hideFooter: true` in its
frontmatter.

The optional [canvas frame](../README.md#canvas-frame) is drawn 4 slide pixels
inside the edge of the scaled Slidev canvas without adding padding or
changing slide layout or zoom. It uses the shared `--ket-radius-md` and
`--ket-corner-shape` tokens from `styles/squircle.css` (ordinary round
corners when `corner-shape` is unsupported). The stroke is a translucent
`--ket-ac-m` accent that follows the active palette and color mode.
