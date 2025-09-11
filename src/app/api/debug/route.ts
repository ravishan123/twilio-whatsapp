import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!accountSid || !authToken || !phoneNumber) {
      return NextResponse.json({
        success: false,
        error: "Missing Twilio environment variables",
        config: {
          accountSid: accountSid ? "✓ Set" : "✗ Missing",
          authToken: authToken ? "✓ Set" : "✗ Missing",
          phoneNumber: phoneNumber ? "✓ Set" : "✗ Missing",
          geminiApiKey: geminiApiKey ? "✓ Set" : "✗ Missing",
        },
      });
    }

    // Initialize Twilio client
    const client = twilio(accountSid, authToken);

    try {
      // Get account info
      const account = await client.api.accounts(accountSid).fetch();

      // Get phone numbers
      const phoneNumbers = await client.incomingPhoneNumbers.list();

      // Get WhatsApp senders (sandbox)
      let whatsappSenders = [];
      try {
        whatsappSenders = await client.messaging.v1.services.list();
      } catch (e) {
        console.log("Could not fetch messaging services:", e);
      }

      return NextResponse.json({
        success: true,
        debug: {
          account: {
            sid: account.sid,
            friendlyName: account.friendlyName,
            status: account.status,
          },
          configuredPhoneNumber: phoneNumber,
          availablePhoneNumbers: phoneNumbers.map((pn) => ({
            phoneNumber: pn.phoneNumber,
            friendlyName: pn.friendlyName,
            capabilities: pn.capabilities,
          })),
          whatsappServices: whatsappSenders.map((service) => ({
            sid: service.sid,
            friendlyName: service.friendlyName,
          })),
          recommendations: [
            "1. For WhatsApp Sandbox, use: whatsapp:+14155238886",
            "2. Check Twilio Console > Messaging > Try it out > Send a WhatsApp message",
            "3. Make sure you've joined the sandbox by sending 'join <code>' to the sandbox number",
            "4. Your phone number format should be: whatsapp:+1234567890",
            "5. Get your Gemini API key from https://makersuite.google.com/app/apikey",
            "6. AI Support: " +
              (geminiApiKey ? "✓ Enabled" : "✗ Disabled - Set GEMINI_API_KEY"),
          ],
        },
      });
    } catch (twilioError) {
      return NextResponse.json({
        success: false,
        error: "Twilio API Error",
        details:
          twilioError instanceof Error
            ? twilioError.message
            : "Unknown Twilio error",
        config: {
          accountSid: accountSid
            ? `✓ ${accountSid.substring(0, 10)}...`
            : "✗ Missing",
          authToken: authToken ? "✓ Set (hidden)" : "✗ Missing",
          phoneNumber: phoneNumber,
        },
      });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Server Error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
