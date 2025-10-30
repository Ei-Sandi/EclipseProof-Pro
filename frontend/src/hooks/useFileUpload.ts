import { useState } from 'react';

interface FileUploadOptions {
    maxSizeMB?: number;
    acceptedTypes?: string[];
}

interface FileValidationError {
    type: 'size' | 'type' | 'general';
    message: string;
}

export function useFileUpload(options: FileUploadOptions = {}) {
    const { maxSizeMB = 10, acceptedTypes = ['image/*', '.pdf'] } = options;
    const [error, setError] = useState<FileValidationError | null>(null);

    const validateFile = (file: File): boolean => {
        setError(null);

        // Check file size
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            setError({
                type: 'size',
                message: `File size must be less than ${maxSizeMB}MB`
            });
            return false;
        }

        // Check file type
        const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        const fileType = file.type;

        const isValidType = acceptedTypes.some(type => {
            if (type.endsWith('/*')) {
                const category = type.split('/')[0];
                return fileType.startsWith(category);
            }
            return type === fileExtension || type === fileType;
        });

        if (!isValidType) {
            setError({
                type: 'type',
                message: `File type not supported. Please upload: ${acceptedTypes.join(', ')}`
            });
            return false;
        }

        return true;
    };

    const clearError = () => {
        setError(null);
    };

    return {
        validateFile,
        error,
        clearError
    };
}
