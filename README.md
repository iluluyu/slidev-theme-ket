# slidev-theme-ket

[![NPM version](https://img.shields.io/npm/v/slidev-theme-ket?color=3AB9D4&label=)](https://www.npmjs.com/package/slidev-theme-ket)

A (...) theme for [Slidev](https://github.com/slidevjs/slidev).

<!--
  Learn more about how to write a theme:
  https://sli.dev/guide/write-theme.html
--->

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

> TODO:

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

Academic paper cover block for title, authors, and affiliations.

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
