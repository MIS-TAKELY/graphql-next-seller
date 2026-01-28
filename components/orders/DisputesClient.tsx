'use client';

import { useQuery, useMutation } from '@apollo/client';
import { GET_SELLER_DISPUTES } from '@/client/order/order.query';
import { UPDATE_DISPUTE_STATUS } from '@/client/order/order.mutation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { DisputeStatus, DisputeType, OrderDispute } from '@/types/pages/order.types';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';

export default function DisputesClient() {
    const [selectedDispute, setSelectedDispute] = useState<OrderDispute | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const { data, loading, error, refetch } = useQuery(GET_SELLER_DISPUTES, {
        variables: { limit: 50, offset: 0 },
    });

    const [updateStatus] = useMutation(UPDATE_DISPUTE_STATUS, {
        onCompleted: () => {
            toast.success('Dispute status updated');
            refetch();
            setIsDetailsOpen(false);
        },
        onError: (err) => {
            toast.error(err.message);
        },
    });

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    const disputes: OrderDispute[] = data?.getSellerDisputes || [];

    const handleUpdateStatus = (disputeId: string, status: DisputeStatus) => {
        updateStatus({ variables: { disputeId, status } });
    };

    const returns = disputes.filter(d => d.type === 'RETURN');
    const cancellations = disputes.filter(d => d.type === 'CANCEL');

    const renderDisputeTable = (items: OrderDispute[]) => (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                                No records found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        items.map((dispute) => (
                            <TableRow key={dispute.id}>
                                <TableCell className="font-medium">
                                    {dispute.order?.orderNumber}
                                </TableCell>
                                <TableCell>
                                    {dispute.user?.firstName} {dispute.user?.lastName}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {dispute.order?.items?.[0] && (
                                            <>
                                                <div className="relative w-8 h-8 rounded bg-muted overflow-hidden shrink-0 border">
                                                    <Image
                                                        src={dispute.order.items[0].variant.product.images[0]?.url || "/placeholder.jpg"}
                                                        alt=""
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                </div>
                                                <div className="truncate max-w-[150px] text-xs font-medium">
                                                    {dispute.order.items[0].variant.product.name}
                                                    {dispute.order.items.length > 1 && ` (+${dispute.order.items.length - 1} more)`}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={dispute.type === 'CANCEL' ? 'destructive' : 'outline'}>
                                        {dispute.type}
                                    </Badge>
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate">
                                    {dispute.reason}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            dispute.status === 'APPROVED'
                                                ? 'default'
                                                : dispute.status === 'REJECTED'
                                                    ? 'destructive'
                                                    : 'secondary'
                                        }
                                    >
                                        {dispute.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {format(new Date(dispute.createdAt), "MMM d, yyyy")}
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => {
                                            setSelectedDispute(dispute);
                                            setIsDetailsOpen(true);
                                        }}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    {dispute.status === 'PENDING' && (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleUpdateStatus(dispute.id, DisputeStatus.APPROVED)}
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-destructive font-medium"
                                                onClick={() => handleUpdateStatus(dispute.id, DisputeStatus.REJECTED)}
                                            >
                                                Reject
                                            </Button>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Returns & Disputes</h2>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList>
                    <TabsTrigger value="all">All ({disputes.length})</TabsTrigger>
                    <TabsTrigger value="returns">Returns ({returns.length})</TabsTrigger>
                    <TabsTrigger value="cancellations">Cancellations ({cancellations.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-4">
                    {renderDisputeTable(disputes)}
                </TabsContent>
                <TabsContent value="returns" className="mt-4">
                    {renderDisputeTable(returns)}
                </TabsContent>
                <TabsContent value="cancellations" className="mt-4">
                    {renderDisputeTable(cancellations)}
                </TabsContent>
            </Tabs>

            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Dispute Details - Order #{selectedDispute?.order?.orderNumber}</DialogTitle>
                        <DialogDescription>
                            Created on {selectedDispute && format(new Date(selectedDispute.createdAt), "PPP p")}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedDispute && (
                        <div className="space-y-6 pt-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <h4 className="font-semibold mb-1">Reason</h4>
                                    <p className="text-muted-foreground">{selectedDispute.reason}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Type</h4>
                                    <Badge variant={selectedDispute.type === 'CANCEL' ? 'destructive' : 'outline'}>
                                        {selectedDispute.type}
                                    </Badge>
                                </div>
                                <div className="col-span-2">
                                    <h4 className="font-semibold mb-1">Description</h4>
                                    <p className="text-muted-foreground whitespace-pre-wrap">{selectedDispute.description || "No description provided"}</p>
                                </div>
                            </div>

                            {/* Evidence Images */}
                            {selectedDispute.images && selectedDispute.images.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2">User Provided Evidence</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {selectedDispute.images.map((img: string, idx: number) => (
                                            <div key={idx} className="relative aspect-square rounded-md border overflow-hidden">
                                                <Image src={img} alt="Evidence" fill className="object-cover" unoptimized />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Decision Actions if Pending */}
                            {selectedDispute.status === 'PENDING' && (
                                <div className="flex gap-3 pt-4 border-t">
                                    <Button
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                        onClick={() => handleUpdateStatus(selectedDispute.id, DisputeStatus.APPROVED)}
                                    >
                                        Approve {selectedDispute.type === 'CANCEL' ? 'Cancellation' : 'Return'}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex-1"
                                        onClick={() => handleUpdateStatus(selectedDispute.id, DisputeStatus.REJECTED)}
                                    >
                                        Reject Request
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
