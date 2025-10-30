import { Shield, CheckCircle, Download, X } from 'lucide-react';
import type { Proof } from '../../../types/proof.types';

interface ProofModalProps {
    proof: Proof;
    proofAmount: string;
    isOpen: boolean;
    onClose: () => void;
    onDownload: () => void;
}

export default function ProofModal({
    proof,
    proofAmount,
    isOpen,
    onClose,
    onDownload
}: ProofModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900">Income Verification Proof</h3>
                                <p className="text-slate-600">Zero-Knowledge Proof Certificate</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Proof Details Grid */}
                        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-slate-600 mb-1">Proof ID</p>
                                    <p className="font-mono font-semibold text-slate-900">{proof.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600 mb-1">Status</p>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        <span className="font-semibold text-green-600">Verified</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600 mb-1">Generated</p>
                                    <p className="font-medium text-slate-900">
                                        {new Date(proof.generatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600 mb-1">Valid Until</p>
                                    <p className="font-medium text-slate-900">
                                        {new Date(proof.expiresAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Verified Statement */}
                        <div className="bg-white border border-slate-200 rounded-lg p-6">
                            <h4 className="font-semibold text-slate-900 mb-4">Verified Statement</h4>
                            <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-cyan-500">
                                <p className="text-slate-700 text-lg">
                                    This proof cryptographically verifies that the holder earns a monthly income of{' '}
                                    <span className="font-bold text-slate-900">at least £{proofAmount}</span>.
                                </p>
                            </div>
                            <div className="mt-4 space-y-2 text-sm text-slate-600">
                                <p>✓ Verified using zero-knowledge proofs on Midnight blockchain</p>
                                <p>✓ No exact income information disclosed</p>
                                <p>✓ Cryptographically secure and tamper-proof</p>
                            </div>
                        </div>

                        {/* Verification URL */}
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                            <p className="text-sm text-slate-600 mb-2">Verification URL:</p>
                            <p className="font-mono text-xs text-cyan-600 break-all">
                                https://eclipseproof.com/verify/{proof.id}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button
                                onClick={onDownload}
                                className="flex-1 py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                            >
                                <Download className="w-5 h-5" />
                                Download Proof
                            </button>
                            <button
                                onClick={onClose}
                                className="px-6 py-3 bg-cyan-100 text-cyan-700 font-semibold rounded-lg hover:bg-cyan-200 transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
