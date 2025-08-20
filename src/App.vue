<template>
  <div id="app">
    <!-- Mobile overlay -->
    <div 
      v-if="isMobile && !sidebarCollapsed" 
      class="mobile-overlay" 
      @click="toggleSidebar"
    ></div>
    
    <div class="app-layout">
      <aside class="sidebar" :class="{ 
        collapsed: sidebarCollapsed, 
        mobile: isMobile,
        'mobile-open': isMobile && !sidebarCollapsed 
      }">
        <div class="sidebar-header">
          <div class="logo">
            <span class="logo-icon">💰</span>
            <span class="logo-text" v-if="!sidebarCollapsed"
              >Finance Tracker</span
            >
          </div>
          <button class="sidebar-toggle" @click="toggleSidebar">
            <span v-if="sidebarCollapsed">→</span>
            <span v-else>←</span>
          </button>
        </div>

        <nav class="sidebar-nav">
          <router-link
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="nav-item"
            :class="{ active: route?.path === item.path }"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-text" v-if="!sidebarCollapsed">{{
              item.name
            }}</span>
          </router-link>
        </nav>

        <div class="sidebar-footer" v-if="!sidebarCollapsed">
          <div class="app-status">
            <div class="status-item">
              <span
                class="status-dot"
                :class="{
                  connected: apiStatus.connected,
                  disconnected: !apiStatus.connected,
                  loading: apiStatus.checking
                }"
              ></span>
              <span v-if="apiStatus.checking">
                Checking...
              </span>
              <span v-else>
                {{ apiStatus.connected ? "API Connected" : "API Disconnected" }}
              </span>
            </div>
            <span class="version">🎯 {{ config.appTitle }} v1.0 ({{ config.env }})</span>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <header class="top-header">
          <div class="header-left">
            <button 
              v-if="isMobile" 
              class="mobile-menu-btn" 
              @click="toggleSidebar"
              :class="{ active: !sidebarCollapsed }"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            <h1 class="page-title">{{ currentPageTitle }}</h1>
            <p class="page-subtitle">{{ currentPageSubtitle }}</p>
          </div>
          <div class="header-right">
            <button class="theme-toggle" @click="toggleDarkMode" title="Toggle dark mode">
              <span v-if="isDarkMode">☀️</span>
              <span v-else>🌙</span>
            </button>
            <div class="user-info">
              <span class="user-avatar">👤</span>
              <span class="user-name">Personal Finance</span>
            </div>
          </div>
        </header>

        <div class="content-area">
          <router-view :key="route.fullPath" />
        </div>
      </main>
    </div>

    <!-- Toast Notifications -->
    <ToastContainer />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import { checkApiHealth } from "./services/apiService.js";
import ToastContainer from "./components/ToastContainer.vue";
import { config, isDev } from "./config/environment.js";

// Sidebar state
const sidebarCollapsed = ref(false);

// Mobile detection
const isMobile = ref(window.innerWidth <= 768);

// Dark mode state
const isDarkMode = ref(false);

// API status
const apiStatus = ref({
  connected: false,
  checking: false,
});

// Current route
const route = useRoute();

// Check API health
const checkAPIStatus = async () => {
  apiStatus.value.checking = true;
  try {
    const isHealthy = await checkApiHealth();
    apiStatus.value.connected = isHealthy;
  } catch (error) {
    console.error('API health check failed:', error);
    apiStatus.value.connected = false;
  }
  apiStatus.value.checking = false;
};

