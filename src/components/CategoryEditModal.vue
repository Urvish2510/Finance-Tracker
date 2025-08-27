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
  background: var(--color-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-index-modal);
}

.modal-content {
  background: var(--color-surface-elevated);
  border-radius: var(--card-radius);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--color-border-primary);
}

.modal-header {
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--color-border-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-surface-primary);
}

.modal-header h3 {
  color: var(--color-text-primary);
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.close-btn {
  background: none;
  border: none;
  font-size: var(--font-size-2xl);
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: var(--transition-colors);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
}

.close-btn:hover {
  color: var(--color-text-primary);
  background: var(--color-surface-hover);
}

.modal-form {
  padding: var(--space-6);
}

.form-group {
  margin-bottom: var(--space-5);
}

.form-group label {
  display: block;
  margin-bottom: var(--space-2);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.form-group input {
  width: 100%;
  padding: var(--input-padding-y) var(--input-padding-x);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  background: var(--color-surface-primary);
  color: var(--color-text-primary);
  transition: var(--transition-colors);
  height: var(--input-height-base);
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}

.form-group input[type="color"] {
  height: var(--input-height-base);
  padding: var(--space-1);
  cursor: pointer;
}

.category-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80px;
  background: var(--color-surface-primary);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--color-border-primary);
}

.preview-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  color: var(--color-text-inverse);
  min-width: 100px;
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.preview-icon {
  font-size: var(--font-size-xl);
  margin-bottom: var(--space-1);
}

.preview-name {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}

.modal-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: flex-end;
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border-primary);
}

.cancel-btn, .save-btn {
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  border: none;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-all);
  height: var(--button-height-base);
}

.cancel-btn {
  background: var(--color-gray-100);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-primary);
}

.cancel-btn:hover {
  background: var(--color-gray-200);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.save-btn {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.save-btn:hover:not(:disabled) {
  background: var(--color-primary-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Responsive Design */
@media (max-width: 480px) {
  .modal-content {
    width: 95%;
    margin: var(--space-4);
  }
  
  .modal-header {
    padding: var(--space-4);
  }
  
  .modal-form {
    padding: var(--space-4);
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .cancel-btn, .save-btn {
    width: 100%;
  }
  
  .category-preview {
    height: 60px;
  }
  
  .preview-card {
    min-width: 80px;
    padding: var(--space-3);
  }
}
</style>
