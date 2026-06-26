"use client";

import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { ChatSource } from "@/types/chat";

interface SourceChipsProps {
  sources: ChatSource[];
}

export function SourceChips({ sources }: SourceChipsProps) {
  return (
    <div className="flex max-w-[85%] flex-wrap gap-1.5">
      {sources.map((source) => (
        <Popover key={source.id}>
          <PopoverTrigger
            render={
              <Badge
                variant="secondary"
                className="cursor-pointer text-xs font-normal hover:bg-secondary/80"
              >
                {source.title}
                {source.module ? ` — ${source.module}` : ""}
              </Badge>
            }
          />
          <PopoverContent className="max-w-sm text-sm" align="start">
            <p className="mb-1 font-medium">{source.title}</p>
            {source.module && (
              <p className="mb-2 text-xs text-muted-foreground">
                {source.module} · relevance {(source.score * 100).toFixed(0)}%
              </p>
            )}
            <p className="text-xs leading-relaxed text-muted-foreground">
              {source.content?.slice(0, 400)}
              {(source.content?.length ?? 0) > 400 ? "…" : ""}
            </p>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  );
}