// Initialize API status check
onMounted(() => {
  checkAPIStatus();
  
  // Check every 30 seconds
  setInterval(checkAPIStatus, 30000);
  
  // Initialize dark mode from localStorage
  try {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      isDarkMode.value = JSON.parse(savedTheme);
    } else {
      // Default to system preference
      isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    updateTheme();
  } catch (error) {
    console.warn('Error loading theme preference:', error);
    isDarkMode.value = false;
    updateTheme();
  }

  // Initialize responsive behavior
  handleResize();
  window.addEventListener('resize', handleResize);
  
  // Auto-collapse on mobile
  if (isMobile.value) {
    sidebarCollapsed.value = true;
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

// Debug: Watch route changes
watch(
  () => route.path,
  (newPath) => {
    console.log("Route changed to:", newPath);
  },
  { immediate: true }
);

// Menu items
const menuItems = [
  {
    path: "/",
    name: "Dashboard",
    icon: "📊",
    subtitle: "Overview and quick stats",
  },
  {
    path: "/expenses",
    name: "Expenses",
    icon: "💳",
    subtitle: "Manage your transactions",
  },
  {
    path: "/deposits",
    name: "Deposits",
    icon: "💰",
    subtitle: "Track your income",
  },
  {
    path: "/categories",
    name: "Categories",
    icon: "🏷️",
    subtitle: "Organize expense types",
  },
  {
    path: "/settings",
    name: "Settings",
    icon: "⚙️",
    subtitle: "App configuration",
  },
];

// Computed properties
const currentPageTitle = computed(() => {
  if (!route?.path) return "Dashboard";
  const item = menuItems.find((item) => item.path === route.path);
  return item?.name || "Dashboard";
});

const currentPageSubtitle = computed(() => {
  if (!route?.path) return "Overview and quick stats";
  const item = menuItems.find((item) => item.path === route.path);
  return item?.subtitle || "Overview and quick stats";
});

// Methods
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
  // Save sidebar state to localStorage for desktop
  if (!isMobile.value) {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed.value));
  }
};

const handleResize = () => {
  const newIsMobile = window.innerWidth <= 768;
  
  if (newIsMobile !== isMobile.value) {
    isMobile.value = newIsMobile;
    
    if (isMobile.value) {
      // On mobile, always start collapsed
      sidebarCollapsed.value = true;
    } else {
      // On desktop, restore saved state or default to expanded
      const savedState = localStorage.getItem('sidebarCollapsed');
      sidebarCollapsed.value = savedState ? JSON.parse(savedState) : false;
    }
  }
};

const toggleDarkMode = () => {
  try {
    isDarkMode.value = !isDarkMode.value;
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode.value));
    updateTheme();
  } catch (error) {
    console.warn('Error saving theme preference:', error);
  }
};

const updateTheme = () => {
  try {
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (error) {
    console.warn('Error updating theme:', error);
  }
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --bg-primary: #f8fafc;
  --bg-secondary: #ffffff;
  --bg-tertiary: #f7fafc;
  --text-primary: #2d3748;
  --text-secondary: #718096;
  --text-tertiary: #4a5568;
  --border-color: #e1e5e9;
  --border-light: #e2e8f0;
  --shadow: rgba(0, 0, 0, 0.04);
  --shadow-strong: rgba(0, 0, 0, 0.1);
}

:root.dark {
  --bg-primary: #1a202c;
  --bg-secondary: #2d3748;
  --bg-tertiary: #4a5568;
  --text-primary: #f7fafc;
  --text-secondary: #cbd5e0;
  --text-tertiary: #e2e8f0;
  --border-color: #4a5568;
  --border-light: #718096;
  --shadow: rgba(0, 0, 0, 0.2);
  --shadow-strong: rgba(0, 0, 0, 0.3);
}

#app {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
  overflow: hidden;
}

.app-layout {
  display: flex;
  height: 100vh;
  background: var(--bg-primary);
  transition: background-color 0.3s ease;
}

/* Mobile Overlay */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1050;
  backdrop-filter: blur(2px);
}

