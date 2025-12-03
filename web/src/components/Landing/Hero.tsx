import { Code, Smartphone, Zap, Shield, Globe, QrCode } from 'lucide-react';
import AuthButtons from '../Auth/AuthButtons';
import { useState } from 'react';
import QRScanner from '../Auth/QRScanner';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const [showScanner, setShowScanner] = useState(false);
  const { setConnectionCode } = useStore();
  const navigate = useNavigate();

  const handleScan = (data: string | null) => {
    if (data) {
      setConnectionCode(data);
      setShowScanner(false);
      navigate('/chat');
    }
  };

  return (
    <section className="container mx-auto px-4 py-24 md:py-32 text-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-primary-900/20" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-primary-900/30 border border-primary-700/50 rounded-full px-4 py-2 mb-8 text-sm">
          <Globe className="w-4 h-4 text-primary-400" />
          <span className="text-primary-200">Works everywhere • PWA ready</span>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-6 rounded-3xl shadow-2xl shadow-primary-500/20 transform hover:scale-105 transition-transform relative group">
            <Smartphone className="w-16 h-16" />
            <div className="absolute -bottom-2 -right-2 bg-white text-black p-2 rounded-xl shadow-lg transform rotate-12 group-hover:rotate-0 transition-transform">
              <QrCode size={20} />
            </div>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-primary-200 to-primary-400 bg-clip-text text-transparent leading-tight">
          Code from Anywhere
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-2xl mx-auto">
          Connect your phone to <span className="font-bold text-primary-300">Cursor, Windsurf, VS Code, Qoder, Treai, or Kiro</span>. Code on the go, no compromises.
        </p>

        <p className="text-lg text-gray-400 mb-12">
          Free forever • Secure • Works on any device
        </p>

        <div className="flex flex-col items-center gap-6 mb-12">
          <AuthButtons />

          <div className="flex items-center gap-3">
            <div className="h-px w-16 bg-gray-700"></div>
            <span className="text-sm text-gray-500">or</span>
            <div className="h-px w-16 bg-gray-700"></div>
          </div>

          <button
            onClick={() => setShowScanner(true)}
            className="px-8 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl font-semibold transition-all flex items-center gap-2 text-white group shadow-lg hover:shadow-xl active:scale-95 duration-150"
          >
            <QrCode className="w-5 h-5 text-primary-400 group-hover:scale-110 transition-transform" />
            Scan QR Code to Connect
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-8 text-sm">
          <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700">
            <Zap className="w-4 h-4 text-primary-400" />
            <span>Setup in 5 min</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700">
            <Code className="w-4 h-4 text-primary-400" />
            <span>No credit card</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700">
            <Shield className="w-4 h-4 text-primary-400" />
            <span>End-to-end encrypted</span>
          </div>
        </div>
      </div>

      {showScanner && (
        <QRScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </section>
  );
}
