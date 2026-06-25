<script setup lang="ts">
import { computed } from 'vue'
import { renderInline } from '../utils/renderInline'

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
  tone: '',
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

// Render the title as inline markdown so math / **bold** / `code` in a title
// prop render the same as slot content. See utils/renderInline.ts.
const renderedTitle = computed(() => renderInline(displayTitle.value))

const showHeader = computed(() => {
  return displayTitle.value || props.name || props.number !== undefined
})

const effectiveCompact = computed(() => props.compact ?? props.inline ?? false)
// Default is the quantum background-only style; `border` opts into the outlined variant.
const effectiveBorder = computed(() => props.border ?? false)

const toneClass = computed(() => {
  const typeTone: Record<string, Tone> = {
    theorem: 'default',
    proposition: 'default',
    claim: 'default',
    definition: 'primary',
    example: 'primary',
    lemma: 'success',
    protocol: 'success',
    remark: 'warning',
    note: 'warning',
    assumption: 'warning',
    corollary: 'danger',
    question: 'danger',
    proof: 'muted'
  }
  const tone = (props.tone || typeTone[props.type.toLowerCase()] || 'default').toLowerCase()
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
      <span v-if="displayTitle" class="bra-type" v-html="renderedTitle" />
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
/* ═══════════════════════════════════════════════
   Bra — academic theorem / definition block.

   Default style matches the Quantum template: filled
   background tint, no side border, a hairline ring
   shadow for depth. Set `border` to switch to the
   outlined variant.
═══════════════════════════════════════════════ */
.bra-block {
  background-color: var(--bra-bg-color);
  color: var(--bra-color, var(--ket-t1, inherit));
  border-radius: var(--ket-radius-md, 12px);
  /* Generous but layout-friendly spacing: ~11px external margin gives stacked
     blocks clear breathing room (margins collapse in block layout, so the
     inter-block gap equals this single value), while 16/20 padding keeps the
     interior airy without bloating short blocks. */
  padding: 16px 20px;
  margin: 0.7rem 0;
  box-shadow: 0 0 0 1.5px rgba(0, 0, 0, 0.06);
}

.dark .bra-block {
  box-shadow: 0 0 0 1.5px color-mix(in srgb, var(--bra-border-color) 24%, transparent);
}

/* ── Semantic tones (quantum 6-color system) ── */
.bra-tone-default {
  --bra-bg-color: var(--ket-default-bg, #EDEAFF);
  --bra-title-color: var(--ket-default-lbl, #6D28D9);
  --bra-border-color: var(--ket-default-lbl, #6D28D9);
}

.bra-tone-primary {
  --bra-bg-color: var(--ket-primary-bg, #DBEAFE);
  --bra-title-color: var(--ket-primary-lbl, #1D4ED8);
  --bra-border-color: var(--ket-primary-lbl, #1D4ED8);
}

.bra-tone-danger {
  --bra-bg-color: var(--ket-danger-bg, #FFE4E6);
  --bra-title-color: var(--ket-danger-lbl, #BE123C);
  --bra-border-color: var(--ket-danger-lbl, #BE123C);
}

.bra-tone-warning {
  --bra-bg-color: var(--ket-warning-bg, #FEF3C7);
  --bra-title-color: var(--ket-warning-lbl, #B45309);
  --bra-border-color: var(--ket-warning-lbl, #B45309);
}

.bra-tone-success {
  --bra-bg-color: var(--ket-success-bg, #D1FAE5);
  --bra-title-color: var(--ket-success-lbl, #047857);
  --bra-border-color: var(--ket-success-lbl, #047857);
}

.bra-tone-muted {
  --bra-bg-color: var(--ket-muted-bg, #F1F2F7);
  --bra-title-color: var(--ket-muted-lbl, #64748B);
  --bra-border-color: var(--ket-muted-lbl, #64748B);
}

/* Outlined variant — transparent fill, colored ring. */
.bra-block.bra-border {
  background-color: transparent;
  border: 1.5px solid var(--bra-border-color);
  box-shadow: none;
}

.bra-header {
  display: block;
  font-weight: 700;
  font-size: 0.94rem;
  line-height: 1.3;
  margin-bottom: 10px;
}

.bra-compact,
.bra-inline {
  /* Keep the opt-in compact variant genuinely tight — override the roomy
     defaults above so inline theorem notes stay space-efficient.
     ~0.4em vertical margin ≈ half a character, matching body line-height. */
  padding: 8px 14px;
  margin: 0.4em 0;
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

/* Compact / inline mode: force all paragraphs (not just :first-child)
   to display inline so the header and body text stay on one line.
   The `>` combinator inside `:deep()` can trip up older Vue scoped-style
   compilers, so we use a plain descendant selector here. */
.bra-compact .bra-content :deep(p),
.bra-inline .bra-content :deep(p) {
  display: inline;
  margin: 0;
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
  font-style: italic;
  margin-left: 4px;
}

.bra-content {
  font-weight: 400;
  color: inherit;
  /* Shares --ket-body-size with slide body text (p, li) so theorem-block
     prose reads at the exact same scale as surrounding paragraphs. */
  font-size: var(--ket-body-size, 0.92rem);
  line-height: 1.72;
}

.bra-block.bra-italic .bra-content {
  font-style: italic;
}

.bra-content :deep(p) {
  margin: 0.3rem 0;
}

/* Emphasized terms (Markdown **bold** / __bold__) pick up the tone's label
   color so key terms echo the header label and read as highlights rather
   than plain body text. `--bra-title-color` is defined per tone above and
   also honored when the `titleColor` prop is set, so every block resolves
   to a real accent color. Specificity (.bra-content + scope attr + element)
   wins over the global `.slidev-layout strong` color; font-weight stays at
   the shared 600 from fonts.css. */
.bra-content :deep(strong),
.bra-content :deep(b) {
  color: var(--bra-title-color);
}

.bra-content :deep(.katex-display) {
  margin: 6px 0;
}
</style>
