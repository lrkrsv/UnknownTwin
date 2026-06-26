"use client";

import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  type: string;
  payload: { conversationId?: string; escalationId?: string };
  read: boolean;
  createdAt: string;
}

function formatNotification(item: NotificationItem): {
  title: string;
  href: string | null;
} {
  if (item.type === "escalation_answered" && item.payload.conversationId) {
    return {
      title: "A mentor answered your question",
      href: `/chat?conversation=${item.payload.conversationId}`,
    };
  }
  return { title: "New notification", href: null };
}

export function NotificationBell() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to load notifications");
      return res.json() as Promise<{
        notifications: NotificationItem[];
        unreadCount: number;
      }>;
    },
    refetchInterval: 30000,
  });

  const unreadCount = data?.unreadCount ?? 0;
  const notifications = data?.notifications ?? [];

  async function handleOpen(notification: NotificationItem) {
    if (!notification.read) {
      await fetch(`/api/notifications/${notification.id}/read`, {
        method: "POST",
      });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }

    const { href } = formatNotification(notification);
    if (href) router.push(href);
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="size-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        }
      />
      <PopoverContent align="end" className="w-80 p-0">
        <PopoverHeader className="border-b px-3 py-2">
          <PopoverTitle>Notifications</PopoverTitle>
        </PopoverHeader>
        <div className="max-h-72 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No notifications yet.
            </p>
          ) : (
            notifications.map((item) => {
              const { title } = formatNotification(item);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleOpen(item)}
                  className={cn(
                    "flex w-full flex-col gap-0.5 border-b px-3 py-2.5 text-left text-sm transition-colors last:border-b-0 hover:bg-muted",
                    !item.read && "bg-primary/5"
                  )}
                >
                  <span className="font-medium">{title}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
