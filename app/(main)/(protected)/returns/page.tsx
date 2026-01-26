
"use client";

import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Image from "next/image";
import { format } from "date-fns";

// Queries & Mutations
const GET_SELLER_RETURNS = gql`
  query SellerReturns($limit: Int, $offset: Int, $status: ReturnStatus) {
    sellerReturns(limit: $limit, offset: $offset, status: $status) {
      id
      orderId
      status
      type
      reason
      description
      images
      createdAt
      refundStatus
      items {
        id
        quantity
        orderItem {
          id
          unitPrice
          variant {
            product {
              name
              images {
                url
              }
            }
          }
        }
      }
      user {
        firstName
        lastName
        email
      }
    }
  }
`;

const UPDATE_RETURN_STATUS = gql`
  mutation UpdateReturnStatus($input: UpdateReturnStatusInput!) {
    updateReturnStatus(input: $input) {
      id
      status
    }
  }
`;

export default function ReturnsPage() {
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [selectedReturn, setSelectedReturn] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [actionNote, setActionNote] = useState("");
    const [processingAction, setProcessingAction] = useState(false);

    const { data, loading, refetch } = useQuery(GET_SELLER_RETURNS, {
        variables: {
            limit: 20,
            offset: 0,
            status: statusFilter === "ALL" ? undefined : statusFilter
        },
        fetchPolicy: "network-only"
    });

    const [updateStatus] = useMutation(UPDATE_RETURN_STATUS, {
        onCompleted: () => {
            toast.success("Return status updated");
            setIsDetailsOpen(false);
            refetch();
            setProcessingAction(false);
        },
        onError: (err) => {
            toast.error(err.message);
            setProcessingAction(false);
        }
    });

    const handleStatusUpdate = (newStatus: string) => {
        if (!selectedReturn) return;
        setProcessingAction(true);
        updateStatus({
            variables: {
                input: {
                    returnId: selectedReturn.id,
                    status: newStatus,
                    rejectionReason: newStatus === "REJECTED" ? actionNote : undefined
                }
            }
        });
    };

    const openDetails = (ret: any) => {
        setSelectedReturn(ret);
        setActionNote("");
        setIsDetailsOpen(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "REQUESTED": return "bg-blue-100 text-blue-800";
            case "APPROVED": return "bg-green-100 text-green-800";
            case "REJECTED": return "bg-red-100 text-red-800";
            case "RECEIVED": return "bg-purple-100 text-purple-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Returns Management</h1>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Statuses</SelectItem>
                        <SelectItem value="REQUESTED">Requested</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                        <SelectItem value="RECEIVED">Received</SelectItem>
                        <SelectItem value="ACCEPTED">Accepted</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="border rounded-lg bg-white overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Return ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
                        ) : data?.sellerReturns?.map((ret: any) => (
                            <TableRow key={ret.id}>
                                <TableCell className="font-mono text-xs">{ret.id.slice(-8)}</TableCell>
                                <TableCell>
                                    <div className="text-sm font-medium">{ret.user.firstName} {ret.user.lastName}</div>
                                    <div className="text-xs text-muted-foreground">{ret.user.email}</div>
                                </TableCell>
                                <TableCell><Badge variant="outline">{ret.type}</Badge></TableCell>
                                <TableCell>{ret.items.length} item(s)</TableCell>
                                <TableCell>{format(new Date(ret.createdAt), "MMM d, yyyy")}</TableCell>
                                <TableCell>
                                    <Badge className={getStatusColor(ret.status)} variant="secondary">
                                        {ret.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="sm" onClick={() => openDetails(ret)}>
                                        View Details
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {!loading && data?.sellerReturns?.length === 0 && (
                            <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No returns found</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Details Dialog */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Return Details #{selectedReturn?.id.slice(-8)}</DialogTitle>
                        <DialogDescription>
                            Created on {selectedReturn && format(new Date(selectedReturn.createdAt), "PPP p")}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedReturn && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <h4 className="font-semibold mb-1">Reason</h4>
                                    <p className="text-muted-foreground">{selectedReturn.reason}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Type</h4>
                                    <p className="text-muted-foreground">{selectedReturn.type}</p>
                                </div>
                                <div className="col-span-2">
                                    <h4 className="font-semibold mb-1">Description</h4>
                                    <p className="text-muted-foreground">{selectedReturn.description || "No description provided"}</p>
                                </div>
                            </div>

                            {/* Items List */}
                            <div className="border rounded-md p-4">
                                <h4 className="font-semibold mb-3">Returned Items</h4>
                                <div className="space-y-3">
                                    {selectedReturn.items.map((item: any) => (
                                        <div key={item.id} className="flex gap-4 items-center">
                                            <div className="relative w-12 h-12 bg-muted rounded overflow-hidden">
                                                <Image
                                                    src={item.orderItem.variant.product.images[0]?.url || "/placeholder.jpg"}
                                                    alt=""
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">{item.orderItem.variant.product.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Qty: {item.quantity} × {item.orderItem.unitPrice}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Evidence Images */}
                            {selectedReturn.images && selectedReturn.images.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2">Evidence</h4>
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {selectedReturn.images.map((img: string, idx: number) => (
                                            <div key={idx} className="relative w-24 h-24 rounded border overflow-hidden shrink-0">
                                                <Image src={img} alt="Evidence" fill className="object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Section */}
                            <div className="border-t pt-4 space-y-4">
                                <h4 className="font-semibold">Actions</h4>

                                {selectedReturn.status === "REQUESTED" && (
                                    <div className="flex flex-col gap-3">
                                        <Textarea
                                            placeholder="Rejection reason (required if rejecting)..."
                                            value={actionNote}
                                            onChange={(e) => setActionNote(e.target.value)}
                                        />
                                        <div className="flex gap-3">
                                            <Button
                                                onClick={() => handleStatusUpdate("APPROVED")}
                                                disabled={processingAction}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                Approve Return
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={() => handleStatusUpdate("REJECTED")}
                                                disabled={processingAction || !actionNote}
                                            >
                                                Reject Return
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {selectedReturn.status === "APPROVED" && (
                                    <div className="flex gap-3">
                                        <Button
                                            onClick={() => handleStatusUpdate("RECEIVED")}
                                            disabled={processingAction}
                                        >
                                            Mark as Received
                                        </Button>
                                    </div>
                                )}

                                {selectedReturn.status === "RECEIVED" && (
                                    <div className="flex gap-3">
                                        <Button
                                            onClick={() => handleStatusUpdate("INSPECTED")}
                                            disabled={processingAction}
                                        >
                                            Mark as Inspected
                                        </Button>
                                    </div>
                                )}

                                {selectedReturn.status === "INSPECTED" && (
                                    <div className="flex gap-3">
                                        <Button
                                            onClick={() => handleStatusUpdate("ACCEPTED")}
                                            disabled={processingAction}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            Accept & Initiate Refund
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => handleStatusUpdate("DENIED")}
                                            disabled={processingAction}
                                        >
                                            Deny Return
                                        </Button>
                                    </div>
                                )}

                                {selectedReturn.status === "ACCEPTED" && (
                                    <div className="p-3 bg-green-50 text-green-800 rounded text-sm">
                                        Return Accepted. Refund status: <strong>{selectedReturn.refundStatus}</strong>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
