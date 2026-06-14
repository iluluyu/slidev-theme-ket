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
const gradient = $slidev.configs.gradient ?? false
const glass = $slidev.configs.glass ?? false

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

<style>
.slidev-layout.cover.cover-gradient h1 {
  background: linear-gradient(135deg, #FF6F00 0%, #DE5471 25%, #A948C9 50%, #6553D8 75%, #1C73FF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
}

.slidev-layout.cover.cover-glass h1 {
  background: linear-gradient(180deg,
    #fde2e4 0%,
    #e2c6f6 40%,
    #b8d4ff 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
  filter:
    drop-shadow(0 0 2px rgba(220, 190, 255, 0.9))
    drop-shadow(0 0 12px rgba(180, 160, 255, 0.6))
    drop-shadow(0 0 30px rgba(160, 140, 255, 0.3));
}
</style>
