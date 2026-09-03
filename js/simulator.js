/**
 * COOPEC-AD/BENIN — Simulateurs Financiers (simulator.js)
 * Implémente la calculatrice d'épargne (taux stricts COOPEC_DATA) et le simulateur de crédit dégressif
 * (1,5% à 1,75% / mois) avec génération dynamique de l'échéancier mensuel.
 * 
 * 100% exécuté dans le navigateur — AUCUNE donnée financière n'est transmise à un serveur.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Contrôle d'intégrité
  if (!window.COOPEC_DATA || !COOPEC_DATA.produitsEpargne || !COOPEC_DATA.credits) {
    console.error('[simulator.js] Données COOPEC_DATA.produitsEpargne ou credits manquantes.');
    return;
  }

  initCreditSimulator();
  initEpargneCalculator();
});

/**
 * 2. Moteur de calcul d'épargne (Fonction métier pure)
 */
function calculerEpargne(produitCode, montant, dureeAnnees) {
  const produit = COOPEC_DATA.produitsEpargne.find(p => p.code === produitCode);
  if (!produit) {
    console.error(`[simulator.js] Produit d'épargne inconnu : ${produitCode}`);
    return null;
  }

  if (produit.taux === null) {
    return {
      estimation: null,
      interets: null,
      message: produit.tauxAffiche || 'Variable selon contrat',
      tauxUtilise: null
    };
  }

  const interets = montant * produit.taux * dureeAnnees;
  return {
    estimation: montant + interets,
    interets: interets,
    tauxUtilise: produit.taux,
    message: null
  };
}

/**
 * 3. Moteur de simulation de crédit dégressif (Fonction métier pure)
 * Formule : Amortissement mensuel constant = Montant / Durée
 * Intérêt du mois = Capital Restant Dû * Taux Mensuel
 * Mensualité = Amortissement + Intérêt (décroissante chaque mois)
 */
function simulerCredit(montant, tauxMensuel, dureeMois) {
  const minTaux = COOPEC_DATA.credits.tauxMin; // 0.015 (1.5%)
  const maxTaux = COOPEC_DATA.credits.tauxMax; // 0.0175 (1.75%)

  // Tolérance d'arrondi
  if (tauxMensuel < minTaux - 0.0001 || tauxMensuel > maxTaux + 0.0001) {
    console.error(`[simulator.js] Taux hors de la plage autorisée (1,5% à 1,75%/mois). Valeur reçue: ${tauxMensuel}`);
    return null;
  }

  const amortissementMensuel = montant / dureeMois;
  let capitalRestant = montant;
  const echeancier = [];
  let totalInterets = 0;

  for (let mois = 1; mois <= dureeMois; mois++) {
    const interet = capitalRestant * tauxMensuel;
    const mensualite = amortissementMensuel + interet;
    totalInterets += interet;

    echeancier.push({
      mois,
      mensualite: Math.round(mensualite),
      amortissement: Math.round(amortissementMensuel),
      interet: Math.round(interet),
      capitalRestant: Math.round(Math.max(0, capitalRestant - amortissementMensuel))
    });

    capitalRestant -= amortissementMensuel;
  }

  return {
    montant,
    dureeMois,
    tauxMensuel,
    totalInterets: Math.round(totalInterets),
    totalRembourse: Math.round(montant + totalInterets),
    premiereMensualite: echeancier[0].mensualite,
    derniereMensualite: echeancier[echeancier.length - 1].mensualite,
    echeancier
  };
}

/**
 * 4. Liaison avec l'interface graphique : Simulateur de Crédit
 */
