import { icons } from '../components/BottomNav.js';
import { getUserId, isPremium } from '../utils/store.js';
import { showCustomAlert } from '../utils/helpers.js';
import { RECOMMENDATIONS_API_URL } from '../config.js';

// ─── Ikon SVG kategori ────────────────────────────────────────────────────────
const cleanserIcon = `
<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 32px; height: 32px;">
  <path d="M12 12 H26 L23 48 H15 L12 12 Z" fill="#DBEAFE" stroke="#2563EB" stroke-width="2.5" stroke-linejoin="round" />
  <path d="M14 20 H24" stroke="#2563EB" stroke-width="2" />
  <rect x="16" y="28" width="6" height="8" fill="white" stroke="#2563EB" stroke-width="1.8" />
  <rect x="17" y="48" width="4" height="6" fill="#93C5FD" stroke="#2563EB" stroke-width="1.8" />
  <rect x="25" y="32" width="26" height="22" rx="4" fill="#DBEAFE" stroke="#2563EB" stroke-width="2.5" />
  <rect x="28" y="26" width="20" height="6" rx="1.5" fill="#93C5FD" stroke="#2563EB" stroke-width="2.5" />
  <path d="M30 26 C30 20, 36 18, 38 22 C40 18, 46 20, 46 26" fill="#93C5FD" stroke="#2563EB" stroke-width="2" stroke-linecap="round" />
  <circle cx="38" cy="43" r="3" fill="white" stroke="#2563EB" stroke-width="1.8" />
</svg>
`;

const moisturizerIcon = `
<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 32px; height: 32px;">
  <g transform="translate(38, 12) rotate(30)">
    <rect x="-14" y="-3" width="28" height="6" rx="1.5" fill="#6EE7B7" stroke="#059669" stroke-width="2.5" />
  </g>
  <path d="M22 34 C18 24, 38 18, 44 24 C50 18, 56 24, 52 34 Z" fill="#D1FAE5" stroke="#059669" stroke-width="2.5" stroke-linejoin="round" />
  <rect x="14" y="34" width="36" height="24" rx="5" fill="#D1FAE5" stroke="#059669" stroke-width="2.5" />
  <rect x="18" y="28" width="28" height="6" rx="1" fill="#6EE7B7" stroke="#059669" stroke-width="2.5" />
  <line x1="24" y1="46" x2="40" y2="46" stroke="#059669" stroke-width="2" stroke-linecap="round" />
</svg>
`;

const serumIcon = `
<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 32px; height: 32px;">
  <rect x="25" y="16" width="14" height="8" rx="2" fill="#C4B5FD" stroke="#7C3AED" stroke-width="2.5" />
  <path d="M29 16 L29 10 C29 7, 35 7, 35 10 L35 16" fill="#EDE9FE" stroke="#7C3AED" stroke-width="2.5" />
  <path d="M19 28 C19 24, 45 24, 45 28 L45 56 C45 60, 19 60, 19 56 Z" fill="#EDE9FE" stroke="#7C3AED" stroke-width="2.5" stroke-linejoin="round" />
  <rect x="22" y="24" width="20" height="4" fill="#C4B5FD" stroke="#7C3AED" stroke-width="2" />
  <g transform="translate(36, 38)">
    <path d="M8 8 Q18 0, 20 14 Q10 18, 8 8 Z" fill="#C4B5FD" stroke="#7C3AED" stroke-width="2" stroke-linejoin="round" />
    <path d="M8 8 L16 12" stroke="#7C3AED" stroke-width="1.5" />
    <path d="M0 18 Q12 12, 18 22 Q6 28, 0 18 Z" fill="#C4B5FD" stroke="#7C3AED" stroke-width="2" stroke-linejoin="round" />
    <path d="M0 18 L12 22" stroke="#7C3AED" stroke-width="1.5" />
  </g>
</svg>
`;

