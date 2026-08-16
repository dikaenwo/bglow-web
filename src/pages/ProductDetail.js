import { icons } from '../components/BottomNav.js';
import { getUserId, syncUserData } from '../utils/store.js';
import { showCustomAlert } from '../utils/helpers.js';

// ─── Badge icon mapping ───────────────────────────────────────────────────────
const BADGE_ICONS = {
  'acne fighter': '🎯',
  'brightening': '✨',
  'hydrating': '💧',
  'antioxidant': '🛡️',
  'niacinamide': '🧬',
  'vitamin c': '🍊',
  'exfoliant': '🔬',
  'peptide': '⚗️',
  'ceramide': '🧱',
  'retinoid': '🌙',
  'bha': '🔬',
  'aha': '🔬',
  'urea': '💧',
  'zinc': '🔩',
  'fragrance': '⚠️',
  'sulfate': '⚠️',
  'preservative': '🧪',
  'oil': '🫧',
  'coconut derived': '🥥',
  'eu allergen': '⚠️',
  'may feed fungal acne': '🍄',
  'reduces redness': '🩹',
  'reduces irritation': '🩹',
  'good for oily skin': '💦',
  'good for texture': '🪄',
  'reduces large pores': '🔎',
  'helps with dark spots': '🌑',
  'good for scar healing': '💚',
  'helps with barrier repair': '🧱',
  'helps with anti-aging': '⏳',
};

