import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const css = readFileSync(new URL('../styles/layout.css', import.meta.url), 'utf8')

function tokens(selector) {
  const start = css.indexOf(`${selector} {`)
  assert.ok(start >= 0, `missing ${selector}`)
  const block = css.slice(start, css.indexOf('\n}', start))
  return Object.fromEntries([...block.matchAll(/(--[\w-]+):\s*([^;]+);/g)]
    .map(([, name, value]) => [name, value.replace(/\s*!important$/, '')]))
}

function rgb(value) {
  if (value.startsWith('#')) {
    return [1, 3, 5].map(i => parseInt(value.slice(i, i + 2), 16))
  }
  const match = value.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/)
  assert.ok(match, `unsupported color ${value}`)
  return match.slice(1).map(Number)
}

function paint(foreground, background) {
  const alpha = foreground[3] ?? 1
  return foreground.slice(0, 3).map((channel, i) => channel * alpha + background[i] * (1 - alpha))
}

function luminance(color) {
  const linear = color.map(channel => {
    const s = channel / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722
}

function contrast(a, b) {
  const [low, high] = [luminance(a), luminance(b)].sort((x, y) => x - y)
  return (high + 0.05) / (low + 0.05)
}

const light = tokens(':root')
const dark = { ...light, ...tokens('.dark') }
const tones = ['default', 'primary', 'success', 'warning', 'danger', 'muted']

// Sample the entire sRGB interpolation, not just the gradient stops: the
// darkest midpoint can have less contrast than either end on dark slides.
test('both title gradients retain 3:1 large-text contrast across both palettes and modes', () => {
  const grounds = ['#F5F5F7', '#111113', '#F7F8FC', '#1B1726'].map(rgb)
  for (const name of ['mono', 'vivid']) {
    const gradient = light[`--ket-gradient-cover-${name}`]
    const stops = [...gradient.matchAll(/(#[0-9A-F]{6})\s+(\d+)%/g)]
      .map(([, color, position]) => ({ color: rgb(color), position: Number(position) }))
    assert.ok(stops.length >= 4)
    for (let i = 1; i < stops.length; i++) {
      for (let step = 0; step <= 100; step++) {
        const mix = step / 100
        const sample = stops[i - 1].color.map((channel, j) =>
          channel * (1 - mix) + stops[i].color[j] * mix)
        for (const ground of grounds) {
          const ratio = contrast(sample, ground)
          assert.ok(ratio >= 3, `${name} stop ${i}, ${step}%: ${ratio.toFixed(2)}:1`)
        }
      }
    }
  }
})

for (const [mode, palette] of [['light', light], ['dark', dark]]) {
  test(`mono ${mode}: body and semantic labels retain 4.5:1 contrast`, () => {
    for (const ground of ['--slidev-slide-container-background', '--ket-surface']) {
      const canvas = rgb(palette[ground])
      for (const tone of tones) {
        const fill = paint(rgb(palette[`--ket-${tone}-bg`]), canvas)
        for (const text of ['--ket-t1', `--ket-${tone}-lbl`]) {
          const ratio = contrast(rgb(palette[text]), fill)
          assert.ok(ratio >= 4.5, `${mode}/${ground}/${tone}/${text}: ${ratio.toFixed(2)}:1`)
        }
      }
      for (const text of ['--ket-t1', '--ket-t2', '--ket-t3', '--ket-ac',
        '--ket-kw-danger', '--ket-kw-gold', '--ket-kw-blue', '--ket-kw-green', '--ket-kw-violet']) {
        const ratio = contrast(rgb(palette[text]), canvas)
        assert.ok(ratio >= 4.5, `${mode}/${ground}/${text}: ${ratio.toFixed(2)}:1`)
      }
    }
  })

  test(`mono ${mode}: step numbers retain 4.5:1 contrast on the accent`, () => {
    const ratio = contrast(rgb(palette['--ket-on-accent']), rgb(palette['--ket-ac']))
    assert.ok(ratio >= 4.5, `${mode} step number contrast: ${ratio.toFixed(2)}:1`)
  })
}
