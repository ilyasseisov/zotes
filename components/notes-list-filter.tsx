// notes-list-filter.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
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
import ROUTES from "@/constants/routes";
import DeleteNoteButton from "@/components/delete-note-button";

interface NotesListFilterProps {
  notes: Note[]; // This will now be the initial notes
}

const NotesListFilter = ({ notes: initialNotes }: NotesListFilterProps) => {
  // Rename prop for clarity
  const [filterText, setFilterText] = useState("");
  // Manage notes internally for optimistic updates
  const [currentNotes, setCurrentNotes] = useState(initialNotes); // <-- NEW STATE

  // Update internal state if initialNotes prop changes (e.g., after a new note is added, or a full page refresh)
  // This ensures the client-side list is synced with the server's data when it updates.
  useEffect(() => {
    setCurrentNotes(initialNotes);
  }, [initialNotes]);

  // Use useMemo to efficiently filter notes whenever filterText or internal notes state change
  const filteredNotes = useMemo(() => {
    if (!filterText) {
      return currentNotes; // Return all notes from internal state if filter is empty
    }

    const lowerCaseFilterText = filterText.toLowerCase();

    return currentNotes.filter((note) =>
      note.title.toLowerCase().includes(lowerCaseFilterText),
    );
  }, [currentNotes, filterText]); // Depend on internal notes state

  // Function to remove a note by ID - passed to DeleteNoteButton
  const handleNoteDeleted = (deletedNoteId: string) => {
    setCurrentNotes((prevNotes) =>
      prevNotes.filter((note) => note._id !== deletedNoteId),
    );
  };

  // Determine what message to show based on the current state
  const isInitialEmpty = initialNotes.length === 0;
  const isFilteredEmpty = filteredNotes.length === 0;
  const isFiltering = filterText.length > 0;

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
        {isInitialEmpty && !isFiltering ? ( // Case 1: No notes ever loaded and no filter applied
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No notes found. Create your first note!
              </p>
            </CardContent>
          </Card>
        ) : isFilteredEmpty && isFiltering ? ( // Case 2: Notes exist, but filter yields no results
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No notes found matching &quot;{filterText}&quot;.
              </p>
            </CardContent>
          </Card>
        ) : (
          // Case 3: Display filtered notes (which might be all notes if no filter)
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
                      <CardTitle>
                        {note.title.slice(0, 28)}
                        {note.title.length > 28 ? "..." : ""}
                      </CardTitle>
                      {/* Display a truncated version of the content */}
                      <CardDescription>
                        {note.content.slice(0, 28)}
                        {note.content.length > 28 ? "..." : ""}
                      </CardDescription>
                    </CardHeader>
                  </Link>
                  <CardFooter className="flex justify-end">
                    {/* Pass the handler to DeleteNoteButton */}
                    <DeleteNoteButton
                      noteId={note._id}
                      onNoteDeleted={handleNoteDeleted} // <-- NEW PROP PASSED
                    />
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
