import { Shield, User, LogOut } from 'lucide-react';

interface DashboardHeaderProps {
    userEmail?: string;
    onLogout: () => void;
}

export default function DashboardHeader({ userEmail, onLogout }: DashboardHeaderProps) {
    return (
        <nav className="fixed top-0 w-full bg-white backdrop-blur-md border-b border-slate-200 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Shield className="w-8 h-8 text-cyan-500" />
                    <span className="text-2xl font-bold text-slate-900">
                        EclipseProof
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-cyan-50 rounded-lg">
                        <User className="w-5 h-5 text-slate-700" />
                        <span className="text-slate-700 text-sm font-medium">
                            {userEmail || 'user@example.com'}
                        </span>
                    </div>
                    <button
                        onClick={onLogout}
                        className="px-4 py-2 text-slate-700 hover:text-slate-900 transition-colors flex items-center gap-2"
                    >
                        <LogOut className="w-5 h-5" />
                        Log Out
                    </button>
                </div>
            </div>
        </nav>
    );
}
