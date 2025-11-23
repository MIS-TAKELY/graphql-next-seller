// components/product/FormNavigation.tsx
import { Button } from "@/components/ui/button";

interface Props {
  currentStep: number;
  totalSteps: number;
  onPrev: () => void;
  onNext?: () => void;
  onSaveDraft?: () => void;
  onPublish?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function FormNavigation({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  onSaveDraft,
  onPublish,
  isLoading = false,
  submitLabel = "Publish",
}: Props) {
  const isLastStep = currentStep === totalSteps;
  const isFirstStep = currentStep === 1;

  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t">
      {/* Previous Button */}
      <Button
        type="button"
        variant="outline"
        onClick={onPrev}
        disabled={isFirstStep || isLoading}
        className="w-full sm:w-auto"
      >
        Previous
      </Button>

      {/* Next/Submit Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        {isLastStep ? (
          <>
            {/* Save as Draft Button (Final Step Only) */}
            {onSaveDraft && (
              <Button
                type="button"
                variant="outline"
                onClick={onSaveDraft}
                disabled={isLoading}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                {isLoading ? "Saving..." : "Save as Draft"}
              </Button>
            )}
            
            {/* Publish Button (Final Step Only) */}
            {onPublish && (
              <Button
                type="button"
                onClick={onPublish}
                disabled={isLoading}
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                {isLoading ? "Publishing..." : submitLabel}
              </Button>
            )}
          </>
        ) : (
          /* Next Button (All Other Steps) */
          <Button
            type="button"
            onClick={onNext}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
}