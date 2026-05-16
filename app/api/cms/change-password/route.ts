export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const adminId = req.headers.get("x-admin-id");
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { currentPassword, newPassword, confirmPassword } = await req.json();

    if (!currentPassword || !newPassword || !confirmPassword)
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    if (newPassword !== confirmPassword)
      return NextResponse.json({ error: "New passwords do not match" }, { status: 400 });
    if (newPassword.length < 8)
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

    const admin = await db.admin.findUnique({ where: { id: adminId } });
    if (!admin) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

    const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.admin.update({ where: { id: adminId }, data: { passwordHash } });

    return NextResponse.json({ ok: true, message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
  }
}
