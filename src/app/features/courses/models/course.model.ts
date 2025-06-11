// Pour les options des dropdowns (Villes, Quartiers, Magasins, Coursiers)

// Réponse générique pour les API de sélection qui retournent {success, data: [...]}
export interface ApiSelectOptionsResponse {
  success: boolean;
  data: any[]; // Sera typé plus précisément par le mapping (ex: DropdownOption[])
  message?: string;
  issues?: any; // Vu dans votre API quartiers
}

// Si une API retourne directement un tableau d'objets (ex: /select/villes si elle retourne ApiVilleInfo[])
export interface ApiVilleInfo {
  id: number;
  libelle: string; // ou 'name', adaptez selon la réponse réelle de /select/villes
}

export interface ApiCoursierInfo { // Pour /coursiers/byCity/{id}
  id: number;
  fullname: string; // ou 'name', adaptez
  // Ajoutez d'autres champs si nécessaire
}

export interface ApiMagasinInfo { // Pour l'endpoint des magasins par ville
  id: number;
  fullname: string; // ou 'name' ou 'nom', adaptez
  // ... autres champs pertinents du magasin
}


// Interfaces pour la structure de la réponse API de la liste des courses (mycourses/bis)
// (Ces interfaces sont basées sur une analyse précédente de votre API, ajustez si besoin)
export interface ApiCourseInfo {
  id: number;
  ref: string;
  contenu: string;
  statut: number;
  statut_human: string;
  coursiers_ids: number[];
  coursier_name: string | null; // Nom du coursier déjà formaté
  badge: string;
  date_livraison: string; // Format YYYY-MM-DD HH:MM:SS
  date_creation: string;  // Format YYYY-MM-DD HH:MM:SS
  date_modification: string; // Format YYYY-MM-DD HH:MM:SS
}

export interface ApiCourseOrders {
  id_livraison: number;
  module_id: number;
  module: string;
  magasin_id: number;
  magasin: string; // Nom du magasin
  montant_livraison: string;
  montant_recuperation: string;
  montant_expedition: string;
  montant_achat: string;
  montant_total: number; // Déjà un nombre ici
}

export interface ApiClient { // Pour sender et receiver
  id: number;
  fullname: string;
  username: string | null;
  email: string | null;
  telephone: string | null;
  telephone_alt: string | null;
}

export interface ApiAddress {
  id: number;
  titre: string | null;
  adresse: string | null; // Adresse complète
  quartier: string | null; // Nom du quartier
  quartier_id: number | null;
  zone: string | null;
  zone_id: number | null;
  ville: string | null; // Nom de la ville
  ville_id: number | null;
  pays: string | null;
}

export interface ApiSender extends ApiClient {
  address?: ApiAddress;
}

export interface ApiReceiver extends ApiClient {
  address?: ApiAddress;
}

export interface ApiMagasinDetails { // Pour la section 'magasin' de l'API course
  id: number;
  nom: string;
  partenaire_id: number;
  description: string;
}

export interface ApiPreparationColis {
  id: number;
  statut: string; // ex: "a preparer", "remis"
}

export interface ApiPaiement {
  id_paiement: number;
  montant_total: string;
  montant_recuperation: string;
  montant_expedition: string;
}

export interface ApiStockItem {
  stock_course_id: number;
  statut: string;
  coursier: string; // Nom du coursier pour cet item de stock
  coursier_id: number;
}

export interface CourseModel {
  encaissement: number; // 0 ou 1
  infos: ApiCourseInfo;
  stock: ApiStockItem[];
  preparation_colis: ApiPreparationColis;
  client: ApiClient; // Semble redondant si sender/receiver sont utilisés
  sender: ApiSender;
  receiver: ApiReceiver;
  paiement: ApiPaiement;
  orders: ApiCourseOrders;
  magasin: ApiMagasinDetails; // Détails du magasin
}

// Réponse pour l'API des courses
export interface ApiCoursesSuccessResponse {
  success: true;
  message: string;
  data: CourseModel[];
  count?: number;
  _version?: string | null;
  _locale?: string;
  _timezone?: string;
}

export interface ApiCoursesValidationErrorResponse {
  success?: false; // Peut être false ou absent
  message?: string;
  errors?: { [key: string]: string[] | undefined; }; // Laravel validation errors
  // Champs spécifiques d'erreur de date vus dans votre exemple
  from_date?: string[];
  to_date?: string[];
  field_date?: string[];
}


export interface Course {
  id: string; // ID de la course (infos.id)
  codeCourse: string; // infos.ref
  coursiers?: string; // infos.coursier_name
  statut?: number; // Mappé depuis infos.statut ou infos.statut_human
  montantAchats: number; // orders.montant_achat
  montantLivraison: number; // orders.montant_livraison
  montantExpedition: number; // orders.montant_expedition
  montantRecuperation: number; // paiement.montant_recuperation
  montantTotal: number; // orders.montant_total
  colisStatut: string; // preparation_colis.statut
  colisDetails?: string; // stock.find(s => s.statut === 'retourne')?.coursier
  dateCreation: string; // infos.date_creation
  dateLivraison?: string; // infos.date_livraison
  dateModification?: string; // infos.date_modification
  adresseLivraison?: string; // receiver.address.adresse ou quartier
  ville?: string; // receiver.address.ville ou sender.address.ville
  magasin?: string; // magasin.nom (ou orders.magasin si c'est le nom)
  client?: {
    nom?: string; // receiver.fullname
    telephone?: string; // receiver.telephone
  };
  // Champs bruts de l'API pour référence ou logique spécifique
  statutApiCode?: number; // infos.statut
  badgeApi?: string; // infos.badge
  module?: string; // orders.module
  contenu?: string; // infos.contenu
  statutHuman?: string; // infos.statut_human
}

export interface OrderRequestModel {
  field_date?: string;
  from_date?: string;
  gratuite_pour?: string;
  magasins?: number | null;
  origin?: string;
  per_page?: 500;
  quartier?: string;
  quartier_type?: string;
  search_coursier?: string;
  search_customer?: string;
  status?: number | null;
  to_date?: string;
  tri_date?: string;
  type_course_code?: string;
  ville?: number | null;
  zone_id?: number | null;
}
