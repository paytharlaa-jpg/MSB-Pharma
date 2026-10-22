/**
 * WhatsApp Integration Service
 * Phase 1: Direct WhatsApp Click-to-Chat Link Generator
 * Phase 2: Meta Cloud API / WhatsApp Business Platform Integration Boundary
 */

const BUSINESS_PHONE = process.env.WHATSAPP_PHONE_NUMBER || "918008335333";

/**
 * Phase 1: Generates standard WhatsApp Click-to-Chat deep link
 * Encodes product inquiries directly for immediate client communication.
 */
export function getWhatsAppClickToChatUrl(params: {
  productName?: string;
  enquiryNumber?: string;
  customText?: string;
}): string {
  let message = "";
  if (params.customText) {
    message = params.customText;
  } else if (params.productName) {
    message = `Hello MSB PHARMACHEM, I am interested in inquiring about ${params.productName} (specifications, availability, and quotation).`;
  } else if (params.enquiryNumber) {
    message = `Hello MSB PHARMACHEM, I am referencing enquiry ${params.enquiryNumber}.`;
  } else {
    message = `Hello MSB PHARMACHEM, I would like to inquire regarding pharmaceutical APIs and raw material procurement.`;
  }

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${BUSINESS_PHONE}?text=${encodedMessage}`;
}

/**
 * Phase 2: Meta WhatsApp Cloud API Boundary
 * Ready for automated notifications when approved API credentials are provided.
 */
export interface WhatsAppApiPayload {
  to: string;
  templateName: string;
  languageCode?: string;
  components?: Array<{
    type: "header" | "body" | "button";
    parameters: Array<{
      type: "text" | "currency" | "date_time";
      text?: string;
    }>;
  }>;
}

export async function sendWhatsAppCloudMessage(payload: WhatsAppApiPayload): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    return {
      success: false,
      error: "WhatsApp Cloud API credentials not configured (Requires WHATSAPP_ACCESS_TOKEN & WHATSAPP_PHONE_NUMBER_ID in .env).",
    };
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: payload.to.replace(/\D/g, ""),
        type: "template",
        template: {
          name: payload.templateName,
          language: { code: payload.languageCode || "en" },
          components: payload.components || [],
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error?.message || "WhatsApp API error" };
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "WhatsApp request failure";
    return { success: false, error: msg };
  }
}
