<?php
/**
 * CAS 2a — Liste complète, les 4 opérations. Aucune notion de brouillon ici :
 * la lecture admin est donc identique à la lecture publique.
 */

require __DIR__ . '/../config/db.php';
require __DIR__ . '/../includes/response.php';
require __DIR__ . '/../includes/auth.php';

exigerAdmin();

$methode = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

function validerAgence(array $d, bool $creationComplete): array {
    $erreurs = [];
    if ($creationComplete || array_key_exists('nom', $d)) {
        if (trim($d['nom'] ?? '') === '') $erreurs['nom'] = 'Le nom est obligatoire.';
    }
    if ($creationComplete || array_key_exists('departement', $d)) {
        if (trim($d['departement'] ?? '') === '') $erreurs['departement'] = 'Le département est obligatoire.';
    }
    if ($creationComplete || array_key_exists('lat', $d)) {
        if (!isset($d['lat']) || !is_numeric($d['lat']) || $d['lat'] < -90 || $d['lat'] > 90) {
            $erreurs['lat'] = 'Latitude invalide.';
        }
    }
    if ($creationComplete || array_key_exists('lng', $d)) {
        if (!isset($d['lng']) || !is_numeric($d['lng']) || $d['lng'] < -180 || $d['lng'] > 180) {
            $erreurs['lng'] = 'Longitude invalide.';
        }
    }
    return $erreurs;
}

switch ($methode) {
    case 'GET':
        repondreJson($pdo->query('SELECT * FROM agences ORDER BY departement, nom')->fetchAll());
        break;

    case 'POST':
        $d = json_decode(file_get_contents('php://input'), true) ?? [];
        $erreurs = validerAgence($d, true);
        if (!empty($erreurs)) erreurJson('Certains champs sont invalides.', 422, $erreurs);

        $stmt = $pdo->prepare('INSERT INTO agences (nom, departement, repere, telephone, lat, lng, est_siege)
            VALUES (:nom, :departement, :repere, :telephone, :lat, :lng, :est_siege)');
        $stmt->execute([
            'nom' => $d['nom'],
            'departement' => $d['departement'],
            'repere' => $d['repere'] ?? '',
            'telephone' => $d['telephone'] ?? '',
            'lat' => $d['lat'],
            'lng' => $d['lng'],
            'est_siege' => !empty($d['est_siege']) ? 1 : 0,
        ]);
        repondreJson(['id' => $pdo->lastInsertId(), 'message' => 'Agence créée.'], 201);
        break;

    case 'PUT':
        if (!$id) erreurJson('Identifiant d\'agence manquant.', 400);
        $d = json_decode(file_get_contents('php://input'), true) ?? [];
        $erreurs = validerAgence($d, false);
        if (!empty($erreurs)) erreurJson('Certains champs sont invalides.', 422, $erreurs);

        $champsAutorises = ['nom', 'departement', 'repere', 'telephone', 'lat', 'lng', 'est_siege'];
        $aMettreAJour = array_intersect_key($d, array_flip($champsAutorises));
        if (empty($aMettreAJour)) erreurJson('Aucun champ à mettre à jour.', 422);

        $assignations = implode(', ', array_map(fn($c) => "$c = :$c", array_keys($aMettreAJour)));
        $aMettreAJour['id'] = $id;
        $stmt = $pdo->prepare("UPDATE agences SET $assignations WHERE id = :id");
        $stmt->execute($aMettreAJour);

        if ($stmt->rowCount() === 0) erreurJson('Agence introuvable.', 404);
        repondreJson(['message' => 'Agence mise à jour.']);
        break;

    case 'DELETE':
        if (!$id) erreurJson('Identifiant d\'agence manquant.', 400);
        $stmt = $pdo->prepare('DELETE FROM agences WHERE id = ?');
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) erreurJson('Agence introuvable.', 404);
        repondreJson(['message' => 'Agence supprimée.']);
        break;

    default:
        erreurJson('Méthode non autorisée.', 405);
}
