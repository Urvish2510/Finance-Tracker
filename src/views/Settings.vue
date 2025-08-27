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
            <strong>Total Deposits:</strong>
            <span>{{ stats.totalDeposits }}</span>
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
import { useGlobalStore } from "../composables/useGlobalStore.js";
import { useToast } from "../composables/useToast.js";

// Use global store
const { 
  categories,
  expenses, 
  deposits,
  isConnected,
  loadCategories,
  loadExpenses,
  loadDeposits,
  deleteCategory,
  deleteExpense,
  deleteDeposit,
  clearAllData,
  initialize
} = useGlobalStore()

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
const apiAvailable = computed(() => isConnected.value);

const stats = computed(() => {
  return {
    totalExpenses: expenses.value.length,
    totalCategories: categories.value.length,
    totalDeposits: deposits.value.length,
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
    
    // Ensure we have latest data from global store
    if (isConnected.value) {
      try {
        await Promise.all([
          loadExpenses(),
          loadCategories(),
          loadDeposits()
        ]);
      } catch (error) {
        console.warn('Failed to fetch latest data for export:', error);
        warning('Using cached data for export');
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
          deposits: deposits.value,
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
    
    if (!isConnected.value) {
      showError('Cannot clear data: API server is not available');
      return;
    }
    
    // Use global store method to clear all data
    await clearAllData();
    
    showResetDialog.value = false;
    success("All data cleared successfully");
    
  } catch (error) {
    console.error("Reset error:", error);
    showError("Failed to clear data: " + error.message);
  } finally {
    loading.value = false;
  }
};

// Initialize
onMounted(async () => {
  console.log('⚙️ Settings view mounted');
  
  try {
    loading.value = true;
    loadingMessage.value = 'Loading settings...';
    
    // Ensure global store is initialized
    await initialize();
    
    loadLocalSettings();
    applyTheme();
    
    // Load data for stats if API is available
    if (isConnected.value) {
      try {
        await Promise.all([
          loadExpenses(),
          loadCategories(),
          loadDeposits()
        ]);
      } catch (error) {
        console.warn('Failed to load data from API:', error);
        // Continue without API data
      }
    }
    
    console.log('✅ Settings view loaded from global store!');
  } catch (error) {
    console.error('❌ Error initializing settings:', error);
    showError('Failed to load settings');
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.settings {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: var(--space-6);
}

.settings-header {
  margin-bottom: var(--space-8);
}

.settings-header h2 {
  margin: 0 0 var(--space-2) 0;
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.settings-header p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.settings-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.settings-section {
  background: var(--color-surface-elevated);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  border: 1px solid var(--color-border-primary);
  overflow: hidden;
}

.settings-section.danger-section {
  border-color: var(--color-danger-300);
}

.section-header {
  padding: var(--space-6) var(--space-6) var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--color-border-primary);
}

.section-header h3 {
  margin: 0 0 var(--space-2) 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.section-header p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.settings-grid {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-4);
}

.setting-info {
  flex: 1;
}

.setting-info label {
  display: block;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

.setting-info p {
  margin: 0 0 var(--space-2) 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.setting-control {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-1);
}

.setting-control select {
  padding: var(--input-padding-y) var(--input-padding-x);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  background: var(--color-surface-primary);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  min-width: 180px;
  height: var(--input-height-base);
  transition: var(--transition-colors);
}

.setting-control select:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}

.data-actions {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.action-group {
  padding: var(--space-4);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  background: var(--color-surface-primary);
}

.action-group.danger {
  border-color: var(--color-danger-300);
  background: var(--color-danger-50);
}

.action-group h4 {
  margin: 0 0 var(--space-1) 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.action-group p {
  margin: 0 0 var(--space-3) 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.action-buttons {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.action-btn {
  padding: var(--space-2) var(--space-4);
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-all);
  height: var(--button-height-sm);
}

.action-btn.primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.action-btn.primary:hover {
  background: var(--color-primary-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.action-btn.danger {
  background: var(--color-danger);
  color: var(--color-text-inverse);
}

.action-btn.danger:hover {
  background: var(--color-danger-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.action-btn.disabled {
  background: var(--color-gray-300);
  color: var(--color-gray-500);
  cursor: not-allowed;
  transform: none;
}

.action-btn.disabled:hover {
  background: var(--color-gray-300);
  transform: none;
  box-shadow: none;
}

.app-info {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border-light);
}

.info-item:last-child {
  border-bottom: none;
}

.info-item strong {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.info-item .connected {
  color: var(--color-success);
  font-weight: var(--font-weight-medium);
}

.info-item .disconnected {
  color: var(--color-danger);
  font-weight: var(--font-weight-medium);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-index-modal);
}

.modal-dialog {
  background: var(--color-surface-elevated);
  border-radius: var(--card-radius);
  box-shadow: var(--shadow-xl);
  max-width: 400px;
  width: 90%;
  max-height: 90vh;
  overflow: auto;
  border: 1px solid var(--color-border-primary);
}

.modal-header {
  padding: var(--space-5) var(--space-6) var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--color-border-primary);
}

.modal-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.modal-body {
  padding: var(--space-6);
}

.modal-body p {
  margin: 0 0 var(--space-4) 0;
  color: var(--color-text-primary);
  line-height: var(--line-height-relaxed);
}

.modal-body p:last-child {
  margin-bottom: 0;
}

.modal-actions {
  padding: var(--space-4) var(--space-6) var(--space-6) var(--space-6);
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
}

.btn {
  padding: var(--space-2) var(--space-4);
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-all);
  height: var(--button-height-sm);
}

.btn.secondary {
  background: var(--color-gray-100);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-primary);
}

.btn.secondary:hover {
  background: var(--color-gray-200);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.btn.danger {
  background: var(--color-danger);
  color: var(--color-text-inverse);
}

.btn.danger:hover {
  background: var(--color-danger-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

/* Loading Styles */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-backdrop);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: calc(var(--z-index-modal) + 1);
}

.loading-spinner {
  text-align: center;
  background: var(--color-surface-elevated);
  padding: var(--space-8);
  border-radius: var(--card-radius);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--color-border-primary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-border-light);
  border-top: 4px solid var(--color-primary);
  border-radius: var(--radius-full);
  animation: spin 1s linear infinite;
  margin: 0 auto var(--space-4);
}

.loading-spinner p {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
  margin: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .settings {
    padding: var(--space-4);
  }

  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }

  .setting-control {
    align-items: flex-start;
    width: 100%;
  }

  .setting-control select {
    width: 100%;
    min-width: unset;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }

  .modal-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .settings {
    padding: var(--space-3);
  }
  
  .settings-header h2 {
    font-size: var(--font-size-xl);
  }
  
  .data-actions {
    padding: var(--space-4);
  }
  
  .settings-grid {
    padding: var(--space-4);
  }
}
</style>
