// components/ui/full-screen-loader.tsx
"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface FullScreenLoaderProps {
  isLoading: boolean;
  message?: string;
  showProgress?: boolean;
  steps?: string[];
}

export function FullScreenLoader({
  isLoading,
  message = "Processing...",
  showProgress = false,
  steps = [],
}: FullScreenLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setCurrentStep(0);
      setProgress(0);
      return;
    }

    if (!showProgress || steps.length === 0) return;

    const totalDuration = 8000; // 8 seconds total
    const stepDuration = totalDuration / steps.length;
    const progressInterval = 50; // Update every 50ms

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += (progressInterval / totalDuration) * 100;

      if (currentProgress >= 100) {
        setProgress(99); // Keep at 99% until actually complete
        return;
      }

      setProgress(currentProgress);
      const newStep = Math.floor((currentProgress / 100) * steps.length);
      setCurrentStep(Math.min(newStep, steps.length - 1));
    }, progressInterval);

    return () => clearInterval(interval);
  }, [isLoading, showProgress, steps.length]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4 p-8 bg-card rounded-lg shadow-lg border min-w-[320px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="text-center space-y-2 w-full">
          <p className="text-lg font-medium">{message}</p>
          {showProgress && steps.length > 0 && (
            <div className="space-y-3 mt-4">
              {/* Progress Bar */}
              <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {/* Current Step Text */}
              <p className="text-sm text-muted-foreground animate-pulse">
                {steps[currentStep]}
              </p>
              {/* Step Counter */}
              <p className="text-xs text-muted-foreground/70">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
