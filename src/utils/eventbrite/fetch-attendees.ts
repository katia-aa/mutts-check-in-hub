
import { supabase } from "@/integrations/supabase/client";

// Fetch attendees from Eventbrite via edge function with timeout
export const fetchEventbriteAttendees = async () => {
  const responsePromise = supabase.functions.invoke("fetch-eventbrite");
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(
      () =>
        reject(
          new Error("Connection timeout: Could not reach the edge function")
        ),
      10000
    );
  });

  return Promise.race([responsePromise, timeoutPromise]);
};
