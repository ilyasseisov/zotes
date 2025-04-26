import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";
import Link from "next/link";
import { getAllNotesAction } from "@/lib/actions/note.actions";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import DeleteNoteButton from "@/components/delete-note-button";

export default async function Home() {
  // data fetching
  // Fetch all notes when the page loads
  const notes = await getAllNotesAction();

  // return
  return (
    <>
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Zotes</h1>
          <p className="mt-1 text-muted-foreground">
            A minimalist notes application
          </p>
        </header>

        <div className="mb-6 flex justify-end">
          <Button asChild>
            <Link href={ROUTES.NEW_NOTE}>+ New note</Link>
          </Button>
        </div>

        <section>
          <ul className="grid grid-cols-12 gap-4">
            {notes.map((note) => (
              <li
                className="col-span-12 sm:col-span-6 md:col-span-4"
                key={note._id}
              >
                <Card>
                  <Link href={ROUTES.SINGLE_NOTE(note._id)}>
                    <CardHeader>
                      <CardTitle>{note.title}</CardTitle>
                      <CardDescription>
                        {note.content.slice(0, 28) + "..."}
                      </CardDescription>
                    </CardHeader>
                  </Link>
                  <CardFooter className="flex justify-end">
                    <DeleteNoteButton noteId={note._id} />
                  </CardFooter>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
