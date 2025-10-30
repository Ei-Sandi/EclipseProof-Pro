import { Shield } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="border-t border-cyan-300 bg-cyan-100 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Shield className="w-6 h-6 text-slate-900" />
                        <span className="text-lg font-bold text-slate-900">
                            EclipseProof
                        </span>
                    </div>
                    <p className="text-slate-700 text-sm">
                        © 2025 EclipseProof. Privacy-first income verification.
                    </p>
                    <div className="flex gap-6 text-sm text-slate-700">
                        <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
                        <a href="#" className="hover:text-slate-900 transition-colors">Contact</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}