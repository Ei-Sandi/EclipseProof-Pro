import { Shield, Lock, FileCheck, Sparkles } from 'lucide-react';

interface ProofLoadingAnimationProps {
    isOpen: boolean;
}

export default function ProofLoadingAnimation({ isOpen }: ProofLoadingAnimationProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                <div className="text-center space-y-6">
                    {/* Animated Shield Icon */}
                    <div className="relative w-24 h-24 mx-auto">
                        {/* Outer rotating ring */}
                        <div className="absolute inset-0 border-4 border-cyan-200 rounded-full animate-spin"
                            style={{ animationDuration: '3s' }} />

                        {/* Middle pulsing ring */}
                        <div className="absolute inset-2 border-4 border-blue-300 rounded-full animate-pulse" />

                        {/* Inner rotating ring */}
                        <div className="absolute inset-4 border-4 border-cyan-400 rounded-full animate-spin"
                            style={{ animationDuration: '2s', animationDirection: 'reverse' }} />

                        {/* Center shield icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Shield className="w-10 h-10 text-cyan-600 animate-pulse" />
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">
                            Generating Your Proof
                        </h3>
                        <p className="text-slate-600">
                            Please wait while we create your zero-knowledge proof...
                        </p>
                    </div>

                    {/* Loading Steps */}
                    <div className="space-y-4 text-left">
                        <LoadingStep
                            icon={<FileCheck className="w-5 h-5" />}
                            text="Verifying identity documents"
                            delay="0s"
                        />
                        <LoadingStep
                            icon={<Lock className="w-5 h-5" />}
                            text="Processing encrypted payslip data"
                            delay="1s"
                        />
                        <LoadingStep
                            icon={<Sparkles className="w-5 h-5" />}
                            text="Generating cryptographic proof"
                            delay="2s"
                        />
                        <LoadingStep
                            icon={<Shield className="w-5 h-5" />}
                            text="Posting to Midnight blockchain"
                            delay="3s"
                        />
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-progress" />
                    </div>

                    <p className="text-sm text-slate-500 italic">
                        This process is secure and privacy-preserving ✨
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes progress {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }
                .animate-progress {
                    animation: progress 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}

interface LoadingStepProps {
    icon: React.ReactNode;
    text: string;
    delay: string;
}

function LoadingStep({ icon, text, delay }: LoadingStepProps) {
    return (
        <div
            className="flex items-center gap-3 text-slate-700 opacity-0 animate-fadeIn"
            style={{ animationDelay: delay, animationFillMode: 'forwards' }}
        >
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center text-cyan-600 animate-pulse">
                {icon}
            </div>
            <span className="font-medium">{text}</span>
            <div className="ml-auto flex gap-1">
                <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
            `}</style>
        </div>
    );
}
