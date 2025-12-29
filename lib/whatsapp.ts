export async function sendWhatsAppMessage(phone: string, message: string) {
  const wppConnectUrl = process.env.WPP_CONNECT;
  if (!wppConnectUrl) {
    console.error("❌ WPP_CONNECT URL is missing");
    throw new Error("WhatsApp provider URL is not configured");
  }

  try {
    const response = await fetch(wppConnectUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: phone.toString(),
        message,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`❌ WhatsApp API error (${response.status}):`, errorData);

      let errorMessage = "Failed to send WhatsApp message";
      try {
        const parsed = JSON.parse(errorData);
        errorMessage = parsed.details || parsed.error || errorMessage;
      } catch (e) {
        errorMessage = errorData || errorMessage;
      }

      throw new Error(errorMessage);
    }

    console.log(`✅ WhatsApp OTP sent successfully to ${phone}`);
    return response.json();
  } catch (error: any) {
    console.error(
      "❌ Network or Server error sending WhatsApp:",
      error.message
    );
    throw error;
  }
}
