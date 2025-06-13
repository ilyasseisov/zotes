import ROUTES from "@/constants/routes";
import Link from "next/link";

const Page = () => {
  // data fetching
  // hooks
  // local variables
  // functions
  // return
  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-6 text-center">
      <h1 className="text-3xl font-bold">
        It Looks Like Your Checkout Was Canceled
      </h1>
      <p className="text-lg text-muted-foreground">
        Your transaction wasn&apos;t completed, and you have not been charged.
      </p>
      <p className="text-lg text-muted-foreground">
        Did something go wrong, or did you have a question?
      </p>
      <p className="text-lg text-muted-foreground">
        We&apos;re here to help! Please contact us directly at{" "}
        <span className="font-semibold">support@zotes.top</span>
      </p>
      <Link className="underline" href={ROUTES.LANDING_PAGE}>
        Back to Home
      </Link>
    </div>
  );
};

export default Page;
