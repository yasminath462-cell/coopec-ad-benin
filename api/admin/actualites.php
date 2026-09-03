<?php
/**
 * CAS 2b — Liste complète, les 4 opérations, + gestion de l'image jointe.
 * Contrairement à la route publique : aucun filtre sur statut, l'admin voit aussi les brouillons.
 *
 * Note technique : PHP ne remplit $_FILES/$_POST que sur une requête POST en
 * multipart/form-data — jamais sur une requête PUT native. Pour permettre l'envoi d'une
 * nouvelle image lors d'une modification, le front envoie donc un POST avec un champ
 * caché _method=PUT, normalisé ci-dessous (patron standard, utilisé entre autres par Laravel).
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
const TAILLE_MAX_OCTETS = 2 * 1024 * 1024; // 2 Mo

function traiterImageUploadee(): ?string {
    if (empty($_FILES['image']) || $_FILES['image']['error'] === UPLOAD_ERR_NO_FILE) {
        return null;
    }
    $fichier = $_FILES['image'];
    if ($fichier['error'] !== UPLOAD_ERR_OK) {
        erreurJson('Échec du téléversement de l\'image.', 422);
    }
    if ($fichier['size'] > TAILLE_MAX_OCTETS) {
        erreurJson('Image trop volumineuse (2 Mo maximum).', 422);
    }
    // getimagesize() lit les octets réels du fichier — contrairement à l'extension du nom,
    // on ne peut pas le tromper en renommant un script en .jpg.
    if (getimagesize($fichier['tmp_name']) === false) {
        erreurJson('Le fichier envoyé n\'est pas une image valide.', 422);
    }
    $extension = strtolower(pathinfo($fichier['name'], PATHINFO_EXTENSION));
    if (!in_array($extension, EXTENSIONS_AUTORISEES, true)) {
        erreurJson('Format d\'image non autorisé (jpg, png, webp uniquement).', 422);
    }
    // Nom généré côté serveur, jamais le nom envoyé par le client (évite l'écrasement de
    // fichiers existants et l'injection de caractères dans un chemin de fichier).
    $nomFichier = bin2hex(random_bytes(16)) . '.' . $extension;
    if (!is_dir(DOSSIER_UPLOADS)) {
        mkdir(DOSSIER_UPLOADS, 0755, true);
    }
    move_uploaded_file($fichier['tmp_name'], DOSSIER_UPLOADS . $nomFichier);
    return '/uploads/' . $nomFichier;
}

function validerActualite(array $d, bool $creationComplete): array {
    $erreurs = [];
    if ($creationComplete || array_key_exists('titre', $d)) {
        if (trim($d['titre'] ?? '') === '') $erreurs['titre'] = 'Le titre est obligatoire.';
    }
    if ($creationComplete || array_key_exists('date_publication', $d)) {
        if (empty($d['date_publication']) || !DateTime::createFromFormat('Y-m-d', $d['date_publication'])) {
            $erreurs['date_publication'] = 'Date invalide (format attendu AAAA-MM-JJ).';
        }
    }
    if (isset($d['statut']) && !in_array($d['statut'], ['brouillon', 'publie'], true)) {
        $erreurs['statut'] = 'Statut invalide.';
    }
    return $erreurs;
}

switch ($methode) {
    case 'GET':
        repondreJson($pdo->query('SELECT * FROM actualites ORDER BY date_publication DESC')->fetchAll());
        break;

    case 'POST':
        $d = $_POST; // multipart/form-data à cause de l'image jointe
        $erreurs = validerActualite($d, true);
        if (!empty($erreurs)) erreurJson('Certains champs sont invalides.', 422, $erreurs);
        $cheminImage = traiterImageUploadee();

        $stmt = $pdo->prepare('INSERT INTO actualites (titre, date_publication, categorie, resume, texte_complet, image, pdf_url, statut)
            VALUES (:titre, :date_publication, :categorie, :resume, :texte_complet, :image, :pdf_url, :statut)');
        $stmt->execute([
            'titre' => $d['titre'],
            'date_publication' => $d['date_publication'],
            'categorie' => $d['categorie'] ?? null,
            'resume' => $d['resume'] ?? '',
            'texte_complet' => $d['texte_complet'] ?? '',
            'image' => $cheminImage,
            'pdf_url' => $d['pdf_url'] ?? null,
            'statut' => $d['statut'] ?? 'brouillon',
        ]);
        repondreJson(['id' => $pdo->lastInsertId(), 'message' => 'Actualité créée.'], 201);
        break;

    case 'PUT':
        if (!$id) erreurJson('Identifiant manquant.', 400);
        $d = $_POST;
        $erreurs = validerActualite($d, false);
        if (!empty($erreurs)) erreurJson('Certains champs sont invalides.', 422, $erreurs);

        $champsAutorises = ['titre', 'date_publication', 'categorie', 'resume', 'texte_complet', 'pdf_url', 'statut'];
        $aMettreAJour = array_intersect_key($d, array_flip($champsAutorises));
        $nouvelleImage = traiterImageUploadee();
        if ($nouvelleImage) $aMettreAJour['image'] = $nouvelleImage;
        if (empty($aMettreAJour)) erreurJson('Aucun champ à mettre à jour.', 422);

        $assignations = implode(', ', array_map(fn($c) => "$c = :$c", array_keys($aMettreAJour)));
        $aMettreAJour['id'] = $id;
        $stmt = $pdo->prepare("UPDATE actualites SET $assignations WHERE id = :id");
        $stmt->execute($aMettreAJour);

        if ($stmt->rowCount() === 0) erreurJson('Actualité introuvable.', 404);
        repondreJson(['message' => 'Actualité mise à jour.']);
        break;

    case 'DELETE':
        if (!$id) erreurJson('Identifiant manquant.', 400);
        $stmt = $pdo->prepare('DELETE FROM actualites WHERE id = ?');
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) erreurJson('Actualité introuvable.', 404);
        repondreJson(['message' => 'Actualité supprimée.']);
        break;

    default:
        erreurJson('Méthode non autorisée.', 405);
}
