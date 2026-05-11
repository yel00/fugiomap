import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    email,
    name,
    token,
    surveyName,
    companyName,
    customMessage,
  } = body;

  const surveyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/take/${token}`;

  const defaultMessage = `You've been invited to complete the Fugio MAP organizational diagnostic for ${companyName}. It takes about 10–15 minutes.`;

  const personalMessage = customMessage || defaultMessage;

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: `${companyName}: Your MAP Assessment is ready`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; color: #1e293b;">
          <div style="margin-bottom: 32px;">
            <div style="width: 28px; height: 28px; background: #0f172a; border-radius: 4px; margin-bottom: 24px;"></div>
            <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 8px;">Hi ${name},</h1>
            <p style="color: #475569; line-height: 1.6; margin: 0;">${personalMessage}</p>
          </div>

          <a href="${surveyUrl}" style="display: inline-block; background: #0f172a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 14px; margin-bottom: 32px;">
            Start ${surveyName}
          </a>

          <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-size: 13px; color: #64748b;">
            <p style="margin: 0 0 4px; font-weight: 500; color: #1e293b;">What to expect:</p>
            <ul style="margin: 8px 0 0; padding-left: 20px; line-height: 1.8;">
              <li>32 questions across 5 business domains</li>
              <li>Rate each statement on a 1–5 scale</li>
              <li>Takes 10–15 minutes to complete</li>
              <li>Your individual responses are confidential</li>
            </ul>
          </div>

          <p style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
            This link is personal to you. Please don't share it with others.<br/>
            If you have questions, reply to this email.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Email send failed:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
