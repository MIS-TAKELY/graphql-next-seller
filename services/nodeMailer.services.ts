import nodemailer from "nodemailer";
import path from "path";

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log("NODEMAILER: Transporter connection error:", error);
  } else {
    console.log("NODEMAILER: Server is ready to take our messages");
  }
});


type TemplateContext = {
  url?: string;
  name?: string;
  [key: string]: any;
};

type EmailTemplate = {
  subject: string;
  text: (context: TemplateContext) => string;
  html: (context: TemplateContext) => string;
};

const getEmailLayout = (content: string, subject: string) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vanijay.com";
  const logoUrl = `cid:logo`;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f7; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .header { padding: 30px; text-align: center; background-color: #ffffff; border-bottom: 1px solid #f0f0f0; }
        .logo { max-width: 150px; height: auto; }
        .content { padding: 40px 30px; }
        .footer { padding: 30px; background-color: #f8f9fa; color: #6c757d; font-size: 13px; text-align: center; border-top: 1px solid #eeeeee; }
        .social-links { margin-bottom: 20px; }
        .social-links a { display: inline-block; margin: 0 10px; color: #6c757d; text-decoration: none; }
        .social-links img { width: 24px; height: 24px; }
        .footer-links { margin-bottom: 15px; }
        .footer-links a { color: #007bff; text-decoration: none; margin: 0 8px; }
        .legal { font-size: 11px; color: #adb5bd; margin-top: 20px; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #007bff !important; color: #ffffff !important; text-decoration: none !important; border-radius: 5px; font-weight: 600; margin: 20px 0; }
        .otp-code { display: inline-block; padding: 15px 30px; background-color: #f8f9fa; color: #333; font-size: 32px; letter-spacing: 8px; font-weight: bold; border-radius: 8px; border: 1px solid #ddd; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logoUrl}" alt="Vanijay" class="logo">
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <div class="social-links">
            <a href="https://www.facebook.com/VanijayEnterprises" title="Facebook"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="FB"></a>
            <a href="https://www.instagram.com/vanijay_enterprises" title="Instagram"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="IG"></a>
            <a href="https://x.com/Vanijay_Ent" title="X"><img src="https://cdn-icons-png.flaticon.com/512/3256/3256013.png" alt="X"></a>
            <a href="https://www.tiktok.com/@vanijay_enterprises" title="TikTok"><img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" alt="TikTok"></a>
          </div>
          <div class="footer-links">
            <a href="${appUrl}/contact">Contact Us</a> | 
            <a href="${appUrl}/returns-policy">Returns</a> | 
            <a href="${appUrl}/shipping-policy">Shipping</a>
          </div>
          <p>&copy; ${new Date().getFullYear()} Vanijay. All rights reserved.</p>
          <p class="legal">
            This is an automatically generated email. Please do not reply to this email.<br>
            If you have any questions, visit our Help Center.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const TEMPLATES: Record<string, EmailTemplate> = {
  VERIFICATION: {
    subject: "Verify your email - Vanijay",
    text: (ctx) => `Please verify your email by clicking on this link: ${ctx.url}`,
    html: (ctx) => getEmailLayout(`
        <h2 style="color: #333; margin-top: 0;">Welcome to Vanijay!</h2>
        <p>Hello ${ctx.name || 'there'},</p>
        <p>Thank you for joining Vanijay Seller Central. To get started, please verify your email address by clicking the button below:</p>
        <div style="text-align: center;">
          <a href="${ctx.url}" class="btn">Verify Email Address</a>
        </div>
        <p style="color: #666; font-size: 0.9em; margin-top: 30px;">If you didn't request this, you can safely ignore this email.</p>
        <p style="color: #999; font-size: 0.8em; word-break: break-all;">Or copy and paste this link: <br/><a href="${ctx.url}">${ctx.url}</a></p>
    `, "Verify your email - Vanijay"),
  },
  VERIFICATION_OTP: {
    subject: "Your Verification Code - Vanijay",
    text: (ctx) => `Your verification code is: ${ctx.otp}`,
    html: (ctx) => getEmailLayout(`
        <h2 style="color: #333; margin-top: 0;">Verification Code</h2>
        <p>Hello ${ctx.name || 'there'},</p>
        <p>Your verification code for Vanijay Seller Central is:</p>
        <div style="text-align: center;">
          <span class="otp-code">${ctx.otp}</span>
        </div>
        <p style="color: #666; font-size: 0.9em; margin-top: 30px;">This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
    `, "Your Verification Code - Vanijay"),
  },
  PASSWORD_RESET: {
    subject: "Reset your password - Vanijay",
    text: (ctx) => `You requested a password reset. Use this link: ${ctx.url}`,
    html: (ctx) => getEmailLayout(`
        <h2 style="color: #333; margin-top: 0;">Password Reset</h2>
        <p>Hello,</p>
        <p>You recently requested to reset your password for your Vanijay Seller account. Click the button below to proceed:</p>
        <div style="text-align: center;">
          <a href="${ctx.url}" class="btn" style="background-color: #dc3545 !important;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 0.9em; margin-top: 30px;">This link will expire soon. If you didn't request a password reset, please ignore this email.</p>
    `, "Reset your password - Vanijay"),
  },
  PASSWORD_RESET_OTP: {
    subject: "Your Password Reset Code - Vanijay",
    text: (ctx) => `Your password reset code is: ${ctx.otp}`,
    html: (ctx) => getEmailLayout(`
        <h2 style="color: #333; margin-top: 0;">Password Reset Code</h2>
        <p>Hello ${ctx.name || 'there'},</p>
        <p>You recently requested to reset your password for your Vanijay Seller account. Your 6-digit verification code is:</p>
        <div style="text-align: center;">
          <span class="otp-code">${ctx.otp}</span>
        </div>
        <p style="color: #666; font-size: 0.9em; margin-top: 30px;">This code will expire in 10 minutes. If you didn't request a password reset, please ignore this email.</p>
    `, "Your Password Reset Code - Vanijay"),
  },
};

export const senMail = async (
  receiverEmail: string,
  templateKey: keyof typeof TEMPLATES,
  context: TemplateContext
) => {
  console.log("---------------- SENMAIL CALLED ----------------");
  try {
    const template = TEMPLATES[templateKey];
    if (!template) {
      throw new Error(`Template "${templateKey}" not found`);
    }

    console.log(`NODEMAILER: Attempting to send ${templateKey} email to:`, receiverEmail);

    const info = await transporter.sendMail({
      from: '"Vanijay" <mailitttome@gmail.com>',
      to: receiverEmail,
      subject: template.subject,
      text: template.text(context),
      html: template.html(context),
      attachments: [
        {
          filename: 'logo.png',
          path: path.join(process.cwd(), 'public', 'final_blue_text_logo_500by500.png'),
          cid: 'logo'
        }
      ]
    });

    console.log("NODEMAILER: Message sent successfully:", info.messageId);
    return info;
  } catch (error: any) {
    console.error("NODEMAILER: Error while sending email:", error.message);
    if (error.stack) console.error(error.stack);
    throw error;
  }
};
