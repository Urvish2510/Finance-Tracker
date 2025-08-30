<template>
  <div class="deposits-view">
    <!-- Header -->
    <div class="header-section">
      <h1 class="page-title">💰 Income & Deposits</h1>
      <button class="btn btn-primary" @click="showAddForm">
        <span class="btn-icon">+</span>
        Add Deposit
      </button>
    </div>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <div class="summary-card">
        <div class="card-icon">📈</div>
        <div class="card-content">
          <h3>Total Income</h3>
          <div class="card-value income">{{ formatCurrency(totalIncome) }}</div>
        </div>
      </div>
      <div class="summary-card">
        <div class="card-icon">📊</div>
        <div class="card-content">
          <h3>This Month</h3>
          <div class="card-value income">{{ formatCurrency(monthlyIncome) }}</div>
        </div>
      </div>
      <div class="summary-card">
        <div class="card-icon">💵</div>
        <div class="card-content">
          <h3>Average</h3>
          <div class="card-value income">{{ formatCurrency(averageIncome) }}</div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Form -->
    <div v-if="showForm" class="form-overlay">
      <DepositForm
        v-model="form"
        :categories="incomeCategories"
        :saving="saving"
        :editing="!!editingDeposit"
        @cancel="hideForm"
        @submit="saveDeposit"
      />
    </div>

    <!-- Deposits List -->
    <div class="deposits-section">
      <div class="section-header">
        <h2>Recent Deposits</h2>
        <div class="filters">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search deposits..."
            class="search-input"
          />
          <select v-model="filterCategory" @change="filterDeposits">
            <option value="">All Categories</option>
            <option
              v-for="category in incomeCategories"
              :key="category._id"
              :value="category._id"
            >
              {{ category.icon }} {{ category.name }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="loading" class="loading">Loading deposits...</div>
      
      <div v-else-if="filteredDeposits.length === 0" class="no-data">
        <div class="no-data-icon">💰</div>
        <h3>No deposits found</h3>
        <p>Add your first deposit to start tracking your income!</p>
      </div>

      <div v-else class="deposits-list">
        <div
          v-for="deposit in paginatedDeposits"
          :key="deposit._id"
          class="deposit-item"
        >
          <div class="deposit-icon">
            {{ getCategoryIcon(deposit.category) }}
          </div>
          <div class="deposit-details">
            <h4 class="deposit-title">{{ deposit.title }}</h4>
            <p class="deposit-description">{{ deposit.description }}</p>
            <div class="deposit-meta">
              <span class="category">{{ getCategoryName(deposit.category) }}</span>
              <span class="date">{{ formatDate(deposit.date) }}</span>
            </div>
          </div>
          <div class="deposit-amount">
            <span class="amount">{{ formatCurrency(deposit.amount) }}</span>
            <div class="deposit-actions">
              <button @click="editDeposit(deposit)" class="action-btn edit-btn">
                ✏️
              </button>
              <button @click="handleDeleteDeposit(deposit._id)" class="action-btn delete-btn">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
          class="page-btn"
        >
          ← Previous
        </button>
        
        <span class="page-info">
          Page {{ currentPage }} of {{ totalPages }} 
          ({{ filteredDeposits.length }} deposits)
        </span>
        
        <button 
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          Next →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useGlobalStore } from '../composables/useGlobalStore.js';
import { useCurrency } from '../composables/useCurrency.js';
import { useToast } from '../composables/useToast.js';
import DepositForm from '../components/DepositForm.vue';

// Use global store
const { 
  categories, 
  deposits, 
  isLoading,
  loadCategories,
  loadDeposits,
  createDeposit,
  updateDeposit,
  deleteDeposit,
  initialize 
} = useGlobalStore()

const { formatCurrency } = useCurrency();
const { success, error: showError } = useToast();

// State
const loading = ref(true);
const saving = ref(false);
const showForm = ref(false);
const editingDeposit = ref(null);
const filterCategory = ref('');
const searchQuery = ref('');

// Pagination
const currentPage = ref(1);
const itemsPerPage = 10;

// Form state
const form = ref({
  title: '',
  amount: '',
  categoryId: '',
  date: new Date().toISOString().split('T')[0],
  description: ''
});

// Computed
const incomeCategories = computed(() => 
  categories.value.filter(cat => cat.type === 'income')
);

const filteredDeposits = computed(() => {
  let filtered = deposits.value;
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(deposit => 
      deposit.title.toLowerCase().includes(query) ||
      deposit.description?.toLowerCase().includes(query)
    );
  }
  
  // Filter by category
  if (filterCategory.value) {
    filtered = filtered.filter(deposit => 
      deposit.category?._id === filterCategory.value ||
      deposit.category_id === filterCategory.value
    );
  }
  
  return filtered;
});

