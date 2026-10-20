import test from 'node:test'
import assert from 'node:assert/strict'
import { createFrameLoop, motionEnabled, renderProfile } from '../utils/cosmic-motion.mjs'

function fixture() {
  let clock = 0, nextId = 1, visible = true, moving = true, fps = 30
  const frames = new Map(), timers = new Map(), drawn = []
  let onDraw = () => {}
  const loop = createFrameLoop({
    draw: dt => { drawn.push(dt); onDraw() },
    canRender: () => visible, canAnimate: () => moving, fps: () => fps,
    requestFrame: fn => { const id = nextId++; frames.set(id, fn); return id },
    cancelFrame: id => frames.delete(id),
    setTimer: (fn, delay) => { const id = nextId++; timers.set(id, { fn, time: clock + delay }); return id },
    clearTimer: id => timers.delete(id), now: () => clock,
  })
  return {
    loop, frames, timers, drawn,
    visible(value) { visible = value }, moving(value) { moving = value }, fps(value) { fps = value },
    onDraw(fn) { onDraw = fn },
    frame(time) {
      clock = time
      const callbacks = [...frames.values()]
      frames.clear()
      callbacks.forEach(fn => fn(time))
    },
    timer(time) {
      clock = time
      for (const [id, entry] of [...timers]) {
        if (entry.time <= time) { timers.delete(id); entry.fn() }
      }
    },
  }
}

test('auto respects reduced motion; explicit always overrides it; never/zero speed stop', () => {
  assert.equal(motionEnabled('auto', true), false)
  assert.equal(motionEnabled('auto', false), true)
  assert.equal(motionEnabled('always', true), true)
  assert.equal(motionEnabled('never', false), false)
  assert.equal(motionEnabled('always', false, 0), false)
})

test('software renderer caps even high quality, and auto caps high DPI', () => {
  const soft = renderProfile('high', 'ANGLE SwiftShader', 3, 60)
  assert.equal(soft.pixelRatio, 1)
  assert.equal(soft.fps, 12)
  assert.equal(soft.scale, 0.6)
  assert.ok(soft.particles < 50000)
  assert.equal(renderProfile('auto', 'NVIDIA', 3).pixelRatio, 1)
  assert.equal(renderProfile('low', 'NVIDIA', 1, 10).fps, 10)
  assert.equal(renderProfile('auto', 'NVIDIA', 1, NaN).fps, 30)
})

test('30 FPS scheduler uses a timer instead of spinning RAF at display frequency', () => {
  const f = fixture()
  f.loop.sync()
  f.frame(0)
  assert.equal(f.frames.size, 0)
  assert.equal(f.timers.size, 1)
  f.frame(7)
  f.frame(14)
  assert.equal(f.drawn.length, 1)
  f.timer(34)
  f.frame(34)
  assert.equal(f.drawn.length, 2)
  assert.equal(f.drawn[1], 0.034)
})

test('leaving slide, overview or hiding tab cancels both pending handle types', () => {
  const f = fixture()
  f.loop.sync()
  f.visible(false)
  f.loop.sync()
  assert.equal(f.frames.size, 0)
  f.visible(true)
  f.loop.sync()
  f.frame(0)
  f.visible(false)
  f.loop.sync()
  assert.equal(f.timers.size, 0)
  f.timer(5000)
  f.frame(5000)
  assert.equal(f.drawn.length, 1)
})

test('resume does not advance animation by time spent hidden', () => {
  const f = fixture()
  f.loop.sync(); f.frame(0)
  f.timer(34); f.frame(34)
  f.visible(false); f.loop.sync()
  f.visible(true); f.loop.sync(); f.frame(10000)
  assert.equal(f.drawn.at(-1), 0)
  f.timer(10034); f.frame(10034)
  assert.equal(f.drawn.at(-1), 0.034)
})

test('static redraw draws one frame but never leaves a running loop', () => {
  const f = fixture()
  f.moving(false)
  f.loop.sync()
  assert.equal(f.frames.size, 0)
  f.loop.sync({ redraw: true }); f.frame(0)
  assert.deepEqual(f.drawn, [0])
  assert.equal(f.timers.size, 0)
  assert.equal(f.frames.size, 0)
})

test('control change emitted during draw cannot start a duplicate loop', () => {
  const f = fixture()
  f.onDraw(() => f.loop.sync({ redraw: true }))
  f.loop.sync(); f.frame(0)
  assert.equal(f.frames.size, 0)
  assert.equal(f.timers.size, 1)
})

test('disposed loops cannot restart or redraw', () => {
  const f = fixture()
  f.loop.sync(); f.frame(0)
  f.loop.dispose()
  f.loop.sync({ redraw: true })
  f.timer(1000); f.frame(1000)
  assert.equal(f.drawn.length, 1)
  assert.equal(f.frames.size + f.timers.size, 0)
})
