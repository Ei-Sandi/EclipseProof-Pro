export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/api/auth/login`,
        SIGNUP: `${API_BASE_URL}/api/auth/signup`,
        LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    },
    PROOF: {
        VERIFY: `${API_BASE_URL}/api/proof/verify`,
        VERIFY_QR: `${API_BASE_URL}/api/proof/verify-qr`,
        GENERATE: `${API_BASE_URL}/api/proof/generate`,
    }
} as const;
