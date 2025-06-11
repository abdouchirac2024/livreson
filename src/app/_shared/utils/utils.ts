export enum CourseStatus {
  A_TRAITER = 'A Traiter',
  NON_ASSIGNE = 'Non assigné',
  ASSIGNE = 'Assigné',
  DEMARRE = 'Démarré',
  EN_COURS = 'En cours de livraison',
  TERMINE = 'Terminé',
  ANNULE = 'Annulé',
  A_RELANCER = 'A Relancer',
  AVALIDER = 'A Valider',
  STOCK_BLOQUE = 'Stock bloqué',
  COLIS_BLOQUE = 'Colis bloqué',
  VALIDE = 'Validé'
}

export enum TypeCourse {
  CLASSIC = 'CLASSIC',
  EXPRESS = 'EXPRESS',
  EXPEDITION = 'EXPEDITION',
  RECUPERATION = 'RECUPERATION',
  INTERNE = 'INTERNE',
  PANIER_VIDE = 'PANIER VIDE',
}

export enum OrderStatusCode {
  A_TRAITER = 1000,
  NON_ASSIGNE = 0,
  ASSIGNE = 1,
  DEMARRE = 2,
  EN_COURS = 3,
  TERMINE = 4,
  ANNULE = 5,
  A_RELANCER = 6,
  AVALIDER = 7,
  STOCK_BLOQUE = 8,
  COLIS_BLOQUE = 9,
  VALIDE = 10
}


