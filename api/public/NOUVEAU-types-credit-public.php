<?php
/**
 * CAS 2a — Liste complète, lecture seule.
 */

require __DIR__ . '/../config/db.php';
require __DIR__ . '/../includes/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    erreurJson('Méthode non autorisée.', 405);
}

repondreJson($pdo->query('SELECT * FROM types_credit ORDER BY ordre ASC, nom ASC')->fetchAll());
