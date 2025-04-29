import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";
import Link from "next/link";
import { getAllNotesAction } from "@/lib/actions/note.actions";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  CardContent,
} from "@/components/ui/card";

import DeleteNoteButton from "@/components/delete-note-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";

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
    } else {
      notes = result;
    }
  } catch (err: any) {
    console.error("Error fetching notes:", err);
    error = {
      message: err.message || "An error occurred while fetching notes",
      code: "UNKNOWN_ERROR",
    };
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
          {error ? (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{getErrorMessage(error.code)}</AlertDescription>
              <CardFooter className="px-0 pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="h-4 w-4" /> Try Again
                </Button>
              </CardFooter>
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
            <ul className="grid grid-cols-12 gap-4">
              {notes.map((note) => (
                <li
                  className="col-span-12 sm:col-span-6 md:col-span-4"
                  key={note._id}
                >
                  <Card>
                    <Link href={ROUTES.SINGLE_NOTE(note._id)}>
                      <CardHeader>
                        <CardTitle>{note.title}</CardTitle>
                        <CardDescription>
                          {note.content.slice(0, 28) + "..."}
                        </CardDescription>
                      </CardHeader>
                    </Link>
                    <CardFooter className="flex justify-end">
                      <DeleteNoteButton noteId={note._id} />
                    </CardFooter>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
