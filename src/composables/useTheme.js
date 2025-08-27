import { ref, onMounted, watch } from 'vue'

// Global theme singleton (light/dark + resolved design tokens for JS consumers like Chart.js)
const isDark = ref(false)
const tokens = ref({})
const version = ref(0) // incremented whenever tokens refresh
let initialized = false
let observer = null

function readCssVar (name, fallback) {
  try {
    const css = getComputedStyle(document.documentElement)
    const val = css.getPropertyValue(name)
    return val?.trim() || fallback
  } catch {
    return fallback
  }
}

function resolveTokens () {
  // Map any CSS variables you need here so JS (e.g. Chart.js) sees concrete color strings
  return {
    textPrimary: readCssVar('--color-text-primary', '#1f2937'),
    textSecondary: readCssVar('--color-text-secondary', '#6b7280'),
    border: readCssVar('--color-border-primary', '#d1d5db'),
    grid: readCssVar('--color-border-primary', '#e5e7eb'),
    surfacePrimary: readCssVar('--color-surface-primary', '#ffffff'),
    surfaceSecondary: readCssVar('--color-surface-secondary', '#f3f4f6'),
    primary: readCssVar('--color-primary', '#3498db'),
    tooltipBg: isDark.value ? 'rgba(0,0,0,0.8)' : 'rgba(17,24,39,0.85)',
    tooltipBorder: isDark.value ? '#333' : '#444',
    tooltipTitle: '#fff',
    tooltipBody: '#fff'
  }
}

function applyHtmlClass () {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (isDark.value) root.classList.add('dark')
  else root.classList.remove('dark')
}

function refreshTokens () {
  tokens.value = resolveTokens()
  version.value++
  // Inform any listeners (legacy per-chart logic, etc.)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('themechange'))
  }
}

function setDark (val) {
  if (isDark.value === val) return
  isDark.value = val
  try { localStorage.setItem('darkMode', JSON.stringify(isDark.value)) } catch {}
  applyHtmlClass()
  refreshTokens()
}

function toggle () { setDark(!isDark.value) }

function init () {
  if (initialized) return
  initialized = true
  // Restore preference
  try {
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) {
      isDark.value = JSON.parse(saved)
    } else if (typeof window !== 'undefined') {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  } catch {}
  applyHtmlClass()
  refreshTokens()
  // Observe class changes to root (in case external code toggles)
  try {
    observer = new MutationObserver(() => {
      const currentlyDark = document.documentElement.classList.contains('dark')
      if (currentlyDark !== isDark.value) {
        isDark.value = currentlyDark
        refreshTokens()
      }
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  } catch {}
  // React to system preference changes
  try {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = e => {
      // Only auto-update if user hasn't explicitly chosen (i.e., no saved value)
      if (localStorage.getItem('darkMode') === null) {
        setDark(e.matches)
      }
    }
    mq.addEventListener('change', handler)
  } catch {}
}

export function useTheme () {
  onMounted(init)
  // In case used outside component lifecycle first
  if (!initialized && typeof window !== 'undefined') init()
  // If someone manually flips isDark, keep DOM + tokens synced
  watch(isDark, () => { applyHtmlClass(); refreshTokens() })
  return { isDark, tokens, version, toggle, setDark, refresh: refreshTokens }
}

// (Optional) Manual immediate init for early scripts
if (typeof window !== 'undefined') {
  // Defer to next tick so CSS is applied
  requestAnimationFrame(() => { if (!initialized) init() })
}
