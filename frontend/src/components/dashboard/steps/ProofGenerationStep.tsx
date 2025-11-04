import type { FormEvent } from 'react';
import { Shield, CheckCircle, AlertCircle, Lock, FileCheck, Globe } from 'lucide-react';
import { useState } from 'react';

interface ProofGenerationStepProps {
    onSubmit: (e: FormEvent) => void;
    onPrevious: () => void;
}

export default function ProofGenerationStep({
    onSubmit,
    onPrevious
}: ProofGenerationStepProps) {
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (agreedToTerms) {
            onSubmit(e);
        }
    };

    return (
        <div className="space-y-6">
            {/* Zero-Knowledge Proof Explanation */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                        <Shield className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Generate Your Proof</h2>
                        <p className="text-slate-600">Understanding Zero-Knowledge Proofs & Privacy</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* What is ZKP */}
                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-6">
                        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-cyan-600" />
                            What is a Zero-Knowledge Proof?
                        </h3>
                        <p className="text-slate-700 mb-3">
                            A Zero-Knowledge Proof (ZKP) is a cryptographic method that allows you to prove a statement is true
                            without revealing any information beyond the validity of the statement itself.
                        </p>
                        <p className="text-slate-700">
                            In your case, we'll prove you earn above a certain threshold <strong>without revealing your exact income</strong>
                            or any other sensitive personal information.
                        </p>
                    </div>

                    {/* How Your Data is Protected */}
                    <div>
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <FileCheck className="w-5 h-5 text-cyan-600" />
                            How Your Data is Protected
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <CheckCircle className="w-5 h-5 text-green-600 mb-2" />
                                <h4 className="font-semibold text-slate-900 mb-1">Encrypted Processing</h4>
                                <p className="text-sm text-slate-700">
                                    Your documents are encrypted and processed securely. No plaintext data is ever stored.
                                </p>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <CheckCircle className="w-5 h-5 text-green-600 mb-2" />
                                <h4 className="font-semibold text-slate-900 mb-1">Privacy-Preserving</h4>
                                <p className="text-sm text-slate-700">
                                    Only the cryptographic proof is generated. Your exact income remains completely private.
                                </p>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <CheckCircle className="w-5 h-5 text-green-600 mb-2" />
                                <h4 className="font-semibold text-slate-900 mb-1">Blockchain Verification</h4>
                                <p className="text-sm text-slate-700">
                                    The proof is posted on the Midnight blockchain for transparent, tamper-proof verification.
                                </p>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <CheckCircle className="w-5 h-5 text-green-600 mb-2" />
                                <h4 className="font-semibold text-slate-900 mb-1">No Data Storage</h4>
                                <p className="text-sm text-slate-700">
                                    Your ID and payslip documents are never stored on our servers or anywhere else.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* What Gets Posted On-Chain */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-blue-600" />
                            What Gets Posted On-Chain?
                        </h3>
                        <div className="space-y-2 text-sm text-slate-700">
                            <div className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                <span><strong>Cryptographic proof</strong> that you meet the income threshold</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                <span><strong>Proof ID</strong> for verification purposes</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                <span><strong>Timestamp</strong> and expiration date</span>
                            </div>
                            <div className="flex items-start gap-2 mt-3 pt-3 border-t border-blue-300">
                                <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                <span className="font-medium">Your identity, exact income, and personal documents are NEVER posted on-chain or stored anywhere.</span>
                            </div>
                        </div>
                    </div>

                    {/* Consent Agreement */}
                    <form onSubmit={handleSubmit}>
                        <div className="bg-slate-50 border-2 border-slate-300 rounded-lg p-6">
                            <h3 className="font-bold text-slate-900 mb-4">Privacy Consent & Agreement</h3>
                            <div className="space-y-3 mb-4 text-sm text-slate-700">
                                <p>By proceeding, you acknowledge and agree that:</p>
                                <ul className="space-y-2 ml-4">
                                    <li className="flex items-start gap-2">
                                        <span className="text-cyan-600 font-bold">•</span>
                                        <span>Your identity documents and payslip will be processed to generate a zero-knowledge proof</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-cyan-600 font-bold">•</span>
                                        <span>Only a cryptographic proof will be posted on the Midnight blockchain</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-cyan-600 font-bold">•</span>
                                        <span>Your personal documents and exact income will NOT be stored or shared</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-cyan-600 font-bold">•</span>
                                        <span>The proof will be valid for 30 days from generation</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-cyan-600 font-bold">•</span>
                                        <span>You have reviewed your information and confirm its accuracy</span>
                                    </li>
                                </ul>
                            </div>

                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    className="mt-1 w-5 h-5 text-cyan-600 border-slate-300 rounded focus:ring-cyan-500"
                                />
                                <span className="text-sm text-slate-900 font-medium group-hover:text-cyan-700">
                                    I understand and agree to the privacy terms. I consent to generate a zero-knowledge proof
                                    of my income that will be posted on the blockchain.
                                </span>
                            </label>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button
                                type="button"
                                onClick={onPrevious}
                                className="px-6 py-3 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-all"
                            >
                                ← Previous
                            </button>
                            <button
                                type="submit"
                                disabled={!agreedToTerms}
                                className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all shadow-lg disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed"
                            >
                                {agreedToTerms ? '🔒 Generate Secure Proof' : '⚠️ Please Accept Terms to Continue'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
