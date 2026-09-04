<?php
/**
 * CAS 3 — Table sans aucune lecture publique. Seule création publique existe ici,
 * exactement comme demandes_contact est la seule table de ce cas.
 */

require __DIR__ . '/../config/db.php';
require __DIR__ . '/../includes/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    erreurJson('DIAGNOSTIC — méthode reçue : [' . ($_SERVER['REQUEST_METHOD'] ?? 'VIDE') . ']', 405);
}

$d = json_decode(file_get_contents('php://input'), true) ?? [];

// --- Anti-spam 1 : champ piège invisible pour un visiteur humain (masqué en CSS),
//     rempli automatiquement par la plupart des robots de formulaire. ---
if (!empty($d['site_web_piege'])) {
    // Faux succès délibéré : une erreur explicite apprendrait au robot à s'ajuster,
    // un succès silencieux ne change rien à son comportement, sans rien enregistrer.
    repondreJson(['message' => 'Message envoyé.'], 201);
}

// --- Anti-spam 2 : limite de fréquence par IP (3 messages / heure). ---
$ip = $_SERVER['REMOTE_ADDR'] ?? 'inconnu';
$stmtCompte = $pdo->prepare('SELECT COUNT(*) FROM demandes_contact WHERE ip = ? AND date_envoi > (NOW() - INTERVAL 1 HOUR)');
$stmtCompte->execute([$ip]);
if ($stmtCompte->fetchColumn() >= 3) {
    erreurJson('Trop de messages envoyés récemment. Réessayez plus tard.', 429);
}

// --- Validation métier : mêmes règles qu'historiquement dans main.js, mais dupliquées
//     ici côté serveur puisqu'un navigateur peut toujours contourner le JS affiché. ---
$nom = trim($d['nom'] ?? '');
$telephone = preg_replace('/\s+/', '', $d['telephone'] ?? '');
$message = trim($d['message'] ?? '');
$erreurs = [];

if (mb_strlen($nom) < 2) {
    $erreurs['nom'] = 'Veuillez saisir votre nom complet.';
}
if (!preg_match('/^(?:\+?229)?[0-9]{8}$/', $telephone)) {
    $erreurs['telephone'] = 'Numéro de téléphone béninois invalide.';
}
if (mb_strlen($message) < 10) {
    $erreurs['message'] = 'Le message doit contenir au moins 10 caractères.';
}
if (!empty($erreurs)) {
    erreurJson('Certains champs sont invalides.', 422, $erreurs);
}

$stmt = $pdo->prepare('INSERT INTO demandes_contact (nom, telephone, message, ip) VALUES (?, ?, ?, ?)');
$stmt->execute([$nom, $telephone, $message, $ip]);

// Envoi d'email au service clientèle — voir la note de fiabilité de mail() sur hébergement
// mutualisé transmise en résumé du chantier (préférer un envoi SMTP authentifié si possible).
$sujet = 'Nouveau message via le site — ' . $nom;
$corps = "Nom : $nom\nTéléphone : $telephone\n\nMessage :\n$message";
$entetes = "From: no-reply@coopecadbenin.bj\r\nReply-To: no-reply@coopecadbenin.bj";
@mail('snoe4057@gmail.com', $sujet, $corps, $entetes);

repondreJson(['message' => 'Message envoyé, merci.'], 201);
