<script setup lang="ts">
import { watchEffect } from 'vue'

watchEffect(() => {
  if (typeof document !== 'undefined') {
    const isProjector = $slidev.configs.projector === true || $slidev.configs.projector === 'true'
    if (isProjector) {
      document.documentElement.classList.add('projector-mode')
    } else {
      document.documentElement.classList.remove('projector-mode')
    }
  }
})
</script>

<template>
  <!-- Global layer component for slidev-theme-ket -->
</template>
