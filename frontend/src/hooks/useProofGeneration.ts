import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { FormData, Proof } from '../types/proof.types';
import { API_ENDPOINTS } from '../config/api';

export function useProofGeneration() {
    const [formData, setFormData] = useState<FormData>({
        documentType: '',
        idFile: null,
        payslipFile: null,
        proofAmount: ''
    });

    const [generatedProof, setGeneratedProof] = useState<Proof | null>(null);
    const [showProofModal, setShowProofModal] = useState<boolean>(false);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target as HTMLInputElement & HTMLSelectElement;
        setFormData((prev: FormData) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileUpload = (e: ChangeEvent<HTMLInputElement>, fileType: 'idFile' | 'payslipFile') => {
        const file = e.target.files?.[0] ?? null;
        if (file) {
            setFormData((prev: FormData) => ({ ...prev, [fileType]: file }));
        }
    };

    const handleGenerateProof = async (e: FormEvent, onSuccess?: () => void) => {
        e.preventDefault();

        try {
            if (!formData.documentType || !formData.idFile) {
                throw new Error('Please complete ID verification (document type and ID file required)');
            }

            if (!formData.payslipFile || !formData.proofAmount) {
                throw new Error('Please upload payslip and enter minimum income amount');
            }

            console.log('🆔 Verifying ID document...');
            const idFormData = new FormData();
            idFormData.append('idDocument', formData.idFile);
            idFormData.append('documentType', formData.documentType);

            const idVerifyResponse = await fetch(API_ENDPOINTS.PROOF.VERIFY, {
                method: 'POST',
                body: idFormData,
                credentials: 'include'
            });

            if (!idVerifyResponse.ok) {
                const errorData = await idVerifyResponse.json();
                throw new Error(errorData.message || errorData.error || 'ID verification failed');
            }

            const idVerifyResult = await idVerifyResponse.json();
            console.log('✅ ID verification result:', idVerifyResult);

            if (!idVerifyResult.success) {
                throw new Error('ID verification failed: ' + (idVerifyResult.message || 'Unknown error'));
            }

            console.log('📄 Generating proof from payslip...');
            const proofFormData = new FormData();
            proofFormData.append('payslip', formData.payslipFile);
            proofFormData.append('amountToProve', formData.proofAmount);

            const proofResponse = await fetch(API_ENDPOINTS.PROOF.GENERATE, {
                method: 'POST',
                body: proofFormData,
                credentials: 'include'
            });

            if (!proofResponse.ok) {
                const errorData = await proofResponse.json();
                throw new Error(errorData.message || 'Proof generation failed');
            }

            const proofResult = await proofResponse.json();
            console.log('✅ Proof generation result:', proofResult);

            if (!proofResult.success) {
                throw new Error('Proof generation failed: ' + (proofResult.message || 'Unknown error'));
            }

            if (!proofResult.verified) {
                throw new Error(
                    proofResult.validation?.reason ||
                    'Verification failed: Income requirements not met'
                );
            }

            const proof: Proof = {
                id: 'PROOF-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                requiredAmount: formData.proofAmount,
                verified: proofResult.verified,
                generatedAt: proofResult.timestamp || new Date().toISOString(),
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            };

            setGeneratedProof(proof);
            setShowProofModal(true);

            if (onSuccess) {
                onSuccess();
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            console.error('❌ Proof generation error:', errorMessage);
            alert('Error: ' + errorMessage);
        }
    };

    const downloadProof = () => {
        if (!generatedProof) return;

        const proofText = `
EclipseProof Income Verification
================================

Proof ID: ${generatedProof.id}
Generated: ${new Date(generatedProof.generatedAt).toLocaleString()}
Valid Until: ${new Date(generatedProof.expiresAt).toLocaleString()}

VERIFIED: The holder of this proof earns at least £${formData.proofAmount} per month.

This verification was generated using zero-knowledge proofs on the Midnight blockchain.
No exact income information was disclosed in the generation of this proof.

To verify this proof, visit: https://eclipseproof.com/verify/${generatedProof.id}
    `;

        const blob = new Blob([proofText], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `EclipseProof-${generatedProof.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return {
        formData,
        generatedProof,
        showProofModal,
        setShowProofModal,
        handleInputChange,
        handleFileUpload,
        handleGenerateProof,
        downloadProof
    };
}
