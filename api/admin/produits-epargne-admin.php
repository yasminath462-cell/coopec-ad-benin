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

function validerProduit(array $d, bool $creationComplete): array {
    $erreurs = [];
    $champsTexteObligatoires = ['code', 'nom', 'description', 'depot_initial', 'versement_min', 'duree_min', 'taux_affiche'];
    foreach ($champsTexteObligatoires as $champ) {
        if ($creationComplete || array_key_exists($champ, $d)) {
            if (trim($d[$champ] ?? '') === '') $erreurs[$champ] = 'Ce champ est obligatoire.';
        }
    }
    if (array_key_exists('taux', $d) && $d['taux'] !== '' && $d['taux'] !== null && !is_numeric($d['taux'])) {
        $erreurs['taux'] = 'Le taux doit être un nombre (ex: 0.035 pour 3,5%), ou vide si non rémunéré.';
    }
    return $erreurs;
}

switch ($methode) {
    case 'GET':
        repondreJson($pdo->query('SELECT * FROM produits_epargne ORDER BY ordre ASC, nom ASC')->fetchAll());
        break;

    case 'POST':
        $d = json_decode(file_get_contents('php://input'), true) ?? [];
        $erreurs = validerProduit($d, true);
        if (!empty($erreurs)) erreurJson('Certains champs sont invalides.', 422, $erreurs);

        $stmt = $pdo->prepare('INSERT INTO produits_epargne (code, nom, description, depot_initial, versement_min, duree_min, taux, taux_affiche, ordre)
            VALUES (:code, :nom, :description, :depot_initial, :versement_min, :duree_min, :taux, :taux_affiche, :ordre)');
        $stmt->execute([
            'code' => strtoupper($d['code']),
            'nom' => $d['nom'],
            'description' => $d['description'],
            'depot_initial' => $d['depot_initial'],
            'versement_min' => $d['versement_min'],
            'duree_min' => $d['duree_min'],
            'taux' => ($d['taux'] ?? '') === '' ? null : $d['taux'],
            'taux_affiche' => $d['taux_affiche'],
            'ordre' => $d['ordre'] ?? 0,
        ]);
        repondreJson(['id' => $pdo->lastInsertId(), 'message' => 'Produit créé.'], 201);
        break;

    case 'PUT':
        if (!$id) erreurJson('Identifiant manquant.', 400);
        $d = json_decode(file_get_contents('php://input'), true) ?? [];
        $erreurs = validerProduit($d, false);
        if (!empty($erreurs)) erreurJson('Certains champs sont invalides.', 422, $erreurs);

        $champsAutorises = ['code', 'nom', 'description', 'depot_initial', 'versement_min', 'duree_min', 'taux', 'taux_affiche', 'ordre'];
        $aMettreAJour = array_intersect_key($d, array_flip($champsAutorises));
        if (isset($aMettreAJour['code'])) $aMettreAJour['code'] = strtoupper($aMettreAJour['code']);
        if (array_key_exists('taux', $aMettreAJour) && $aMettreAJour['taux'] === '') $aMettreAJour['taux'] = null;
        if (empty($aMettreAJour)) erreurJson('Aucun champ à mettre à jour.', 422);

        $assignations = implode(', ', array_map(fn($c) => "$c = :$c", array_keys($aMettreAJour)));
        $aMettreAJour['id'] = $id;
        $stmt = $pdo->prepare("UPDATE produits_epargne SET $assignations WHERE id = :id");
        $stmt->execute($aMettreAJour);

        if ($stmt->rowCount() === 0) erreurJson('Produit introuvable.', 404);
        repondreJson(['message' => 'Produit mis à jour.']);
        break;

    case 'DELETE':
        if (!$id) erreurJson('Identifiant manquant.', 400);
        $stmt = $pdo->prepare('DELETE FROM produits_epargne WHERE id = ?');
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) erreurJson('Produit introuvable.', 404);
        repondreJson(['message' => 'Produit supprimé.']);
        break;

    default:
        erreurJson('Méthode non autorisée.', 405);
}
