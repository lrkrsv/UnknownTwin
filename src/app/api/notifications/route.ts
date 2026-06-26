import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/get-user";
import {
  countUnreadNotifications,
  listNotifications,
  parseNotificationPayload,
} from "@/lib/notifications-db";

export async function GET() {
  try {
    const user = await requireUser();
    const notifications = listNotifications(user.id).map((n) => ({
      id: n.id,
      type: n.type,
      payload: parseNotificationPayload(n.payload),
      read: Boolean(n.read),
      createdAt: n.created_at,
    }));
    const unreadCount = countUnreadNotifications(user.id);

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("List notifications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