function initCreditSimulator() {
  const creditForm = document.getElementById('credit-sim-form');
  if (!creditForm) return;

  const montantInput = document.getElementById('credit-montant');
  const montantSlider = document.getElementById('credit-montant-slider');
  const dureeInput = document.getElementById('credit-duree');
  const dureeSlider = document.getElementById('credit-duree-slider');
  const tauxSelect = document.getElementById('credit-taux');

  const resMontant = document.getElementById('res-credit-montant');
  const resPremiere = document.getElementById('res-premiere-mensualite');
  const resDerniere = document.getElementById('res-derniere-mensualite');
  const resInterets = document.getElementById('res-total-interets');
  const resTotal = document.getElementById('res-total-rembourse');
  const tbody = document.getElementById('echeancier-tbody');

  function updateSync(source, target) {
    if (source && target) target.value = source.value;
  }

  if (montantInput && montantSlider) {
    montantInput.addEventListener('input', () => { updateSync(montantInput, montantSlider); runCreditCalculation(); });
    montantSlider.addEventListener('input', () => { updateSync(montantSlider, montantInput); runCreditCalculation(); });
  }

  if (dureeInput && dureeSlider) {
    dureeInput.addEventListener('input', () => { updateSync(dureeInput, dureeSlider); runCreditCalculation(); });
    dureeSlider.addEventListener('input', () => { updateSync(dureeSlider, dureeInput); runCreditCalculation(); });
  }

  if (tauxSelect) {
    tauxSelect.addEventListener('change', runCreditCalculation);
  }

  function runCreditCalculation() {
    const montant = parseFloat(montantInput ? montantInput.value : 500000) || 500000;
    const duree = parseInt(dureeInput ? dureeInput.value : 12, 10) || 12;
    const taux = parseFloat(tauxSelect ? tauxSelect.value : 0.015) || 0.015;

    const res = simulerCredit(montant, taux, duree);
    if (!res) return;

    if (resMontant) resMontant.textContent = `${formatFCFA(res.montant)} FCFA`;
    if (resPremiere) resPremiere.textContent = `${formatFCFA(res.premiereMensualite)} FCFA`;
    if (resDerniere) resDerniere.textContent = `${formatFCFA(res.derniereMensualite)} FCFA`;
    if (resInterets) resInterets.textContent = `${formatFCFA(res.totalInterets)} FCFA`;
    if (resTotal) resTotal.textContent = `${formatFCFA(res.totalRembourse)} FCFA`;

    if (tbody) {
      tbody.innerHTML = res.echeancier.map(row => `
        <tr>
          <td style="font-weight:600;">Mois ${row.mois}</td>
          <td style="font-weight:700; color:var(--color-green);">${formatFCFA(row.mensualite)} FCFA</td>
          <td>${formatFCFA(row.amortissement)} FCFA</td>
          <td style="color:var(--color-muted);">${formatFCFA(row.interet)} FCFA</td>
          <td>${formatFCFA(row.capitalRestant)} FCFA</td>
        </tr>
      `).join('');
    }
  }

  // Calcul initial
  runCreditCalculation();
}

/**
 * 5. Liaison avec l'interface graphique : Calculatrice d'Épargne
 */
function initEpargneCalculator() {
  const epargneForm = document.getElementById('epargne-sim-form');
  if (!epargneForm) return;

  const produitSelect = document.getElementById('epargne-produit');
  const montantInput = document.getElementById('epargne-montant');
  const montantSlider = document.getElementById('epargne-montant-slider');
  const dureeSelect = document.getElementById('epargne-duree');

  const resMontant = document.getElementById('res-epargne-montant');
  const resInterets = document.getElementById('res-epargne-interets');
  const resTotal = document.getElementById('res-epargne-total');
  const resTaux = document.getElementById('res-epargne-taux');
  const messageBox = document.getElementById('res-epargne-message');

  function updateSync(source, target) {
    if (source && target) target.value = source.value;
  }

  if (montantInput && montantSlider) {
    montantInput.addEventListener('input', () => { updateSync(montantInput, montantSlider); runEpargneCalculation(); });
    montantSlider.addEventListener('input', () => { updateSync(montantSlider, montantInput); runEpargneCalculation(); });
  }

  if (produitSelect) produitSelect.addEventListener('change', runEpargneCalculation);
  if (dureeSelect) dureeSelect.addEventListener('change', runEpargneCalculation);

  function runEpargneCalculation() {
    const code = produitSelect ? produitSelect.value : 'EL';
    const montant = parseFloat(montantInput ? montantInput.value : 100000) || 100000;
    const duree = parseFloat(dureeSelect ? dureeSelect.value : 1) || 1;

    const res = calculerEpargne(code, montant, duree);
    if (!res) return;

    if (resMontant) resMontant.textContent = `${formatFCFA(montant)} FCFA`;

    if (res.estimation !== null) {
      if (resInterets) resInterets.textContent = `+ ${formatFCFA(Math.round(res.interets))} FCFA`;
      if (resTotal) resTotal.textContent = `${formatFCFA(Math.round(res.estimation))} FCFA`;
      if (resTaux) resTaux.textContent = `${(res.tauxUtilise * 100).toFixed(1).replace('.', ',')} % / an`;
      if (messageBox) messageBox.style.display = 'none';
    } else {
      if (resInterets) resInterets.textContent = '—';
      if (resTotal) resTotal.textContent = `${formatFCFA(montant)} FCFA`;
      if (resTaux) resTaux.textContent = res.message;
      if (messageBox) {
        messageBox.style.display = 'block';
        messageBox.textContent = `Pour ce produit (${code}), le rendement est : ${res.message}.`;
      }
    }
  }

  // Calcul initial
  runEpargneCalculation();
}

function formatFCFA(num) {
  return Math.round(num).toLocaleString('fr-FR');
}
