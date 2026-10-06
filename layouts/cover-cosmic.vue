<template>
  <div class="slidev-layout cover-cosmic">
    <CosmicBackground
      :inner-color="innerColor"
      :outer-color="outerColor"
      :focus="focus"
      :speed="speed"
      :interactive="interactive"
      :stars="stars"
      :quality="quality"
    />

    <div class="cc-content">
      <div class="cc-body">
        <div class="cc-stack">
          <h1 class="cc-sr-only">{{ displayTitle }}</h1>
          <div class="cc-title" aria-hidden="true">
            <span v-for="(line, i) in titleLines" :key="i" class="cc-title-line">{{ line }}</span>
          </div>

          <div class="cc-rule" />

          <div class="cc-meta-box">
            <div class="cc-author-line">
              <span class="cc-author-orig">{{ parsedAuthor.orig }}</span>
              <template v-if="parsedAuthor.co">
                <span class="cc-author-sep" aria-hidden="true" />
                <span class="cc-author-co">{{ parsedAuthor.co }}</span>
              </template>
            </div>

            <p v-if="org" class="cc-org">{{ org }}</p>
            <p v-if="displayDate" class="cc-date">{{ displayDate }}</p>

            <a
              v-if="link"
              :href="link"
              target="_blank"
              rel="noopener noreferrer"
              class="cc-link-card"
              :aria-label="linkLabel || 'Open link'"
            >
              <svg v-if="linkIsYouTube" class="cc-link-icon cc-icon-yt" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              <svg v-else class="cc-link-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <span class="cc-link-copy">
                <span class="cc-link-title">{{ linkLabel || link }}</span>
                <span v-if="linkSublabel" class="cc-link-subtitle">{{ linkSublabel }}</span>
              </span>
            </a>

            <slot />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** Page-level title override; falls back to headmatter title. */
  heading?: string
  title?: string
  author?: string
  org?: string
  date?: string
  /** Glass card link (auto-detects a YouTube play icon). */
  link?: string
  linkLabel?: string
  linkSublabel?: string
  innerColor?: string
  outerColor?: string
  focus?: 'right' | 'left' | 'center'
  speed?: number
  interactive?: boolean
  stars?: boolean
  quality?: 'auto' | 'low' | 'high'
}

const props = withDefaults(defineProps<Props>(), {
  heading: '',
  title: '',
  author: '',
  org: '',
  date: '',
  link: '',
  linkLabel: '',
  linkSublabel: '',
  innerColor: '#ff8080',
  outerColor: '#3633ff',
  focus: 'right',
  speed: 1,
  interactive: false,
  stars: true,
  quality: 'auto'
})

// Page frontmatter `heading` wins; then headmatter title.
// (`title` is reserved by Slidev as the page title and does not reach layouts.)
const displayTitle = computed(() => props.heading || ($slidev.configs.title ?? ''))
const displayAuthor = computed(() => props.author || ($slidev.configs.author ?? ''))
const org = computed(() => props.org || ($slidev.configs.organization ?? ''))

const displayDate = computed(() => {
  const raw = props.date || $slidev.configs.date
  if (!raw) return ''
  const d = raw instanceof Date ? raw : new Date(String(raw))
  if (isNaN(d.getTime())) return String(raw)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
})

// Long titles split near the midpoint; short titles stay on one line.
const titleLines = computed(() => {
  const t = displayTitle.value.trim()
  if (!t) return []
  if (t.includes('\n')) return t.split('\n').map(s => s.trim())
  const words = t.split(/\s+/)
  if (words.length < 4) return [t]
  const midpoint = Math.ceil(words.length / 2)
  return [words.slice(0, midpoint).join(' '), words.slice(midpoint).join(' ')]
})

// "Orig Author | Co Author" renders as two tones split by a hairline.
const parsedAuthor = computed(() => {
  const a = displayAuthor.value
  if (a.includes('|')) {
    const [orig, co] = a.split('|').map(s => s.trim())
    return { orig, co }
  }
  return { orig: a, co: '' }
})

const linkIsYouTube = computed(() => /youtu\.?be/i.test(props.link))
</script>

