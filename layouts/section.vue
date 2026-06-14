<template>
  <div class="slidev-layout section">
    <div class="section-main">
      <div v-if="sectionNumber" class="sec-num">{{ sectionNumber }}</div>
      <slot />
      <div v-if="tags.length" class="sec-tags">
        <span v-for="tag in tags" :key="tag" class="sec-tag">{{ tag }}</span>
      </div>
    </div>

    <div class="section-deco-side">
      <slot name="decoration">
        <BlochSphere />
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue'

const sectionNumber = computed(() => $frontmatter.sectionNumber ?? $frontmatter.num ?? '')
const tags = computed(() => {
  const raw = $frontmatter.tags ?? []
  if (Array.isArray(raw)) return raw.map(String)
  if (typeof raw === 'string') return raw.split(',').map((tag) => tag.trim()).filter(Boolean)
  return []
})

const BlochSphere = defineComponent({
  name: 'SectionBlochSphere',
  render() {
    return h('svg', {
      width: '380',
      height: '380',
      viewBox: '0 0 300 300',
      fill: 'none',
      'aria-hidden': 'true',
    }, [
      h('circle', { cx: '150', cy: '150', r: '130', stroke: '#7229E8', 'stroke-width': '2' }),
      h('ellipse', { cx: '150', cy: '150', rx: '130', ry: '42', stroke: '#7229E8', 'stroke-width': '1.3', 'stroke-dasharray': '5 4' }),
      h('line', { x1: '20', y1: '150', x2: '280', y2: '150', stroke: '#7229E8', 'stroke-width': '1.3' }),
      h('line', { x1: '150', y1: '20', x2: '150', y2: '280', stroke: '#7229E8', 'stroke-width': '1.3' }),
      h('circle', { cx: '150', cy: '150', r: '90', stroke: '#7229E8', 'stroke-width': '.9' }),
      h('circle', { cx: '150', cy: '58', r: '7', fill: '#7229E8' }),
      h('circle', { cx: '240', cy: '150', r: '5', fill: '#7229E8', opacity: '.55' }),
      h('circle', { cx: '150', cy: '242', r: '5', fill: '#7229E8', opacity: '.55' }),
      h('line', { x1: '150', y1: '150', x2: '220', y2: '76', stroke: '#E11D48', 'stroke-width': '2.5', 'stroke-linecap': 'round' }),
      h('circle', { cx: '220', cy: '76', r: '6', fill: '#E11D48' }),
    ])
  },
})
</script>
