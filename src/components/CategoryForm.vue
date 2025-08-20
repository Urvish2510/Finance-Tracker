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
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}

.section-header {
  margin-bottom: 25px;
}

.section-header h2 {
  color: #2d3748;
  font-size: 24px;
  margin-bottom: 5px;
}

.section-header p {
  color: #718096;
  font-size: 14px;
}

.category-form .form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  margin-bottom: 25px;
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

.form-group select.type-select {
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.icon-selector, .color-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.icon-input {
  text-align: center;
  font-size: 18px;
}

.icon-suggestions, .color-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.icon-option {
  width: 40px;
  height: 40px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s;
}

.icon-option:hover {
  border-color: #667eea;
  transform: scale(1.1);
}

.color-input {
  width: 60px;
  height: 40px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.color-option {
  width: 30px;
  height: 30px;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.color-option:hover {
  transform: scale(1.2);
  border-color: #667eea;
}

.category-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
}

.preview-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px;
  border-radius: 8px;
  color: white;
  min-width: 120px;
  text-align: center;
}

.preview-icon {
  font-size: 24px;
  margin-bottom: 5px;
}

.preview-name {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 2px;
}

.preview-type {
  font-size: 11px;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.add-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: transform 0.2s;
}

.add-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.add-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .category-form .form-row {
    grid-template-columns: 1fr;
  }
  
  .add-category-section {
    padding: 20px;
  }
}
</style>
