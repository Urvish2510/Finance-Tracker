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
              <button @click="exportData('csv')" class="btn btn-primary">
                📄 Export as CSV
              </button>
              <button @click="exportData('json')" class="btn btn-primary">
                📋 Export as JSON
              </button>
            </div>
          </div>

          <div class="action-group">
            <h4>📤 Import Data</h4>
            <p>Upload your financial data from CSV files</p>
            
            <!-- Sample File Downloads -->
            <div class="sample-files">
              <h5>Download Sample Files</h5>
              <div class="action-buttons">
                <button @click="downloadSampleFile('expenses')" class="btn btn-secondary">
                  📋 Expenses Template
                </button>
                <button @click="downloadSampleFile('deposits')" class="btn btn-secondary">
                  💰 Deposits Template
                </button>
                <button @click="downloadSampleFile('categories')" class="btn btn-secondary">
                  🏷️ Categories Template
                </button>
              </div>
            </div>

            <!-- File Upload Section -->
            <div class="upload-section">
              <h5>Upload Files</h5>
              <div class="upload-grid">
                <div class="upload-item">
                  <label for="expenses-upload" class="upload-label">
                    <div class="upload-icon">💳</div>
                    <span>Upload Expenses</span>
                    <small>CSV format only</small>
                  </label>
                  <input 
                    id="expenses-upload" 
                    type="file" 
                    accept=".csv" 
                    @change="handleFileUpload('expenses', $event)"
                    class="file-input"
                  />
                </div>

                <div class="upload-item">
                  <label for="deposits-upload" class="upload-label">
                    <div class="upload-icon">💰</div>
                    <span>Upload Deposits</span>
                    <small>CSV format only</small>
                  </label>
                  <input 
                    id="deposits-upload" 
                    type="file" 
                    accept=".csv" 
                    @change="handleFileUpload('deposits', $event)"
                    class="file-input"
                  />
                </div>

                <div class="upload-item">
                  <label for="categories-upload" class="upload-label">
                    <div class="upload-icon">🏷️</div>
                    <span>Upload Categories</span>
                    <small>CSV format only</small>
                  </label>
                  <input 
                    id="categories-upload" 
                    type="file" 
                    accept=".csv" 
                    @change="handleFileUpload('categories', $event)"
                    class="file-input"
                  />
                </div>
              </div>

              <!-- Upload Status -->
              <div v-if="uploadStatus.show" class="upload-status" :class="uploadStatus.type">
                <div class="status-icon">
                  {{ uploadStatus.type === 'success' ? '✅' : uploadStatus.type === 'error' ? '❌' : '⏳' }}
                </div>
                <div class="status-content">
                  <strong>{{ uploadStatus.title }}</strong>
                  <p>{{ uploadStatus.message }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="action-group danger">
            <h4>⚠️ Danger Zone</h4>
            <p v-if="!apiAvailable">API server required to clear data</p>
            <p v-else>These actions cannot be undone</p>
            <div class="action-buttons">
              <button 
                @click="showResetDialog = true" 
                class="btn btn-danger"
                :disabled="!apiAvailable"
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
          <button @click="showResetDialog = false" class="btn btn-secondary">
            Cancel
          </button>
          <button @click="resetAllData" class="btn btn-danger">
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
  createExpense,
  createDeposit,
  createCategory,
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

// Upload functionality
const uploadStatus = ref({
  show: false,
  type: '', // 'success', 'error', 'loading'
  title: '',
  message: ''
});

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

const applyTheme = async () => {
  document.documentElement.setAttribute("data-theme", localSettings.value.theme);
};

// Download sample files
const downloadSampleFile = (type) => {
  let csvContent, filename;
  
  switch (type) {
    case 'expenses':
      csvContent = `Date,Title,Amount,Category,Description,Currency
2024-01-15,Groceries,150.50,Food & Dining,Weekly grocery shopping,INR
2024-01-16,Gas,80.00,Transportation,Car fuel,INR
2024-01-17,Coffee,45.00,Food & Dining,Morning coffee,INR`;
      filename = 'sample-expenses.csv';
      break;
      
    case 'deposits':
      csvContent = `Date,Title,Amount,Description,Currency
2024-01-01,Salary,50000,Monthly salary,INR
2024-01-15,Freelance,15000,Project payment,INR
2024-01-20,Investment Return,2500,Stock dividend,INR`;
      filename = 'sample-deposits.csv';
      break;
      
    case 'categories':
      csvContent = `Name,Icon,Color,Description
Food & Dining,🍕,#FF6B6B,Food and dining expenses
Transportation,🚗,#4ECDC4,Travel and vehicle costs
Entertainment,🎬,#45B7D1,Movies and leisure activities
Shopping,🛍️,#96CEB4,Retail purchases
Utilities,⚡,#FECA57,Utilities and recurring bills
Healthcare,🏥,#A8E6CF,Medical and health expenses
Education,📚,#FFD93D,Learning and educational costs`;
      filename = 'sample-categories.csv';
      break;
  }
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
  
  info(`Sample ${type} file downloaded`);
};

// Handle file upload
const handleFileUpload = async (type, event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  if (!file.name.toLowerCase().endsWith('.csv')) {
    showError('Please upload a CSV file only');
    event.target.value = '';
    return;
  }
  
  try {
    uploadStatus.value = {
      show: true,
      type: 'loading',
      title: 'Uploading...',
      message: `Processing ${type} file...`
    };
    
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('File must contain at least a header row and one data row');
    }
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const dataRows = lines.slice(1);
    
    await processUploadData(type, headers, dataRows);
    
    uploadStatus.value = {
      show: true,
      type: 'success',
      title: 'Upload Successful!',
      message: `Successfully imported ${dataRows.length} ${type} records`
    };
    
    success(`${dataRows.length} ${type} imported successfully`);
    
    // Clear the file input
    event.target.value = '';
    
    // Hide status after 5 seconds
    setTimeout(() => {
      uploadStatus.value.show = false;
    }, 5000);
    
  } catch (error) {
    console.error(`Upload error for ${type}:`, error);
    uploadStatus.value = {
      show: true,
      type: 'error',
      title: 'Upload Failed',
      message: error.message || `Failed to process ${type} file`
    };
    
    showError(`Upload failed: ${error.message}`);
    event.target.value = '';
    
    // Hide error status after 8 seconds
    setTimeout(() => {
      uploadStatus.value.show = false;
    }, 8000);
  }
};

