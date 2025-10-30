import { useState } from 'react';

export function useStepNavigation() {
    const [activeStep, setActiveStep] = useState<number>(1);
    const [idVerified, setIdVerified] = useState<boolean>(false);
    const [payslipUploaded, setPayslipUploaded] = useState<boolean>(false);
    const [proofGenerated, setProofGenerated] = useState<boolean>(false);

    const goToStep = (step: number) => {
        setActiveStep(step);
    };

    const nextStep = () => {
        setActiveStep(prev => Math.min(prev + 1, 3));
    };

    const previousStep = () => {
        setActiveStep(prev => Math.max(prev - 1, 1));
    };

    const completeIdVerification = () => {
        setIdVerified(true);
        nextStep();
    };

    const completePayslipUpload = () => {
        setPayslipUploaded(true);
        nextStep();
    };

    const completeProofGeneration = () => {
        setProofGenerated(true);
    };

    return {
        activeStep,
        idVerified,
        payslipUploaded,
        proofGenerated,
        goToStep,
        nextStep,
        previousStep,
        completeIdVerification,
        completePayslipUpload,
        completeProofGeneration
    };
}
