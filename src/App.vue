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
            @click="handleNavClick"
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
import { useTheme } from './composables/useTheme.js'

// Import our design system styles
import "./assets/styles/design-system.css";

// Sidebar state
const sidebarCollapsed = ref(false);

// Mobile detection
const isMobile = ref(window.innerWidth <= 768);

// Global theme
const { isDark: isDarkMode, toggle: toggleTheme } = useTheme()

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
  
  // Theme init handled inside useTheme()

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
    path: "/analytics",
    name: "Analytics",
    icon: "📈",
    subtitle: "Financial insights and trends",
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

const handleNavClick = () => {
  // Close sidebar on mobile when navigation item is clicked
  if (isMobile.value) {
    sidebarCollapsed.value = true;
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

const toggleDarkMode = () => toggleTheme()
</script>

<style>
/* App-specific styles using the design system */
#app {
  font-family: var(--font-family-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
  overflow: hidden;
}

.app-layout {
  display: flex;
  height: 100vh;
  background: var(--color-surface-primary);
  transition: var(--transition-colors);
}

/* Mobile Overlay */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-surface-overlay);
  z-index: var(--z-index-modal-backdrop);
  backdrop-filter: blur(4px);
}

/* Sidebar Styles */
.sidebar {
  width: var(--sidebar-width);
  background: linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-accent-600) 100%);
  color: var(--color-text-inverse);
  display: flex;
  flex-direction: column;
  transition: var(--transition-all);
  box-shadow: var(--shadow-lg);
  position: relative;
  z-index: var(--z-index-fixed);
}

.sidebar.collapsed {
  width: var(--sidebar-width-collapsed);
}

.sidebar.mobile {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: var(--z-index-modal);
  transform: translateX(-100%);
  width: var(--sidebar-width) !important;
}

.sidebar.mobile.mobile-open {
  transform: translateX(0);
}

.sidebar.mobile.collapsed {
  transform: translateX(-100%);
}

.sidebar-header {
  padding: var(--space-5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: var(--header-height);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.logo-icon {
  font-size: var(--font-size-2xl);
}

.logo-text {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.sidebar-toggle {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: var(--color-text-inverse);
  padding: var(--space-2);
  border-radius: var(--radius-base);
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: var(--transition-colors);
  width: var(--size-lg);
  height: var(--size-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
}

.sidebar-nav {
  flex: 1;
  padding: var(--space-5) 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: var(--transition-colors);
  border-left: 3px solid transparent;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-inverse);
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.15);
  color: var(--color-text-inverse);
  border-left-color: var(--color-text-inverse);
  font-weight: var(--font-weight-semibold);
}

.nav-icon {
  font-size: var(--font-size-lg);
  min-width: var(--size-base);
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.sidebar-footer {
  padding: var(--space-5);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.app-status {
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.1);
  transition: var(--transition-colors);
}

.status-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
  font-size: var(--font-size-xs);
  color: rgba(255, 255, 255, 0.9);
}

.status-dot {
  width: var(--space-2);
  height: var(--space-2);
  border-radius: var(--radius-full);
}

.status-dot.connected {
  background: var(--color-success-400);
}

.status-dot.disconnected {
  background: var(--color-warning-400);
}

.status-dot.loading {
  background: var(--color-info-400);
  animation: pulse 1.5s ease-in-out infinite;
}

.version {
  font-size: var(--font-size-xs);
  color: rgba(255, 255, 255, 0.7);
}

/* Main Content Styles */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.top-header {
  background: var(--color-surface-elevated);
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--color-border-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--shadow-sm);
  transition: var(--transition-colors);
  min-height: var(--header-height);
}

.header-left {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.mobile-menu-btn {
  display: none;
  flex-direction: column;
  justify-content: center;
  width: var(--button-height-base);
  height: var(--button-height-base);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-md);
  transition: var(--transition-colors);
}

.mobile-menu-btn span {
  display: block;
  height: 3px;
  width: 24px;
  background: var(--color-text-primary);
  margin: 2px 0;
  transition: var(--transition-transform);
  border-radius: 2px;
}

.mobile-menu-btn:hover {
  background: var(--color-surface-secondary);
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
  color: var(--color-text-primary);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--space-1) 0;
  transition: var(--transition-colors);
  line-height: var(--line-height-tight);
}

.page-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin: 0;
  transition: var(--transition-colors);
  line-height: var(--line-height-normal);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--space-5);
}

.theme-toggle {
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border-primary);
  color: var(--color-text-primary);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-size: var(--font-size-base);
  transition: var(--transition-all);
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--button-height-base);
  height: var(--button-height-base);
}

.theme-toggle:hover {
  background: var(--color-surface-tertiary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-4);
  background: var(--color-surface-secondary);
  border-radius: var(--radius-lg);
  transition: var(--transition-colors);
  border: 1px solid var(--color-border-primary);
}

.user-avatar {
  font-size: var(--font-size-lg);
}

.user-name {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  transition: var(--transition-colors);
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-6);
  background: var(--color-surface-primary);
  transition: var(--transition-colors);
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
  
  .content-area {
    padding: var(--space-5);
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
    font-size: var(--font-size-xl);
  }
  
  .page-subtitle {
    display: none;
  }
  
  .main-content {
    width: 100%;
  }
  
  .content-area {
    padding: var(--space-4);
  }
  
  .top-header {
    padding: var(--space-3) var(--space-4);
  }
  
  .header-right {
    gap: var(--space-3);
  }
  
  .user-info {
    padding: var(--space-2) var(--space-3);
  }
  
  .theme-toggle {
    padding: var(--space-2);
    font-size: var(--font-size-sm);
    width: var(--button-height-sm);
    height: var(--button-height-sm);
  }
}

/* Mobile portrait */
@media (max-width: 480px) {
  .page-title {
    font-size: var(--font-size-lg);
  }
  
  .content-area {
    padding: var(--space-3);
  }
  
  .top-header {
    padding: var(--space-3);
  }
  
  .header-right {
    gap: var(--space-2);
  }
  
  .user-name {
    display: none;
  }
  
  .theme-toggle {
    padding: var(--space-1);
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
  
  .content-area {
    padding: var(--space-8);
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
  background: var(--color-surface-tertiary);
}

.content-area::-webkit-scrollbar-thumb {
  background: var(--color-border-secondary);
  border-radius: var(--radius-sm);
}

.content-area::-webkit-scrollbar-thumb:hover {
  background: var(--color-border-primary);
}

/* Animation utilities */
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
</style>
