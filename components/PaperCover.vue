<script setup lang="ts">
import { computed } from 'vue'

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
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  authors: () => [],
  affiliations: () => [],
  titleSize: '3rem',
  conjunction: 'and',
  serialComma: true,
})

// Honor the deck-wide gradient / glass frontmatter so the PaperCover title
// matches the cover layout. Per-slide frontmatter overrides headmatter
// (same resolution order as cover.vue).
const gradient = $frontmatter.gradient ?? $slidev.configs.gradient ?? false
const glass = $frontmatter.glass ?? $slidev.configs.glass ?? false

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
  if (index === normalizedAuthors.value.length - 1 && index > 0) {
    return props.conjunction ? `${props.conjunction} ` : ''
  }
  return ''
}

function authorSuffix(index: number, author: NormalizedAuthor) {
  if (author.suffix !== undefined) return author.suffix
  const authorCount = normalizedAuthors.value.length

  if (authorCount > 2 && index < authorCount - 1) {
    if (!props.serialComma && index === authorCount - 2) return ''
    return ','
  }
  return ''
}
</script>

<template>
  <div class="paper-cover">
    <h1
      class="paper-cover-title"
      :class="{ 'is-gradient': gradient && !glass, 'is-glass': glass }"
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
</template>

<style scoped>
.paper-cover {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.paper-cover-title {
  max-width: 980px;
  overflow-wrap: anywhere;
  text-wrap: balance;
}

/* Gradient / glass title fills — values come from the shared --ket-gradient-*
   variables in layout.css, so PaperCover stays in sync with the cover layout. */
.paper-cover-title.is-gradient {
  background: var(--ket-gradient-cover);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.paper-cover-title.is-glass {
  background: var(--ket-gradient-glass);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  filter:
    drop-shadow(0 0 2px rgba(220, 190, 255, 0.9))
    drop-shadow(0 0 12px rgba(180, 160, 255, 0.6))
    drop-shadow(0 0 30px rgba(160, 140, 255, 0.3));
}

.paper-cover-subtitle {
  margin: 0.25rem 0 0;
  opacity: 0.55;
  font-size: 1.05rem;
  line-height: 1.4;
}
</style>
