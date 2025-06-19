import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";
import { PenTool } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full rounded-lg border border-primary bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary p-2">
              <PenTool className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="hidden text-xl font-bold text-foreground sm:block">
              Zotes
            </span>
          </div>
          {/* Navigation Links */}
          <div className="space-x-3 sm:space-x-6">
            <Link href={ROUTES.SIGN_IN}>Sign In</Link>
            <Link href={ROUTES.SIGN_UP}>Sign Up</Link>
          </div>
          {/* Right side - Theme toggle and CTA */}
          <div className="flex items-center gap-4">
            <Button asChild size="sm" className="font-medium">
              <Link href="#pricing">
                <span className="text-nowrap">Start Free</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
