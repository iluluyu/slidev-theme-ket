import { watchEffect } from 'vue'
import { defineAppSetup } from '@slidev/types'
import { configs } from '@slidev/client'
import { resolvePalette } from '../utils/palette.mjs'

// Deck-wide palette switch: `themeConfig.palette: mono | vivid` in the deck
// headmatter. This app setup mirrors the resolved mode onto
// <html data-ket-palette="...">, which styles/layout.css keys both palettes
// off (mono is also the CSS default when the attribute is absent).
//
// `configs` from @slidev/client is reactive, so editing the headmatter under
// HMR re-runs the effect and updates the attribute in place — no reload.
// Anything other than the literal `vivid` falls back to mono.

export default defineAppSetup(() => {
  if (typeof document === 'undefined') return

  watchEffect(() => {
    const themeConfig = (configs as Record<string, unknown> | undefined)?.themeConfig as
      | Record<string, unknown>
      | undefined
    document.documentElement.dataset.ketPalette = resolvePalette(themeConfig?.palette)
  })
})
