<?php
/**
 * Aides communes pour renvoyer des réponses JSON cohérentes sur toutes les routes.
 */

function repondreJson($donnees, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($donnees, JSON_UNESCAPED_UNICODE);
    exit;
}

function erreurJson(string $message, int $code = 400, array $champs = []): void {
    $corps = ['erreur' => $message];
    if (!empty($champs)) {
        $corps['champs'] = $champs;
    }
    repondreJson($corps, $code);
}