<style scoped>
.slidev-layout.cover-cosmic {
  position: absolute;
  inset: 0;
  overflow: hidden;
  color: #f5f7fb;
  font-family: var(--slidev-font-sans, 'Geist', 'Inter', system-ui, sans-serif);
  user-select: none;
}

.cc-content {
  position: absolute;
  z-index: 3;
  inset: 0;
  pointer-events: none;
}

.cc-body {
  position: absolute;
  top: 42%;
  right: 48px;
  left: 64px;
  transform: translateY(-46%);
  text-align: left;
  pointer-events: auto;
}

.cc-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.cc-stack {
  width: max-content;
  max-width: 100%;
}

.cc-title {
  margin: 0;
  color: #ffffff;
  font-size: 46px;
  font-weight: 560;
  letter-spacing: -0.036em;
  line-height: 1.06;
}

.cc-title-line {
  display: block;
  color: #ffffff;
  white-space: nowrap;
}

.cc-rule {
  width: 62px;
  height: 1px;
  margin: 17px 0 16px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.72), transparent);
}

.cc-meta-box {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}

.cc-author-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 11px;
  margin: 0;
}

.cc-author-orig,
.cc-author-co {
  font-size: 19px;
  font-weight: 610;
  letter-spacing: 0.025em;
  text-shadow: 0 2px 10px rgba(2, 1, 8, 0.66);
}

.cc-author-orig {
  color: rgba(255, 255, 255, 0.95);
}

.cc-author-co {
  color: rgba(221, 224, 248, 0.8);
}

.cc-author-sep {
  width: 1px;
  height: 17px;
  background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.54), transparent);
}

.cc-org {
  margin: 5px 0 0;
  color: rgba(213, 219, 235, 0.5);
  font-size: 13.5px;
  font-weight: 440;
  letter-spacing: 0.025em;
  text-shadow: 0 2px 8px rgba(2, 1, 8, 0.72);
}

.cc-date {
  margin: 4px 0 0;
  color: rgba(219, 224, 238, 0.45);
  font-family: var(--slidev-font-mono, 'Geist Mono', monospace);
  font-size: 13.5px;
  font-weight: 450;
  letter-spacing: 0.1em;
  text-shadow: 0 2px 8px rgba(2, 1, 8, 0.72);
}

/* Glass link card — frosted squircle matching the Bra radius. */
.cc-link-card {
  display: flex;
  align-items: center;
  align-self: flex-start;
  gap: 10px;
  box-sizing: border-box;
  width: fit-content;
  max-width: 100%;
  padding: 9px 14px;
  margin-top: 14px;
  color: #f7f8fc;
  text-decoration: none;
  border: 1px solid rgba(156, 163, 175, 0.55);
  border-radius: var(--ket-radius-md, 21px);
  corner-shape: var(--ket-corner-shape, squircle);
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transition:
    transform 280ms cubic-bezier(0.16, 1, 0.3, 1),
    border-color 280ms cubic-bezier(0.16, 1, 0.3, 1),
    background-color 280ms cubic-bezier(0.16, 1, 0.3, 1);
}

.cc-link-card:hover {
  transform: translateY(-2px);
  border-color: rgba(178, 185, 198, 0.8);
  background-color: rgba(255, 255, 255, 0.12);
}

.cc-link-card:active {
  transform: translateY(-1px) scale(0.985);
}

.cc-link-card:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.88);
  outline-offset: 3px;
}

.cc-link-icon {
  flex: none;
  width: 22px;
  height: 22px;
  color: rgba(238, 242, 252, 0.9);
}

.cc-icon-yt {
  color: #ff3348;
}

.cc-link-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.cc-link-title {
  overflow: hidden;
  color: rgba(255, 255, 255, 0.94);
  font-size: 12px;
  font-weight: 590;
  line-height: 1.15;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cc-link-subtitle {
  color: rgba(207, 214, 232, 0.58);
  font-size: 9.5px;
  font-weight: 450;
  letter-spacing: 0.02em;
  line-height: 1.15;
}

@media (max-width: 720px) {
  .cc-body {
    right: 42px;
    left: 42px;
  }

  .cc-stack {
    max-width: 88%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cc-link-card {
    transition-duration: 0.01ms;
  }
}
</style>
