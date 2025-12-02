import { Copy, Check, Terminal } from 'lucide-react';
import { useState } from 'react';

export default function SetupInstructions() {
  const [copied, setCopied] = useState(false);

  const command = 'npx mobile-coder-mcp init';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="setup" className="container mx-auto px-4 py-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Get Started in 5 Minutes
          </h2>
          <p className="text-xl text-gray-400">
            Simple setup, powerful results
          </p>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-gray-700">
          <ol className="space-y-8">
            <li className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center font-bold text-xl">
                  1
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Sign in with Google</h3>
                <p className="text-gray-400 leading-relaxed">
                  Click the "Sign in with Google" button above. No password needed, just your Google account.
                </p>
              </div>
            </li>
            
            <li className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center font-bold text-xl">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Get your connection code</h3>
                <p className="text-gray-400 leading-relaxed mb-4">
                  After signing in, you'll see a unique connection code on your dashboard. This code pairs your phone with your computer.
                </p>
              </div>
            </li>
            
            <li className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center font-bold text-xl">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Run on your computer</h3>
                <p className="text-gray-400 leading-relaxed mb-4">
                  Open your terminal and run this command. It will install and configure everything automatically:
                </p>
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 flex items-center gap-3 group">
                  <Terminal className="w-5 h-5 text-primary-400 flex-shrink-0" />
                  <code className="flex-1 text-sm text-primary-300 font-mono break-all">
                    {command}
                  </code>
                  <button
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-gray-800 rounded transition-colors flex-shrink-0"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-400 group-hover:text-white" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  The installer will automatically configure Cursor, Windsurf, or VS Code for you.
                </p>
              </div>
            </li>
            
            <li className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center font-bold text-xl">
                  4
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Start coding!</h3>
                <p className="text-gray-400 leading-relaxed">
                  Go back to your phone, tap "Connect MCP" on the dashboard, and you're ready to code from anywhere.
                </p>
              </div>
            </li>
          </ol>
        </div>

        <div className="mt-8 bg-blue-900/20 border border-blue-700/50 rounded-xl p-6">
          <h4 className="font-semibold text-blue-400 mb-2">💡 Pro Tip</h4>
          <p className="text-sm text-gray-300">
            Add this app to your home screen for quick access. On iOS: Tap Share → "Add to Home Screen". 
            On Android: Tap Menu (⋮) → "Add to Home Screen".
          </p>
        </div>
      </div>
    </section>
  );
}
