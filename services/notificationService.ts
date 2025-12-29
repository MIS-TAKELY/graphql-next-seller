import nodemailer from "nodemailer";

export async function sendEmailNotification(
    email: string,
    productName: string,
    productSlug: string
): Promise<void> {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const productUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://vanijay.com"}/product/${productSlug}`;

    await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: `${productName} is back in stock!`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f97316;">Good News!</h2>
        <p>The product you were waiting for is now back in stock:</p>
        <h3 style="color: #333;">${productName}</h3>
        <p>Don't miss out - grab it before it's gone again!</p>
        <a href="${productUrl}" style="display: inline-block; padding: 12px 24px; background-color: #f97316; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">
          View Product
        </a>
        <p style="margin-top: 24px; color: #666; font-size: 14px;">
          This is an automated notification. You requested to be notified when this product becomes available.
        </p>
      </div>
    `,
    });
}

export async function sendWhatsAppNotification(
    phone: string,
    productName: string,
    productSlug: string
): Promise<void> {
    // Placeholder for WhatsApp notification
    // Implement this with your WhatsApp Business API or service like Twilio
    const productUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://vanijay.com"}/product/${productSlug}`;

    console.log(`WhatsApp notification to ${phone}: ${productName} is back in stock! ${productUrl}`);

    // Example with Twilio (uncomment and configure):
    /*
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);
  
    await client.messages.create({
      body: `Good news! ${productName} is back in stock. Check it out: ${productUrl}`,
      from: 'whatsapp:+14155238886', // Twilio WhatsApp number
      to: `whatsapp:${phone}`
    });
    */
}
