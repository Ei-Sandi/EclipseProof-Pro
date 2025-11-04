import { CheckCircle } from 'lucide-react';

interface StepIndicatorProps {
    currentStep: number;
    steps: {
        label: string;
        isCompleted: boolean;
    }[];
}

export default function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
    return (
        <div className="mb-12">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isActive = currentStep === stepNumber;
                    const isCompleted = step.isCompleted;

                    return (
                        <div key={stepNumber} className="flex items-center flex-1">
                            {/* Step Circle */}
                            <div className="flex flex-col items-center flex-1">
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                                        isCompleted
                                            ? 'bg-green-500'
                                            : isActive
                                            ? 'bg-cyan-500'
                                            : 'bg-slate-200'
                                    }`}
                                >
                                    {isCompleted ? (
                                        <CheckCircle className="w-6 h-6 text-white" />
                                    ) : (
                                        <span className="text-white font-semibold">{stepNumber}</span>
                                    )}
                                </div>
                                <span
                                    className={`text-sm font-medium ${
                                        isCompleted || isActive ? 'text-slate-900' : 'text-slate-400'
                                    }`}
                                >
                                    {step.label}
                                </span>
                            </div>

                            {/* Connector (except for last step) */}
                            {index < steps.length - 1 && (
                                <div
                                    className={`h-1 flex-1 mx-4 ${
                                        isCompleted ? 'bg-green-500' : 'bg-slate-200'
                                    }`}
                                ></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
