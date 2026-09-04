/**
 * COOPEC-AD/BENIN — Logique principale du site (main.js)
 * Gère la navigation mobile, l'injection dynamique des chiffres clés,
 * l'accordéon FAQ, la validation du formulaire de contact et le bouton WhatsApp.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Contrôle d'intégrité de la source de données
  if (!window.COOPEC_DATA || !COOPEC_DATA.institution || !COOPEC_DATA.agences) {
    console.error('[main.js] Erreur critique : COOPEC_DATA est absent ou incomplet.');
    return;
  }

  initNavigation();
  injectDynamicData();
  chargerInstitutionDepuisAPI();
  chargerActualitesDepuisAPI();
  initFAQ();
  initContactForm();
  initWhatsAppButton();
});

/**
 * 1ter. Va chercher les actualités publiées dans la base (via l'API publique),
 * et les affiche dans #actualites-liste si ce conteneur existe sur la page
 * (seule actualites.html en a un — les autres pages ignorent silencieusement).
 */
async function chargerActualitesDepuisAPI() {
  const conteneur = document.getElementById('actualites-liste');
  if (!conteneur) return;

  try {
    const reponse = await fetch('/api/public/actualites.php');
    if (!reponse.ok) throw new Error('Réponse API invalide');
    const actualites = await reponse.json();

    if (!actualites.length) {
      conteneur.innerHTML = '<p style="color: var(--color-muted);">Aucune actualité publiée pour le moment.</p>';
      return;
    }

    const moisFr = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];

    conteneur.innerHTML = actualites.map(a => {
      const d = new Date(a.date_publication);
      const dateLisible = `${moisFr[d.getMonth()]} ${d.getFullYear()}`;
      const categorie = a.categorie ? ` • ${escapeHtml(a.categorie)}` : '';
      const image = a.image
        ? `<img src="${escapeHtml(a.image)}" alt="${escapeHtml(a.titre)}" style="width:100%; height:180px; object-fit:cover; border-radius:8px; margin-bottom:1rem;">`
        : '';
      return `
        <div class="card-item" style="border-top: 4px solid var(--color-green); display: flex; flex-direction: column;">
          ${image}
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-green); margin-bottom: 0.5rem;">
            📅 ${dateLisible}${categorie}
          </div>
          <h3 style="color: var(--color-green-dark); font-size: 1.25rem; margin-bottom: 0.75rem;">
            ${escapeHtml(a.titre)}
          </h3>
          <p style="font-size: 0.95rem; color: var(--color-text-light); line-height: 1.5; margin-bottom: 1.25rem; flex-grow: 1;">
            ${escapeHtml(a.resume)}
          </p>
        </div>
      `;
    }).join('');
  } catch (e) {
    conteneur.innerHTML = '<p style="color: var(--color-muted);">Actualités momentanément indisponibles.</p>';
    console.warn('[main.js] API actualités injoignable.', e);
  }
}

/**
 * Échappe le HTML pour éviter toute injection de code depuis un texte
 * saisi dans le dashboard (sécurité de base, jamais faire confiance
 * aveuglément à du texte venant de la base de données).
 */
function escapeHtml(texte) {
  const div = document.createElement('div');
  div.textContent = texte ?? '';
  return div.innerHTML;
}

/**
 * 1bis. Va chercher les vraies données institution dans la base (via l'API publique),
 * et les injecte à la place des valeurs figées de COOPEC_DATA une fois reçues.
 * Si l'API échoue (site hors ligne, etc.), les valeurs de data.js restent affichées
 * (comportement de secours, rien ne casse).
 */
