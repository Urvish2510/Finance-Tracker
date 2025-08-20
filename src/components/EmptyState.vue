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
  padding: 60px 20px;
  color: #a0aec0;
}

.no-data-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.no-data h3 {
  color: #4a5568;
  margin-bottom: 8px;
}

.no-data p {
  color: #718096;
}
</style>
