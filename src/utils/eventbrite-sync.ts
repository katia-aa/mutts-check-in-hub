// Barrel file that re-exports all functionality from the eventbrite modules

// Export error handling utilities
export { 
  handleDatabaseError,
  handleSyncError,
  showSuccessToast 
} from './eventbrite/error-handlers';

// Export attendee processing functions
export { processHumanAttendee } from './eventbrite/attendee-processor';

// Export dog processing functions
export { 
  generateDefaultDogName,
  deleteExistingDogsForOwner,
  processDogs 
} from './eventbrite/dog-processor';

// Export the fetch function
export { fetchEventbriteOrders } from './eventbrite/fetch-orders';

// Export the main processor
export { processEventbriteOrders } from './eventbrite/sync-processor';

// Export order processing functions
export { processEventbriteOrder } from './eventbrite/order-processor';
