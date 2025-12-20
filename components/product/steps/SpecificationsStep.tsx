import { FormField, ValidatedInput } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Errors, FormData } from "@/types/pages/product";
import { AlertCircle, Clipboard, Plus, Table, Trash2, X } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
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

export const SpecificationsStep = React.memo(
  ({ formData, errors, updateFormData }: SpecificationsStepProps) => {
    // Sync logic: If specificationTable exists, we use it. 
    // If not, we fall back to specifications array.
    // To keep it unified, we'll primarily work with the table structure in UI.

    const tableData = useMemo(() => {
      if (formData.specificationTable) return formData.specificationTable;

      // Fallback: convert legacy specs to table format
      const headers = ["Specification", "Value"];
      const rows = formData.specifications
        .filter(s => s.key || s.value)
        .map(s => [s.key, s.value]);

      return { headers, rows: rows.length > 0 ? rows : [["", ""]] };
    }, [formData.specificationTable, formData.specifications]);

    const handleUpdateTable = useCallback((newData: { headers: string[], rows: string[][] }) => {
      updateFormData("specificationTable", newData);
      updateFormData("specificationDisplayFormat", "custom_table");

      // Also sync back to legacy specifications if 2 columns for backward compatibility?
      // Not strictly necessary if the rest of the app uses specificationTable, but let's be safe.
      if (newData.headers.length === 2) {
        const syncedSpecs = newData.rows.map((row, i) => ({
          id: `spec_${i}`,
          key: row[0] || "",
          value: row[1] || ""
        }));
        updateFormData("specifications", syncedSpecs);
      }
    }, [updateFormData]);

    const handlePaste = useCallback(
      (e: React.ClipboardEvent) => {
        const parsed = parseTableFromClipboard(e.clipboardData);
        if (parsed) {
          e.preventDefault();
          e.stopPropagation();

          // Intelligent Paste: If column counts match and we have data, append!
          const hasActualData = tableData.rows.some(row => row.some(cell => cell.trim()));

          if (hasActualData && tableData.headers.length === parsed.headers.length) {
            // Remove empty placeholder rows from the end/start if they exist
            const cleanExistingRows = tableData.rows.filter(row => row.some(cell => cell.trim()));
            handleUpdateTable({
              ...tableData,
              rows: [...cleanExistingRows, ...parsed.rows]
            });
          } else {
            // Otherwise replace (usually for the first paste or when column structure changes)
            handleUpdateTable(parsed);
          }
        }
      },
      [handleUpdateTable, tableData]
    );

    const clearAll = () => {
      handleUpdateTable({
        headers: ["Specification", "Value"],
        rows: [["", ""]]
      });
      updateFormData("specificationTable", undefined);
      updateFormData("specificationDisplayFormat", "table");
    };

    const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
      const newRows = [...tableData.rows];
      newRows[rowIndex] = [...newRows[rowIndex]];
      newRows[rowIndex][colIndex] = value;
      handleUpdateTable({ ...tableData, rows: newRows });
    };

    const handleHeaderChange = (colIndex: number, value: string) => {
      const newHeaders = [...tableData.headers];
      newHeaders[colIndex] = value;
      handleUpdateTable({ ...tableData, headers: newHeaders });
    };

    const addRow = () => {
      const newRows = [...tableData.rows, Array(tableData.headers.length).fill("")];
      handleUpdateTable({ ...tableData, rows: newRows });
    };

    const removeRow = (index: number) => {
      const newRows = tableData.rows.filter((_, i) => i !== index);
      handleUpdateTable({ ...tableData, rows: newRows.length > 0 ? newRows : [Array(tableData.headers.length).fill("")] });
    };

    const addColumn = () => {
      const newHeaders = [...tableData.headers, `Column ${tableData.headers.length + 1}`];
      const newRows = tableData.rows.map(row => [...row, ""]);
      handleUpdateTable({ headers: newHeaders, rows: newRows });
    };

    const removeColumn = (index: number) => {
      if (tableData.headers.length <= 1) return;
      const newHeaders = tableData.headers.filter((_, i) => i !== index);
      const newRows = tableData.rows.map(row => row.filter((_, i) => i !== index));
      handleUpdateTable({ headers: newHeaders, rows: newRows });
    };

    const validSpecsCount = tableData.rows.filter(r => r.some(c => c.trim())).length;

    return (
      <div className="space-y-6">
        <Separator />

        <div className="space-y-4">
          <FormField
            label="Product Specifications"
            error={errors.specifications}
          >
            <p className="text-sm text-muted-foreground mb-4">
              Type directly into the table to add specifications, or <strong>Paste (Ctrl+V)</strong> a table from Excel/Google Sheets to import it instantly.
            </p>
          </FormField>

          <div
            className="border rounded-lg overflow-hidden group relative focus-within:ring-2 focus-within:ring-primary/20 outline-none"
            onPaste={handlePaste}
            tabIndex={0}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    {tableData.headers.map((header, i) => (
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
                  {tableData.rows.map((row, rowIndex) => (
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
                Tip: Paste anywhere on this table to import data
              </div>
            </div>
          </div>
        </div>

        {/* Specifications Preview (Auto-shows if there is valid data) */}
        {validSpecsCount > 0 && (
          <div className="space-y-4">
            <Separator />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="text-lg font-medium">Display Format</h3>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={
                    formData.specificationDisplayFormat === "bullet" || formData.specificationDisplayFormat === "custom_table"
                      ? "outline"
                      : "default"
                  }
                  onClick={() =>
                    updateFormData("specificationDisplayFormat", "table")
                  }
                >
                  Table View
                </Button>
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
                  Bullet List
                </Button>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4">
              {formData.specificationDisplayFormat === "bullet" ? (
                <ul className="space-y-2">
                  {tableData.rows
                    .filter(r => r[0] && r[1])
                    .map((row, i) => (
                      <li key={i} className="flex">
                        <span className="font-medium mr-2">•</span>
                        <span>
                          <span className="font-medium">{row[0]}:</span>{" "}
                          {row[1]}
                        </span>
                      </li>
                    ))}
                </ul>
              ) : (
                <SpecificationTable data={tableData} />
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

SpecificationsStep.displayName = "SpecificationsStep";
