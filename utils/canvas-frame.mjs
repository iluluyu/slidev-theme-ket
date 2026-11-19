// Width in canvas pixels, capped so the overlay stays a thin guide.
export function resolveCanvasFrame(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? Math.min(value, 6)
    : 0
}
