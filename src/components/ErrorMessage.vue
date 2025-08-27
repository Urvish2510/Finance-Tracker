<template>
  <div class="error-message">
    ❌ Error: {{ message }}
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.error-message {
  background: var(--color-danger-50);
  color: var(--color-danger);
  padding: var(--space-4);
  border-radius: var(--card-radius);
  margin-bottom: var(--space-5);
  border: 1px solid var(--color-danger-200);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  box-shadow: var(--shadow-sm);
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .error-message {
    padding: var(--space-3);
    font-size: var(--font-size-xs);
  }
}
</style>