/* Sidebar Styles */
.sidebar {
  width: 280px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1000;
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar.mobile {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1100;
  transform: translateX(-100%);
  width: 280px !important; /* Always full width on mobile when open */
}

.sidebar.mobile.mobile-open {
  transform: translateX(0);
}

.sidebar.mobile.collapsed {
  transform: translateX(-100%);
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 24px;
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
}

.sidebar-toggle {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.sidebar-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border-left-color: white;
}

.nav-icon {
  font-size: 18px;
  min-width: 20px;
}

.nav-text {
  font-size: 14px;
  font-weight: 500;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.db-status {
  padding: 10px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  text-align: center;
  font-size: 12px;
}

.db-status.connected {
  background: rgba(76, 175, 80, 0.3);
}

/* Main Content Styles */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0; /* Prevents flex item from overflowing */
}

.top-header {
  background: var(--bg-secondary);
  padding: 20px 30px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px var(--shadow);
  transition: all 0.3s ease;
}

.header-left {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.mobile-menu-btn {
  display: none;
  flex-direction: column;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.mobile-menu-btn span {
  display: block;
  height: 3px;
  width: 24px;
  background: var(--text-primary);
  margin: 2px 0;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.mobile-menu-btn:hover {
  background: var(--bg-tertiary);
}

.mobile-menu-btn.active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.mobile-menu-btn.active span:nth-child(2) {
  opacity: 0;
}

.mobile-menu-btn.active span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}

.page-title {
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 4px 0;
  transition: color 0.3s ease;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0;
  transition: color 0.3s ease;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.theme-toggle {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  color: var(--text-primary);
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle:hover {
  background: var(--border-light);
  transform: scale(1.05);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.user-avatar {
  font-size: 20px;
}

.user-name {
  font-size: 14px;
  color: var(--text-tertiary);
  font-weight: 500;
  transition: color 0.3s ease;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 30px;
  background: var(--bg-primary);
  transition: background-color 0.3s ease;
}

.app-status {
  padding: 16px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  border: 1px solid var(--border-light);
  transition: all 0.3s ease;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--text-tertiary);
  transition: color 0.3s ease;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.connected {
  background: #10b981;
}

.status-dot.disconnected {
  background: #f59e0b;
}

.status-dot.loading {
  background: #3b82f6;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.version {
  font-size: 11px;
  color: #9ca3af;
}

/* Responsive Design */

/* Tablet and below */
@media (max-width: 1024px) {
  .sidebar {
    width: 250px;
  }
  
  .sidebar.collapsed {
    width: 60px;
  }
}

/* Mobile landscape and below */
@media (max-width: 768px) {
  .mobile-menu-btn {
    display: flex;
  }
  
  .header-left {
    flex-direction: row;
    align-items: center;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .page-subtitle {
    display: none; /* Hide subtitle on mobile to save space */
  }
  
  .main-content {
    width: 100%;
  }
  
  .content-area {
    padding: 16px;
  }
  
  .top-header {
    padding: 12px 16px;
  }
  
  .header-right {
    gap: 12px;
  }
  
  .user-info {
    padding: 6px 12px;
  }
  
  .theme-toggle {
    padding: 6px 10px;
    font-size: 14px;
  }
}

/* Mobile portrait */
@media (max-width: 480px) {
  .page-title {
    font-size: 18px;
  }
  
  .content-area {
    padding: 12px;
  }
  
  .top-header {
    padding: 10px 12px;
  }
  
  .header-right {
    gap: 8px;
  }
  
  .user-name {
    display: none; /* Hide user name on small screens */
  }
  
  .theme-toggle {
    padding: 4px 8px;
  }
}

/* Large screens */
@media (min-width: 1200px) {
  .sidebar {
    width: 300px;
  }
  
  .sidebar.collapsed {
    width: 80px;
  }
}

/* Ensure mobile menu is hidden on desktop */
@media (min-width: 769px) {
  .mobile-menu-btn {
    display: none !important;
  }
  
  .mobile-overlay {
    display: none !important;
  }
}

/* Scrollbar Styling */
.content-area::-webkit-scrollbar {
  width: 6px;
}

.content-area::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
}

.content-area::-webkit-scrollbar-thumb {
  background: var(--border-light);
  border-radius: 3px;
}

.content-area::-webkit-scrollbar-thumb:hover {
  background: var(--border-color);
}

/* Global dark mode support for child components */
:root.dark .card,
:root.dark .expense-item,
:root.dark .category-item,
:root.dark .chart-container,
:root.dark .form-container,
:root.dark .settings-section {
  background: var(--bg-secondary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

:root.dark input,
:root.dark select,
:root.dark textarea {
  background: var(--bg-tertiary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

:root.dark input::placeholder,
:root.dark textarea::placeholder {
  color: var(--text-secondary);
}

:root.dark button {
  background: var(--bg-tertiary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

:root.dark button:hover {
  background: var(--border-light);
}

:root.dark .table,
:root.dark .table th,
:root.dark .table td {
  background: var(--bg-secondary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

:root.dark .modal,
:root.dark .popup {
  background: var(--bg-secondary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

/* Dark mode transitions */
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
</style>
