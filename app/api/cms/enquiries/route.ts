export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audit } from "@/lib/auth";
import { sendEnquiryEmails } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status");
    const enquiries = await db.enquiry.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json(enquiries);
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const adminId = req.headers.get("x-admin-id");
    const ip      = req.headers.get("x-forwarded-for") ?? "unknown";
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, status } = await req.json();
    if (!id || !status) return NextResponse.json({ error: "Missing id or status" }, { status: 400 });

    const e = await db.enquiry.update({ where: { id }, data: { status } });
    await audit(adminId, "UPDATE", "Enquiry", id, { status }, ip);
    return NextResponse.json({ ok: true, enquiry: e });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const adminId = req.headers.get("x-admin-id");
    const ip      = req.headers.get("x-forwarded-for") ?? "unknown";
    if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const e = await db.enquiry.findUnique({ where: { id } });
    if (!e) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.enquiry.delete({ where: { id } });
    await audit(adminId, "DELETE", "Enquiry", id, { name: e.name }, ip);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try { body = await req.json(); }
    catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

    const {
      name, phone, alternatePhone, email,
      productName, purpose, location,
      quantity, budget, message,
    } = body as Record<string, string>;

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
    }

    const e = await db.enquiry.create({
      data: {
        name:           name.trim(),
        phone:          phone.trim(),
        alternatePhone: alternatePhone?.trim() || null,
        email:          email?.trim()          || null,
        productName:    productName?.trim()    || null,
        purpose:        purpose?.trim()        || null,
        location:       location?.trim()       || null,
        quantity:       quantity?.trim()       || null,
        budget:         budget?.trim()         || null,
        message:        message?.trim()        || `Enquiry about ${productName || "product"}`,
        status:         "new",
      },
    });

    sendEnquiryEmails({
      name: e.name, phone: e.phone,
      email: e.email, productName: e.productName,
      message: e.message,
    }).catch((err) => console.error("Email error:", err));

    return NextResponse.json({ ok: true, id: e.id }, { status: 201 });
  } catch (err) {
    console.error("POST enquiry error:", err);
    return NextResponse.json({ error: "Failed to submit enquiry" }, { status: 500 });
  }
}
