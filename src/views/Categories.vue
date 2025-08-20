<template>
  <div class="categories-page">
    <!-- Add Category Form -->
    <CategoryForm 
      v-model="newCategory" 
      :loading="categoriesLoading"
      @submit="handleAddCategory"
    />

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
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search categories..."
            class="search-input"
          />
        </div>
      </div>

      <!-- Error State -->
      <ErrorMessage v-if="categoriesError" :message="categoriesError" />

      <!-- Empty State -->
      <EmptyState 
        v-if="filteredCategories.length === 0 && !categoriesLoading"
        :is-search="!!searchQuery"
      />

      <!-- Categories Grid -->
      <div v-else class="categories-grid">
        <CategoryCard 
          v-for="category in filteredCategories" 
          :key="category._id" 
          :category="category"
          :stats="getCategoryStats(category._id)"
          @edit="handleEditCategory"
          @delete="handleDeleteCategory"
        />
      </div>
    </div>

    <!-- Edit Modal -->
    <CategoryEditModal 
      v-if="editingCategory" 
      :category="editingCategory"
      :loading="categoriesLoading"
      @close="editingCategory = null"
      @save="handleUpdateCategory"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useCategories, useExpenses } from '../composables/useDatabase.js'
import { useToast } from '../composables/useToast.js'
import CategoryForm from '../components/CategoryForm.vue'
import CategoryCard from '../components/CategoryCard.vue'
import CategoryEditModal from '../components/CategoryEditModal.vue'
import ErrorMessage from '../components/ErrorMessage.vue'
import EmptyState from '../components/EmptyState.vue'

// Composables
const { success, error: showError } = useToast()
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

// State
const searchQuery = ref('')
const editingCategory = ref(null)

const newCategory = reactive({
  name: '',
  icon: '📦',
  color: '#3498db',
  type: 'expense'
})

// Computed
const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories.value
  
  const query = searchQuery.value.toLowerCase()
  return categories.value.filter(category => 
    category.name.toLowerCase().includes(query)
  )
})

// Methods
const loadCategories = async () => {
  try {
    console.log('🔄 Loading categories...')
    await fetchCategories()
    console.log('✅ Categories loaded successfully')
  } catch (error) {
    console.error('❌ Failed to load categories:', error.message)
    showError(`Failed to load categories: ${error.message}`)
  }
}

const loadExpenses = async () => {
  try {
    console.log('🔄 Loading expenses...')
    await fetchExpenses()
    console.log('✅ Expenses loaded successfully')
  } catch (error) {
    console.error('❌ Failed to load expenses:', error.message)
    // Don't show error for expenses as it's secondary data
  }
}

const resetForm = () => {
  newCategory.name = ''
  newCategory.icon = '📦'
  newCategory.color = '#3498db'
  newCategory.type = 'expense'
}

const handleAddCategory = async () => {
  try {
    await addCategory({ ...newCategory })
    resetForm()
    success('Category created successfully!')
  } catch (error) {
    showError(`Failed to create category: ${error.message}`)
  }
}

const handleEditCategory = (category) => {
  editingCategory.value = { ...category }
}

const handleUpdateCategory = async (updatedCategory) => {
  try {
    await updateCategoryService(updatedCategory._id, updatedCategory)
    editingCategory.value = null
    success('Category updated successfully!')
  } catch (error) {
    showError(`Failed to update category: ${error.message}`)
  }
}

const handleDeleteCategory = async (categoryId) => {
  const stats = getCategoryStats(categoryId)
  const category = categories.value.find(c => c._id === categoryId)
  
  const message = stats.count > 0 
    ? `This category "${category?.name}" has ${stats.count} items. Are you sure you want to delete it? This action cannot be undone.`
    : `Are you sure you want to delete the category "${category?.name}"?`
  
  if (!confirm(message)) return
  
  try {
    await deleteCategoryService(categoryId)
    success('Category deleted successfully!')
  } catch (error) {
    showError(`Failed to delete category: ${error.message}`)
  }
}

const getCategoryStats = (categoryId) => {
  const categoryExpenses = expenses.value.filter(expense => expense.category._id === categoryId)
  const count = categoryExpenses.length
  const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const average = count > 0 ? total / count : 0
  const recent = categoryExpenses
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3)
  
  return { count, total, average, recent }
}

// Load data on mount
onMounted(async () => {
  console.log('📋 Categories page mounting...')
  
  try {
    // Wait a bit for servers to be ready if just refreshed
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Load data with retry logic
    await loadDataWithRetry()
  } catch (error) {
    console.error('Error loading categories data:', error)
    showError(`Failed to load data: ${error.message}. Please ensure the backend server is running and MongoDB is connected.`)
  }
})

const loadDataWithRetry = async (maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📋 Loading data (attempt ${attempt}/${maxRetries})...`)
      await Promise.all([loadCategories(), loadExpenses()])
      console.log('✅ Categories page data loaded successfully!')
      return
    } catch (error) {
      console.warn(`⚠️ Attempt ${attempt} failed:`, error.message)
      
      if (attempt === maxRetries) {
        throw error
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
    }
  }
}
</script>

<style scoped>
.categories-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  gap: 30px;
  display: flex;
  flex-direction: column;
}

.categories-list-section {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
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
  transition: background 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: #5a67d8;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-input {
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  width: 250px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

@media (max-width: 768px) {
  .categories-page {
    padding: 15px;
    gap: 20px;
  }
  
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
  
  .categories-grid {
    grid-template-columns: 1fr;
  }
  
  .categories-list-section {
    padding: 20px;
  }
}
</style>
