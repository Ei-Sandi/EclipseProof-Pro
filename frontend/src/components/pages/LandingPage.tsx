import { Shield, Lock, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="pt-24 pb-16 px-6">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-100 border border-cyan-300 rounded-full mb-6">
            <Lock className="w-4 h-4 text-slate-900" />
            <span className="text-slate-900 text-sm">Zero-Knowledge Privacy Protection</span>
          </div>
          <h1 className="text-6xl font-bold mb-6 text-slate-900">
            Prove Your Income<br />Without Revealing It
          </h1>
          <p className="text-xl text-slate-700 max-w-3xl mx-auto mb-8">
            EclipseProof uses zero-knowledge proofs on Midnight to verify your income without exposing sensitive financial details. Privacy-first verification for rentals, loans, and more.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-slate-900 text-white text-lg rounded-lg hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/30 flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 bg-cyan-100 text-slate-900 text-lg rounded-lg hover:bg-cyan-200 transition-all border border-cyan-300">
              Learn More
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-cyan-50 backdrop-blur-sm border border-cyan-200 rounded-xl p-8 hover:border-cyan-300 transition-all">
            <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Zero-Knowledge Proofs</h3>
            <p className="text-slate-700">
              Prove you meet income requirements without revealing your exact salary or employer details.
            </p>
          </div>

          <div className="bg-cyan-50 backdrop-blur-sm border border-cyan-200 rounded-xl p-8 hover:border-cyan-300 transition-all">
            <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Maximum Privacy</h3>
            <p className="text-slate-700">
              Your sensitive financial data stays private. Share only what's necessary, nothing more.
            </p>
          </div>

          <div className="bg-cyan-50 backdrop-blur-sm border border-cyan-200 rounded-xl p-8 hover:border-cyan-300 transition-all">
            <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Trusted Verification</h3>
            <p className="text-slate-700">
              Landlords and lenders get the assurance they need with cryptographically secure proofs.
            </p>
          </div>
        </div>

        {/* Use Cases */}
        <div className="bg-cyan-100 backdrop-blur-sm border border-cyan-300 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">
            Perfect For
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🏠</div>
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Rental Applications</h4>
              <p className="text-slate-700 text-sm">Prove income to landlords without sharing payslips</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📱</div>
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Phone Contracts</h4>
              <p className="text-slate-700 text-sm">Get approved for installments while protecting privacy</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">✍️</div>
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Acting as Guarantor</h4>
              <p className="text-slate-700 text-sm">Verify your financial standing securely</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}