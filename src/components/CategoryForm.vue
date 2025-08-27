<template>
  <div class="add-category-section">
    <div class="section-header">
      <h2>🏷️ Create New Category</h2>
      <p>Organize your expenses with custom categories</p>
    </div>
    
    <form @submit.prevent="handleSubmit" class="category-form">
      <div class="form-row">
        <div class="form-group">
          <label>Category Name *</label>
          <input 
            v-model="modelValue.name" 
            type="text" 
            placeholder="Enter category name"
            required 
          />
        </div>
        <div class="form-group">
          <label>Category Type *</label>
          <select v-model="modelValue.type" required class="type-select">
            <option value="expense">💳 Expense</option>
            <option value="income">💰 Income</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Icon *</label>
          <div class="icon-selector">
            <input 
              v-model="modelValue.icon" 
              type="text" 
              placeholder="🛍️"
              maxlength="2"
              class="icon-input"
              required 
            />
            <div class="icon-suggestions">
              <button 
                v-for="icon in getCurrentIcons" 
                :key="icon"
                type="button"
                @click="modelValue.icon = icon"
                class="icon-option"
              >
                {{ icon }}
              </button>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>Color *</label>
          <div class="color-selector">
            <input 
              v-model="modelValue.color" 
              type="color" 
              class="color-input"
              required 
            />
            <div class="color-suggestions">
              <button 
                v-for="color in popularColors" 
                :key="color"
                type="button"
                @click="modelValue.color = color"
                :style="{ backgroundColor: color }"
                class="color-option"
              ></button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Preview</label>
          <div class="category-preview">
            <div 
              class="preview-card"
              :style="{ backgroundColor: modelValue.color }"
            >
              <span class="preview-icon">{{ modelValue.icon || '📦' }}</span>
              <span class="preview-name">{{ modelValue.name || 'Category Name' }}</span>
              <span class="preview-type">{{ modelValue.type === 'income' ? 'Income' : 'Expense' }}</span>
            </div>
          </div>
        </div>
        <div class="form-group">
          <!-- Empty for spacing -->
        </div>
      </div>
      
      <button type="submit" :disabled="loading" class="add-btn">
        {{ loading ? 'Creating...' : 'Create Category' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

// Popular icons and colors
const expenseIcons = ['🍽️', '🚗', '🛍️', '🎬', '⚡', '🏥', '📚', '✈️', '🏠', '💡', '🎮', '☕', '👕', '💊', '📱', '🚌']
const incomeIcons = ['💼', '💻', '📈', '🏢', '🏠', '🎁', '🚀', '💰', '💳', '🏦', '📊', '💎', '🎯', '⚡', '🔥', '💵']
const popularColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#AED6F1', '#F8C471', '#82E0AA', '#F1948A']

// Computed properties
const getCurrentIcons = computed(() => {
  return props.modelValue.type === 'income' ? incomeIcons : expenseIcons
})

const handleSubmit = () => {
  emit('submit')
}
</script>

<style scoped>
.add-category-section {
  background: var(--color-surface-elevated);
  padding: var(--space-8);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  border: 1px solid var(--color-border-primary);
}

.section-header {
  margin-bottom: var(--space-6);
}

.section-header h2 {
  color: var(--color-text-primary);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-1) 0;
}

.section-header p {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin: 0;
}

.category-form .form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
  margin-bottom: var(--space-6);
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

.form-group select.type-select {
  width: 100%;
  padding: var(--input-padding-y) var(--input-padding-x);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  background: var(--color-surface-primary);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: var(--transition-colors);
  height: var(--input-height-base);
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}

.form-group input::placeholder {
  color: var(--color-text-placeholder);
}

.icon-selector, .color-selector {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.icon-input {
  text-align: center;
  font-size: var(--font-size-lg);
}

.icon-suggestions, .color-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.icon-option {
  width: 40px;
  height: 40px;
  border: 2px solid var(--color-border-primary);
  background: var(--color-surface-primary);
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-size: var(--font-size-lg);
  transition: var(--transition-all);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-option:hover {
  border-color: var(--color-primary);
  transform: scale(1.1);
  background: var(--color-primary-50);
}

.color-input {
  width: 60px;
  height: 40px;
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  cursor: pointer;
  padding: var(--space-1);
}

.color-option {
  width: 30px;
  height: 30px;
  border: 2px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-all);
}

.color-option:hover {
  transform: scale(1.2);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.category-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  background: var(--color-surface-primary);
  border-radius: var(--radius-lg);
  border: 2px dashed var(--color-border-primary);
}

.preview-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  color: var(--color-text-inverse);
  min-width: 120px;
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.preview-icon {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--space-1);
}

.preview-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-1);
}

.preview-type {
  font-size: var(--font-size-xs);
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
  font-weight: var(--font-weight-medium);
}

.add-btn {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border: none;
  padding: var(--space-4) var(--space-8);
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  transition: var(--transition-all);
  height: var(--button-height-lg);
  box-shadow: var(--shadow-sm);
}

.add-btn:hover:not(:disabled) {
  background: var(--color-primary-700);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.add-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Responsive Design */
@media (max-width: 768px) {
  .category-form .form-row {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
  
  .add-category-section {
    padding: var(--space-5);
  }
  
  .section-header h2 {
    font-size: var(--font-size-xl);
  }
  
  .icon-suggestions, .color-suggestions {
    gap: var(--space-1);
  }
  
  .icon-option {
    width: 36px;
    height: 36px;
  }
  
  .color-option {
    width: 28px;
    height: 28px;
  }
}

@media (max-width: 480px) {
  .add-category-section {
    padding: var(--space-4);
  }
  
  .category-preview {
    height: 80px;
  }
  
  .preview-card {
    min-width: 100px;
    padding: var(--space-3);
  }
  
  .preview-icon {
    font-size: var(--font-size-xl);
  }
  
  .add-btn {
    width: 100%;
  }
}
</style>
