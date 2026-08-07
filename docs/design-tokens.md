# Design tokens

The theme's tokens are aligned with the Quantum template. All tokens are
exposed as CSS custom properties on `:root`, so they can be overridden per
deck or per slide. See `styles/layout.css` for the authoritative definitions.

## Ground & background

A light parchment ground (`#F7F8FC`) with a subtle **quantum dot-grid** overlay
that recolors automatically in dark mode.

## Accent ramp

| Token | Value | Purpose |
| --- | --- | --- |
| `--ket-ac` | `#7229E8` | Violet accent |
| `--ket-ac-m` | `#8B3CF7` | Accent mid |
| `--ket-ac-lt` | `#EDE9FE` | Accent light (fills) |
| `--ket-ac-bd` | `#C4B5FD` | Accent border |

## Text tiers

| Token | Value | Purpose |
| --- | --- | --- |
| `--ket-t1` | `#1B1840` | Primary text |
| `--ket-t2` | `#46426E` | Body text |
| `--ket-t3` | `#8E8BAD` | Captions and metadata |

## Semantic palette

Each semantic tone exposes a `-{bg,lbl}` pair (for example
`--ket-primary-bg` / `--ket-primary-lbl`), consumed by `Bra` tones. The full
set — `default`, `primary`, `success`, `warning`, `danger`, `muted` — is
defined in `styles/layout.css`.

## Dot-grid background

Rendered via `.slidev-layout::before`. Tune or disable it by overriding:

```css
:root {
  --ket-dot-color: /* dot color */;
  --ket-dot-size: /* dot spacing */;
}
```

## Global chrome

`global-bottom.vue` renders two elements on every slide:

- A **page counter** at the right bottom.
- A **2px violet progress bar** along the top.

Hide the page counter on a single slide with `hideFooter: true` in its
frontmatter.
