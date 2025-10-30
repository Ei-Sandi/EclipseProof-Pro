import type { ChangeEvent } from 'react';
import { User, Upload } from 'lucide-react';
import type { FormData } from '../../../types/proof.types';

interface IdVerificationStepProps {
    formData: FormData;
    onInputChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onFileUpload: (e: ChangeEvent<HTMLInputElement>, fileType: 'idFile' | 'payslipFile') => void;
    onNext: () => void;
}

export default function IdVerificationStep({
    formData,
    onInputChange,
    onFileUpload,
    onNext
}: IdVerificationStepProps) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Identity Verification</h2>
                    <p className="text-slate-600">Please provide your identification details</p>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                        ID Type
                    </label>
                    <select
                        name="idType"
                        value={formData.idType}
                        onChange={onInputChange}
                        className="w-full px-4 py-3 bg-cyan-50 border border-cyan-200 rounded-lg text-slate-900 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    >
                        <option value="">Select ID type</option>
                        <option value="passport">Passport</option>
                        <option value="drivers_license">Driver's License</option>
                        <option value="national_id">National ID Card</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                        ID Number
                    </label>
                    <input
                        type="text"
                        name="idNumber"
                        value={formData.idNumber}
                        onChange={onInputChange}
                        placeholder="Enter your ID number"
                        className="w-full px-4 py-3 bg-cyan-50 border border-cyan-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                        Upload ID Document
                    </label>
                    <div className="border-2 border-dashed border-cyan-300 rounded-lg p-8 text-center hover:border-cyan-500 transition-all bg-cyan-50">
                        <Upload className="w-12 h-12 text-cyan-500 mx-auto mb-4" />
                        <p className="text-slate-700 mb-2">
                            {formData.idFile ? formData.idFile.name : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-sm text-slate-500">PNG, JPG or PDF (max. 10MB)</p>
                        <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => onFileUpload(e, 'idFile')}
                            className="hidden"
                            id="id-upload"
                        />
                        <label
                            htmlFor="id-upload"
                            className="inline-block mt-4 px-6 py-2 bg-cyan-500 text-white rounded-lg cursor-pointer hover:bg-cyan-600 transition-all"
                        >
                            Choose File
                        </label>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={onNext}
                        className="flex-1 py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all shadow-lg"
                    >
                        Next: Upload Payslip →
                    </button>
                </div>
            </div>
        </div>
    );
}
