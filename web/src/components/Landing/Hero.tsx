import { Code, Smartphone, Zap } from 'lucide-react';
import GoogleSignIn from '../Auth/GoogleSignIn';

export default function Hero() {
  return (
    <section className="container mx-auto px-4 py-20 text-center">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="bg-primary-600 p-4 rounded-2xl">
            <Smartphone className="w-12 h-12" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
          🚀 Code from Anywhere
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-8">
          Use Cursor from your phone. Free forever.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <GoogleSignIn />
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary-400" />
            <span>Setup in 5 min</span>
          </div>
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-primary-400" />
            <span>No credit card</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-primary-400">🔒</span>
            <span>100% secure</span>
          </div>
        </div>
      </div>
    </section>
  );
}