// Process uploaded data
const processUploadData = async (type, headers, dataRows) => {
  console.log(`Starting upload process for ${type} with ${dataRows.length} rows`);
  
  if (!isConnected.value) {
    throw new Error('API server is not connected');
  }
  
  switch (type) {
    case 'expenses':
      await processExpensesUpload(headers, dataRows);
      break;
    case 'deposits':
      await processDepositsUpload(headers, dataRows);
      break;
    case 'categories':
      await processCategoriesUpload(headers, dataRows);
      break;
    default:
      throw new Error(`Unknown upload type: ${type}`);
  }
  
  console.log(`Completed upload process for ${type}`);
  
  // Reload data after successful upload
  console.log('Reloading data from server...');
  await Promise.all([
    loadExpenses(),
    loadDeposits(),
    loadCategories()
  ]);
  console.log('Data reload completed');
};

// Process expenses upload
const processExpensesUpload = async (headers, dataRows) => {
  const requiredFields = ['Date', 'Title', 'Amount', 'Category'];
  const missingFields = requiredFields.filter(field => 
    !headers.some(h => h.toLowerCase() === field.toLowerCase())
  );
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}. Please ensure your CSV has: Date, Title, Amount, Category`);
  }
  
  // First pass: validate all data and collect errors
  const validatedExpenses = [];
  const validationErrors = [];
  
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const values = row.split(',').map(v => v.trim().replace(/"/g, ''));
    const rowNum = i + 2; // +2 because header is row 1, data starts at row 2
    const rowErrors = [];
    
    // Extract values by header position
    const dateIndex = headers.findIndex(h => h.toLowerCase() === 'date');
    const titleIndex = headers.findIndex(h => h.toLowerCase() === 'title');
    const amountIndex = headers.findIndex(h => h.toLowerCase() === 'amount');
    const categoryIndex = headers.findIndex(h => h.toLowerCase() === 'category');
    const descriptionIndex = headers.findIndex(h => h.toLowerCase() === 'description');
    const currencyIndex = headers.findIndex(h => h.toLowerCase() === 'currency');
    
    const date = values[dateIndex]?.trim();
    const title = values[titleIndex]?.trim();
    const amountStr = values[amountIndex]?.trim();
    const categoryName = values[categoryIndex]?.trim();
    const description = values[descriptionIndex]?.trim() || '';
    const currency = values[currencyIndex]?.trim() || 'INR';
    
    // Validate required fields
    if (!date) rowErrors.push('Date is required');
    if (!title) rowErrors.push('Title is required');
    if (!amountStr || isNaN(parseFloat(amountStr)) || parseFloat(amountStr) <= 0) {
      rowErrors.push('Valid amount is required');
    }
    if (!categoryName) {
      rowErrors.push('Category is required');
    } else {
      // Validate category exists
      const category = categories.value.find(c => 
        c.name.toLowerCase() === categoryName.toLowerCase()
      );
      if (!category) {
        rowErrors.push(`Category "${categoryName}" not found. Available: ${categories.value.map(c => c.name).join(', ')}`);
      }
    }
    
    if (rowErrors.length > 0) {
      validationErrors.push(`Row ${rowNum}: ${rowErrors.join(', ')}`);
    } else {
      // Create validated expense object
      const category = categories.value.find(c => 
        c.name.toLowerCase() === categoryName.toLowerCase()
      );
      
      validatedExpenses.push({
        date,
        title,
        amount: parseFloat(amountStr),
        category: category._id,
        description,
        currency
      });
    }
  }
  
  // Stop if there are validation errors
  if (validationErrors.length > 0) {
    throw new Error(`Validation failed:\n${validationErrors.join('\n')}`);
  }
  
  // Second pass: upload all validated expenses
  let successCount = 0;
  for (const expense of validatedExpenses) {
    try {
      console.log('Uploading expense:', expense);
      const result = await createExpense(expense);
      console.log('Upload successful:', result);
      successCount++;
    } catch (error) {
      console.error('Upload failed for expense:', expense, error);
      throw new Error(`Failed to save expense "${expense.title}": ${error.message}`);
    }
  }
  
  console.log(`Successfully uploaded ${successCount} expenses`);
};

// Process deposits upload
const processDepositsUpload = async (headers, dataRows) => {
  const requiredFields = ['Date', 'Title', 'Amount'];
  const missingFields = requiredFields.filter(field => 
    !headers.some(h => h.toLowerCase() === field.toLowerCase())
  );
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
  
  // Validate all data first
  const validatedDeposits = [];
  const validationErrors = [];
  
  dataRows.forEach((row, index) => {
    const values = row.split(',').map(v => v.trim().replace(/"/g, ''));
    const deposit = {};
    const rowNumber = index + 2;
    const rowErrors = [];
    
    // Extract values by header position
    const dateIndex = headers.findIndex(h => h.toLowerCase() === 'date');
    const titleIndex = headers.findIndex(h => h.toLowerCase() === 'title');
    const amountIndex = headers.findIndex(h => h.toLowerCase() === 'amount');
    const descriptionIndex = headers.findIndex(h => h.toLowerCase() === 'description');
    const currencyIndex = headers.findIndex(h => h.toLowerCase() === 'currency');
    
    const date = values[dateIndex]?.trim();
    const title = values[titleIndex]?.trim();
    const amountStr = values[amountIndex]?.trim();
    const description = values[descriptionIndex]?.trim() || '';
    const currency = values[currencyIndex]?.trim() || 'INR';
    
    // Validate required fields
    if (!date) rowErrors.push('Date is required');
    if (!title) rowErrors.push('Title is required');
    if (!amountStr || isNaN(parseFloat(amountStr)) || parseFloat(amountStr) <= 0) {
      rowErrors.push('Valid amount is required');
    }
    
    if (rowErrors.length > 0) {
      validationErrors.push(`Row ${rowNumber}: ${rowErrors.join(', ')}`);
    } else {
      validatedDeposits.push({
        date,
        title,
        amount: parseFloat(amountStr),
        description,
        currency
      });
    }
  });
  
  // Stop if there are validation errors
  if (validationErrors.length > 0) {
    throw new Error(`Validation failed:\n${validationErrors.join('\n')}`);
  }
  
  // Upload all validated deposits
  let successCount = 0;
  for (const deposit of validatedDeposits) {
    try {
      console.log('Uploading deposit:', deposit);
      await createDeposit(deposit);
      successCount++;
    } catch (error) {
      console.error('Failed to create deposit:', deposit, error);
      throw new Error(`Failed to create deposit "${deposit.title}": ${error.message}`);
    }
  }
  
  console.log(`Successfully uploaded ${successCount} deposits`);
};

// Process categories upload
const processCategoriesUpload = async (headers, dataRows) => {
  const requiredFields = ['Name'];
  const missingFields = requiredFields.filter(field => 
    !headers.some(h => h.toLowerCase() === field.toLowerCase())
  );
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
  
  // First pass: validate all data and collect errors
  const validatedCategories = [];
  const validationErrors = [];
  
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const values = row.split(',').map(v => v.trim().replace(/"/g, ''));
    const rowNum = i + 2; // +2 because header is row 1, data starts at row 2
    const rowErrors = [];
    
    // Extract values by header position
    const nameIndex = headers.findIndex(h => h.toLowerCase() === 'name');
    const iconIndex = headers.findIndex(h => h.toLowerCase() === 'icon');
    const colorIndex = headers.findIndex(h => h.toLowerCase() === 'color');
    const descriptionIndex = headers.findIndex(h => h.toLowerCase() === 'description');
    
    const name = values[nameIndex]?.trim();
    const icon = values[iconIndex]?.trim() || '📦';
    const color = values[colorIndex]?.trim() || '#6B7280';
    const description = values[descriptionIndex]?.trim() || '';
    
    // Validate required fields
    if (!name) {
      rowErrors.push('Name is required');
    } else {
      // Check if category already exists
      const existingCategory = categories.value.find(c => 
        c.name.toLowerCase() === name.toLowerCase()
      );
      if (existingCategory) {
        rowErrors.push(`Category "${name}" already exists`);
      }
    }
    
    if (rowErrors.length > 0) {
      validationErrors.push(`Row ${rowNum}: ${rowErrors.join(', ')}`);
    } else {
      validatedCategories.push({
        name,
        icon,
        color,
        description
      });
    }
  }
  
  // Stop if there are validation errors
  if (validationErrors.length > 0) {
    throw new Error(`Validation failed:\n${validationErrors.join('\n')}`);
  }
  
  // Upload all validated categories
  let successCount = 0;
  for (const category of validatedCategories) {
    try {
      console.log('Uploading category:', category);
      await createCategory(category);
      successCount++;
    } catch (error) {
      console.error('Failed to create category:', category, error);
      throw new Error(`Failed to create category "${category.name}": ${error.message}`);
    }
  }
  
  console.log(`Successfully uploaded ${successCount} categories`);
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
    
    // Show progress message
    info('Starting data clearance...');
    
    // Use global store method to clear all data
    loadingMessage.value = 'Clearing expenses...';
    await clearAllData();
    
    showResetDialog.value = false;
    
    // Show success message with details
    success("🗑️ All data cleared successfully! Your finance tracker is now reset.");
    
    // Reload data to show empty state
    loadingMessage.value = 'Refreshing interface...';
    await Promise.all([
      loadExpenses(),
      loadCategories(),
      loadDeposits()
    ]);
    
  } catch (error) {
    console.error("Reset error:", error);
    
    // Close dialog on error too
    showResetDialog.value = false;
    
    // Show detailed error message
    if (error.message.includes('Cannot clear categories')) {
      showError("❌ Cannot clear categories: Please clear all expenses first, then try again.");
    } else if (error.message.includes('API server')) {
      showError("❌ Connection error: Please ensure the server is running and try again.");
    } else {
      showError(`❌ Failed to clear data: ${error.message}`);
    }
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
  background: linear-gradient(135deg, var(--color-surface-secondary), var(--color-surface-tertiary));
  position: relative;
  overflow: hidden;
}

.section-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
  opacity: 0.8;
}

.section-header h3 {
  margin: 0 0 var(--space-2) 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.section-header p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
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
  position: relative;
  overflow: hidden;
}

.action-group.danger::before {
  content: '⚠️';
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  font-size: var(--font-size-xl);
  opacity: 0.3;
  animation: pulse 2s infinite;
}

.action-group.danger h4 {
  color: var(--color-danger-700);
  font-weight: var(--font-weight-bold);
}

.action-group.danger p {
  color: var(--color-danger-600);
  font-weight: var(--font-weight-medium);
}

/* Dark theme support for danger zone */
:root.dark .action-group.danger {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
}

:root.dark .action-group.danger h4 {
  color: var(--color-danger-400);
}

:root.dark .action-group.danger p {
  color: var(--color-danger-300);
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
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

/* Upload Section Styles */
.sample-files {
  margin: var(--space-4) 0;
  padding: var(--space-5);
  background: var(--color-surface-secondary);
  border-radius: var(--card-radius);
  border: 1px solid var(--color-border-primary);
  position: relative;
}

.sample-files::before {
  content: '📥';
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  font-size: var(--font-size-lg);
  opacity: 0.5;
}

.sample-files h5 {
  margin: 0 0 var(--space-4) 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.upload-section {
  margin: var(--space-5) 0 0 0;
  padding: var(--space-5);
  background: var(--color-surface-elevated);
  border-radius: var(--card-radius);
  border: 1px solid var(--color-border-primary);
  position: relative;
}

.upload-section::before {
  content: '📤';
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  font-size: var(--font-size-lg);
  opacity: 0.5;
}

.upload-section h5 {
  margin: 0 0 var(--space-4) 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.upload-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-4);
  margin-top: var(--space-4);
}

.upload-item {
  position: relative;
}

.file-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  border: 2px dashed var(--color-border-primary);
  border-radius: var(--card-radius);
  background: var(--color-surface-primary);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 120px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.upload-label::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.1), transparent);
  transition: left 0.6s ease;
}

.upload-label:hover::before {
  left: 100%;
}

.upload-label:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-50);
  transform: translateY(-3px);
  box-shadow: 0 8px 25px -8px rgba(14, 165, 233, 0.3), 0 2px 8px -2px rgba(14, 165, 233, 0.15);
}

/* Dark theme support for upload labels */
:root.dark .upload-label:hover {
  background: rgba(14, 165, 233, 0.1);
  box-shadow: 0 8px 25px -8px rgba(14, 165, 233, 0.4), 0 2px 8px -2px rgba(14, 165, 233, 0.2);
}

:root.dark .upload-label::before {
  background: linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.2), transparent);
}

.upload-label:active {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px -4px rgba(14, 165, 233, 0.4);
}

.upload-label:focus-within {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.upload-icon {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--space-2);
  transition: transform 0.3s ease;
}

.upload-label:hover .upload-icon {
  transform: scale(1.1) translateY(-2px);
}

.upload-label span {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
  transition: color 0.3s ease;
}

.upload-label:hover span {
  color: var(--color-primary);
}

.upload-label small {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.upload-status {
  margin-top: var(--space-4);
  padding: var(--space-4);
  border-radius: var(--card-radius);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.upload-status.success {
  background: var(--color-success-50);
  border: 1px solid var(--color-success-200);
  color: var(--color-success-800);
}

.upload-status.error {
  background: var(--color-error-50);
  border: 1px solid var(--color-error-200);
  color: var(--color-error-800);
}

.upload-status.loading {
  background: var(--color-primary-50);
  border: 1px solid var(--color-primary-200);
  color: var(--color-primary-800);
}

.status-icon {
  font-size: var(--font-size-lg);
  flex-shrink: 0;
}

.status-content strong {
  display: block;
  margin-bottom: var(--space-1);
}

.status-content p {
  margin: 0;
  font-size: var(--font-size-sm);
  opacity: 0.9;
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
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease;
}

.modal-dialog {
  background: var(--color-surface-elevated);
  border-radius: var(--card-radius);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 30px -5px rgba(239, 68, 68, 0.1);
  max-width: 450px;
  width: 90%;
  max-height: 90vh;
  overflow: auto;
  border: 1px solid var(--color-danger-200);
  position: relative;
  animation: slideIn 0.3s ease;
}

.modal-dialog::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--color-danger-500), var(--color-warning-500));
}

.modal-header {
  padding: var(--space-6) var(--space-6) var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--color-border-primary);
  background: linear-gradient(135deg, var(--color-danger-50), var(--color-warning-50));
}

.modal-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-danger-700);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.modal-body {
  padding: var(--space-6);
  background: var(--color-surface-elevated);
}

.modal-body p {
  margin: 0 0 var(--space-4) 0;
  color: var(--color-text-primary);
  line-height: var(--line-height-relaxed);
  font-size: var(--font-size-sm);
}

.modal-body p:first-child {
  font-size: var(--font-size-base);
}

.modal-body strong {
  color: var(--color-danger-600);
  font-weight: var(--font-weight-bold);
}

/* Dark theme modal support */
:root.dark .modal-dialog {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 10px 30px -5px rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.3);
}

:root.dark .modal-header {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(251, 191, 36, 0.1));
}

:root.dark .modal-header h3 {
  color: var(--color-danger-400);
}

:root.dark .modal-body strong {
  color: var(--color-danger-400);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { 
    opacity: 0; 
    transform: translateY(-20px) scale(0.95); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
  }
}

.modal-body p:last-child {
  margin-bottom: 0;
}

.modal-actions {
  padding: var(--space-4) var(--space-6) var(--space-6) var(--space-6);
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  background: var(--color-surface-secondary);
  border-top: 1px solid var(--color-border-primary);
}

.modal-actions .btn {
  min-width: 120px;
  font-weight: var(--font-weight-semibold);
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

  .upload-grid {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .upload-label {
    min-height: 100px;
    padding: var(--space-4);
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn {
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
