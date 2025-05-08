import { processEventbriteOrder } from "./order-processor";
import { processDogs } from "./dog-processor";

// Process all orders from Eventbrite
export const processEventbriteOrders = async (
  eventbriteOrders: any[],
  eventId: string,
  setRlsError: (value: boolean) => void,
  setErrorMessage: (value: string | null) => void
) => {
  // Create a map to track dog registration data per owner
  const dogRegistrations: Record<string, { owner: string; dogs: string[] }> = {};

  // First pass: process orders and identify all dogs and their owners
  for (const order of eventbriteOrders) {
    // Skip cancelled orders
    if (order.status === 'cancelled') {
      continue;
    }

    // Process the order and its attendees
    const shouldStop = await processEventbriteOrder(
      order,
      eventId,
      setRlsError,
      setErrorMessage
    );
    if (shouldStop) return false;

    // Track dogs from this order
    for (const attendee of order.attendees || []) {
      if (!attendee.profile || !attendee.profile.email) {
        continue;
      }

      const isDog = attendee.ticket_class_name === "Mutts Access Pass (For Dogs)";

      if (isDog) {
        const ownerEmail = attendee.profile.email;
        const dogName = attendee.profile.first_name || "";

        if (!dogRegistrations[ownerEmail]) {
          dogRegistrations[ownerEmail] = {
            owner: ownerEmail,
            dogs: [],
          };
        }

        dogRegistrations[ownerEmail].dogs.push(dogName);
      }
    }
  }

  // Process and save all dogs in a separate pass
  for (const ownerEmail in dogRegistrations) {
    const { dogs } = dogRegistrations[ownerEmail];
    const shouldStop = await processDogs(
      ownerEmail,
      dogs,
      eventId,
      setRlsError,
      setErrorMessage
    );
    if (shouldStop) return false;
  }

  return true;
};
