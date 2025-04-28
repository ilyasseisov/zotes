"use client";

import { z } from "zod";
import { NoteSchema } from "@/lib/validations";
import { useRouter } from "next/navigation";

// actions
import { updateNoteAction } from "@/lib/actions/note.actions";
import { useToast } from "@/hooks/use-toast"; // Assuming this hook is a client component
import NoteForm from "@/components/note-form"; // Assuming NoteForm is a client component

// Props type for the wrapper
interface UpdateNoteFormWrapperProps {
  note: {
    _id: string; // Mongoose uses _id - **Ensure this matches your fetched data**
    title: string;
    content: string;
  };
}

const UpdateNoteFormWrapper = ({ note }: UpdateNoteFormWrapperProps) => {
  // hooks
  const router = useRouter();
  const { toast } = useToast();

  // functions - This is the client-side onSubmit handler
  async function handleNoteUpdate(formData: z.infer<typeof NoteSchema>) {
    // 'formData' will contain { id, title, content } because NoteForm is configured to include 'id'

    if (!formData.id) {
      console.error("No ID provided for update");
      toast({
        title: "Error",
        description: "Cannot update note without an ID.",
        variant: "destructive",
      });
      return; // Exit early if no ID
    }

    try {
      // Call the server action from the client component
      const result = await updateNoteAction(formData.id, formData);

      if (result.success) {
        console.log(`✅ Note updated successfully: ${formData.id}`);

        toast({
          title: "Success",
          description: "Note updated successfully",
          variant: "default",
        });

        router.refresh();
      } else {
        // Although updateNoteAction currently throws on failure,
        // this handles potential future modifications where it might return { success: false, error: ... }
        console.error(`Failed to update note: No success true received`);
        toast({
          title: "Error",
          description: "Update failed. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error(`Failed to update note with ID ${formData.id}:`, error);

      toast({
        title: "Error",
        description:
          error.message || `Failed to update note with ID ${formData.id}`,
        variant: "destructive",
      });
    }
  }

  // return
  return (
    <NoteForm
      id={note._id}
      title={note.title}
      content={note.content}
      onSubmit={handleNoteUpdate} // Pass the client-side async handler
      btnTitle="Update"
      showCancelButton={false}
    />
  );
};

export default UpdateNoteFormWrapper;
