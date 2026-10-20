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
  // Declaring undefined keeps Vue's Boolean-cast default (false) from
  // shadowing the legacy `inline` prop in `compact ?? inline ?? false`,
  // while an explicit :compact="false" still wins.
  compact: undefined,
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
  return knownTones.includes(tone) ? `pad-tone-${tone}` : 'pad-tone-default'
})

const blockStyle = computed(() => ({
  '--pad-color': props.color || undefined,
  '--pad-bg-color': props.bgColor || undefined,
  '--pad-title-color': props.titleColor || undefined,
  '--pad-border-color': props.borderColor || props.bgColor || undefined
}))
</script>

<template>
  <div
    class="pad-block"
    :class="[
      toneClass,
      {
        'pad-compact': effectiveCompact,
        'pad-inline': effectiveCompact,
        'pad-border': effectiveBorder,
        'pad-italic': italic
      }
    ]"
    :style="blockStyle"
  >
    <span v-if="showHeader" class="pad-header">
      <span v-if="displayTitle" class="pad-type" v-html="renderedTitle" />
      <span v-if="number !== undefined" class="pad-number">{{ number }}</span>
      <span v-if="name" class="pad-name">({{ name }})</span>
      <span class="pad-dot">.</span>
    </span>
    <div class="pad-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* ═══════════════════════════════════════════════
   Pad — academic theorem / definition block.

   Default style matches the Quantum template: filled
   background tint, no side border, a hairline ring
   shadow for depth. Set `border` to switch to the
   outlined variant.
═══════════════════════════════════════════════ */
.pad-block {
  background-color: var(--pad-bg-color);
  color: var(--pad-color, var(--ket-t1, inherit));
  border-radius: var(--ket-radius-md, 21px);
  corner-shape: var(--ket-corner-shape, squircle);
  /* Generous but layout-friendly spacing: ~11px external margin gives stacked
     blocks clear breathing room (margins collapse in block layout, so the
     inter-block gap equals this single value), while 16/20 padding keeps the
     interior airy without bloating short blocks. */
  padding: 16px 20px;
  margin: 0.7rem 0;
  /* 填充型 Pad：用背景色完成分区，仅保留无 spread 的柔和投影。
     不再用 0 0 0 1.5px 描边环 —— 超椭圆角部会让 spread ring 粗细不均。
     --ket-surface-shadow 在 squircle.css :root / .dark 中按明暗分别定义。 */
  box-shadow: var(--ket-surface-shadow, none);
}

.dark .pad-block {
  box-shadow: var(--ket-surface-shadow, none);
}

/* ── Semantic tones (quantum 6-color system) ── */
.pad-tone-default {
  --pad-bg-color: var(--ket-default-bg, #EDEAFF);
  --pad-title-color: var(--ket-default-lbl, #6D28D9);
  --pad-border-color: var(--ket-default-lbl, #6D28D9);
}

.pad-tone-primary {
  --pad-bg-color: var(--ket-primary-bg, #DBEAFE);
  --pad-title-color: var(--ket-primary-lbl, #1D4ED8);
  --pad-border-color: var(--ket-primary-lbl, #1D4ED8);
}

.pad-tone-danger {
  --pad-bg-color: var(--ket-danger-bg, #FFE4E6);
  --pad-title-color: var(--ket-danger-lbl, #BE123C);
  --pad-border-color: var(--ket-danger-lbl, #BE123C);
}

.pad-tone-warning {
  --pad-bg-color: var(--ket-warning-bg, #FEF3C7);
  --pad-title-color: var(--ket-warning-lbl, #B45309);
  --pad-border-color: var(--ket-warning-lbl, #B45309);
}

.pad-tone-success {
  --pad-bg-color: var(--ket-success-bg, #D1FAE5);
  --pad-title-color: var(--ket-success-lbl, #047857);
  --pad-border-color: var(--ket-success-lbl, #047857);
}

.pad-tone-muted {
  --pad-bg-color: var(--ket-muted-bg, #F1F2F7);
  --pad-title-color: var(--ket-muted-lbl, #64748B);
  --pad-border-color: var(--ket-muted-lbl, #64748B);
}

/* Outlined variant — transparent fill, colored ring. */
.pad-block.pad-border {
  background-color: transparent;
  border: 1.5px solid var(--pad-border-color);
  box-shadow: none;
}

.pad-header {
  display: block;
  font-weight: 700;
  font-size: 0.94rem;
  line-height: 1.3;
  margin-bottom: 10px;
}

.pad-compact,
.pad-inline {
  /* Keep the opt-in compact variant genuinely tight — override the roomy
     defaults above so inline theorem notes stay space-efficient.
     ~0.4em vertical margin ≈ half a character, matching body line-height. */
  padding: 8px 14px;
  margin: 0.4em 0;
}

.pad-compact .pad-header,
.pad-inline .pad-header {
  display: inline;
  margin-bottom: 0;
  margin-right: 0.3em;
}

.pad-compact .pad-content,
.pad-inline .pad-content {
  display: inline;
}

/* Compact / inline mode: force all paragraphs (not just :first-child)
   to display inline so the header and body text stay on one line.
   The `>` combinator inside `:deep()` can trip up older Vue scoped-style
   compilers, so we use a plain descendant selector here. */
.pad-compact .pad-content :deep(p),
.pad-inline .pad-content :deep(p) {
  display: inline;
  margin: 0;
}

.pad-type {
  color: var(--pad-title-color);
}

.pad-dot {
  color: var(--pad-title-color);
}

.pad-number {
  color: var(--pad-title-color);
  margin-left: 4px;
}

.pad-name {
  color: var(--pad-title-color);
  opacity: 0.8;
  font-weight: 400;
  font-style: italic;
  margin-left: 4px;
}

.pad-content {
  font-weight: 400;
  color: inherit;
  /* Shares --ket-body-size with slide body text (p, li) so theorem-block
     prose reads at the exact same scale as surrounding paragraphs. */
  font-size: var(--ket-body-size, 0.92rem);
  line-height: 1.72;
}

.pad-block.pad-italic .pad-content {
  font-style: italic;
}

.pad-content :deep(p) {
  margin: 0.3rem 0;
}

/* Emphasized terms (Markdown **bold** / __bold__) pick up the tone's label
   color so key terms echo the header label and read as highlights rather
   than plain body text. `--pad-title-color` is defined per tone above and
   also honored when the `titleColor` prop is set, so every block resolves
   to a real accent color. Specificity (.pad-content + scope attr + element)
   wins over the global `.slidev-layout strong` color; font-weight stays at
   the shared 600 from fonts.css. */
.pad-content :deep(strong),
.pad-content :deep(b) {
  color: var(--pad-title-color);
}

.pad-content :deep(.katex-display) {
  margin: 6px 0;
}
</style>
