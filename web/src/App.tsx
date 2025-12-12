import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { securityMiddleware } from './lib/securityMiddleware';
import Landing from './components/Landing/Landing';
import Dashboard from './components/Dashboard/Dashboard';
import Chat from './components/Chat/Chat';
import Settings from './components/Settings/Settings';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const { user } = useStore();

  // Initialize security middleware
  React.useEffect(() => {
    securityMiddleware.initialize();
    
    // Validate session on app start
    if (!securityMiddleware.validateSession()) {
      securityMiddleware.createSession();
    }
  }, []);

  // Security monitoring
  React.useEffect(() => {
    const handleSecurityViolation = (event: Event) => {
      console.warn('Security violation detected:', event);
      // TODO: Implement security incident reporting
    };

    // Monitor for security events
    document.addEventListener('securitypolicyviolation', handleSecurityViolation);
    
    return () => {
      document.removeEventListener('securitypolicyviolation', handleSecurityViolation);
    };
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" replace /> : <Landing />}
          />
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <Navigate to="/" replace />}
          />
          <Route
            path="/chat"
            element={user ? <Chat /> : <Navigate to="/" replace />}
          />
          <Route
            path="/settings"
            element={user ? <Settings /> : <Navigate to="/" replace />}
          />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
