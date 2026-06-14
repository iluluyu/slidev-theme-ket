# slidev-theme-ket

[![NPM version](https://img.shields.io/npm/v/slidev-theme-ket?color=3AB9D4&label=)](https://www.npmjs.com/package/slidev-theme-ket)

An academic theme for [Slidev](https://github.com/slidevjs/slidev) — built for talks with theorems, definitions, and math. Features `Bra` theorem blocks, four cover variants (`cover`, `cover-deco`, `PaperCover` centered, `PaperCover` deco), a quantum dot-grid background, semantic six-color boxes, and Geist typography.

<!--
  Learn more about how to write a theme:
  https://sli.dev/guide/write-theme.html
-->

<!--
  run `npm run dev` to check out the slides for more details of how to start writing a theme
-->

<!--
  Put some screenshots here to demonstrate your theme

  Live demo: [...]
-->

## Install

Add the following frontmatter to your `slides.md`. Start Slidev then it will prompt you to install the theme automatically.

<pre><code>---
theme: <b>ket</b>
---</code></pre>

Learn more about [how to use a theme](https://sli.dev/guide/theme-addon#use-theme).

## Layouts

This theme provides the following layouts:

### `cover`

Title slide. Reads presenter metadata from the headmatter and renders it below the title.

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
- `author` / `organization` / `date` — shown under the title (`organization` accepts HTML).

`gradient` can be set **per slide** to mix plain and gradient covers in one deck:

```markdown
---
layout: cover
gradient: true
---

# Section Title
```

### `intro`

Centered light layout, ideal for agenda pages or short interludes.

### `section`

Light transition layout sharing the same left-text / right-illustration language as `cover-deco`. It supports an optional `sectionNumber` (or `num`), comma-separated or array `tags` frontmatter, and a `decoration` named slot. When the slot is omitted, a faint Bloch-sphere illustration is used by default.

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

### `cover-deco`

Title slide with a left text column and a right illustration column (Quantum slide-1 style). The right column receives a named `decoration` slot, falling back to a built-in Bloch-sphere SVG when no custom art is supplied — so the slide is presentable out of the box.

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
- `decoration` named slot — drop in any SVG / image / component. Omit it to use the built-in Bloch sphere.
- Presenter metadata (`author` / `organization` / `date`) renders as a key-value row, matching the Quantum template.

### `default`

Base content layout (inherited from Slidev's built-in `layouts-base.css`).

## Design system

The theme's tokens are aligned with the Quantum template — a light parchment ground (`#F7F8FC`) with a subtle **quantum dot-grid** overlay, deep indigo text in three tiers, and a quantum-violet accent (`#7229E8`). All tokens are exposed as CSS custom properties on `:root`:

| Token | Value | Purpose |
| --- | --- | --- |
| `--ket-ac` / `--ket-ac-m` / `--ket-ac-lt` / `--ket-ac-bd` | `#7229E8` / `#8B3CF7` / `#EDE9FE` / `#C4B5FD` | Violet accent ramp |
| `--ket-t1` / `--ket-t2` / `--ket-t3` | `#1B1840` / `#46426E` / `#8E8BAD` | Indigo text tiers |
| `--ket-{default,primary,success,warning,danger,muted}-{bg,lbl}` | see `layout.css` | Semantic box palette (consumed by `Bra` tones) |

The dot-grid renders via `.slidev-layout::before` and recolors automatically in dark mode. Override `--ket-dot-color` / `--ket-dot-size` to tune it.

The theme also renders a global right-bottom page counter plus a 2px violet progress bar via `global-bottom.vue`. Hide the page counter on a slide with `hideFooter: true`.

## Components

This theme provides the following components:

### `Bra`

Theorem / definition / note block for academic slides. The default style is a **filled semantic background with a hairline ring shadow** (no side border), matching the Quantum template. Use `:border="true"` for the outlined variant.

```vue
<Bra title="No-Cloning Theorem">
There is no one-fits-all cloning unitary $U$.
</Bra>
```

Preset mathematical labels are available through `type`:

```vue
<Bra type="definition" name="Sample Amplification" :number="1">
Content
</Bra>
```

Use `tone` for semantic color emphasis:

```vue
<Bra title="Task" tone="primary">
Main objective
</Bra>

<Bra title="Warning" tone="danger">
Important caveat
</Bra>
```

Available tones: `default`, `primary`, `danger`, `warning`, `success`, `muted`.

Useful props:

- `title` — custom block title.
- `type` — preset label, such as `theorem`, `definition`, `lemma`, `proof`, `corollary`, `question`, `assumption`, or `protocol`.
- `name` — secondary label shown in parentheses.
- `number` — theorem / definition number.
- `tone` — semantic color style.
- `compact` — whether the header and first paragraph share one line. Defaults to `false`, matching the Quantum HTML theorem/proof block style.
- `border` — whether the block uses the outlined style. Defaults to `false` (filled background).
- `italic` — italicize the body text.
- `color`, `bg-color`, `title-color`, `border-color` — low-level color overrides.

Compatibility: old props like `customTitle` and `inline` still work, so existing slides do not need to be migrated immediately.

When `tone` is omitted, common academic `type` values map to semantic tones automatically: `definition` → primary, `lemma` → success, `proof` → muted, `remark` / `note` → warning, and `corollary` → danger.

### `PaperCover`

Academic paper cover block for title, authors, and affiliations. The title is centered and, when `gradient: true` is set in the frontmatter, rendered with the same signature gradient as the `cover` layout — so a `PaperCover` slide matches the deck's cover style.

```vue
<PaperCover
  title="Cloning is as Hard as Learning for Stabilizer States"
  :authors="[
    ['Nikhil Bansal', '*1'],
    ['Matthias C. Caro', '†1'],
    ['Gaurav Mahajan', '‡2'],
  ]"
  :affiliations="[
    ['1', 'Department of Computer Science, University of Warwick, Coventry, UK'],
    ['2', 'Department of Computer Science, Yale University, Connecticut, USA'],
  ]"
/>
```

Authors and affiliations also accept object-style entries:

```vue
<PaperCover
  title="Paper Title"
  :authors="[
    { name: 'Alice', mark: '1' },
    { name: 'Bob', mark: '2' },
  ]"
  :affiliations="[
    { mark: '1', text: 'Department A' },
    { mark: '2', text: 'Department B' },
  ]"
/>
```

Add the `deco` prop (or a `decoration` named slot) to switch to a two-column layout with a Bloch-sphere illustration on the right (Quantum slide-13 style):

```vue
<PaperCover
  deco
  title="Exponential Speedup in Measurement Property Learning"
  :authors="[['Z. Liu', '1'], ['Q. Ye', '1,2']]"
  :affiliations="[['1', 'Tsinghua University'], ['2', 'Shanghai Qi Zhi']]"
/>
```

```vue
<PaperCover title="Paper Title" :authors="[...]">
  <template #decoration>
    <img src="./cover-art.svg" />
  </template>
</PaperCover>
```

## Contributing

- `npm install`
- `npm run dev` to start theme preview of `example.md`
- Edit the `example.md` and style to see the changes
- `npm run export` to generate the preview PDF
- `npm run screenshot` to generate the preview PNG
