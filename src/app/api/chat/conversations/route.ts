import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/get-user";
import { listConversations } from "@/lib/chat-db";

export async function GET() {
  try {
    const user = await requireUser();
    const conversations = listConversations(user.id);
    return NextResponse.json({ conversations });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("List conversations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
