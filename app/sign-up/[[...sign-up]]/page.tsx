import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
      <SignUp />
    </div>
  );
}
