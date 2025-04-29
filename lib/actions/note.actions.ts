"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import dbConnect from "../db";
import NoteModel from "../models/note";
import { NoteSchema } from "../validations";
import { NoteFormValues } from "./../validations";

// C w/Zod
export async function createNoteAction(formData: NoteFormValues) {
  // Try connecting to the database first
  const dbResult = await dbConnect();

  if (!dbResult.success) {
    console.error("Database connection error:", dbResult.error);
    throw new Error(dbResult.error?.message || "Failed to connect to database");
  }

  const validationResult = NoteSchema.safeParse(formData);

  if (!validationResult.success) {
    console.error(validationResult.error.format());
    throw new Error("Invalid note data");
  }

  const { title, content } = validationResult.data;

  try {
    // Create a new note
    const note = await NoteModel.create({
      title,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("Note created:", note);

    // Revalidate the cache for the notes page
    revalidatePath("/");

    return { success: true, noteId: note._id.toString() };
  } catch (err: any) {
    console.error("Create note error:", err.message);

    // --- Check for duplicate key error (E11000) ---
    if (err.code === 11000) {
      // MongoDB duplicate key error
      // You might want to parse the error message to be more specific
      // about WHICH key was duplicated, but for a single unique field,
      // a generic message is often fine.
      console.error("Duplicate title error");
      throw new Error("A note with this title already exists.");
    }

    throw new Error(err.message || "Failed to create note");
  }
}

// R - all
export async function getAllNotesAction() {
  // Try connecting to the database first
  const dbResult = await dbConnect();

  if (!dbResult.success) {
    console.error("Database connection error:", dbResult.error);
    // Return the database error to be handled by the UI
    return {
      error: true,
      message: dbResult.error?.message || "Failed to connect to database",
      code: dbResult.error?.code || "DB_CONNECTION_ERROR",
    };
  }

  try {
    // Fetch all notes and sort by newest first
    const noteDocs = await NoteModel.find({}).sort({ createdAt: -1 }).lean();

    // Convert MongoDB documents to plain JavaScript objects
    // with serializable properties using JSON serialization
    const notes = JSON.parse(JSON.stringify(noteDocs));
    console.log(notes);

    return notes;
  } catch (error: any) {
    console.error("Failed to fetch notes:", error.message);
    return {
      error: true,
      message: error.message || "Failed to fetch notes",
      code: error.code || "FETCH_ERROR",
    };
  }
}

// R - single
export async function getSingleNoteAction(id: string) {
  try {
    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return {
        error: true,
        message: "Invalid note ID format",
        code: "INVALID_ID",
      };
    }

    // Try connecting to the database first
    const dbResult = await dbConnect();

    if (!dbResult.success) {
      console.error("Database connection error:", dbResult.error);
      return {
        error: true,
        message: dbResult.error?.message || "Failed to connect to database",
        code: dbResult.error?.code || "DB_CONNECTION_ERROR",
      };
    }

    // Find the note by ID
    const noteDoc = await NoteModel.findById(id).lean();

    // If no note was found, return null
    if (!noteDoc) {
      return {
        error: true,
        message: "Note not found",
        code: "NOT_FOUND",
      };
    }

    // Convert to plain JavaScript object
    const note = JSON.parse(JSON.stringify(noteDoc));

    // Add id field (keeping _id for compatibility)
    return note;
  } catch (err: any) {
    console.error(`Failed to fetch note with ID ${id}:`, err.message);
    return {
      error: true,
      message: `Failed to fetch note: ${err.message}`,
      code: err.code || "FETCH_ERROR",
    };
  }
}

// U
export async function updateNoteAction(id: string, formData: NoteFormValues) {
  // Validate the ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid note ID format");
  }

  // Try connecting to the database first
  const dbResult = await dbConnect();

  if (!dbResult.success) {
    console.error("Database connection error:", dbResult.error);
    throw new Error(dbResult.error?.message || "Failed to connect to database");
  }

  // Validate the form data
  const validationResult = NoteSchema.safeParse(formData);

  if (!validationResult.success) {
    console.error(validationResult.error.format());
    throw new Error("Invalid note data");
  }

  const { title, content } = validationResult.data;
  try {
    // Find and update the note
    const updatedNote = await NoteModel.findByIdAndUpdate(
      id,
      {
        title,
        content,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true },
    ).lean();

    if (!updatedNote) {
      throw new Error("Failed to update note");
    }

    // Revalidate the cache for the notes page
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    console.error(`Failed to update note with ID ${id}:`, err.message);

    // --- Check for duplicate key error (E11000) ---
    if (err.code === 11000) {
      // MongoDB duplicate key error
      // You might want to parse the error message to be more specific
      // about WHICH key was duplicated, but for a single unique field,
      // a generic message is often fine.
      console.error("Duplicate title error");
      throw new Error("A note with this title already exists.");
    }

    throw new Error(`Failed to update note: ${err.message}`);
  }
}

// D
export async function deleteNoteAction(id: string) {
  // Validate the ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid note ID format");
  }

  // Try connecting to the database first
  const dbResult = await dbConnect();

  if (!dbResult.success) {
    console.error("Database connection error:", dbResult.error);
    throw new Error(dbResult.error?.message || "Failed to connect to database");
  }

  try {
    // Find and delete the note by ID
    const deletedNote = await NoteModel.findByIdAndDelete(id).lean();

    // If no note was found with the given ID
    if (!deletedNote) {
      throw new Error(`Note with ID ${id} not found.`);
    }

    console.log(`Note deleted: ${id}`);

    // Revalidate the cache for the notes page
    revalidatePath("/");
    // Optionally revalidate the specific note page if needed, though typically it would redirect after deletion
    // revalidatePath(`/note/${id}`);

    return { success: true, deletedId: id };
  } catch (err: any) {
    console.error(`Failed to delete note with ID ${id}:`, err.message);
    throw new Error(`Failed to delete note: ${err.message}`);
  }
}
