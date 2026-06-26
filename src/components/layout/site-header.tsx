import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-heading text-lg font-semibold tracking-tight">
          {APP_NAME}
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/admissions"
            className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
          >
            Admissions
          </Link>
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/login" />}>
            Sign in
          </Button>
          <Button size="sm" nativeButton={false} render={<Link href="/signup" />}>
            Get started
          </Button>
        </nav>
      </div>
    </header>
  );
}
