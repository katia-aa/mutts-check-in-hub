
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Handle database errors from the sync process
export const handleDatabaseError = (error: any, setRlsError: (value: boolean) => void, setErrorMessage: (value: string | null) => void) => {
  if (error.code === "42501" || error.message?.includes("row-level security")) {
    setRlsError(true);
    setErrorMessage(
      "Row Level Security policy violation: The database is preventing insertion of attendee data."
    );
    return true;
  }
  return false;
};

// Handle sync errors from the Eventbrite sync process
export const handleSyncError = (error: any, setConnectionError: (value: boolean) => void, setErrorMessage: (value: string | null) => void, setRlsError: (value: boolean) => void) => {
  console.error("Error fetching Eventbrite attendees:", error);

  if (
    error.message?.includes("timeout") ||
    error.message?.includes("Failed to fetch")
  ) {
    setConnectionError(true);
    setErrorMessage(
      "Connection issue: Could not reach the edge function. This might be a network problem or the function might be offline."
    );
  } else if (
    error.code === "42501" ||
    error.message?.includes("row-level security")
  ) {
    setRlsError(true);
    setErrorMessage(
      "Row Level Security policy violation: The database is preventing insertion of attendee data."
    );
  } else {
    setErrorMessage(
      error.message || "Failed to fetch Eventbrite attendees"
    );
  }

  // Display appropriate toast message
  toast({
    variant: "destructive",
    title: "Error",
    description: error.message?.includes("API key")
      ? "API key configuration error. Please check your Eventbrite API key in Supabase secrets."
      : error.message?.includes("timeout") ||
        error.message?.includes("Failed to fetch")
      ? "Connection issue with the edge function"
      : error.code === "42501" ||
        error.message?.includes("row-level security")
      ? "Row Level Security policy violation"
      : "Failed to fetch Eventbrite attendees",
  });
};

// Show success toast for successful sync
export const showSuccessToast = () => {
  toast({
    title: "Success",
    description: "Attendees and dogs synced with Eventbrite",
  });
};
