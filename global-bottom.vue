<script setup lang="ts">
import { computed } from 'vue'

const chromeHiddenLayouts = new Set(['cover', 'cover-deco', 'intro', 'section'])

const showChrome = computed(() => {
  return (
    $renderContext === 'slide' &&
    !chromeHiddenLayouts.has($nav.currentLayout) &&
    $frontmatter.hideFooter !== true
  )
})

const footerTitle = computed(() => {
  return String($frontmatter.footerTitle || $slidev.configs.title || '')
})

const progressStyle = computed(() => {
  const total = Math.max(Number($nav.total) || 1, 1)
  const current = Math.min(Math.max(Number($nav.currentPage) || 1, 1), total)
  return {
    width: `${(current / total) * 100}%`,
  }
})
</script>

<template>
  <footer v-if="showChrome" class="ket-footer">
    <span v-if="footerTitle" class="ket-footer-title">{{ footerTitle }}</span>
    <span class="ket-footer-page">{{ $nav.currentPage }} / {{ $nav.total }}</span>
  </footer>
  <div v-if="$renderContext === 'slide'" class="ket-progress" aria-hidden="true">
    <div class="ket-progress-bar" :style="progressStyle" />
  </div>
</template>

<style scoped>
.ket-footer {
  position: fixed;
  right: 64px;
  bottom: 12px;
  left: 64px;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  pointer-events: none;
}

.ket-footer-title {
  margin-right: auto;
  color: var(--ket-t3);
  font-size: 11px;
  line-height: 1;
}

.ket-footer-page {
  color: var(--ket-t3);
  font-size: 11px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.ket-progress {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 45;
  height: var(--ket-progress-height, 2px);
  pointer-events: none;
  /* Palette-driven track + fill: mono paints a flat accent on a faint
     track; vivid restores the violet gradient bar without a track. */
  background: var(--ket-progress-track, transparent);
}

.ket-progress-bar {
  height: 100%;
  background: var(--ket-progress-fill, linear-gradient(90deg, var(--ket-ac-m), var(--ket-ac-bd)));
  transition: width 0.25s ease;
}
</style>
