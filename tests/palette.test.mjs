import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { resolvePalette, KET_PALETTES } from '../utils/palette.mjs'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const read = (rel) => readFileSync(join(root, rel), 'utf8')

const layoutCss = read('styles/layout.css')
const squircleCss = read('styles/squircle.css')
const setupMain = read('setup/main.ts')
const globalBottom = read('global-bottom.vue')
const paperCover = read('components/PaperCover.vue')
const coverDeco = read('layouts/cover-deco.vue')
const example = read('example.md')

/** Extract a brace-balanced CSS block by its exact selector line. */
function cssBlock(source, selector) {
  const opener = `${selector} {`
  const start = source.indexOf(opener)
  assert.ok(start !== -1, `selector not found: ${selector}`)
  const open = source.indexOf('{', start)
  let depth = 0
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth++
    else if (source[i] === '}') {
      depth--
      if (depth === 0) return source.slice(start, i + 1)
    }
  }
  assert.fail(`unbalanced block: ${selector}`)
}

const monoRoot = cssBlock(layoutCss, ':root')
const monoDark = cssBlock(layoutCss, '.dark')
const vividRoot = cssBlock(layoutCss, ":root[data-ket-palette='vivid']")
const vividDark = cssBlock(layoutCss, ".dark[data-ket-palette='vivid']")

/* ── Mode selection & fallback ── */

test('resolvePalette: only the literal vivid selects vivid; everything else falls back to mono', () => {
  assert.deepEqual(KET_PALETTES, ['mono', 'vivid'])
  assert.equal(resolvePalette('vivid'), 'vivid')
  assert.equal(resolvePalette('VIVID'), 'vivid')
  assert.equal(resolvePalette('  vivid  '), 'vivid')
  assert.equal(resolvePalette('mono'), 'mono')
  assert.equal(resolvePalette(undefined), 'mono')
  assert.equal(resolvePalette(null), 'mono')
  assert.equal(resolvePalette('neon'), 'mono')
  assert.equal(resolvePalette(42), 'mono')
})

test('setup/main.ts mirrors the resolved mode onto the root data attribute via reactive configs', () => {
  assert.ok(setupMain.includes('defineAppSetup'), 'must export defineAppSetup (setup files are awaited as functions)')
  assert.ok(setupMain.includes(`from '@slidev/client'`), 'must read the reactive configs export')
  assert.ok(setupMain.includes('resolvePalette('), 'must route through the pure resolver')
  assert.ok(setupMain.includes('dataset.ketPalette'), 'must write data-ket-palette on <html>')
  assert.ok(setupMain.includes('watchEffect'), 'must react to headmatter HMR without reload')
})

/* ── Key palette values: mono default, vivid restoration ── */

test('mono is the default :root palette (Ket Mono values)', () => {
  for (const v of [
    '--slidev-theme-primary: #5856D6',
    '--slidev-slide-container-background: #F5F5F7',
    '--ket-ac: #5856D6',
    '--ket-t1: #1D1D1F',
    '--ket-t2: #424245',
    '--ket-t3: #6E6E73',
    '--ket-surface-2: #F5F5F7',
    '--ket-border: #D2D2D7',
    '--ket-default-bg: #F3F2FC; --ket-default-lbl: #4D4BB7',
    '--ket-gradient-cover: linear-gradient(108deg, #1D1D1F 0%, #5856D6 68%, #0071E3 100%)',
    '--ket-code-dot-r: #D86A65',
    '--ket-on-accent: #F5F5F7',
    '--ket-kw-violet: #5856D6',
    '--ket-deco-accent: var(--ket-ac)',
  ]) {
    assert.ok(monoRoot.includes(v), `mono :root missing ${v}`)
  }
})

test('mono dark block carries the neutral dark ramp', () => {
  for (const v of [
    '--slidev-theme-primary: #7D7AFF',
    '--slidev-slide-container-background: #111113',
    '--ket-ac: #7D7AFF',
    '--ket-t1: #F5F5F7',
    '--ket-surface: #1C1C1E',
    '--ket-border-soft: #2C2C2E',
    '--ket-danger-bg:  rgba(255, 69, 58, 0.09);  --ket-danger-lbl:  #FF8A83',
    '--ket-code-dot-r: #C75F5A',
    '--ket-kw-danger: #FF8A83',
  ]) {
    assert.ok(monoDark.includes(v), `mono .dark missing ${v}`)
  }
})

