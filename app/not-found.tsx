import Link from "next/link";

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="mb-6 text-4xl font-bold">Not Found</h1>
      <Link href="/notes" className="text-blue-500 underline">
        Return to Notes
      </Link>
    </div>
  );
};

export default NotFound;
