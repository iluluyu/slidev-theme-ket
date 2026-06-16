<template>
  <div class="slidev-layout thanks" :class="{ 'thanks-gradient': gradient }">
    <div class="thanks-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
// Closing slide — mirrors the cover's centered gradient title.
// The gradient fill is on by default (the signature closing flourish);
// set `gradient: false` in frontmatter to render a solid-color title.
const gradient = $frontmatter.gradient ?? true
</script>
