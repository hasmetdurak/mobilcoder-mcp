import { Code, Smartphone, Zap, Shield, Globe } from 'lucide-react';
import GoogleSignIn from '../Auth/GoogleSignIn';

export default function Hero() {
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
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-6 rounded-3xl shadow-2xl shadow-primary-500/20 transform hover:scale-105 transition-transform">
            <Smartphone className="w-16 h-16" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-primary-200 to-primary-400 bg-clip-text text-transparent leading-tight">
          Code from Anywhere
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-2xl mx-auto">
          Connect your phone to Cursor, Windsurf, or VS Code. Code on the go, no compromises.
        </p>
        
        <p className="text-lg text-gray-400 mb-12">
          Free forever • Secure • Works on any device
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <GoogleSignIn />
          <a
            href="#features"
            className="px-8 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            Learn More
          </a>
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
    </section>
  );
}

