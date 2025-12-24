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

export default function DisputesClient() {
    const { data, loading, error, refetch } = useQuery(GET_SELLER_DISPUTES, {
        variables: { limit: 10, offset: 0 },
    });

    const [updateStatus] = useMutation(UPDATE_DISPUTE_STATUS, {
        onCompleted: () => {
            toast.success('Dispute status updated');
            refetch();
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

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Returns & Disputes</h2>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order #</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {disputes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                    No disputes found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            disputes.map((dispute) => (
                                <TableRow key={dispute.id}>
                                    <TableCell className="font-medium">
                                        {dispute.order?.orderNumber}
                                    </TableCell>
                                    <TableCell>
                                        {dispute.user?.firstName} {dispute.user?.lastName}
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
                                        {new Intl.DateTimeFormat('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        }).format(new Date(dispute.createdAt))}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
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
        </div>
    );
}
