
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Attendee } from "@/types/attendee";
import { Dog } from "@/types/dog";

interface UseDogsFetcherResult {
  dogsMap: Record<string, Dog[]>;
  isLoadingDogs: boolean;
}

export function useDogsFetcher(attendees: Attendee[]): UseDogsFetcherResult {
  const [dogsMap, setDogsMap] = useState<Record<string, Dog[]>>({});
  const [isLoadingDogs, setIsLoadingDogs] = useState(false);

  // Get unique event IDs from attendees
  const eventIds = [...new Set(attendees.map(attendee => attendee.event_id).filter(Boolean))];

  // Fetch dogs for all attendees
  useEffect(() => {
    const fetchDogs = async () => {
      setIsLoadingDogs(true);
      try {
        // Get all unique emails
        const emails = attendees.map((attendee) => attendee.email);

        if (emails.length === 0) {
          setDogsMap({});
          return;
        }

        // Get all event IDs present in the attendee data
        const eventIdFilters = eventIds.length > 0 
          ? eventIds.map(id => `event_id.eq.${id}`).join(',') 
          : null;

        let query = supabase
          .from("dogs")
          .select("*")
          .in("owner_email", emails);
          
        // Add event_id filter if available
        if (eventIdFilters) {
          query = query.or(eventIdFilters);
        }

        const { data: dogsData, error } = await query;

        if (error) {
          console.error("Error fetching dogs:", error);
          return;
        }

        // Group dogs by owner email
        const dogsByOwner: Record<string, Dog[]> = {};
        dogsData.forEach((dog: Dog) => {
          if (!dogsByOwner[dog.owner_email]) {
            dogsByOwner[dog.owner_email] = [];
          }
          dogsByOwner[dog.owner_email].push(dog);
        });

        setDogsMap(dogsByOwner);
      } catch (error) {
        console.error("Error fetching dogs:", error);
      } finally {
        setIsLoadingDogs(false);
      }
    };

    fetchDogs();
  }, [attendees, eventIds]);

  return { dogsMap, isLoadingDogs };
}
