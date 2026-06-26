import { NextResponse } from "next/server";
import { requireRole, requireUser } from "@/lib/auth/get-user";
import {
  createEscalation,
  findPrecedingStudentQuestion,
  listEscalations,
  verifyMessageOwnership,
  type EscalationStatus,
} from "@/lib/escalations-db";
import { createEscalationSchema } from "@/lib/validations/escalations";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    if (user.role !== "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createEscalationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { messageId } = parsed.data;
    const ownership = verifyMessageOwnership(messageId, user.id);
    if (!ownership) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const question = findPrecedingStudentQuestion(
      ownership.conversationId,
      messageId
    );
    if (!question) {
      return NextResponse.json(
        { error: "Could not find the student question for this message" },
        { status: 400 }
      );
    }

    const escalation = createEscalation({
      messageId,
      conversationId: ownership.conversationId,
      studentId: user.id,
      question,
    });

    return NextResponse.json({ escalation });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }
    console.error("Create escalation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await requireRole(["mentor", "admin"]);

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const status =
      statusParam === "open" ||
      statusParam === "answered" ||
      statusParam === "closed"
        ? (statusParam as EscalationStatus)
        : undefined;

    const escalations = listEscalations(status);
    return NextResponse.json({ escalations });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "Forbidden") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    console.error("List escalations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
