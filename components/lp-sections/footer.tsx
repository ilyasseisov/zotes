import { PenTool } from "lucide-react";
import Link from "next/link";

export default function FooterSection() {
  return (
    <footer className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <Link
          href="/"
          aria-label="go home"
          className="mx-auto mb-10 block size-fit"
        >
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary p-2">
              <PenTool className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Zotes</span>
          </div>
        </Link>

        <span className="block text-center text-sm text-muted-foreground">
          {" "}
          © {new Date().getFullYear()} Zotes., All rights reserved
        </span>
      </div>
    </footer>
  );
}
