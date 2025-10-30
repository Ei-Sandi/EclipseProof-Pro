export interface FormData {
    idType: string;
    idNumber: string;
    idFile: File | null;
    payslipFile: File | null;
    proofAmount: string;
    actualIncome: string;
}

export interface Proof {
    id: string;
    requiredAmount: string;
    verified: boolean;
    generatedAt: string;
    expiresAt: string;
}

export interface StepStatus {
    idVerified: boolean;
    payslipUploaded: boolean;
    proofGenerated: boolean;
}
