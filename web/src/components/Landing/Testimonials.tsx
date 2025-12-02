import { Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Alex Chen',
    role: 'Full-stack Developer',
    content: 'This is exactly what I needed! I can now code during my commute. Setup took 2 minutes and it works perfectly.',
    avatar: '👨‍💻',
  },
  {
    name: 'Sarah Johnson',
    role: 'Frontend Developer',
    content: 'Game changer for me. I can fix bugs and add features from my phone while away from my desk. The connection is rock solid.',
    avatar: '👩‍💻',
  },
  {
    name: 'Mike Rodriguez',
    role: 'Indie Developer',
    content: 'As a solo developer, this saves me so much time. I can code from anywhere and the P2P connection means my code stays private.',
    avatar: '🧑‍💻',
  },
];

export default function Testimonials() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          What Developers Are Saying
        </h2>
        <p className="text-center text-gray-400 mb-12">
          Join hundreds of developers coding from anywhere
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-primary-500 transition-colors"
            >
              <Quote className="w-8 h-8 text-primary-400 mb-4" />
              <p className="text-gray-300 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-3">
                <div className="text-3xl">{testimonial.avatar}</div>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

