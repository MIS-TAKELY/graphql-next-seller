import { Skeleton } from "@/components/ui/skeleton"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function CustomersSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <Skeleton className="h-10 w-[200px]" />
                <Skeleton className="h-9 w-[120px]" />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-1" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48 mb-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <Skeleton className="h-10 flex-1" />
                        <Skeleton className="h-10 w-full sm:w-[150px]" />
                    </div>
                    <TableSkeleton columnCount={5} rowCount={8} />
                </CardContent>
            </Card>
        </div>
    )
}
