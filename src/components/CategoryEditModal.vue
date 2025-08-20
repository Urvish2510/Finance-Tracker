<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Edit Category</h3>
        <button @click="$emit('close')" class="close-btn">×</button>
      </div>
      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="form-group">
          <label>Category Name</label>
          <input v-model="editedCategory.name" type="text" required />
        </div>
        <div class="form-group">
          <label>Icon</label>
          <input v-model="editedCategory.icon" type="text" maxlength="2" required />
        </div>
        <div class="form-group">
          <label>Color</label>
          <input v-model="editedCategory.color" type="color" required />
        </div>
        <div class="form-group">
          <label>Preview</label>
          <div class="category-preview">
            <div 
              class="preview-card"
              :style="{ backgroundColor: editedCategory.color }"
            >
              <span class="preview-icon">{{ editedCategory.icon }}</span>
              <span class="preview-name">{{ editedCategory.name }}</span>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" @click="$emit('close')" class="cancel-btn">Cancel</button>
          <button type="submit" :disabled="loading" class="save-btn">
            {{ loading ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const props = defineProps({
  category: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'save'])

const editedCategory = reactive({ ...props.category })

const handleSubmit = () => {
  emit('save', { ...editedCategory })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  color: #2d3748;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #a0aec0;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #718096;
}

.modal-form {
  padding: 25px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2d3748;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.category-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80px;
}

.preview-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px;
  border-radius: 8px;
  color: white;
  min-width: 100px;
  text-align: center;
}

.preview-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.preview-name {
  font-size: 12px;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 25px;
}

.cancel-btn, .save-btn {
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: #e2e8f0;
  color: #4a5568;
}

.cancel-btn:hover {
  background: #cbd5e0;
}

.save-btn {
  background: #667eea;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #5a67d8;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
