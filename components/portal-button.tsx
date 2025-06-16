// components/portal-button.tsx
"use client";

import { useState } from "react"; // <--- Import useState
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePathname } from "next/navigation";

export default function PortalButton() {
  const { toast } = useToast();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false); // <--- NEW STATE

  const handlePortal = async () => {
    setIsLoading(true); // <--- Set loading to true
    try {
      const response = await fetch("/api/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}${pathname}`,
        }),
      });

      const data = await response.json();

      if (data?.url) {
        window.location.href = data.url;
        // The component will unmount as the browser navigates to the portal,
        // so no need to call setIsLoading(false) here.
        // The button will remain disabled until the new page loads.
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not access customer portal",
        });
        setIsLoading(false); // <--- Only reset loading on client-side error/non-redirect
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to access portal",
      });
      console.error("Portal error:", error);
      setIsLoading(false); // <--- Only reset loading on network/fetch error
    }
  };

  return (
    <Button
      onClick={handlePortal}
      variant="outline"
      size="sm"
      disabled={isLoading} // <--- Disable button when loading
    >
      {isLoading ? "Redirecting..." : "Manage Subscription"}{" "}
      {/* <--- Change button text */}
    </Button>
  );
}
