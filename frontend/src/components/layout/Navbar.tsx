import { Shield } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <nav className="fixed top-0 w-full bg-white backdrop-blur-md border-b border-slate-200 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 cursor-pointer"
                >
                    <Shield className="w-8 h-8 text-cyan-500" />
                    <span className="text-2xl font-bold text-slate-900">
                        EclipseProof
                    </span>
                </button>
                <div className="flex gap-4">
                    {currentPath === '/' && (
                        <>
                            <button
                                onClick={() => navigate('/login')}
                                className="px-6 py-2 text-slate-700 hover:text-slate-900 transition-colors"
                            >
                                Log In
                            </button>
                            <button
                                onClick={() => navigate('/register')}
                                className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all"
                            >
                                Get Started
                            </button>
                        </>
                    )}
                    {currentPath !== '/' && (
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-2 text-slate-700 hover:text-slate-900 transition-colors"
                        >
                            ← Back to Home
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}