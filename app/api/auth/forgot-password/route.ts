export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Check SMTP configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error("Forgot password: SMTP_USER or SMTP_PASS not set in .env");
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 });
    }

    const admin = await db.admin.findUnique({ where: { email } });
    // Always return ok to prevent email enumeration
    if (!admin) return NextResponse.json({ ok: true });

    // Generate 6-digit OTP valid 15 minutes
    const otp     = crypto.randomInt(100000, 999999).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    // Store OTP temporarily in SiteSettings
    await db.siteSettings.upsert({
      where:  { key: `pwd_reset_${admin.id}` },
      update: { value: `${otp}|${expires.toISOString()}` },
      create: {
        key:   `pwd_reset_${admin.id}`,
        value: `${otp}|${expires.toISOString()}`,
        label: "Password Reset OTP",
        type:  "text",
        group: "system",
      },
    });

    // Create transporter — same config as lib/email.ts
    const transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST || "smtp.gmail.com",
      port:   Number(process.env.SMTP_PORT || "465"),
      secure: Number(process.env.SMTP_PORT || "465") === 465, // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify connection before sending
    await transporter.verify();

    // Get site name from DB
    let siteName = "SAM Enterprises";
    try {
      const siteNameSetting = await db.siteSettings.findUnique({ where: { key: "site_name" } });
      if (siteNameSetting?.value) siteName = siteNameSetting.value;
    } catch { /* use default */ }

    await transporter.sendMail({
      from:    `"${siteName} Admin" <${process.env.SMTP_USER}>`,
      to:      email,
      subject: `Password Reset OTP — ${siteName} CMS`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8" /></head>
        <body style="font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px;">
          <div style="background:#fff;max-width:480px;margin:0 auto;border-radius:8px;overflow:hidden;">
            <div style="background:#111;color:#fff;padding:24px 32px;">
              <h1 style="margin:0;font-size:18px;font-weight:900;letter-spacing:0.1em;">${siteName}</h1>
              <p style="margin:4px 0 0;font-size:12px;opacity:0.6;">Admin Panel — Password Reset</p>
            </div>
            <div style="padding:32px;">
              <h2 style="color:#111;margin:0 0 8px;font-size:20px;">Password Reset OTP</h2>
              <p style="color:#555;margin-bottom:24px;font-size:14px;">
                Use this one-time password to reset your CMS password:
              </p>
              <div style="background:#f4f4f4;border:2px solid #111;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px;">
                <span style="font-size:40px;font-weight:900;letter-spacing:16px;color:#111;">${otp}</span>
              </div>
              <p style="color:#888;font-size:13px;margin-bottom:8px;">
                ⏰ This OTP expires in <strong>15 minutes</strong>.
              </p>
              <p style="color:#888;font-size:13px;">
                If you did not request a password reset, please ignore this email.
              </p>
            </div>
            <div style="padding:16px 32px;background:#f9f9f9;font-size:11px;color:#999;text-align:center;">
              © ${new Date().getFullYear()} ${siteName} — samenterprises.net
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`Password reset OTP sent to: ${email}`);
    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("Forgot password error:", err);
    // Return specific error for debugging
    const message = err instanceof Error ? err.message : "Failed to send OTP";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
