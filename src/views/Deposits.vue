<template>
  <div class="deposits-view">
    <!-- Header -->
    <div class="header-section">
      <h1 class="page-title">💰 Income & Deposits</h1>
      <button class="btn btn-primary add-btn" @click="showAddForm">
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
          <p class="amount">{{ formatCurrency(totalIncome) }}</p>
        </div>
      </div>
      <div class="summary-card">
        <div class="card-icon">📊</div>
        <div class="card-content">
          <h3>This Month</h3>
          <p class="amount">{{ formatCurrency(monthlyIncome) }}</p>
        </div>
      </div>
      <div class="summary-card">
        <div class="card-icon">💵</div>
        <div class="card-content">
          <h3>Average</h3>
          <p class="amount">{{ formatCurrency(averageIncome) }}</p>
        </div>
      </div>
    </div>

    <!-- Add/Edit Form -->
    <div v-if="showForm" class="form-overlay">
      <div class="form-container">
        <div class="form-header">
          <h3>{{ editingDeposit ? 'Edit' : 'Add' }} Deposit</h3>
          <button class="close-btn" @click="hideForm">×</button>
        </div>
        <form @submit.prevent="saveDeposit" class="deposit-form">
          <div class="form-group">
            <label for="title">Title *</label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              placeholder="e.g., Monthly Salary, Freelance Payment"
              required
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="amount">Amount *</label>
              <input
                id="amount"
                v-model="form.amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                required
              />
            </div>
            <div class="form-group">
              <label for="category">Category *</label>
              <select id="category" v-model="form.categoryId" required>
                <option value="">Select category</option>
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

          <div class="form-group">
            <label for="date">Date *</label>
            <input
              id="date"
              v-model="form.date"
              type="date"
              required
            />
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              v-model="form.description"
              placeholder="Optional description"
              rows="3"
            ></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="hideForm">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving...' : (editingDeposit ? 'Update' : 'Add') }} Deposit
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Deposits List -->
    <div class="deposits-section">
      <div class="section-header">
        <h2>Recent Deposits</h2>
        <div class="filters">
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
          v-for="deposit in filteredDeposits"
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useGlobalStore } from '../composables/useGlobalStore.js';
import { useCurrency } from '../composables/useCurrency.js';
import { useToast } from '../composables/useToast.js';

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
  if (!filterCategory.value) return deposits.value;
  return deposits.value.filter(deposit => 
    deposit.category?._id === filterCategory.value ||
    deposit.category_id === filterCategory.value
  );
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
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.btn-icon {
  font-size: 1.2rem;
  font-weight: bold;
}

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.summary-card {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-icon {
  font-size: 2.5rem;
  opacity: 0.9;
}

.card-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.9;
}

.card-content .amount {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
}

/* Form Styles */
.form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.form-container {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.form-header h3 {
  margin: 0;
  color: #2d3748;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #718096;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-btn:hover {
  background: #f7fafc;
}

.deposit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #4a5568;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #28a745;
  box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #28a745;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #218838;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

/* Deposits Section */
.deposits-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin: 0;
  color: #2d3748;
}

.filters select {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #718096;
}

.no-data {
  text-align: center;
  padding: 3rem 1rem;
}

.no-data-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.no-data h3 {
  margin: 0 0 0.5rem 0;
  color: #4a5568;
}

.no-data p {
  margin: 0;
  color: #718096;
}

.deposits-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.deposit-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.deposit-item:hover {
  border-color: #28a745;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.1);
}

.deposit-icon {
  font-size: 2rem;
  margin-right: 1rem;
}

.deposit-details {
  flex: 1;
}

.deposit-title {
  margin: 0 0 0.25rem 0;
  font-weight: 600;
  color: #2d3748;
}

.deposit-description {
  margin: 0 0 0.5rem 0;
  color: #718096;
  font-size: 0.9rem;
}

.deposit-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
}

.category {
  color: #28a745;
  font-weight: 500;
}

.date {
  color: #718096;
}

.deposit-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.deposit-amount .amount {
  font-size: 1.2rem;
  font-weight: 700;
  color: #28a745;
}

.deposit-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: none;
  border: 1px solid #e2e8f0;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn:hover {
  border-color: #3182ce;
  background: #ebf8ff;
}

.delete-btn:hover {
  border-color: #e53e3e;
  background: #fed7d7;
}

@media (max-width: 768px) {
  .deposits-view {
    padding: 1rem;
  }
  
  .header-section {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .deposit-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .deposit-amount {
    align-self: stretch;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
