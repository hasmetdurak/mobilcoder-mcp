import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { onAuthStateChanged } from '../../lib/auth';
import Hero from './Hero';
import Features from './Features';
import SetupInstructions from './SetupInstructions';

export default function Landing() {
  const navigate = useNavigate();
  const { setUser } = useStore();

  useEffect(() => {
    // Check if user is already logged in
    const unsubscribe = onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        navigate('/dashboard');
      }
    });

    return () => unsubscribe();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Hero />
      <Features />
      <SetupInstructions />
      <footer className="bg-gray-900 py-8 text-center text-gray-400">
        <p>MobileCoderMCP © 2024 • Free Forever</p>
      </footer>
    </div>
  );
}

