<template>
  <figure class="ket-figure" :class="{ 'ket-figure-flat': flat }" :style="figureStyle">
    <div class="ket-figure-frame">
      <img :src="src" :alt="alt || ''" loading="lazy" />
    </div>
    <figcaption v-if="$slots.default || number !== undefined" class="ket-figure-cap">
      <span v-if="number !== undefined" class="ket-figure-num">Fig.&nbsp;{{ number }}</span>
      <span v-if="$slots.default" class="ket-figure-text"><slot /></span>
    </figcaption>
  </figure>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Proper figure with a framed image, an optional figure number, and a caption.
// The caption is the default slot so it renders as Markdown — inline math,
// emphasis, and links all work (separate it from the tags with blank lines).
//
//   <Figure src="/figures/x.svg" :number="1" width="70%">
//
//   **Bloch sphere** — pure states $|\psi\rangle$ on the unit sphere.
//
//   </Figure>
//
// Props: src (required) · number · width (CSS, e.g. '320px' / '70%') ·
//        alt · flat (drop the frame for transparent / full-bleed art).
const props = defineProps<{
  src: string
  alt?: string
  number?: number | string
  width?: string
  flat?: boolean
}>()

const figureStyle = computed(() => (props.width ? { width: props.width } : {}))
</script>
