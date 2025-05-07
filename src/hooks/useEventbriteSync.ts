
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
          15000
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

      // Process attendees and identify humans vs dogs
      for (const attendee of eventbriteAttendees) {
        // Skip entries without profiles
        if (!attendee.profile || !attendee.profile.email) {
          console.warn("Skipping attendee without email:", attendee);
          continue;
        }

        // Extract common data
        const email = attendee.profile.email;
        const name = `${attendee.profile.first_name} ${attendee.profile.last_name}`;
        const eventbriteId = attendee.id;

        // Check if this is a dog entry or a human
        const isDog = attendee.answers?.some(answer => 
          answer.question_id === "dog_identifier_question" && answer.answer === "yes"
        );

        // If it's a dog, get the owner information
        let ownerId = null;
        if (isDog) {
          const ownerAnswer = attendee.answers?.find(answer => 
            answer.question_id === "owner_identifier_question"
          );
          ownerId = ownerAnswer?.answer || null;
        }

        // Generate a unique guest ID for relationship mapping
        const guestId = `guest_${eventbriteId}`;

        // Upsert the attendee record
        const { error } = await supabase.from("attendees").upsert(
          {
            email: email,
            name: name,
            eventbrite_id: eventbriteId,
            vaccine_upload_status: false,
            is_dog: isDog,
            owner_id: ownerId,
            guest_id: guestId,
          },
          {
            onConflict: "email",
          }
        );

        if (error) {
          console.error("Error syncing attendee:", error);
          if (
            error.code === "42501" ||
            error.message?.includes("row-level security")
          ) {
            setRlsError(true);
            setErrorMessage(
              "Row Level Security policy violation: The database is preventing insertion of attendee data."
            );
            break;
          }
        }
      }

      await onSyncComplete();
      toast({
        title: "Success",
        description: "Attendees synced with Eventbrite",
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
