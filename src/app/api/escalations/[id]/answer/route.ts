import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/get-user";
import { answerEscalation, getEscalationById } from "@/lib/escalations-db";
import { answerEscalationSchema } from "@/lib/validations/escalations";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["mentor", "admin"]);
    const { id } = await params;

    const body = await request.json();
    const parsed = answerEscalationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const existing = getEscalationById(id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (existing.status !== "open") {
      return NextResponse.json(
        { error: "Escalation is not open" },
        { status: 400 }
      );
    }

    const escalation = await answerEscalation({
      escalationId: id,
      mentorId: user.id,
      answer: parsed.data.answer.trim(),
    });

    return NextResponse.json({ escalation });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "Forbidden") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (error.message === "Not found") {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      if (error.message === "Escalation is not open") {
        return NextResponse.json(
          { error: "Escalation is not open" },
          { status: 400 }
        );
      }
    }
    console.error("Answer escalation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
