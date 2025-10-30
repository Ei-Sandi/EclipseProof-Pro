import type { ChangeEvent, FormEvent } from 'react';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';
import type { FormData } from '../../../types/proof.types';

interface ProofGenerationStepProps {
    formData: FormData;
    onInputChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onSubmit: (e: FormEvent) => void;
    onPrevious: () => void;
    onEditStep: (step: number) => void;
}

export default function ProofGenerationStep({
    formData,
    onInputChange,
    onSubmit,
    onPrevious,
    onEditStep
}: ProofGenerationStepProps) {
    const isFormValid = formData.idType &&
                       formData.idNumber &&
                       formData.idFile &&
                       formData.payslipFile &&
                       formData.actualIncome;

    return (
        <div className="space-y-6">
            {/* Review Section */}
            <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-cyan-600" />
                    Review Your Information
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                    {/* ID Information */}
                    <div className="bg-white rounded-lg p-4 border border-cyan-200">
                        <p className="text-sm font-medium text-slate-600 mb-3">Identity Verification</p>
                        <div className="space-y-2">
                            <div>
                                <span className="text-xs text-slate-500">ID Type:</span>
                                <p className="font-medium text-slate-900 capitalize">
                                    {formData.idType.replace('_', ' ')}
                                </p>
                            </div>
                            <div>
                                <span className="text-xs text-slate-500">ID Number:</span>
                                <p className="font-medium text-slate-900">{formData.idNumber}</p>
                            </div>
                            <div>
                                <span className="text-xs text-slate-500">Document:</span>
                                <p className="font-medium text-slate-900 text-sm">{formData.idFile?.name}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => onEditStep(1)}
                            className="mt-3 text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                        >
                            Edit →
                        </button>
                    </div>

                    {/* Payslip Information */}
                    <div className="bg-white rounded-lg p-4 border border-cyan-200">
                        <p className="text-sm font-medium text-slate-600 mb-3">Income Verification</p>
                        <div className="space-y-2">
                            <div>
                                <span className="text-xs text-slate-500">Monthly Income:</span>
                                <p className="font-medium text-slate-900 text-lg">£{formData.actualIncome}</p>
                            </div>
                            <div>
                                <span className="text-xs text-slate-500">Payslip Document:</span>
                                <p className="font-medium text-slate-900 text-sm">{formData.payslipFile?.name}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => onEditStep(2)}
                            className="mt-3 text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                        >
                            Edit →
                        </button>
                    </div>
                </div>
            </div>

            {/* Generate Proof Form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                        <Shield className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Generate Income Proof</h2>
                        <p className="text-slate-600">Specify the minimum income you need to prove</p>
                    </div>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-slate-700">
                            <p className="font-medium mb-1">Identity and income verified</p>
                            <p>Your monthly income of £{formData.actualIncome} has been securely verified</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-900 mb-2">
                            Minimum Income to Prove
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-700 font-medium">£</span>
                            <input
                                type="number"
                                name="proofAmount"
                                value={formData.proofAmount}
                                onChange={onInputChange}
                                placeholder="0"
                                max={formData.actualIncome}
                                className="w-full pl-8 pr-4 py-3 bg-cyan-50 border border-cyan-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                                required
                            />
                        </div>
                        <p className="text-sm text-slate-500 mt-2">
                            Enter the minimum monthly income you need to prove (max: £{formData.actualIncome})
                        </p>
                    </div>

                    <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                        <h3 className="font-medium text-slate-900 mb-2">How it works:</h3>
                        <ul className="space-y-2 text-sm text-slate-700">
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
                                <span>Your proof will confirm you earn at least the specified amount</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
                                <span>Your exact income remains private and encrypted</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
                                <span>The proof is cryptographically verifiable on the blockchain</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
                                <span>Valid for 30 days from generation</span>
                            </li>
                        </ul>
                    </div>

                    {!isFormValid && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-slate-700">
                                <p className="font-medium mb-1">Please complete all steps</p>
                                <p>Make sure you've filled in all required information in Step 1 and Step 2 before generating your proof.</p>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onPrevious}
                            className="px-6 py-3 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-all"
                        >
                            ← Previous
                        </button>
                        <button
                            type="submit"
                            disabled={!isFormValid || !formData.proofAmount}
                            className="flex-1 py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all shadow-lg disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            Generate Proof
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
