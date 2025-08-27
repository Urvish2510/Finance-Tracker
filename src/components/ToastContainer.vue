<template>
  <teleport to="body">
    <div class="t-container" aria-live="assertive" aria-atomic="true">
      <transition-group name="t-fade" tag="div" class="t-list">
        <div
          v-for="t in toasts"
          :key="t.id"
          :class="['t', `t--${t.type}`]"
          role="alert"
        >
          <span class="t-icon" v-html="icons[t.type] || icons.info" aria-hidden="true"></span>
          <p class="t-msg">{{ t.message }}</p>
          <button class="t-close" @click="remove(t.id)" :aria-label="`Dismiss ${t.type || 'toast'}`">×</button>
          <div v-if="t.duration" class="t-bar" aria-hidden="true">
            <div class="t-bar-fill" :style="{ animationDuration: `${t.duration}ms` }"></div>
          </div>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup>
import { useToast } from '../composables/useToast.js'
const { toasts, remove } = useToast()

// Minimal inline SVG (no extra components)
const icons = {
  success: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="10" cy="10" r="9"/><path d="M6 10.5 9 13l5-6"/></svg>',
  error: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="10" cy="10" r="9"/><path d="M7 7l6 6M13 7l-6 6"/></svg>',
  warning: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="m10 3 8 14H2Z"/><path d="M10 8v4"/><path d="M10 14h.01"/></svg>',
  info: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="10" cy="10" r="9"/><path d="M10 9v5"/><path d="M10 6h.01"/></svg>'
}
</script>

<style scoped>
/* Container */
.t-container { position: fixed; top: var(--space-5); right: var(--space-5); z-index: var(--z-index-toast); pointer-events:none; width: min(380px, calc(100vw - 2rem)); }
.t-list { display:flex; flex-direction:column; gap: var(--space-3); }

/* Base Toast */
.t { --t-accent: var(--color-info-500); pointer-events:all; display:flex; align-items:flex-start; gap: var(--space-3); background: var(--color-surface-elevated); border:1px solid var(--color-border-primary); padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg); box-shadow: var(--card-shadow); position:relative; font-size: var(--font-size-sm); line-height:1.4; }
.t:before { content:""; position:absolute; inset:0; border-radius:inherit; box-shadow: inset 0 0 0 3px var(--t-accent); opacity:0.08; pointer-events:none; }
.t:hover { box-shadow: var(--shadow-md); }

/* Icon */
.t-icon { line-height:0; display:flex; align-items:center; justify-content:center; color: var(--t-accent); margin-top:2px; }

/* Message */
.t-msg { margin:0; flex:1; color: var(--color-text-primary); font-weight: var(--font-weight-medium); }

/* Close */
.t-close { background:transparent; border:none; cursor:pointer; color: var(--color-text-tertiary); font-size: 16px; line-height:1; padding:0 var(--space-1); border-radius: var(--radius-sm); transition: var(--transition-colors); }
.t-close:hover { color: var(--color-text-primary); background: var(--color-surface-secondary); }
.t-close:focus { outline:2px solid var(--t-accent); outline-offset:2px; }

/* Progress bar (accent underline) */
.t-bar { position:absolute; left:0; bottom:0; height:3px; width:100%; background: var(--color-surface-tertiary); overflow:hidden; border-radius: 0 0 var(--radius-lg) var(--radius-lg); }
.t-bar-fill { height:100%; width:100%; transform:translateX(-100%); animation: tProgress linear forwards; background: var(--t-accent); }
@keyframes tProgress { to { transform:translateX(0); } }

/* Variants */
.t--success { --t-accent: var(--color-success-500); }
.t--error { --t-accent: var(--color-error-500); }
.t--warning { --t-accent: var(--color-warning-500); }
.t--info { --t-accent: var(--color-info-500); }

/* Light subtle tint on variants */
.t--success { background: linear-gradient(0deg, var(--color-success-50), var(--color-success-50)) border-box; }
.t--error { background: linear-gradient(0deg, var(--color-error-50), var(--color-error-50)) border-box; }
.t--warning { background: linear-gradient(0deg, var(--color-warning-50), var(--color-warning-50)) border-box; }
.t--info { background: linear-gradient(0deg, var(--color-info-50), var(--color-info-50)) border-box; }

/* Dark theme: remove tints, keep accent */
:root.dark .t--success,
:root.dark .t--error,
:root.dark .t--warning,
:root.dark .t--info { background: var(--color-surface-secondary); }

/* Animation */
.t-fade-enter-active, .t-fade-leave-active { transition: opacity var(--transition-fast), transform var(--transition-fast); }
.t-fade-enter-from, .t-fade-leave-to { opacity:0; transform: translateY(-6px); }

/* Mobile */
@media (max-width: 560px) { .t-container { top: var(--space-4); right: var(--space-4); left: var(--space-4); width:auto; } }

/* Reduced motion */
@media (prefers-reduced-motion: reduce) { .t-fade-enter-active, .t-fade-leave-active, .t-bar-fill { transition:none; animation:none; } .t-fade-enter-from, .t-fade-leave-to { transform:none; } }
</style>
