
import { useAttendeeFetch } from "./useAttendeeFetch";
import { useEventbriteSync } from "./useEventbriteSync";

export const useAttendeeSync = () => {
  const { attendees, isLoading: isFetching, fetchAttendees } = useAttendeeFetch();
  const {
    isLoading: isSyncing,
    errorMessage,
    connectionError,
    rlsError,
    syncEventbriteAttendees: syncEventbrite,
  } = useEventbriteSync(fetchAttendees);

  return {
    attendees,
    isLoading: isFetching || isSyncing,
    errorMessage,
    connectionError,
    rlsError,
    syncEventbriteAttendees: syncEventbrite,
    fetchAttendees,
  };
};
