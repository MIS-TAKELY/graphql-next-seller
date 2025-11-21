// components/Stepper.tsx
interface StepperProps {
  currentStep: number;
  totalSteps: number;
}

export default function Stepper({ currentStep }: StepperProps) {
  const steps = [
    "Welcome",
    "Shop Info",
    "Business",
    "Address",
    // "Documents",
    // "Bank",
    "Review",
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="flex items-center justify-between relative">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber <= currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div key={index} className="flex items-center flex-1">
              <div className="relative flex flex-col items-center">
                {/* Circle */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 z-10 shadow-md ${
                    isActive
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-blue-200"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>

                {/* Label */}
                <span
                  className={`absolute top-14 text-xs mt-2 whitespace-nowrap font-medium transition-colors ${
                    isActive ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  {label}
                </span>
              </div>

              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-3">
                  <div
                    className={`h-1 rounded-full transition-all duration-500 ${
                      isCompleted 
                        ? "bg-gradient-to-r from-blue-600 to-blue-500" 
                        : "bg-gray-200"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}