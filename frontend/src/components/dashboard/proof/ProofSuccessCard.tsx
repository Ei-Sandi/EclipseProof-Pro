import { CheckCircle, Eye, Download, QrCode } from 'lucide-react';

interface ProofSuccessCardProps {
    onViewProof: () => void;
    onDownloadProof: () => void;
}

export default function ProofSuccessCard({
    onViewProof,
    onDownloadProof
}: ProofSuccessCardProps) {
    return (
        <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-8">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-slate-900">Proof Generated Successfully!</h3>
                    <p className="text-slate-700">Your income proof with QR code is ready to download and share</p>
                </div>
            </div>
            <div className="mb-4 flex items-center gap-2 text-slate-600">
                <QrCode className="w-5 h-5 text-cyan-500" />
                <span className="text-sm">Includes scannable QR code for easy verification</span>
            </div>
            <div className="flex gap-4">
                <button
                    onClick={onViewProof}
                    className="px-6 py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all flex items-center gap-2"
                >
                    <Eye className="w-5 h-5" />
                    View Proof
                </button>
                <button
                    onClick={onDownloadProof}
                    className="px-6 py-3 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-600 transition-all flex items-center gap-2"
                >
                    <Download className="w-5 h-5" />
                    Download Proof
                </button>
            </div>
        </div>
    );
}
