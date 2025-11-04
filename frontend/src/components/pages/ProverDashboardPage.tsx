import type React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProofGeneration } from '../../hooks/useProofGeneration';
import { useStepNavigation } from '../../hooks/useStepNavigation';
import DashboardHeader from '../dashboard/layout/DashboardHeader';
import StepIndicator from '../dashboard/layout/StepIndicator';
import IdVerificationStep from '../dashboard/steps/IdVerificationStep';
import PayslipUploadStep from '../dashboard/steps/PayslipUploadStep';
import ProofGenerationStep from '../dashboard/steps/ProofGenerationStep';
import ProofModal from '../dashboard/proof/ProofModal';
import ProofSuccessCard from '../dashboard/proof/ProofSuccessCard';

export default function EclipseProofDashboard(): React.JSX.Element {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const {
        formData,
        generatedProof,
        showProofModal,
        setShowProofModal,
        handleInputChange,
        handleFileUpload,
        handleGenerateProof,
        downloadProof
    } = useProofGeneration();

    const {
        activeStep,
        idVerified,
        payslipUploaded,
        proofGenerated,
        previousStep,
        completeIdVerification,
        completePayslipUpload,
        completeProofGeneration
    } = useStepNavigation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <DashboardHeader userEmail={user?.email} onLogout={handleLogout} />

            {/* Main Content */}
            <div className="pt-24 pb-16 px-6">
                <div className="max-w-5xl mx-auto">
                    {/* Welcome Section */}
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl font-bold text-slate-900 mb-4">Generate Your Income Proof</h1>
                        <p className="text-lg text-slate-700">
                            Verify your identity, upload your payslip, and generate a privacy-preserving income proof
                        </p>
                    </div>

                    {/* Progress Steps */}
                    <StepIndicator
                        currentStep={activeStep}
                        steps={[
                            { label: 'Verify ID', isCompleted: idVerified },
                            { label: 'Upload Payslip', isCompleted: payslipUploaded },
                            { label: 'Generate Proof', isCompleted: proofGenerated }
                        ]}
                    />

                    {/* Step 1: ID Verification */}
                    {activeStep === 1 && (
                        <IdVerificationStep
                            formData={formData}
                            onInputChange={handleInputChange}
                            onFileUpload={handleFileUpload}
                            onNext={completeIdVerification}
                        />
                    )}

                    {/* Step 2: Payslip Upload */}
                    {activeStep === 2 && (
                        <PayslipUploadStep
                            formData={formData}
                            onInputChange={handleInputChange}
                            onFileUpload={handleFileUpload}
                            onPrevious={previousStep}
                            onNext={completePayslipUpload}
                        />
                    )}

                    {/* Step 3: Generate Proof */}
                    {activeStep === 3 && (
                        <ProofGenerationStep
                            onSubmit={(e) => handleGenerateProof(e, completeProofGeneration)}
                            onPrevious={previousStep}
                        />
                    )}

                    {/* Success Message */}
                    {proofGenerated && !showProofModal && (
                        <ProofSuccessCard
                            onViewProof={() => setShowProofModal(true)}
                            onDownloadProof={downloadProof}
                        />
                    )}
                </div>
            </div>

            {/* Proof Modal */}
            {generatedProof && (
                <ProofModal
                    proof={generatedProof}
                    proofAmount={formData.proofAmount}
                    isOpen={showProofModal}
                    onClose={() => setShowProofModal(false)}
                    onDownload={downloadProof}
                />
            )}
        </div>
    );
}