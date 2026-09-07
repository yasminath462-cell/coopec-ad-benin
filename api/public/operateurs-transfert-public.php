<?php
/**
 * CAS 2 — Liste complète, lecture seule.
 */

require __DIR__ . '/../config/db.php';
require __DIR__ . '/../includes/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    erreurJson('Méthode non autorisée.', 405);
}

repondreJson($pdo->query('SELECT nom, type, logo FROM operateurs_transfert ORDER BY ordre ASC, nom ASC')->fetchAll());
