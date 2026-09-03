/**
 * COOPEC-AD/BENIN — Cartographie Leaflet & Répertoire des Agences (map.js)
 * Implémente la carte interactive Leaflet/OpenStreetMap, le filtre dynamique des départements,
 * et le rendu 100% dynamique de la liste des 12 agences à partir de COOPEC_DATA.agences.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Contrôle d'intégrité
  if (!window.COOPEC_DATA || !Array.isArray(COOPEC_DATA.agences)) {
    console.error('[map.js] COOPEC_DATA.agences manquant ou invalide — carte et liste non initialisées.');
    return;
  }

  initAgencesMapAndList();
});

function initAgencesMapAndList() {
  const agences = COOPEC_DATA.agences;
  const mapElement = document.getElementById('agences-map');
  const listContainer = document.getElementById('agences-list');
  const deptSelect = document.getElementById('filter-departement');
  const countBadge = document.querySelector('[data-departements-count]');

  // 2. Calcul dynamique des départements uniques (JAMAIS en dur)
  const departements = [...new Set(agences.map(a => a.departement))].sort();

  if (countBadge) {
    countBadge.textContent = `Tous les départements (${departements.length})`;
  }

  // 3. Remplissage dynamique du menu déroulant des départements
  if (deptSelect) {
    deptSelect.innerHTML = `<option value="all">Tous les départements (${departements.length})</option>` +
      departements.map(d => {
        const countInDept = agences.filter(a => a.departement === d).length;
        return `<option value="${d}">${d} (${countInDept} agence${countInDept > 1 ? 's' : ''})</option>`;
      }).join('');

    deptSelect.addEventListener('change', () => {
      const selectedDept = deptSelect.value;
      renderAgencesList(selectedDept);
      filterMapMarkers(selectedDept);
    });
  }

  // 4. Initialisation de la carte Leaflet si le conteneur existe
  let map = null;
  let markersLayer = null;
  const markers = [];

  if (mapElement && typeof L !== 'undefined') {
    // Centre géographique du Bénin
    map = L.map('agences-map', {
      scrollWheelZoom: false
    }).setView([7.8, 2.3], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
      maxZoom: 18
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);

    // Icône personnalisée pour le Siège et les Agences
    const siegeIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const agenceIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Placement des marqueurs pour les agences ayant des coordonnées
    agences.forEach(a => {
      if (a.lat != null && a.lng != null) {
        const marker = L.marker([a.lat, a.lng], {
          icon: a.estSiege ? siegeIcon : agenceIcon,
          title: a.nom
        });

        const popupContent = `
          <div style="font-family: var(--font-family, sans-serif); min-width: 180px;">
            <strong style="color: #14432A; font-size: 1rem;">${a.nom}</strong>
            <span style="display:inline-block; font-size: 0.75rem; background: #EBF5EE; color: #1F6E3C; padding: 2px 6px; border-radius: 4px; margin-left: 4px;">${a.departement}</span>
            <p style="font-size: 0.85rem; color: #555; margin: 6px 0;">${a.repere}</p>
            <div style="font-size: 0.85rem; font-weight: bold; color: #1F6E3C;">
              📞 <a href="tel:${a.telephone.split('/')[0].trim()}" style="color: #1F6E3C; text-decoration: none;">${a.telephone}</a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        markersLayer.addLayer(marker);
        markers.push({ data: a, marker });
      }
    });
  }

  // 5. Fonction de rendu dynamique de la liste des agences
  function renderAgencesList(deptFilter = 'all') {
    if (!listContainer) return;

    const filtered = deptFilter === 'all' 
      ? agences 
      : agences.filter(a => a.departement === deptFilter);

    if (filtered.length === 0) {
      listContainer.innerHTML = `<div class="card-item" style="text-align: center; color: var(--color-muted);">Aucune agence trouvée pour ce département.</div>`;
      return;
    }

    listContainer.innerHTML = filtered.map(a => `
      <div class="agence-card ${a.estSiege ? 'is-siege' : ''}" data-dept="${a.departement}" id="agence-${a.id}">
        <div class="agence-header">
          <h4 class="agence-name">
            ${a.nom} ${a.estSiege ? '<span class="badge-taux" style="font-size:0.75rem;">Siège Social</span>' : ''}
          </h4>
          <span class="agence-dept-tag">${a.departement}</span>
        </div>
        <p class="agence-repere">📍 ${a.repere}</p>
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
          <span class="agence-tel">📞 ${a.telephone}</span>
          ${a.telephone && a.telephone !== 'N/A' ? `
            <a href="tel:${a.telephone.split('/')[0].replace(/\s+/g, '')}" class="btn btn-sm btn-secondary">
              Appeler
            </a>
          ` : ''}
        </div>
      </div>
    `).join('');
  }

  // 6. Filtrage des marqueurs sur la carte
  function filterMapMarkers(deptFilter) {
    if (!markersLayer || !map) return;
    markersLayer.clearLayers();

    const bounds = [];
    markers.forEach(({ data, marker }) => {
      if (deptFilter === 'all' || data.departement === deptFilter) {
        markersLayer.addLayer(marker);
        bounds.push(marker.getLatLng());
      }
    });

    if (bounds.length > 0) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40], maxZoom: 12 });
    }
  }

  // Rendu initial de la liste
  renderAgencesList('all');
}
