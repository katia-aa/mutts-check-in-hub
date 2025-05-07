
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Error handling utilities
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

// Process a human attendee from Eventbrite
export const processHumanAttendee = async (
  attendee: any,
  setRlsError: (value: boolean) => void,
  setErrorMessage: (value: string | null) => void
) => {
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
    return handleDatabaseError(error, setRlsError, setErrorMessage);
  }
  return false;
};

// Process dogs for an owner
export const processDogs = async (
  ownerEmail: string, 
  dogs: string[],
  setRlsError: (value: boolean) => void,
  setErrorMessage: (value: string | null) => void
) => {
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
      if (handleDatabaseError(dogError, setRlsError, setErrorMessage)) {
        return true; // Stop processing if RLS error
      }
    }
  }
  return false;
};

// Fetch attendees from Eventbrite via edge function
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

// Process all attendees from Eventbrite 
export const processEventbriteAttendees = async (
  eventbriteAttendees: any[],
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
      const shouldStop = await processHumanAttendee(attendee, setRlsError, setErrorMessage);
      if (shouldStop) return false;
    }
  }

  // Process and save all dogs in a separate pass to ensure all human records exist first
  for (const ownerEmail in dogRegistrations) {
    const { dogs } = dogRegistrations[ownerEmail];
    const shouldStop = await processDogs(ownerEmail, dogs, setRlsError, setErrorMessage);
    if (shouldStop) return false;
  }

  return true;
};

// Handle sync errors
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

// Show success toast
export const showSuccessToast = () => {
  toast({
    title: "Success",
    description: "Attendees and dogs synced with Eventbrite",
  });
};
