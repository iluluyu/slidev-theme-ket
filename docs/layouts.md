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
