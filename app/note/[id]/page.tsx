import UpdateNoteFormWrapper from "@/components/update-note-form-wrapper";
import { getSingleNoteAction } from "@/lib/actions/note.actions";

const Page = async ({ params }: { params: { id: string } }) => {
  // data fetching
  const { id } = await params;
  // Fetch note when the page loads
  const note = await getSingleNoteAction(id);
  // _id
  // title
  // content

  // hooks
  // local variables
  // functions

  // return
  return (
    <>
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Update note</h1>
        <UpdateNoteFormWrapper note={note} />
      </main>
    </>
  );
};
export default Page;
