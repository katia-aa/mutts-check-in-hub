
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Attendee } from "@/types/attendee";

export const useEventbriteSync = (onSyncComplete: () => Promise<void>) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState(false);
  const [rlsError, setRlsError] = useState(false);
  const { toast } = useToast();

  const syncEventbriteAttendees = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setConnectionError(false);
    setRlsError(false);

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () =>
            reject(
              new Error("Connection timeout: Could not reach the edge function")
            ),
          10000
        );
      });

      const responsePromise = supabase.functions.invoke("fetch-eventbrite");
      const response: any = await Promise.race([
        responsePromise,
        timeoutPromise,
      ]);

      if (response.error) {
        console.error("Supabase function error:", response.error);
        throw new Error(`Function error: ${response.error.message}`);
      }

      if (response.data?.error) {
        console.error("Edge function returned error:", response.data.error);
        throw new Error(response.data.error);
      }

      const eventbriteAttendees = response.data?.attendees || [];
      let processedCount = 0;
      let skippedCount = 0;
      let groupTicketsCount = 0;

      if (eventbriteAttendees.length === 0) {
        console.warn("No attendees found in Eventbrite response");
      }

      if (response.data?.rlsError) {
        console.error("RLS error:", response.data.rlsError);
        setRlsError(true);
        setErrorMessage(
          "Row Level Security policy violation: The database is preventing the edge function from inserting attendee data."
        );
        await onSyncComplete();
        return;
      }

      for (const attendee of eventbriteAttendees) {
        // Check if this is a group purchase
        const quantity = attendee.quantity || 1;
        
        if (!attendee.profile || !attendee.profile.email) {
          console.warn("Skipping attendee without email:", attendee);
          skippedCount++;
          continue;
        }

        // Create entry for the primary attendee (ticket purchaser)
        const { error: mainError } = await supabase.from("attendees").upsert(
          {
            email: attendee.profile.email,
            name: `${attendee.profile.first_name} ${attendee.profile.last_name}`,
            eventbrite_id: attendee.id,
            vaccine_upload_status: false,
          },
          {
            onConflict: "email",
          }
        );

        if (mainError) {
          console.error("Error syncing main attendee:", mainError);
          if (
            mainError.code === "42501" ||
            mainError.message?.includes("row-level security")
          ) {
            setRlsError(true);
            setErrorMessage(
              "Row Level Security policy violation: The database is preventing insertion of attendee data."
            );
            break;
          }
          continue;
        }
        
        processedCount++;
        
        // If this is a group purchase with multiple tickets
        if (quantity > 1) {
          groupTicketsCount += (quantity - 1);
          
          // Create generic entries for additional guests if needed
          for (let i = 1; i < quantity; i++) {
            const guestEmail = `guest${i}_for_${attendee.profile.email}`;
            const guestName = `Guest ${i} of ${attendee.profile.first_name} ${attendee.profile.last_name}`;
            
            const { error: guestError } = await supabase.from("attendees").upsert(
              {
                email: guestEmail,
                name: guestName,
                eventbrite_id: `${attendee.id}_guest${i}`,
                vaccine_upload_status: false,
              },
              {
                onConflict: "email",
              }
            );
            
            if (guestError) {
              console.error(`Error syncing guest ${i}:`, guestError);
              if (
                guestError.code === "42501" ||
                guestError.message?.includes("row-level security")
              ) {
                setRlsError(true);
                setErrorMessage(
                  "Row Level Security policy violation: The database is preventing insertion of guest attendee data."
                );
                break;
              }
            } else {
              processedCount++;
            }
          }
        }
      }

      await onSyncComplete();
      
      // Enhanced success message with more details
      const successMessage = groupTicketsCount > 0 
        ? `Synced ${processedCount} attendees (including ${groupTicketsCount} guests from group purchases)`
        : `Synced ${processedCount} attendees`;
        
      toast({
        title: "Success",
        description: successMessage,
      });
    } catch (error: any) {
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

      await onSyncComplete();
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    errorMessage,
    connectionError,
    rlsError,
    syncEventbriteAttendees,
  };
};
