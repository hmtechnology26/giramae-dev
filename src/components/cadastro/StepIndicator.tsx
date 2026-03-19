
import React from 'react';
import { Check, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Step {
  key: string;
  title: string;
  subtitle?: string;
  state: 'pending' | 'active' | 'done';
}

interface StepIndicatorProps {
  steps: Step[];
  onEditStep: (index: number) => void;
  isAllStepsCompleted: boolean;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ 
  steps, 
  onEditStep, 
  isAllStepsCompleted 
}) => {
  const getStepIcon = (step: Step, index: number) => {
    if (step.state === 'done') {
      return (
        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-primary to-pink-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg">
          <Check className="w-5 h-5" />
        </div>
      );
    }

    if (step.state === 'active') {
      const iconMap = {
        google: (
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-primary/10 to-pink-500/10 border-2 border-primary flex items-center justify-center flex-shrink-0 animate-pulse">
            <img 
              src="https://www.svgrepo.com/show/475656/google-color.svg" 
              alt="Google" 
              className="w-6 h-6"
            />
          </div>
        ),
        phone: (
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-primary/10 to-pink-500/10 border-2 border-primary flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
        ),
        code: (
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-primary/10 to-pink-500/10 border-2 border-primary flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path d="M6 10h.01M18 10h.01M12 13h.01" />
            </svg>
          </div>
        ),
        personal: (
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-primary/10 to-pink-500/10 border-2 border-primary flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        ),
        address: (
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-primary/10 to-pink-500/10 border-2 border-primary flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        )
      };
      return iconMap[step.key as keyof typeof iconMap] || iconMap.personal;
    }

    // Pending state
    return (
      <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
      </div>
    );
  };

  return (
    <>
      {steps.map((step, index) => (
        <div key={step.key} className="bg-white border-b border-gray-100 last:border-b-0">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              {getStepIcon(step, index)}
              <div>
                <p className={`text-sm font-semibold ${
                  step.state === 'active' ? 'text-primary' : 
                  step.state === 'done' ? 'text-green-700' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
                {step.subtitle && (
                  <p className="text-xs text-gray-500">{step.subtitle}</p>
                )}
              </div>
            </div>

            {/* Edit button for completed steps */}
            {step.state === 'done' && !isAllStepsCompleted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditStep(index)}
                className="p-2 hover:bg-primary/10 text-primary"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </>
  );
};

export default StepIndicator;
