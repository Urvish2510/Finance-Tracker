import { ref, onMounted, onUnmounted } from 'vue'

// Resolve CSS variable values to actual colors for Chart.js (canvas can't use var())
function resolveColors () {
  if (typeof window === 'undefined') {
    return {
      textPrimary: '#222',
      textSecondary: '#555',
      border: '#ccc',
      grid: '#e0e0e0'
    }
  }
  const css = getComputedStyle(document.documentElement)
  const get = n => (css.getPropertyValue(n) || '').trim()
  return {
    textPrimary: get('--color-text-primary') || '#222',
    textSecondary: get('--color-text-secondary') || get('--color-text-primary') || '#555',
    border: get('--color-border-primary') || '#ccc',
    grid: get('--color-border-primary') || '#e0e0e0'
  }
}

export function useChartTheme () {
  const colors = ref(resolveColors())
  let observer = null
  let rafId = null

  const update = () => {
    // Throttle via rAF to avoid duplicate updates during classList mutations
    if (rafId) cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(() => {
      colors.value = resolveColors()
    })
  }

  onMounted(() => {
    // Observe class changes on <html> (root) for dark mode toggling
    observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    // Also listen to custom event if app emits one
    window.addEventListener('themechange', update)
  })

  onUnmounted(() => {
    if (observer) observer.disconnect()
    if (rafId) cancelAnimationFrame(rafId)
    window.removeEventListener('themechange', update)
  })

  return { colors }
}
