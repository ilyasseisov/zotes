"use client";

import { z } from "zod";
import { NoteSchema } from "@/lib/validations";

// actions
import { createNoteAction } from "@/lib/actions/note.actions";
import { useToast } from "@/hooks/use-toast";
import NoteForm from "@/components/note-form";

const Page = () => {
  // data fetching
  // hooks
  const { toast } = useToast();

  // local variables
  // functions
  async function handleNoteSubmit(formData: z.infer<typeof NoteSchema>) {
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
  // return
  return (
    <>
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">New note</h1>
        <NoteForm onSubmit={handleNoteSubmit} />
      </main>
    </>
  );
};
export default Page;