function getBadgeIcon(badgeText) {
  const lower = badgeText.toLowerCase();
  for (const [key, icon] of Object.entries(BADGE_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return '🏷️';
}

// ─── Status colors ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  'positif': { color: '#16a34a', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)', icon: '✓', label: 'Cocok' },
  'negatif': { color: '#dc2626', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', icon: '✗', label: 'Hindari' },
  'campuran': { color: '#d97706', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)', icon: '◐', label: 'Campuran' },
  'netral': { color: '#6b7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.15)', icon: '·', label: 'Netral' },
};



const fallbackBottleIcon = `<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.6;"><path d="M12 2v4M8 6h8v14a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V6z"/></svg>`;

export function renderProductDetail(productParam) {
  let p = productParam;
  if (!p) {
    try {
      p = JSON.parse(sessionStorage.getItem('bglow_selected_product') || '{}');
    } catch (e) {
      p = {};
    }
  }

  const page = document.createElement('div');
  page.className = 'product-detail-page';

  const userId = getUserId();
  const favKey = 'bglow_favorites_' + userId;

  function getFavorites() {
    try {
      const data = localStorage.getItem(favKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function isFavorite(product) {
    if (!product || !product.name) return false;
    const list = getFavorites();
    return list.some(item => item.name === product.name && item.brand === product.brand);
  }

  function toggleFavorite(product) {
    if (!product || !product.name) return false;
    let list = getFavorites();
    const index = list.findIndex(item => item.name === product.name && item.brand === product.brand);
    let favorited = false;
    if (index >= 0) {
      list.splice(index, 1);
    } else {
      list.push(product);
      favorited = true;
    }
    localStorage.setItem(favKey, JSON.stringify(list));
    syncUserData({ favorites: JSON.stringify(list) });
    return favorited;
  }

  const heartOutline = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
  const heartFill = `<svg viewBox="0 0 24 24" fill="#f43f5e" stroke="#f43f5e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;

  const currentlyFav = isFavorite(p);
  const favBtnHtml = `
    <button class="pd-btn-fav ${currentlyFav ? 'active' : ''}" id="pd-btn-fav" title="Favorit">
      ${currentlyFav ? heartFill : heartOutline}
    </button>
  `;

// ── WSM Data ────────────────────────────────────────────────────────────────
const wsmDetail = p.wsm_detail || {};
const wsmScore = p.score || 0;
const wsmPercent = Math.round(wsmScore * 100);
const kategoriRek = p.kategori_rekomendasi || 'Tidak Direkomendasikan';
const analysis = p.ingredients_analysis || [];

// Separate positive, negative, neutral ingredients
const positifList = analysis.filter(a => a.status === 'positif' || a.status === 'campuran');
const negatifList = analysis.filter(a => a.status === 'negatif' || a.status === 'campuran');

// WSM bar color
const wsmBarColor = wsmPercent >= 75 ? '#22c55e' : wsmPercent >= 50 ? '#eab308' : '#ef4444';
const wsmBadgeBg = wsmPercent >= 75 ? 'rgba(34,197,94,0.12)' : wsmPercent >= 50 ? 'rgba(251,191,36,0.12)' : 'rgba(239,68,68,0.1)';
const wsmBadgeColor = wsmPercent >= 75 ? '#16a34a' : wsmPercent >= 50 ? '#d97706' : '#dc2626';



// Build ingredients analysis rows
function renderIngRow(a) {
  const st = STATUS_CONFIG[a.status] || STATUS_CONFIG['netral'];
  const badges = (a.badge || '').split(' | ').filter(b => b.trim());
  const badgeHtml = badges.slice(0, 4).map(b =>
    `<span class="pd-ing-badge" style="color:${st.color};border-color:${st.border};background:${st.bg};">${b.trim()}</span>`
  ).join('');

  const bucketLabel = { 'awal': 'Awal', 'tengah': 'Tengah', 'akhir': 'Akhir' }[a.bucket] || a.bucket;

  return `
      <div class="pd-ing-row" style="border-left: 3px solid ${st.color};">
        <div class="pd-ing-header">
          <span class="pd-ing-name">${a.name}</span>
          <span class="pd-ing-status-pill" style="background:${st.bg};color:${st.color};border:1px solid ${st.border};">${st.icon} ${st.label}</span>
        </div>
        ${badgeHtml ? `<div class="pd-ing-badges">${badgeHtml}</div>` : ''}
        ${a.deskripsi ? `<div class="pd-ing-meta"><span class="pd-ing-desc">${a.deskripsi}</span></div>` : ''}
      </div>
    `;
}

// Get ingredients lists
const allIngs = [...positifList, ...negatifList, ...analysis.filter(a => a.status === 'netral')];

page.innerHTML = `
    <!-- Sticky Header -->
    <div class="page-header" style="justify-content: space-between;">
      <button class="back-btn" id="pd-back-btn">${icons.chevronLeft}</button>
      <h1 style="margin: 0; font-size: 1rem; font-weight: 700;">Detail Produk</h1>
      <div style="width:40px;"></div>
    </div>

    <!-- Scrollable Content -->
    <div class="pd-scroll-area">
      <div class="pd-hero-img" style="background:${p.bgColor || '#F1F5F9'}; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative;">
        ${p.image_url && p.image_url !== 'nan'
    ? `<img src="${p.image_url}" alt="${p.name || ''}" style="width:100%;height:100%;object-fit:cover;border-radius:20px;" onerror="this.style.display='none';this.nextElementSibling.style.display='block';" />
             <div class="pd-svg-fallback" style="display:none; color: var(--text-secondary); opacity: 0.7; height: 48px; width: 48px;">${fallbackBottleIcon}</div>`
    : `<div class="pd-svg-fallback" style="color: var(--text-secondary); opacity: 0.7; height: 48px; width: 48px;">${fallbackBottleIcon}</div>`
  }
      </div>

      <div class="pd-content">
        <div class="pd-price-lg">Rp ${(p.price || 0).toLocaleString()}</div>

        <div class="pd-title-section">
          <h2 class="pd-name">${p.name || ''}</h2>
          <div class="pd-brand">${p.brand || ''}</div>
        </div>

        <div class="pd-section">
          <h3 class="pd-section-title">Deskripsi</h3>
          <p class="pd-text">${p.desc || ''}</p>
        </div>

        <!-- Ingredients Analysis (Dynamic) -->
        ${allIngs.length > 0 ? `
        <div class="pd-section">
          <h3 class="pd-section-title">Analisis Ingredient</h3>
          <p class="pd-text-sm" style="margin-bottom:12px;">Berdasarkan jenis kulit & masalah kulit Anda, berikut Analisis Ingredient produk ini:</p>

          ${allIngs.slice(0, 5).map(a => renderIngRow(a)).join('')}
          
          ${allIngs.length > 5 ? `
            <div class="ing-list-more" style="display:none;">
              ${allIngs.slice(5).map(a => renderIngRow(a)).join('')}
            </div>
            <button class="pd-show-all-btn" id="show-all-ings-btn">Tampilkan Semua (${allIngs.length})</button>
          ` : ''}
        </div>
        ` : `
        <div class="pd-section">
          <h3 class="pd-section-title">Analisis Ingredient</h3>
          <p class="pd-text-sm">Tidak ada data Analisis Ingredient untuk produk ini.</p>
        </div>
        `}
      </div>
    </div>

    <!-- Fixed Bottom Buttons -->
    <div class="pd-action-buttons">
      <button class="btn btn-primary pd-btn-buy">Dapatkan Produk</button>
      <button class="btn btn-outline pd-btn-routine">+ Tambah Ke Routine</button>
      ${favBtnHtml}
    </div>
  `;

page.querySelector('#pd-back-btn').addEventListener('click', () => {
  window.history.back();
});

// Buy button → open product link
page.querySelector('.pd-btn-buy').addEventListener('click', () => {
  if (p.link && p.link !== 'nan' && p.link.startsWith('http')) {
    window.open(p.link, '_blank');
  } else {
    showCustomAlert('Link produk tidak tersedia.', 'Info');
  }
});

page.querySelector('.pd-btn-routine').addEventListener('click', () => {
  showAddToRoutineModal(p);
});

// Show All logic
page.querySelector('#show-all-ings-btn')?.addEventListener('click', (e) => {
  page.querySelector('.ing-list-more').style.display = 'block';
  e.target.style.display = 'none';
});

const favBtn = page.querySelector('#pd-btn-fav');
if (favBtn) {
  favBtn.addEventListener('click', () => {
    const added = toggleFavorite(p);
    if (added) {
      favBtn.classList.add('active');
      favBtn.innerHTML = heartFill;
    } else {
      favBtn.classList.remove('active');
      favBtn.innerHTML = heartOutline;
    }
  });
}

function showAddToRoutineModal(product) {
  const overlay = document.createElement('div');
  overlay.className = 'diary-modal-overlay';
  overlay.innerHTML = `
      <div class="diary-modal" style="text-align:center;">
        <div class="modal-handle"></div>
        <div style="width: 60px; height: 60px; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; overflow: hidden; border-radius: 8px; background: ${product.bgColor || '#F1F5F9'}">
          ${product.image_url && product.image_url !== 'nan'
      ? `<img src="${product.image_url}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;" />`
      : fallbackBottleIcon
    }
        </div>
        <h3 style="margin-bottom: 5px;">Tambah ke Rutinitas?</h3>
        <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom: 20px;">
          Ingin memasukkan <strong>${product.name}</strong> ke rutinitas yang mana?
        </p>
        <div style="display:flex; flex-direction:column; gap:10px;">
          <button class="btn btn-outline btn-add-time" data-time="morning" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
            <img src="/pagi.png" alt="Pagi" style="width: 20px; height: 20px; object-fit: contain;" /> Pagi Hari
          </button>
          <button class="btn btn-outline btn-add-time" data-time="night" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
            <img src="/malam.png" alt="Malam" style="width: 20px; height: 20px; object-fit: contain;" /> Malam Hari
          </button>
          <button class="btn btn-primary btn-add-time" data-time="both" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
            <img src="/pagi.png" alt="Pagi" style="width: 20px; height: 20px; object-fit: contain; filter: brightness(0) invert(1);" />
            &
            <img src="/malam.png" alt="Malam" style="width: 20px; height: 20px; object-fit: contain; filter: brightness(0) invert(1);" />
            Keduanya
          </button>
        </div>
        <button class="btn" id="btn-cancel-add" style="margin-top: 15px; width: 100%; color:var(--text-secondary);">Batal</button>
      </div>
    `;

  overlay.querySelectorAll('.btn-add-time').forEach(btn => {
    btn.addEventListener('click', async () => {
      const time = btn.dataset.time;
      const { getRoutine, saveRoutine } = await import('../utils/store.js');
      const routine = getRoutine();

      const nameLower = product.name.toLowerCase();
      let catLabel = 'Pembersih';
      if (nameLower.includes('cleanser') || nameLower.includes('cleanse') || product.emoji === '🧴' || product.emoji === '🫧') {
        catLabel = 'Pembersih';
      } else if (nameLower.includes('moisture') || nameLower.includes('pelembab') || nameLower.includes('cream') || nameLower.includes('gel') || product.emoji === '🪴' || product.emoji === '💧' || product.emoji === '🐌') {
        catLabel = 'Pelembap';
      } else if (nameLower.includes('serum') || nameLower.includes('ampoule') || product.emoji === '✨' || product.emoji === '⚗️') {
        catLabel = 'Serum';
      } else if (nameLower.includes('sun') || nameLower.includes('spf') || nameLower.includes('uv') || product.emoji === '☀️' || product.emoji === '🌊' || product.emoji === '🛡️') {
        catLabel = 'Tabir Surya';
      } else if (nameLower.includes('toner') || nameLower.includes('essence') || product.emoji === '🌿' || product.emoji === '🍃' || product.emoji === '🌱') {
        catLabel = 'Toner';
      } else if (nameLower.includes('mask') || product.emoji === '🎭') {
        catLabel = 'Masker';
      } else if (nameLower.includes('exfoliat') || nameLower.includes('aha') || nameLower.includes('bha') || product.emoji === '🌟') {
        catLabel = 'Exfoliator';
      } else if (nameLower.includes('retinol') || product.emoji === '🌙') {
        catLabel = 'Retinol';
      } else if (nameLower.includes('eye') || product.emoji === '👁️') {
        catLabel = 'Eye Cream';
      }

      const newStep = {
        label: catLabel,
        product: product.name,
        brand: product.brand,
        emoji: product.emoji || '🧴',
        bg: product.bgColor || '#E3F2FD'
      };

      if (time === 'morning' || time === 'both') routine.morning.push(newStep);
      if (time === 'night' || time === 'both') routine.night.push(newStep);

      saveRoutine(routine);
      overlay.remove();

      showCustomAlert("Berhasil ditambahkan ke Rutinitas!", "Rutinitas Diperbarui");
    });
  });

  overlay.querySelector('#btn-cancel-add').addEventListener('click', () => overlay.remove());
  document.body.appendChild(overlay);
}

return page;
}
