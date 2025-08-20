<template>
  <div class="categories-page">
    <!-- Add Category Section -->
    <div class="add-category-section">
      <div class="section-header">
        <h2>🏷️ Create New Category</h2>
        <p>Organize your expenses with custom categories</p>
      </div>
      
      <form @submit.prevent="addNewCategory" class="category-form">
        <div class="form-row">
          <div class="form-group">
            <label>Category Name *</label>
            <input 
              v-model="newCategory.name" 
              type="text" 
              placeholder="Enter category name"
              required 
            />
          </div>
          <div class="form-group">
            <label>Category Type *</label>
            <select v-model="newCategory.type" required class="type-select">
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
                v-model="newCategory.icon" 
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
                  @click="newCategory.icon = icon"
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
                v-model="newCategory.color" 
                type="color" 
                class="color-input"
                required 
              />
              <div class="color-suggestions">
                <button 
                  v-for="color in popularColors" 
                  :key="color"
                  type="button"
                  @click="newCategory.color = color"
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
                :style="{ backgroundColor: newCategory.color }"
              >
                <span class="preview-icon">{{ newCategory.icon || '📦' }}</span>
                <span class="preview-name">{{ newCategory.name || 'Category Name' }}</span>
                <span class="preview-type">{{ newCategory.type === 'income' ? 'Income' : 'Expense' }}</span>
              </div>
            </div>
          </div>
          <div class="form-group">
            <!-- Empty for spacing -->
          </div>
        </div>
        
        <button type="submit" :disabled="categoriesLoading" class="add-btn">
          {{ categoriesLoading ? 'Creating...' : 'Create Category' }}
        </button>
      </form>
    </div>

    <!-- Categories List -->
    <div class="categories-list-section">
      <div class="section-header">
        <div>
          <h2>📋 Your Categories</h2>
          <p>Manage and organize your expense categories</p>
        </div>
        <div class="list-actions">
          <button @click="loadCategories" :disabled="categoriesLoading" class="refresh-btn">
            {{ categoriesLoading ? 'Loading...' : '🔄 Refresh' }}
          </button>
          <div class="search-box">
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search categories..."
              class="search-input"
            />
          </div>
        </div>
      </div>

  <!-- ...existing code... -->

      <!-- Error Message -->
      <div v-if="categoriesError" class="error-message">
        ❌ Error: {{ categoriesError }}
      </div>

      <!-- No Data Message -->
      <div v-if="filteredCategories.length === 0 && !categoriesLoading" class="no-data">
        <div class="no-data-icon">🏷️</div>
        <h3>No categories found</h3>
        <p>{{ searchQuery ? 'Try adjusting your search terms' : 'Create your first category above to get started' }}</p>
      </div>

      <!-- Categories Grid -->
      <div v-else class="categories-grid">
        <div 
          v-for="category in filteredCategories" 
          :key="category._id" 
          class="category-card"
          :class="{ 'has-expenses': getCategoryExpenseCount(category._id) > 0 }"
        >
          <div 
            class="category-header"
            :style="{ backgroundColor: category.color }"
          >
            <div class="category-info">
              <span class="category-icon">{{ category.icon }}</span>
              <h3 class="category-name">{{ category.name }}</h3>
            </div>
            <div class="category-actions">
              <button @click="editCategory(category)" class="edit-btn">✏️</button>
              <button @click="deleteCategory(category._id)" class="delete-btn">🗑️</button>
            </div>
          </div>
          
          <div class="category-body">
            <div class="category-stats">
              <div class="stat">
                <span class="stat-label">Expenses:</span>
                <span class="stat-value">{{ getCategoryExpenseCount(category._id) }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Total:</span>
                <span class="stat-value">₹{{ getCategoryTotal(category._id).toFixed(2) }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Average:</span>
                <span class="stat-value">
                  ₹{{ getCategoryExpenseCount(category._id) > 0 ? 
                    (getCategoryTotal(category._id) / getCategoryExpenseCount(category._id)).toFixed(2) : '0.00' }}
                </span>
              </div>
            </div>
            
            <div v-if="getCategoryExpenseCount(category._id) > 0" class="recent-expenses">
              <h4>Recent Expenses:</h4>
              <div class="expense-list">
                <div 
                  v-for="expense in getCategoryRecentExpenses(category._id)" 
                  :key="expense._id"
                  class="expense-item"
                >
                  <span class="expense-title">{{ expense.title }}</span>
                  <span class="expense-amount">₹{{ expense.amount.toFixed(2) }}</span>
                </div>
              </div>
            </div>
            
            <div v-else class="no-expenses">
              <span>No expenses in this category yet</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="editingCategory" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Edit Category</h3>
          <button @click="closeEditModal" class="close-btn">×</button>
        </div>
        <form @submit.prevent="updateCategory" class="modal-form">
          <div class="form-group">
            <label>Category Name</label>
            <input v-model="editingCategory.name" type="text" required />
          </div>
          <div class="form-group">
            <label>Icon</label>
            <input v-model="editingCategory.icon" type="text" maxlength="2" required />
          </div>
          <div class="form-group">
            <label>Color</label>
            <input v-model="editingCategory.color" type="color" required />
          </div>
          <div class="form-group">
            <label>Preview</label>
            <div class="category-preview">
              <div 
                class="preview-card"
                :style="{ backgroundColor: editingCategory.color }"
              >
                <span class="preview-icon">{{ editingCategory.icon }}</span>
                <span class="preview-name">{{ editingCategory.name }}</span>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeEditModal" class="cancel-btn">Cancel</button>
            <button type="submit" :disabled="categoriesLoading" class="save-btn">
              {{ categoriesLoading ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useCategories, useExpenses } from '../composables/useDatabase.js'
import { useToast } from '../composables/useToast.js'

// Composables
const { success, error: showError, warning } = useToast()
const { 
  categories, 
  loading: categoriesLoading, 
  error: categoriesError, 
  fetchCategories, 
  addCategory, 
  updateCategory: updateCategoryService,
  deleteCategory: deleteCategoryService 
} = useCategories()

const { expenses, fetchExpenses } = useExpenses()

// Reactive data
const searchQuery = ref('')
const editingCategory = ref(null)

const newCategory = reactive({
  name: '',
  icon: '📦',
  color: '#3498db',
  type: 'expense'
})

// Popular icons and colors
const expenseIcons = ['🍽️', '🚗', '🛍️', '🎬', '⚡', '🏥', '📚', '✈️', '🏠', '💡', '🎮', '☕', '👕', '💊', '📱', '🚌']
const incomeIcons = ['💼', '💻', '📈', '🏢', '🏠', '🎁', '🚀', '💰', '💳', '🏦', '📊', '💎', '🎯', '⚡', '🔥', '💵']
const popularColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#AED6F1', '#F8C471', '#82E0AA', '#F1948A']

// Computed properties
const getCurrentIcons = computed(() => {
  return newCategory.type === 'income' ? incomeIcons : expenseIcons
})
const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories.value
  
  const query = searchQuery.value.toLowerCase()
  return categories.value.filter(category => 
    category.name.toLowerCase().includes(query)
  )
})

// ...existing code...

// Methods
const loadCategories = async () => {
  await fetchCategories()
}

const loadExpenses = async () => {
  await fetchExpenses()
}

const addNewCategory = async () => {
  try {
    await addCategory({ ...newCategory })
    
    // Reset form
    newCategory.name = ''
    newCategory.icon = '📦'
    newCategory.color = '#3498db'
    newCategory.type = 'expense'
    
    success('Category created successfully!')
  } catch (error) {
    showError(`Failed to create category: ${error.message}`)
  }
}

const editCategory = (category) => {
  editingCategory.value = { ...category }
}

const closeEditModal = () => {
  editingCategory.value = null
}

const updateCategory = async () => {
  try {
    await updateCategoryService(editingCategory.value._id, editingCategory.value)
    editingCategory.value = null
    success('Category updated successfully!')
  } catch (error) {
    showError(`Failed to update category: ${error.message}`)
  }
}

const deleteCategory = async (id) => {
  const expenseCount = getCategoryExpenseCount(id)
  const category = categories.value.find(c => c._id === id)
  
  if (expenseCount > 0) {
    if (!confirm(`This category "${category?.name}" has ${expenseCount} expenses. Are you sure you want to delete it? This action cannot be undone.`)) {
      return
    }
  } else {
    if (!confirm(`Are you sure you want to delete the category "${category?.name}"?`)) {
      return
    }
  }
  
  try {
    await deleteCategoryService(id)
    success('Category deleted successfully!')
  } catch (error) {
    showError(`Failed to delete category: ${error.message}`)
  }
}

const getCategoryExpenseCount = (categoryId) => {
  return expenses.value.filter(expense => expense.category._id === categoryId).length
}

const getCategoryTotal = (categoryId) => {
  return expenses.value
    .filter(expense => expense.category._id === categoryId)
    .reduce((sum, expense) => sum + expense.amount, 0)
}

const getCategoryRecentExpenses = (categoryId) => {
  return expenses.value
    .filter(expense => expense.category._id === categoryId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3)
}

// Load data on mount
onMounted(async () => {
  try {
    await loadCategories()
    await loadExpenses()
    console.log('Categories page loaded!')
  } catch (error) {
    console.error('Error loading categories data:', error)
    showError(`Failed to load data: ${error.message}. Please ensure the backend server is running and MongoDB is connected.`)
  }
})
</script>

<style scoped>
.categories-page {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

.add-category-section {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  margin-bottom: 30px;
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

.add-btn:hover {
  transform: translateY(-2px);
}

.categories-list-section {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}

.list-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

.refresh-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.search-input {
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  width: 250px;
  font-size: 14px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.stat-icon {
  font-size: 32px;
  opacity: 0.8;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #2d3748;
}

.stat-label {
  font-size: 14px;
  color: #718096;
}

.error-message {
  background: #fed7d7;
  color: #c53030;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

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

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.category-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  transition: all 0.2s;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.category-card.has-expenses {
  border-left: 4px solid #38a169;
}

.category-header {
  padding: 20px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-icon {
  font-size: 24px;
}

.category-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.category-actions {
  display: flex;
  gap: 8px;
}

.edit-btn, .delete-btn {
  padding: 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  transition: background 0.2s;
}

.edit-btn:hover, .delete-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.category-body {
  padding: 20px;
}

.category-stats {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e2e8f0;
}

.stat {
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: #718096;
  display: block;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 16px;
  font-weight: bold;
  color: #2d3748;
}

.recent-expenses h4 {
  color: #4a5568;
  font-size: 14px;
  margin-bottom: 10px;
}

.expense-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.expense-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.expense-title {
  color: #4a5568;
  flex: 1;
}

.expense-amount {
  color: #e53e3e;
  font-weight: 600;
}

.no-expenses {
  text-align: center;
  color: #a0aec0;
  font-style: italic;
  font-size: 14px;
}

/* Modal styles */
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
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #a0aec0;
}

.modal-form {
  padding: 25px;
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
}

.cancel-btn {
  background: #e2e8f0;
  color: #4a5568;
}

.save-btn {
  background: #667eea;
  color: white;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 20px;
  }
  
  .list-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .search-input {
    width: 100%;
  }
  
  .category-form .form-row {
    grid-template-columns: 1fr;
  }
  
  .categories-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .category-stats {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}
</style>
