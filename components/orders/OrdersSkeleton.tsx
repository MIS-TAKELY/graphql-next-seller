import { Skeleton } from "@/components/ui/skeleton"
import { TableSkeleton } from "@/components/ui/table-skeleton"

export function OrdersSkeleton() {
    return (
        <div className="flex-1 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <Skeleton className="h-10 w-[150px]" />
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-[80px]" />
                    <Skeleton className="h-9 w-[80px]" />
                </div>
            </div>

            {/* Search & Filter bar skeleton */}
            <Skeleton className="h-12 w-full" />

            {/* Tabs skeleton */}
            <div className="flex gap-2 overflow-hidden">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-10 w-[100px] shrink-0" />
                ))}
            </div>

            {/* Table skeleton */}
            <TableSkeleton columnCount={6} rowCount={8} />
        </div>
    )
}
