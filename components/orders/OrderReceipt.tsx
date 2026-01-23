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
            return isNaN(value) ? 'N/A' : `NPR ${value.toLocaleString()}`;
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
        const sellerAddress = sellerProfile?.pickupAddress;

        return (
            <div ref={ref} className="p-8 bg-white text-black min-h-[297mm] w-[210mm] mx-auto print:m-0 print:w-full print:shadow-none shadow-lg">
                {/* Header with QR and Barcode */}
                <div className="flex justify-between items-start mb-8 border-b pb-6">
                    <div className="space-y-4">
                        <h1 className="text-3xl font-bold uppercase tracking-tight">Invoice / Receipt</h1>
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-gray-500 uppercase">Order Details</p>
                            <p className="text-lg font-mono">#{order.order.orderNumber}</p>
                            <p className="text-sm text-gray-600">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-4">
                        <QRCodeSVG value={order.order.orderNumber} size={100} level="H" />
                        <div className="transform scale-75 origin-right">
                            <Barcode value={order.order.orderNumber} height={40} fontSize={14} />
                        </div>
                    </div>
                </div>

                {/* Addresses Grid */}
                <div className="grid grid-cols-2 gap-12 mb-10">
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-500 uppercase border-b pb-1">Sold By</h3>
                        <div className="text-sm space-y-1">
                            <p className="font-bold text-base">{sellerProfile?.shopName || 'Our Store'}</p>
                            {sellerAddress ? (
                                <>
                                    <p>{sellerAddress.line1}</p>
                                    {sellerAddress.line2 && <p>{sellerAddress.line2}</p>}
                                    <p>{sellerAddress.city}, {sellerAddress.state}</p>
                                    <p>{sellerAddress.country} - {sellerAddress.postalCode}</p>
                                </>
                            ) : (
                                <p className="italic">Seller address not available</p>
                            )}
                            <p className="pt-1">Phone: {sellerProfile?.phone || 'N/A'}</p>
                            <p>Email: {sellerProfile?.email || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-500 uppercase border-b pb-1">Ship To</h3>
                        <div className="text-sm space-y-1">
                            <p className="font-bold text-base">
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
                                    <p className="pt-1">Phone: {shippingAddress.phone}</p>
                                </>
                            ) : (
                                <p className="italic">Shipping address not available</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-10">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b-2 border-gray-800 text-left text-sm font-bold uppercase">
                                <th className="py-3">Product Description</th>
                                <th className="py-3 text-center">Qty</th>
                                <th className="py-3 text-right">Unit Price</th>
                                <th className="py-3 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {order.items.map((item) => (
                                <tr key={item.id} className="text-sm">
                                    <td className="py-4">
                                        <p className="font-bold">{item.variant.product.name}</p>
                                        <p className="text-xs text-gray-600">SKU: {item.variant.sku}</p>
                                        {item.variant.attributes && Object.entries(item.variant.attributes).length > 0 && (
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {Object.entries(item.variant.attributes)
                                                    .map(([key, value]) => `${key}: ${value}`)
                                                    .join(' | ')}
                                            </p>
                                        )}
                                    </td>
                                    <td className="py-4 text-center">{item.quantity}</td>
                                    <td className="py-4 text-right">{formatPrice(item.unitPrice)}</td>
                                    <td className="py-4 text-right font-semibold">{formatPrice(item.totalPrice)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-12">
                    <div className="w-64 space-y-2 border-t pt-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span>{formatPrice(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Shipping</span>
                            <span>{formatPrice(order.shippingFee)}</span>
                        </div>
                        <div className="flex justify-between text-sm border-b pb-2">
                            <span className="text-gray-600">Tax</span>
                            <span>{formatPrice(order.tax)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold pt-2">
                            <span>Total</span>
                            <span>{formatPrice(order.total)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-auto pt-10 border-t text-center space-y-4">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
                        Thank you for shopping with us!
                    </p>
                    <div className="flex justify-center items-center gap-2">
                        <div className="px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-tighter">
                            {sellerProfile?.shopName || 'Store Receipt'}
                        </div>
                    </div>
                    <p className="text-[10px] text-gray-400">
                        This is a computer-generated document and does not require a signature.
                    </p>
                </div>

                <style jsx global>{`
          @media print {
            body { margin: 0; padding: 0; }
            @page { size: auto; margin: 10mm; }
            .print-hide { display: none !important; }
          }
        `}</style>
            </div>
        );
    }
);

OrderReceipt.displayName = 'OrderReceipt';
