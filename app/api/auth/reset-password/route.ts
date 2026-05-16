export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword)
      return NextResponse.json({ error: "Email, OTP and new password are required" }, { status: 400 });

    if (newPassword.length < 8)
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

    const admin = await db.admin.findUnique({ where: { email } });
    if (!admin) return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });

    const stored = await db.siteSettings.findUnique({ where: { key: `pwd_reset_${admin.id}` } });
    if (!stored)
      return NextResponse.json({ error: "OTP expired or not requested" }, { status: 400 });

    const [storedOtp, expiresStr] = stored.value.split("|");
    if (new Date() > new Date(expiresStr)) {
      await db.siteSettings.delete({ where: { key: `pwd_reset_${admin.id}` } });
      return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 });
    }

    if (storedOtp !== otp.trim())
      return NextResponse.json({ error: "Invalid OTP. Please check and try again." }, { status: 400 });

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.admin.update({ where: { id: admin.id }, data: { passwordHash } });
    await db.siteSettings.delete({ where: { key: `pwd_reset_${admin.id}` } });
    // Invalidate all sessions
    await db.session.deleteMany({ where: { adminId: admin.id } });

    return NextResponse.json({ ok: true, message: "Password reset successfully. Please log in." });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
