import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";
import Link from "next/link";
import { getAllNotesAction } from "@/lib/actions/note.actions";
import { Card, CardContent } from "@/components/ui/card";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import NotesListFilter from "@/components/notes-list-filter";

export default async function Home() {
  // vars
  let notes: Note[] = [];
  let error = null;
  // data fetching
  // Fetch all notes when the page loads
  try {
    const result = await getAllNotesAction();

    // Check if result contains an error
    if (result && "error" in result && result.error) {
      error = {
        message: result.message || "An error occurred while fetching notes",
        code: result.code,
      };
      // When there's a database error, throw it to be caught by error boundary
      if (
        result.code === "DB_URI_MISSING" ||
        result.code === "DB_CONNECTION_ERROR"
      ) {
        throw new Error(result.message || "Database connection error");
      }
    } else {
      notes = result;
    }
  } catch (err: any) {
    console.error("Error fetching notes:", err);
    // Rethrow the error to be caught by the error boundary
    throw err;
  }

  const getErrorMessage = (code?: string) => {
    switch (code) {
      case "DB_URI_MISSING":
        return "Database configuration is missing. Please check the environment settings.";
      case "DB_CONNECTION_ERROR":
        return "Unable to connect to the database. Please try again later.";
      default:
        return "There was a problem loading your notes. Please try again later.";
    }
  };

  // return
  return (
    <>
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Zotes</h1>
          <p className="mt-1 text-muted-foreground">
            A minimalist notes application
          </p>
        </header>

        <div className="mb-6 flex justify-end">
          <Button asChild>
            <Link href={ROUTES.NEW_NOTE}>+ New note</Link>
          </Button>
        </div>

        <section>
          {error &&
          error.code !== "DB_URI_MISSING" &&
          error.code !== "DB_CONNECTION_ERROR" ? (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{getErrorMessage(error.code)}</AlertDescription>
            </Alert>
          ) : notes.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No notes found. Create your first note!
                </p>
              </CardContent>
            </Card>
          ) : (
            <NotesListFilter notes={notes} />
          )}
        </section>
      </main>
    </>
  );
}
