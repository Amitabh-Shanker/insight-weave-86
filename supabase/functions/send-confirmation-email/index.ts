import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const resendApiKey = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  email: string;
  firstName: string;
  lastName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName }: ConfirmationEmailRequest = await req.json();

    console.log(`Sending confirmation email to ${email}`);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "CareNexus <onboarding@resend.dev>",
        to: [email],
        subject: "Welcome to CareNexus!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb; margin-bottom: 20px;">Welcome to CareNexus!</h1>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Dear ${firstName} ${lastName},
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              You have successfully registered with CareNexus. We're excited to have you on board!
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Our AI-powered healthcare platform is designed to help you better understand your health concerns 
              and connect with healthcare professionals when needed.
            </p>
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #1e40af; margin-top: 0;">Next Steps:</h2>
              <ul style="color: #333; line-height: 1.8;">
                <li>Complete your health questionnaire</li>
                <li>Start analyzing your symptoms</li>
                <li>Connect with healthcare professionals</li>
              </ul>
            </div>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              If you have any questions, feel free to reach out to our support team.
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Best regards,<br>
              <strong>The CareNexus Team</strong>
            </p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error("Error sending email:", errorData);
      throw new Error(`Failed to send email: ${errorData}`);
    }

    const result = await emailResponse.json();
    console.log("Email sent successfully:", result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-confirmation-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
