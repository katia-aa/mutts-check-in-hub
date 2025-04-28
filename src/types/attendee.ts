
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
}
