<?php
/**
 * CAS 2 — Liste complète, les 4 opérations, + gestion du logo joint.
 * Suit le même patron que actualites.php pour l'upload d'image (POST + _method=PUT).
 */

require __DIR__ . '/../config/db.php';
require __DIR__ . '/../includes/response.php';
require __DIR__ . '/../includes/auth.php';

exigerAdmin();

$methode = $_SERVER['REQUEST_METHOD'];
if ($methode === 'POST' && ($_POST['_method'] ?? '') === 'PUT') {
    $methode = 'PUT';
}
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

const DOSSIER_UPLOADS = __DIR__ . '/../../uploads/';
const EXTENSIONS_AUTORISEES = ['jpg', 'jpeg', 'png', 'webp'];
const TAILLE_MAX_OCTETS = 1 * 1024 * 1024; // 1 Mo — un logo n'a pas besoin d'etre plus lourd

function traiterLogoUploade(): ?string {
    if (empty($_FILES['logo']) || $_FILES['logo']['error'] === UPLOAD_ERR_NO_FILE) {
        return null;
    }
    $fichier = $_FILES['logo'];
    if ($fichier['error'] !== UPLOAD_ERR_OK) {
        erreurJson('Échec du téléversement du logo.', 422);
    }
    if ($fichier['size'] > TAILLE_MAX_OCTETS) {
        erreurJson('Logo trop volumineux (1 Mo maximum).', 422);
    }
    if (getimagesize($fichier['tmp_name']) === false) {
        erreurJson('Le fichier envoyé n\'est pas une image valide.', 422);
    }
    $extension = strtolower(pathinfo($fichier['name'], PATHINFO_EXTENSION));
    if (!in_array($extension, EXTENSIONS_AUTORISEES, true)) {
        erreurJson('Format de logo non autorisé (jpg, png, webp uniquement).', 422);
    }
    $nomFichier = bin2hex(random_bytes(16)) . '.' . $extension;
    if (!is_dir(DOSSIER_UPLOADS)) {
        mkdir(DOSSIER_UPLOADS, 0755, true);
    }
    move_uploaded_file($fichier['tmp_name'], DOSSIER_UPLOADS . $nomFichier);
    return '/uploads/' . $nomFichier;
}

function validerOperateur(array $d, bool $creationComplete): array {
    $erreurs = [];
    if ($creationComplete || array_key_exists('nom', $d)) {
        if (trim($d['nom'] ?? '') === '') $erreurs['nom'] = 'Le nom est obligatoire.';
    }
    if ($creationComplete || array_key_exists('type', $d)) {
        if (!in_array($d['type'] ?? '', ['national', 'international'], true)) {
            $erreurs['type'] = 'Le type doit être "national" ou "international".';
        }
    }
    return $erreurs;
}

switch ($methode) {
    case 'GET':
        repondreJson($pdo->query('SELECT * FROM operateurs_transfert ORDER BY ordre ASC, nom ASC')->fetchAll());
        break;

    case 'POST':
        $d = $_POST;
        $erreurs = validerOperateur($d, true);
        if (!empty($erreurs)) erreurJson('Certains champs sont invalides.', 422, $erreurs);
        $cheminLogo = traiterLogoUploade();

        $stmt = $pdo->prepare('INSERT INTO operateurs_transfert (nom, type, logo, ordre) VALUES (:nom, :type, :logo, :ordre)');
        $stmt->execute([
            'nom' => $d['nom'],
            'type' => $d['type'],
            'logo' => $cheminLogo,
            'ordre' => $d['ordre'] ?? 0,
        ]);
        repondreJson(['id' => $pdo->lastInsertId(), 'message' => 'Opérateur créé.'], 201);
        break;

    case 'PUT':
        if (!$id) erreurJson('Identifiant manquant.', 400);
        $d = $_POST;
        $erreurs = validerOperateur($d, false);
        if (!empty($erreurs)) erreurJson('Certains champs sont invalides.', 422, $erreurs);

        $champsAutorises = ['nom', 'type', 'ordre'];
        $aMettreAJour = array_intersect_key($d, array_flip($champsAutorises));
        $nouveauLogo = traiterLogoUploade();
        if ($nouveauLogo) $aMettreAJour['logo'] = $nouveauLogo;
        if (empty($aMettreAJour)) erreurJson('Aucun champ à mettre à jour.', 422);

        $assignations = implode(', ', array_map(fn($c) => "$c = :$c", array_keys($aMettreAJour)));
        $aMettreAJour['id'] = $id;
        $stmt = $pdo->prepare("UPDATE operateurs_transfert SET $assignations WHERE id = :id");
        $stmt->execute($aMettreAJour);

        if ($stmt->rowCount() === 0) erreurJson('Opérateur introuvable.', 404);
        repondreJson(['message' => 'Opérateur mis à jour.']);
        break;

    case 'DELETE':
        if (!$id) erreurJson('Identifiant manquant.', 400);
        $stmt = $pdo->prepare('DELETE FROM operateurs_transfert WHERE id = ?');
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) erreurJson('Opérateur introuvable.', 404);
        repondreJson(['message' => 'Opérateur supprimé.']);
        break;

    default:
        erreurJson('Méthode non autorisée.', 405);
}
