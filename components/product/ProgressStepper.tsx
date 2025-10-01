import { Step } from "@/types/pages/product";

export const ProgressStepper = ({
  steps,
  currentStep,
}: {
  steps: Step[];
  currentStep: number;
}) => (
  <div className="flex justify-center">
    <div className="flex items-center space-x-4 overflow-x-auto pb-2">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              currentStep >= step.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {step.id}
          </div>
          <div className="ml-2 text-sm">
            <div
              className={
                currentStep >= step.id ? "font-medium" : "text-muted-foreground"
              }
            >
              {step.title}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className="w-8 h-px bg-muted mx-4" />
          )}
        </div>
      ))}
    </div>
  </div>
);
