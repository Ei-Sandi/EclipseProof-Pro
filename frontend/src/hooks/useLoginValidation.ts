import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

interface LoginFormData {
    email: string;
    password: string;
}

interface LoginFormErrors {
    email?: string;
    password?: string;
}

export function useLoginValidation() {
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState<LoginFormErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    const validateEmail = (email: string): string | undefined => {
        if (!email) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return 'Please enter a valid email address';
        return undefined;
    };

    const validatePassword = (password: string): string | undefined => {
        if (!password) return 'Password is required';
        return undefined;
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });

        // Real-time validation
        let error: string | undefined;
        if (name === 'email') {
            error = validateEmail(value);
        } else if (name === 'password') {
            error = validatePassword(value);
        }

        setErrors({
            ...errors,
            [name]: error
        });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validate all fields
        const newErrors: LoginFormErrors = {
            email: validateEmail(formData.email),
            password: validatePassword(formData.password)
        };

        setErrors(newErrors);

        const hasErrors = Object.values(newErrors).some(error => error !== undefined);

        if (hasErrors) {
            console.log('Login form has errors:', newErrors);
            return false;
        }

        // Call backend API
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Backend validation error
                setErrors({ email: data.message || 'Login failed. Please check your credentials.' });
                return false;
            }

            // Success!
            console.log('Login successful:', data);
            return true;
        } catch (error) {
            console.error('Login error:', error);
            setErrors({ email: 'Network error. Please try again.' });
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        formData,
        errors,
        isLoading,
        handleInputChange,
        handleSubmit
    };
}
