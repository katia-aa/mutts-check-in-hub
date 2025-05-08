import { supabase } from "@/integrations/supabase/client";
import { handleDatabaseError } from "./error-handlers";

// Process an order from Eventbrite
export const processEventbriteOrder = async (
  order: any,
  eventId: string,
  setRlsError: (value: boolean) => void,
  setErrorMessage: (value: string | null) => void
) => {
  // Skip cancelled orders
  if (order.status === 'cancelled') {
    return false;
  }

  // Process each attendee in the order
  for (const attendee of order.attendees || []) {
    if (!attendee.profile || !attendee.profile.email) {
      console.warn("Skipping attendee without email:", attendee);
      continue;
    }

    const isDog = attendee.ticket_class_name === "Mutts Access Pass (For Dogs)";

    if (!isDog) {
      // Process as human attendee
      const { error } = await supabase.from("attendees").upsert(
        {
          email: attendee.profile.email,
          name: `${attendee.profile.first_name} ${attendee.profile.last_name}`,
          eventbrite_id: attendee.id,
          event_id: eventId,
          vaccine_upload_status: false,
          order_id: order.id, // Add order ID for reference
        },
        {
          onConflict: "email",
        }
      );

      if (error) {
        console.error("Error syncing attendee:", error);
        return handleDatabaseError(error, setRlsError, setErrorMessage);
      }
    }
  }

  return false;
}; 