// ============================================
// MAIN APP COMPONENT
// ============================================

import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import Header from './features/shared/components/Header';
import Footer from './features/shared/components/Footer';
import { Toaster } from 'react-hot-toast';
import { FullPageLoader } from './features/shared/components/Loader';
import useAuth from './hooks/useAuth';
import useSocket from './hooks/useSocket';
import NotificationHandler from './hooks/useNotification';
import { HelmetProvider } from 'react-helmet-async';
import store from './redux/store';
import { ClerkProvider } from '@clerk/clerk-react';
import router from './routes';
import './styles/globals.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

// ============================================
// APP COMPONENT
// ============================================
function App() {
  // ============================================
  // DETECT ONLINE/OFFLINE STATUS
  // ============================================
  useEffect(() => {
    const handleOnline = () => {
      console.log('✅ Back online');
    };

    const handleOffline = () => {
      console.log('❌ Connection lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <HelmetProvider>
      <Provider store={store}>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '8px',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />

          {/* Router */}
          <RouterProvider router={router} />
        </ClerkProvider>
      </Provider>
    </HelmetProvider>
  );
}

export default App;