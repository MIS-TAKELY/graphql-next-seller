import { FormField, ValidatedInput } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Errors, FormData } from "@/types/pages/product";
import { AlertCircle, Plus, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

interface Specification {
  id: string;
  key: string;
  value: string;
}

interface Category {
  id: string;
  name: string;
  children: Category[];
}

interface SpecificationsStepProps {
  formData: FormData;
  errors: Errors;
  updateFormData: (field: keyof FormData, value: any) => void;
  categoriesData: Category[];
}

export const SpecificationsStep = ({
  formData,
  errors,
  updateFormData,
}: SpecificationsStepProps) => {
  const [featureInput, setFeatureInput] = useState("");
  const [showSpecError, setShowSpecError] = useState(false);

  // Convert object to array format for better handling
  const specifications = useMemo<Specification[]>(() => {
    if (Array.isArray(formData.specifications)) {
      // Ensure all specs have a string id
      return formData.specifications.map((spec) => ({
        id: spec.id || `spec_${Date.now()}_${Math.random()}`,
        key: spec.key,
        value: spec.value,
      }));
    }
    // Convert from object format to array format
    return Object.entries(formData.specifications || {}).map(
      ([key, value]) => ({
        id: `spec_${Date.now()}_${Math.random()}`,
        key,
        value: value as string,
      })
    );
  }, [formData.specifications]);

  // Check if there are any empty specifications
  const hasEmptySpecs = useMemo(
    () => specifications.some((spec) => !spec.key.trim() || !spec.value.trim()),
    [specifications]
  );

  // Memoized callbacks
  const handleAddFeature = useCallback(() => {
    if (featureInput.trim()) {
      updateFormData("features", [...formData.features, featureInput.trim()]);
      setFeatureInput("");
    }
  }, [featureInput, formData.features, updateFormData]);

  const handleRemoveFeature = useCallback(
    (index: number) => {
      updateFormData(
        "features",
        formData.features.filter((_, i) => i !== index)
      );
    },
    [formData.features, updateFormData]
  );

  const handleAddSpec = useCallback(() => {
    // Check if any existing specs are empty
    if (hasEmptySpecs) {
      setShowSpecError(true);
      // Hide error after 3 seconds
      setTimeout(() => setShowSpecError(false), 3000);
      return;
    }

    const newSpec: Specification = {
      id: `spec_${Date.now()}`,
      key: "",
      value: "",
    };
    updateFormData("specifications", [...specifications, newSpec]);
    setShowSpecError(false);
  }, [specifications, updateFormData, hasEmptySpecs]);

  const handleUpdateSpec = useCallback(
    (id: string, field: "key" | "value", newValue: string) => {
      const updated = specifications.map((spec) =>
        spec.id === id ? { ...spec, [field]: newValue } : spec
      );
      updateFormData("specifications", updated);
      // Clear error when user starts typing
      if (showSpecError && newValue.trim()) {
        setShowSpecError(false);
      }
    },
    [specifications, updateFormData, showSpecError]
  );

  const handleRemoveSpec = useCallback(
    (id: string) => {
      updateFormData(
        "specifications",
        specifications.filter((spec) => spec.id !== id)
      );
      setShowSpecError(false);
    },
    [specifications, updateFormData]
  );

  // Filter out empty specifications for preview
  const validSpecs = useMemo(
    () => specifications.filter((spec) => spec.key && spec.value),
    [specifications]
  );

  // Get empty spec indices for highlighting
  const emptySpecIds = useMemo(
    () =>
      specifications
        .filter((spec) => !spec.key.trim() || !spec.value.trim())
        .map((spec) => spec.id),
    [specifications]
  );

  return (
    <div className="space-y-6">
      {/* Features Section */}
      {/* <div className="space-y-4">
        <FormField label="Key Features" error={errors.features}>
          <div className="space-y-2">
            <div className="flex gap-2">
              <ValidatedInput
                placeholder="Add a feature"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                error={errors.features}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddFeature}
                disabled={!featureInput.trim()}
              >
                Add
              </Button>
            </div>
            {formData.features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <Badge key={`${feature}-${index}`} variant="secondary">
                    {feature}
                    <button
                      type="button"
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                      onClick={() => handleRemoveFeature(index)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </FormField>
      </div> */}

      <Separator />

      {/* Specifications Section */}
      <div className="space-y-4">
        <FormField
          label="Technical Specifications"
          error={errors.specifications}
        >
          <div className="space-y-3">
            {specifications.map((spec) => {
              const isEmpty = emptySpecIds.includes(spec.id);
              return (
                <div
                  key={spec.id}
                  className={`flex items-start gap-2 ${
                    isEmpty && showSpecError ? "animate-pulse" : ""
                  }`}
                >
                  <ValidatedInput
                    placeholder="e.g., RAM, Storage, Display"
                    value={spec.key}
                    onChange={(e) =>
                      handleUpdateSpec(spec.id, "key", e.target.value)
                    }
                    className={`flex-1 ${
                      isEmpty && showSpecError ? "border-destructive" : ""
                    }`}
                  />
                  <ValidatedInput
                    placeholder="e.g., 8GB, 256GB SSD, 6.5 inch"
                    value={spec.value}
                    onChange={(e) =>
                      handleUpdateSpec(spec.id, "value", e.target.value)
                    }
                    className={`flex-1 ${
                      isEmpty && showSpecError ? "border-destructive" : ""
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveSpec(spec.id)}
                    className="text-destructive hover:text-destructive/90"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}

            {/* Error message */}
            {showSpecError && (
              <div className="flex items-center gap-2 text-sm text-destructive animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-4 w-4" />
                <span>
                  Please fill in all existing specifications before adding new
                  ones
                </span>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={handleAddSpec}
              className={`w-full sm:w-auto ${
                hasEmptySpecs ? "opacity-50" : ""
              }`}
              disabled={specifications.length === 0 ? false : hasEmptySpecs}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Specification
            </Button>
          </div>
        </FormField>
      </div>

      {/* Specifications Preview */}
      {validSpecs.length > 0 && (
        <div className="space-y-4">
          <Separator />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-medium">Specifications Preview</h3>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant={
                  formData.specificationDisplayFormat === "bullet"
                    ? "default"
                    : "outline"
                }
                onClick={() =>
                  updateFormData("specificationDisplayFormat", "bullet")
                }
              >
                Bullet Points
              </Button>
              <Button
                type="button"
                size="sm"
                variant={
                  formData.specificationDisplayFormat === "table"
                    ? "default"
                    : "outline"
                }
                onClick={() =>
                  updateFormData("specificationDisplayFormat", "table")
                }
              >
                Table
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4">
            {formData.specificationDisplayFormat === "bullet" ? (
              <ul className="space-y-2">
                {validSpecs.map((spec) => (
                  <li key={spec.id} className="flex">
                    <span className="font-medium mr-2">•</span>
                    <span>
                      <span className="font-medium">{spec.key}:</span>{" "}
                      {spec.value}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <tbody>
                    {validSpecs.map((spec, index) => (
                      <tr
                        key={spec.id}
                        className={
                          index % 2 === 0 ? "bg-background" : "bg-muted/50"
                        }
                      >
                        <td className="px-4 py-2 font-medium text-sm border-r">
                          {spec.key}
                        </td>
                        <td className="px-4 py-2 text-sm">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};