export interface EncaissementModel {
  course_code?: string,
  date_livraison?: string,
  course_id?: number,
  facture_id?: number,
  magasin?: string,
  commande_id?: number,
  coursier?: string,
  coursier_id?: number,
  client?: string,
  telephone?: string,
  quartier?: string,
  description?: string,
  vill?: string,
  cancellation_reason?: string,
  statut?: string,
  code_statut?: number,
  mode_paiement?: string,
  cashier_user_agent?: string,
  msisdn_paiement?: string,
  statut_paiement?: string,
  achat?: string,
  montan?: string,
  recuperation?: string,
  expedition?: string,
  frais_total?: string,
  total?: string,
  mode_paiement_label?: string,
  statut_paiement_label?: string,
  montant_encaisse?: number,
  reste_a_encaisse?: number,
  mode_encaissement?: string,
  caissier_encaissement?: string,
}


export interface EncaissementRequest {
  coursier_id?: number | null,
  date?: string,
  date_field?: string,
  endDate?: string,
  magasin_id?: number | null,
  mode_paiement?: number | null,
  order_by?: string,
  statut_paiement?: string | null
  ville_id?: number | null
}


export enum EncaissementStatut{
  non_encaiss = 'non encaissé',
  encaiss = 'encaissé'
}
