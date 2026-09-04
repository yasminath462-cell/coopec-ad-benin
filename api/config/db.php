<?php
/**
 * Connexion PDO unique, réutilisée par toutes les routes publiques et admin.
 *
 * Priorité : variables d'environnement (Railway, persistantes entre déploiements)
 * Repli : api/config/config.php (utile en local, jamais versionné dans git)
 */

$dbHost = getenv('MYSQLHOST');
$dbName = getenv('MYSQLDATABASE');
$dbUser = getenv('MYSQLUSER');
$dbPass = getenv('MYSQLPASSWORD');

if ($dbHost === false || $dbName === false || $dbUser === false || $dbPass === false) {
    $config = require __DIR__ . '/config.php';
    $dbHost = $config['db_host'];
    $dbName = $config['db_name'];
    $dbUser = $config['db_user'];
    $dbPass = $config['db_pass'];
}

try {
    $pdo = new PDO(
        "mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4",
        $dbUser,
        $dbPass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['erreur' => 'Connexion à la base de données impossible.']);
    exit;
}
