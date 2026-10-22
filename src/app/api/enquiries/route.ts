import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { generateDocumentNumber } from "@/lib/document-number";
import { createAuditLog } from "@/lib/audit";
import { sendNotificationEmail, buildNewEnquiryEmailHtml } from "@/lib/email-service";
import { getWhatsAppClickToChatUrl } from "@/lib/whatsapp-service";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const assignedTo = searchParams.get("assignedTo");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (assignedTo && assignedTo !== "ALL") {
      where.assignedToUserId = assignedTo === "UNASSIGNED" ? null : assignedTo;
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (search) {
      where.OR = [
        { enquiryNumber: { contains: search } },
        { contactName: { contains: search } },
        { companyName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { productOfInterest: { contains: search } },
      ];
    }

    const enquiries = await prisma.enquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        enquiryNotes: {
          include: {
            author: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json({ success: true, enquiries });
  } catch (error: unknown) {
    console.error("Enquiries GET error:", error);
    return NextResponse.json({ error: "Failed to fetch enquiries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      contactName,
      companyName,
      email,
      phone,
      productOfInterest,
      category,
      requestedQuantity,
      unit,
      message,
    } = body;

    if (!contactName || !email || !phone || !message) {
      return NextResponse.json(
        { error: "Contact name, email, phone number, and message are required." },
        { status: 400 }
      );
    }

    const enquiryNumber = await generateDocumentNumber("ENQ");

    const enquiry = await prisma.enquiry.create({
      data: {
        enquiryNumber,
        contactName: contactName.trim(),
        companyName: companyName?.trim() || null,
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        productOfInterest: productOfInterest?.trim() || null,
        category: category?.trim() || null,
        requestedQuantity: requestedQuantity ? Number(requestedQuantity) : null,
        unit: unit || "KG",
        message: message.trim(),
        status: "NEW",
        source: "WEBSITE",
      },
    });

    // Send email notification to admin
    const adminEmail = process.env.EMAIL_ADMIN_RECIPIENT || "mohank9@gmail.com";
    await sendNotificationEmail({
      to: adminEmail,
      subject: `New Commercial Enquiry: ${enquiryNumber} - ${contactName}`,
      html: buildNewEnquiryEmailHtml(enquiry),
    });

    // Audit log
    await createAuditLog({
      entityType: "ENQUIRY",
      entityId: enquiry.id,
      action: "CREATE",
      performedByUserId: null,
      userEmail: enquiry.email,
      details: { enquiryNumber, productOfInterest, contactName },
    });

    // Return created enquiry with WhatsApp click-to-chat deep link
    const whatsappUrl = getWhatsAppClickToChatUrl({
      productName: productOfInterest || undefined,
      enquiryNumber,
    });

    return NextResponse.json({
      success: true,
      message: "Enquiry submitted successfully. Our commercial sales team will respond promptly.",
      enquiry,
      whatsappUrl,
    });
  } catch (error: unknown) {
    console.error("Enquiry POST error:", error);
    return NextResponse.json({ error: "Failed to submit enquiry" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, assignedToUserId, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Enquiry ID required" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};
    if (status) data.status = status;
    if (assignedToUserId !== undefined) data.assignedToUserId = assignedToUserId || null;
    if (notes !== undefined) data.notes = notes;

    const updated = await prisma.enquiry.update({
      where: { id },
      data,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    await createAuditLog({
      entityType: "ENQUIRY",
      entityId: id,
      action: "STATUS_UPDATE",
      performedByUserId: user.id,
      userEmail: user.email,
      details: { newStatus: status, assignedToUserId },
    });

    return NextResponse.json({ success: true, enquiry: updated });
  } catch (error: unknown) {
    console.error("Enquiry PATCH error:", error);
    return NextResponse.json({ error: "Failed to update enquiry" }, { status: 500 });
  }
}
