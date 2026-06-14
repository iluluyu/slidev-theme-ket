# slidev-theme-ket

[![NPM version](https://img.shields.io/npm/v/slidev-theme-ket?color=3AB9D4&label=)](https://www.npmjs.com/package/slidev-theme-ket)

An academic theme for [Slidev](https://github.com/slidevjs/slidev) — built for talks with theorems, definitions, math, and projector projection. Features `Bra` theorem blocks, `PaperCover` academic covers, squircle rounded corners, Geist typography, and a projector-safe contrast mode.

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
- `glass: true` — frosted-glass gradient (mutually exclusive with `gradient`).
- `author` / `organization` / `date` — shown under the title (`organization` accepts HTML).

`gradient` and `glass` can be set **per slide** to mix cover variants in one deck:

```markdown
---
layout: cover
gradient: false
glass: true
---

# Glass variant
```

### `intro`

Centered layout, ideal for section transitions or self-introduction.

### `default`

Base content layout (inherited from Slidev's built-in `layouts-base.css`).

## Modes

### Projector mode

Add `projector: true` to the headmatter to optimize for projection — RGB 16–235 dynamic-range compression, bolder borders/weights, and opacity compensation so faint elements stay readable from the back row.

```yaml
---
theme: ket
projector: true
---
```

Toggled globally by `global-bottom.vue` via the `.projector-mode` class, which overrides the `--ket-*` CSS variables from `squircle.css`.

## Components

This theme provides the following components:

### `Bra`

Theorem / definition / note block for academic slides. The concise form uses a title and the default bordered compact style:

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
- `compact` — whether the header and first paragraph share one line. Defaults to `true`.
- `border` — whether the block uses the bordered style. Defaults to `true`.
- `italic` — italicize the body text.
- `color`, `bg-color`, `title-color`, `border-color` — low-level color overrides.

Compatibility: old props like `customTitle` and `inline` still work, so existing slides do not need to be migrated immediately.

### `PaperCover`

Academic paper cover block for title, authors, and affiliations. The title is centered and, when `gradient: true` (or `glass: true`) is set in the frontmatter, rendered with the same signature gradient as the `cover` layout — so a `PaperCover` slide matches the deck's cover style.

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

## Contributing

- `npm install`
- `npm run dev` to start theme preview of `example.md`
- Edit the `example.md` and style to see the changes
- `npm run export` to generate the preview PDF
- `npm run screenshot` to generate the preview PNG
