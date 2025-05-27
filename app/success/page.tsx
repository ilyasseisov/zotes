import Link from "next/link";
import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";

const Page = () => {
  // data fetching
  // hooks
  // local variables
  // functions
  // return
  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-6 text-center">
      <h1 className="text-3xl font-bold">Thank You for Your Purchase!</h1>
      <p className="text-lg text-muted-foreground">
        We appreciate your support. You can now start using the Notes App.
      </p>
      <Button asChild>
        <Link href={ROUTES.APP}>Go to Notes App</Link>
      </Button>
    </div>
  );
};

export default Page;
