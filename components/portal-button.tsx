"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePathname } from "next/navigation";

export default function PortalButton() {
  const { toast } = useToast();
  const pathname = usePathname();

  const handlePortal = async () => {
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
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not access customer portal",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to access portal",
      });
      console.error("Portal error:", error);
    }
  };

  return (
    <Button onClick={handlePortal} variant="outline" size="sm">
      Manage Subscription
    </Button>
  );
}
