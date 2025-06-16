// delete-note-button.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useToast } from "@/hooks/use-toast";
import { deleteNoteAction } from "@/lib/actions/note.actions";

interface DeleteNoteButtonProps {
  noteId: string;
  onNoteDeleted: (deletedNoteId: string) => void; // <-- NEW PROP
}

const DeleteNoteButton = ({ noteId, onNoteDeleted }: DeleteNoteButtonProps) => {
  // <-- ACCEPT PROP
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // For programmatic dialog control
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const result = await deleteNoteAction(noteId);

      if (result.success) {
        console.log(`✅ Note deleted successfully: ${noteId}`);
        toast({
          title: "Success",
          description: "Note deleted successfully",
          variant: "default",
        });

        // Optimistic UI update: Call the parent's handler to remove the note
        onNoteDeleted(noteId); // <-- CALL THE NEW PROP HERE!

        // Close the dialog immediately after successful action and optimistic update
        setIsDialogOpen(false);

        // router.refresh() is still useful for revalidating server cache for future fetches
        // but it's not strictly necessary for *immediate* UI update here anymore.
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete note.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error(`Failed to delete note with ID ${noteId}:`, error);
      toast({
        title: "Error",
        description: error.message || `Failed to delete note with ID ${noteId}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      // Dialog is closed by setIsDialogOpen(false) on success
    }
  };

  return (
    // Pass isDialogOpen and setIsDialogOpen to AlertDialog
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogTrigger asChild>
        {/* Disable the button while an action is pending */}
        <Button variant="ghost" size="icon" disabled={isLoading}>
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete note</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your note
            and remove its data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>{" "}
          {/* Disable cancel while deletion is in progress */}
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteNoteButton;
