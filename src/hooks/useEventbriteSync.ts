
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

      // Process attendees and identify dogs
      // Create a map to track dog registration data per owner
      const dogRegistrations: Record<string, { owner: string, dogs: string[] }> = {};
      
      // First pass: identify all dogs and their owners
      for (const attendee of eventbriteAttendees) {
        if (!attendee.profile || !attendee.profile.email) {
          console.warn("Skipping attendee without email:", attendee);
          continue;
        }

        const isDog = attendee.ticket_class_name === "Mutts Access Pass (For Doggos)";
        
        if (isDog) {
          const ownerEmail = attendee.profile.email;
          const dogName = attendee.profile.first_name;
          
          // Track this dog registration
          if (!dogRegistrations[ownerEmail]) {
            dogRegistrations[ownerEmail] = { 
              owner: ownerEmail, 
              dogs: []
            };
          }
          
          // Prevent duplicate dog names (just in case)
          if (!dogRegistrations[ownerEmail].dogs.includes(dogName)) {
            dogRegistrations[ownerEmail].dogs.push(dogName);
          }
        } else {
          // Process as human attendee
          const { error } = await supabase.from("attendees").upsert(
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
      }

      // Process and save all dogs in a separate pass to ensure all human records exist first
      for (const ownerEmail in dogRegistrations) {
        const { dogs } = dogRegistrations[ownerEmail];
        console.log(`Processing ${dogs.length} dogs for owner ${ownerEmail}`);
        
        for (const dogName of dogs) {
          console.log(`Adding dog: ${dogName} for owner ${ownerEmail}`);
          
          // First check if this exact dog already exists
          const { data: existingDogs } = await supabase
            .from("dogs")
            .select("id, name")
            .eq("owner_email", ownerEmail)
            .eq("name", dogName);
            
          // Skip if the exact dog already exists
          if (existingDogs && existingDogs.length > 0) {
            console.log(`Dog ${dogName} already exists for owner ${ownerEmail}, skipping`);
            continue;
          }
          
          // Insert the dog record
          const { error: dogError } = await supabase
            .from("dogs")
            .insert({
              name: dogName,
              owner_email: ownerEmail,
              vaccine_upload_status: false,
            });

          if (dogError) {
            console.error(`Error syncing dog ${dogName}:`, dogError);
            if (
              dogError.code === "42501" ||
              dogError.message?.includes("row-level security")
            ) {
              setRlsError(true);
              setErrorMessage(
                "Row Level Security policy violation: The database is preventing insertion of dog data."
              );
              break;
            }
          }
        }
      }

      await onSyncComplete();
      toast({
        title: "Success",
        description: "Attendees and dogs synced with Eventbrite",
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
