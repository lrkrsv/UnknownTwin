import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/get-user";
import {
  getConversation,
  getMessages,
  parseMessageSources,
} from "@/lib/chat-db";
import { getEscalationStatusesByMessageIds } from "@/lib/escalations-db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const conversation = getConversation(id, user.id);

    if (!conversation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const rows = getMessages(id);
    const escalationStatuses = getEscalationStatusesByMessageIds(
      rows.filter((m) => m.role === "ai").map((m) => m.id)
    );

    const messages = rows.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      confidence: m.confidence,
      sources: parseMessageSources(m.sources),
      needsHuman: Boolean(m.needs_human),
      escalationStatus: escalationStatuses[m.id] ?? null,
      createdAt: m.created_at,
    }));

    return NextResponse.json({ conversation, messages });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get conversation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
