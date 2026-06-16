<template>
  <div class="slidev-layout two-cols-header">
    <!-- Default slot = optional header (h1 + intro), rendered full-width above. -->
    <slot />
    <div class="tch-body" :style="{ gridTemplateColumns: cols }">
      <div class="tch-col"><slot name="left" /></div>
      <div class="tch-col"><slot name="right" /></div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Two-column layout with an optional header. Content before the first
// `::slot::` is the header (full width); `::left::` and `::right::` fill
// the columns. Override the column ratio with `cols` frontmatter, e.g.
// `cols: 2fr 1fr` (default equal columns).
const cols = $frontmatter.cols ?? '1fr 1fr'
</script>
