import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";
import Link from "next/link";

export default async function Home() {
  // return
  return (
    <>
      <main className="container mx-auto max-w-4xl px-4 py-8 text-center">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Zotes</h1>
          <p className="mt-1 text-muted-foreground">
            A minimalist notes application
          </p>
        </header>
        <Button asChild type="button">
          <Link href={ROUTES.APP}>to the App</Link>
        </Button>
      </main>
    </>
  );
}
