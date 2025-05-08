import { useState } from "react";
import { 
  fetchEventbriteOrders, 
  processEventbriteOrders, 
  handleSyncError,
  showSuccessToast
} from "@/utils/eventbrite-sync";

export const useEventbriteSync = (onSyncComplete: () => Promise<void>) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState(false);
  const [rlsError, setRlsError] = useState(false);

  const syncEventbriteOrders = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setConnectionError(false);
    setRlsError(false);

    try {
      const response: any = await fetchEventbriteOrders();

      if (response.error) {
        console.error("Supabase function error:", response.error);
        throw new Error(`Function error: ${response.error.message}`);
      }

      if (response.data?.error) {
        console.error("Edge function returned error:", response.data.error);
        throw new Error(response.data.error);
      }

      const eventbriteOrders = response.data?.orders || [];
      const eventId = response.data?.event_id;

      if (!eventId) {
        console.error("No event ID returned from Eventbrite");
        throw new Error("Missing event ID from Eventbrite response");
      }

      if (eventbriteOrders.length === 0) {
        console.warn("No orders found in Eventbrite response");
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

      // Process all orders from Eventbrite with event ID
      const success = await processEventbriteOrders(
        eventbriteOrders,
        eventId,
        setRlsError,
        setErrorMessage
      );

      if (success) {
        showSuccessToast();
      }

      await onSyncComplete();
    } catch (error: any) {
      handleSyncError(error, setConnectionError, setErrorMessage, setRlsError);
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
    syncEventbriteOrders,
  };
};
