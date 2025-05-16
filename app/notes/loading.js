// app/loading.js
import { Loader2 } from "lucide-react"; // Import the spinner icon

// Note: This component can be a Server Component or Client Component.
// Since it's just UI, a Server Component is sufficient and the default.

export default function Loading() {
  return (
    // Use flexbox utilities to center the content vertically and horizontally
    // h-screen makes the container take the full viewport height
    <div className="flex h-screen items-center justify-center">
      {/* Use the Loader2 icon and apply spinning animation */}
      {/* Adjust size (w-8, h-8) and color (text-primary or text-blue-500 etc.) as needed */}
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
