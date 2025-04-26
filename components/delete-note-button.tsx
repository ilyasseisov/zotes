"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog, // Using AlertDialog is often better for destructive actions than Dialog
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Assuming you have AlertDialog set up (part of Shadcn Dialog/AlertDialog)

import { useToast } from "@/hooks/use-toast"; // Your toast hook
import { deleteNoteAction } from "@/lib/actions/note.actions"; // Your server action

interface DeleteNoteButtonProps {
  noteId: string;
}

const DeleteNoteButton = ({ noteId }: DeleteNoteButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
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
        // Revalidate the home page data
        router.refresh();
      }
      // Although deleteNoteAction throws on failure, adding a check here
      // is good practice if the action's return type ever changes.
      else {
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
      // The AlertDialog should close automatically on action click,
      // but you could add state here if needed for programmatic close.
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {/* The button that opens the dialog */}
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
          <AlertDialogCancel>Cancel</AlertDialogCancel>
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
