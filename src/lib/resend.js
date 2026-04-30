import { Resend } from "resend";

// Resend SDK instance (server-side only)
const resend = new Resend(process.env.RESEND_API_KEY);

export async function addToAudience(email) {
  try {
    const audienceId = process.env.RESEND_AUDIENCE_ID;
    
    if (!audienceId) {
      console.warn("RESEND_AUDIENCE_ID is not configured in environment variables.");
      return;
    }

    await resend.contacts.create({
      email: email,
      audienceId: audienceId,
    });
    
    console.log(`[Resend] Successfully added ${email} to audience.`);
  } catch (error) {
    // Log error but do not throw to prevent blocking the user flow
    console.error("[Resend Error]:", error.message);
  }
}
