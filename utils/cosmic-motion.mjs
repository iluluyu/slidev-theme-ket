/** Keep motion preference separate from quality and page visibility. */
export function motionEnabled(mode, reducedMotion, speed = 1) {
  return speed !== 0 && mode !== 'never' && (mode === 'always' || !reducedMotion)
}

/** Qualitative budgets: never supersample a software WebGL renderer. */
export function renderProfile(quality, rendererName = '', dpr = 1, maxFps = 30) {
  const software = /swiftshader|llvmpipe|softpipe|software|microsoft basic render/i.test(rendererName)
  const requested = Number.isFinite(maxFps) ? Math.max(1, Math.min(60, maxFps)) : 30
  const profile = software
    ? { stars: 1200, particles: 3000, pixelRatio: 1, scale: 0.6, distortionScale: 0.25, fps: 12 }
    : quality === 'low'
      ? { stars: 4000, particles: 8000, pixelRatio: 1, scale: 0.8, distortionScale: 0.35, fps: 24 }
      : quality === 'high'
        ? { stars: 40000, particles: 50000, pixelRatio: Math.min(Math.max(dpr, 1), 1.5), scale: 1.5, distortionScale: 0.5, fps: 30 }
        : { stars: 8000, particles: 14000, pixelRatio: 1, scale: 1, distortionScale: 0.4, fps: 30 }
  return { ...profile, software, fps: Math.min(profile.fps, requested) }
}

/**
 * A timeout gates RAFs: a 144 Hz screen must not run 144 callbacks per second.
 * Pausing cancels both handles; resuming starts with dt=0 (no hidden-time jump).
 * Browser dependencies are injected so lifecycle and timing are testable in Node.
 */
export function createFrameLoop({
  draw, canRender, canAnimate, fps,
  requestFrame = requestAnimationFrame, cancelFrame = cancelAnimationFrame,
  setTimer = setTimeout, clearTimer = clearTimeout, now = () => performance.now(),
}) {
  let frame = null, timer = null, previous = null, disposed = false, drawing = false
  const interval = () => 1000 / Math.max(1, fps())

  function pause() {
    if (frame !== null) cancelFrame(frame)
    if (timer !== null) clearTimer(timer)
    frame = timer = previous = null
  }

  function request() {
    if (!disposed && !drawing && frame === null && timer === null) frame = requestFrame(tick)
  }

  function tick(timestamp) {
    frame = null
    if (disposed || !canRender()) {
      previous = null
      return
    }
    const dt = previous === null ? 0 : Math.min(Math.max((timestamp - previous) / 1000, 0), 0.1)
    previous = timestamp
    drawing = true
    try { draw(canAnimate() ? dt : 0) }
    finally { drawing = false }
    if (disposed || !canRender() || !canAnimate()) {
      previous = null
      return
    }
    timer = setTimer(() => {
      timer = null
      if (canRender() && canAnimate()) request()
      else previous = null
    }, Math.max(0, interval() - (now() - timestamp)))
  }

  return {
    sync({ redraw = false } = {}) {
      if (disposed || drawing) return
      if (!canRender()) { pause(); return }
      if (!canAnimate()) {
        pause()
        if (redraw) request()
      } else request()
    },
    dispose() { disposed = true; pause() },
  }
}
