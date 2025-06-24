import { Button } from "@/components/ui/button";
import UpdateNoteFormWrapper from "@/components/update-note-form-wrapper";
import ROUTES from "@/constants/routes";
import { getSingleNoteAction } from "@/lib/actions/note.actions";
import Link from "next/link";
import { notFound } from "next/navigation";

// Updated component signature for Next.js 15
const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  // Await the params to get the actual values
  const { id } = await params;

  let note: Note; // Declare the note variable, now using the global Note interface

  try {
    const result = await getSingleNoteAction(id); // Get the full result, which might be a Note or an error object

    // Check if the result indicates an error (e.g., invalid ID, note not found)
    if (result && "error" in result && result.error) {
      // If the specific error codes are for 'Invalid ID Format' or 'Note Not Found',
      // trigger Next.js's 404 handling.
      if (result.code === "INVALID_ID" || result.code === "NOT_FOUND") {
        console.warn(
          `[Note Page] Note not found or invalid ID format for: ${id}. Triggering 404.`,
        );
        notFound(); // <-- This function halts rendering and shows the 404 page
      } else {
        // For all other types of errors returned by getSingleNoteAction
        // (e.g., UNAUTHORIZED, DB_CONNECTION_ERROR, FETCH_ERROR),
        // re-throw the error with its specific message.
        // This error will then be caught by the outer catch block below.
        console.error(
          `[Note Page] Error from action (code: ${result.code}): ${result.message}`,
        );
        throw new Error(
          result.message ||
            "An unexpected error occurred while fetching the note.",
        );
      }
    } else {
      // If no error property, the result must be a valid Note object
      note = result as Note; // Cast the result to the Note type
    }
  } catch (error: any) {
    // Catching 'any' is common for generic error objects
    // This catch block handles:
    // 1. Errors explicitly thrown from getSingleNoteAction (e.g., if currentUser fails).
    // 2. Errors re-thrown in the `else` block above (e.g., UNAUTHORIZED, DB_CONNECTION_ERROR).
    console.error("[Note Page] Critical error during note fetch:", error);

    // Propagate the specific error message to the error.tsx boundary.
    // If 'error' is an Error instance, use its message. Otherwise, use a generic fallback.
    throw new Error(
      error.message || "Failed to load note due to an internal server issue.",
    );
  }

  // If the code reaches here, 'note' is guaranteed to be a valid Note object,
  // and the page can proceed with rendering the note form.
  return (
    <>
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Update note</h1>
          <Button asChild type="button" variant="ghost">
            <Link href={ROUTES.APP}>Back to all notes</Link>
          </Button>
        </header>

        <UpdateNoteFormWrapper note={note} />
      </main>
    </>
  );
};

export default Page;
