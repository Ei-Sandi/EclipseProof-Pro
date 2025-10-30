import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ChangeEvent, FormEvent } from 'react';

interface RegisterFormData {
    email: string;
    password: string;
    confirmPassword: string;
}

interface RegisterFormErrors {
    email?: string;
    password?: string;
    confirmPassword?: string;
}

export function useRegisterValidation() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<RegisterFormData>({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState<RegisterFormErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    const validateEmail = (email: string): string | undefined => {
        if (!email) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return 'Please enter a valid email address';
        return undefined;
    };

    const validatePassword = (password: string): string | undefined => {
        if (!password) return 'Password is required';
        if (password.length < 8) return 'Password must be at least 8 characters';
        if (!/(?=.*[a-z])/.test(password)) return 'Password must contain a lowercase letter';
        if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain an uppercase letter';
        if (!/(?=.*\d)/.test(password)) return 'Password must contain a number';
        if (!/(?=.*[@$!%*?&])/.test(password)) return 'Password must contain a special character (@$!%*?&)';
        return undefined;
    };

    const validateConfirmPassword = (confirmPassword: string, password: string): string | undefined => {
        if (!confirmPassword) return 'Please confirm your password';
        if (confirmPassword !== password) return 'Passwords do not match';
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
            // Re-validate confirmPassword when password changes
            if (formData.confirmPassword) {
                setErrors(prev => ({
                    ...prev,
                    confirmPassword: validateConfirmPassword(formData.confirmPassword, value)
                }));
            }
        } else if (name === 'confirmPassword') {
            error = validateConfirmPassword(value, formData.password);
        }

        setErrors({
            ...errors,
            [name]: error
        });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validate all fields
        const newErrors: RegisterFormErrors = {
            email: validateEmail(formData.email),
            password: validatePassword(formData.password),
            confirmPassword: validateConfirmPassword(formData.confirmPassword, formData.password)
        };

        setErrors(newErrors);

        const hasErrors = Object.values(newErrors).some(error => error !== undefined);

        if (hasErrors) {
            console.log('Registration form has errors:', newErrors);
            return false;
        }

        // Call backend API
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    confirmPassword: formData.confirmPassword
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrors({ email: data.message || 'Registration failed. Please try again.' });
                return false;
            }

            console.log('Registration successful:', data);
            navigate('/login', { 
                state: { message: 'Registration successful! Please log in.' } 
            });

            return true;
        } catch (error) {
            console.error('Registration error:', error);
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
