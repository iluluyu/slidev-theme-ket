<script setup lang="ts">
import { computed, h, defineComponent, useSlots } from 'vue'

type Mark = string | number

type AuthorInput =
  | string
  | [string, Mark?]
  | {
      name: string
      mark?: Mark
      affil?: Mark
      affiliation?: Mark
      prefix?: string
      suffix?: string
    }

type AffiliationInput =
  | string
  | [Mark, string]
  | {
      mark?: Mark
      id?: Mark
      text: string
    }

interface NormalizedAuthor {
  name: string
  mark: string
  prefix?: string
  suffix?: string
}

interface NormalizedAffiliation {
  mark: string
  text: string
}

interface Props {
  title: string
  subtitle?: string
  authors?: AuthorInput[]
  affiliations?: AffiliationInput[]
  titleSize?: string
  conjunction?: string
  serialComma?: boolean
  /** Show the built-in Bloch-sphere decoration on the right (two-column mode). */
  deco?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  authors: () => [],
  affiliations: () => [],
  titleSize: '2.35rem',
  conjunction: 'and',
  serialComma: true,
  deco: false,
})

const slots = useSlots()

// Honor the deck-wide gradient frontmatter so the PaperCover title
// matches the cover layout. Per-slide frontmatter overrides headmatter
// (same resolution order as cover.vue).
const gradient = $frontmatter.gradient ?? $slidev.configs.gradient ?? false

// Two-column mode activates when the `deco` prop is set OR a custom
// `decoration` slot is supplied. The built-in Bloch sphere fills the
// right column when no custom slot content is given.
const hasDecoration = computed(() => props.deco || !!slots.decoration)

const normalizedAuthors = computed<NormalizedAuthor[]>(() =>
  props.authors
    .map((author) => {
      if (typeof author === 'string') {
        return { name: author, mark: '' }
      }

      if (Array.isArray(author)) {
        return {
          name: String(author[0] ?? ''),
          mark: author[1] === undefined ? '' : String(author[1]),
        }
      }

      return {
        name: author.name,
        mark: String(author.mark ?? author.affil ?? author.affiliation ?? ''),
        prefix: author.prefix,
        suffix: author.suffix,
      }
    })
    .filter((author) => author.name)
)

const normalizedAffiliations = computed<NormalizedAffiliation[]>(() =>
  props.affiliations
    .map((affiliation) => {
      if (typeof affiliation === 'string') {
        return { mark: '', text: affiliation }
      }

      if (Array.isArray(affiliation)) {
        return {
          mark: String(affiliation[0] ?? ''),
          text: affiliation[1] ?? '',
        }
      }

      return {
        mark: String(affiliation.mark ?? affiliation.id ?? ''),
        text: affiliation.text,
      }
    })
    .filter((affiliation) => affiliation.text)
)

const titleStyle = computed(() => ({
  fontSize: props.titleSize,
}))

function authorPrefix(index: number, author: NormalizedAuthor) {
  if (author.prefix !== undefined) return author.prefix

  const authorCount = normalizedAuthors.value.length
  if (index === 0) return ''
  if (index === authorCount - 1) {
    if (!props.conjunction) return ', '
    if (authorCount === 2) return ` ${props.conjunction} `
    return props.serialComma
      ? `, ${props.conjunction} `
      : ` ${props.conjunction} `
  }

  return ', '
}

function authorSuffix(index: number, author: NormalizedAuthor) {
  if (author.suffix !== undefined) return author.suffix
  return ''
}

// Built-in Bloch-sphere decoration (quantum slide 13 motif) — used as the
// right-column fallback when `deco` is set but no custom slot is supplied.
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
      h('line', { x1: '150', y1: '150', x2: '220', y2: '76', stroke: '#E11D48', 'stroke-width': '2.5', 'stroke-linecap': 'round' }),
      h('circle', { cx: '220', cy: '76', r: '6', fill: '#E11D48' }),
    ])
  },
})
</script>

