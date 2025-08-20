<template>
  <div class="settings">
    <!-- Settings Header -->
    <div class="settings-header">
      <h2>⚙️ Settings</h2>
      <p>Customize your finance tracking experience</p>
    </div>

    <!-- Settings Sections -->
    <div class="settings-container">
      <!-- General Settings -->
      <div class="settings-section">
        <div class="section-header">
          <h3>🎨 Appearance</h3>
          <p>Customize how the app looks and feels</p>
        </div>
        <div class="settings-grid">
          <div class="setting-item">
            <div class="setting-info">
              <label>Theme</label>
              <p>Choose your preferred color scheme</p>
            </div>
            <div class="setting-control">
              <select v-model="localSettings.theme" @change="saveSettings">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label>Date Format</label>
              <p>How dates should be displayed</p>
            </div>
            <div class="setting-control">
              <select v-model="localSettings.dateFormat" @change="saveSettings">
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Management -->
      <div class="settings-section danger-section">
        <div class="section-header">
          <h3>📊 Data Management</h3>
          <p>Import, export, and manage your financial data</p>
        </div>
        <div class="data-actions">
          <div class="action-group">
            <h4>Export Data</h4>
            <p>Download your financial data</p>
            <div class="action-buttons">
              <button @click="exportData('csv')" class="action-btn primary">
                📄 Export as CSV
              </button>
              <button @click="exportData('json')" class="action-btn primary">
                📋 Export as JSON
              </button>
            </div>
          </div>

          <div class="action-group danger">
            <h4>⚠️ Danger Zone</h4>
            <p v-if="!apiAvailable">API server required to clear data</p>
            <p v-else>These actions cannot be undone</p>
            <div class="action-buttons">
              <button 
                @click="showResetDialog = true" 
                class="action-btn danger"
                :disabled="!apiAvailable"
                :class="{ disabled: !apiAvailable }"
              >
                🗑️ Clear All Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- App Information -->
      <div class="settings-section">
        <div class="section-header">
          <h3>ℹ️ About</h3>
          <p>App information and support</p>
        </div>
        <div class="app-info">
          <div class="info-item">
            <strong>Version:</strong>
            <span>{{ appInfo.version }}</span>
          </div>
          <div class="info-item">
            <strong>Database:</strong>
            <span
              :class="{ connected: apiAvailable, disconnected: !apiAvailable }"
            >
              {{ apiAvailable ? "✅ Connected" : "❌ Disconnected" }}
            </span>
          </div>
          <div class="info-item">
            <strong>Current Currency:</strong>
            <span>Indian Rupee (INR)</span>
          </div>
          <div class="info-item">
            <strong>Total Expenses:</strong>
            <span>{{ stats.totalExpenses }}</span>
          </div>
          <div class="info-item">
            <strong>Total Categories:</strong>
            <span>{{ stats.totalCategories }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Reset Confirmation Dialog -->
    <div
      v-if="showResetDialog"
      class="modal-overlay"
      @click="showResetDialog = false"
    >
      <div class="modal-dialog" @click.stop>
        <div class="modal-header">
          <h3>⚠️ Confirm Data Reset</h3>
        </div>
        <div class="modal-body">
          <p>
            This will permanently delete ALL your expenses and categories. This
            action cannot be undone.
          </p>
          <p><strong>Are you sure you want to continue?</strong></p>
        </div>
        <div class="modal-actions">
          <button @click="showResetDialog = false" class="btn secondary">
            Cancel
          </button>
          <button @click="resetAllData" class="btn danger">
            Yes, Delete Everything
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>{{ loadingMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import {
  useDatabase,
  useExpenses,
  useCategories,
} from "../composables/useDatabase.js";
import { useToast } from "../composables/useToast.js";

// Composables
const { apiAvailable } = useDatabase();
const { expenses, fetchExpenses, deleteExpense } = useExpenses();
const { categories, fetchCategories, deleteCategory } = useCategories();
const { success, error: showError, info, warning } = useToast();

// Reactive data
const localSettings = ref({
  theme: "light",
  dateFormat: "DD/MM/YYYY"
});

const showResetDialog = ref(false);
const loading = ref(false);
const loadingMessage = ref('');

const appInfo = ref({
  version: "1.0.0",
  build: "2024.1",
});

// Computed properties
const stats = computed(() => {
  return {
    totalExpenses: expenses.value.length,
    totalCategories: categories.value.length,
  };
});

// Methods
const loadLocalSettings = () => {
  const saved = localStorage.getItem("finance-tracker-settings");
  if (saved) {
    localSettings.value = { ...localSettings.value, ...JSON.parse(saved) };
  }
};

const saveSettings = async () => {
  try {
    // Save to localStorage for local settings only
    localStorage.setItem(
      "finance-tracker-settings",
      JSON.stringify(localSettings.value)
    );

    success("Settings saved successfully");
    applyTheme();
  } catch (error) {
    console.error('Error saving settings:', error);
    showError("Failed to save settings");
  }
};

const applyTheme = () => {
  document.documentElement.setAttribute("data-theme", localSettings.value.theme);
};

const exportData = async (format) => {
  try {
    loading.value = true;
    loadingMessage.value = `Exporting data as ${format.toUpperCase()}...`;
    
    // Only fetch if API is available
    if (apiAvailable.value) {
      try {
        await fetchExpenses();
        await fetchCategories();
      } catch (error) {
        console.warn('Failed to fetch latest data for export:', error);
        // Continue with existing data
      }
    }

    let data, filename, mimeType;

    if (format === "csv") {
      // Export as CSV
      let csv = "Date,Title,Amount,Category,Description,Currency\n";
      expenses.value.forEach((expense) => {
        const category = categories.value.find(
          (c) => c._id === expense.category || c.id === expense.category
        );
        csv += `${expense.date},"${expense.title}",${expense.amount},"${
          category?.name || "Unknown"
        }","${expense.description || ""}","${expense.currency || 'INR'}"\n`;
      });
      data = csv;
      filename = `finance-data-${new Date().toISOString().split("T")[0]}.csv`;
      mimeType = "text/csv";
    } else {
      // Export as JSON
      data = JSON.stringify(
        {
          exportDate: new Date().toISOString(),
          version: appInfo.value.version,
          currency: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
          expenses: expenses.value,
          categories: categories.value,
          settings: localSettings.value
        },
        null,
        2
      );
      filename = `finance-data-${new Date().toISOString().split("T")[0]}.json`;
      mimeType = "application/json";
    }

    // Download file
    const blob = new Blob([data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);

    success(`Data exported as ${format.toUpperCase()}`);
  } catch (error) {
    console.error("Export error:", error);
    showError("Export failed");
  } finally {
    loading.value = false;
  }
};

const resetAllData = async () => {
  try {
    loading.value = true;
    loadingMessage.value = 'Clearing all data...';
    
    if (!apiAvailable.value) {
      showError('Cannot clear data: API server is not available');
      return;
    }
    
    // Clear all expenses
    if (expenses.value && expenses.value.length > 0) {
      const deletePromises = expenses.value.map((expense) =>
        deleteExpense(expense._id || expense.id)
      );
      await Promise.all(deletePromises);
    }

    // Clear all categories  
    if (categories.value && categories.value.length > 0) {
      const deleteCategoryPromises = categories.value.map((category) =>
        deleteCategory(category._id || category.id)
      );
      await Promise.all(deleteCategoryPromises);
    }

    showResetDialog.value = false;
    success("All data cleared successfully");

    // Refresh data
    await fetchExpenses();
    await fetchCategories();
  } catch (error) {
    console.error("Reset error:", error);
    showError("Failed to clear data: " + error.message);
  } finally {
    loading.value = false;
  }
};

// Initialize
onMounted(async () => {
  try {
    loading.value = true;
    loadingMessage.value = 'Loading settings...';
    
    loadLocalSettings();
    applyTheme();
    
    // Load data for stats if API is available
    if (apiAvailable.value) {
      try {
        await Promise.all([
          fetchExpenses(),
          fetchCategories()
        ]);
      } catch (error) {
        console.warn('Failed to load data from API:', error);
        // Continue without API data
      }
    }
    
  } catch (error) {
    console.error('Error initializing settings:', error);
    showError('Failed to load settings');
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.settings {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.settings-header {
  margin-bottom: 32px;
}

.settings-header h2 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}

.settings-header p {
  margin: 0;
  color: #64748b;
  font-size: 16px;
}

.settings-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.settings-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.settings-section.danger-section {
  border: 1px solid #fecaca;
}

.section-header {
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.section-header h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.section-header p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.settings-grid {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.setting-info {
  flex: 1;
}

.setting-info label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
}

.setting-info p {
  margin: 0 0 8px 0;
  color: #64748b;
  font-size: 14px;
}

.setting-control {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.setting-control select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  min-width: 180px;
}

.data-actions {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.action-group {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.action-group.danger {
  border-color: #fca5a5;
  background: #fef2f2;
}

.action-group h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.action-group p {
  margin: 0 0 12px 0;
  color: #64748b;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.primary {
  background: #3b82f6;
  color: white;
}

.action-btn.primary:hover {
  background: #2563eb;
}

.action-btn.danger {
  background: #dc2626;
  color: white;
}

.action-btn.danger:hover {
  background: #b91c1c;
}

.action-btn.disabled {
  background: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
}

.action-btn.disabled:hover {
  background: #d1d5db;
}

.app-info {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item strong {
  color: #374151;
}

.info-item .connected {
  color: #16a34a;
}

.info-item .disconnected {
  color: #dc2626;
}

.modal-overlay {
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

.modal-dialog {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 90%;
  max-height: 90vh;
  overflow: auto;
}

.modal-header {
  padding: 20px 24px 16px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.modal-body {
  padding: 24px;
}

.modal-body p {
  margin: 0 0 16px 0;
  color: #374151;
  line-height: 1.6;
}

.modal-body p:last-child {
  margin-bottom: 0;
}

.modal-actions {
  padding: 16px 24px 24px 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn.secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn.secondary:hover {
  background: #e5e7eb;
}

.btn.danger {
  background: #dc2626;
  color: white;
}

.btn.danger:hover {
  background: #b91c1c;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1002;
}

.loading-spinner {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

.loading-spinner p {
  color: #374151;
  font-weight: 500;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .settings {
    padding: 16px;
  }

  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .setting-control {
    align-items: flex-start;
    width: 100%;
  }

  .setting-control select {
    width: 100%;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}
</style>