const sunscreenIcon = `
<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 32px; height: 32px;">
  <rect x="20" y="14" width="24" height="7" rx="1.5" fill="#FCD34D" stroke="#D97706" stroke-width="2.5" />
  <rect x="15" y="21" width="34" height="32" rx="6" fill="#FEF3C7" stroke="#D97706" stroke-width="2.5" />
  <g transform="translate(32, 38)">
    <path d="M-4 6 L4 -6" stroke="#D97706" stroke-width="2" stroke-linecap="round" />
    <path d="M-3 0 Q-10 -4, -7 -10 Q-1 -7, -3 0 Z" fill="#FCD34D" stroke="#D97706" stroke-width="1.8" />
    <path d="M1 -2 Q8 -6, 9 0 Q2 3, 1 -2 Z" fill="#FCD34D" stroke="#D97706" stroke-width="1.8" />
  </g>
</svg>
`;

const exfoliationIcon = `
<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 32px; height: 32px;">
  <path d="M12 18 L28 21 L22 56 L11 54 Z" fill="#F9A8D4" stroke="#DB2777" stroke-width="2.5" stroke-linejoin="round" />
  <line x1="12" y1="26" x2="26" y2="29" stroke="#DB2777" stroke-width="2" />
  <ellipse cx="44" cy="42" rx="17" ry="18" fill="#FCE7F3" stroke="#DB2777" stroke-width="2.5" />
  <ellipse cx="37" cy="39" rx="3" ry="2" fill="white" stroke="#DB2777" stroke-width="1.8" />
  <ellipse cx="51" cy="39" rx="3" ry="2" fill="white" stroke="#DB2777" stroke-width="1.8" />
  <ellipse cx="44" cy="51" rx="3" ry="1.5" fill="white" stroke="#DB2777" stroke-width="1.8" />
</svg>
`;

const trendingIcon = `
<svg viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 32px; height: 32px;">
  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
</svg>
`;

const categories = [
  { id: 'cleanser',    label: 'Pembersih',  icon: cleanserIcon,    colorClass: 'cat-cleanser' },
  { id: 'moisturizer', label: 'Pelembab',   icon: moisturizerIcon, colorClass: 'cat-moisturizer' },
  { id: 'serum',       label: 'Serum',      icon: serumIcon,       colorClass: 'cat-serum' },
  { id: 'sunscreen',   label: 'Sunscreen',  icon: sunscreenIcon,   colorClass: 'cat-sunscreen' },
  { id: 'toner',       label: 'Eksfoliasi', icon: exfoliationIcon, colorClass: 'cat-exfoliation' },
];

// ─── Warna & emoji per kategori (untuk tampilan card) ────────────────────────
const CATEGORY_DISPLAY = {
  'Facial Wash':  { emoji: '🧴', bgColor: '#E3F2FD' },
  'Moisturizer':  { emoji: '💧', bgColor: '#E8F5E9' },
  'Serum':        { emoji: '✨', bgColor: '#EDE9FE' },
  'Sunscreen':    { emoji: '☀️', bgColor: '#FFFDE7' },
  'Eksfoliasi':   { emoji: '🌿', bgColor: '#F1F8E9' },
};

// ─── WSM badge styling ────────────────────────────────────────────────────────
const WSM_BADGE_STYLES = {
  'Sangat Direkomendasikan': {
    bg: 'rgba(34,197,94,0.15)',
    color: '#16a34a',
    border: 'rgba(34,197,94,0.3)',
    icon: '✓',
    label: 'Sangat Cocok',
  },
  'Cukup Direkomendasikan': {
    bg: 'rgba(251,191,36,0.15)',
    color: '#d97706',
    border: 'rgba(251,191,36,0.3)',
    icon: '◐',
    label: 'Cukup Cocok',
  },
  'Tidak Direkomendasikan': {
    bg: 'rgba(239,68,68,0.12)',
    color: '#dc2626',
    border: 'rgba(239,68,68,0.25)',
    icon: '✗',
    label: 'Kurang Cocok',
  },
};

