import { SignOutButton, SignedIn } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function NotesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className="flex h-16 items-center justify-end gap-4 p-4">
        <SignedIn>
          <SignOutButton>
            <Button variant="secondary" size="sm">
              Sign Out
            </Button>
          </SignOutButton>
        </SignedIn>
      </header>
      {children}
    </>
  );
}
