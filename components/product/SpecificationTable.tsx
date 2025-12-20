import React from "react";
import { cn } from "@/lib/utils";

interface SpecificationTableProps {
    data: {
        headers: string[];
        rows: string[][];
    };
    className?: string;
}

export const SpecificationTable: React.FC<SpecificationTableProps> = ({
    data,
    className,
}) => {
    if (!data || !data.headers || !data.rows || data.rows.length === 0) {
        return null;
    }

    return (
        <div className={cn("overflow-x-auto rounded-lg border", className)}>
            <table className="w-full text-sm text-left border-collapse">
                <thead>
                    <tr className="bg-muted/50 border-b">
                        {data.headers.map((header, i) => (
                            <th
                                key={i}
                                className="px-4 py-3 font-semibold text-muted-foreground border-r last:border-r-0"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {data.rows.map((row, i) => (
                        <tr
                            key={i}
                            className={cn(
                                "transition-colors hover:bg-muted/30",
                                i % 2 === 0 ? "bg-background" : "bg-muted/10"
                            )}
                        >
                            {row.map((cell, j) => (
                                <td
                                    key={j}
                                    className="px-4 py-3 border-r last:border-r-0 break-words max-w-[300px]"
                                >
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
