"use client";

import { useState } from "react";
import { z } from "zod";
import { NoteSchema } from "@/lib/validations";

// actions
import { createNoteAction } from "@/lib/actions/note.actions";
import { updateNoteAction } from "@/lib/actions/note.actions";
import { useToast } from "@/hooks/use-toast";
import NoteForm from "@/components/note-form";
import ROUTES from "@/constants/routes";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Page = () => {
  // data fetching
  // hooks

  // This state will be null initially (create mode)
  // and will hold the note ID after successful creation (update mode)
  const [createdNoteId, setCreatedNoteId] = useState<string | null>(null);
  const { toast } = useToast();

  // local variables
  // functions
  // --- Function to handle the initial note creation ---
  async function handleCreateNote(formData: z.infer<typeof NoteSchema>) {
    //
    try {
      const result = await createNoteAction(formData);

      if (result.success) {
        console.log("✅ Note created successfully");

        toast({
          title: "Success",
          description: "Note created successfully",
          variant: "default",
        });

        // --- Update state with the new note's ID ---
        // This transitions the page/form into 'update' mode
        if (result.noteId) {
          setCreatedNoteId(result.noteId);
        } else {
          // This block might not be reached if createNoteAction throws on failure,
          // but it's good practice if the action's return type changes.
          toast({
            title: "Error",
            description: "Failed to create note. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      console.error("Failed to create note:", error);

      toast({
        title: "Error",
        description: error.message || "Failed to create note",
        variant: "destructive",
      });
    }
    //
  }

  // --- Function to handle updating the note ---
  // This function will be used after createdNoteId is set
  async function handleUpdateNote(formData: z.infer<typeof NoteSchema>) {
    // Ensure we have an ID to update
    if (!createdNoteId) {
      console.error("Attempted to update note without an ID");
      toast({
        title: "Error",
        description: "Cannot update note without an ID.",
        variant: "destructive",
      });
      return; // Exit if no ID is available
    }

    try {
      // Call the server action to update the note
      // Pass the ID from state and the form data
      const result = await updateNoteAction(createdNoteId, formData);

      if (result.success) {
        console.log(`✅ Note updated successfully: ${createdNoteId}`);
        toast({
          title: "Success",
          description: "Note updated successfully",
          variant: "default",
        });
        // Optionally, refresh the current page data if needed (though usually not necessary for a form)
        // router.refresh();
      } else {
        // Handle potential non-throwing failures from updateNoteAction
        toast({
          title: "Error",
          description: "Failed to update note. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error(`Failed to update note with ID ${createdNoteId}:`, error);
      toast({
        title: "Error",
        description:
          error.message || `Failed to update note with ID ${createdNoteId}`,
        variant: "destructive",
      });
    }
  }

  // --- Determine which handler and button title to use based on state ---
  const currentSubmitHandler = createdNoteId
    ? handleUpdateNote
    : handleCreateNote;
  const currentButtonTitle = createdNoteId ? "Update" : "Save";
  const pageTitle = createdNoteId ? "Update note" : "New note";
  // --- Determine the text for the header button/link ---
  const headerButtonText = createdNoteId ? "Back to all notes" : "Cancel";
  // return
  return (
    <>
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="mb-6 text-3xl font-bold">{pageTitle}</h1>
          {/* Conditionally render Cancel button or Back link */}

          <Button asChild type="button" variant="ghost">
            <Link href={ROUTES.APP}>{headerButtonText}</Link>
          </Button>
        </header>
        <NoteForm
          // Pass the note ID if available (for update mode)
          id={createdNoteId || undefined} // Pass undefined if null so NoteForm doesn't get an empty string when creating
          // Pass the appropriate submit handler based on state
          onSubmit={currentSubmitHandler}
          // Pass the appropriate button title based on state
          btnTitle={currentButtonTitle}
        />
      </main>
    </>
  );
};
export default Page;
