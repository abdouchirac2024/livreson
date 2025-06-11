// src/app/features/stocks/model/stock.model.ts
import {DropdownOption} from '../../../_shared/model/shared.model';

export interface StockModel {
  course_id?: number;
  code_course?: string;
  created_at?: string;
  date_livraison?: string;
  magasin_id?: number;
  id_lieu_livraison?: number;
  magasin?: string;
  commande_id?: number;
  statut_course?: string;
  coursier_id?: number; // ID du coursier assigné à la course
  stock_course_id?: number;
  coursier_stock_id?: number; // ID du coursier qui a physiquement le stock
  gestionnaire_id?: number;
  statut_transfert?: string; // Statut du transfert de stock (ex: "en attente", "possede")
  coursier_stock?: string; // Nom du coursier qui a physiquement le stock (si disponible directement)
  gestionnaire?: string;
  coursier?: { fullname?: string, id?: number }; // Objet représentant le coursier assigné (peut contenir nom et ID)
  panier?: any[]; // Devrait être typé plus précisément si la structure est connue, ex: { description: string }[]
  aLeStock?: boolean; // Booléen indiquant si le coursier assigné a le stock
  stock_course?: { statut_transfert?: string }; // Objet imbriqué pour le statut de transfert si structuré ainsi
}

export interface StockRequest {
  coursier_id?: number | null;
  coursier_stock_id?: number | null;
  date?: string;
  date_field?: string;
  ecart?: number;
  endDate?: string;
  magasin_id?: number | null;
  order_by?: string;
  statut_course_id?: number | null;
  statut_transfert?: string | null;
  ville_id?: number | null;
}

export const STOCK_STATUS: ReadonlyArray<DropdownOption> = [
  {name: 'En attente', code: 'en attente'},
  {name: 'Livré', code: 'livre'},
  {name: 'Retourné', code: 'retourne'},
  {name: 'Retour confirmé', code: 'retour confirme'},
  {name: 'Possède', code: 'possede'},
];

export interface TransferStockRequest {
  course_id: number | string; // L'ID de la course
  coursier: number | string;  // L'ID du coursier à qui transférer
  stock_hors_panier: boolean; // Si le stock hors panier est concerné
  stock_panier: boolean;      // Si le stock du panier est concerné
}

export interface ReturnStockRequest {
  stock_course_id: number;
}