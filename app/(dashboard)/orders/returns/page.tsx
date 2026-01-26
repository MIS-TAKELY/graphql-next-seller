"use client";

import { useQuery, useMutation } from "@apollo/client";
import { GET_SELLER_RETURNS, UPDATE_RETURN_STATUS } from "@/client/return/return.queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ExternalLink, CheckCircle2, XCircle, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from "next/image";

const statusColors: Record<string, string> = {
    REQUESTED: "bg-yellow-100 text-yellow-700 border-yellow-200",
    APPROVED: "bg-blue-100 text-blue-700 border-blue-200",
    PICKUP_SCHEDULED: "bg-purple-100 text-purple-700 border-purple-200",
    IN_TRANSIT: "bg-orange-100 text-orange-700 border-orange-200",
    RECEIVED: "bg-teal-100 text-teal-700 border-teal-200",
    INSPECTED: "bg-indigo-100 text-indigo-700 border-indigo-200",
    ACCEPTED: "bg-green-100 text-green-700 border-green-200",
    REJECTED: "bg-red-100 text-red-700 border-red-200",
    DENIED: "bg-red-100 text-red-700 border-red-200",
};

export default function SellerReturnsPage() {
    const { data, loading, refetch } = useQuery(GET_SELLER_RETURNS, {
        variables: { limit: 20, offset: 0 },
        fetchPolicy: "cache-and-network"
    });

    const [updateStatus, { loading: updating }] = useMutation(UPDATE_RETURN_STATUS, {
        onCompleted: () => {
            toast.success("Return status updated successfully");
            refetch();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update return status");
        }
    });

    const handleStatusUpdate = (returnId: string, status: string) => {
        updateStatus({
            variables: {
                input: { returnId, status }
            }
        });
    };

    const returns = data?.sellerReturns || [];

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Manage Returns</h1>
                    <p className="text-muted-foreground mt-1">
                        Review and process customer return requests.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Return Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order #</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Requested On</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={7} className="h-12 text-center">Loading...</TableCell>
                                    </TableRow>
                                ))
                            ) : returns.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">No return requests found.</TableCell>
                                </TableRow>
                            ) : (
                                returns.map((ret: any) => (
                                    <TableRow key={ret.id}>
                                        <TableCell className="font-medium">#{ret.order.orderNumber}</TableCell>
                                        <TableCell>
                                            <div className="text-sm font-medium">{ret.user.name}</div>
                                            <div className="text-xs text-muted-foreground truncate max-w-[150px]">{ret.user.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="relative w-8 h-8 rounded bg-muted overflow-hidden shrink-0 border">
                                                    <Image
                                                        src={ret.items[0]?.orderItem?.variant?.product?.images[0]?.url || "/placeholder.jpg"}
                                                        alt=""
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                </div>
                                                <div className="truncate max-w-[150px] text-xs font-medium">
                                                    {ret.items[0]?.orderItem?.variant?.product?.name}
                                                    {ret.items.length > 1 && ` (+${ret.items.length - 1} more)`}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                                                {ret.reason.replace(/_/g, " ")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={cn("capitalize text-[10px]", statusColors[ret.status])}>
                                                {ret.status.replace(/_/g, " ").toLowerCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {new Date(ret.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" disabled={updating}>
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {ret.status === "REQUESTED" && (
                                                        <>
                                                            <DropdownMenuItem onClick={() => handleStatusUpdate(ret.id, "APPROVED")} className="text-blue-600">
                                                                <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleStatusUpdate(ret.id, "REJECTED")} className="text-red-600">
                                                                <XCircle className="w-4 h-4 mr-2" /> Reject
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    {ret.status === "APPROVED" && (
                                                        <DropdownMenuItem onClick={() => handleStatusUpdate(ret.id, "RECEIVED")}>
                                                            <PackageCheck className="w-4 h-4 mr-2" /> Mark as Received
                                                        </DropdownMenuItem>
                                                    )}
                                                    {ret.status === "RECEIVED" && (
                                                        <DropdownMenuItem onClick={() => handleStatusUpdate(ret.id, "INSPECTED")}>
                                                            <PackageCheck className="w-4 h-4 mr-2" /> Mark as Inspected
                                                        </DropdownMenuItem>
                                                    )}
                                                    {ret.status === "INSPECTED" && (
                                                        <DropdownMenuItem onClick={() => handleStatusUpdate(ret.id, "ACCEPTED")} className="text-green-600">
                                                            <CheckCircle2 className="w-4 h-4 mr-2" /> Final Accept & Refund
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem disabled>
                                                        <ExternalLink className="w-4 h-4 mr-2" /> View Details
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
