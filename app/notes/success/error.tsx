// app/error.js
"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { Button } from "@/components/ui/button"; // Assuming shadcn Button
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Assuming shadcn Card components
import { AlertCircle } from "lucide-react"; // Assuming lucide-react for icons
import Link from "next/link"; // For the "Go Home" link

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log the error to an error reporting service
  useEffect(() => {
    console.error("Route Error Caught:", error);
    // You would typically send this to a service like Sentry, LogRocket, etc.
  }, [error]);

  // Use the error message provided by Next.js, with a fallback
  const errorMessage = error.message || "An unexpected error occurred.";

  return (
    // Use the styling from your preferred example to center the card
    <div className="container mx-auto flex min-h-screen max-w-md items-center justify-center px-4 py-16">
      <Card className="w-full">
        <CardHeader>
          <div className="mb-2 flex items-center gap-2">
            {/* Use an error icon */}
            <AlertCircle className="h-5 w-5 text-destructive" />
            {/* Generic error title */}
            <CardTitle className="text-destructive">
              Application Error
            </CardTitle>
          </div>
          {/* Generic description */}
          <CardDescription>
            Something went wrong while trying to load this page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Display the actual error message */}
          <p className="text-sm text-muted-foreground">
            Details: {errorMessage}
            {/* Optionally display digest in development/staging for debugging */}
            {process.env.NODE_ENV !== "production" && error.digest && (
              <p className="mt-2 text-xs text-muted-foreground">
                Digest: {error.digest}
              </p>
            )}
          </p>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          {/* Button to attempt recovery */}
          <Button
            onClick={
              // Attempt to recover by trying to re-render the segment
              () => reset()
            }
            className="gap-2"
          >
            Try Again
          </Button>
          {/* Button to go back home */}
          <Button variant="outline" asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
