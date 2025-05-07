
export interface Attendee {
  id: string;
  email: string;
  name: string | null;
  vaccine_upload_status: boolean;
  eventbrite_id?: string;
  submissionTime?: string;
  signature_svg?: string | null;
  vaccine_file_path?: string | null;
  vaccine_file_url?: string | null;
  is_guest?: boolean | null;
  parent_ticket_email?: string | null;
  guest_name?: string | null;
}
