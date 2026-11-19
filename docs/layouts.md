# Layouts

Detailed reference for the layouts shipped with `slidev-theme-ket`. For a quick
overview, see the [README](../README.md#layouts).

## `cover`

Title slide. Reads presenter metadata from the headmatter and renders it below
the title.

```yaml
---
theme: ket
author: Luyu Lu
organization: Fudan University
date: 2026-06-14
gradient: true
---
```

- `gradient: true` — enable the title gradient. Choose its colors globally with
  `themeConfig.coverGradient: mono | vivid`; omitted/invalid values follow
  `themeConfig.palette`. This leaves body colors unchanged.
- `author` / `organization` / `date` — shown under the title (`organization`
  accepts HTML).

`gradient` can be set **per slide** to mix plain and gradient covers in one
deck. For a vivid cover with restrained body colors, use this headmatter:

```yaml
themeConfig:
  palette: mono
  coverGradient: vivid
```

The gradient choice also applies to `cover-deco`, `PaperCover`, and `thanks`,
which share `--ket-gradient-cover`. Cosmic covers keep their own treatment.

## `intro`

Centered light layout, ideal for agenda pages or short interludes.

## `section`

Light transition layout sharing the same left-text / right-illustration
language as `cover-deco`. Supports an optional `sectionNumber` (or `num`),
comma-separated or array `tags` frontmatter, and a `decoration` named slot.
When the slot is omitted, a faint Bloch-sphere illustration is used by default.

```markdown
---
layout: section
sectionNumber: §1
tags:
  - Density matrices
  - Entropy
---

# Mathematical Framework

Quantum states, density matrices, and the von Neumann entropy.

<!-- Optional: override the default Bloch sphere -->
::decoration::
<svg width="320" height="240"><!-- your illustration --></svg>
::
```

## `cover-deco`

Title slide with a left text column and a right illustration column (Quantum
slide-1 style). The right column receives a named `decoration` slot, falling
back to a built-in Bloch-sphere SVG when no custom art is supplied — so the
slide is presentable out of the box.

```markdown
---
layout: cover-deco
gradient: true
tag: Quantum Information · Research Seminar
---

# Quantum Entanglement and Information Processing

A framework for multipartite entanglement measures.

<!-- Optional: override the built-in Bloch sphere -->
::decoration::
<svg width="300" height="300"><!-- your illustration --></svg>
::
```

- `tag` (per-slide frontmatter) — small-caps eyebrow label above the title.
- `gradient` — same title fill as `cover`.
- `decoration` named slot — drop in any SVG / image / component. Omit it to
  use the built-in Bloch sphere.
- Presenter metadata (`author` / `organization` / `date`) renders as a
  key-value row, matching the Quantum template.

## `cover-cosmic`

Three.js black-hole cover with a silver-blue inner crescent, flowing violet
filaments, and a sparse sky. The default camera drifts gently around the
initial viewpoint; the title overlay and optional link card stay fixed.

```yaml
---
layout: cover-cosmic
heading: A Research Talk
quality: high
speed: 0.45
maxFps: 24
---
```

- `motion: auto` (default): respect `prefers-reduced-motion`, including Windows
  Animation Effects. `always` explicitly enables rotation even when system
  effects are off; `never` keeps a static first frame.
- `maxFps`: upper limit, default 30. Actual FPS is also capped by the quality
  budget; software WebGL (SwiftShader, etc.) is limited to 24.
- `quality: auto | low | high`: controls sampling, resolution, and the
  low-budget star count. The disc is shaded directly at each lensed pixel.
  Output follows the slide's displayed size and device pixel ratio, bounded by
  the following caps (multiples of the authored canvas dimensions):

  | Quality | Hardware output cap | Software WebGL output cap |
  | --- | --- | --- |
  | `low` | 1.25× | 1× |
  | `auto` (default) | 2× | 1.5× |
  | `high` | 4×, up to 8.4 MP | 2× |

  Hardware `high` requests the high-performance GPU and uses a lens map at
  the scene resolution, preserving the same lens depth ordering and camera
  framing across quality tiers. It shades four subpixel samples through 1440p;
  above that, it shades once at native output resolution (up to UHD on a
  typical 16:9 canvas). The GPU's texture limit still applies. Software
  WebGL keeps the lighter sampling path; its `high` lens map uses 75% of
  the output dimensions. All tiers sample the lensed shadow boundary at
  extra subpixel positions and apply edge coverage after tone mapping. The
  two lens planes blend across their depth intersection, so the contour
  turns smoothly where the arcs meet. The edge filter estimates its width
  from symmetric samples to reduce shimmer as the silhouette moves. The
  disc filaments keep their own texture filter and flow around the hole
  with a bounded, radius-dependent shear. Use `quality: low` or lower
  `maxFps` if a machine struggles. To slow the orbit and disc flow without
  reducing frame rate, lower `speed` independently. The showcase includes
  a slow high-quality cover, a low-budget cover, and a high-quality still.
- `speed`, `stars`, `innerColor`, `outerColor`, `focus`, `interactive`:
  control motion speed, stars, palette, framing and orbit interaction.
  `innerColor` defaults to `#a0b3ff` and `outerColor` to `#5a42cc`.
  Set `stars: false` for a completely clean backdrop.
- `heading` overrides the title; author, organization and date come from the
  headmatter. `link`, `linkLabel`, `linkSublabel` configure the glass link card.

For exact 16:9 full-screen fit, set `aspectRatio: 16/9` and a
`canvasWidth` divisible by 16 in the deck headmatter (the showcase uses
976). Slidev fits rather than stretches the canvas; on other screen ratios,
the live cosmic cover uses a dark surround to avoid bright side bars.

Animation runs only on the current, intersecting live slide with a visible
document. Overview, printing/export and next-slide previews get a static frame.
Leaving the slide cancels both animation handles; unmounting disposes observers,
listeners, textures, geometries, materials, render targets and the WebGL context.
The Canvas 2D fallback follows the same motion/visibility policy.

## `default`

Base content layout (inherited from Slidev's built-in `layouts-base.css`).

## `two-cols-header`

Two-column layout with an optional full-width header. Content before the first
`::slot::` is the header (full width); `::left::` and `::right::` fill the
columns. Override the column ratio with the `cols` frontmatter (default equal
columns).

```markdown
---
layout: two-cols-header
cols: 1.15fr 0.85fr
---

# Heading

Intro paragraph rendered full-width above the columns.

::left::
Left column content.

::right::
Right column content.
::
```

## `thanks`

Closing slide. Mirrors the cover's centered gradient title. The gradient fill
is on by default (the signature closing flourish); set `gradient: false` in the
frontmatter to render a solid-color title.

```markdown
---
layout: thanks
---

# Thank you
```
