import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { senMail } from "./nodeMailer.services";

interface OrderDetails {
  orderNumber: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string | null;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: string;
  trackingNumber?: string;
  carrier?: string;
  cancellationReason?: string;
}

interface ReturnDetails {
  returnNumber: string;
  orderNumber: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string | null;
  items: Array<{
    productName: string;
    quantity: number;
    price: number; // Added price here as it might be needed
  }>;
  status: string;
  reason: string;
  rejectionReason?: string;
}

// Email template contexts
interface OrderEmailContext {
  buyerName: string;
  orderNumber: string;
  status: string;
  items: Array<{ productName: string; quantity: number; price: number }>;
  total: string;
  trackingNumber?: string;
  carrier?: string;
  orderUrl: string;
  cancellationReason?: string;
}

// Email status definitions
const orderStatusInfo: Record<string, { title: string; message: string; color: string }> = {
  CONFIRMED: {
    title: "Order Confirmed! 🎉",
    message: "Great news! Your order has been confirmed by the seller and will be processed soon.",
    color: "#10b981",
  },
  PROCESSING: {
    title: "Order Processing 📦",
    message: "Your order is now being prepared for shipment.",
    color: "#3b82f6",
  },
  SHIPPED: {
    title: "Order Shipped! 🚚",
    message: "Your order is on its way!",
    color: "#8b5cf6",
  },
  DELIVERED: {
    title: "Order Delivered! ✅",
    message: "Your order has been successfully delivered. We hope you enjoy your purchase!",
    color: "#059669",
  },
  CANCELLED: {
    title: "Order Cancelled ❌",
    message: "Your order has been cancelled by the seller.",
    color: "#ef4444",
  },
};

const returnStatusInfo: Record<string, { title: string; message: string; color: string }> = {
  APPROVED: {
    title: "Return Request Approved! ✅",
    message: "Your return request has been approved. Please prepare the items for pickup or shipment as per the instructions.",
    color: "#10b981",
  },
  REJECTED: {
    title: "Return Request Rejected ❌",
    message: "Your return request has been rejected by the seller.",
    color: "#ef4444",
  },
  CANCELLED: {
    title: "Return Request Cancelled 🚫",
    message: "Your return request has been cancelled.",
    color: "#6b7280",
  },
  ACCEPTED: {
    title: "Return Accepted! 🎉",
    message: "We have received and accepted your return. Your refund will be processed according to our policy.",
    color: "#059669",
  },
};

// Generate WhatsApp message for order status updates
export const generateWhatsAppMessage = (orderDetails: OrderDetails): string => {
  const statusEmojis: Record<string, string> = {
    CONFIRMED: "✅",
    PROCESSING: "📦",
    SHIPPED: "🚚",
    DELIVERED: "🎉",
    CANCELLED: "❌",
    RETURNED: "↩️",
  };

  const emoji = statusEmojis[orderDetails.status] || "📋";

  let message = `${emoji} *Order ${orderDetails.status}*\n\n`;
  message += `Hello ${orderDetails.buyerName},\n\n`;
  message += `Your order #${orderDetails.orderNumber} has been updated to *${orderDetails.status}*.\n\n`;

  if (orderDetails.cancellationReason) {
    message += `⚠️ *Cancellation Reason:* ${orderDetails.cancellationReason}\n\n`;
  }

  if (orderDetails.status === "SHIPPED" && orderDetails.trackingNumber && orderDetails.carrier) {
    message += `📍 *Tracking Information*\n`;
    message += `*Carrier:* ${orderDetails.carrier}\n`;
    message += `*Tracking ID:* ${orderDetails.trackingNumber}\n\n`;
    message += `You can track your package on the carrier's website.\n\n`;
  } else if (orderDetails.trackingNumber && orderDetails.carrier) {
    message += `📍 *Tracking Information*\n`;
    message += `Carrier: ${orderDetails.carrier}\n`;
    message += `Tracking: ${orderDetails.trackingNumber}\n\n`;
  }

  message += `*Order Summary:*\n`;
  orderDetails.items.forEach((item, index) => {
    message += `${index + 1}. ${item.productName} (x${item.quantity}) - रू ${item.price.toFixed(2)}\n`;
  });

  message += `\n*Total: रू ${orderDetails.total.toFixed(2)}*\n\n`;
  message += `Track your order at: https://www.vanijay.com/account/orders\n\n`;
  message += `Thank you for shopping with Vanijay! 🛍️`;

  return message;
};


