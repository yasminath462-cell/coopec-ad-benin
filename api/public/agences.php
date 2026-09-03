<?php
/**
 * CAS 2a — Liste complète SANS statut brouillon/publié : lecture publique intégrale,
 * aucun filtre. S'applique de la même façon à produits_epargne, types_credit,
 * operateurs_transfert, valeurs, faq, contenu_pages, profils_adhesion, pieces_adhesion,
 * institution_telephones, tontine_points_forts, produit_epargne_avantages.
 */

require __DIR__ . '/../config/db.php';
require __DIR__ . '/../includes/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    erreurJson('Méthode non autorisée.', 405);
}

$agences = $pdo->query('SELECT * FROM agences ORDER BY departement, nom')->fetchAll();

repondreJson($agences);
