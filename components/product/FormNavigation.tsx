// components/FormNavigation.tsx
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const FormNavigation = ({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  onSubmit,
}: {
  currentStep: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
}) => (
  <div className="flex justify-between">
    <Button variant="outline" onClick={onPrev} disabled={currentStep === 1}>
      <ArrowLeft className="mr-2 h-4 w-4" />
      Previous
    </Button>
    <div className="flex space-x-2">
      <Button variant="outline">Save Draft</Button>
      {currentStep === totalSteps ? (
        <Button onClick={onSubmit}>Publish Product</Button>
      ) : (
        <Button onClick={onNext}>
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  </div>
);