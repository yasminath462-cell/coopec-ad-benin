<?php
/**
 * CAS 1 — Singleton : uniquement "modifier". Jamais de création ni de suppression possible.
 */

require __DIR__ . '/../config/db.php';
require __DIR__ . '/../includes/response.php';
require __DIR__ . '/../includes/auth.php';

exigerAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    erreurJson('Méthode non autorisée.', 405);
}

$d = json_decode(file_get_contents('php://input'), true) ?? [];

$champsAutorises = [
    'nom_court', 'raison_sociale', 'statut_juridique', 'agrement_bceao', 'ifu',
    'siege_social', 'telephone_principal', 'telephone_whatsapp', 'email', 'site_web',
    'horaires_texte', 'membres_count', 'vision', 'mission',
];

$erreurs = [];
if (isset($d['email']) && !filter_var($d['email'], FILTER_VALIDATE_EMAIL)) {
    $erreurs['email'] = 'Adresse email invalide.';
}
if (isset($d['membres_count']) && (!is_numeric($d['membres_count']) || $d['membres_count'] < 0)) {
    $erreurs['membres_count'] = 'Le nombre de membres doit être un entier positif.';
}
foreach (['nom_court', 'siege_social', 'telephone_principal'] as $champObligatoire) {
    if (array_key_exists($champObligatoire, $d) && trim((string)$d[$champObligatoire]) === '') {
        $erreurs[$champObligatoire] = 'Ce champ ne peut pas être vide.';
    }
}
if (!empty($erreurs)) {
    erreurJson('Certains champs sont invalides.', 422, $erreurs);
}

$aMettreAJour = array_intersect_key($d, array_flip($champsAutorises));
if (empty($aMettreAJour)) {
    erreurJson('Aucun champ valide à mettre à jour.', 422);
}

$assignations = implode(', ', array_map(fn($champ) => "$champ = :$champ", array_keys($aMettreAJour)));
$stmt = $pdo->prepare("UPDATE institution SET $assignations WHERE id = 1");
$stmt->execute($aMettreAJour);

repondreJson(['message' => 'Institution mise à jour.']);