test('vivid palette fully restores the original quantum-violet look', () => {
  for (const v of [
    '--slidev-theme-primary: #7229E8',
    '--slidev-slide-container-background: #F7F8FC',
    '--ket-ac: #7229E8',
    '--ket-ac-m: #8B3CF7',
    '--ket-ac-lt: #EDE9FE',
    '--ket-t1: #1B1840',
    '--ket-default-bg: #EDEAFF; --ket-default-lbl: #6D28D9',
    '--ket-gradient-cover: linear-gradient(135deg, #FF6F00 0%, #DE5471 25%, #A948C9 50%, #6553D8 75%, #1C73FF 100%)',
    '--ket-code-bg: #FAFAFA',
    '--ket-code-bar-bg: #F0F1F5',
    '--ket-code-dot-r: #D94F4A',
    '--ket-on-accent: #E6E3EB',
    '--ket-kw-violet: #7229E8',
    // Rose deco vector keeps its own token — NOT folded into danger label #BE123C.
    '--ket-deco-accent-alt: #E11D48',
  ]) {
    assert.ok(vividRoot.includes(v), `vivid :root missing ${v}`)
  }
  assert.equal(vividRoot.indexOf('--ket-deco-accent-alt: #E11D48') >= 0, true)
})

test('vivid dark block restores the indigo-black dark palette', () => {
  for (const v of [
    '--slidev-slide-container-background: #1B1726',
    '--ket-t1: #E8E6F0',
    '--ket-surface: #252134',
    '--ket-border: #3A3552',
    '--ket-ac-lt: rgba(139, 60, 247, 0.20)',
    '--ket-default-bg: rgba(139, 60, 247, 0.16); --ket-default-lbl: #C4B5FD',
    '--ket-code-bg: #20202B',
    '--ket-kw-violet: #A78BFA',
  ]) {
    assert.ok(vividDark.includes(v), `vivid .dark missing ${v}`)
  }
})

test('no original violet literals leak into the mono blocks', () => {
  const vividOnly = ['#7229E8', '#8B3CF7', '#EDE9FE', '#C4B5FD', '#1B1840', '#E6E3EB', '#FAFAFA', '#20202B', '#D94F4A', '#E11D48', '#F7F8FC', '#1B1726']
  for (const lit of vividOnly) {
    assert.ok(!monoRoot.includes(lit), `mono :root still contains ${lit}`)
    assert.ok(!monoDark.includes(lit), `mono .dark still contains ${lit}`)
  }
})

/* ── Structure: cascade order, canvas migration, parity ── */

test('palette block order keeps specificity sane: mono base, mono dark, vivid light, vivid dark last', () => {
  const iRoot = layoutCss.indexOf(':root {')
  const iDark = layoutCss.indexOf('.dark {')
  const iVivid = layoutCss.indexOf(":root[data-ket-palette='vivid'] {")
  const iVividDark = layoutCss.indexOf(".dark[data-ket-palette='vivid'] {")
  assert.ok(iRoot < iDark && iDark < iVivid && iVivid < iVividDark, 'block order broken')
})

test('the actual canvas background migrates: mono paints .slidev-layout, vivid stays transparent', () => {
  assert.ok(monoRoot.includes('--ket-canvas: var(--slidev-slide-container-background)'), 'mono must paint the layout canvas')
  assert.ok(vividRoot.includes('--ket-canvas: transparent'), 'vivid must keep the original transparent canvas')
  assert.ok(layoutCss.includes('background: var(--ket-canvas, transparent);'), '.slidev-layout must consume --ket-canvas')
  assert.ok(monoRoot.includes('--ket-section-bg: var(--slidev-slide-container-background)'))
  assert.ok(vividRoot.includes('--ket-section-bg: var(--ket-surface)'))
  assert.ok(layoutCss.includes('background: var(--ket-section-bg, var(--ket-surface)) !important'))
})

