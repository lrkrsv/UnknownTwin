"use client";

import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function MentorCta() {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button variant="outline" size="sm" disabled className="gap-2">
            <Users className="size-4" />
            Ask a university mentor
          </Button>
        }
      />
      <TooltipContent>
        Mentor escalation arrives in Milestone 4
      </TooltipContent>
    </Tooltip>
  );
}
