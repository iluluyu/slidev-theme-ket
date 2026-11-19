# slidev-theme-ket

[![NPM version](https://img.shields.io/npm/v/slidev-theme-ket?color=3AB9D4&label=)](https://www.npmjs.com/package/slidev-theme-ket)

An academic theme for [Slidev](https://sli.dev) — built for talks with theorems,
definitions, and math.

![Ket preview](./assets/preview.png)

## Highlights

- `Pad` theorem / definition / note blocks with semantic tones
- Five cover variants: `cover`, `cover-deco`, cosmic `cover-cosmic` (Three.js black hole), centered `PaperCover`, deco `PaperCover`
- `Figure` component for referenced images with Markdown captions
- `XCard` / `XFan` — tweet-style evidence cards that fan out with click reveals
- Emphasis utilities: `kw-*` keyword tones, `claim`, `lead-slot` (dark-mode ready)
- Layouts for every talk beat: cover, section, two-column, thanks
- Two switchable palettes — calm `mono` (default) and the original `vivid` look — via `themeConfig.palette`, both dark-mode ready
- Geist typography, self-hosted (no runtime font requests)

## Preview locally

```bash
pnpm install
pnpm dev      # → http://localhost:3030
```

`pnpm test` checks the theme; `pnpm build` builds the showcase.

## Use in a deck

Requires Node.js 22.12+ and Slidev 53. Install the theme in the deck's project:

```sh
pnpm add slidev-theme-ket
```

Then set the theme in the deck's headmatter:

```yaml
---
theme: ket
---
```

For local development, point at this directory:

```yaml
---
theme: ../../slidev-theme-ket
---
```

### Palette

Two color palettes ship in the theme, switched globally from deck headmatter:

```yaml
---
theme: ../../slidev-theme-ket
themeConfig:
  palette: mono    # default — may be omitted; `vivid` restores the original colors
---
```

- `mono` (default) — neutral gray surfaces with a single indigo focus color
  and clearly visible, restrained semantic fills;
  merged from the retired `slidev-theme-ket-mono` variant; its separate
  submodule has been removed.
- `vivid` — the original ket look: parchment ground, deep indigo text,
  quantum-violet accent.

The switch is deck-global (no per-slide palette) and recolors tokens only —
layout sizes and the component API are identical; light and dark mode are
both supported. Cover gradients can be selected independently with
`themeConfig.coverGradient: mono | vivid` (omitted/invalid follows `palette`).
Use `palette: mono` with `coverGradient: vivid` for a bright cover and calm
body colors. Both gradients have been redesigned: warm clay-to-steel-blue
for mono; orange-pink-violet-blue for vivid. `gradient: true/false` still toggles
the effect per slide.

Migrating older decks:

- On `slidev-theme-ket-mono`: point `theme:` at `../../slidev-theme-ket` —
  the mono look is the default now.
- Wanting the previous violet look: set `palette: vivid`.
- Still using `<Bra …>` tags: rename them to `<Pad …>` — the theorem block
  component is `Pad` only.

### Canvas frame

Set an optional deck-wide frame in the headmatter:

```yaml
themeConfig:
  canvasFrame: 2
```

The number sets the stroke width in slide pixels (try `1` or `2`, capped
at `6`). Omit it or set it to `0` to turn it off. The frame sits 4 slide pixels
inside the canvas edge and uses a translucent palette accent and shared squircle corners,
without changing layout or clipping content. The showcase enables it for preview; if left enabled in a deck,
it also appears in presentation and exported slides.

## Design system

Ket spends color deliberately: neutral surfaces carry the hierarchy, one
focus color marks emphasis, and semantic color appears only when it carries
meaning — each `Pad` tone maps to a role. The default `mono` palette:

![Theorem blocks](./assets/components.png)

| Token | mono (default) | Role |
| --- | --- | --- |
| `--ket-ac` | `#4F4BD8` | Indigo focus accent |
| `--ket-t1` | `#1D1D1F` | Primary text |
| `--ket-t2` | `#35353A` | Body text |
| `--ket-t3` | `#62626A` | Captions |

`palette: vivid` restores the original violet ramp (`--ket-ac: #7229E8`,
`--ket-t1: #1B1840`, …).

Full tables for both palettes, both modes, and the global chrome:
[docs/design-tokens.md](./docs/design-tokens.md).

## Components

### `Pad`

Academic theorem and note block (formerly `Bra`; older decks must rename
their tags).

```vue
<Pad type="theorem" name="No-Cloning" :number="1">

There is no unitary $U$ that clones every state $|\psi\rangle$.

</Pad>
```

Common props:

- `type`: `theorem`, `lemma`, `proof`, `definition`, `corollary`, `question`, `assumption`, `protocol`
- `title`, `name`, `number`
- `tone`: `default`, `primary`, `success`, `warning`, `danger`, `muted`
- `compact`, `border`, `pure`, `italic`
- `color`, `bg-color`, `title-color`, `border-color`

Use `<Pad pure>` for a clean block without background, border, or shadow;
semantic emphasis colors remain. Add `compact` independently for a compact
layout. `pure` takes precedence over `border`; default blocks are unchanged.
See [Pure mode](./docs/components.md#pure-mode) for examples and precedence.

### `PaperCover`

Academic paper cover — title, authors, affiliations, optional decoration.

```vue
<PaperCover
  deco
  title="Exponential Speedup in Measurement Property Learning"
  :authors="[['Z. Liu', '1'], ['Q. Ye', '1,2']]"
  :affiliations="[['1', 'Tsinghua University'], ['2', 'Shanghai Qi Zhi']]"
/>
```

### `Figure`

Referenced image with a figure number and Markdown caption.

```vue
<Figure src="/figures/bloch-sphere.svg" :number="1" width="70%">

**Bloch sphere** — pure states $|\psi\rangle$ lie on the unit sphere.

</Figure>
```

Full props, the `type → tone` map, and compatibility notes: [docs/components.md](./docs/components.md).

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

Useful frontmatter:

- `gradient: true` — gradient title fill
- `tag` — eyebrow label on `cover-deco`
- `sectionNumber` / `tags` — on `section`
- `cols` — column ratio on `two-cols-header`
- `hideFooter: true` — hide the page counter

Full usage and slots: [docs/layouts.md](./docs/layouts.md).

## License

Theme code: [MIT](./LICENSE). Bundled fonts use SIL Open Font License 1.1: [Inter](./styles/fonts/Inter-OFL.txt), [JetBrains Mono](./styles/fonts/JetBrainsMono-OFL.txt), and [Geist / Geist Mono](./styles/fonts/Geist-OFL.txt).