const totalPages = computed(() => {
  return Math.ceil(filteredDeposits.value.length / itemsPerPage);
});

const paginatedDeposits = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredDeposits.value.slice(start, end);
});

const totalIncome = computed(() => 
  deposits.value.reduce((sum, deposit) => sum + deposit.amount, 0)
);

const monthlyIncome = computed(() => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  return deposits.value
    .filter(deposit => {
      const depositDate = new Date(deposit.date);
      return depositDate.getMonth() === currentMonth && depositDate.getFullYear() === currentYear;
    })
    .reduce((sum, deposit) => sum + deposit.amount, 0);
});

const averageIncome = computed(() => {
  if (deposits.value.length === 0) return 0;
  return totalIncome.value / deposits.value.length;
});

// Methods
const showAddForm = () => {
  resetForm();
  showForm.value = true;
};

const hideForm = () => {
  showForm.value = false;
  editingDeposit.value = null;
  resetForm();
};

const resetForm = () => {
  form.value = {
    title: '',
    amount: '',
    categoryId: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  };
};

const saveDeposit = async () => {
  try {
    saving.value = true;
    
    const depositData = {
      title: form.value.title,
      amount: parseFloat(form.value.amount),
      category: form.value.categoryId,
      date: form.value.date,
      description: form.value.description
    };

    if (editingDeposit.value) {
      await updateDeposit(editingDeposit.value._id, depositData);
      success('Deposit updated successfully!');
    } else {
      await createDeposit(depositData);
      success('Deposit added successfully!');
    }

    hideForm();
  } catch (error) {
    console.error('Error saving deposit:', error);
    showError('Failed to save deposit');
  } finally {
    saving.value = false;
  }
};

const editDeposit = (deposit) => {
  editingDeposit.value = deposit;
  form.value = {
    title: deposit.title,
    amount: deposit.amount,
    categoryId: deposit.category?._id || deposit.category_id || '',
    date: new Date(deposit.date).toISOString().split('T')[0],
    description: deposit.description || ''
  };
  showForm.value = true;
};

const handleDeleteDeposit = async (depositId) => {
  if (!confirm('Are you sure you want to delete this deposit?')) return;
  
  try {
    await deleteDeposit(depositId);
    success('Deposit deleted successfully!');
  } catch (error) {
    console.error('Error deleting deposit:', error);
    showError('Failed to delete deposit');
  }
};

const getCategoryIcon = (category) => {
  return category?.icon || '💰';
};

const getCategoryName = (category) => {
  return category?.name || 'Unknown';
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

const filterDeposits = () => {
  // Filtering is handled by computed property
};

// Lifecycle
onMounted(async () => {
  console.log('💰 Deposits view mounted');
  
  try {
    loading.value = true;
    
    // Ensure global store is initialized
    await initialize()
    
    // Load data from global store (will use cache if fresh)
    await Promise.all([
      loadCategories(),
      loadDeposits()
    ])
    
    console.log('✅ Deposits view loaded from global store!');
  } catch (error) {
    console.error('❌ Error loading deposits data:', error);
    showError(`Failed to load data: ${error.message}`);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.deposits-view {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: var(--space-5);
  gap: var(--space-8);
  display: flex;
  flex-direction: column;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-8);
}

.page-title {
  color: var(--color-text-primary);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
}

.btn-icon {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  padding: 0 0.5rem 0 0;
}

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-5);
  margin-bottom: var(--space-8);
}

.summary-card {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--card-radius);
  padding: var(--card-padding);
  box-shadow: var(--card-shadow);
  display: flex;
  align-items: center;
  gap: var(--space-4);
  transition: var(--transition-all);
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.card-icon {
  font-size: var(--font-size-4xl);
  width: var(--size-2xl);
  height: var(--size-2xl);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-secondary);
  border-radius: var(--radius-xl);
  flex-shrink: 0;
}

.card-content h3 {
  margin: 0 0 var(--space-2) 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--line-height-tight);
}

.card-value.income {
  color: var(--color-success-600);
}

/* Form Styles */
.form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-overlay);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-index-modal);
}

.form-container {
  background: var(--color-surface-elevated);
  padding: var(--space-8);
  border-radius: var(--card-radius);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl), 0 0 0 1px var(--color-border-focus);
  border: 1px solid var(--color-border-primary);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border-primary);
}

