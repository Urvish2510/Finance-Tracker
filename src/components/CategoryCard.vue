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

@media (max-width: 768px) {
  .category-stats {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}
</style>
