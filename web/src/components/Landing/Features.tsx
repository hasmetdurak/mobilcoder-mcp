import { Smartphone, Zap, Lock, DollarSign, Code2, Globe, Shield, Clock } from 'lucide-react';

const features = [
  {
    icon: Smartphone,
    title: 'Works on Any Device',
    description: 'Progressive Web App that works on iOS, Android, and desktop. No app store needed.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Code2,
    title: 'Native Editor Integration',
    description: 'Direct connection to Cursor, Windsurf, VS Code, and Gravity IDE via MCP protocol.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: Zap,
    title: 'Real-time Updates',
    description: 'See your code changes instantly on your desktop. No delays, no waiting.',
    color: 'from-yellow-500 to-yellow-600',
  },
  {
    icon: DollarSign,
    title: 'Completely Free',
    description: 'No hidden costs, no credit card required. Built to stay free forever.',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: Lock,
    title: 'End-to-End Encrypted',
    description: 'Your code never touches our servers. Direct P2P connection keeps everything private.',
    color: 'from-red-500 to-red-600',
  },
  {
    icon: Clock,
    title: '5-Minute Setup',
    description: 'Get up and running in minutes. One command on your computer, and you\'re ready to code.',
    color: 'from-indigo-500 to-indigo-600',
  },
];

export default function Features() {
  return (
    <section id="features" className="container mx-auto px-4 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Everything You Need to Code on the Go
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Built for developers who want flexibility without compromising on security or performance.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-primary-500 transition-all hover:shadow-xl hover:shadow-primary-500/10"
              >
                <div className={`bg-gradient-to-br ${feature.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

