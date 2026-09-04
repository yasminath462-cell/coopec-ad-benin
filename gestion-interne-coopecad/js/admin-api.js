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

/**
 * Badge "messages non lus" sur le lien "Messages reçus" du menu — visible
 * sur toutes les pages du dashboard (sauf login.html, qui n'a pas de menu).
 * Permet de savoir qu'un nouveau message est arrivé sans devoir ouvrir la page.
 */
async function majBadgeMessages() {
  const lien = document.querySelector('a[href="messages.html"].admin-nav-link');
  if (!lien) return;

  try {
    const messages = await appelAdmin('../api/admin/demandes-contact.php');
    const nonLus = messages.filter(m => !m.lu).length;

    const badgeExistant = lien.querySelector('.admin-badge-compteur');
    if (badgeExistant) badgeExistant.remove();

    if (nonLus > 0) {
      const badge = document.createElement('span');
      badge.className = 'admin-badge-compteur';
      badge.textContent = nonLus;
      badge.style.cssText = 'background: var(--color-red, #c0392b); color: #fff; border-radius: 999px; padding: 0.1rem 0.5rem; font-size: 0.75rem; margin-left: 0.5rem; font-weight: 700;';
      lien.appendChild(badge);
    }
  } catch (e) {
    // Silencieux : une session pas encore vérifiée ne doit pas casser la page.
  }
}

document.addEventListener('DOMContentLoaded', majBadgeMessages);
