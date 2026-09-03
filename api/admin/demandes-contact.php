<?php
/**
 * CAS 3 — Côté admin : lecture de tout, et "marquer comme lu" seulement.
 * Pas de création ici (les lignes n'arrivent que par le formulaire public contact.php).
 */

require __DIR__ . '/../config/db.php';
require __DIR__ . '/../includes/response.php';
require __DIR__ . '/../includes/auth.php';

exigerAdmin();

$methode = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

switch ($methode) {
    case 'GET':
        repondreJson($pdo->query('SELECT id, nom, telephone, message, date_envoi, lu FROM demandes_contact ORDER BY date_envoi DESC')->fetchAll());
        break;

    case 'PATCH':
        if (!$id) erreurJson('Identifiant manquant.', 400);
        $stmt = $pdo->prepare('UPDATE demandes_contact SET lu = 1 WHERE id = ?');
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) erreurJson('Message introuvable.', 404);
        repondreJson(['message' => 'Message marqué comme lu.']);
        break;

    default:
        erreurJson('Méthode non autorisée.', 405);
}
