/**
 * COOPEC-AD/BENIN — Source de données officielle et centrale (Source de vérité)
 * Version 3.0 — Recoupée avec la brochure officielle et le registre du Ministère des Finances (avril 2024).
 * 
 * RÈGLE D'OR : Toute information chiffrée ou institutionnelle affichée sur le site
 * provient exclusivement de cet objet.
 */

const COOPEC_DATA = {
  institution: {
    nomCourt: "COOPEC-AD/BENIN",
    raisonSociale: "COOPEC-AD/BENIN — Coopérative d'Épargne et de Crédit des Assemblées de Dieu du Bénin",
    statutJuridique: "Système Financier Décentralisé (SFD), régi par la loi n°2012-14 du 21 mars 2012",
    agrementBCEAO: "N° A.15.0105.A délivré le 23 novembre 2016 (arrêté N°3830/MEF/DC/DG-ANSSFD/DGA/DAR/SA/064 SGG16)",
    ifu: "6201701436101",
    siegeSocial: "Godomey-Togoudo, Maison CHATIGRE Julie, 2ème rue à droite après l'Église Évangélique des Assemblées de Dieu Temple Universitaire, en quittant le Carrefour IITA pour Tankpè. 02 BP 408 Cotonou.",
    
    // Téléphones : confirmés par le registre officiel (2024) et la brochure
    telephones: ["94 01 78 36", "95 28 20 81", "95 71 95 41"],
    telephonePrincipal: "94 01 78 36",
    telephoneWhatsApp: "+22994017836",
    
    email: "coopec.adbenin@gmail.com",
    siteWeb: "www.coopecadbenin.bj",
    dateCreation: "19 juillet 2008",
    anneeCreation: 2008,
    fondateurs: "Responsables de l'Église nationale des Assemblées de Dieu du Bénin, BUPDOS-ONG et membres de l'église",
    
    vision: "Devenir une institution de microfinance de référence, viable et pérenne, luttant contre la pauvreté et l'exclusion financière au Bénin à l'horizon 2030.",
    mission: "Mobiliser l'épargne, financer les activités génératrices de revenus et promouvoir le bien-être de nos membres.",
    valeurs: [
      { titre: "Honnêteté", description: "Une intégrité irréprochable dans toutes nos opérations et relations avec les membres." },
      { titre: "Transparence", description: "Une gestion claire, traçable et des informations financières toujours vérifiables." },
      { titre: "Responsabilité sociale", description: "Un engagement fort pour l'autonomisation économique et l'inclusion financière locale." },
      { titre: "Altruisme", description: "L'écoute active et la recherche permanente du bien-être et de la prospérité de la communauté." }
    ],
    
    membres: 15000, // Affiché sous forme "+15 000"
    anneesExperience: 16, // Calculé : 2024/2026 depuis 2008 (affiché "+15 ans" ou "+16 ans")
    afficherAffiliationUNACOOPEC: false // Non affiché conformément à la décision de cadrage V3.0
  },

  // Réseau officiel des 12 agences (Valeur figée : exactement 12)
  agences: [
    {
      id: 1,
      nom: "Godomey-Togoudo (Siège)",
      departement: "Atlantique",
      repere: "Avec le siège social, non loin du siège national des Assemblées de Dieu du Bénin",
      telephone: "94 01 78 36 / 94 14 12 04",
      lat: 6.3865,
      lng: 2.3352,
      estSiege: true
    },
    {
      id: 2,
      nom: "Comè",
      departement: "Mono",
      repere: "Sur la voie d'Akodéha, ~200m avant l'hôpital de zone, en quittant le marché de Comè",
      telephone: "94 01 78 38",
      lat: 6.4022,
      lng: 1.8821,
      estSiege: false
    },
    {
      id: 3,
      nom: "Aïbatin II",
      departement: "Littoral",
      repere: "À Missité, à côté de l'école de formation VIDEO LEADER, presqu'en face de la station MRS Gbèdégbé",
      telephone: "94 01 78 37",
      lat: 6.3681,
      lng: 2.3854,
      estSiege: false
    },
    {
      id: 4,
      nom: "Cococodji",
      departement: "Atlantique",
      repere: "En face de la gare routière du marché de Cococodji, à côté de la pharmacie MAGNIFICAT",
      telephone: "55 90 59 34",
      lat: 6.3778,
      lng: 2.2741,
      estSiege: false
    },
    {
      id: 5,
      nom: "Porto-Novo",
      departement: "Ouémé",
      repere: "Non loin du palais des glaces à Akonaboé, en face de la rue TALON",
      telephone: "55 90 59 37",
      lat: 6.4969,
      lng: 2.6288,
      estSiege: false
    },
    {
      id: 6,
      nom: "Parakou",
      departement: "Borgou",
      repere: "Quartier dépôt, au bord du nouveau goudron, au premier carrefour à l'angle droit en quittant le marché",
      telephone: "55 90 59 35",
      lat: 9.3371,
      lng: 2.6303,
      estSiege: false
    },
    {
      id: 7,
      nom: "Bohicon",
      departement: "Zou",
      repere: "Rue menant à l'entrée principale de la gare routière, ancien immeuble de MAHUNA, face quincaillerie DAVAKAN",
      telephone: "99 78 07 81 / 01 94 16 54 15",
      lat: 7.1782,
      lng: 2.0667,
      estSiege: false
    },
    {
      id: 8,
      nom: "Azovè",
      departement: "Couffo",
      repere: "Quartier Dokponouhoue, à environ 300m des bureaux de l'arrondissement, au bord de l'axe Azovè-Bohicon",
      telephone: "55 90 59 33",
      lat: 7.0097,
      lng: 1.7692,
      estSiege: false
    },
    {
      id: 9,
      nom: "Glazoué",
      departement: "Collines",
      repere: "Quartier Affecia, rue Golgotha, au bord de l'axe Glazoué-Savalou",
      telephone: "94 30 57 22",
      lat: 7.9731,
      lng: 2.2403,
      estSiege: false
    },
    {
      id: 10,
      nom: "Jéricho",
      departement: "Littoral",
      repere: "Non loin de l'église évangélique des AD Temple Salem de Jéricho",
      telephone: "55 90 59 32",
      lat: 6.3712,
      lng: 2.4168,
      estSiege: false
    },
    {
      id: 11,
      nom: "Lokossa",
      departement: "Mono",
      repere: "En face de l'hôtel de ville de Lokossa ou en face de la gare routière de Lokossa",
      telephone: "55 90 59 36",
      lat: 6.6384,
      lng: 1.7169,
      estSiege: false
    },
    {
      id: 12,
      nom: "Togba",
      departement: "Atlantique",
      repere: "Carrefour Tokan pour le Marché Togba, à ~150m avant la pharmacie Saint Antoine de Padoue",
      telephone: "01 65 06 92 26",
      lat: 6.4380,
      lng: 2.3080,
      estSiege: false
    }
  ],

  // Produits d'épargne (taux stricts de la brochure)
  produitsEpargne: [
    {
      code: "DAV",
      nom: "Dépôt à Vue (DAV)",
      description: "Compte non rémunéré permettant des mouvements quotidiens (dépôts et retraits libres). Idéal pour la gestion courante de trésorerie.",
      depotInitial: "3 000 FCFA (particulier) / 5 000 FCFA (personne morale)",
      versementMin: "Libre",
      dureeMin: "Sans engagement",
      taux: null,
      tauxAffiche: "Non rémunéré",
      avantages: ["Disponibilité immédiate des fonds", "Retraits et dépôts illimités", "Frais de tenue de compte transparents"]
    },
    {
      code: "EL",
      nom: "Épargne sur Livret (EL)",
      description: "Compte rémunéré pour valoriser vos économies en toute sécurité tout en conservant une flexibilité d'accès.",
      depotInitial: "3 000 FCFA (particulier) / 5 000 FCFA (personne morale)",
      versementMin: "Libre",
      dureeMin: "Flexible",
      taux: 0.035, // 3,5% par an
      tauxAffiche: "3,5 % / an",
      avantages: ["Rémunération garantie à 3,5 % l'an", "Calcul des intérêts périodique", "Carnet d'épargne individuel sécurisé"]
    },
    {
      code: "EB",
      nom: "Épargne Bloquée (EB)",
      description: "Compte progressif destiné à financer un projet futur (achat d'équipement, scolarité, construction, investissement).",
      depotInitial: "Selon contrat (versement initial min. 5 000 FCFA)",
      versementMin: "5 000 FCFA",
      dureeMin: "6 mois minimum",
      taux: 0.035, // 3,5% par an
      tauxAffiche: "3,5 % / an",
      avantages: ["Discipline d'épargne récompensée", "Taux garanti à 3,5 % par an", "Facilite l'accès au crédit pour vos projets"]
    },
    {
      code: "DAT",
      nom: "Dépôt à Terme (DAT)",
      description: "Placement à terme sans carnet, chaque opération faisant l'objet d'un contrat spécifique. Nécessite un compte sur livret préalable.",
      depotInitial: "Selon contrat",
      versementMin: "Fixé par contrat",
      dureeMin: "Fixée par contrat",
      taux: null,
      tauxAffiche: "Variable selon contrat",
      avantages: ["Rendement négocié selon la durée et le montant", "Placement hautement sécurisé", "Convention personnalisée"]
    }
  ],

  // Épargne Tontine
  tontine: {
    titre: "Épargne Tontine COOPEC-AD",
    description: "Une formule traditionnelle modernisée et sécurisée pour épargner au quotidien auprès de nos agents collecteurs agréés ou en agence.",
    montantMinOuverture: 200,
    montantMinOperation: 200,
    montantMaxParMise: 50000,
    unite: "FCFA",
    pointsForts: [
      "Mises accessibles dès 200 FCFA par jour",
      "Plafond sécurisé jusqu'à 50 000 FCFA par mise",
      "Agents collecteurs identifiés avec reçus officiels",
      "Possibilité d'obtenir un crédit avance sur tontine"
    ]
  },

  // Transferts d'argent (les 5 opérateurs obligatoires)
  transfert: {
    titre: "Transfert d'argent rapide et sécurisé",
    description: "Envoyez et recevez de l'argent instantanément au Bénin et à l'international dans l'ensemble de nos 12 agences.",
    operateurs: [
      { nom: "MTN Mobile Money", type: "National & Sous-régional", logo: "MTN MoMo" },
      { nom: "MOOV Money", type: "National & Sous-régional", logo: "Moov Money" },
      { nom: "Western Union", type: "International", logo: "Western Union" },
      { nom: "Ria", type: "International", logo: "Ria Money Transfer" },
      { nom: "MoneyGram", type: "International", logo: "MoneyGram" }
    ]
  },

  // Crédits (7 types de crédits & taux dégressifs)
  credits: {
    tauxMin: 0.015,  // 1,5 % / mois
    tauxMax: 0.0175, // 1,75 % / mois
    typeCalcul: "dégressif",
    descriptionTaux: "Taux dégressif de 1,5 % à 1,75 % par mois. Les intérêts sont calculés chaque mois sur le capital restant dû.",
    note: "Le montant accordé, le taux exact, la durée de remboursement et la périodicité des échéances sont étudiés et validés en agence selon la nature de l'activité.",
    types: [
      {
        code: "agriculture",
        nom: "Crédit à l'agriculture, à l'élevage et à la pêche",
        cible: "Agriculteurs, éleveurs, maraîchers, groupements villageois et pêcheurs",
        usage: "Achat d'intrants, semences, alimentation bétail, matériel agricole ou de pêche",
        duree: "Adaptée aux cycles de récolte et de production"
      },
      {
        code: "bon-commande",
        nom: "Crédit sur bon de commande et préfinancement de marché",
        cible: "Entrepreneurs, prestataires de services, artisans adjudicataires de marchés",
        usage: "Trésorerie d'exécution de commandes publiques ou privées",
        duree: "Alignée sur les délais de livraison et de règlement du marché"
      },
      {
        code: "micro-entrepreneur",
        nom: "Crédit aux micro-entrepreneurs",
        cible: "Commerçants, artisans, couturiers, menuisiers, petits commerces",
        usage: "Constitution de stocks, renouvellement de fonds de roulement, outillage",
        duree: "Remboursement périodique (mensuel / bimensuel)"
      },
      {
        code: "salaries",
        nom: "Crédit aux salariés",
        cible: "Employés du secteur public et privé disposant d'un revenu régulier",
        usage: "Financement d'équipements, imprévus, projets personnels, santé",
        duree: "Échéances prélevées selon la périodicité du salaire"
      },
      {
        code: "avance-tontine",
        nom: "Crédit avance sur tontine",
        cible: "Membres souscripteurs réguliers à la tontine COOPEC-AD",
        usage: "Disponibilité anticipée de liquidités sans attendre la fin du cycle",
        duree: "Remboursement adossé aux cotisations tontine"
      },
      {
        code: "scolaire",
        nom: "Crédit scolaire",
        cible: "Parents d'élèves, tuteurs et étudiants",
        usage: "Paiement des frais de scolarité, fournitures, uniformes et inscriptions",
        duree: "Remboursement échelonné sur l'année académique à taux préférentiel"
      },
      {
        code: "groupements",
        nom: "Crédit aux groupements",
        cible: "Associations d'entraide, coopératives féminines, groupements d'artisans",
        usage: "Financement solidaire d'activités collectives génératrices de revenus",
        duree: "Caution solidaire et modalités convenues par convention"
      }
    ]
  },

  // Conditions et pièces d'adhésion
  piecesAdhesion: {
    personnePhysique: [
      "Adresse complète et indication de la profession",
      "Trois (3) photos d'identité récentes",
      "Photocopie légalisée d'une pièce d'identité valide (CIP, CNI, Passeport)",
      "Numéro d'Identifiant Fiscal Unique (IFU)"
    ],
    personneMoraleOuGroupement: [
      "Deux (2) photos d'identité par signataire autorisé",
      "Procès-verbal de désignation des signataires du compte",
      "Documents administratifs (Statuts, Règlement intérieur, Registre de Commerce)",
      "Procuration légalisée si nécessaire",
      "Identifiant Fiscal Unique (IFU) de l'entité"
    ],
    mineur: [
      "Extrait d'acte de naissance du mineur",
      "Pièce d'identité légalisée du mandataire légal (père, mère ou tuteur)",
      "Deux (2) photos d'identité du mineur",
      "Deux (2) photos d'identité du mandataire"
    ]
  },

  // FAQ de démarrage (4 thématiques de cadrage V3.0)
  faq: [
    {
      theme: "Conditions d'adhésion",
      question: "Qui peut devenir membre de la COOPEC-AD/BENIN ?",
      reponse: "Toute personne physique (particulier, artisan, commerçant, salarié), personne morale (entreprise, ONG) ou groupement peut adhérer. L'adhésion est ouverte à tous, sans distinction, auprès de l'une de nos 12 agences."
    },
    {
      theme: "Conditions d'adhésion",
      question: "Combien coûte l'adhésion et le premier dépôt ?",
      reponse: "Le dépôt initial minimum est de 3 000 FCFA pour une personne physique et de 5 000 FCFA pour une personne morale ou un groupement. Les pièces requises doivent être déposées physiquement en agence."
    },
    {
      theme: "Dépôts et retraits",
      question: "Comment effectuer des dépôts et des retraits sur mon compte ?",
      reponse: "Toutes les opérations s'effectuent directement aux guichets de nos 12 agences munis de votre carnet d'épargne ou pièce d'identité. Pour la tontine, des agents collecteurs assermentés peuvent également passer à votre lieu de commerce."
    },
    {
      theme: "Obtenir un crédit",
      question: "Quelles sont les conditions pour demander un crédit ?",
      reponse: "Il faut être membre de la COOPEC-AD, avoir une activité génératrice de revenus ou un revenu régulier, et constituer un dossier en agence. Le taux dégressif se situe entre 1,5 % et 1,75 % par mois selon la nature du crédit."
    },
    {
      theme: "Tontine et épargne",
      question: "Comment fonctionne la formule Épargne Tontine ?",
      reponse: "La tontine permet de cotiser quotidiennement une somme comprise entre 200 FCFA et 50 000 FCFA par mise. Vos fonds sont sécurisés et vous pouvez bénéficier d'un crédit avance sur tontine en cas de besoin urgent."
    },
    {
      theme: "Tontine et épargne",
      question: "Mes économies sont-elles sécurisées et rémunérées ?",
      reponse: "Oui. En tant que Système Financier Décentralisé agréé par le Ministère des Finances et la BCEAO (Agrément N° A.15.0105.A), vos fonds sont rigoureusement protégés. L'épargne sur livret et l'épargne bloquée sont rémunérées au taux officiel de 3,5 % l'an."
    }
  ],

  // Fil d'actualités (composant configuré proprement)
  actualites: [
    {
      id: 1,
      titre: "Promotion du Crédit Scolaire pour la rentrée académique",
      date: "Août 2026",
      resume: "Accompagnez la scolarité de vos enfants grâce au crédit scolaire COOPEC-AD à taux préférentiel dégressif.",
      texteComplet: "La COOPEC-AD/BENIN met à disposition de ses membres le crédit scolaire spécialement conçu pour alléger les charges de rentrée : inscription, fournitures et uniformes. Renseignez-vous dans l'une de nos 12 agences.",
      pdfUrl: null
    },
    {
      id: 2,
      titre: "Extension des services de transfert d'argent dans tout le réseau",
      date: "Juillet 2026",
      resume: "Retrouvez désormais les 5 grands opérateurs de transfert (MTN, MOOV, Western Union, Ria, MoneyGram) dans nos 12 agences.",
      texteComplet: "Pour faciliter vos transferts nationaux et internationaux, l'ensemble des agences COOPEC-AD dispose de guichets dédiés aux opérations rapides et sécurisées.",
      pdfUrl: null
    }
  ],

  // Carrières & Recrutement (rubrique V3.0)
  carrieres: {
    statut: "Candidatures spontanées ouvertes",
    description: "La COOPEC-AD/BENIN recrute régulièrement des talents pour accompagner le développement de son réseau (agents de collecte, conseillers clientèle, caissiers, chefs d'agence).",
    emailRecrutement: "coopec.adbenin@gmail.com",
    depotPhysique: "Dépôt de dossier possible au Siège Social à Godomey-Togoudo ou dans l'agence la plus proche."
  }
};

// Vérification de sécurité pour l'environnement global
if (typeof window !== "undefined") {
  window.COOPEC_DATA = COOPEC_DATA;
}
