"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UserMenu } from "@/components/layout/user-menu";
import { APP_NAME } from "@/lib/constants";
import type { Profile } from "@/types/database";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  roles?: Array<Profile["role"]>;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/chat", label: "AI Professor", roles: ["student", "mentor", "admin"] },
  { href: "/dashboard", label: "AI Coach", roles: ["student", "admin"] },
  { href: "/assignments", label: "Assignments", roles: ["student", "admin"] },
  { href: "/mentor", label: "Mentor", roles: ["mentor", "admin"] },
  { href: "/admin", label: "Admin", roles: ["admin"] },
];

function NavLinks({
  profile,
  onNavigate,
}: {
  profile: Profile;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(profile.role)
  );

  return (
    <nav className="flex flex-col gap-1 md:flex-row md:items-center md:gap-1">
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppHeader({ profile }: { profile: Profile }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/chat" className="font-heading text-lg font-semibold tracking-tight">
            {APP_NAME}
          </Link>
          <div className="hidden md:block">
            <NavLinks profile={profile} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon" aria-label="Open menu">
                    <Menu className="size-5" />
                  </Button>
                }
              />
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle className="font-heading">{APP_NAME}</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <NavLinks profile={profile} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <UserMenu profile={profile} />
        </div>
      </div>
    </header>
  );
}
