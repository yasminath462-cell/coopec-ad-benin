<?php
require __DIR__ . '/../config/db.php';
require __DIR__ . '/../includes/response.php';
require __DIR__ . '/../includes/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    erreurJson('Méthode non autorisée.', 405);
}

$d = json_decode(file_get_contents('php://input'), true) ?? [];
$email = trim($d['email'] ?? '');
$motDePasse = $d['mot_de_passe'] ?? '';

if ($email === '' || $motDePasse === '') {
    erreurJson('Email et mot de passe requis.', 422);
}

$stmt = $pdo->prepare('SELECT id, email, mot_de_passe FROM admin WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$admin = $stmt->fetch();

// Hash factice utilisé quand l'email est inconnu : password_verify s'exécute quand même,
// pour que le temps de réponse ne révèle pas si l'adresse existe en base.
$hashReference = $admin['mot_de_passe'] ?? '$2y$10$abcdefghijklmnopqrstuuVWZYXabcdefghijklmnopqrstuvwxyz1';

if (!$admin || !password_verify($motDePasse, $hashReference)) {
    erreurJson('Identifiants incorrects.', 401);
}

session_regenerate_id(true); // empêche la fixation de session après authentification
$_SESSION['admin_id'] = $admin['id'];

$pdo->prepare('UPDATE admin SET derniere_connexion = NOW() WHERE id = ?')->execute([$admin['id']]);

repondreJson(['message' => 'Connexion réussie.']);
