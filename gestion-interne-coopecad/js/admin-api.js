/**
 * Wrapper commun pour tous les appels à l'API admin.
 * - Ajoute automatiquement les credentials (cookie de session) sur chaque requête.
 * - Redirige vers login.html dès qu'une réponse 401 est reçue (session absente ou expirée),
 *   quel que soit l'écran admin d'où l'appel est parti — logique centralisée une seule fois ici.
 */

async function appelAdmin(url, options = {}) {
  const reponse = await fetch(url, {
    credentials: 'same-origin',
    ...options,
  });

  if (reponse.status === 401) {
    window.location.href = 'login.html';
    throw new Error('Session expirée.');
  }

  const corps = await reponse.json().catch(() => ({}));

  if (!reponse.ok) {
    const erreur = new Error(corps.erreur || 'Erreur inconnue.');
    erreur.champs = corps.champs || {};
    erreur.status = reponse.status;
    throw erreur;
  }

  return corps;
}

function afficherAlerte(element, message, type = 'erreur') {
  element.textContent = message;
  element.className = `admin-alerte ${type} show`;
}

function masquerAlerte(element) {
  element.className = 'admin-alerte';
}
