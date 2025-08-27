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
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: var(--space-5);
  gap: var(--space-8);
  display: flex;
  flex-direction: column;
}

.categories-list-section {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-primary);
  padding: var(--space-8);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-6);
}

.section-header h2 {
  color: var(--color-text-primary);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-1);
}

.section-header p {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.list-actions {
  display: flex;
  gap: var(--space-4);
  align-items: center;
}

.refresh-btn {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border: none;
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: var(--transition-all);
  height: var(--button-height-base);
}

.refresh-btn:hover:not(:disabled) {
  background: var(--color-primary-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-input {
  padding: var(--input-padding-y) var(--input-padding-x);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  width: 250px;
  font-size: var(--font-size-sm);
  background: var(--color-surface-primary);
  color: var(--color-text-primary);
  transition: var(--transition-colors);
  height: var(--input-height-base);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-input::placeholder {
  color: var(--color-text-placeholder);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--space-5);
}

/* Responsive Design */
@media (max-width: 768px) {
  .categories-page {
    padding: var(--space-4);
    gap: var(--space-5);
  }
  
  .section-header {
    flex-direction: column;
    gap: var(--space-5);
    align-items: stretch;
  }
  
  .section-header h2 {
    font-size: var(--font-size-xl);
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
    padding: var(--space-5);
  }
}

@media (max-width: 480px) {
  .categories-page {
    padding: var(--space-3);
  }
  
  .categories-list-section {
    padding: var(--space-4);
  }
  
  .section-header h2 {
    font-size: var(--font-size-lg);
  }
  
  .refresh-btn {
    padding: var(--space-2) var(--space-4);
    font-size: var(--font-size-xs);
  }
}
</style>
