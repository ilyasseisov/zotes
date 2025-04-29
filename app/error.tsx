"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  const errorMessage = error.message || "Something went wrong";

  // Check if it's a known database error
  const isDbError =
    errorMessage.includes("MONGODB_URI") ||
    errorMessage.includes("database") ||
    errorMessage.includes("Database") ||
    errorMessage.includes("connection string");

  return (
    <div className="container mx-auto flex min-h-screen max-w-md items-center justify-center px-4 py-16">
      <Card className="w-full">
        <CardHeader>
          <div className="mb-2 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Error</CardTitle>
          </div>
          <CardDescription>
            {isDbError
              ? "There was a problem connecting to the database"
              : "There was a problem loading this page"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {isDbError
              ? "The application is unable to connect to the database. Please check your MONGODB_URI environment variable."
              : errorMessage}
          </p>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button onClick={() => reset()} className="gap-2">
            Try Again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
