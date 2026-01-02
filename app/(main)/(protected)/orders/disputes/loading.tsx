import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-[150px]" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-[200px] mb-2" />
                    <Skeleton className="h-4 w-[300px]" />
                </CardHeader>
                <CardContent>
                    <TableSkeleton columnCount={6} rowCount={6} />
                </CardContent>
            </Card>
        </div>
    );
}
