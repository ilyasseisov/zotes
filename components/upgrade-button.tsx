"use client";

import { Button } from "@/components/ui/button";

export default function UpgradeButton() {
  // Example frontend code
  const handleUpgrade = async () => {
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
      } else {
        // Handle error
        console.error("Error:", data.error);
      }
    } catch (error) {
      console.error("Failed to initiate upgrade:", error);
    }
  };

  return (
    <Button onClick={handleUpgrade} variant="outline" size="sm">
      Upgrade
    </Button>
  );
}
