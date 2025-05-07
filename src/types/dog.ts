
export interface Dog {
  id: string;
  name: string;
  owner_email: string;
  event_id?: string | null;
  vaccine_file_path?: string | null;
  vaccine_file_url?: string | null;
  vaccine_file_paths?: string[] | null;
  vaccine_file_urls?: string[] | null;
  vaccine_upload_status: boolean;
  created_at?: string;
  updated_at?: string;
}
