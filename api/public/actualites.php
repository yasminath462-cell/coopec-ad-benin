<?php
/**
 * CAS 2b — Liste complète AVEC statut brouillon/publié : la route publique filtre.
 * Seule offres_emploi partage ce cas (filtre sur statut = 'ouvert').
 */

require __DIR__ . '/../config/db.php';
require __DIR__ . '/../includes/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    erreurJson('Méthode non autorisée.', 405);
}

// Filtre imposé côté serveur, jamais négociable depuis le client.
$stmt = $pdo->query("SELECT id, titre, date_publication, categorie, resume, texte_complet, image, pdf_url
    FROM actualites WHERE statut = 'publie' ORDER BY date_publication DESC");

repondreJson($stmt->fetchAll());
