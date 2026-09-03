-- ============================================================================
-- COOPEC-AD/BENIN — Schéma de base de données (MySQL/MariaDB, InnoDB, utf8mb4)
-- 19 tables, validées au fil du chantier de modélisation.
-- ============================================================================

CREATE TABLE institution (
  id                       TINYINT UNSIGNED PRIMARY KEY DEFAULT 1,
  nom_court                VARCHAR(100)  NOT NULL,
  raison_sociale           VARCHAR(255)  NOT NULL,
  statut_juridique         VARCHAR(255)  NOT NULL,
  agrement_bceao           VARCHAR(255)  NOT NULL,
  ifu                      VARCHAR(20)   NOT NULL,
  siege_social             TEXT          NOT NULL,
  telephone_principal      VARCHAR(20)   NOT NULL,
  telephone_whatsapp       VARCHAR(20)   NOT NULL,
  email                    VARCHAR(150)  NOT NULL,
  site_web                 VARCHAR(150)  NULL,
  date_creation            DATE          NOT NULL,
  horaires_texte           TEXT          NULL,
  membres_count            INT UNSIGNED  NOT NULL,
  vision                   TEXT          NOT NULL,
  mission                  TEXT          NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE institution_telephones (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  institution_id TINYINT UNSIGNED NOT NULL DEFAULT 1,
  numero         VARCHAR(20)  NOT NULL,
  ordre          TINYINT UNSIGNED NOT NULL DEFAULT 0,
  FOREIGN KEY (institution_id) REFERENCES institution(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE valeurs (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  institution_id TINYINT UNSIGNED NOT NULL DEFAULT 1,
  titre          VARCHAR(100) NOT NULL,
  description    TEXT         NOT NULL,
  ordre          TINYINT UNSIGNED NOT NULL DEFAULT 0,
  FOREIGN KEY (institution_id) REFERENCES institution(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE contenu_pages (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  page        VARCHAR(50)  NOT NULL,
  cle_section VARCHAR(50)  NOT NULL,
  titre       VARCHAR(255) NULL,
  texte       TEXT         NULL,
  image       VARCHAR(255) NULL,
  ordre       TINYINT UNSIGNED NOT NULL DEFAULT 0,
  UNIQUE KEY uniq_page_section (page, cle_section)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE produits_epargne (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code           VARCHAR(10)   NOT NULL UNIQUE,
  nom            VARCHAR(150)  NOT NULL,
  description    TEXT          NOT NULL,
  depot_initial  VARCHAR(255)  NOT NULL,
  versement_min  VARCHAR(100)  NOT NULL,
  duree_min      VARCHAR(100)  NOT NULL,
  taux           DECIMAL(6,4)  NULL,
  taux_affiche   VARCHAR(100)  NOT NULL,
  ordre          TINYINT UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE produit_epargne_avantages (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  produit_id INT UNSIGNED NOT NULL,
  texte      VARCHAR(255) NOT NULL,
  ordre      TINYINT UNSIGNED NOT NULL DEFAULT 0,
  FOREIGN KEY (produit_id) REFERENCES produits_epargne(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE parametres_credit (
  id                TINYINT UNSIGNED PRIMARY KEY DEFAULT 1,
  taux_min          DECIMAL(6,4)  NOT NULL,
  taux_max          DECIMAL(6,4)  NOT NULL,
  type_calcul       VARCHAR(50)   NOT NULL,
  description_taux  TEXT          NOT NULL,
  note              TEXT          NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE types_credit (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code            VARCHAR(30)   NOT NULL UNIQUE,
  nom             VARCHAR(150)  NOT NULL,
  cible           TEXT          NOT NULL,
  utilisation     TEXT          NOT NULL,
  duree           VARCHAR(255)  NOT NULL,
  taux_specifique DECIMAL(6,4)  NULL,
  ordre           TINYINT UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE operateurs_transfert (
  id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nom   VARCHAR(100) NOT NULL,
  type  ENUM('national', 'international') NOT NULL,
  logo  VARCHAR(255) NULL,
  ordre TINYINT UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE tontine (
  id                        TINYINT UNSIGNED PRIMARY KEY DEFAULT 1,
  titre                     VARCHAR(150) NOT NULL,
  description               TEXT         NOT NULL,
  montant_min_ouverture     INT UNSIGNED NOT NULL,
  montant_min_operation     INT UNSIGNED NOT NULL,
  montant_max_par_mise      INT UNSIGNED NOT NULL,
  unite                     VARCHAR(10)  NOT NULL DEFAULT 'FCFA'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE tontine_points_forts (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tontine_id TINYINT UNSIGNED NOT NULL DEFAULT 1,
  texte      VARCHAR(255) NOT NULL,
  ordre      TINYINT UNSIGNED NOT NULL DEFAULT 0,
  FOREIGN KEY (tontine_id) REFERENCES tontine(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE agences (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nom         VARCHAR(150)   NOT NULL,
  departement VARCHAR(50)    NOT NULL,
  repere      TEXT           NOT NULL,
  telephone   VARCHAR(100)   NOT NULL,
  lat         DECIMAL(9,6)   NOT NULL,
  lng         DECIMAL(9,6)   NOT NULL,
  est_siege   BOOLEAN        NOT NULL DEFAULT FALSE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE profils_adhesion (
  id      TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code    VARCHAR(30)  NOT NULL UNIQUE,
  libelle VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE pieces_adhesion (
  id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  profil_id TINYINT UNSIGNED NOT NULL,
  libelle   VARCHAR(255) NOT NULL,
  ordre     TINYINT UNSIGNED NOT NULL DEFAULT 0,
  FOREIGN KEY (profil_id) REFERENCES profils_adhesion(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE actualites (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  titre         VARCHAR(255) NOT NULL,
  date_publication DATE      NOT NULL,
  categorie     VARCHAR(50)  NULL,
  resume        VARCHAR(500) NOT NULL,
  texte_complet TEXT         NOT NULL,
  image         VARCHAR(255) NULL,
  pdf_url       VARCHAR(255) NULL,
  statut        ENUM('brouillon', 'publie') NOT NULL DEFAULT 'brouillon',
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE offres_emploi (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  titre_poste        VARCHAR(150) NOT NULL,
  description        TEXT         NOT NULL,
  agence_id          INT UNSIGNED NULL,
  type_contrat       VARCHAR(50)  NULL,
  date_publication   DATE         NOT NULL,
  statut             ENUM('ouvert', 'ferme') NOT NULL DEFAULT 'ouvert',
  email_candidature  VARCHAR(150) NOT NULL,
  updated_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (agence_id) REFERENCES agences(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE faq (
  id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  theme    VARCHAR(100) NOT NULL,
  question VARCHAR(255) NOT NULL,
  reponse  TEXT         NOT NULL,
  ordre    TINYINT UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Colonne ip : nécessaire à la limite anti-spam (3 messages/heure) de api/public/contact.php.
-- 45 caractères pour couvrir une adresse IPv6, pas seulement IPv4.
CREATE TABLE demandes_contact (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nom         VARCHAR(150) NOT NULL,
  telephone   VARCHAR(20)  NOT NULL,
  message     TEXT         NOT NULL,
  ip          VARCHAR(45)  NULL,
  date_envoi  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  lu          BOOLEAN      NOT NULL DEFAULT FALSE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE admin (
  id                  TINYINT UNSIGNED PRIMARY KEY DEFAULT 1,
  email               VARCHAR(150) NOT NULL UNIQUE,
  mot_de_passe        VARCHAR(255) NOT NULL,
  derniere_connexion  DATETIME     NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
