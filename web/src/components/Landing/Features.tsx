import { Smartphone, Zap, Lock, DollarSign, Code2 } from 'lucide-react';

const features = [
  {
    icon: Smartphone,
    title: 'Works on Any Phone',
    description: 'Progressive Web App - no app store needed',
  },
  {
    icon: Code2,
    title: 'Direct Cursor Integration',
    description: 'Seamless connection via MCP protocol',
  },
  {
    icon: Zap,
    title: 'Real-time Code Changes',
    description: 'See your changes instantly on desktop',
  },
  {
    icon: DollarSign,
    title: 'Completely Free',
    description: 'No costs, no credit card required',
  },
  {
    icon: Lock,
    title: 'End-to-End Encrypted',
    description: 'Your code stays private and secure',
  },
];

export default function Features() {
  return (
    <section className="container mx-auto px-4 py-20">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
        Why MobileCoderMCP?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-primary-500 transition-colors"
            >
              <div className="bg-primary-600/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

