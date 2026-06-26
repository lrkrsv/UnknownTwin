import { Suspense } from "react";
import { ChatView } from "@/components/chat/chat-view";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <Skeleton className="h-8 w-48" />
        </div>
      }
    >
      <ChatView />
    </Suspense>
  );
}
