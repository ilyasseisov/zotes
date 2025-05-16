import { Button } from "@/components/ui/button";
import UpdateNoteFormWrapper from "@/components/update-note-form-wrapper";
import ROUTES from "@/constants/routes";
import { getSingleNoteAction } from "@/lib/actions/note.actions";
import Link from "next/link";

const Page = async ({ params }: { params: { id: string } }) => {
  // data fetching
  const { id } = await params;
  // Fetch note when the page loads
  let note: Note;
  try {
    note = await getSingleNoteAction(id);
    // _id
    // title
    // content
  } catch (error) {
    console.error("Error fetching note:", error);
    throw new Error("Error fetching note");
  }

  // hooks
  // local variables
  // functions

  // return
  return (
    <>
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Update note</h1>
          <Button asChild type="button" variant="ghost">
            <Link href={ROUTES.APP}>Back to all notes</Link>
          </Button>
        </header>

        <UpdateNoteFormWrapper note={note} />
      </main>
    </>
  );
};
export default Page;
