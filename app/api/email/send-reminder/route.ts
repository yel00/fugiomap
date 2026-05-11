import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY!);
  const { email, name, token, surveyName } = await req.json();

  const surveyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/take/${token}`;

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: `Reminder: ${surveyName} is waiting for you`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; color: #1e293b;">
          <div style="width: 28px; height: 28px; background: #0f172a; border-radius: 4px; margin-bottom: 24px;"></div>
          <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 8px;">Hi ${name},</h1>
          <p style="color: #475569; line-height: 1.6; margin: 0 0 24px;">
            Just a quick reminder — your team is waiting for your responses to complete the ${surveyName} assessment.
            It only takes 10–15 minutes.
          </p>
          <a href="${surveyUrl}" style="display: inline-block; background: #0f172a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 14px;">
            Complete assessment
          </a>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send reminder" }, { status: 500 });
  }
}
