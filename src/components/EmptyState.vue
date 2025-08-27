<template>
  <div class="no-data">
    <div class="no-data-icon">🏷️</div>
    <h3>No categories found</h3>
    <p>{{ isSearch ? 'Try adjusting your search terms' : 'Create your first category above to get started' }}</p>
  </div>
</template>

<script setup>
defineProps({
  isSearch: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.no-data {
  text-align: center;
  padding: var(--space-16) var(--space-5);
  color: var(--color-text-tertiary);
  background: var(--color-surface-primary);
  border-radius: var(--card-radius);
  border: 2px dashed var(--color-border-primary);
  margin: var(--space-4) 0;
}

.no-data-icon {
  font-size: var(--font-size-4xl);
  margin-bottom: var(--space-4);
  opacity: 0.6;
}

.no-data h3 {
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2) 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.no-data p {
  color: var(--color-text-secondary);
  margin: 0;
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .no-data {
    padding: var(--space-12) var(--space-4);
  }
  
  .no-data-icon {
    font-size: var(--font-size-3xl);
  }
  
  .no-data h3 {
    font-size: var(--font-size-base);
  }
}

@media (max-width: 480px) {
  .no-data {
    padding: var(--space-8) var(--space-3);
  }
  
  .no-data-icon {
    font-size: var(--font-size-2xl);
  }
  
  .no-data h3 {
    font-size: var(--font-size-sm);
  }
  
  .no-data p {
    font-size: var(--font-size-xs);
  }
}
</style>
