import { ref, computed } from 'vue'

// Toast types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}

// Global toast state
const toasts = ref([])
let nextId = 1

// Toast composable
export function useToast() {
  const show = (message, type = TOAST_TYPES.INFO, duration = 4000) => {
    const id = nextId++
    const toast = {
      id,
      message,
      type,
      duration,
      timestamp: Date.now()
    }

    toasts.value.push(toast)

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }

    return id
  }

  const remove = (id) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const clear = () => {
    toasts.value.splice(0)
  }

  // Convenience methods
  const success = (message, duration) => show(message, TOAST_TYPES.SUCCESS, duration)
  const error = (message, duration = 6000) => show(message, TOAST_TYPES.ERROR, duration) // Longer for errors
  const warning = (message, duration) => show(message, TOAST_TYPES.WARNING, duration)
  const info = (message, duration) => show(message, TOAST_TYPES.INFO, duration)

  return {
    toasts: computed(() => toasts.value),
    show,
    remove,
    clear,
    success,
    error,
    warning,
    info
  }
}

// Auto-export a global instance
export const toast = useToast()
