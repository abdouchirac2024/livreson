export interface PreparationModel {
  course_code?: string;
  date_livraison?: string;
  course_id?: number;
  contenu?: string;
  magasin?: string;
  magasin_id?: number;
  commande_id?: number;
  coursier?: string
  coursier_id?: number;
  client?: string;
  telephone?: string;
  partenaire_id?: number;
  tel_partenaire?: string;
  quartier?: string;
  description?: string;
  ville?: string;
  zone?: string;
  zone_id?: number;
  cancellation_reason?: string;
  statut?: string;
  code_statut?: number;
  preparation_colis_id?: number;
  hors_panier?: number;
  id?: number;
  statut_preparation_colis?: string;
  mode_paiement?: string;
  statut_paiement?: string;
  achat?: string;
  frais_total?: string;
  total?: string;
}

export interface PreparationRequest {
  coursier_id?: number | null;
  date?: string;
  date_field?: string;
  endDate?: string;
  magasin_id?: number | null;
  order_by?: string;
  statut_code?: number | null;
  statut_preparation_colis?: string | null;
  ville_id?: number | null;
  zone_id?: number | null;
}


export enum ColisStatus {
  A_PREPARER = 'a preparer',
  REMIS = 'remis',
  INDISPONIBLE = 'indisponible',
  RETOURNE = 'retourne',
  ENCOURS = 'encours',
  PRET = 'pret',
  A_VERIFIER = 'a verifier',
  A_RECUPERER = 'a recuperer'
}
