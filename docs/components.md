# Components

Detailed reference for the components shipped with `slidev-theme-ket`. For a
quick overview, see the [README](../README.md#components).

## `Bra`

Theorem / definition / note block for academic slides. The default style is a
**filled semantic background with a hairline ring shadow** (no side border),
matching the Quantum template. Use `:border="true"` for the outlined variant.

### Basic usage

```vue
<Bra title="No-Cloning Theorem">
There is no one-fits-all cloning unitary $U$.
</Bra>
```

### Preset labels (`type`)

```vue
<Bra type="definition" name="Sample Amplification" :number="1">
Content
</Bra>
```

`type` renders a preset mathematical label. Available values: `theorem`,
`definition`, `lemma`, `proof`, `corollary`, `question`, `assumption`,
`protocol` (and a few aliases).

### Semantic tones (`tone`)

```vue
<Bra title="Task" tone="primary">
Main objective
</Bra>

<Bra title="Warning" tone="danger">
Important caveat
</Bra>
```

Available tones: `default`, `primary`, `danger`, `warning`, `success`, `muted`.

When `tone` is omitted, common academic `type` values map to semantic tones
automatically:

| `type` | default `tone` |
| --- | --- |
| `definition` | `primary` |
| `lemma` | `success` |
| `proof` | `muted` |
| `remark` / `note` | `warning` |
| `corollary` | `danger` |

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | string | — | Custom block title. |
| `type` | string | — | Preset label (`theorem`, `definition`, `lemma`, `proof`, …). |
| `name` | string | — | Secondary label shown in parentheses. |
| `number` | number / string | — | Theorem / definition number. |
| `tone` | string | — | Semantic color style. |
| `compact` | boolean | `false` | Header and first paragraph share one line. |
| `border` | boolean | `false` | Use the outlined style instead of filled. |
| `italic` | boolean | `false` | Italicize the body text. |
| `color` | string | — | Low-level body color override. |
| `bg-color` | string | — | Low-level background override. |
| `title-color` | string | — | Low-level title color override. |
| `border-color` | string | — | Low-level border color override. |

### Compatibility

Old props like `customTitle` and `inline` still work, so existing slides do not
need to be migrated immediately.

---

## `PaperCover`

Academic paper cover block for title, authors, and affiliations. The title is
centered and, when `gradient: true` is set in the frontmatter, rendered with
the same signature gradient as the `cover` layout — so a `PaperCover` slide
matches the deck's cover style.

### Centered (default)

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

`authors` and `affiliations` accept either tuple arrays (`[name, mark]` /
`[mark, text]`) or object-style entries:

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

### Two-column with decoration (`deco`)

Add the `deco` prop (or a `decoration` named slot) to switch to a two-column
layout with a Bloch-sphere illustration on the right (Quantum slide-13 style):

```vue
<PaperCover
  deco
  title="Exponential Speedup in Measurement Property Learning"
  :authors="[['Z. Liu', '1'], ['Q. Ye', '1,2']]"
  :affiliations="[['1', 'Tsinghua University'], ['2', 'Shanghai Qi Zhi']]"
/>
```

Custom decoration via slot:

```vue
<PaperCover title="Paper Title" :authors="[...]">
  <template #decoration>
    <img src="./cover-art.svg" />
  </template>
</PaperCover>
```

---

## `Figure`

Framed image with an optional figure number and a Markdown caption. The caption
is the default slot, so inline math, emphasis, and links all render — separate
it from the tags with blank lines.

```vue
<Figure src="/figures/bloch-sphere.svg" :number="1" width="70%">

**Bloch sphere** — pure states $|\psi\rangle$ lie on the unit sphere.

</Figure>
```

| Prop | Type | Description |
| --- | --- | --- |
| `src` | string | Image path (required). |
| `number` | number / string | Figure number, shown as `Fig. N`. |
| `width` | string | CSS width, e.g. `'320px'` / `'70%'`. |
| `alt` | string | Alt text. |
| `flat` | boolean | Drop the frame (for transparent / full-bleed art). |
