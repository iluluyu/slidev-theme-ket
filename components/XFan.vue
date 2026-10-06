<template>
  <div class="xfan" :style="fanVars">
    <div
      v-for="(child, i) in children"
      :key="i"
      class="xfan-item"
      v-click
      :style="itemStyle(i)"
    >
      <component :is="child" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { Comment, Text } from 'vue'

interface Props {
  /** Rotation (deg) of the bottom card in the fan. */
  angleFrom?: number
  /** Rotation (deg) of the top card in the fan. */
  angleTo?: number
  /** Horizontal offset of the bottom card (px). */
  baseX?: number
  /** Total horizontal travel from bottom to top card (px). */
  travel?: number
  /** Vertical offset of the bottom card (px). */
  baseY?: number
  /** Vertical offset of the top card (px). */
  endY?: number
  /** Extra sag applied to middle cards (px) — the droop of a held hand of cards. */
  drop?: number
  /** Reserve height for the container; 'auto' fits one card plus the fan offsets. */
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  angleFrom: -6.5,
  angleTo: 2,
  baseX: 64,
  travel: 240,
  baseY: 16,
  endY: 6,
  drop: 22,
  height: '318px'
})

const slots = useSlots()

// Slot children that are actual elements/components (drop whitespace text
// and comment nodes produced by markdown between <XCard> tags).
const children = computed(() =>
  (slots.default ? slots.default() : []).filter(v => v.type !== Comment && !(v.type === Text && !String(v.children).trim()))
)

const n = computed(() => children.value.length)

const fanVars = computed(() => ({ '--xfan-h': props.height }))

/**
 * Fan placement for card i of n — computed, not hardcoded:
 *
 *   p      = i / (n - 1)                          progress through the fan
 *   θ(i)   = angleFrom + (angleTo - angleFrom)·p^1.2   ease into the top angle
 *   x(i)   = baseX + travel·p                     linear spread
 *   y(i)   = endY + (baseY - endY)·(1 - p) + 4·drop·p·(1 - p)   droop arc
 *
 * The same formula covers any card count; the auto deck's four hand-tuned
 * nth-child transforms are the n = 4 special case.
 */
function itemStyle(i: number) {
  const p = n.value > 1 ? i / (n.value - 1) : 1
  const ease = Math.pow(p, 1.2)
  const theta = props.angleFrom + (props.angleTo - props.angleFrom) * ease
  const x = props.baseX + props.travel * p
  const y = props.endY + (props.baseY - props.endY) * (1 - p) + 4 * props.drop * p * (1 - p)
  return {
    zIndex: i + 1,
    '--fan-enter': `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${theta.toFixed(2)}deg)`,
    // Hidden state: waiting off to the right, slightly shrunk.
    '--fan-hidden': `translate(${(x + 190).toFixed(1)}px, 14px) scale(0.98)`
  } as Record<string, string | number>
}
</script>

<style scoped>
.xfan {
  position: relative;
  height: var(--xfan-h, 318px);
}

.xfan-item {
  position: absolute;
  top: 0;
  left: 0;
  transform: var(--fan-enter);
}

/* Slidev's v-click drives these classes; transitions only on click targets
   so the static (all-revealed) state never animates on load. */
.xfan-item.slidev-vclick-target {
  transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease;
}

.xfan-item.slidev-vclick-hidden {
  transform: var(--fan-hidden) !important;
  opacity: 0;
}
</style>
