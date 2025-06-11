export interface UsersModel {
  id: number;
  uid: string;
  uuid: string;
  provider_id: string;
  provider_name: string;
  email: string;
  email_masked: string;
  name: string | null;
  fullname: string;
  firstname: string;
  lastname: string;
  telephone: string;
  telephone_masked: string;
  telephone_alt: string | null;
  quote: string | null;
  qualite: string | null;
  ville: string | null;
  description: string | null;
  modules: string | null;
  adresse: string | null;
  last_login_at: string;
  last_login_ip: string;
  onesignal_email_auth_hash: string;
  agenda: string | null;
  nbre_courses_distribuable: number | null;
  caution_incrementation_courses_distribuable: number | null;
  magasins_ids: any[];
  email_verified_at: string;
  phone_verified_at: string;
  roles: string[];
  permissions: any[];
  city: number[];
  zones: any[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface DeliveryMan{
  id?: number;
  fullname?: string;
  email?: string;
  statut?: number;
  telephone?: string;
  ville?: {
    ville_id?: number,
    name?: string
  }
}
