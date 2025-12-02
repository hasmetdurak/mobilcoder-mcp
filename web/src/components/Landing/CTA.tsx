import { ArrowRight } from 'lucide-react';
import GoogleSignIn from '../Auth/GoogleSignIn';

export default function CTA() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Code from Anywhere?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Get started in 5 minutes. No credit card required.
          </p>
          <div className="flex justify-center">
            <GoogleSignIn />
          </div>
          <p className="text-sm text-primary-200 mt-6">
            Free forever • Secure • No setup fees
          </p>
        </div>
      </div>
    </section>
  );
}