// Generate WhatsApp message for return status updates
const generateReturnWhatsAppMessage = (details: ReturnDetails): string => {
  const statusEmojis: Record<string, string> = {
    APPROVED: "✅",
    REJECTED: "❌",
    CANCELLED: "🚫",
    ACCEPTED: "🎉",
  };

  const emoji = statusEmojis[details.status] || "📋";

  let message = `${emoji} *Return Request ${details.status}*\n\n`;
  message += `Hello ${details.buyerName},\n\n`;
  message += `The return request for order #${details.orderNumber} has been *${details.status}*.\n\n`;

  if (details.rejectionReason) {
    message += `❌ *Rejection Reason:* ${details.rejectionReason}\n\n`;
  }

  message += `*Items:*\n`;
  details.items.forEach((item, index) => {
    message += `${index + 1}. ${item.productName} (x${item.quantity})\n`;
  });

  message += `\n*Reason:* ${details.reason}\n\n`;
  message += `Thank you for shopping with Vanijay! 🛍️`;

  return message;
};

// Send order status notification via email
export const sendOrderEmailNotification = async (
  orderDetails: OrderDetails
): Promise<void> => {
  try {
    const statusInfo = orderStatusInfo[orderDetails.status] || {
      title: "Order Update",
      message: `Your order status has been updated to ${orderDetails.status}`,
      color: "#6b7280",
    };

    await senMail(orderDetails.buyerEmail, "ORDER_STATUS_UPDATE" as any, {
      ...statusInfo,
      buyerName: orderDetails.buyerName,
      orderNumber: orderDetails.orderNumber,
      items: orderDetails.items,
      total: orderDetails.total,
      trackingNumber: orderDetails.trackingNumber,
      carrier: orderDetails.carrier,
      cancellationReason: orderDetails.cancellationReason,
    });

    console.log(`✅ Order notification email sent to ${orderDetails.buyerEmail} for order #${orderDetails.orderNumber}`);
  } catch (error) {
    console.error("❌ Error sending order email notification:", error);
    throw error;
  }
};

/**
 * Send order status notification via WhatsApp
 */
export const sendOrderWhatsAppNotification = async (
  orderDetails: OrderDetails
): Promise<void> => {
  if (!orderDetails.buyerPhone) {
    console.log("⚠️ No phone number provided, skipping WhatsApp notification");
    return;
  }

  try {
    const message = generateWhatsAppMessage(orderDetails);
    await sendWhatsAppMessage(orderDetails.buyerPhone, message);
    console.log(`✅ Order notification WhatsApp sent to ${orderDetails.buyerPhone} for order #${orderDetails.orderNumber}`);
  } catch (error) {
    console.error("❌ Error sending order WhatsApp notification:", error);
    // Don't throw - WhatsApp is optional, email is primary
    console.log("⚠️ Continuing despite WhatsApp error (email notification still sent)");
  }
};

/**
 * Send both email and WhatsApp notifications for order status update
 */
export const sendOrderStatusNotifications = async (
  orderDetails: OrderDetails
): Promise<void> => {
  const errors: Error[] = [];

  // Send email notification
  try {
    await sendOrderEmailNotification(orderDetails);
  } catch (error) {
    console.error("Failed to send email notification:", error);
    errors.push(error as Error);
  }

  // Send WhatsApp notification (optional)
  try {
    // Skip WhatsApp for PROCESSING status as per user request
    if (orderDetails.status === "PROCESSING") {
      console.log(`ℹ️ Skipping WhatsApp notification for PROCESSING status for order #${orderDetails.orderNumber}`);
    } else {
      await sendOrderWhatsAppNotification(orderDetails);
    }
  } catch (error) {
    console.error("Failed to send WhatsApp notification:", error);
    // WhatsApp errors are logged but don't fail the entire operation
  }

  // If email failed, throw error (email is critical)
  if (errors.length > 0) {
    throw new Error(`Failed to send order notifications: ${errors.map(e => e.message).join(", ")}`);
  }
};

/**
 * Send return status notifications via Email and WhatsApp
 */
export const sendReturnNotifications = async (
  details: ReturnDetails
): Promise<void> => {
  const errors: Error[] = [];

  // Send return status notification via email
  try {
    const info = returnStatusInfo[details.status] || {
      title: "Return Update",
      message: `Your return request status has been updated to ${details.status}`,
      color: "#6b7280",
    };

    await senMail(details.buyerEmail, "RETURN_STATUS_UPDATE" as any, {
      ...info,
      buyerName: details.buyerName,
      orderNumber: details.orderNumber,
      returnNumber: details.returnNumber,
      status: details.status,
      rejectionReason: details.rejectionReason,
    });

    console.log(`✅ Return notification email sent to ${details.buyerEmail} for return #${details.returnNumber}`);
  } catch (error) {
    console.error("Failed to send return email notification:", error);
    errors.push(error as Error);
  }

  // Send WhatsApp notification
  try {
    if (details.buyerPhone) {
      const message = generateReturnWhatsAppMessage(details);
      await sendWhatsAppMessage(details.buyerPhone, message);
      console.log(`✅ Return notification WhatsApp sent to ${details.buyerPhone} for return #${details.returnNumber}`);
    }
  } catch (error) {
    console.error("Failed to send return WhatsApp notification:", error);
  }

  if (errors.length > 0) {
    throw new Error(`Failed to send return notifications: ${errors.map(e => e.message).join(", ")}`);
  }
};
