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
        const sellerAddress = sellerProfile?.address;

        // Check payment status
        const payment = order.order.payments?.[0];
        const isCOD = payment?.provider === 'COD';
        const isPaid = payment?.status === 'COMPLETED';

        return (
            <div ref={ref} className="p-4 sm:p-6 bg-white text-black w-[210mm] mx-auto print:m-0 print:w-full print:shadow-none shadow-lg">
                {/* Header with QR and Barcode */}
                <div className="flex justify-between items-start mb-4 border-b pb-4">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold uppercase tracking-tight">Invoice / Receipt</h1>
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-semibold text-gray-500 uppercase">Order Details</p>
                            <p className="text-base font-mono">#{order.order.orderNumber}</p>
                            <p className="text-xs text-gray-600">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>

                        {/* Payment Status Indicator */}
                        <div className="mt-2">
                            {isPaid ? (
                                <div className="inline-block px-3 py-1 border-2 border-green-600 text-green-600 font-bold uppercase text-sm rounded shadow-sm">
                                    PAID
                                </div>
                            ) : isCOD ? (
                                <div className="inline-block px-3 py-1 border-2 border-blue-600 text-blue-600 font-bold uppercase text-xs rounded shadow-sm">
                                    CASH ON DELIVERY<br />
                                    <span className="text-sm">TO COLLECT: {formatPrice(order.total)}</span>
                                </div>
                            ) : (
                                <div className="inline-block px-3 py-1 border-2 border-orange-600 text-orange-600 font-bold uppercase text-sm rounded shadow-sm">
                                    {payment?.status || 'PENDING'}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <QRCodeSVG value={order.order.orderNumber} size={80} level="H" />
                        <div className="transform scale-75 origin-right -mr-4">
                            <Barcode value={order.order.orderNumber} height={30} fontSize={10} width={1.5} />
                        </div>
                    </div>
                </div>

                {/* Addresses Grid */}
                <div className="grid grid-cols-2 gap-8 mb-6">
                    <div className="space-y-1">
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase border-b pb-0.5">Sold By</h3>
                        <div className="text-xs space-y-0.5">
                            <p className="font-bold text-sm">{sellerProfile?.shopName || 'Vanijay Store'}</p>
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
                            <p className="pt-0.5">Phone: {sellerProfile?.phone || 'N/A'}</p>
                            <p>Email: {sellerProfile?.email || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase border-b pb-0.5">Ship To</h3>
                        <div className="text-xs space-y-0.5">
                            <p className="font-bold text-sm">
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
                                    <p className="pt-0.5">Phone: {shippingAddress.phone}</p>
                                </>
                            ) : (
                                <p className="italic text-gray-400">Shipping address not available</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-6">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b-2 border-gray-800 text-left text-[10px] font-bold uppercase">
                                <th className="py-2">Product Description</th>
                                <th className="py-2 text-center">Qty</th>
                                <th className="py-2 text-right">Unit Price</th>
                                <th className="py-2 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {order.items.map((item) => (
                                <tr key={item.id} className="text-xs">
                                    <td className="py-2">
                                        <p className="font-bold">{item.variant.product.name}</p>
                                        <p className="text-[10px] text-gray-600">SKU: {item.variant.sku}</p>
                                        {item.variant.attributes && Object.entries(item.variant.attributes).length > 0 && (
                                            <p className="text-[10px] text-gray-500">
                                                {Object.entries(item.variant.attributes)
                                                    .map(([key, value]) => `${key}: ${value}`)
                                                    .join(' | ')}
                                            </p>
                                        )}
                                    </td>
                                    <td className="py-2 text-center">{item.quantity}</td>
                                    <td className="py-2 text-right">{formatPrice(item.unitPrice)}</td>
                                    <td className="py-2 text-right font-semibold">{formatPrice(item.totalPrice)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals Section */}
                <div className="flex justify-end mb-8">
                    <div className="w-64 space-y-1.5 border-t pt-1.5">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Subtotal</span>
                            <span>{formatPrice(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Shipping</span>
                            <span>{formatPrice(order.shippingFee)}</span>
                        </div>
                        <div className="flex justify-between text-xs border-b pb-1">
                            <span className="text-gray-600">Tax</span>
                            <span>{formatPrice(order.tax)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-1">
                            <span>Total</span>
                            <span>{formatPrice(order.total)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 border-t pt-4 text-center space-y-2">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
                        Thank you for shopping with us!
                    </p>
                    <div className="flex justify-center items-center gap-2">
                        <div className="px-2 py-0.5 bg-black text-white text-[8px] font-bold uppercase tracking-tighter">
                            {sellerProfile?.shopName || 'Vanijay Store Receipt'}
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
              size: A4; 
              margin: 15mm; 
            }
            .print-hide { display: none !important; }
            * { -webkit-print-color-adjust: exact; }
          }
        `}</style>
            </div>
        );
    }
);

OrderReceipt.displayName = 'OrderReceipt';
