<?php
/**
 * CAS 1 — Singleton : lecture publique intégrale, aucun filtre (comme toutes les tables
 * sans notion de brouillon/publié).
 */

require __DIR__ . '/../config/db.php';
require __DIR__ . '/../includes/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    erreurJson('Méthode non autorisée.', 405);
}

$institution = $pdo->query('SELECT * FROM institution WHERE id = 1')->fetch();
if (!$institution) {
    erreurJson('Configuration institution introuvable.', 500);
}

$institution['telephones'] = $pdo->query('SELECT numero FROM institution_telephones ORDER BY ordre')->fetchAll(PDO::FETCH_COLUMN);
$institution['valeurs'] = $pdo->query('SELECT titre, description FROM valeurs ORDER BY ordre')->fetchAll();

repondreJson($institution);
