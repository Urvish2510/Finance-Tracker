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
          <button @click="handleLoadCategories(true)" :disabled="categoriesLoading" class="refresh-btn">
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
import { useGlobalStore } from '../composables/useGlobalStore.js'
import CategoryForm from '../components/CategoryForm.vue'
import CategoryCard from '../components/CategoryCard.vue'
import CategoryEditModal from '../components/CategoryEditModal.vue'
import ErrorMessage from '../components/ErrorMessage.vue'
import EmptyState from '../components/EmptyState.vue'

// Global Store
const {
  categories,
  categoriesLoading,
  categoriesError,
  expenses,
  isConnected,
  loadCategories,
  loadExpenses,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
  initialize
} = useGlobalStore()

// Local state
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
const handleLoadCategories = async (force = false) => {
  try {
    console.log('🔄 Loading categories...')
    await loadCategories(force)
    console.log('✅ Categories loaded successfully')
  } catch (error) {
    console.error('❌ Failed to load categories:', error.message)
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
    await createCategory({ ...newCategory })
    resetForm()
  } catch (error) {
    // Error is already handled by global store
    console.error('Failed to create category:', error)
  }
}

const handleEditCategory = (category) => {
  editingCategory.value = { ...category }
}

const handleUpdateCategory = async (updatedCategory) => {
  try {
    await updateCategory(updatedCategory._id, updatedCategory)
    editingCategory.value = null
  } catch (error) {
    // Error is already handled by global store
    console.error('Failed to update category:', error)
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
    await deleteCategory(categoryId)
  } catch (error) {
    // Error is already handled by global store
    console.error('Failed to delete category:', error)
  }
}

// Initialize on mount
onMounted(async () => {
  console.log('📋 Categories page mounting...')
  
  try {
    // Ensure global store is initialized
    await initialize()
    
    // Load data (will use cache if fresh)
    await Promise.all([
      loadCategories(),
      loadExpenses()
    ])
    
    console.log('✅ Categories page initialized with global store')
  } catch (error) {
    console.error('❌ Failed to initialize categories page:', error)
  }
})
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
