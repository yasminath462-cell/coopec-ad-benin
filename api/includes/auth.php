<?php
/**
 * Authentification par session, exigée sur toutes les routes /admin/*.
 * IMPORTANT : 'secure' => true impose que le site tourne en HTTPS — sans certificat SSL actif
 * sur l'hébergement, le cookie de session ne sera jamais transmis et la connexion échouera.
 * Vérifier que le certificat SSL est activé chez l'hébergeur avant la mise en ligne.
 */

session_set_cookie_params([
    'httponly' => true,
    'samesite' => 'Strict',
    'secure'   => true,
]);
session_start();

function estConnecteAdmin(): bool {
    return !empty($_SESSION['admin_id']);
}

function exigerAdmin(): void {
    if (!estConnecteAdmin()) {
        erreurJson('Accès refusé — connexion administrateur requise.', 401);
    }
}
