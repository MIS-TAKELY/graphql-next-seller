export async function sendWhatsAppOTP(phone: string, otp: string) {
  // Use the provided URL or fallback to environment variable
  const WPP_CONNECT = process.env.WPP_CONNECT;

  if (!WPP_CONNECT) {
    console.log("url not avilable");
    return;
  }
  const wppConnectUrl = WPP_CONNECT;

  console.log(wppConnectUrl);


  // Clean phone number: remove all non-digits
  const cleanPhone = phone.toString().replace(/\D/g, "");

  const message = `Your verification code is: ${otp}. ⚠️ Do not share this code with anyone. Vanijay will never ask you for this code. This code expires in 10 minutes.`;
  const MAX_RETRIES = 2;
  let attempt = 0;

  while (attempt <= MAX_RETRIES) {
    try {
      console.log(
        `📱 Sending OTP to ${cleanPhone} (Attempt ${attempt + 1}/${MAX_RETRIES + 1
        })...`
      );
      const response = await fetch(wppConnectUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanPhone,
          message,
        }),
      });

      if (response.ok) {
        console.log(`✅ WhatsApp OTP sent successfully to ${phone}`);
        return response.json();
      }

      const errorData = await response.text();
      console.error(`❌ WhatsApp API error (${response.status}):`, errorData);

      if (response.status === 503 && attempt < MAX_RETRIES) {
        console.log(
          "⏳ Service temporarily unavailable, retrying in 5 seconds..."
        );
        await new Promise((resolve) => setTimeout(resolve, 5000));
        attempt++;
        continue;
      }

      let errorMessage = "Failed to send WhatsApp message";
      try {
        const parsed = JSON.parse(errorData);
        errorMessage = parsed.details || parsed.error || errorMessage;
      } catch (e) {
        errorMessage = errorData || errorMessage;
      }

      throw new Error(errorMessage);
    } catch (error: any) {
      if (attempt >= MAX_RETRIES) {
        console.error(
          "❌ Network or Server error sending WhatsApp:",
          error.message
        );
        throw error;
      }
      console.log(
        `⚠️ Attempt ${attempt + 1} failed: ${error.message}. Retrying...`
      );
      await new Promise((resolve) => setTimeout(resolve, 5000));
      attempt++;
    }
  }
}

export async function sendWhatsAppMessage(phone: string, message: string) {
  const wppConnectUrl = process.env.WPP_CONNECT;
  const apiKey = process.env.WPP_API_KEY;

  if (!wppConnectUrl) {
    console.error("❌ WPP_CONNECT URL is missing");
    throw new Error("WhatsApp provider URL is not configured");
  }

  if (!apiKey) {
    console.error("❌ WPP_API_KEY is missing");
    throw new Error("WhatsApp API key is not configured");
  }

  try {
    const response = await fetch(wppConnectUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey
      },
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

    console.log(`✅ WhatsApp message sent successfully to ${phone}`);
    return response.json();
  } catch (error: any) {
    console.error(
      "❌ Network or Server error sending WhatsApp:",
      error.message
    );
    throw error;
  }
}
