// ============================================
// UI SLICE
// ============================================

import { createSlice } from '@reduxjs/toolkit';
import { storage } from '../../utils/helpers';
import config from '../../config';

// ============================================
// INITIAL STATE
// ============================================
const initialState = {
  // Theme
  theme: storage.get(config.storage.theme) || 'light',
  
  // Sidebar
  sidebarOpen: true,
  sidebarCollapsed: storage.get('sidebar_collapsed') || false,
  
  // Modals
  modals: {},
  
  // Drawers
  drawers: {},
  
  // Toast notifications
  toasts: [],
  
  // Loading overlay
  globalLoading: false,
  loadingMessage: '',
  
  // Scroll position
  scrollPosition: 0,
  
  // Search
  searchOpen: false,
  searchQuery: '',
  
  // Mobile menu
  mobileMenuOpen: false,
  
  // Notification panel
  notificationPanelOpen: false,
  
  // User menu
  userMenuOpen: false,
  
  // Page title
  pageTitle: '',
  
  // Breadcrumbs
  breadcrumbs: [],
  
  // Filters panel
  filtersPanelOpen: false,
  
  // Layout
  layout: 'default', // 'default', 'compact', 'fullscreen'
};

// ============================================
// UI SLICE
// ============================================
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // ============================================
    // THEME
    // ============================================
    setTheme: (state, action) => {
      state.theme = action.payload;
      storage.set(config.storage.theme, action.payload);
      
      // Apply to document
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(action.payload);
      }
    },
    
    toggleTheme: (state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      state.theme = newTheme;
      storage.set(config.storage.theme, newTheme);
      
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(newTheme);
      }
    },
    
    // ============================================
    // SIDEBAR
    // ============================================
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    
    toggleSidebarCollapse: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      storage.set('sidebar_collapsed', state.sidebarCollapsed);
    },
    
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
      storage.set('sidebar_collapsed', action.payload);
    },
    
    // ============================================
    // MODALS
    // ============================================
    openModal: (state, action) => {
      const { id, props = {} } = action.payload;
      state.modals[id] = { isOpen: true, props };
    },
    
    closeModal: (state, action) => {
      const id = action.payload;
      if (state.modals[id]) {
        state.modals[id].isOpen = false;
      }
    },
    
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(id => {
        state.modals[id].isOpen = false;
      });
    },
    
    // ============================================
    // DRAWERS
    // ============================================
    openDrawer: (state, action) => {
      const { id, props = {} } = action.payload;
      state.drawers[id] = { isOpen: true, props };
    },
    
    closeDrawer: (state, action) => {
      const id = action.payload;
      if (state.drawers[id]) {
        state.drawers[id].isOpen = false;
      }
    },
    
    // ============================================
    // TOASTS
    // ============================================
    addToast: (state, action) => {
      const toast = {
        id: Date.now() + Math.random(),
        type: 'info',
        duration: 3000,
        ...action.payload,
      };
      state.toasts.push(toast);
    },
    
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    },
    
    clearToasts: (state) => {
      state.toasts = [];
    },
    
    // ============================================
    // GLOBAL LOADING
    // ============================================
    setGlobalLoading: (state, action) => {
      const { loading, message = '' } = action.payload;
      state.globalLoading = loading;
      state.loadingMessage = message;
    },
    
    showGlobalLoading: (state, action) => {
      state.globalLoading = true;
      state.loadingMessage = action.payload || '';
    },
    
    hideGlobalLoading: (state) => {
      state.globalLoading = false;
      state.loadingMessage = '';
    },
    
    // ============================================
    // SEARCH
    // ============================================
    setSearchOpen: (state, action) => {
      state.searchOpen = action.payload;
    },
    
    toggleSearch: (state) => {
      state.searchOpen = !state.searchOpen;
    },
    
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    
    // ============================================
    // MOBILE MENU
    // ============================================
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    
    setMobileMenuOpen: (state, action) => {
      state.mobileMenuOpen = action.payload;
    },
    
    // ============================================
    // PANELS
    // ============================================
    toggleNotificationPanel: (state) => {
      state.notificationPanelOpen = !state.notificationPanelOpen;
    },
    
    setNotificationPanelOpen: (state, action) => {
      state.notificationPanelOpen = action.payload;
    },
    
    toggleUserMenu: (state) => {
      state.userMenuOpen = !state.userMenuOpen;
    },
    
    setUserMenuOpen: (state, action) => {
      state.userMenuOpen = action.payload;
    },
    
    toggleFiltersPanel: (state) => {
      state.filtersPanelOpen = !state.filtersPanelOpen;
    },
    
    setFiltersPanelOpen: (state, action) => {
      state.filtersPanelOpen = action.payload;
    },
    
    // ============================================
    // PAGE
    // ============================================
    setPageTitle: (state, action) => {
      state.pageTitle = action.payload;
      
      // Update document title
      if (typeof document !== 'undefined') {
        document.title = `${action.payload} | ${config.app.name}`;
      }
    },
    
    setBreadcrumbs: (state, action) => {
      state.breadcrumbs = action.payload;
    },
    
    setScrollPosition: (state, action) => {
      state.scrollPosition = action.payload;
    },
    
    // ============================================
    // LAYOUT
    // ============================================
    setLayout: (state, action) => {
      state.layout = action.payload;
    },
    
    // ============================================
    // RESET
    // ============================================
    resetUI: (state) => {
      return {
        ...initialState,
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      };
    },
  },
});

// ============================================
// ACTIONS
// ============================================
export const {
  setTheme,
  toggleTheme,
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapse,
  setSidebarCollapsed,
  openModal,
  closeModal,
  closeAllModals,
  openDrawer,
  closeDrawer,
  addToast,
  removeToast,
  clearToasts,
  setGlobalLoading,
  showGlobalLoading,
  hideGlobalLoading,
  setSearchOpen,
  toggleSearch,
  setSearchQuery,
  toggleMobileMenu,
  setMobileMenuOpen,
  toggleNotificationPanel,
  setNotificationPanelOpen,
  toggleUserMenu,
  setUserMenuOpen,
  toggleFiltersPanel,
  setFiltersPanelOpen,
  setPageTitle,
  setBreadcrumbs,
  setScrollPosition,
  setLayout,
  resetUI,
} = uiSlice.actions;

// ============================================
// SELECTORS
// ============================================
export const selectTheme = (state) => state.ui.theme;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed;
export const selectModals = (state) => state.ui.modals;
export const selectModal = (id) => (state) => state.ui.modals[id];
export const selectDrawers = (state) => state.ui.drawers;
export const selectDrawer = (id) => (state) => state.ui.drawers[id];
export const selectToasts = (state) => state.ui.toasts;
export const selectGlobalLoading = (state) => state.ui.globalLoading;
export const selectLoadingMessage = (state) => state.ui.loadingMessage;
export const selectSearchOpen = (state) => state.ui.searchOpen;
export const selectSearchQuery = (state) => state.ui.searchQuery;
export const selectMobileMenuOpen = (state) => state.ui.mobileMenuOpen;
export const selectNotificationPanelOpen = (state) => state.ui.notificationPanelOpen;
export const selectUserMenuOpen = (state) => state.ui.userMenuOpen;
export const selectFiltersPanelOpen = (state) => state.ui.filtersPanelOpen;
export const selectPageTitle = (state) => state.ui.pageTitle;
export const selectBreadcrumbs = (state) => state.ui.breadcrumbs;
export const selectLayout = (state) => state.ui.layout;

// ============================================
// REDUCER
// ============================================
export default uiSlice.reducer;