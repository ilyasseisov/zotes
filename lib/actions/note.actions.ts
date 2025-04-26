"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import dbConnect from "../db";
import NoteModel from "../models/note";
import { NoteSchema } from "../validations";
import { NoteFormValues } from "./../validations";

// C w/Zod
export async function createNoteAction(formData: NoteFormValues) {
  // make sure we're connected to the database
  // before doing anything!
  await dbConnect();

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

    return { success: true };
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
  // make sure we're connected to the database
  // before doing anything!
  await dbConnect();

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
    throw new Error("Failed to fetch notes");
  }
}

// R - single
export async function getSingleNoteAction(id: string) {
  try {
    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid note ID format");
    }

    // Connect to the database
    await dbConnect();

    // Find the note by ID
    const noteDoc = await NoteModel.findById(id).lean();

    // If no note was found, return null
    if (!noteDoc) {
      return null;
    }

    // Convert to plain JavaScript object
    const note = JSON.parse(JSON.stringify(noteDoc));

    // Add id field (keeping _id for compatibility)
    return note;
  } catch (err: any) {
    console.error(`Failed to fetch note with ID ${id}:`, err.message);
    throw new Error(`Failed to fetch note: ${err.message}`);
  }
}

// U
export async function updateNoteAction(id: string, formData: NoteFormValues) {
  // make sure we're connected to the database
  // before doing anything!
  await dbConnect();

  // Validate the ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid note ID format");
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
    throw new Error(`Failed to update note: ${err.message}`);
  }
}

// D
export async function deleteNoteAction(id: string) {
  // make sure we're connected to the database
  // before doing anything!
  await dbConnect();

  // Validate the ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid note ID format");
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
