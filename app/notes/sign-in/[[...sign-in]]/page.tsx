import { SignIn } from "@clerk/nextjs";

export default function Page() {
  // local vars
  const redirectUrl = `/api/auth/after-signin`;
  // return
  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
      <SignIn forceRedirectUrl={redirectUrl} />
    </div>
  );
}
