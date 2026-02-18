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
            <div ref={ref} className="p-2 bg-white text-black w-[4in] mx-auto print:m-0 print:w-full print:shadow-none shadow-lg font-sans">
                {/* Header with QR and Barcode */}
                <div className="flex justify-between items-start mb-4 border-b-2 border-black pb-4">
                    <div className="space-y-2">
                        <h1 className="text-lg font-bold uppercase tracking-tight">Invoice / Receipt</h1>
                        <div className="space-y-0.5">
                            <p className="text-[8px] font-semibold text-gray-500 uppercase">Order Details</p>
                            <p className="text-sm font-mono leading-none">#{order.order.orderNumber}</p>
                            <p className="text-[10px] text-gray-600">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                            {order.order.shipments?.[0] && (
                                <div className="pt-1 mt-1 border-t border-gray-200">
                                    <p className="text-[8px] font-semibold text-gray-500 uppercase">Shipping Info</p>
                                    <p className="text-[10px] text-gray-800 leading-tight">
                                        <span className="font-semibold">Carrier:</span> {order.order.shipments[0].carrier || 'N/A'}
                                    </p>
                                    <p className="text-[10px] text-gray-800 leading-tight">
                                        <span className="font-semibold">Tracking:</span> {order.order.shipments[0].trackingNumber || 'N/A'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Payment Status Indicator - Black & White */}
                        <div className="mt-2">
                            {isPaid ? (
                                <div className="inline-block px-3 py-1 border-2 border-black text-black font-bold uppercase text-sm rounded">
                                    PAID
                                </div>
                            ) : isCOD ? (
                                <div className="inline-block px-2 py-0.5 border-2 border-black text-black font-bold uppercase text-[10px] rounded leading-tight">
                                    CASH ON DELIVERY<br />
                                    <span className="text-xs">TO COLLECT: {formatPrice(order.total)}</span>
                                </div>
                            ) : (
                                <div className="inline-block px-3 py-1 border-2 border-gray-400 text-gray-600 font-bold uppercase text-sm rounded">
                                    {payment?.status || 'PENDING'}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <QRCodeSVG value={order.order.orderNumber} size={60} level="H" />
                        <div className="transform scale-90 origin-right">
                            <Barcode value={order.order.orderNumber} height={20} fontSize={8} width={1.2} />
                        </div>
                    </div>
                </div>

                {/* Addresses Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                        <h3 className="text-[9px] font-bold text-gray-800 uppercase border-b border-black pb-0.5 leading-none">Sold By</h3>
                        <div className="text-[10px] space-y-0.5 leading-tight">
                            <p className="font-bold text-xs">{sellerProfile?.shopName || 'Vanijay Store'}</p>
                            {sellerProfile?.businessRegNo && (
                                <p className="text-[8px] font-mono text-gray-600">PAN/VAT: {sellerProfile.businessRegNo}</p>
                            )}
                            {sellerAddress ? (
                                <>
                                    <p>{sellerAddress.line1}</p>
                                    {sellerAddress.line2 && <p>{sellerAddress.line2}</p>}
                                    <p>{sellerAddress.city}, {sellerAddress.state}</p>
                                    <p>{sellerAddress.country} - {sellerAddress.postalCode}</p>
                                </>
                            ) : (
                                <p className="italic text-gray-400">Store address not available</p>
                            )}
                            <p>Ph: {sellerProfile?.phone || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-[9px] font-bold text-gray-800 uppercase border-b border-black pb-0.5 leading-none">Ship To</h3>
                        <div className="text-[10px] space-y-0.5 leading-tight">
                            <p className="font-bold text-xs">
                                {order.order.buyer
                                    ? `${order.order.buyer.firstName} ${order.order.buyer.lastName}`
                                    : 'Customer'}
                            </p>
                            {shippingAddress ? (
                                <>
                                    <p>{shippingAddress.line1}</p>
                                    {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
                                    <p>{shippingAddress.city}, {shippingAddress.state}</p>
                                    <p>{shippingAddress.country} - {shippingAddress.postalCode}</p>
                                    <p>Ph: {shippingAddress.phone}</p>
                                </>
                            ) : (
                                <p className="italic text-gray-400">Shipping address not available</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-4">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b-2 border-black text-left text-[9px] font-bold uppercase">
                                <th className="py-1">Description</th>
                                <th className="py-1 text-center">Qty</th>
                                <th className="py-1 text-right">Price</th>
                                <th className="py-1 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {order.items.map((item) => (
                                <tr key={item.id} className="text-[10px] leading-tight">
                                    <td className="py-1.5 pr-2">
                                        <p className="font-bold">{item.variant.product.name}</p>
                                        <p className="text-[8px] text-gray-600 font-mono">SKU: {item.variant.sku}</p>
                                        {item.variant.attributes && Object.entries(item.variant.attributes).length > 0 && (
                                            <p className="text-[8px] text-gray-500 uppercase">
                                                {Object.entries(item.variant.attributes)
                                                    .map(([key, value]) => `${key}: ${value}`)
                                                    .join(' | ')}
                                            </p>
                                        )}
                                    </td>
                                    <td className="py-1.5 text-center align-top">{item.quantity}</td>
                                    <td className="py-1.5 text-right align-top">{formatPrice(item.unitPrice)}</td>
                                    <td className="py-1.5 text-right align-top font-semibold">{formatPrice(item.totalPrice)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals Section */}
                <div className="flex justify-end mb-6">
                    <div className="w-48 space-y-1 border-t-2 border-black pt-1">
                        <div className="flex justify-between text-[10px]">
                            <span className="text-gray-600">Subtotal</span>
                            <span>{formatPrice(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                            <span className="text-gray-600">Shipping</span>
                            <span>{formatPrice(order.shippingFee)}</span>
                        </div>
                        <div className="flex justify-between text-[10px] border-b border-gray-300 pb-0.5">
                            <span className="text-gray-600">Tax</span>
                            <span>{formatPrice(order.tax)}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold pt-0.5">
                            <span>Total</span>
                            <span>{formatPrice(order.total)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-4 border-t border-black pt-2 text-center space-y-1">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
                        Thank you for shopping with Vanijay!
                    </p>
                    <div className="flex justify-center items-center gap-2">
                        <div className="px-1.5 py-0.5 bg-black text-white text-[8px] font-bold uppercase tracking-tighter">
                            Vanijay Receipt
                        </div>
                    </div>
                    <p className="text-[8px] text-gray-400">
                        This is a computer-generated document and does not require a signature.
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
