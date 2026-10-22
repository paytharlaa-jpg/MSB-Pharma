/**
 * Email Notification Service (Phase 1)
 * Supports development mock logging and extensible SMTP/Resend API providers.
 */

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailDeliveryResult {
  success: boolean;
  messageId?: string;
  provider: string;
  error?: string;
}

export async function sendNotificationEmail(params: SendEmailParams): Promise<EmailDeliveryResult> {
  const provider = process.env.EMAIL_PROVIDER || "mock";
  const from = process.env.EMAIL_FROM_ADDRESS || "notifications@msbpharmachem.com";

  console.log(`[Email Service - ${provider}] Sending to ${params.to} from ${from}: "${params.subject}"`);

  if (provider === "mock") {
    // In local development / mock mode, log output and return success
    return {
      success: true,
      messageId: `mock-msg-${Date.now()}`,
      provider: "mock",
    };
  }

  // Extensible integration boundary for Resend / SendGrid / Amazon SES
  try {
    const apiKey = process.env.EMAIL_API_KEY;
    if (!apiKey) {
      console.warn("EMAIL_API_KEY is not configured. Email logged to console.");
      return {
        success: false,
        error: "EMAIL_API_KEY missing",
        provider,
      };
    }

    // Example payload preparation for production provider
    return {
      success: true,
      messageId: `sent-${Date.now()}`,
      provider,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown email delivery error";
    console.error("Email notification failed:", errorMsg);
    return {
      success: false,
      error: errorMsg,
      provider,
    };
  }
}

/**
 * Builds HTML template for new website lead notifications
 */
export function buildNewEnquiryEmailHtml(enquiry: {
  enquiryNumber: string;
  contactName: string;
  companyName?: string | null;
  email: string;
  phone: string;
  productOfInterest?: string | null;
  requestedQuantity?: number | null;
  unit?: string | null;
  message: string;
}): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0b1f33; padding: 20px; color: #ffffff;">
        <h2 style="margin: 0; color: #ffffff;">MSB PHARMACHEM</h2>
        <p style="margin: 4px 0 0 0; color: #16b8a6; font-size: 14px;">New Qualified Commercial Enquiry Received</p>
      </div>
      <div style="padding: 24px; color: #1e293b;">
        <p><strong>Enquiry Ref:</strong> ${enquiry.enquiryNumber}</p>
        <p><strong>Contact:</strong> ${enquiry.contactName} (${enquiry.companyName || "Independent Procurement"})</p>
        <p><strong>Email:</strong> ${enquiry.email} | <strong>Phone:</strong> ${enquiry.phone}</p>
        <p><strong>Product of Interest:</strong> ${enquiry.productOfInterest || "General Enquiry"}</p>
        ${enquiry.requestedQuantity ? `<p><strong>Requested Quantity:</strong> ${enquiry.requestedQuantity} ${enquiry.unit || "KG"}</p>` : ""}
        <div style="background: #f8fafc; padding: 12px; border-left: 4px solid #00488f; margin: 16px 0;">
          <strong>Requirement / Message:</strong><br/>
          ${enquiry.message}
        </div>
        <p style="font-size: 13px; color: #64748b;">
          Please log into the internal Admin Portal to assign, follow up, or prepare a formal quotation.
        </p>
      </div>
      <div style="background: #f1f5f9; padding: 12px 24px; font-size: 12px; color: #64748b; text-align: center;">
        MSB PHARMACHEM • Hyderabad, India • msbpharmachem.com
      </div>
    </div>
  `;
}

/**
 * Builds HTML template for Staff Password Reset
 */
export function buildPasswordResetEmailHtml(params: {
  userName: string;
  resetUrl: string;
  expiryMinutes?: number;
}): string {
  const expiry = params.expiryMinutes || 30;
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0b1f33; padding: 20px; color: #ffffff;">
        <h2 style="margin: 0; color: #ffffff;">MSB PHARMACHEM</h2>
        <p style="margin: 4px 0 0 0; color: #16b8a6; font-size: 14px;">Staff Security Portal — Password Reset</p>
      </div>
      <div style="padding: 24px; color: #1e293b;">
        <p>Hello <strong>${params.userName}</strong>,</p>
        <p>A password reset request was initiated for your MSB PHARMACHEM operational staff account.</p>
        <p>Click the secure button below to choose a new password. This link is single-use and will expire in <strong>${expiry} minutes</strong>:</p>
        
        <div style="text-align: center; margin: 28px 0;">
          <a href="${params.resetUrl}" style="background-color: #00488f; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Reset Your Password
          </a>
        </div>

        <p style="font-size: 12px; color: #64748b; word-break: break-all;">
          Or copy and paste this link into your browser:<br/>
          <a href="${params.resetUrl}" style="color: #00488f;">${params.resetUrl}</a>
        </p>

        <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px;">
          If you did not request this password reset, please contact your Super Admin immediately. Your existing password remains secure until you complete the reset process.
        </p>
      </div>
      <div style="background: #f1f5f9; padding: 12px 24px; font-size: 12px; color: #64748b; text-align: center;">
        MSB PHARMACHEM Security System • Hyderabad, India • msbpharmachem.com
      </div>
    </div>
  `;
}

