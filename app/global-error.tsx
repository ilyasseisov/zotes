"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const errorMessage = error.message || "Something went wrong";

  // Check if it's a known database error
  const isDbError =
    errorMessage.includes("MONGODB_URI") ||
    errorMessage.includes("database") ||
    errorMessage.includes("Database");

  return (
    <html>
      <body>
        <div className="container mx-auto flex min-h-screen max-w-md items-center justify-center px-4 py-16">
          <Card className="w-full">
            <CardHeader>
              <div className="mb-2 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-destructive">
                  Critical Error
                </CardTitle>
              </div>
              <CardDescription>
                {isDbError
                  ? "There was a problem connecting to the database"
                  : "There was a critical problem with the application"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {isDbError
                  ? "The application is unable to connect to the database. This could be due to missing environment variables or a configuration issue. Please check your environment settings."
                  : "The application encountered a critical error that prevented it from loading. Please try refreshing or contact support if the problem persists."}
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={reset} className="gap-2">
                <RefreshCw className="h-4 w-4" /> Refresh Application
              </Button>
            </CardFooter>
          </Card>
        </div>
      </body>
    </html>
  );
}