async function chargerInstitutionDepuisAPI() {
  try {
    const reponse = await fetch('/api/public/institution.php');
    if (!reponse.ok) return;
    const inst = await reponse.json();

    document.querySelectorAll('[data-bind="institution-tel"]').forEach(el => {
      el.textContent = inst.telephone_principal;
    });

    document.querySelectorAll('[data-bind="institution-email"]').forEach(el => {
      el.textContent = inst.email;
      if (el.tagName === 'A') el.href = `mailto:${inst.email}`;
    });

    document.querySelectorAll('[data-bind="agrement-bceao"]').forEach(el => {
      el.textContent = inst.agrement_bceao;
    });

    document.querySelectorAll('[data-bind="ifu"]').forEach(el => {
      el.textContent = inst.ifu;
    });

    document.querySelectorAll('[data-bind="membres-count"]').forEach(el => {
      el.textContent = `+${Number(inst.membres_count).toLocaleString('fr-FR')}`;
    });

    document.querySelectorAll('[data-bind="horaires"]').forEach(el => {
      el.textContent = inst.horaires_texte;
    });

    document.querySelectorAll('[data-bind="vision"]').forEach(el => {
      el.textContent = inst.vision;
    });

    document.querySelectorAll('[data-bind="mission"]').forEach(el => {
      el.textContent = inst.mission;
    });
  } catch (e) {
    console.warn('[main.js] API institution injoignable, valeurs de secours (data.js) conservées.', e);
  }
}

/**
 * 2. Gestion du menu de navigation responsive
 */
function initNavigation() {
  const burgerBtn = document.querySelector('.btn-burger');
  const mainNav = document.querySelector('.main-nav');
  
  if (!burgerBtn || !mainNav) return;

  burgerBtn.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    burgerBtn.classList.toggle('is-active', isOpen);
    burgerBtn.setAttribute('aria-expanded', isOpen);
  });

  // Fermer le menu lors d'un clic sur un lien
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('is-open');
      burgerBtn.classList.remove('is-active');
    });
  });

  // Fermer le menu au clic en dehors
  document.addEventListener('click', (e) => {
    if (mainNav.classList.contains('is-open') && !mainNav.contains(e.target) && !burgerBtn.contains(e.target)) {
      mainNav.classList.remove('is-open');
      burgerBtn.classList.remove('is-active');
    }
  });
}

/**
 * 3. Injection dynamique des chiffres clés (Règle d'or : JAMAIS de chiffres écrits en dur)
 */
function injectDynamicData() {
  const data = window.COOPEC_DATA;

  // Nombre d'agences calculé dynamiquement
  document.querySelectorAll('[data-bind="agences-count"]').forEach(el => {
    el.textContent = data.agences.length;
  });

  // Nombre de membres
  document.querySelectorAll('[data-bind="membres-count"]').forEach(el => {
    el.textContent = `+${data.institution.membres.toLocaleString('fr-FR')}`;
  });

  // Années d'expérience calculées dynamiquement depuis l'année de création
  const annees = new Date().getFullYear() - data.institution.anneeCreation;
  document.querySelectorAll('[data-bind="experience-count"]').forEach(el => {
    el.textContent = `+${annees} ans`;
  });

  // Contacts
  document.querySelectorAll('[data-bind="institution-tel"]').forEach(el => {
    el.textContent = data.institution.telephones.join(' / ');
  });

  document.querySelectorAll('[data-bind="institution-email"]').forEach(el => {
    el.textContent = data.institution.email;
    if (el.tagName === 'A') {
      el.href = `mailto:${data.institution.email}`;
    }
  });

  document.querySelectorAll('[data-bind="agrement-bceao"]').forEach(el => {
    el.textContent = data.institution.agrementBCEAO;
  });

  document.querySelectorAll('[data-bind="ifu"]').forEach(el => {
    el.textContent = data.institution.ifu;
  });
}

/**
 * 4. Gestion de l'accordéon FAQ
 */
