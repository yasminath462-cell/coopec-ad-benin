<?php
/**
 * CAS 2 — Liste complète, les 4 opérations, pas d'image.
 */

require __DIR__ . '/../config/db.php';
require __DIR__ . '/../includes/response.php';
require __DIR__ . '/../includes/auth.php';

exigerAdmin();

$methode = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

function validerTypeCredit(array $d, bool $creationComplete): array {
    $erreurs = [];
    $champsTexteObligatoires = ['code', 'nom', 'cible', 'utilisation', 'duree'];
    foreach ($champsTexteObligatoires as $champ) {
        if ($creationComplete || array_key_exists($champ, $d)) {
            if (trim($d[$champ] ?? '') === '') $erreurs[$champ] = 'Ce champ est obligatoire.';
        }
    }
    if (array_key_exists('taux_specifique', $d) && $d['taux_specifique'] !== '' && $d['taux_specifique'] !== null && !is_numeric($d['taux_specifique'])) {
        $erreurs['taux_specifique'] = 'Le taux doit être un nombre, ou vide pour utiliser le taux standard.';
    }
    return $erreurs;
}

switch ($methode) {
    case 'GET':
        repondreJson($pdo->query('SELECT * FROM types_credit ORDER BY ordre ASC, nom ASC')->fetchAll());
        break;

    case 'POST':
        $d = json_decode(file_get_contents('php://input'), true) ?? [];
        $erreurs = validerTypeCredit($d, true);
        if (!empty($erreurs)) erreurJson('Certains champs sont invalides.', 422, $erreurs);

        $stmt = $pdo->prepare('INSERT INTO types_credit (code, nom, cible, utilisation, duree, taux_specifique, ordre)
            VALUES (:code, :nom, :cible, :utilisation, :duree, :taux_specifique, :ordre)');
        $stmt->execute([
            'code' => strtoupper($d['code']),
            'nom' => $d['nom'],
            'cible' => $d['cible'],
            'utilisation' => $d['utilisation'],
            'duree' => $d['duree'],
            'taux_specifique' => ($d['taux_specifique'] ?? '') === '' ? null : $d['taux_specifique'],
            'ordre' => $d['ordre'] ?? 0,
        ]);
        repondreJson(['id' => $pdo->lastInsertId(), 'message' => 'Type de crédit créé.'], 201);
        break;

    case 'PUT':
        if (!$id) erreurJson('Identifiant manquant.', 400);
        $d = json_decode(file_get_contents('php://input'), true) ?? [];
        $erreurs = validerTypeCredit($d, false);
        if (!empty($erreurs)) erreurJson('Certains champs sont invalides.', 422, $erreurs);

        $champsAutorises = ['code', 'nom', 'cible', 'utilisation', 'duree', 'taux_specifique', 'ordre'];
        $aMettreAJour = array_intersect_key($d, array_flip($champsAutorises));
        if (isset($aMettreAJour['code'])) $aMettreAJour['code'] = strtoupper($aMettreAJour['code']);
        if (array_key_exists('taux_specifique', $aMettreAJour) && $aMettreAJour['taux_specifique'] === '') $aMettreAJour['taux_specifique'] = null;
        if (empty($aMettreAJour)) erreurJson('Aucun champ à mettre à jour.', 422);

        $assignations = implode(', ', array_map(fn($c) => "$c = :$c", array_keys($aMettreAJour)));
        $aMettreAJour['id'] = $id;
        $stmt = $pdo->prepare("UPDATE types_credit SET $assignations WHERE id = :id");
        $stmt->execute($aMettreAJour);

        if ($stmt->rowCount() === 0) erreurJson('Type de crédit introuvable.', 404);
        repondreJson(['message' => 'Type de crédit mis à jour.']);
        break;

    case 'DELETE':
        if (!$id) erreurJson('Identifiant manquant.', 400);
        $stmt = $pdo->prepare('DELETE FROM types_credit WHERE id = ?');
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) erreurJson('Type de crédit introuvable.', 404);
        repondreJson(['message' => 'Type de crédit supprimé.']);
        break;

    default:
        erreurJson('Méthode non autorisée.', 405);
}
