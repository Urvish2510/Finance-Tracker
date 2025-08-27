<template>
  <div class="form-container">
    <div class="form-header">
      <h3>{{ editing ? 'Edit' : 'Add' }} Deposit</h3>
      <button class="close-btn" @click="$emit('cancel')" aria-label="Close">×</button>
    </div>
    <form @submit.prevent="handleSubmit" class="deposit-form" novalidate>
      <div class="form-group">
        <label for="dep-title">Title *</label>
        <input
          id="dep-title"
            v-model="local.title"
          type="text"
          placeholder="e.g., Monthly Salary, Freelance Payment"
          required
        />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="dep-amount">Amount *</label>
          <input
            id="dep-amount"
            v-model="local.amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            required
          />
        </div>
        <div class="form-group">
          <label for="dep-category">Category *</label>
          <select id="dep-category" v-model="local.categoryId" required>
            <option value="">Select category</option>
            <option
              v-for="cat in categories"
              :key="cat._id"
              :value="cat._id"
            >
              {{ cat.icon }} {{ cat.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="dep-date">Date *</label>
        <input id="dep-date" v-model="local.date" type="date" required />
      </div>

      <div class="form-group">
        <label for="dep-description">Description</label>
        <textarea
          id="dep-description"
          v-model="local.description"
          placeholder="Optional description"
          rows="3"
        ></textarea>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="$emit('cancel')">Cancel</button>
        <button type="submit" class="btn btn-primary" :disabled="saving">
          {{ saving ? 'Saving...' : (editing ? 'Update' : 'Add') }} Deposit
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, watch, toRaw } from 'vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  categories: { type: Array, default: () => [] },
  saving: { type: Boolean, default: false },
  editing: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'submit', 'cancel'])

// Local editable copy (so half-typed changes update parent via watcher – keeps parent reactive)
const local = reactive({ ...props.modelValue })

watch(
  () => props.modelValue,
  (val) => {
    Object.assign(local, val)
  },
  { deep: true }
)

watch(
  local,
  (val) => {
    emit('update:modelValue', { ...toRaw(val) })
  },
  { deep: true }
)

const handleSubmit = () => {
  if (!local.title || !local.amount || !local.categoryId || !local.date) return
  emit('submit')
}
</script>

<style scoped>
.form-container { background: var(--color-surface-elevated); padding: var(--space-8); border-radius: var(--card-radius); width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto; box-shadow: var(--shadow-xl), 0 0 0 1px var(--color-border-focus); border: 1px solid var(--color-border-primary); }
.form-header { display:flex; justify-content:space-between; align-items:center; margin-bottom: var(--space-6); padding-bottom: var(--space-4); border-bottom:1px solid var(--color-border-primary); }
.form-header h3 { margin:0; color: var(--color-primary); font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); }
.close-btn { background:none; border:none; font-size: var(--font-size-xl); cursor:pointer; color: var(--color-text-secondary); width:32px; height:32px; display:flex; align-items:center; justify-content:center; border-radius: var(--radius-full); transition: var(--transition-colors); }
.close-btn:hover { background: var(--color-surface-hover); color: var(--color-text-primary); }
.deposit-form { display:flex; flex-direction:column; gap: var(--space-4); }
.form-row { display:grid; grid-template-columns:1fr 1fr; gap: var(--space-4); }
.form-group { display:flex; flex-direction:column; }
.form-group label { margin-bottom: var(--space-2); font-weight: var(--font-weight-medium); color: var(--color-text-primary); font-size: var(--font-size-sm); }
.form-group input, .form-group select, .form-group textarea { padding: var(--input-padding-y) var(--input-padding-x); border:1px solid var(--color-border-primary); border-radius: var(--radius-lg); font-size: var(--font-size-base); background: var(--color-surface-primary); color: var(--color-text-primary); transition: var(--transition-colors); height: var(--input-height-base); }
.form-group textarea { height:auto; resize:vertical; min-height:80px; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline:none; border-color: var(--color-border-focus); box-shadow:0 0 0 3px var(--color-focus-ring); }
.form-group input::placeholder, .form-group textarea::placeholder { color: var(--color-text-placeholder); }
.form-actions { display:flex; gap: var(--space-4); justify-content:flex-end; margin-top: var(--space-6); padding-top: var(--space-4); border-top:1px solid var(--color-border-primary); }
@media (max-width: 640px) { .form-row { grid-template-columns:1fr; } .form-container { padding: var(--space-6); } .form-actions { flex-direction:column; } }
</style>
