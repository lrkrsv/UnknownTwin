import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/get-user";
import { ingestDocument } from "@/lib/ingest";
import { ingestDocumentSchema } from "@/lib/validations/documents";

export async function POST(request: Request) {
  try {
    const user = await requireRole(["admin"]);
    const body = await request.json();
    const parsed = ingestDocumentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const result = await ingestDocument({
      ...parsed.data,
      uploadedBy: user.id,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "Forbidden") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    console.error("Ingest error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
