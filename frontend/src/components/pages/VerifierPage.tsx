import React, { useState, useRef } from 'react';
import { Upload, CheckCircle, XCircle, Loader2, FileText, User, Calendar } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';

export default function VerifierPage() {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<'success' | 'failure' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [verificationData, setVerificationData] = useState<{
    provenLimit?: string;
    name?: string;
    dob?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setVerificationResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setVerificationResult(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name || !dob) return;

    setIsVerifying(true);
    setVerificationResult(null);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('qrCode', file);
      formData.append('name', name);
      formData.append('dob', dob);

      const response = await fetch(API_ENDPOINTS.PROOF.VERIFY_QR, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setVerificationResult('success');
        setVerificationData(data.result || null);
      } else {
        setVerificationResult('failure');
        setErrorMessage(data.message || 'Verification failed. Please check the details and try again.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationResult('failure');
      setErrorMessage('An error occurred while connecting to the server. Please try again later.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="pt-24 pb-16 px-6 min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Verify Proof</h1>
          <p className="text-slate-600">
            Upload the QR code and enter the applicant's details to verify their income proof.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <form onSubmit={handleVerify} className="space-y-8">
            {/* File Upload Section */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Upload QR Code
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${file
                    ? 'border-cyan-500 bg-cyan-50'
                    : 'border-slate-300 hover:border-cyan-400 hover:bg-slate-50'
                  }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  aria-label="Upload QR Code"
                  title="Upload QR Code"
                />
                {file ? (
                  <div className="flex flex-col items-center text-cyan-700">
                    <FileText className="w-12 h-12 mb-2" />
                    <span className="font-medium">{file.name}</span>
                    <span className="text-sm opacity-75">Click to change</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-slate-500">
                    <Upload className="w-12 h-12 mb-2" />
                    <span className="font-medium">Click to upload or drag and drop</span>
                    <span className="text-sm">SVG, PNG, JPG or GIF (max. 800x400px)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Input Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter applicant's name"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                    required
                    aria-label="Date of Birth"
                    title="Date of Birth"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isVerifying || !file || !name || !dob}
              className={`w-full py-4 rounded-lg text-white font-semibold text-lg flex items-center justify-center gap-2 transition-all ${isVerifying || !file || !name || !dob
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20'
                }`}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Verify Proof
                </>
              )}
            </button>
          </form>

          {/* Results Section */}
          {verificationResult && (
            <div className={`mt-8 p-6 rounded-xl border ${verificationResult === 'success'
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
              }`}>
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-full ${verificationResult === 'success' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                  {verificationResult === 'success' ? (
                    <CheckCircle className={`w-6 h-6 ${verificationResult === 'success' ? 'text-green-600' : 'text-red-600'
                      }`} />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div>
                  <h3 className={`text-lg font-bold mb-1 ${verificationResult === 'success' ? 'text-green-900' : 'text-red-900'
                    }`}>
                    {verificationResult === 'success' ? 'Verification Successful' : 'Verification Failed'}
                  </h3>
                  <p className={
                    verificationResult === 'success' ? 'text-green-700' : 'text-red-700'
                  }>
                    {verificationResult === 'success'
                      ? 'The provided proof is valid and matches the applicant details. The income requirements are met.'
                      : errorMessage || 'The proof could not be verified. Please check the details and try again.'}
                  </p>

                  {verificationResult === 'success' && verificationData && (
                    <div className="mt-4 pt-4 border-t border-green-200 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="block text-green-800 font-medium">Applicant</span>
                        <span className="text-green-700">{verificationData.name || name}</span>
                      </div>
                      <div>
                        <span className="block text-green-800 font-medium">Date of Birth</span>
                        <span className="text-green-700">{verificationData.dob || dob}</span>
                      </div>
                      {verificationData.provenLimit && (
                        <div className="col-span-2">
                          <span className="block text-green-800 font-medium">Proven Income Limit</span>
                          <span className="text-green-700 text-lg font-semibold">£{verificationData.provenLimit}/month</span>
                        </div>
                      )}
                      <div className="col-span-2">
                        <span className="block text-green-800 font-medium">Verified Date</span>
                        <span className="text-green-700">{new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
