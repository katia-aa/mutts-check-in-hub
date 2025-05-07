
import { supabase } from "@/integrations/supabase/client";
import { handleDatabaseError } from "./error-handlers";

// Process a human attendee from Eventbrite
export const processHumanAttendee = async (
  attendee: any,
  eventId: string,
  setRlsError: (value: boolean) => void,
  setErrorMessage: (value: string | null) => void
) => {
  const { error } = await supabase.from("attendees").upsert(
    {
      email: attendee.profile.email,
      name: `${attendee.profile.first_name} ${attendee.profile.last_name}`,
      eventbrite_id: attendee.id,
      event_id: eventId,
      vaccine_upload_status: false,
    },
    {
      onConflict: "email",
    }
  );

  if (error) {
    console.error("Error syncing attendee:", error);
    return handleDatabaseError(error, setRlsError, setErrorMessage);
  }
  return false;
};
