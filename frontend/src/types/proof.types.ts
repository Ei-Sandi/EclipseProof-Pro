export interface IdFormData {
    documentType: 'passport' | 'drivers_license' | 'national_id' | '';
    idFile: File | null;
}

export interface PayslipFormData {
    payslipFile: File | null;
    proofAmount: string;
}

// Combined Form Data (for managing all form state)
export interface FormData {
    documentType: 'passport' | 'drivers_license' | 'national_id' | '';
    idFile: File | null;
    payslipFile: File | null;
    proofAmount: string;
}

export interface Proof {
    id: string;
    requiredAmount: string;
    verified: boolean;
    generatedAt: string;
    expiresAt: string;
    verificationHash?: string;
    proofGeneratedDate?: string;
    qrCode?: string;
}

export interface StepStatus {
    idVerified: boolean;
    payslipUploaded: boolean;
    proofGenerated: boolean;
}
