<script setup lang="ts">
import { computed } from 'vue'

type Tone = 'default' | 'primary' | 'danger' | 'warning' | 'success' | 'muted'

interface Props {
  type?: string
  title?: string
  customTitle?: string
  name?: string
  number?: number | string
  compact?: boolean
  inline?: boolean
  border?: boolean
  italic?: boolean
  tone?: Tone | string
  color?: string
  bgColor?: string
  titleColor?: string
  borderColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: '',
  title: '',
  customTitle: '',
  name: '',
  number: undefined,
  italic: false,
  tone: 'default',
  color: '',
  bgColor: '',
  titleColor: '',
  borderColor: ''
})

const typeLabels: Record<string, string> = {
  theorem: 'Theorem',
  lemma: 'Lemma',
  proof: 'Proof',
  definition: 'Definition',
  example: 'Example',
  exercise: 'Exercise',
  remark: 'Remark',
  note: 'Note',
  corollary: 'Corollary',
  proposition: 'Proposition',
  claim: 'Claim',
  question: 'Question',
  assumption: 'Assumption',
  protocol: 'Protocol',
  task: 'Task'
}

const displayTitle = computed(() => {
  if (props.title) return props.title
  if (props.customTitle) return props.customTitle
  const type = props.type.toLowerCase()
  if (type && typeLabels[type]) return typeLabels[type]
  if (props.type) return props.type
  return ''
})

const showHeader = computed(() => {
  return displayTitle.value || props.name || props.number !== undefined
})

const effectiveCompact = computed(() => props.compact ?? props.inline ?? true)
const effectiveBorder = computed(() => props.border ?? true)

const toneClass = computed(() => {
  const tone = props.tone.toLowerCase()
  const knownTones = ['default', 'primary', 'danger', 'warning', 'success', 'muted']
  return knownTones.includes(tone) ? `bra-tone-${tone}` : 'bra-tone-default'
})

const blockStyle = computed(() => ({
  '--bra-color': props.color || undefined,
  '--bra-bg-color': props.bgColor || undefined,
  '--bra-title-color': props.titleColor || undefined,
  '--bra-border-color': props.borderColor || props.bgColor || undefined
}))
</script>

<template>
  <div
    class="bra-block"
    :class="[
      toneClass,
      {
        'bra-compact': effectiveCompact,
        'bra-inline': effectiveCompact,
        'bra-border': effectiveBorder,
        'bra-italic': italic
      }
    ]"
    :style="blockStyle"
  >
    <span v-if="showHeader" class="bra-header">
      <span v-if="displayTitle" class="bra-type">{{ displayTitle }}</span>
      <span v-if="number !== undefined" class="bra-number">{{ number }}</span>
      <span v-if="name" class="bra-name">({{ name }})</span>
      <span class="bra-dot">.</span>
    </span>
    <div class="bra-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.bra-block {
  background-color: var(--bra-bg-color);
  color: var(--bra-color, inherit);
  border-radius: var(--ket-radius-md, 12px);
  padding: 6px 12px;
  margin: 6px 0;
}

.bra-tone-default {
  --bra-bg-color: var(--ket-bra-bg-default, rgba(45, 159, 179, 0.07));
  --bra-title-color: var(--slidev-theme-primary, #2d9fb3);
  --bra-border-color: var(--ket-border-color-default, rgba(45, 159, 179, 0.20));
}

.bra-tone-primary {
  --bra-bg-color: rgba(45, 159, 179, 0.08);
  --bra-title-color: var(--slidev-theme-primary, #2d9fb3);
  --bra-border-color: rgba(45, 159, 179, 0.36);
}

.bra-tone-danger {
  --bra-bg-color: rgba(231, 76, 60, 0.08);
  --bra-title-color: #e74c3c;
  --bra-border-color: rgba(231, 76, 60, 0.42);
}

.bra-tone-warning {
  --bra-bg-color: rgba(217, 119, 6, 0.10);
  --bra-title-color: #d97706;
  --bra-border-color: rgba(217, 119, 6, 0.42);
}

.bra-tone-success {
  --bra-bg-color: rgba(22, 163, 74, 0.08);
  --bra-title-color: #16a34a;
  --bra-border-color: rgba(22, 163, 74, 0.40);
}

.bra-tone-muted {
  --bra-bg-color: rgba(0, 0, 0, 0.04);
  --bra-title-color: rgba(0, 0, 0, 0.58);
  --bra-border-color: rgba(0, 0, 0, 0.16);
}

.dark .bra-tone-muted {
  --bra-bg-color: rgba(255, 255, 255, 0.06);
  --bra-title-color: rgba(255, 255, 255, 0.68);
  --bra-border-color: rgba(255, 255, 255, 0.18);
}

.bra-block.bra-border {
  background-color: transparent;
  border: 1.5px solid var(--bra-border-color);
}

.bra-header {
  display: block;
  font-weight: 600;
  font-size: 1.05em;
  margin-bottom: 2px;
}

.bra-compact .bra-header,
.bra-inline .bra-header {
  display: inline;
  margin-bottom: 0;
  margin-right: 0.3em;
}

.bra-compact .bra-content,
.bra-inline .bra-content {
  display: inline;
}

.bra-compact .bra-content :deep(> p:first-child),
.bra-inline .bra-content :deep(> p:first-child) {
  display: inline;
}

.bra-type {
  color: var(--bra-title-color);
}

.bra-dot {
  color: var(--bra-title-color);
}

.bra-number {
  color: var(--bra-title-color);
  margin-left: 4px;
}

.bra-name {
  color: var(--bra-title-color);
  opacity: 0.8;
  font-weight: 400;
  margin-left: 4px;
}

.bra-content {
  font-weight: 400;
  color: inherit;
  line-height: 1.5;
}

.bra-block.bra-italic .bra-content {
  font-style: italic;
}

.bra-content :deep(p) {
  margin: 2px 0;
}

.bra-content :deep(.katex-display) {
  margin: 4px 0;
}
</style>
