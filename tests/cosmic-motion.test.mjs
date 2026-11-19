import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createFrameLoop, motionEnabled, renderProfile, renderResolution } from '../utils/cosmic-motion.mjs'

const resolution = (profile, scale, dpr) => renderResolution(profile, scale, dpr, 976, 549)

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

test('software budgets preserve a native-size low mode and cap high quality', () => {
  const soft = renderProfile('high', 'ANGLE SwiftShader', 60)
  assert.equal(soft.fps, 24)
  assert.deepEqual(resolution(soft, 2, 3), { output: 2, scene: 2, lens: 1.5, supersample: false })
  const auto = renderProfile('auto', 'ANGLE SwiftShader')
  assert.equal(resolution(auto, 2, 3).output, 1.5)
  assert.equal(soft.stars, auto.stars)
  const low = renderProfile('low', 'llvmpipe', 10)
  assert.equal(low.fps, 10)
  assert.deepEqual(resolution(low, 2, 3), { output: 1, scene: 1, lens: 0.35, supersample: false })
  assert.ok(soft.stars > low.stars)
})

test('hardware resolution follows Slidev scale and DPR but is capped per quality tier', () => {
  const auto = renderProfile('auto', 'NVIDIA', NaN)
  assert.equal(auto.fps, 30)
  assert.equal(resolution(auto, 1.5, 1).output, 1.5)
  assert.equal(resolution(auto, 0.75, 2).output, 1.5)
  assert.equal(resolution(auto, 1.5, 2).output, 2)
  const low = renderProfile('low', 'NVIDIA')
  assert.equal(resolution(low, 1.5, 2).output, 1.25)
  const high = renderProfile('high', 'NVIDIA')
  assert.equal(high.stars, auto.stars, 'high changes sampling, not the look of the sky')
  assert.ok(auto.stars > low.stars)
})

test('hardware high supports native UHD and supersamples 1080p and 1440p', () => {
  const high = renderProfile('high', 'NVIDIA')
  const fit = width => resolution(high, width / 976, 1)
  assert.deepEqual(fit(976), { output: 1, scene: 2, lens: 2, supersample: true })
  assert.equal(fit(1920).supersample, true)
  assert.equal(fit(2560).supersample, true)
  assert.equal(Math.round(976 * fit(3840).output), 3840)
  assert.equal(fit(3840).supersample, false)
  assert.ok(renderResolution(high, 8, 2, 1920, 1080).output ** 2 * 1920 * 1080 <= 8_400_001)
  assert.equal(renderResolution(high, 2, 2, 1920, 1080, 2048).scene * 1920, 2048)
})

test('the lens keeps the upper arc and blends the foreground across the join', () => {
  const source = readFileSync(new URL('../components/CosmicBackground.vue', import.meta.url), 'utf8')
  assert.match(source, /const distortionTarget = new THREE\.WebGLRenderTarget\([^\n]+\{\s*(?:\/\/[^\n]+\n\s*)?depthBuffer: true,/)
  assert.match(source, /float front=smoothstep\([^;]+dot\(vWorld,uLensNormal\)\);/)
  assert.match(source, /fragColor=vec4\(s,0\.0,0\.0,alpha\*front\)/)
  assert.match(source, /mesh\.renderOrder = 1/)
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
