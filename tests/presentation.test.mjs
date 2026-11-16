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

test('both standard and two-column title rules are full-width 1px hairlines', () => {
  const rules = [...css.matchAll(/> h1:first-child::after\s*\{([^}]+)\}/g)]
  assert.equal(rules.length, 2)
  for (const [, rule] of rules) {
    assert.match(rule, /width: 100%/)
    assert.match(rule, /height: 1px/)
    assert.match(rule, /background: var\(--ket-border\)/)
    assert.doesNotMatch(rule, /gradient/)
  }
})