function initFAQ() {
  const faqContainer = document.querySelector('#faq-accordion');
  if (!faqContainer || !COOPEC_DATA.faq) return;

  // Si le conteneur est vide, on injecte la FAQ de démarrage issue de data.js
  if (faqContainer.children.length === 0 && COOPEC_DATA.faq.length > 0) {
    faqContainer.innerHTML = COOPEC_DATA.faq.map((item, index) => `
      <div class="faq-item">
        <button class="faq-question" type="button" aria-expanded="${index === 0 ? 'true' : 'false'}">
          <span>${item.question}</span>
          <span class="faq-icon">▾</span>
        </button>
        <div class="faq-answer ${index === 0 ? 'show' : ''}">
          <p>${item.reponse}</p>
        </div>
      </div>
    `).join('');
  }

  // Écouteur d'événement sur les questions
  faqContainer.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const answer = btn.nextElementSibling;
      const isAlreadyOpen = answer.classList.contains('show');

      // Fermer tous les autres
      faqContainer.querySelectorAll('.faq-answer').forEach(a => a.classList.remove('show'));
      faqContainer.querySelectorAll('.faq-question').forEach(q => {
        q.classList.remove('active');
        q.setAttribute('aria-expanded', 'false');
      });

      if (!isAlreadyOpen) {
        answer.classList.add('show');
        btn.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/**
 * 5. Validation et soumission sécurisée du formulaire de contact
 */
function initContactForm() {
  const form = document.querySelector('#contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nomInput = form.querySelector('#contact-nom');
    const telInput = form.querySelector('#contact-tel');
    const msgInput = form.querySelector('#contact-message');
    const statusBox = form.querySelector('#contact-status') || createStatusBox(form);

    let isValid = true;
    let errorMsg = '';

    // Validation du Nom
    if (!nomInput || nomInput.value.trim().length < 2) {
      isValid = false;
      errorMsg = 'Veuillez saisir votre nom complet.';
    }

    // Validation Téléphone Bénin (+229 ou 8 chiffres)
    const telVal = telInput ? telInput.value.replace(/\s+/g, '') : '';
    const beninPhoneRegex = /^(?:\+?229)?[0-9]{8}$/;
    if (isValid && (!telVal || !beninPhoneRegex.test(telVal))) {
      isValid = false;
      errorMsg = 'Veuillez saisir un numéro de téléphone béninois valide (ex: 94 01 78 36 ou +229 94 01 78 36).';
    }

    // Validation Message (min 10 caractères)
    if (isValid && (!msgInput || msgInput.value.trim().length < 10)) {
      isValid = false;
      errorMsg = 'Votre message doit contenir au moins 10 caractères.';
    }

    if (!isValid) {
      statusBox.innerHTML = `<div class="simulator-disclaimer" style="background-color: var(--color-red-light); border-color: var(--color-red); color: var(--color-red);">⚠ ${errorMsg}</div>`;
      return;
    }

    // Envoi réel vers l'API (enregistrement en base + notification email au service)
    statusBox.innerHTML = `<div class="simulator-disclaimer">Envoi en cours…</div>`;

    fetch('/api/public/contact.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nom: nomInput.value.trim(),
        telephone: telInput.value.trim(),
        message: msgInput.value.trim(),
      }),
    })
      .then(async (reponse) => {
        const data = await reponse.json().catch(() => ({}));
        if (!reponse.ok) throw new Error(data.erreur || 'Échec de l\'envoi.');

        statusBox.innerHTML = `
          <div class="simulator-disclaimer" style="background-color: var(--color-green-light); border-color: var(--color-green); color: var(--color-green-dark);">
            ✓ Merci ${escapeHtml(nomInput.value.trim())} ! Votre message a bien été transmis à notre service clientèle.<br>
            Vous pouvez également nous joindre directement au <strong>${COOPEC_DATA.institution.telephones[0]}</strong>.
          </div>
        `;
        form.reset();
      })
      .catch((err) => {
        statusBox.innerHTML = `
          <div class="simulator-disclaimer" style="background-color: var(--color-red-light); border-color: var(--color-red); color: var(--color-red);">
            ⚠ ${escapeHtml(err.message)} Vous pouvez aussi nous appeler directement au <strong>${COOPEC_DATA.institution.telephones[0]}</strong>.
          </div>
        `;
      });
  });
}

function createStatusBox(form) {
  const div = document.createElement('div');
  div.id = 'contact-status';
  div.style.marginTop = '1rem';
  form.appendChild(div);
  return div;
}

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * 6. Initialisation du bouton WhatsApp flottant
 */
function initWhatsAppButton() {
  const waBtn = document.querySelector('#whatsapp-btn');
  if (!waBtn) return;

  const phone = COOPEC_DATA.institution.telephoneWhatsApp || '+22994017836';
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const message = encodeURIComponent('Bonjour COOPEC-AD/BENIN, je souhaite avoir des informations sur vos services.');
  
  waBtn.href = `https://wa.me/${cleanPhone}?text=${message}`;
  waBtn.target = '_blank';
  waBtn.rel = 'noopener noreferrer';
  waBtn.setAttribute('aria-label', 'Contacter la COOPEC-AD sur WhatsApp');
}