.form-header h3 {
  margin: 0;
  color: var(--color-primary);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
}

.close-btn {
  background: none;
  border: none;
  font-size: var(--font-size-xl);
  cursor: pointer;
  color: var(--color-text-secondary);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  transition: var(--transition-colors);
}

.close-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
}

.deposit-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: var(--space-2);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: var(--input-padding-y) var(--input-padding-x);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  background: var(--color-surface-primary);
  color: var(--color-text-primary);
  transition: var(--transition-colors);
  height: var(--input-height-base);
}

.form-group textarea {
  height: auto;
  resize: vertical;
  min-height: 80px;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: var(--color-text-placeholder);
}

.form-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: flex-end;
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border-primary);
}

/* Remove duplicate btn definitions since we now use consistent button classes */

/* Deposits Section */
.deposits-section {
  background: var(--color-surface-elevated);
  border-radius: var(--card-radius);
  padding: var(--space-6);
  box-shadow: var(--card-shadow);
  border: 1px solid var(--color-border-primary);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
}

.section-header h2 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
}

.filters {
  display: flex;
  gap: var(--space-3);
  align-items: center;
}

.search-input {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  background: var(--color-surface-primary);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  min-width: 200px;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-alpha);
}

.filters select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  background: var(--color-surface-primary);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.loading {
  text-align: center;
  padding: var(--space-8);
  color: var(--color-text-secondary);
}

.no-data {
  text-align: center;
  padding: var(--space-12) var(--space-4);
}

.no-data-icon {
  font-size: var(--font-size-4xl);
  margin-bottom: var(--space-4);
  opacity: 0.5;
}

.no-data h3 {
  margin: 0 0 var(--space-2) 0;
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
}

.no-data p {
  margin: 0;
  color: var(--color-text-secondary);
}

.deposits-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.deposit-item {
  display: flex;
  align-items: center;
  padding: var(--space-4);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  background: var(--color-surface-primary);
  transition: var(--transition-all);
}

.deposit-item:hover {
  border-color: var(--color-success);
  box-shadow: 0 2px 8px var(--color-success-shadow);
  transform: translateY(-1px);
}

.deposit-icon {
  font-size: var(--font-size-2xl);
  margin-right: var(--space-4);
}

.deposit-details {
  flex: 1;
}

.deposit-title {
  margin: 0 0 var(--space-1) 0;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
}

.deposit-description {
  margin: 0 0 var(--space-2) 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.deposit-meta {
  display: flex;
  gap: var(--space-4);
  font-size: var(--font-size-xs);
}

.category {
  color: var(--color-success);
  font-weight: var(--font-weight-medium);
}

.date {
  color: var(--color-text-secondary);
}

.deposit-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-2);
}

.deposit-amount .amount {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-success);
}

.deposit-actions {
  display: flex;
  gap: var(--space-2);
}

.action-btn {
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-primary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-all);
  font-size: var(--font-size-sm);
}

.edit-btn:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-50);
}

.delete-btn:hover {
  border-color: var(--color-danger);
  background: var(--color-danger-50);
}

/* Responsive Design */
@media (max-width: 768px) {
  .deposits-view {
    padding: var(--space-4);
  }
  
  .header-section {
    flex-direction: column;
    gap: var(--space-4);
    align-items: stretch;
  }
  
  .page-title {
    font-size: var(--font-size-2xl);
  }
  
  .section-header h2 {
    font-size: var(--font-size-xl);
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .section-header {
    flex-direction: column;
    gap: var(--space-4);
    align-items: stretch;
  }
  
  .deposit-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4);
  }
  
  .deposit-amount {
    align-self: stretch;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  
  .summary-cards {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .deposits-view {
    padding: var(--space-3);
  }
  
  .deposits-section {
    padding: var(--space-4);
  }
  
  .page-title {
    font-size: var(--font-size-xl);
  }
  
  .section-header h2 {
    font-size: var(--font-size-lg);
  }
}

/* Pagination Styles */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-5);
  border-top: 1px solid var(--color-border-primary);
}

.page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--button-padding-x-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  line-height: 1;
  border: 1px solid transparent;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition-all);
  user-select: none;
  text-decoration: none;
  white-space: nowrap;
  height: var(--button-height-sm);
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-primary);
}

.page-btn:hover:not(:disabled) {
  background-color: var(--color-primary-700);
  border-color: var(--color-primary-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.page-btn:disabled {
  background-color: var(--color-surface-secondary);
  color: var(--color-text-primary);
  border-color: var(--color-border-primary);
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-sm);
}
</style>
