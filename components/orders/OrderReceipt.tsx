// components/orders/OrderReceipt.tsx
'use client';

import React, { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';
import { SellerOrder, AddressSnapshot } from '@/types/pages/order.types';
import { Separator } from '@/components/ui/separator';

interface OrderReceiptProps {
    order: SellerOrder;
    sellerProfile?: any;
}

export const OrderReceipt = forwardRef<HTMLDivElement, OrderReceiptProps>(
    ({ order, sellerProfile }, ref) => {
        const formatPrice = (amount: number | string | undefined | null) => {
            if (amount === undefined || amount === null) return 'N/A';
            const value = typeof amount === 'number' ? amount : parseFloat(amount);
            return isNaN(value) ? 'N/A' : `रू ${value.toLocaleString()}`;
        };

        const parseAddress = (address: any): AddressSnapshot | null => {
            if (!address) return null;
            if (typeof address === 'string') {
                try {
                    return JSON.parse(address);
                } catch (e) {
                    return null;
                }
            }
            return address;
        };

        const shippingAddress = parseAddress(order.order.shippingSnapshot);
        const sellerAddress = sellerProfile?.address;

        // Check payment status
        const payment = order.order.payments?.[0];
        const isCOD = payment?.provider === 'COD';
        const isPaid = payment?.status === 'COMPLETED';

        return (
            <div ref={ref} className="p-1.5 bg-white text-black w-[4in] mx-auto print:m-0 print:w-full print:shadow-none shadow-lg font-sans leading-none">
                {/* Header with QR and Barcode */}
                <div className="flex justify-between items-start mb-2 border-b-2 border-black pb-2">
                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold uppercase tracking-tighter leading-none">Invoice</h1>
                            <span className="text-gray-400">/</span>
                            <h1 className="text-xl font-bold uppercase tracking-tighter leading-none">Receipt</h1>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-0.5">
                                <p className="text-[7px] font-bold text-gray-500 uppercase">Order #</p>
                                <p className="text-xs font-mono font-bold">#{order.order.orderNumber}</p>
                                <p className="text-[9px] text-gray-600 font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            {order.order.shipments?.[0] && (
                                <div className="space-y-0.5 border-l border-gray-200 pl-2">
                                    <p className="text-[7px] font-bold text-gray-500 uppercase">Shipping</p>
                                    <p className="text-[9px] text-gray-800"><span className="font-semibold">C:</span> {order.order.shipments[0].carrier || 'N/A'}</p>
                                    <p className="text-[9px] text-gray-800"><span className="font-semibold">T:</span> {order.order.shipments[0].trackingNumber || 'N/A'}</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-1">
                            {isPaid ? (
                                <span className="px-1.5 py-0.5 border border-black text-[9px] font-black uppercase rounded">PAID</span>
                            ) : isCOD ? (
                                <div className="inline-block px-1.5 py-0.5 border border-black text-black font-black uppercase text-[8px] rounded">
                                    COD - TO COLLECT: {formatPrice(order.total)}
                                </div>
                            ) : (
                                <span className="px-1.5 py-0.5 border border-gray-400 text-gray-600 text-[9px] font-bold uppercase rounded">{payment?.status || 'PENDING'}</span>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <QRCodeSVG value={order.order.orderNumber} size={50} level="M" />
                        <div className="transform scale-75 origin-right -mt-1">
                            <Barcode value={order.order.orderNumber} height={15} fontSize={7} width={1} />
                        </div>
                    </div>
                </div>

                {/* Addresses Grid */}
                <div className="grid grid-cols-2 gap-2 mb-2 border-b border-gray-100 pb-2">
                    <div>
                        <h3 className="text-[8px] font-black text-gray-500 uppercase mb-0.5">Sold By</h3>
                        <div className="text-[9px] space-y-0 leading-tight">
                            <p className="font-bold text-black">{sellerProfile?.shopName || 'Vanijay Store'}</p>
                            {sellerAddress ? (
                                <p className="text-gray-600">{sellerAddress.line1}, {sellerAddress.city}</p>
                            ) : (
                                <p className="italic text-gray-400">Address N/A</p>
                            )}
                            <p className="text-gray-600">Ph: {sellerProfile?.phone || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="pl-2 border-l border-gray-100">
                        <h3 className="text-[8px] font-black text-gray-500 uppercase mb-0.5">Ship To</h3>
                        <div className="text-[9px] space-y-0 leading-tight">
                            <p className="font-bold text-black"> {order.order.buyer ? `${order.order.buyer.firstName} ${order.order.buyer.lastName}` : 'Customer'}</p>
                            {shippingAddress ? (
                                <>
                                    <p className="text-gray-600">{shippingAddress.line1}, {shippingAddress.city}</p>
                                    <p className="text-gray-600">Ph: {shippingAddress.phone}</p>
                                </>
                            ) : (
                                <p className="italic text-gray-400">Address N/A</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-2">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-black text-left text-[8px] font-black uppercase">
                                <th className="py-1">Items</th>
                                <th className="py-1 text-center">Qty</th>
                                <th className="py-1 text-right">Amt</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {order.items.map((item) => (
                                <tr key={item.id} className="text-[9px] leading-tight">
                                    <td className="py-1 pr-2">
                                        <p className="font-bold text-black">{item.variant.product.name}</p>
                                        <p className="text-[7px] text-gray-500 font-mono">SKU: {item.variant.sku}</p>
                                    </td>
                                    <td className="py-1 text-center align-top">{item.quantity}</td>
                                    <td className="py-1 text-right align-top font-bold">{formatPrice(item.totalPrice)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals Section */}
                <div className="flex justify-end mb-4 pr-1">
                    <div className="w-32 space-y-0.5 border-t-2 border-black pt-1">
                        <div className="flex justify-between text-[9px]">
                            <span className="text-gray-500">Sub</span>
                            <span>{formatPrice(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-[9px]">
                            <span className="text-gray-500">Ship</span>
                            <span>{formatPrice(order.shippingFee)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-black pt-1 border-t border-gray-100">
                            <span>TOTAL</span>
                            <span>{formatPrice(order.total)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-2 text-center space-y-0.5">
                    <p className="text-[8px] text-gray-400 font-bold uppercase py-1 border-y border-gray-100">
                        Thanks for shopping with Vanijay!
                    </p>
                    <p className="text-[6px] text-gray-300">
                        Computer generated receipt. No signature required.
                    </p>
                </div>

                <style jsx global>{`
          @media print {
            body { margin: 0; padding: 0; background: white; }
            @page { 
              size: 4in 6in; 
              margin: 0; 
            }
            .print-hide { display: none !important; }
            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        `}</style>
            </div>
        );
    }
);

OrderReceipt.displayName = 'OrderReceipt';
