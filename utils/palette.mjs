// Deck-wide palette mode resolution — shared by setup/main.ts and tests.
//
// The deck headmatter selects a palette:
//
//   themeConfig:
//     palette: mono   # default — Ket Mono neutral academic scheme
//     palette: vivid  # original quantum-violet scheme
//
// resolvePalette is pure: anything other than the literal vivid (after
// trim + lowercase) falls back to mono, so a missing/typo'd key can never
// break rendering with an unknown palette name.

export const KET_PALETTES = ['mono', 'vivid']

/**
 * @param {unknown} value raw `themeConfig.palette` value from the deck headmatter
 * @returns {'mono' | 'vivid'} resolved palette, defaulting to mono
 */
export function resolvePalette(value) {
  if (typeof value !== 'string') return 'mono'
  return value.trim().toLowerCase() === 'vivid' ? 'vivid' : 'mono'
}
