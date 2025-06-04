import { SignIn } from "@clerk/nextjs";

export default function Page() {
  // local vars
  // return
  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
      <SignIn
        path="/notes/sign-in"
        signUpUrl="/notes/sign-up"
        routing="path"
        oauthFlow="redirect"
      />
    </div>
  );
}
