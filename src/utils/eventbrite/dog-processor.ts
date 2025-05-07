
import { supabase } from "@/integrations/supabase/client";
import { handleDatabaseError } from "./error-handlers";

// Generate a default name for dogs when no name is provided
export const generateDefaultDogName = async (ownerEmail: string, index: number): Promise<string> => {
  return `Dog ${index + 1}`;
};

// Delete existing dogs for an owner to avoid duplicates on refresh
export const deleteExistingDogsForOwner = async (
  ownerEmail: string,
  eventId: string,
  setRlsError: (value: boolean) => void,
  setErrorMessage: (value: string | null) => void
) => {
  console.log(`Removing existing dogs for owner ${ownerEmail} in event ${eventId} before adding new ones`);
  
  const { error } = await supabase
    .from("dogs")
    .delete()
    .eq("owner_email", ownerEmail)
    .eq("event_id", eventId);
    
  if (error) {
    console.error(`Error removing existing dogs for ${ownerEmail}:`, error);
    return handleDatabaseError(error, setRlsError, setErrorMessage);
  }
  
  return false;
};

// Process dogs for an owner
export const processDogs = async (
  ownerEmail: string, 
  dogs: string[],
  eventId: string,
  setRlsError: (value: boolean) => void,
  setErrorMessage: (value: string | null) => void
) => {
  console.log(`Processing ${dogs.length} dogs for owner ${ownerEmail} in event ${eventId}`);
  
  // Delete existing dogs for this owner to prevent duplicates on refresh
  const shouldStop = await deleteExistingDogsForOwner(ownerEmail, eventId, setRlsError, setErrorMessage);
  if (shouldStop) return true;
  
  // Add all dogs for this owner from the current sync
  for (let i = 0; i < dogs.length; i++) {
    let dogName = dogs[i];
    
    // If dog has no name or empty name, generate a default name
    if (!dogName || dogName.trim() === '') {
      dogName = await generateDefaultDogName(ownerEmail, i);
    }
    
    console.log(`Adding dog: ${dogName} for owner ${ownerEmail} in event ${eventId}`);
    
    // Insert the dog record with event_id
    const { error: dogError } = await supabase
      .from("dogs")
      .insert({
        name: dogName,
        owner_email: ownerEmail,
        event_id: eventId,
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
