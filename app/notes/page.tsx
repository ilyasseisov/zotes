import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";
import Link from "next/link";
import { getAllNotesAction } from "@/lib/actions/note.actions";
import { Card, CardContent } from "@/components/ui/card";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import NotesListFilter from "@/components/notes-list-filter";

import { currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import UserModel from "@/lib/models/user";
import { Badge } from "@/components/ui/badge";
import UpgradeButton from "@/components/upgrade-button";

export default async function Home() {
  // vars
  let notes: Note[] = [];
  let error = null;
  let userPlan = "free"; // default plan

  // get user
  // Get current user and their plan
  try {
    const user = await currentUser();
    if (user?.id) {
      await dbConnect();
      const dbUser = await UserModel.findOne({ clerkId: user.id });
      if (dbUser) {
        userPlan = dbUser.planId;
      }
    }
  } catch (err) {
    console.error("Error fetching user plan:", err);
    // Continue with default plan if user fetch fails
  }

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

  // plan text
  const getPlanDisplayText = (plan: string) => {
    return plan === "paid" ? "Pro" : "Free";
  };

  // return
  return (
    <>
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <header className="mb-8">
          <Badge className="mb-2 mt-2">{getPlanDisplayText(userPlan)}</Badge>
          <h1 className="text-3xl font-bold tracking-tight">Zotes</h1>
          <p className="mb-2 mt-1 text-muted-foreground">
            A minimalist notes application
          </p>
          <div>{userPlan === "free" && <UpgradeButton />}</div>
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
