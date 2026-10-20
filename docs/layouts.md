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

- `gradient: true` — gradient text fill for the title.
- `author` / `organization` / `date` — shown under the title (`organization`
  accepts HTML).

`gradient` can be set **per slide** to mix plain and gradient covers in one
deck.

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

Three.js black-hole cover with a text-safe gradient and optional link card.

```yaml
---
layout: cover-cosmic
heading: A Research Talk
motion: always
quality: auto
maxFps: 30
---
```

- `motion: auto` (default): respect `prefers-reduced-motion`, including Windows
  Animation Effects. `always` explicitly enables rotation even when system
  effects are off; `never` keeps a static first frame.
- `maxFps`: upper limit, default 30. Actual FPS is also capped by the quality
  budget; software WebGL (SwiftShader, etc.) is limited to 12.
- `quality: auto | low | high`: particle and resolution budget. Auto uses DPR 1
  and a native-size scene target rather than 2× supersampling. Low reduces both.
  Software rendering is capped regardless of requested quality.
- `speed`, `stars`, `innerColor`, `outerColor`, `focus`, `interactive`:
  control motion speed, stars, palette, framing and orbit interaction.
- `heading` overrides the title; author, organization and date come from the
  headmatter. `link`, `linkLabel`, `linkSublabel` configure the glass link card.

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
