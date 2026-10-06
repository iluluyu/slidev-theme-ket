<template>
  <article class="xcard" :style="cardStyle">
    <header class="xc-head">
      <span class="xc-avatar" :style="avatarStyle" :class="{ 'xc-has-img': !!avatar }">
        <img v-if="avatar" :src="avatar" :alt="name" loading="lazy" />
        <span v-else class="xc-initials" aria-hidden="true">{{ initials }}</span>
      </span>
      <span class="xc-who">
        <span class="xc-name-line">
          <span class="xc-name">{{ name }}</span>
          <svg v-if="verified" class="xc-verified" viewBox="0 0 22 22" aria-label="Verified">
            <circle cx="11" cy="11" r="10" fill="#1d9bf0" />
            <path fill="#fff" d="M9.1 14.7 5.6 11.2l1.3-1.3 2.2 2.2 5.1-5.1 1.3 1.3z" />
          </svg>
        </span>
        <span class="xc-handle">{{ handleLine }}</span>
      </span>
      <svg class="xc-logo" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    </header>
    <div class="xc-body">
      <slot />
    </div>
    <footer v-if="time" class="xc-time">{{ time }}</footer>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  name: string
  handle?: string
  avatar?: string
  verified?: boolean
  time?: string
  width?: string
}

const props = withDefaults(defineProps<Props>(), {
  handle: '',
  avatar: '',
  verified: false,
  time: '',
  width: '420px'
})

const cardStyle = computed(() => ({ '--xc-width': props.width }))

const handleLine = computed(() => (props.handle ? `${props.handle.replace(/^@/, '@')} · ${props.time || ''}`.replace(/ · $/, '') : props.time))

const initials = computed(() => {
  const words = props.name.trim().split(/\s+/).filter(Boolean)
  return ((words[0]?.[0] || '') + (words[1]?.[0] || words[0]?.[1] || '')).toUpperCase()
})

// Deterministic hue from the display name so fallback avatars are stable
// across renders without shipping images.
const avatarStyle = computed(() => {
  if (props.avatar) return {}
  let h = 0
  for (let i = 0; i < props.name.length; i++) h = (h * 31 + props.name.charCodeAt(i)) % 360
  return { background: `hsl(${h}, 58%, 46%)` }
})
</script>

<style scoped>
.xcard {
  box-sizing: border-box;
  width: var(--xc-width, 420px);
  max-width: 100%;
  padding: 12px 14px 11px;
  background: var(--xcard-bg, #fff);
  border: 1px solid var(--xcard-border, #cfd9de);
  border-radius: 16px;
  corner-shape: round;
  box-shadow: 0 12px 28px rgba(15, 20, 25, 0.12);
  color: var(--xcard-ink, #0f1419);
  font-family: 'Segoe UI', 'Inter', Roboto, Helvetica, Arial, sans-serif;
  transform-origin: 16% 88%;
}

.xc-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.xc-avatar {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  overflow: hidden;
  border-radius: 50%;
}

.xc-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.xc-initials {
  color: #fff;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.xc-who {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.xc-name-line {
  display: flex;
  align-items: center;
  gap: 3px;
  line-height: 1.15;
}

.xc-name {
  overflow: hidden;
  color: var(--xcard-ink, #0f1419);
  font-size: 1.02rem;
  font-weight: 760;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xc-verified {
  flex: none;
  width: 17px;
  height: 17px;
}

.xc-handle {
  color: var(--xcard-sub, #536471);
  font-size: 0.94rem;
  line-height: 1.2;
}

.xc-logo {
  flex: none;
  width: 18px;
  height: 18px;
  margin-left: auto;
  color: var(--xcard-ink, #0f1419);
}

.xc-body {
  font-size: 1.02rem;
  line-height: 1.32;
}

/* Slot content arrives as markdown — zero the wrapping <p> margin. */
.xc-body :deep(p) {
  margin: 0;
}

.xc-body :deep(strong) {
  color: var(--xcard-strong, #0f1419);
  font-weight: 760;
}

/* Marker-pen highlight; keeps ink dark on the light card. */
.xc-body :deep(.hl) {
  background: #ffe566;
  color: #0f1419;
  font-weight: 750;
  padding: 0 0.12em;
  border-radius: 2px;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}

.xc-time {
  margin-top: 8px;
  color: var(--xcard-sub, #536471);
  font-size: 0.94rem;
  line-height: 1.2;
}
</style>
