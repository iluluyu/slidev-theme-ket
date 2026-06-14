<template>
  <div class="slidev-layout cover" :class="{ 'cover-gradient': gradient, 'cover-glass': glass }">
    <div class="cover-content">
      <slot />
      <div class="cover-meta" v-if="$slidev.configs.author || $slidev.configs.date || $slidev.configs.organization">
        <p v-if="$slidev.configs.author" class="cover-presenter">{{ $slidev.configs.author }}</p>
        <p v-if="$slidev.configs.organization" class="cover-organization" v-html="$slidev.configs.organization"></p>
        <p v-if="$slidev.configs.date" class="cover-date">{{ formatDate($slidev.configs.date) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Per-slide frontmatter takes precedence, then falls back to headmatter (global).
// This lets one deck mix gradient and glass covers without editing the headmatter.
const gradient = $frontmatter.gradient ?? $slidev.configs.gradient ?? false
const glass = $frontmatter.glass ?? $slidev.configs.glass ?? false

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
</script>
