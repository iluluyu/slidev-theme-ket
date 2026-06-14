<template>
  <div class="slidev-layout default" :class="props.class">
    <slot />
  </div>
</template>

<script setup lang="ts">
// Slidev passes every frontmatter key that is not in FRONTMATTER_FIELDS
// (see @slidev/client/context.ts → frontmatterToProps) as a prop on the
// layout component. Declaring `class` here lets a slide opt into extra
// root-element classes via `class:` frontmatter — e.g. `class: centered`.
const props = defineProps<{
  class?: string
}>()
</script>
