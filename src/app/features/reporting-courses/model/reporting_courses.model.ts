export interface ReportingCoursesModel{
  magasin_id?: number,
  assigne_a?: string,
  statut_reporting_id?: number,
  statut_reporting?: string,
  created_a?: string,
  gestionnaire?: string,
  magasin?: string,
  montant_total_termine?: number,
  montant_total_expedition?: number,
  montant_total_recuperation?: number,
  montant_total_a_deposer?: number,
  total?: number,
  total_depots?: number,
  statut_depot?: string,
}

export interface ReportingCoursesRequest{
  date?: string,
date_field?: string,
ecart?: number
endDate?: string,
gestionnaire_id?: number | null,
magasin_id?: number|null,
reporting_statut_id?: number |null,
statut_course?:string |null,
ville_id?: number | null,
}
