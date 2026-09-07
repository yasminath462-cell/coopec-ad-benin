<?php
/**
 * Script de relance automatique — destiné à être exécuté par la tâche planifiée
 * (Cron Schedule) de Railway, PAS par une requête web (aucune route publique
 * n'y mène, pour éviter qu'il soit déclenché par n'importe quel visiteur).
 *
 * Vérifie les messages de contact non lus depuis plus de X heures (délai
 * configurable depuis le tableau de bord, section Institution), et renvoie
 * une notification par email pour chacun, une seule fois par message.
 */

require __DIR__ . '/api/config/db.php';

$institution = $pdo->query('SELECT email_notifications, delai_relance_heures FROM institution WHERE id = 1')->fetch();

if (!$institution || empty($institution['email_notifications'])) {
    echo "Aucune adresse de notification configuree, script arrete.\n";
    exit;
}

$emailDest = $institution['email_notifications'];
$delaiHeures = (int)($institution['delai_relance_heures'] ?? 24);

$stmt = $pdo->prepare(
    'SELECT id, nom, telephone, message, date_envoi FROM demandes_contact
     WHERE lu = 0 AND relance_envoyee = 0
     AND date_envoi < (NOW() - INTERVAL :delai HOUR)'
);
$stmt->execute(['delai' => $delaiHeures]);
$messages = $stmt->fetchAll();

if (empty($messages)) {
    echo "Aucun message a relancer.\n";
    exit;
}

$stmtMarquer = $pdo->prepare('UPDATE demandes_contact SET relance_envoyee = 1 WHERE id = ?');

foreach ($messages as $m) {
    $sujet = 'RAPPEL — Message non traite depuis plus de ' . $delaiHeures . 'h — ' . $m['nom'];
    $corps = "Ce message attend une reponse depuis le " . $m['date_envoi'] . ".\n\n"
        . "Nom : " . $m['nom'] . "\n"
        . "Telephone : " . $m['telephone'] . "\n\n"
        . "Message :\n" . $m['message'];
    $entetes = "From: no-reply@coopecadbenin.bj\r\nReply-To: no-reply@coopecadbenin.bj";

    @mail($emailDest, $sujet, $corps, $entetes);
    $stmtMarquer->execute([$m['id']]);
}

echo count($messages) . " relance(s) envoyee(s).\n";
