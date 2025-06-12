import Pricing from "@/components/pricing";
import ROUTES from "@/constants/routes";
import Link from "next/link";

export default async function Home() {
  // return
  return (
    <>
      <main className="container mx-auto max-w-5xl px-4 py-8 text-center">
        <header className="mb-8">
          <nav className="mb-8 space-x-8">
            <Link href={ROUTES.SIGN_IN}>Sign In</Link>
            <Link href={ROUTES.SIGN_UP}>Sign Up</Link>
          </nav>
          <h1 className="text-6xl font-bold tracking-tight">Zotes</h1>
          <p className="mt-1 text-xl text-muted-foreground">
            A minimalist notes application
          </p>
          <p className="mt-8 text-left text-lg text-muted-foreground">
            Simple, easy-to-use tool that helps you write down and organize your
            thoughts. It has a clean design with no extra features to distract
            you. You can quickly add notes, make lists, and keep everything neat
            and tidy. Whether you’re keeping track of homework, ideas, or daily
            tasks, it helps you stay focused and organized without any clutter.
            It’s perfect for students or anyone who likes to keep things simple.
          </p>
        </header>

        <Pricing />
      </main>
    </>
  );
}
