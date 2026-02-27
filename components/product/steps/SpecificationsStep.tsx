// ... imports ...
import { FormField, ValidatedInput } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Errors, FormData } from "@/types/pages/product";
import { AlertCircle, Clipboard, Plus, Table, Trash2, X } from "lucide-react";
import React, { useCallback, useMemo, useState, useEffect } from "react";
import { parseTableFromClipboard } from "@/utils/product/table-parser";
import { SpecificationTable } from "../SpecificationTable";

interface Specification {
  id: string;
  key: string;
  value: string;
}

interface SpecificationsStepProps {
  formData: FormData;
  errors: Errors;
  updateFormData: (field: keyof FormData, value: any) => void;
}

interface SpecificationSection {
  title: string;
  headers: string[];
  rows: string[][];
}

export const SpecificationsStep = React.memo(
  ({ formData, errors, updateFormData }: SpecificationsStepProps) => {

    // Initialize sections from formData
    const initialSections = useMemo(() => {
      // 1. New Format: Array of sections
      if (Array.isArray(formData.specificationTable) && formData.specificationTable.length > 0) {
        // Validation/Sanitization could happen here
        return formData.specificationTable as SpecificationSection[];
      }

      // 2. Old Format: Single Object
      if (formData.specificationTable && !Array.isArray(formData.specificationTable) && formData.specificationTable.headers) {
        return [{
          title: "General",
          headers: formData.specificationTable.headers,
          rows: formData.specificationTable.rows
        }];
      }

      // 3. Fallback: Convert legacy specifications array
      const headers = ["Specification", "Value"];
      const rows = formData.specifications
        .filter(s => s.key || s.value)
        .map(s => [s.key, s.value]);

      return [{
        title: "General",
        headers,
        rows: rows.length > 0 ? rows : [["", ""]]
      }];
    }, [formData.specificationTable, formData.specifications]);

    // Local state to manage edits before syncing? 
    // Actually, relying on formData is better for persistence, but we need to derive the *array* to work with.
    // Since we can't easily change the formData structure type on the fly without breaking other things potentially, 
    // let's compute the sections and assume we update `specificationTable` as the array.

    const sections: SpecificationSection[] = initialSections;

    const updateSections = useCallback((newSections: SpecificationSection[]) => {
      updateFormData("specificationTable", newSections);

      // Auto-switch to custom table format if not already
      if (formData.specificationDisplayFormat === 'table' || !formData.specificationDisplayFormat) {
        updateFormData("specificationDisplayFormat", "custom_table");
      }

      // Legacy Sync (Best Effort): Sync the FIRST section's data to `specifications`
      // This ensures old clients/parts of the app that rely on flat `specifications` see at least the main specs.
      if (newSections.length > 0) {
        const firstSection = newSections[0];
        if (firstSection.headers.length === 2) {
          const syncedSpecs = firstSection.rows.map((row, i) => ({
            id: `spec_${i}`,
            key: row[0] || "",
            value: row[1] || ""
          }));
          updateFormData("specifications", syncedSpecs);
        }
      }
    }, [updateFormData, formData.specificationDisplayFormat]);

    /* --- Section Management --- */

    const addSection = () => {
      const newSections = [
        ...sections,
        {
          title: `Section ${sections.length + 1}`,
          headers: ["Specification", "Value"],
          rows: [["", ""]]
        }
      ];
      updateSections(newSections);
    };

    const removeSection = (index: number) => {
      if (sections.length <= 1) return; // Prevent deleting the last section
      const newSections = sections.filter((_, i) => i !== index);
      updateSections(newSections);
    };

    const updateSectionTitle = (index: number, newTitle: string) => {
      const newSections = [...sections];
      newSections[index] = { ...newSections[index], title: newTitle };
      updateSections(newSections);
    };

    /* --- Table Editing (Per Section) --- */

    const updateSectionData = (sectionIndex: number, newData: { headers: string[], rows: string[][] }) => {
      const newSections = [...sections];
      newSections[sectionIndex] = { ...newSections[sectionIndex], ...newData };
      updateSections(newSections);
    };

    // Helper functions wrapped to apply to specific section
    const createTableHandlers = (sectionIndex: number) => {
      const section = sections[sectionIndex];

      const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
        const newRows = [...section.rows];
        newRows[rowIndex] = [...newRows[rowIndex]];
        newRows[rowIndex][colIndex] = value;
        updateSectionData(sectionIndex, { headers: section.headers, rows: newRows });
      };

      const handleHeaderChange = (colIndex: number, value: string) => {
        const newHeaders = [...section.headers];
        newHeaders[colIndex] = value;
        updateSectionData(sectionIndex, { headers: newHeaders, rows: section.rows });
      };

      const addRow = () => {
        const newRows = [...section.rows, Array(section.headers.length).fill("")];
        updateSectionData(sectionIndex, { headers: section.headers, rows: newRows });
      };

      const removeRow = (rowIndex: number) => {
        const newRows = section.rows.filter((_, i) => i !== rowIndex);
        updateSectionData(sectionIndex, { headers: section.headers, rows: newRows.length > 0 ? newRows : [Array(section.headers.length).fill("")] });
      };

      const addColumn = () => {
        const newHeaders = [...section.headers, `Column ${section.headers.length + 1}`];
        const newRows = section.rows.map(row => [...row, ""]);
        updateSectionData(sectionIndex, { headers: newHeaders, rows: newRows });
      };

      const removeColumn = (colIndex: number) => {
        if (section.headers.length <= 1) return;
        const newHeaders = section.headers.filter((_, i) => i !== colIndex);
        const newRows = section.rows.map(row => row.filter((_, i) => i !== colIndex));
        updateSectionData(sectionIndex, { headers: newHeaders, rows: newRows });
      };

      const clearAll = () => {
        updateSectionData(sectionIndex, { headers: ["Specification", "Value"], rows: [["", ""]] });
      };

      const handlePaste = (e: React.ClipboardEvent) => {
        const parsed = parseTableFromClipboard(e.clipboardData);
        if (parsed) {
          e.preventDefault();
          e.stopPropagation();

          const hasActualData = section.rows.some(row => row.some(cell => cell.trim()));

          if (hasActualData && section.headers.length === parsed.headers.length) {
            const cleanExistingRows = section.rows.filter(row => row.some(cell => cell.trim()));
            updateSectionData(sectionIndex, {
              headers: section.headers,
              rows: [...cleanExistingRows, ...parsed.rows]
            });
          } else {
            updateSectionData(sectionIndex, parsed);
          }
        }
      };

      return { handleCellChange, handleHeaderChange, addRow, removeRow, addColumn, removeColumn, clearAll, handlePaste };
    };

    return (
      <div className="space-y-8">
        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Product Specifications</h3>
            <p className="text-sm text-muted-foreground">
              Organize specifications into sections (e.g., Display, Memory, Ports).
            </p>
          </div>
        </div>

        {sections.map((section, sectionIndex) => {
          const {
            handleCellChange, handleHeaderChange, addRow, removeRow, addColumn, removeColumn, clearAll, handlePaste
          } = createTableHandlers(sectionIndex);

          return (
            <div key={sectionIndex} className="space-y-4 border rounded-lg p-4 bg-card">
              <div className="flex items-center gap-3 mb-2">
                <input
                  value={section.title}
                  onChange={(e) => updateSectionTitle(sectionIndex, e.target.value)}
                  className="text-lg font-semibold bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none transition-colors px-1"
                  placeholder="Section Title"
                />
                {sections.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSection(sectionIndex)}
                    className="text-muted-foreground hover:text-destructive h-8 w-8 ml-auto"
                    title="Delete Section"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div
                className="border rounded-lg overflow-hidden group relative focus-within:ring-2 focus-within:ring-primary/20 outline-none"
                onPaste={handlePaste}
                tabIndex={0}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-muted/50 border-b">
                        {section.headers.map((header, i) => (
                          <th key={i} className="p-0 border-r last:border-r-0 min-w-[150px]">
                            <div className="flex items-center group/header">
                              <input
                                value={header}
                                onChange={(e) => handleHeaderChange(i, e.target.value)}
                                className="w-full px-4 py-3 bg-transparent font-semibold focus:outline-none focus:bg-background transition-colors"
                                placeholder={`Header ${i + 1}`}
                              />
                              <button
                                type="button"
                                onClick={() => removeColumn(i)}
                                className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover/header:opacity-100 transition-opacity"
                                title="Remove Column"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </th>
                        ))}
                        <th className="p-2 w-10">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={addColumn}
                            className="h-8 w-8 p-0"
                            title="Add Column"
                          >
                            <Plus className="h-4 w-4 text-primary" />
                          </Button>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {section.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="group/row">
                          {row.map((cell, colIndex) => (
                            <td key={colIndex} className="p-0 border-r last:border-r-0">
                              <input
                                value={cell}
                                onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                                className="w-full px-4 py-3 bg-transparent focus:outline-none focus:bg-background transition-colors"
                                placeholder="..."
                              />
                            </td>
                          ))}
                          <td className="p-2 w-10 text-center">
                            <button
                              type="button"
                              onClick={() => removeRow(rowIndex)}
                              className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover/row:opacity-100 transition-opacity"
                              title="Remove Row"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-muted/20 border-t flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addRow}
                      className="text-primary hover:text-primary-foreground hover:bg-primary"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Row
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearAll}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Clear All
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                    <Clipboard className="h-3 w-3" />
                    Tip: Paste to import data
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div className="flex justify-end">
          <Button onClick={addSection} size="sm" variant="secondary">
            <Plus className="h-4 w-4 mr-2" /> Add Section
          </Button>
        </div>

        {/* Preview Section - Shows all sections */}
        {sections.some(s => s.rows.some(r => r.some(c => c.trim()))) && (
          <div className="space-y-4">
            <Separator />
            <h3 className="text-lg font-medium">Preview</h3>
            <div className="space-y-6">
              {sections.map((section, i) => (
                <div key={i} className="rounded-lg border bg-muted/30 p-4">
                  <h4 className="font-semibold mb-3">{section.title}</h4>
                  <SpecificationTable data={section} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

SpecificationsStep.displayName = "SpecificationsStep";
