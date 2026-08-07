# slidev-theme-ket

[![NPM version](https://img.shields.io/npm/v/slidev-theme-ket?color=3AB9D4&label=)](https://www.npmjs.com/package/slidev-theme-ket)

An academic theme for [Slidev](https://sli.dev) — built for talks with theorems,
definitions, and math. Features `Bra` theorem blocks, four cover variants, a
quantum dot-grid background, semantic six-color boxes, and Geist typography.

## Highlights

- `Bra` theorem / definition / note blocks with semantic tones
- Four cover variants: `cover`, `cover-deco`, centered `PaperCover`, deco `PaperCover`
- `Figure` component with framed image, figure number, and Markdown caption
- Layouts for every talk beat: cover, section, two-column, thanks
- Quantum dot-grid background that recolors in dark mode
- Geist typography, self-hosted (no runtime font requests)

## Preview locally

```bash
pnpm install
pnpm dev      # → http://localhost:3030
```

The included `example.md` is the visual and formula showcase. Build it with
`pnpm build`, or capture a PNG with `pnpm screenshot`.

## Use in a deck

Add the theme to your frontmatter — Slidev prompts to install it automatically:

```yaml
---
theme: ket
---
```

During local development, point at this directory instead:

```yaml
---
theme: ../../slidev-theme-ket
---
```

## Layouts

| Layout | Purpose |
| --- | --- |
| `cover` | Centered title with presenter metadata |
| `cover-deco` | Left-aligned title with orbit / custom decoration |
| `intro` | Quiet centered interlude |
| `section` | Numbered section divider with tags |
| `default` | Standard content slide |
| `two-cols-header` | Full-width heading above two adjustable columns |
| `thanks` | Closing slide |

Useful frontmatter: `gradient: true` (gradient title fill), `tag` (eyebrow label
on `cover-deco`), `sectionNumber` / `tags` (on `section`), `cols` (column ratio
on `two-cols-header`), `hideFooter: true` (hide the page counter).

Full usage, slots, and examples: [docs/layouts.md](./docs/layouts.md).

## Components

### `Bra`

Theorem / definition / note block. Filled semantic background by default;
`:border="true"` for the outlined variant.

```vue
<Bra type="theorem" name="No-Cloning" :number="1">

There is no unitary $U$ that clones every state $|\psi\rangle$.

</Bra>
```

Common props: `title`, `type`, `name`, `number`, `tone`, `compact`, `border`,
`italic`, and low-level `color` / `bg-color` / `title-color` / `border-color`.

### `PaperCover`

Academic paper cover — title, author list, affiliations, and an optional
two-column Bloch-sphere decoration (`deco`).

```vue
<PaperCover
  deco
  title="Exponential Speedup in Measurement Property Learning"
  :authors="[['Z. Liu', '1'], ['Q. Ye', '1,2']]"
  :affiliations="[['1', 'Tsinghua University'], ['2', 'Shanghai Qi Zhi']]"
/>
```

### `Figure`

Framed image with an optional figure number and Markdown caption.

```vue
<Figure src="/figures/bloch-sphere.svg" :number="1" width="70%">

**Bloch sphere** — pure states $|\psi\rangle$ lie on the unit sphere.

</Figure>
```

Full props, the `type → tone` map, and compatibility notes:
[docs/components.md](./docs/components.md).

## Design system

A light parchment ground with a quantum dot-grid overlay, deep indigo text in
three tiers, and a quantum-violet accent (`#7229E8`). All tokens are CSS custom
properties on `:root`.

| Token | Value | Role |
| --- | --- | --- |
| `--ket-ac` | `#7229E8` | Violet accent |
| `--ket-t1` / `--ket-t2` / `--ket-t3` | `#1B1840` / `#46426E` / `#8E8BAD` | Indigo text tiers |

`global-bottom.vue` adds a right-bottom page counter and a top progress bar;
hide the counter with `hideFooter: true`.

Full token tables, dot-grid tuning, and global chrome: [docs/design-tokens.md](./docs/design-tokens.md).

## License

[MIT](./LICENSE)
