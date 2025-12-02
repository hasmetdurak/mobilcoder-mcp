import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function SetupInstructions() {
  const [copied, setCopied] = useState(false);

  const command = 'npx mobile-coder-mcp init --code=ABC123';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="container mx-auto px-4 py-20">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Quick Setup (5 minutes)
        </h2>
        
        <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700">
          <ol className="space-y-6">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center font-bold">
                1
              </span>
              <div>
                <h3 className="font-semibold mb-2">Sign in with Google</h3>
                <p className="text-gray-400">Click the button above to authenticate</p>
              </div>
            </li>
            
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center font-bold">
                2
              </span>
              <div>
                <h3 className="font-semibold mb-2">Get your connection code</h3>
                <p className="text-gray-400">After signing in, you'll receive a unique code</p>
              </div>
            </li>
            
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center font-bold">
                3
              </span>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Run on your computer</h3>
                <p className="text-gray-400 mb-3">Copy and run this command in your terminal:</p>
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 flex items-center gap-3">
                  <code className="flex-1 text-sm text-primary-300 font-mono">
                    {command}
                  </code>
                  <button
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-gray-800 rounded transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </li>
            
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center font-bold">
                4
              </span>
              <div>
                <h3 className="font-semibold mb-2">Start coding!</h3>
                <p className="text-gray-400">Your phone and desktop are now connected</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}

