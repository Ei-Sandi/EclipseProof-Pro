import type { ChangeEvent } from 'react';
import { FileText, AlertCircle } from 'lucide-react';
import type { FormData } from '../../../types/proof.types';

interface PayslipUploadStepProps {
    formData: FormData;
    onInputChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onFileUpload: (e: ChangeEvent<HTMLInputElement>, fileType: 'idFile' | 'payslipFile') => void;
    onPrevious: () => void;
    onNext: () => void;
}

export default function PayslipUploadStep({
    formData,
    onInputChange,
    onFileUpload,
    onPrevious,
    onNext
}: PayslipUploadStepProps) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Upload Your Payslip</h2>
                    <p className="text-slate-600">We'll extract your income information securely</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-slate-700">
                        <p className="font-medium mb-1">Your data is encrypted and secure</p>
                        <p>Your payslip is processed using zero-knowledge proofs. We never store your exact income - only the proof that you meet the threshold.</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                        Upload Payslip
                    </label>
                    <div className="border-2 border-dashed border-cyan-300 rounded-lg p-8 text-center hover:border-cyan-500 transition-all bg-cyan-50">
                        <FileText className="w-12 h-12 text-cyan-500 mx-auto mb-4" />
                        <p className="text-slate-700 mb-2">
                            {formData.payslipFile ? formData.payslipFile.name : 'Click to upload your payslip'}
                        </p>
                        <p className="text-sm text-slate-500">PDF, PNG or JPG (max. 10MB)</p>
                        <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => onFileUpload(e, 'payslipFile')}
                            className="hidden"
                            id="payslip-upload"
                        />
                        <label
                            htmlFor="payslip-upload"
                            className="inline-block mt-4 px-6 py-2 bg-cyan-500 text-white rounded-lg cursor-pointer hover:bg-cyan-600 transition-all"
                        >
                            Choose File
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                        Your Monthly Income (for verification)
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-700 font-medium">£</span>
                        <input
                            type="number"
                            name="actualIncome"
                            value={formData.actualIncome}
                            onChange={onInputChange}
                            placeholder="0"
                            className="w-full pl-8 pr-4 py-3 bg-cyan-50 border border-cyan-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                        />
                    </div>
                    <p className="text-sm text-slate-500 mt-2">This information is used to verify your payslip and will not be shared</p>
                </div>

                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={onPrevious}
                        className="px-6 py-3 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-all"
                    >
                        ← Previous
                    </button>
                    <button
                        type="button"
                        onClick={onNext}
                        className="flex-1 py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all shadow-lg"
                    >
                        Next: Generate Proof →
                    </button>
                </div>
            </div>
        </div>
    );
}
