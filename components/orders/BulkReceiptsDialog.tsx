'use client';

import React, { useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';
import { SellerOrder } from '@/types/pages/order.types';
import { OrderReceipt } from './OrderReceipt';
import { useReactToPrint } from 'react-to-print';
import { useQuery } from '@apollo/client';
import { GET_MY_SELLER_PROFILE } from '@/client/sellerProfile/sellerProfile.queries';

interface BulkReceiptsDialogProps {
    orders: SellerOrder[];
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function BulkReceiptsDialog({ orders, isOpen, onOpenChange }: BulkReceiptsDialogProps) {
    const printRef = useRef<HTMLDivElement>(null);
    const { data: profileData } = useQuery(GET_MY_SELLER_PROFILE);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Bulk_Receipts_${new Date().toISOString().split('T')[0]}`,
    });

    if (orders.length === 0) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] lg:max-w-5xl h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-4 sm:p-6 border-b flex flex-row items-center justify-between space-y-0">
                    <div>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            Print Bulk Receipts
                            <span className="text-sm font-normal text-muted-foreground ml-2">
                                ({orders.length} orders selected)
                            </span>
                        </DialogTitle>
                        <DialogDescription>
                            Preview and print receipts for all selected orders.
                        </DialogDescription>
                    </div>
                    <div className="flex items-center gap-2 pr-8">
                        <Button onClick={() => handlePrint()} className="shadow-lg">
                            <Printer className="mr-2 h-4 w-4" />
                            Print All
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto bg-muted/30 p-4 sm:p-8">
                    <div ref={printRef} className="space-y-8 flex flex-col items-center">
                        {orders.map((order, index) => (
                            <div
                                key={order.id}
                                className="receipt-container relative bg-white shadow-xl mb-8 last:mb-0"
                                style={{
                                    pageBreakAfter: 'always',
                                    breakAfter: 'page',
                                    width: 'fit-content'
                                }}
                            >
                                <div className="absolute -top-3 -left-3 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded shadow-md print:hidden">
                                    #{index + 1}
                                </div>
                                <OrderReceipt
                                    order={order}
                                    sellerProfile={profileData?.meSellerProfile}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <style jsx global>{`
          @media print {
            .receipt-container {
              box-shadow: none !important;
              margin: 0 !important;
              padding: 0 !important;
              page-break-after: always !important;
              break-after: page !important;
            }
            body { 
              background: white !important; 
            }
          }
        `}</style>
            </DialogContent>
        </Dialog>
    );
}
