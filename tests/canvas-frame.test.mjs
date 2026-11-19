import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveCanvasFrame } from '../utils/canvas-frame.mjs'

test('the canvas frame is off by default and rejects invalid widths', () => {
  for (const value of [undefined, null, false, true, 0, -1, NaN, Infinity, '2', {}])
    assert.equal(resolveCanvasFrame(value), 0)
})

test('the canvas frame accepts fractional slide pixels and caps wide strokes', () => {
  assert.equal(resolveCanvasFrame(1.5), 1.5)
  assert.equal(resolveCanvasFrame(2), 2)
  assert.equal(resolveCanvasFrame(6), 6)
  assert.equal(resolveCanvasFrame(20), 6)
})