test('every palette token stays in sync across all four palette blocks', () => {
  const tokens = [
    'ket-ac', 'ket-ac-m', 'ket-ac-lt', 'ket-ac-bd',
    'ket-t1', 'ket-t2', 'ket-t3',
    'ket-surface', 'ket-surface-2', 'ket-border', 'ket-border-soft', 'ket-surface-shadow',
    'ket-default-bg', 'ket-default-lbl', 'ket-primary-bg', 'ket-primary-lbl',
    'ket-success-bg', 'ket-success-lbl', 'ket-warning-bg', 'ket-warning-lbl',
    'ket-danger-bg', 'ket-danger-lbl', 'ket-muted-bg', 'ket-muted-lbl',
    'ket-code-dot-r', 'ket-code-dot-y', 'ket-code-dot-g',
    'ket-on-accent',
    'ket-kw-danger', 'ket-kw-gold', 'ket-kw-blue', 'ket-kw-green', 'ket-kw-violet',
  ]
  for (const t of tokens) {
    const decl = `--${t}:`
    for (const [name, block] of [['mono :root', monoRoot], ['mono .dark', monoDark], ['vivid :root', vividRoot], ['vivid .dark', vividDark]]) {
      assert.ok(block.includes(decl), `${name} is missing --${t}`)
    }
  }
  // Code window fills: mono dark re-resolves through var(--ket-surface), so the
  // declaration lives in the light block only; vivid dark needs explicit literals.
  for (const t of ['ket-code-bg', 'ket-code-bar-bg']) {
    assert.ok(monoRoot.includes(`--${t}:`), `mono :root missing --${t}`)
    assert.ok(vividRoot.includes(`--${t}:`), `vivid :root missing --${t}`)
    assert.ok(vividDark.includes(`--${t}:`), `vivid .dark missing --${t} (explicit literal)`)
  }
  // Light-only tokens re-resolve through var() chains in dark, so they live
  // only in the two light blocks.
  for (const t of ['ket-canvas', 'ket-section-bg', 'ket-gradient-cover', 'ket-progress-fill', 'ket-progress-track', 'ket-deco-accent', 'ket-deco-accent-alt', 'ket-sec-num', 'ket-tag-border', 'ket-marker-nested', 'ket-code-bar-border']) {
    assert.ok(monoRoot.includes(`--${t}:`), `mono :root missing --${t}`)
    assert.ok(vividRoot.includes(`--${t}:`), `vivid :root missing --${t}`)
  }
})

/* ── Hardcoded colors now ride palette tokens ── */

test('code window chrome, step badge, kw-* and deco strokes consume palette tokens', () => {
  assert.ok(layoutCss.includes('radial-gradient(circle at 41px 50%, var(--ket-code-dot-y'), 'code dots must use tokens (geometry kept: 41/62px, 5.5px)')
  assert.ok(layoutCss.includes('background: var(--ket-code-bg, #FAFAFA) !important'))
  assert.ok(layoutCss.includes('.slidev-layout .kw-danger { color: var(--ket-kw-danger'))
  assert.ok(layoutCss.includes('.dark .slidev-layout .kw-violet { color: var(--ket-kw-violet'))
  assert.ok(layoutCss.includes('color: var(--ket-on-accent, #E6E3EB)'), 'step number text must be palette-driven')
  assert.ok(layoutCss.includes('color: var(--ket-sec-num'))
  assert.ok(layoutCss.includes('border: 1px solid var(--ket-tag-border'))

  // Decorations: attribute-form literals are gone; colors go through style vars.
  for (const src of [paperCover, coverDeco]) {
    assert.ok(!src.includes(`stroke: '#7229E8'`) && !src.includes(`fill: '#7229E8'`), 'violet SVG attribute literal must be tokenized')
    assert.ok(!src.includes(`stroke: '#E11D48'`) && !src.includes(`fill: '#E11D48'`), 'rose SVG attribute literal must be tokenized')
    assert.ok(src.includes('var(--ket-deco-accent'), 'deco strokes must reference the palette token')
    assert.ok(src.includes('var(--ket-deco-accent-alt'))
  }

  assert.ok(globalBottom.includes('var(--ket-progress-fill'), 'progress fill must be palette-driven')
  assert.ok(globalBottom.includes('var(--ket-progress-track'), 'progress track must be palette-driven')
})

test('surface shadow keeps ket geometry (0 2px 8px); only the tint is palette-driven', () => {
  assert.ok(squircleCss.includes('--ket-surface-shadow: 0 2px 8px rgba(0, 0, 0, 0.045)'), 'mono light shadow must stay single-layer neutral')
  assert.ok(squircleCss.includes('--ket-surface-shadow: 0 2px 8px rgba(0, 0, 0, 0.20)'), 'dark shadow geometry unchanged')
  assert.ok(vividRoot.includes('--ket-surface-shadow: 0 2px 8px rgba(27, 24, 64, 0.045)'), 'vivid restores the violet-tinted shadow')
})

/* ── Example deck: Pad naming + palette showcase, mono default ── */

test('example.md uses Pad exclusively and demonstrates the palette switch without opting into vivid', () => {
  assert.ok(!example.includes('Bra'), 'example.md must not mention the old Bra name')
  assert.ok(example.includes('<Pad'), 'example.md must use <Pad>')
  assert.ok(example.includes('themeConfig:'), 'example.md must show the themeConfig palette snippet')
  assert.ok(example.includes('palette: mono'), 'example.md must document mono as the default')
  assert.ok(example.includes('palette: vivid'), 'example.md must document the vivid opt-in')
  // The headmatter itself carries no palette key — mono is the default.
  const headmatter = example.slice(0, example.indexOf('\n---\n', 4))
  assert.ok(!/palette\s*:/.test(headmatter) || /palette\s*:\s*mono/.test(headmatter), 'example headmatter must not opt into vivid')
})
