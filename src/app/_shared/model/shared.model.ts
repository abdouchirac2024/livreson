export interface OrderStatus {
  id?: number | null,
  name?: string,
}

export interface CityModel {
  id?: number,
  libelle?: string,
}

export interface ShopModel {
  id?: number;
  nom?: string;
  slug?: string;
  ville_id?: number;
  is_active?: number;
}

export interface ZoneModel {
  id?: number;
  libelle?: string;
  city_id?: number;
  is_active?: number;
}

export interface DropdownOption {
  id?: any;
  name?: string;
  code?: string | null;
  libelle?: string;

  [key: string]: any;
}
