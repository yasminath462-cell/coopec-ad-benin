<?php
require __DIR__ . '/../includes/response.php';
require __DIR__ . '/../includes/auth.php';

$_SESSION = [];
session_destroy();

repondreJson(['message' => 'Déconnexion réussie.']);
