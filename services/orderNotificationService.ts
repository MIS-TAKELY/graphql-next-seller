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
}

// Generate email HTML for order status updates
const generateOrderStatusEmail = (context: OrderEmailContext): string => {
    const statusMessages: Record<string, { title: string; message: string; color: string }> = {
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

    const statusInfo = statusMessages[context.status] || {
        title: "Order Update",
        message: `Your order status has been updated to ${context.status}`,
        color: "#6b7280",
    };

    const itemsList = context.items
        .map(
            (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.productName}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">NPR ${item.price.toFixed(2)}</td>
    </tr>
  `
        )
        .join("");

    const trackingInfo =
        context.trackingNumber && context.carrier
            ? `
    <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin: 0 0 8px 0; color: #374151; font-size: 16px;">Tracking Information</h3>
      <p style="margin: 4px 0; color: #6b7280;"><strong>Carrier:</strong> ${context.carrier}</p>
      <p style="margin: 4px 0; color: #6b7280;"><strong>Tracking Number:</strong> ${context.trackingNumber}</p>
    </div>
  `
            : "";

    return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, ${statusInfo.color} 0%, ${statusInfo.color}dd 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">${statusInfo.title}</h1>
      </div>
      
      <div style="background-color: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Hello ${context.buyerName},</p>
        
        <p style="font-size: 16px; color: #6b7280; margin-bottom: 24px;">${statusInfo.message}</p>
        
        <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Order Number</p>
          <p style="margin: 4px 0 0 0; color: #111827; font-size: 18px; font-weight: 600;">#${context.orderNumber}</p>
        </div>

        ${trackingInfo}
        
        <h3 style="color: #374151; font-size: 18px; margin: 24px 0 12px 0;">Order Details</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f9fafb;">
              <th style="padding: 12px; text-align: left; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Product</th>
              <th style="padding: 12px; text-align: center; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Qty</th>
              <th style="padding: 12px; text-align: right; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 16px 12px 12px 12px; text-align: right; font-weight: 600; color: #374151;">Total:</td>
              <td style="padding: 16px 12px 12px 12px; text-align: right; font-weight: 700; color: #111827; font-size: 18px;">NPR ${context.total}</td>
            </tr>
          </tfoot>
        </table>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${context.orderUrl}" style="display: inline-block; padding: 14px 32px; background-color: ${statusInfo.color}; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">View Order Details</a>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        
        <p style="color: #9ca3af; font-size: 14px; text-align: center; margin: 0;">
          Thank you for shopping with Vanijay!<br/>
          If you have any questions, please contact our support team.
        </p>
      </div>
    </div>
  `;
};

// Generate WhatsApp message for order status updates
const generateWhatsAppMessage = (orderDetails: OrderDetails): string => {
    const statusEmojis: Record<string, string> = {
        CONFIRMED: "✅",
        PROCESSING: "📦",
        SHIPPED: "🚚",
        DELIVERED: "🎉",
        CANCELLED: "❌",
    };

    const emoji = statusEmojis[orderDetails.status] || "📋";

    let message = `${emoji} *Order ${orderDetails.status}*\n\n`;
    message += `Hello ${orderDetails.buyerName},\n\n`;
    message += `Your order #${orderDetails.orderNumber} has been updated to *${orderDetails.status}*.\n\n`;

    if (orderDetails.trackingNumber && orderDetails.carrier) {
        message += `📍 *Tracking Information*\n`;
        message += `Carrier: ${orderDetails.carrier}\n`;
        message += `Tracking: ${orderDetails.trackingNumber}\n\n`;
    }

    message += `*Order Summary:*\n`;
    orderDetails.items.forEach((item, index) => {
        message += `${index + 1}. ${item.productName} (x${item.quantity}) - NPR ${item.price.toFixed(2)}\n`;
    });

    message += `\n*Total: NPR ${orderDetails.total.toFixed(2)}*\n\n`;
    message += `Thank you for shopping with Vanijay! 🛍️`;

    return message;
};

// Generate email HTML for return status updates
const generateReturnStatusEmail = (details: ReturnDetails): string => {
    const statusMessages: Record<string, { title: string; message: string; color: string }> = {
        APPROVED: {
            title: "Return Request Approved! ✅",
            message: "Your return request has been approved. Please prepare the items for pickup or shipment as per the instructions.",
            color: "#10b981",
        },
        REJECTED: {
            title: "Return Request Rejected ❌",
            message: `Your return request for order #${details.orderNumber} has been rejected by the seller.`,
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

    const statusInfo = statusMessages[details.status] || {
        title: "Return Update",
        message: `Your return request status has been updated to ${details.status}`,
        color: "#6b7280",
    };

    const itemsList = details.items
        .map(
            (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.productName}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
    </tr>
  `
        )
        .join("");

    const rejectionInfo = details.rejectionReason ? `
    <div style="background-color: #fef2f2; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #fecaca;">
      <h3 style="margin: 0 0 8px 0; color: #991b1b; font-size: 16px;">Rejection Reason</h3>
      <p style="margin: 4px 0; color: #b91c1c;">${details.rejectionReason}</p>
    </div>
  ` : "";

    return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, ${statusInfo.color} 0%, ${statusInfo.color}dd 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">${statusInfo.title}</h1>
      </div>
      
      <div style="background-color: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Hello ${details.buyerName},</p>
        
        <p style="font-size: 16px; color: #6b7280; margin-bottom: 24px;">${statusInfo.message}</p>
        
        <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
           <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <div>
              <p style="margin: 0; color: #6b7280; font-size: 12px;">Order Number</p>
              <p style="margin: 2px 0 0 0; color: #111827; font-size: 16px; font-weight: 600;">#${details.orderNumber}</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">Return Request ID</p>
              <p style="margin: 2px 0 0 0; color: #111827; font-size: 14px;">#${details.returnNumber}</p>
            </div>
          </div>
        </div>

        ${rejectionInfo}
        
        <h3 style="color: #374151; font-size: 18px; margin: 24px 0 12px 0;">Returned Items</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f9fafb;">
              <th style="padding: 12px; text-align: left; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Product</th>
              <th style="padding: 12px; text-align: center; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Qty</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
        </table>
        
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">Original Return Reason</h4>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">${details.reason}</p>
        </div>

        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        
        <p style="color: #9ca3af; font-size: 14px; text-align: center; margin: 0;">
          Thank you for shopping with Vanijay!<br/>
          If you have any questions, please contact our support team.
        </p>
      </div>
    </div>
  `;
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

/**
 * Send order status notification via email
 */
export const sendOrderEmailNotification = async (
    orderDetails: OrderDetails
): Promise<void> => {
    try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const orderUrl = `${appUrl}/orders/${orderDetails.orderNumber}`;

        const context: OrderEmailContext = {
            buyerName: orderDetails.buyerName,
            orderNumber: orderDetails.orderNumber,
            status: orderDetails.status,
            items: orderDetails.items,
            total: orderDetails.total.toFixed(2),
            trackingNumber: orderDetails.trackingNumber,
            carrier: orderDetails.carrier,
            orderUrl,
        };

        const emailHtml = generateOrderStatusEmail(context);
        const statusTitles: Record<string, string> = {
            CONFIRMED: "Order Confirmed",
            PROCESSING: "Order Processing",
            SHIPPED: "Order Shipped",
            DELIVERED: "Order Delivered",
            CANCELLED: "Order Cancelled",
        };

        const subject = `${statusTitles[orderDetails.status] || "Order Update"} - #${orderDetails.orderNumber}`;

        // Using the existing nodemailer transporter
        const nodemailer = require("nodemailer");
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: '"Vanijay" <mailitttome@gmail.com>',
            to: orderDetails.buyerEmail,
            subject,
            html: emailHtml,
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
        await sendOrderWhatsAppNotification(orderDetails);
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

    // Send email notification
    try {
        const emailHtml = generateReturnStatusEmail(details);
        const subject = `Return Request ${details.status} - Order #${details.orderNumber}`;

        const nodemailer = require("nodemailer");
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: '"Vanijay" <mailitttome@gmail.com>',
            to: details.buyerEmail,
            subject,
            html: emailHtml,
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
