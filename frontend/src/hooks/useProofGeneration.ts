import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { FormData, Proof } from '../types/proof.types';

export function useProofGeneration() {
    const [formData, setFormData] = useState<FormData>({
        idType: '',
        idNumber: '',
        idFile: null,
        payslipFile: null,
        proofAmount: '',
        actualIncome: ''
    });

    const [generatedProof, setGeneratedProof] = useState<Proof | null>(null);
    const [showProofModal, setShowProofModal] = useState<boolean>(false);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target as HTMLInputElement & HTMLSelectElement;
        setFormData(prev => ({
            ...prev,
            [name]: value
        } as unknown as FormData));
    };

    const handleFileUpload = (e: ChangeEvent<HTMLInputElement>, fileType: 'idFile' | 'payslipFile') => {
        const file = e.target.files?.[0] ?? null;
        if (file) {
            setFormData(prev => ({ ...prev, [fileType]: file } as unknown as FormData));
        }
    };

    const handleGenerateProof = (e: FormEvent, onSuccess?: () => void) => {
        e.preventDefault();

        // Simulate proof generation
        setTimeout(() => {
            const proof: Proof = {
                id: 'PROOF-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                requiredAmount: formData.proofAmount,
                verified: true,
                generatedAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            };
            setGeneratedProof(proof);
            setShowProofModal(true);

            if (onSuccess) {
                onSuccess();
            }
        }, 2000);
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
