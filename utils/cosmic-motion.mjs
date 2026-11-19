/** Keep motion preference separate from quality and page visibility. */
export function motionEnabled(mode, reducedMotion, speed = 1) {
  return speed !== 0 && mode !== 'never' && (mode === 'always' || !reducedMotion)
}

/** Pixel ratios are relative to authored Slidev pixels; all profiles bound fill cost. */
export function renderProfile(quality, rendererName = '', maxFps = 30) {
  const software = /swiftshader|llvmpipe|softpipe|software|microsoft basic render/i.test(rendererName)
  const requested = Number.isFinite(maxFps) ? Math.max(1, Math.min(60, maxFps)) : 30
  const profile = software
    ? quality === 'low'
      ? { stars: 480, maxRatio: 1, minSceneRatio: 1, lensFraction: 0.35, fps: 24 }
      : { stars: 1050, maxRatio: quality === 'high' ? 2 : 1.5, minSceneRatio: 1, lensFraction: quality === 'high' ? 0.75 : 0.46, fps: 24 }
    : quality === 'low'
      ? { stars: 480, maxRatio: 1.25, minSceneRatio: 1.25, lensFraction: 0.32, fps: 24 }
      : quality === 'high'
        ? { stars: 1050, maxRatio: 4, minSceneRatio: 2, lensFraction: 1, maxPixels: 8_400_000, antialias: true, fps: 30 }
        : { stars: 1050, maxRatio: 2, minSceneRatio: 1.25, lensFraction: 0.46, fps: 30 }
  return { ...profile, software, fps: Math.min(profile.fps, requested) }
}

/** Slidev scales its fixed-size CSS canvas; DPR alone misses that transform. */
export function renderResolution(profile, screenScale, dpr, width, height, maxDimension = Infinity) {
  const limit = Math.min(
    profile.maxRatio,
    Math.sqrt((profile.maxPixels ?? Infinity) / (width * height)),
    maxDimension / Math.max(width, height),
  )
  const output = Math.min(limit, Math.max(1, screenScale * dpr))
  const scene = Math.min(limit, Math.max(profile.minSceneRatio, output))
  // Spend four samples per pixel up through 1440p; at 4K keep native shading.
  const supersample = !!profile.antialias && width * height * output ** 2 <= 3_750_000
  return { output, scene, lens: scene * profile.lensFraction, supersample }
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
