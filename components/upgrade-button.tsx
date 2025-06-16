"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Assuming you have a useToast hook setup
// import { useToast } from "@/hooks/use-toast";

export default function UpgradeButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast(); // Uncomment if you have toast

  const handleUpgrade = async () => {
    setIsLoading(true); // Set loading to true when process starts
    try {
      const response = await fetch("/api/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl;
        // The component will unmount as the browser navigates,
        // so no need to call setIsLoading(false) here.
        // The button will remain disabled until the new page loads.
      } else {
        // Handle error if the server didn't provide a checkout URL
        console.error("Error:", data.error || "No checkout URL returned.");
        // Show a toast message for the user
        // toast({
        //   title: "Upgrade Failed",
        //   description: data.error || "Could not initiate upgrade. Please try again.",
        //   variant: "destructive",
        // });
        setIsLoading(false); // <--- Only reset loading on client-side error/non-redirect
      }
    } catch (error) {
      console.error("Failed to initiate upgrade:", error);
      // Show a toast message for the user on network/fetch error
      toast({
        title: "Network Error",
        description:
          "Failed to connect to the upgrade service. Please check your internet connection.",
        variant: "destructive",
      });
      setIsLoading(false); // <--- Only reset loading on network/fetch error
    }
    // Removed the finally block because setIsLoading(false) is now handled in specific error cases
    // and is not needed on successful redirection.
  };

  return (
    <Button
      onClick={handleUpgrade}
      variant="outline"
      size="sm"
      disabled={isLoading}
    >
      {isLoading ? "Redirecting..." : "Upgrade"}
    </Button>
  );
}
