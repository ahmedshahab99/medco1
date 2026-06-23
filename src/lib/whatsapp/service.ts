import type { SendTemplateParams, SendTemplateResult } from "./types";

const WHATSAPP_API_BASE = "https://graph.facebook.com/v25.0";

function getEnv() {
  const token = process.env.USER_ACCESS_TOKEN_WHATSAPP;
  const phoneNumberId = process.env.PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    throw new Error(
      "WhatsApp env vars missing: USER_ACCESS_TOKEN_WHATSAPP, PHONE_NUMBER_ID"
    );
  }

  return { token, phoneNumberId };
}

export async function sendWhatsAppTemplateMessage(
  params: SendTemplateParams
): Promise<SendTemplateResult> {
  const { token, phoneNumberId } = getEnv();

  const url = `${WHATSAPP_API_BASE}/${phoneNumberId}/messages`;

  const body = {
    messaging_product: "whatsapp",
    to: params.toPhone,
    type: "template",
    template: {
      name: params.templateName,
      language: { code: params.languageCode },
      components: [
        {
          type: "body",
          parameters: params.parameters,
        },
      ],
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const json = await response.json();

    if (!response.ok) {
      const errorDetail =
        json?.error?.message ?? json?.error?.error_user_msg ?? "Unknown error";
      console.error("[WhatsApp API] Error:", JSON.stringify(json));
      return { success: false, error: errorDetail };
    }

    const externalId = json?.messages?.[0]?.id;

    if (!externalId) {
      return { success: false, error: "No message ID in response" };
    }

    return { success: true, externalId };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Network request failed";
    console.error("[WhatsApp API] Request failed:", message);
    return { success: false, error: message };
  }
}