<template>
  <div class="paper-cover" :class="{ 'paper-cover-deco': hasDecoration }">
    <div class="paper-cover-text">
      <h1
        class="paper-cover-title"
        :class="{ 'is-gradient': gradient }"
        :style="titleStyle"
      >
        <slot name="title">{{ title }}</slot>
      </h1>

      <p v-if="subtitle" class="paper-cover-subtitle">{{ subtitle }}</p>

      <div v-if="normalizedAuthors.length" class="cover-authors">
        <span v-for="(author, index) in normalizedAuthors" :key="`${author.name}-${index}`">
          {{ authorPrefix(index, author) }}{{ author.name }}<sup v-if="author.mark" class="affil-mark">{{
            author.mark
          }}</sup>{{ authorSuffix(index, author) }}
        </span>
      </div>

      <div v-if="normalizedAffiliations.length" class="cover-affiliations">
        <p v-for="(affiliation, index) in normalizedAffiliations" :key="`${affiliation.mark}-${index}`">
          <sup v-if="affiliation.mark" class="affil-mark">{{ affiliation.mark }}</sup>
          {{ affiliation.text }}
        </p>
      </div>
    </div>

    <div v-if="hasDecoration" class="paper-cover-deco-side">
      <slot name="decoration">
        <BlochSphere />
      </slot>
    </div>
  </div>
</template>

<style scoped>
.paper-cover {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  width: 100%;
  padding: 1rem 0 0.35rem;
  text-align: center;
}

.paper-cover-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: min(100%, 880px);
}

.paper-cover-title {
  max-width: 840px;
  margin: 0;
  padding-bottom: 0.08em;
  color: var(--ket-t1);
  font-weight: 760;
  line-height: 1.14;
  letter-spacing: 0;
  overflow: visible;
  overflow-wrap: anywhere;
  text-wrap: balance;
}

/* Gradient title fill — values come from the shared --ket-gradient-cover
   variable in layout.css, so PaperCover stays in sync with the cover layout. */
.paper-cover-title.is-gradient {
  background: var(--ket-gradient-cover);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.paper-cover-subtitle {
  max-width: 720px;
  margin: 0.55rem 0 0;
  color: var(--ket-t3);
  font-size: 0.95rem;
  line-height: 1.32;
}

.cover-authors {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 760px;
  margin-top: 0.7rem;
  color: var(--ket-t1);
  font-size: 1.02rem;
  font-weight: 500;
  line-height: 1.32;
}

.cover-affiliations {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.18rem;
  max-width: 720px;
  margin-top: 0.85rem;
  color: var(--ket-t3);
  font-size: 0.78rem;
  font-weight: 400;
  line-height: 1.22;
}

.cover-affiliations p {
  margin: 0;
}

.cover-affiliations .affil-mark {
  color: var(--ket-t3);
  opacity: 0.82;
}

.affil-mark {
  color: var(--slidev-theme-primary);
  font-size: 0.72em;
  font-weight: 600;
  line-height: 0;
}

/* ── Two-column deco mode ──
   Left: title + authors + affiliations (left-aligned).
   Right: built-in Bloch sphere or custom `decoration` slot, rendered as a
   faint watermark (low opacity) like the Quantum template. */
.paper-cover.paper-cover-deco {
  position: relative;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0;
  text-align: left;
}

.paper-cover.paper-cover-deco .paper-cover-text {
  flex: 1 1 auto;
  align-items: flex-start;
  min-width: 0;
  max-width: 760px;
}

.paper-cover.paper-cover-deco .paper-cover-title {
  max-width: 660px;
  text-align: left;
}

.paper-cover.paper-cover-deco .cover-authors {
  justify-content: flex-start;
  max-width: 620px;
}

.paper-cover.paper-cover-deco .cover-affiliations {
  align-items: flex-start;
  max-width: 560px;
  margin-top: 0.9rem;
}

.paper-cover-deco-side {
  position: absolute;
  right: 64px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  opacity: var(--ket-deco-opacity, 0.15);
}

.paper-cover-deco-side svg {
  max-width: 400px;
  height: auto;
}
</style>
