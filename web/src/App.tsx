import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Landing from './components/Landing/Landing';
import Dashboard from './components/Dashboard/Dashboard';
import Chat from './components/Chat/Chat';
import Settings from './components/Settings/Settings';

function App() {
  const { user } = useStore();

  return (
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
  );
}

export default App;
