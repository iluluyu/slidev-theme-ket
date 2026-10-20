import test from 'node:test'
import assert from 'node:assert/strict'
import { after } from 'node:test'
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

// ── Location of the theme relative to this test file ──
const themeRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const componentsDir = join(themeRoot, 'components')
const padPath = join(componentsDir, 'Pad.vue')
const braPath = join(componentsDir, 'Bra.vue')

// ── Official entry: Pad exists, Bra is gone, nothing aliases it ──

test('official component entry is Pad.vue and Bra.vue is deleted', () => {
  assert.ok(existsSync(padPath), 'components/Pad.vue must exist')
  assert.equal(existsSync(braPath), false, 'components/Bra.vue must not exist')
  const names = readdirSync(componentsDir).filter(f => f.endsWith('.vue'))
  assert.equal(names.some(n => /^bra/i.test(n)), false, `no Bra-named component files: ${names.join(', ')}`)
})

test('no component forwards or registers the old Bra name', () => {
  const aliasRe = /\bBra\b|bra-|--bra|['"]Bra['"]/
  for (const name of readdirSync(componentsDir)) {
    if (!name.endsWith('.vue'))
      continue
    const src = readFileSync(join(componentsDir, name), 'utf8')
    assert.equal(aliasRe.test(src), false, `${name} still references the old Bra name`)
  }
})

test('Pad.vue keeps the full original prop API and pad-* class/variable names', () => {
  const src = readFileSync(padPath, 'utf8')
  // The original Bra API, preserved verbatim through the rename.
  for (const prop of ['type', 'title', 'customTitle', 'name', 'number', 'compact', 'inline', 'border',
    'italic', 'tone', 'color', 'bgColor', 'titleColor', 'borderColor'])
    assert.match(src, new RegExp(`\\b${prop}\\?:`), `props interface must keep '${prop}'`)
  // CSS classes and custom properties are fully renamed, no old names kept.
  assert.equal(/bra/i.test(src), false, 'Pad.vue must not contain the old bra name anywhere')
  for (const cls of ['pad-block', 'pad-header', 'pad-type', 'pad-number', 'pad-name', 'pad-dot',
    'pad-content', 'pad-compact', 'pad-inline', 'pad-border', 'pad-italic'])
    assert.ok(src.includes(cls), `missing class .${cls}`)
  for (const tone of ['default', 'primary', 'danger', 'warning', 'success', 'muted'])
    assert.ok(src.includes(`pad-tone-${tone}`), `missing tone class pad-tone-${tone}`)
  for (const v of ['--pad-color', '--pad-bg-color', '--pad-title-color', '--pad-border-color'])
    assert.ok(src.includes(v), `missing custom property ${v}`)
  // Tone palettes still read the theme tokens with their built-in fallbacks.
  for (const ket of ['--ket-default-bg', '--ket-primary-bg', '--ket-danger-bg', '--ket-warning-bg',
    '--ket-success-bg', '--ket-muted-bg', '--ket-default-lbl', '--ket-muted-lbl'])
    assert.ok(src.includes(ket), `tone fallback ${ket} must keep reading the shared token`)
})

// ── Runtime behaviour: compile Pad.vue and render it server-side ──
// vue is not a direct dependency of this theme (pnpm isolation), so resolve the
// runtime through @slidev/cli's dependency context — the same vue the theme
// actually runs on. The compiled module is written to a temp .mts file so
// Node's native type stripping can erase the <script setup lang="ts"> types.

const tmp = mkdtempSync(join(tmpdir(), 'ket-pad-test-'))
after(() => rmSync(tmp, { recursive: true, force: true }))

async function resolveVueRuntime() {
  const themeRequire = createRequire(join(themeRoot, 'package.json'))
  const cliRequire = createRequire(themeRequire.resolve('@slidev/cli/package.json'))
  const vueEntry = cliRequire.resolve('vue')
  const vueDir = new URL('.', pathToFileURL(vueEntry)).pathname
  const vueRequire = createRequire(join(vueDir, 'package.json'))
  return {
    vueEntry,
    compilerSfc: await import(pathToFileURL(join(vueDir, 'compiler-sfc', 'index.mjs')).href),
    serverRenderer: await import(pathToFileURL(vueRequire.resolve('@vue/server-renderer')).href),
  }
}

async function compileSfcComponent(relPath) {
  const { vueEntry, compilerSfc: { parse, compileScript, compileTemplate } } = await resolveVueRuntime()
  const filename = relPath.split('/').pop()
  const source = readFileSync(join(themeRoot, relPath), 'utf8')
  const { descriptor, errors } = parse(source, { filename })
  assert.equal(errors.length, 0, `SFC parse errors in ${filename}`)
  const id = 'data-v-ketpadtest'
  const script = compileScript(descriptor, { id, templateOptions: {} })
  const tpl = compileTemplate({
    source: descriptor.template.content,
    filename,
    id,
    scoped: true,
    compilerOptions: { bindingMetadata: script.bindings, mode: 'module' },
  })
  assert.equal(tpl.errors.length, 0, `template compile errors in ${filename}`)

  let code = script.content + '\n' + tpl.code.replace(/^export function render/m, 'function render')
  assert.match(code, /^export default\s+/m, 'compiled module must have a default export')
  code = code.replace(/^export default\s+/m, 'const __ket_default = ')
  code += '\n__ket_default.render = render\nexport default __ket_default\n'
  code = code.replace(/from (['"])vue\1/g, `from $1${pathToFileURL(vueEntry).href}$1`)
  code = code.replace(/from '\.\.\/utils\/renderInline'/,
    `from ${JSON.stringify(pathToFileURL(join(themeRoot, 'utils', 'renderInline.ts')).href)}`)
  assert.equal(/bra/i.test(code), false, 'compiled module still mentions the old bra name')

  const file = join(tmp, filename.replace(/\.vue$/, '') + `.${process.pid}.mts`)
  writeFileSync(file, code)
  return (await import(pathToFileURL(file).href)).default
}

const Pad = await compileSfcComponent('components/Pad.vue')

async function renderPad(props, slot) {
  const { vueEntry, serverRenderer: { renderToString } } = await resolveVueRuntime()
  const { h } = await import(pathToFileURL(vueEntry).href)
  const html = await renderToString(h(Pad, props, slot ? { default: slot } : undefined))
  assert.equal(/bra-/i.test(html), false, 'rendered markup must not contain old bra-* classes')
  return html
}

const rendersRoot = html => {
  assert.match(html, /class="pad-block pad-tone-[a-z]+"/)
  return html
}

test('type presets render labels and the type→tone map stays intact', async () => {
  const map = [
    ['theorem', 'pad-tone-default', 'Theorem'],
    ['proposition', 'pad-tone-default', 'Proposition'],
    ['claim', 'pad-tone-default', 'Claim'],
    ['definition', 'pad-tone-primary', 'Definition'],
    ['example', 'pad-tone-primary', 'Example'],
    ['lemma', 'pad-tone-success', 'Lemma'],
    ['protocol', 'pad-tone-success', 'Protocol'],
    ['remark', 'pad-tone-warning', 'Remark'],
    ['note', 'pad-tone-warning', 'Note'],
    ['assumption', 'pad-tone-warning', 'Assumption'],
    ['corollary', 'pad-tone-danger', 'Corollary'],
    ['question', 'pad-tone-danger', 'Question'],
    ['proof', 'pad-tone-muted', 'Proof'],
  ]
  for (const [type, tone, label] of map) {
    const html = rendersRoot(await renderPad({ type }, () => 'body'))
    assert.match(html, new RegExp(`class="pad-block ${tone}"`), `type=${type} must map to ${tone}`)
    assert.ok(html.includes(`>${label}<`), `type=${type} must render the "${label}" label`)
  }
})

test('unknown type passes the raw label through', async () => {
  const html = rendersRoot(await renderPad({ type: 'Conjecture' }, () => 'body'))
  assert.ok(html.includes('>Conjecture<'))
  assert.match(html, /class="pad-block pad-tone-default"/)
})

test('explicit tone overrides the type map; unknown tones fall back; tone is case-insensitive', async () => {
  assert.match(rendersRoot(await renderPad({ type: 'corollary', tone: 'success' }, () => 'x')),
    /class="pad-block pad-tone-success"/)
  assert.match(rendersRoot(await renderPad({ tone: 'neon' }, () => 'x')),
    /class="pad-block pad-tone-default"/)
  assert.match(rendersRoot(await renderPad({ tone: 'DANGER' }, () => 'x')),
    /class="pad-block pad-tone-danger"/)
})

test('title, name, number and header parts render in order with the trailing dot', async () => {
  const html = rendersRoot(await renderPad({ type: 'theorem', name: 'No-Cloning', number: 1 }, () => 'body'))
  const header = html.slice(html.indexOf('pad-header'), html.indexOf('pad-content'))
  assert.ok(header.includes('>Theorem<'))
  assert.ok(header.includes('>1<'))
  assert.ok(header.includes('(No-Cloning)'))
  assert.match(header, /pad-dot">\.<\/span>/)
  const order = ['Theorem', '1', '(No-Cloning)', '.'].map(s => header.indexOf(s))
  assert.deepEqual(order, [...order].sort((a, b) => a - b), 'header parts must render in order')
})

test('custom title wins over customTitle compat prop, which wins over type label', async () => {
  assert.ok((await renderPad({ title: 'Key Lemma', customTitle: 'Ignored', type: 'theorem' }, () => 'x')).includes('>Key Lemma<'))
  assert.ok((await renderPad({ customTitle: 'Compat Title', type: 'theorem' }, () => 'x')).includes('>Compat Title<'))
})

test('title renders inline markdown and math exactly like slot content', async () => {
  const html = rendersRoot(await renderPad({ title: '**Bold** and $H^\\perp$' }, () => 'body'))
  assert.ok(html.includes('<strong>Bold</strong>'))
  assert.ok(html.includes('class="katex"'), 'KaTeX must render the title math')
  assert.ok(html.includes('H^\\perp'), 'KaTeX annotation keeps the LaTeX source')
})

test('default slot content renders inside pad-content', async () => {
  const html = rendersRoot(await renderPad({ title: 'T' }, () => ['<p>slot body</p>']))
  assert.match(html, /<div class="pad-content">/)
  assert.ok(html.includes('slot body'))
})

test('header is omitted entirely when there is no title, name or number', async () => {
  const html = rendersRoot(await renderPad({}, () => 'body'))
  assert.equal(html.includes('pad-header'), false)
})

test('compact and legacy inline props both select the tight one-line variant', async () => {
  const compact = await renderPad({ type: 'theorem', compact: true }, () => 'body')
  assert.match(compact, /pad-compact/)
  assert.match(compact, /pad-inline/)
  // withDefaults declares compact: undefined, so the Boolean-cast default
  // (false) does not shadow the legacy inline prop in compact ?? inline ?? false.
  const bareInline = await renderPad({ type: 'theorem', inline: true }, () => 'body')
  assert.match(bareInline, /pad-compact/)
  assert.match(bareInline, /pad-inline/)
  // An explicit :compact="false" still wins over inline: true.
  const forcedOff = await renderPad({ compact: false, inline: true }, () => 'body')
  assert.equal(/pad-compact/.test(forcedOff), false)
  assert.equal(/pad-inline/.test(forcedOff), false)
})

test('border and italic flags set their variant classes', async () => {
  const html = await renderPad({ type: 'theorem', border: true, italic: true }, () => 'body')
  assert.match(html, /pad-border/)
  assert.match(html, /pad-italic/)
})

test('color props become --pad-* custom properties; borderColor falls back to bgColor', async () => {
  const html = await renderPad({ color: '#112233', bgColor: '#EEFFEE', titleColor: '#445566' }, () => 'x')
  assert.ok(html.includes('--pad-color:#112233'))
  assert.ok(html.includes('--pad-bg-color:#EEFFEE'))
  assert.ok(html.includes('--pad-title-color:#445566'))
  assert.ok(html.includes('--pad-border-color:#EEFFEE'), 'borderColor must default to bgColor')
  const explicit = await renderPad({ borderColor: '#010101' }, () => 'x')
  assert.ok(explicit.includes('--pad-border-color:#010101'))
  const none = await renderPad({}, () => 'x')
  assert.equal(/--pad-[a-z-]+:/.test(none), false, 'no custom properties without color props')
})
