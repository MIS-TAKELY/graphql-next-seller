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
            <div ref={ref} className="p-2.5 bg-white text-black w-[4in] mx-auto print:m-0 print:w-full print:shadow-none shadow-lg font-sans leading-tight">
                {/* Header with QR and Barcode */}
                <div className="flex justify-between items-start mb-3 border-b-2 border-black pb-3">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">Invoice</h1>
                            <span className="text-gray-300">/</span>
                            <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">Receipt</h1>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-gray-500 uppercase leading-none">Order Details</p>
                                <p className="text-base font-mono font-bold leading-none">#{order.order.orderNumber}</p>
                                <p className="text-[10px] text-gray-700 font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            {order.order.shipments?.[0] && (
                                <div className="space-y-1 border-l-2 border-gray-100 pl-3">
                                    <p className="text-[9px] font-black text-gray-500 uppercase leading-none">Shipping</p>
                                    <p className="text-[10px] text-gray-900 leading-none"><span className="font-bold">Carrier:</span> {order.order.shipments[0].carrier || 'N/A'}</p>
                                    <p className="text-[10px] text-gray-900 leading-none truncate"><span className="font-bold">Trk:</span> {order.order.shipments[0].trackingNumber || 'N/A'}</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-2">
                            {isPaid ? (
                                <span className="px-2 py-1 bg-black text-white text-[10px] font-black uppercase rounded shadow-sm">PAID</span>
                            ) : isCOD ? (
                                <div className="inline-block px-2 py-1 border-2 border-black text-black font-black uppercase text-[9px] rounded shadow-sm">
                                    COD - TO COLLECT: {formatPrice(order.total)}
                                </div>
                            ) : (
                                <span className="px-2 py-1 border-2 border-gray-400 text-gray-600 text-[10px] font-black uppercase rounded">{payment?.status || 'PENDING'}</span>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 pr-4">
                        <QRCodeSVG value={order.order.orderNumber} size={65} level="M" />
                        <div className="transform scale-90 origin-right">
                            <Barcode value={order.order.orderNumber} height={20} fontSize={8} width={1.1} />
                        </div>
                    </div>
                </div>

                {/* Addresses Grid */}
                <div className="grid grid-cols-2 gap-4 mb-3 border-b-2 border-gray-100 pb-3">
                    <div className="space-y-1">
                        <h3 className="text-[9px] font-black text-gray-500 uppercase mb-1">Sold By</h3>
                        <div className="text-[10px] space-y-0.5 leading-tight">
                            <p className="font-black text-sm text-black">{sellerProfile?.shopName || 'Vanijay Store'}</p>
                            {sellerProfile?.businessRegNo && (
                                <p className="text-[8px] font-mono font-bold text-gray-600">PAN/VAT: {sellerProfile.businessRegNo}</p>
                            )}
                            {sellerAddress ? (
                                <div className="text-gray-800 font-medium">
                                    <p>{sellerAddress.line1}</p>
                                    {sellerAddress.line2 && <p>{sellerAddress.line2}</p>}
                                    <p>{sellerAddress.city}, {sellerAddress.state} - {sellerAddress.postalCode}</p>
                                </div>
                            ) : (
                                <p className="italic text-gray-400">Store address not available</p>
                            )}
                            <p className="font-bold text-black border-t border-gray-50 mt-1 pt-0.5">Ph: {sellerProfile?.phone || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="pl-4 border-l-2 border-gray-100 space-y-1">
                        <h3 className="text-[9px] font-black text-gray-500 uppercase mb-1">Ship To</h3>
                        <div className="text-[10px] space-y-0.5 leading-tight">
                            <p className="font-black text-sm text-black">
                                {order.order.buyer
                                    ? [order.order.buyer.firstName, order.order.buyer.lastName].filter(Boolean).join(' ')
                                    : 'Customer'}
                            </p>
                            {shippingAddress ? (
                                <div className="text-gray-800 font-medium">
                                    <p>{shippingAddress.line1}</p>
                                    {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
                                    <p>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postalCode}</p>
                                    <p className="font-black text-black border-t border-gray-50 mt-1 pt-0.5">
                                        Ph: {shippingAddress.phone || order.order.buyer?.phone || 'N/A'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <p className="italic text-gray-400">Address N/A</p>
                                    <p className="font-black text-black">Ph: {order.order.buyer?.phone || 'N/A'}</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-4">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b-2 border-black text-left text-[10px] font-black uppercase tracking-wider">
                                <th className="py-2">Description</th>
                                <th className="py-2 text-center w-12">Qty</th>
                                <th className="py-2 text-right w-24">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {order.items.map((item) => (
                                <tr key={item.id} className="text-[11px] leading-snug">
                                    <td className="py-2.5 pr-4">
                                        <p className="font-black text-black text-[13px] uppercase tracking-tight">{item.variant.product.name}</p>
                                        <div className="flex flex-col gap-0.5 mt-1">
                                            {item.variant.attributes && Object.entries(item.variant.attributes).length > 0 && (
                                                <p className="text-[9px] text-gray-700 font-bold uppercase">
                                                    Var: {Object.entries(item.variant.attributes).map(([k, v]) => `${k}:${v}`).join(' | ')}
                                                </p>
                                            )}
                                            <p className="text-[9px] text-gray-500 font-mono font-bold">SKU: {item.variant.sku}</p>
                                        </div>
                                    </td>
                                    <td className="py-2.5 text-center align-top font-black text-gray-800 text-[12px]">{item.quantity}</td>
                                    <td className="py-2.5 text-right align-top font-black text-black text-[12px]">{formatPrice(item.totalPrice)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals Section */}
                <div className="flex justify-end mb-6 pr-1">
                    <div className="w-40 space-y-1.5 border-t-2 border-black pt-2">
                        <div className="flex justify-between text-[11px] font-medium text-gray-600">
                            <span>Subtotal</span>
                            <span>{formatPrice(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-medium text-gray-600">
                            <span>Shipping</span>
                            <span>{formatPrice(order.shippingFee)}</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-medium text-gray-600 border-b border-gray-100 pb-1">
                            <span>Tax</span>
                            <span>{formatPrice(order.tax)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-black pt-1.5 text-black leading-none">
                            <span>TOTAL</span>
                            <span>{formatPrice(order.total)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-auto pt-6 text-center space-y-1">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-white px-3 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Vanijay Platform</span>
                        </div>
                    </div>
                    <p className="text-[11px] text-gray-800 font-black uppercase pt-1">
                        Thanks for shopping with us!
                    </p>
                    <p className="text-[8px] text-gray-400 italic">
                        Computer generated doc. No signature required.
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
