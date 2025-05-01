"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";
import ROUTES from "@/constants/routes"; // Assuming ROUTES is defined
import DeleteNoteButton from "@/components/delete-note-button"; // Assuming DeleteNoteButton is defined

interface NotesListFilterProps {
  notes: Note[];
}

const NotesListFilter = ({ notes }: NotesListFilterProps) => {
  const [filterText, setFilterText] = useState("");

  // Use useMemo to efficiently filter notes whenever filterText or original notes change
  const filteredNotes = useMemo(() => {
    if (!filterText) {
      return notes; // Return all notes if filter is empty
    }

    const lowerCaseFilterText = filterText.toLowerCase();

    return notes.filter((note) =>
      note.title.toLowerCase().includes(lowerCaseFilterText),
    );
  }, [notes, filterText]); // Re-compute when notes or filterText change

  return (
    <>
      <div className="mb-6">
        <Input
          placeholder="Filter notes by title..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="p-6"
        />
      </div>

      <section>
        {/* Check if original notes array was empty */}
        {notes.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No notes found. Create your first note!
              </p>
            </CardContent>
          </Card>
        ) : // Check if filtered notes array is empty when original notes were not
        filteredNotes.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No notes found matching &quot;{filterText}&quot;.
              </p>
            </CardContent>
          </Card>
        ) : (
          <ul className="grid grid-cols-12 gap-4">
            {filteredNotes.map((note) => (
              <li
                className="col-span-12 sm:col-span-6 md:col-span-4"
                key={note._id}
              >
                <Card>
                  {/* Link to the single note page */}
                  <Link href={ROUTES.SINGLE_NOTE(note._id)}>
                    <CardHeader>
                      {/* Display the full title */}
                      <CardTitle>{note.title}</CardTitle>
                      {/* Display a truncated version of the content */}
                      <CardDescription>
                        {note.content.slice(0, 28)}
                        {note.content.length > 28 ? "..." : ""}
                      </CardDescription>
                    </CardHeader>
                  </Link>
                  <CardFooter className="flex justify-end">
                    {/* Delete button component */}
                    <DeleteNoteButton noteId={note._id} />
                  </CardFooter>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
};

export default NotesListFilter;
