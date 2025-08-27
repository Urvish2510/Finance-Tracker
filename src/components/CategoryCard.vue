<template>
  <div 
    class="category-card"
    :class="{ 'has-expenses': stats.count > 0 }"
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
        <button @click="$emit('edit', category)" class="edit-btn">✏️</button>
        <button @click="$emit('delete', category._id)" class="delete-btn">🗑️</button>
      </div>
    </div>
    
    <div class="category-body">
      <div class="category-stats">
        <div class="stat">
          <span class="stat-label">{{ category.type === 'income' ? 'Income' : 'Expenses' }}:</span>
          <span class="stat-value">{{ stats.count }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Total:</span>
          <span class="stat-value">₹{{ stats.total.toFixed(2) }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Average:</span>
          <span class="stat-value">₹{{ stats.average.toFixed(2) }}</span>
        </div>
      </div>
      
      <div v-if="stats.count > 0" class="recent-expenses">
        <h4>{{ category.type === 'income' ? 'Recent Incomes:' : 'Recent Expenses:' }}</h4>
        <div class="expense-list">
          <div 
            v-for="expense in stats.recent" 
            :key="expense._id"
            class="expense-item"
          >
            <span class="expense-title">{{ expense.title }}</span>
            <span class="expense-amount">₹{{ expense.amount.toFixed(2) }}</span>
          </div>
        </div>
      </div>
      
      <div v-else class="no-expenses">
        <span>{{ category.type === 'income' ? 'No incomes in this category yet' : 'No expenses in this category yet' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  category: {
    type: Object,
    required: true
  },
  stats: {
    type: Object,
    required: true,
    default: () => ({ count: 0, total: 0, average: 0, recent: [] })
  }
})

defineEmits(['edit', 'delete'])
</script>

<style scoped>
.category-card {
  border: 1px solid var(--color-border-primary);
  border-radius: var(--card-radius);
  overflow: hidden;
  background: var(--color-surface-elevated);
  transition: var(--transition-all);
  box-shadow: var(--card-shadow);
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.category-card.has-expenses {
  border-left: 4px solid var(--color-success);
}

.category-header {
  padding: var(--space-5);
  color: var(--color-text-inverse);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.category-icon {
  font-size: var(--font-size-2xl);
}

.category-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin: 0;
}

.category-actions {
  display: flex;
  gap: var(--space-2);
}

.edit-btn, .delete-btn {
  padding: var(--space-2);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-sm);
  background: rgba(255, 255, 255, 0.2);
  color: var(--color-text-inverse);
  transition: var(--transition-colors);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn:hover, .delete-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.category-body {
  padding: var(--space-5);
}

.category-stats {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--space-4);
  margin-bottom: var(--space-5);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border-primary);
}

.stat {
  text-align: center;
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  display: block;
  margin-bottom: var(--space-1);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
  font-weight: var(--font-weight-medium);
}

.stat-value {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.recent-expenses h4 {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--space-3) 0;
}

.expense-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.expense-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
  padding: var(--space-2);
  border-radius: var(--radius-md);
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-light);
}

.expense-title {
  color: var(--color-text-primary);
  flex: 1;
  margin-right: var(--space-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.expense-amount {
  color: var(--color-danger);
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-family-mono);
}

.no-expenses {
  text-align: center;
  color: var(--color-text-tertiary);
  font-style: italic;
  font-size: var(--font-size-sm);
  padding: var(--space-6) var(--space-4);
  background: var(--color-surface-primary);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--color-border-primary);
}

/* Responsive Design */
@media (max-width: 768px) {
  .category-stats {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }
  
  .category-header {
    padding: var(--space-4);
  }
  
  .category-body {
    padding: var(--space-4);
  }
  
  .category-name {
    font-size: var(--font-size-base);
  }
  
  .category-icon {
    font-size: var(--font-size-xl);
  }
}

@media (max-width: 480px) {
  .category-actions {
    gap: var(--space-1);
  }
  
  .edit-btn, .delete-btn {
    width: 28px;
    height: 28px;
    font-size: var(--font-size-xs);
  }
  
  .stat-value {
    font-size: var(--font-size-sm);
  }
}
</style>
