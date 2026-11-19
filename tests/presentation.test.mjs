import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const css = readFileSync(new URL('../styles/layout.css', import.meta.url), 'utf8')
const lists = css.slice(css.indexOf('Lists — quiet native markers'), css.indexOf('/* Body paragraph tier */'))

test('lists use native outside markers and hanging logical indentation', () => {
  assert.match(lists, /list-style-position: outside/)
  assert.match(lists, /padding-inline-start: 1\.3em/)
  assert.match(lists, /padding-inline-start: 1\.8em/)
  assert.doesNotMatch(lists, /font-size: 1\.(?:15|05)em/)
})

test('unordered lists keep small squares with depth-specific marker colors', () => {
  assert.match(lists, /\.slidev-layout ul\s*\{\s*list-style-type: square;/)
  assert.doesNotMatch(lists, /list-style-type: (?:disc|circle);/)
  assert.match(lists, /color: var\(--ket-ac\)/)
  assert.match(lists, /:is\(ul, ol\) ul > li::marker\s*\{\s*color: var\(--ket-marker-l2\)/)
  assert.match(lists, /:is\(ul, ol\) :is\(ul, ol\) ul > li::marker\s*\{\s*color: var\(--ket-t3\)/)
  assert.match(lists, /:is\(ul, ol\) ol > li::marker/)
  assert.doesNotMatch(lists, /:is\(ul, ol\) :is\(ul, ol\) > li::marker/)
})

test('mixed nesting and loose paragraphs share a consistent rhythm', () => {
  assert.match(lists, /:is\(ul, ol\) > li > p/)
  assert.match(lists, /ol:not\(\[type\]\)/)
  assert.match(lists, /list-style-type: lower-alpha/)
  assert.match(lists, /list-style-type: lower-roman/)
  assert.match(lists, /--ket-marker-nested/)
})

test('text comparisons are undecorated, flexible, and safe for long content', () => {
  const comparison = css.slice(css.indexOf('Lightweight, repeatable comparisons'), css.indexOf('/* Steps / badges'))
  assert.match(comparison, /grid-template-columns: var\(--ket-compare-columns, minmax\(0, 1fr\) minmax\(0, 1fr\)\)/)
  assert.match(comparison, /\.ket-compare > \*\s*\{\s*min-width: 0/)
  assert.match(comparison, /\.ket-compare-label\s*\{\s*color: var\(--ket-t1\)/)
  assert.doesNotMatch(comparison, /background:|border:|box-shadow:/)
})

test('standard and two-column titles render no divider under the heading', () => {
  // The full-width 1px hairline under content-page and two-cols-header titles
  // was removed; no h1 ::after rule may reintroduce a divider.
  assert.equal([...css.matchAll(/> h1:first-child::after\s*\{[^}]*\}/g)].length, 0)
  assert.doesNotMatch(css, /h1:first-child::after[\s\S]{0,120}--ket-border/)
})
