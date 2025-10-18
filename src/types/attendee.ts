
export interface Attendee {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  has_dog: boolean;
  da2pp_vaccine: boolean;
  rabies_vaccine: boolean;
  bordetella_vaccine: boolean;
  signature_svg: string | null;
  created_at: string;
  updated_at: string;
}
