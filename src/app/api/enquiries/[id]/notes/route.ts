import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: enquiryId } = await params;
    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Note content cannot be empty" }, { status: 400 });
    }

    const note = await prisma.enquiryNote.create({
      data: {
        enquiryId,
        authorUserId: user.id,
        content: content.trim(),
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    await createAuditLog({
      entityType: "ENQUIRY",
      entityId: enquiryId,
      action: "ADD_NOTE",
      performedByUserId: user.id,
      userEmail: user.email,
      details: { noteId: note.id },
    });

    return NextResponse.json({ success: true, note });
  } catch (error: unknown) {
    console.error("Enquiry Note error:", error);
    return NextResponse.json({ error: "Failed to add note" }, { status: 500 });
  }
}