// ─── Badge icon mapping ───────────────────────────────────────────────────────
const BADGE_ICONS = {
  'acne fighter':      '🎯',
  'brightening':       '✨',
  'hydrating':         '💧',
  'antioxidant':       '🛡️',
  'niacinamide':       '🧬',
  'vitamin c':         '🍊',
  'exfoliant':         '🔬',
  'peptide':           '⚗️',
  'ceramide':          '🧱',
  'retinoid':          '🌙',
  'bha':               '🔬',
  'aha':               '🔬',
  'urea':              '💧',
  'zinc':              '🔩',
  'fragrance':         '⚠️',
  'sulfate':           '⚠️',
  'preservative':      '🧪',
  'oil':               '🫧',
  'coconut derived':   '🥥',
  'eu allergen':       '⚠️',
};

function getBadgeIcon(badgeText) {
  const lower = badgeText.toLowerCase();
  for (const [key, icon] of Object.entries(BADGE_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return '🏷️';
}

export function renderRecommendations() {
  const page = document.createElement('div');
  page.className = 'page';

  const userId      = getUserId();
  const hasScanned  = localStorage.getItem('bglow_has_scanned_' + userId);

  if (!hasScanned) {
    page.innerHTML = `
      <div class="empty-state anim-fade-in" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:80vh;padding:20px;text-align:center;">
        <div style="font-size:5rem;margin-bottom:24px;color:var(--primary);">${icons.brain || '🤖'}</div>
        <h2 style="margin-bottom:12px;">Belum Ada Rekomendasi</h2>
        <p style="color:var(--text-secondary);margin-bottom:32px;line-height:1.6;font-size:0.95rem;">
          Sistem belum mengetahui kondisi kulit Anda. Lakukan Scan AI wajah terlebih dahulu untuk mendapatkan kurasi produk yang paling cocok dengan kebutuhan Anda.
        </p>
        <button class="btn btn-primary" id="go-scan-btn" style="width:100%;padding:14px;border-radius:12px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:8px;">
          Mulai Scan AI
        </button>
      </div>
    `;
    setTimeout(() => {
      const btn = page.querySelector('#go-scan-btn');
      if (btn) btn.addEventListener('click', () => { window.location.hash = '#/scan'; });
    }, 0);
    return page;
  }

  // ── Baca data kulit dari localStorage ──────────────────────────────────────
  const jenis_kulit    = localStorage.getItem('bglow_skin_type_'     + userId) || 'Normal';
  
  // Ambil masalah kulit prioritas
  // PENTING: bglow_journey_priority_ hanya di-set ketika user klik "Mulai Atasi X"
  // Jika belum pernah diklik, jangan otomatis pakai masalah scan — 
  // gunakan semua masalah yang terdeteksi agar rekomendasi tidak berubah tanpa aksi user
  const explicitPriority = localStorage.getItem('bglow_journey_priority_' + userId);
  const rawProblems      = localStorage.getItem('bglow_skin_problems_' + userId) || '[]';
  
  let permasalahan = [];
  if (explicitPriority) {
    // User sudah klik "Mulai Atasi X" — fokus ke 1 masalah itu
    permasalahan = [explicitPriority];
  } else {
    // Belum ada pilihan eksplisit — pakai semua masalah dari scan
    try {
      const parsed = JSON.parse(rawProblems);
      if (parsed.length > 0) {
        permasalahan = parsed.map(p => p.label || p);
      }
    } catch (_) {}
  }

  // Parse query params from hash
  const hashPart = window.location.hash.split('?')[1] || '';
  const urlParams = new URLSearchParams(hashPart);
  const initialCategory = urlParams.get('category');

  let currentCat  = initialCategory || 'cleanser';
  let filterMin   = null;
  let filterMax   = null;
  let allProducts = [];
  let isLoading   = false;

  // ── Fetch produk dari backend ───────────────────────────────────────────────
  async function fetchProducts(kategori) {
    isLoading = true;
    renderShell(kategori, [], true);

    try {
      if (kategori === 'trending') {
        const categoriesToFetch = ['sunscreen', 'cleanser', 'moisturizer', 'serum'];
        const fetchPromises = categoriesToFetch.map(async (cat) => {
          try {
            const body = {
              jenis_kulit,
              permasalahan: JSON.stringify(permasalahan),
              kategori: cat,
              limit: 15,
            };
            const resp = await fetch(RECOMMENDATIONS_API_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            });
            if (!resp.ok) return [];
            const d = await resp.json();
            return d.products || [];
          } catch (e) {
            return [];
          }
        });

        const results = await Promise.all(fetchPromises);
        let merged = [].concat(...results);

        // Sort descending by match score
        merged.sort((a, b) => b.score - a.score);

        allProducts = merged.slice(0, 20);
      } else {
        const body = {
          jenis_kulit,
          permasalahan: JSON.stringify(permasalahan),
          kategori,
          limit: 50,
        };
        const resp = await fetch(RECOMMENDATIONS_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!resp.ok) throw new Error(`Server error ${resp.status}`);
        const data = await resp.json();
        allProducts = data.products || [];
      }
    } catch (err) {
      console.error('[Rekomendasi] Fetch error:', err);
      allProducts = [];
    }

    isLoading = false;
    renderShell(kategori, allProducts, false);
  }

  // ── Render utama ────────────────────────────────────────────────────────────
  function renderShell(kategori, products, loading) {
    let filtered = products;
    if (filterMin !== null) filtered = filtered.filter(p => p.price >= filterMin);
    if (filterMax !== null) filtered = filtered.filter(p => p.price <= filterMax);

    const userIsPremium = isPremium();
    const FREE_LIMIT = 2; // Produk gratis yang bisa dilihat full

    const titleText = kategori === 'trending' ? 'Trending Harian' : 'Rekomendasi ' + (categories.find(c => c.id === kategori)?.label || '');

    // Banner upgrade untuk user free (hanya muncul kalau ada produk yang terkunci)
    const lockedCount = !userIsPremium && filtered.length > FREE_LIMIT ? filtered.length - FREE_LIMIT : 0;
    const upgradeBanner = (!userIsPremium && lockedCount > 0) ? `
      <div class="glow-upgrade-banner anim-fade-in" id="upgrade-banner">
        <div class="glow-upgrade-inner">
          <span class="glow-upgrade-crown">👑</span>
          <div class="glow-upgrade-text">
            <strong>+${lockedCount} produk terkunci</strong>
            <span>Upgrade ke Glow Plus untuk akses semua rekomendasi</span>
          </div>
          <button class="glow-upgrade-btn" id="btn-upgrade-banner">Upgrade</button>
        </div>
      </div>
    ` : '';

    page.innerHTML = `
      <div class="page-header" style="margin-bottom: 8px; justify-content: center;">
        <h1 style="text-align: center; width: 100%;">${titleText}</h1>
      </div>

      <!-- Skin context banner (Removed) -->

      <!-- Price Filter -->
      <div class="price-filter-container anim-fade-in">
        <div class="filter-label">Filter range harga</div>
        <div class="price-filter-bar">
          <input type="number" class="price-input" placeholder="Rp. 0"      id="min-price" value="${filterMin || ''}">
          <span class="price-separator">—</span>
          <input type="number" class="price-input" placeholder="Rp. 500000" id="max-price" value="${filterMax || ''}">
          <button class="btn-terapkan" id="btn-apply-filter">Terapkan</button>
        </div>
      </div>

      <!-- Category Tabs -->
      <div class="reco-categories" id="cat-tabs">
        ${categories.map(c => `
          <button class="reco-cat ${c.colorClass} ${c.id === kategori ? 'active' : ''}" data-cat="${c.id}">
            <div class="cat-icon">${c.icon}</div>
            <span class="cat-label">${c.label}</span>
          </button>
        `).join('')}
      </div>

      <!-- Upgrade Banner -->
      ${upgradeBanner}

      <!-- Product Grid -->
      <div class="product-grid" id="product-grid">
        ${loading ? renderSkeleton() : filtered.length === 0 ? renderEmpty() : filtered.map((p, i) => renderCard(p, i, i >= FREE_LIMIT && !userIsPremium)).join('')}
      </div>
    `;

    // ── Event: category tabs ─────────────────────────────────────────────────
    page.querySelectorAll('.reco-cat').forEach(tab => {
      tab.addEventListener('click', () => {
        currentCat = tab.dataset.cat;
        filterMin = null;
        filterMax = null;
        fetchProducts(currentCat);
      });
    });

    // ── Event: price filter ──────────────────────────────────────────────────
    page.querySelector('#btn-apply-filter')?.addEventListener('click', () => {
      const minVal = page.querySelector('#min-price').value;
      const maxVal = page.querySelector('#max-price').value;
      filterMin = minVal ? parseInt(minVal) : null;
      filterMax = maxVal ? parseInt(maxVal) : null;
      renderShell(currentCat, allProducts, false);
    });

    // ── Event: upgrade banner button ─────────────────────────────────────────
    page.querySelector('#btn-upgrade-banner')?.addEventListener('click', () => {
      window.location.hash = '#/subscription';
    });

    // ── Event: lock card overlay click ───────────────────────────────────────
    page.querySelectorAll('.product-card-locked').forEach(card => {
      card.addEventListener('click', () => {
        window.location.hash = '#/subscription';
      });
    });

    // ── Event: product detail ────────────────────────────────────────────────
    page.querySelectorAll('.btn-detail').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.idx);
        const product = filtered[idx];
        if (!product) return;
        const display = CATEGORY_DISPLAY[product.kategori] || { emoji: '🧴', bgColor: '#EEE' };
        const enriched = {
          ...product,
          name:        product.name,
          brand:       extractBrand(product.name),
          price:       product.price,
          emoji:       display.emoji,
          bgColor:     display.bgColor,
          rating:      4.2,
          desc:        buildDesc(product),
          ingredients: (product.cocok || []).concat(product.tidak_cocok || []),
          link:        product.link || '',
        };
        sessionStorage.setItem('bglow_selected_product', JSON.stringify(enriched));
        window.location.hash = '#/product-detail';
      });
    });
  }

  // ── Render satu product card ────────────────────────────────────────────────
  function renderCard(p, i, locked = false) {
    const display  = CATEGORY_DISPLAY[p.kategori] || { emoji: '🧴', bgColor: '#F5F5F5' };
    const imgTag   = p.image_url && p.image_url !== 'nan'
      ? `<img src="${p.image_url}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;border-radius:14px;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
         <div class="img-placeholder" style="display:none;">${display.emoji}</div>`
      : `<div class="img-placeholder">${display.emoji}</div>`;

    // WSM category badge
    const wsmStyle = WSM_BADGE_STYLES[p.kategori_rekomendasi] || WSM_BADGE_STYLES['Tidak Direkomendasikan'];
    const wsmBadge = `<div class="wsm-cat-badge" style="background:${wsmStyle.bg};color:${wsmStyle.color};border:1px solid ${wsmStyle.border};">${wsmStyle.icon} ${wsmStyle.label}</div>`;

    // Top ingredient badges (max 3, from positive ingredients only)
    const analysis = p.ingredients_analysis || [];
    const topBadges = [];
    const seenBadges = new Set();
    for (const a of analysis) {
      if (a.status !== 'positif' || !a.badge) continue;
      const badges = a.badge.split(' | ');
      for (const b of badges) {
        const bLower = b.trim().toLowerCase();
        // Skip generic/uninteresting badges
        if (['preservative', 'oil', 'silicon', 'coconut derived'].includes(bLower)) continue;
        if (!seenBadges.has(bLower) && topBadges.length < 3) {
          seenBadges.add(bLower);
          topBadges.push(b.trim());
        }
      }
      if (topBadges.length >= 3) break;
    }

    const badgeChips = topBadges.map(b =>
      `<span class="ing-badge-chip">${getBadgeIcon(b)} ${b}</span>`
    ).join('');

    // Ingredient count
    const posCount = analysis.filter(a => a.status === 'positif' || a.status === 'campuran').length;
    const negCount = analysis.filter(a => a.status === 'negatif' || a.status === 'campuran').length;

    // WSM score bar
    const scorePercent = Math.round(p.score * 100);
    const barColor = scorePercent >= 75 ? '#22c55e' : scorePercent >= 50 ? '#eab308' : '#ef4444';

    // ── Locked card (blur + paywall overlay) ──────────────────────────────────
    if (locked) {
      return `
        <div class="product-card product-card-locked" data-idx="${i}" style="cursor:pointer;position:relative;overflow:hidden;">
          <!-- Heavily blurred card content -->
          <div style="filter:blur(14px) brightness(0.6) saturate(0);pointer-events:none;user-select:none;transform:scale(1.05);">
            <div class="product-img" style="background:${display.bgColor}">
              ${imgTag}
            </div>
            <div class="product-info">
              <div class="product-name">${p.name}</div>
              <div class="product-brand" style="font-size:var(--font-xs);color:var(--text-tertiary);margin-bottom:4px;">${p.kategori}</div>
              <div class="wsm-score-bar-wrap">
                <div class="wsm-score-bar" style="width:${scorePercent}%;background:${barColor};"></div>
              </div>
              <div class="product-price">Rp${p.price.toLocaleString('id-ID')}</div>
            </div>
          </div>
          <!-- Lock overlay -->
          <div class="product-lock-overlay">
            <div class="product-lock-inner">
              <span class="product-lock-icon">
                <svg viewBox="0 0 40 40" width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <!-- Outer glow circle -->
                  <circle cx="20" cy="20" r="19" fill="url(#lockGrad)" opacity="0.15"/>
                  <!-- Lock body -->
                  <rect x="10" y="20" width="20" height="14" rx="4" fill="url(#lockBodyGrad)"/>
                  <!-- Lock shackle -->
                  <path d="M14 20v-5a6 6 0 0 1 12 0v5" stroke="url(#lockShackleGrad)" stroke-width="2.5" stroke-linecap="round" fill="none"/>
                  <!-- Keyhole -->
                  <circle cx="20" cy="26" r="2.5" fill="white" opacity="0.9"/>
                  <rect x="19" y="27" width="2" height="4" rx="1" fill="white" opacity="0.9"/>
                  <!-- Shine -->
                  <ellipse cx="16" cy="23" rx="2" ry="1" fill="white" opacity="0.2" transform="rotate(-20 16 23)"/>
                  <defs>
                    <linearGradient id="lockGrad" x1="0" y1="0" x2="40" y2="40">
                      <stop offset="0%" stop-color="#a78bfa"/>
                      <stop offset="100%" stop-color="#818cf8"/>
                    </linearGradient>
                    <linearGradient id="lockBodyGrad" x1="10" y1="20" x2="30" y2="34" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stop-color="#7c3aed"/>
                      <stop offset="100%" stop-color="#4f46e5"/>
                    </linearGradient>
                    <linearGradient id="lockShackleGrad" x1="14" y1="10" x2="26" y2="20" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stop-color="#c4b5fd"/>
                      <stop offset="100%" stop-color="#a78bfa"/>
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              <span class="product-lock-label">Glow Plus</span>
            </div>
          </div>
        </div>
      `;
    }


    // ── Normal card ───────────────────────────────────────────────────────────
    return `
      <div class="product-card" data-idx="${i}">
        <div class="product-img" style="background:${display.bgColor}">
          ${imgTag}
        </div>
        <div class="product-info">
          <div class="product-name">${p.name}</div>
          <div class="product-brand" style="font-size:var(--font-xs);color:var(--text-tertiary);margin-bottom:4px;">${p.kategori}</div>

          <!-- WSM Score Bar & Percentage -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 3px; margin-top: 2px;">
            <span style="font-size: 10.5px; font-weight: 700; color: ${barColor};">Kecocokan ${scorePercent}%</span>
          </div>
          <div class="wsm-score-bar-wrap">
            <div class="wsm-score-bar" style="width:${scorePercent}%;background:${barColor};"></div>
          </div>

          <div class="product-price">Rp${p.price.toLocaleString('id-ID')}</div>
          <button class="product-cta btn-detail" data-idx="${i}">Lihat Detail</button>
        </div>
      </div>
    `;
  }

  // ── Skeleton loader ─────────────────────────────────────────────────────────
  function renderSkeleton() {
    return Array(4).fill(0).map(() => `
      <div class="product-card" style="opacity:0.5;pointer-events:none;">
        <div class="product-img" style="background:#f0f0f0;animation:pulse 1.5s ease-in-out infinite;">
          <div class="img-placeholder">⏳</div>
        </div>
        <div class="product-info">
          <div style="height:14px;background:#e0e0e0;border-radius:6px;margin-bottom:8px;animation:pulse 1.5s ease-in-out infinite;"></div>
          <div style="height:10px;background:#e0e0e0;border-radius:6px;width:60%;animation:pulse 1.5s ease-in-out infinite;"></div>
        </div>
      </div>
    `).join('');
  }

  // ── Empty state ─────────────────────────────────────────────────────────────
  function renderEmpty() {
    return `
      <div style="grid-column:1/-1;text-align:center;padding:40px 20px;color:var(--text-secondary);">
        <div style="font-size:3rem;margin-bottom:16px;">🔍</div>
        <div style="font-weight:600;margin-bottom:8px;">Tidak ada produk ditemukan</div>
        <div style="font-size:var(--font-sm);">Coba ubah filter harga atau kategori lain.</div>
      </div>
    `;
  }

  // ── Helper: ekstrak brand dari nama produk ──────────────────────────────────
  function extractBrand(name) {
    if (!name) return '';
    return name.split(' ')[0] || name;
  }

  // ── Helper: bangun deskripsi singkat dari ingredien ─────────────────────────
  function buildDesc(product) {
    const cocok = (product.cocok || []).slice(0, 3).join(', ');
    const base  = product.texture ? `Tekstur ${product.texture}.` : '';
    if (cocok) return `${base} Mengandung ${cocok} yang cocok untuk kulit Anda.`.trim();
    return base || `Produk ${product.kategori} dari dataset B-Glow.`;
  }

  // ── Fungsi tambah ke rutinitas ──────────────────────────────────────────────
  function showAddToRoutineModal(product) {
    const overlay = document.createElement('div');
    overlay.className = 'diary-modal-overlay';
    const display = CATEGORY_DISPLAY[product.kategori] || { emoji: '🧴' };
    overlay.innerHTML = `
      <div class="diary-modal" style="text-align:center;">
        <div class="modal-handle"></div>
        <div style="font-size: 2rem; margin-bottom: 10px;">${display.emoji}</div>
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
        const catObj  = categories.find(c => c.id === currentCat);
        const display = CATEGORY_DISPLAY[product.kategori] || { emoji: '🧴', bgColor: '#EEE' };
        const newStep = {
          label:   catObj ? catObj.label : 'Produk',
          product: product.name,
          brand:   extractBrand(product.name),
          emoji:   display.emoji,
          bg:      display.bgColor,
        };
        if (time === 'morning' || time === 'both') routine.morning.push(newStep);
        if (time === 'night'   || time === 'both') routine.night.push(newStep);
        saveRoutine(routine);
        overlay.remove();
        showCustomAlert('Berhasil ditambahkan ke Rutinitas!', 'Rutinitas Diperbarui');
      });
    });

    overlay.querySelector('#btn-cancel-add').addEventListener('click', () => overlay.remove());
    document.body.appendChild(overlay);
  }

  // ── Init: fetch kategori pertama ────────────────────────────────────────────
  fetchProducts(currentCat);
  return page;
}
