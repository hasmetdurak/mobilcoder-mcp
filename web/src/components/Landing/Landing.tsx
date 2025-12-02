import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { onAuthStateChanged } from '../../lib/auth';
import Hero from './Hero';
import Features from './Features';
import SetupInstructions from './SetupInstructions';
import Testimonials from './Testimonials';
import CTA from './CTA';

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
      <Testimonials />
      <CTA />
      <footer className="bg-gray-900/50 backdrop-blur-sm border-t border-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">MobileCoderMCP</h3>
              <p className="text-sm text-gray-400">
                Code from anywhere, right from your phone. Built for developers who code on the go.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="https://github.com/hasmetdurak/mobilcoder-mcp" className="hover:text-white transition-colors">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="/USER_GUIDE.md" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="https://github.com/hasmetdurak/mobilcoder-mcp/issues" className="hover:text-white transition-colors">
                    Report Issue
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>MobileCoderMCP © 2024 • Made with ❤️ for developers</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

