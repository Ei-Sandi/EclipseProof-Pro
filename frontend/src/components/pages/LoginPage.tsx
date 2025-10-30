import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useLoginValidation } from '../../hooks/useLoginValidation.ts';

export default function LoginPage() {
    const navigate = useNavigate();
    const { formData, errors, isLoading, handleInputChange, handleSubmit } = useLoginValidation();
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="pt-24 pb-16 px-6 flex items-center justify-center min-h-screen">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
                    <p className="text-slate-700">Log in to access your EclipseProof account</p>
                </div>

                <div className="bg-white backdrop-blur-sm border border-cyan-300 rounded-2xl p-8 shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="you@example.com"
                                    className={`w-full pl-12 pr-4 py-3 bg-cyan-50 border rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${errors.email
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                        : 'border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500/20'
                                        }`}
                                    required
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-slate-900">
                                    Password
                                </label>
                                <button
                                    type="button"
                                    className="text-sm text-cyan-600 hover:text-cyan-700 transition-colors"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Enter your password"
                                    className={`w-full pl-12 pr-12 py-3 bg-cyan-50 border rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${errors.password
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                        : 'border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500/20'
                                        }`}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-900 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Logging in...' : 'Log In'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-slate-700">
                            Don't have an account?{' '}
                            <button
                                onClick={() => navigate('/register')}
                                className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
                            >
                                Sign Up
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}