
import { useState, useEffect, useMemo } from "react";
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
  const [fetchedEmailSets, setFetchedEmailSets] = useState<string[]>([]);

  // Memoize the emails and event IDs to prevent unnecessary re-renders
  const { emails, emailsKey, eventIds } = useMemo(() => {
    // Get unique emails
    const uniqueEmails = [...new Set(attendees.map((attendee) => attendee.email))];
    // Create a stable key for comparison
    const emailsString = uniqueEmails.sort().join(',');
    // Get unique event IDs
    const uniqueEventIds = [...new Set(attendees.map(attendee => attendee.event_id).filter(Boolean))];
    
    return {
      emails: uniqueEmails,
      emailsKey: emailsString,
      eventIds: uniqueEventIds
    };
  }, [attendees]);

  // Fetch dogs for all attendees
  useEffect(() => {
    // Skip if we've already fetched this exact set of emails
    if (fetchedEmailSets.includes(emailsKey) || emails.length === 0) {
      return;
    }

    const fetchDogs = async () => {
      setIsLoadingDogs(true);
      try {
        if (emails.length === 0) {
          setDogsMap({});
          return;
        }

        console.log(`Fetching dogs for ${emails.length} unique emails`);

        // Create a query to fetch dogs by owner email
        const { data: dogsData, error } = await supabase
          .from("dogs")
          .select("*")
          .in("owner_email", emails);

        if (error) {
          console.error("Error fetching dogs:", error);
          return;
        }

        console.log(`Retrieved ${dogsData.length} dogs from database`);

        // Group dogs by owner email
        const dogsByOwner: Record<string, Dog[]> = {};
        dogsData.forEach((dog: Dog) => {
          if (!dogsByOwner[dog.owner_email]) {
            dogsByOwner[dog.owner_email] = [];
          }
          dogsByOwner[dog.owner_email].push(dog);
        });

        console.log(`Grouped dogs by ${Object.keys(dogsByOwner).length} owners`);
        setDogsMap(dogsByOwner);
        
        // Remember that we've fetched this set of emails
        setFetchedEmailSets(prev => [...prev, emailsKey]);
      } catch (error) {
        console.error("Error fetching dogs:", error);
      } finally {
        setIsLoadingDogs(false);
      }
    };

    fetchDogs();
  }, [emails, emailsKey, eventIds, fetchedEmailSets]);

  return { dogsMap, isLoadingDogs };
}
