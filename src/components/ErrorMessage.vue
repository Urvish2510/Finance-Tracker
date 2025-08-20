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
  background: #fed7d7;
  color: #c53030;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #feb2b2;
}
</style>
