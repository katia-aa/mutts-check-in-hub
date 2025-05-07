
import { processHumanAttendee } from "./attendee-processor";
import { processDogs } from "./dog-processor";

// Process all attendees from Eventbrite 
export const processEventbriteAttendees = async (
  eventbriteAttendees: any[],
  eventId: string,
  setRlsError: (value: boolean) => void,
  setErrorMessage: (value: string | null) => void
) => {
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
      const dogName = attendee.profile.first_name || ''; // Allow empty dog names, we'll generate them later
      
      // Track this dog registration
      if (!dogRegistrations[ownerEmail]) {
        dogRegistrations[ownerEmail] = { 
          owner: ownerEmail, 
          dogs: []
        };
      }
      
      // Add this dog to the registration list (even if name is empty)
      dogRegistrations[ownerEmail].dogs.push(dogName);
    } else {
      // Process as human attendee
      const shouldStop = await processHumanAttendee(attendee, eventId, setRlsError, setErrorMessage);
      if (shouldStop) return false;
    }
  }

  // Process and save all dogs in a separate pass to ensure all human records exist first
  for (const ownerEmail in dogRegistrations) {
    const { dogs } = dogRegistrations[ownerEmail];
    const shouldStop = await processDogs(ownerEmail, dogs, eventId, setRlsError, setErrorMessage);
    if (shouldStop) return false;
  }

  return true;
};
