
export interface Attendee {
  id: string;
  email: string;
  name: string | null;
  document_upload_status: boolean;
  vaccine_upload_status: boolean;
  eventbrite_id?: string;
  submissionTime?: string;
}
