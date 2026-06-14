<template>
  <div
    class="slidev-layout cover-deco"
    :class="{ 'cover-gradient': gradient }"
  >
    <div class="cover-deco-main">
      <div v-if="tag" class="cov-tag">{{ tag }}</div>

      <slot />

      <div v-if="hasMeta" class="cover-meta">
        <div v-if="configs.author" class="meta-cell">
          <span class="cov-key">{{ presenterLabel }}</span>
          <span class="cov-val">{{ configs.author }}</span>
        </div>
        <div v-if="organization" class="meta-cell">
          <span class="cov-key">Affiliation</span>
          <span class="cov-val" v-html="organization" />
        </div>
        <div v-if="configs.date" class="meta-cell">
          <span class="cov-key">Date</span>
          <span class="cov-val">{{ formatDate(configs.date) }}</span>
        </div>
      </div>
    </div>

    <div class="cover-deco-side">
      <!-- Named slot: users drop their own SVG / illustration here.
           Falls back to the built-in Bloch-sphere decoration when empty,
           so the slide is presentable out of the box. -->
      <slot name="decoration">
        <BlochSphere />
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h, defineComponent } from 'vue'

// Per-slide frontmatter takes precedence, then falls back to headmatter (global).
const gradient = $frontmatter.gradient ?? $slidev.configs.gradient ?? false
const tag = $frontmatter.tag ?? ''
const presenterLabel = $frontmatter.presenterLabel ?? 'Presenter'

const configs = $slidev.configs
const organization = configs.organization

const hasMeta = computed(
  () => !!(configs.author || organization || configs.date)
)

function formatDate(raw: unknown): string {
  if (!raw) return ''
  const d = raw instanceof Date ? raw : new Date(String(raw))
  if (isNaN(d.getTime())) return String(raw)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Built-in Bloch-sphere decoration (quantum slide 1 / 13 motif).
// Rendered as a functional component so the default slot stays clean.
const BlochSphere = defineComponent({
  name: 'BlochSphere',
  render() {
    return h('svg', {
      width: '400',
      height: '400',
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
