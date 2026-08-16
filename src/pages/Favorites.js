import { icons } from '../components/BottomNav.js';
import { getUserId, syncUserData } from '../utils/store.js';
import { RECOMMENDATIONS_API_URL } from '../config.js';

// Identik dengan CATEGORY_DISPLAY di Recommendations.js
const CATEGORY_DISPLAY = {
  'Facial Wash':  { emoji: '🧴', bgColor: '#E3F2FD' },
  'Moisturizer':  { emoji: '💧', bgColor: '#E8F5E9' },
  'Serum':        { emoji: '✨', bgColor: '#EDE9FE' },
  'Sunscreen':    { emoji: '☀️', bgColor: '#FFFDE7' },
  'Eksfoliasi':   { emoji: '🌿', bgColor: '#F1F8E9' },
};

// Mapping kategori display name → API key
const KATEGORI_TO_API = {
  'Facial Wash':  'cleanser',
  'Moisturizer':  'moisturizer',
  'Serum':        'serum',
  'Sunscreen':    'sunscreen',
  'Eksfoliasi':   'toner',
};

export function renderFavorites() {
  const page = document.createElement('div');
  page.className = 'page';

  const userId = getUserId();
  const favKey  = 'bglow_favorites_' + userId;

  // ── User skin profile ──────────────────────────────────────────────────────
  const jenisCulit   = localStorage.getItem('bglow_skin_type_' + userId)
                    || localStorage.getItem('bglow_jenis_kulit') || 'Normal';
  const rawProblems  = localStorage.getItem('bglow_skin_problems_' + userId) || '[]';
  let permasalahan   = [];
  try { permasalahan = JSON.parse(rawProblems).map(p => p.label || p); } catch (_) {}

  function getFavorites() {
    try { return JSON.parse(localStorage.getItem(favKey) || '[]'); }
    catch (_) { return []; }
  }

  function saveFavorites(list) {
    localStorage.setItem(favKey, JSON.stringify(list));
    syncUserData({ favorites: JSON.stringify(list) });
  }

  function removeFromFavorites(index) {
    const list = getFavorites();
    list.splice(index, 1);
    saveFavorites(list);
  }

  // ── Auto-refresh: ambil data segar dari backend untuk produk yg datanya kurang ──
  async function refreshStaleProducts() {
    const list = getFavorites();
    if (list.length === 0) return false;

    // Cari produk yang datanya kurang (tidak ada match/score/image_url valid)
    const staleItems = list.filter(p =>
      !p.match || p.match === 0 || !p.score || !p.kategori || !p.image_url || p.image_url === 'nan' || p.image_url === ''
    );
    if (staleItems.length === 0) return false;

    // Group by kategori API key
    const fetchGroups = {};
    for (const item of staleItems) {
      // Coba derive API key dari kategori, kategori_key, atau default cleanser
      const apiKey = item.kategori_key
        || KATEGORI_TO_API[item.kategori]
        || 'cleanser';
      if (!fetchGroups[apiKey]) fetchGroups[apiKey] = [];
      fetchGroups[apiKey].push(item);
    }

    let updated = false;

    for (const [apiKey, items] of Object.entries(fetchGroups)) {
      try {
        const resp = await fetch(RECOMMENDATIONS_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jenis_kulit: jenisCulit,
            permasalahan: JSON.stringify(permasalahan),
            kategori: apiKey,
            limit: 50,
          }),
        });
        if (!resp.ok) continue;
        const data = await resp.json();
        const freshProducts = data.products || [];

        // Match produk berdasarkan nama
        for (const staleItem of items) {
          const fresh = freshProducts.find(fp =>
            fp.name && staleItem.name &&
            fp.name.toLowerCase().trim() === staleItem.name.toLowerCase().trim()
          );
          if (fresh) {
            // Update entry di list dengan data segar
            const listIdx = list.findIndex(p =>
              p.name && p.name.toLowerCase().trim() === staleItem.name.toLowerCase().trim()
            );
            if (listIdx >= 0) {
              list[listIdx] = { ...list[listIdx], ...fresh };
              updated = true;
            }
          }
        }
      } catch (_) { /* skip if network error */ }
    }

    if (updated) {
      saveFavorites(list);
    }
    return updated;
  }

  // ── Card — identik dengan Recommendations ──────────────────────────────────
  function renderCard(p, i) {
    const display = CATEGORY_DISPLAY[p.kategori] || { emoji: '🧴', bgColor: '#F5F5F5' };
    const hasImg  = p.image_url && p.image_url !== 'nan' && p.image_url !== '' && p.image_url !== 'None';
    const imgTag  = hasImg
      ? `<img src="${p.image_url}" alt="${p.name}"
             style="width:100%;height:100%;object-fit:cover;border-radius:14px;"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
         <div class="img-placeholder" style="display:none;">${display.emoji}</div>`
      : `<div class="img-placeholder">${display.emoji}</div>`;

    const scorePercent = Number(p.match) || (p.score ? Math.round(Number(p.score) * 100) : 0);
    const barColor     = scorePercent >= 75 ? '#22c55e' : scorePercent >= 50 ? '#eab308' : '#ef4444';
    const price        = typeof p.price === 'number'
      ? p.price : parseInt(String(p.price).replace(/\D/g, '')) || 0;

    return `
      <div class="product-card" data-idx="${i}" style="position:relative;">
        <!-- Tombol hapus -->
        <button class="fav-remove-btn" data-idx="${i}"
          style="position:absolute;top:8px;right:8px;z-index:10;
                 background:white;border:none;border-radius:50%;
                 width:28px;height:28px;display:flex;align-items:center;justify-content:center;
                 box-shadow:0 2px 8px rgba(0,0,0,0.18);cursor:pointer;color:#f43f5e;padding:0;">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        <div class="product-img" style="background:${display.bgColor}">
          ${imgTag}
        </div>
        <div class="product-info">
          <div class="product-name">${p.name || '-'}</div>
          <div class="product-brand" style="font-size:var(--font-xs);color:var(--text-tertiary);margin-bottom:4px;">
            ${p.kategori || ''}
          </div>

          ${scorePercent > 0 ? `
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px;margin-top:2px;">
              <span style="font-size:10.5px;font-weight:700;color:${barColor};">Kecocokan ${scorePercent}%</span>
            </div>
            <div class="wsm-score-bar-wrap">
              <div class="wsm-score-bar" style="width:${scorePercent}%;background:${barColor};"></div>
            </div>
          ` : ''}

          <div class="product-price">Rp${price.toLocaleString('id-ID')}</div>
          <button class="product-cta btn-detail" data-idx="${i}">Lihat Detail</button>
        </div>
      </div>
    `;
  }

  function renderPage(favorites, isRefreshing = false) {
    if (favorites.length === 0) {
      page.innerHTML = `
        <div class="page-header" style="margin-bottom:8px;">
          <button class="back-btn" id="fav-back-btn">${icons.chevronLeft}</button>
          <h1 style="width:100%;text-align:center;margin-right:40px;">Produk Favorit</h1>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
                    min-height:60vh;padding:32px 24px;text-align:center;" class="anim-fade-in">
          <div style="width:80px;height:80px;background:#fff1f2;border-radius:50%;
                      display:flex;align-items:center;justify-content:center;margin-bottom:20px;
                      border:2px solid #fecdd3;">
            <svg viewBox="0 0 24 24" width="36" height="36" fill="#f43f5e">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <h2 style="font-size:1.2rem;font-weight:800;color:#0f172a;margin:0 0 8px;">Belum Ada Favorit</h2>
          <p style="font-size:0.85rem;color:#94a3b8;line-height:1.6;margin:0 0 28px;">
            Simpan produk yang kamu suka dari halaman rekomendasi. Ketuk ikon ❤️ pada detail produk.
          </p>
          <button id="explore-btn" class="btn btn-primary"
            style="padding:14px 32px;border-radius:14px;font-weight:700;">
            Jelajahi Rekomendasi
          </button>
        </div>
      `;
      page.querySelector('#fav-back-btn')?.addEventListener('click', () => window.location.hash = '#/profile');
      page.querySelector('#explore-btn')?.addEventListener('click', () => window.location.hash = '#/recommendations');
      return;
    }

    page.innerHTML = `
      <div class="page-header" style="margin-bottom:8px;">
        <button class="back-btn" id="fav-back-btn">${icons.chevronLeft}</button>
        <h1 style="width:100%;text-align:center;margin-right:40px;">
          Produk Favorit
          <span style="font-size:0.72rem;font-weight:700;background:#fff1f2;
                       color:#f43f5e;border-radius:12px;padding:2px 9px;
                       margin-left:6px;vertical-align:middle;">${favorites.length}</span>
        </h1>
      </div>

      ${isRefreshing ? `
        <div style="text-align:center;padding:8px;font-size:0.75rem;color:#94a3b8;display:flex;align-items:center;justify-content:center;gap:6px;">
          <span style="display:inline-block;width:12px;height:12px;border:2px solid #e2e8f0;border-top-color:#6366f1;border-radius:50%;animation:spin 0.8s linear infinite;"></span>
          Memperbarui data produk...
        </div>` : ''}

      <!-- Product Grid — identik dengan Recommendations -->
      <div class="product-grid" id="fav-grid">
        ${favorites.map((p, i) => renderCard(p, i)).join('')}
      </div>
    `;

    // Event listeners
    page.querySelector('#fav-back-btn')?.addEventListener('click', () => window.location.hash = '#/profile');

    page.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.idx);
        sessionStorage.setItem('bglow_selected_product', JSON.stringify(getFavorites()[idx]));
        window.location.hash = '#/product-detail';
      });
    });

    page.querySelectorAll('.btn-detail').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.idx);
        sessionStorage.setItem('bglow_selected_product', JSON.stringify(getFavorites()[idx]));
        window.location.hash = '#/product-detail';
      });
    });

    page.querySelectorAll('.fav-remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.idx);
        const card = page.querySelector(`.product-card[data-idx="${idx}"]`);
        if (card) {
          card.style.transition = 'all 0.22s ease';
          card.style.opacity = '0';
          card.style.transform = 'scale(0.85)';
          setTimeout(() => { removeFromFavorites(idx); render(); }, 220);
        }
      });
    });
  }

  async function render() {
    const favorites = getFavorites();

    // Render dulu dengan data yang ada
    renderPage(favorites, true);

    // Refresh data stale dari backend di background
    try {
      const wasUpdated = await refreshStaleProducts();
      if (wasUpdated) {
        // Re-render dengan data segar
        renderPage(getFavorites(), false);
      } else {
        // Hapus loading indicator
        const loadingEl = page.querySelector('[style*="Memperbarui data"]');
        if (loadingEl) loadingEl.remove();
      }
    } catch (_) {
      const loadingEl = page.querySelector('[style*="Memperbarui data"]');
      if (loadingEl) loadingEl.remove();
    }
  }

  render();
  return page;
}
