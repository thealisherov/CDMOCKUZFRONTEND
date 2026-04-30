import { addToAudience } from "@/lib/resend";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    // Call the lib function to add to resend
    await addToAudience(email);

    return Response.json({ success: true });
  } catch (error) {
    console.error("API Route Error (add-contact):", error.message);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
