import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface TableSkeletonProps {
    columnCount: number
    rowCount?: number
    /** Show row numbers on the left */
    showRowNumbers?: boolean
    /** Animation variant: 'pulse' (default) or 'wave' */
    animation?: "pulse" | "wave"
}

export function TableSkeleton({ 
    columnCount, 
    rowCount = 5,
    showRowNumbers = false,
    animation = "pulse"
}: TableSkeletonProps) {
    const animationClass = animation === "wave" ? "animate-pulse" : "animate-pulse"
    
    return (
        <div className="rounded-md border overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        {showRowNumbers && (
                            <TableHead className="w-[50px]">
                                <Skeleton className="h-4 w-6" />
                            </TableHead>
                        )}
                        {Array.from({ length: columnCount }).map((_, i) => (
                            <TableHead key={i}>
                                <Skeleton 
                                    className={`h-4 ${animationClass}`} 
                                    style={{ width: `${60 + Math.random() * 40}%` }} 
                                />
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: rowCount }).map((_, i) => (
                        <TableRow key={i} className="hover:bg-transparent">
                            {showRowNumbers && (
                                <TableCell className="w-[50px]">
                                    <Skeleton className="h-4 w-6" />
                                </TableCell>
                            )}
                            {Array.from({ length: columnCount }).map((_, j) => (
                                <TableCell key={j}>
                                    <Skeleton 
                                        className={`h-5 ${animationClass}`} 
                                        style={{ 
                                            width: `${50 + Math.random() * 45}%`,
                                            animationDelay: `${(i * columnCount + j) * 50}ms`
                                        }} 
                                    />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
