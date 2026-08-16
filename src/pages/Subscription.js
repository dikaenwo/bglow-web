import { icons } from '../components/BottomNav.js';
import { getSubscriptionPlan } from '../utils/store.js';
import { initBilling, purchaseGlowPlus, restorePurchases } from '../utils/billing.js';

const plans = [
  {
    id: 'basic',
    icon: `<svg viewBox="0 0 40 40" width="36" height="36" fill="none">
      <circle cx="20" cy="20" r="19" fill="#D1FAE5" stroke="#10B981" stroke-width="1"/>
      <path d="M20 10 Q15 16 12 22 Q16 20 20 22 Q24 20 28 22 Q25 16 20 10Z" fill="#6EE7B7" stroke="#059669" stroke-width="1" stroke-linejoin="round"/>
      <path d="M20 22 Q18 26 18 30" stroke="#059669" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M20 26 Q22 24 25 24" stroke="#10B981" stroke-width="1.2" stroke-linecap="round"/>
    </svg>`,
    name: 'Free',
    tagline: 'Cocok untuk pemula',
    price: 'Gratis',
    priceSub: 'Selamanya',
    features: [
      'Scan AI (1x)',
      'Cek BPOM',
      'Rekomendasi Produk Terbatas',
    ],
    cardClass: 'basic',
    popular: false,
  },
  {
    id: 'glow-plus',
    icon: `<svg viewBox="0 0 40 40" width="36" height="36" fill="none">
      <circle cx="20" cy="20" r="19" fill="#EDE9FE" stroke="#8B5CF6" stroke-width="1"/>
      <!-- Large center star -->
      <path d="M20 10 L21.8 16.5 L28.5 16.5 L23 20.5 L25 27 L20 23.2 L15 27 L17 20.5 L11.5 16.5 L18.2 16.5 Z" fill="url(#starGrad)" stroke="#7C3AED" stroke-width="0.5" stroke-linejoin="round"/>
      <!-- Small sparkles -->
      <circle cx="9" cy="11" r="1.5" fill="#C4B5FD"/>
      <circle cx="31" cy="11" r="1" fill="#A78BFA"/>
      <circle cx="30" cy="29" r="1.5" fill="#C4B5FD"/>
      <defs>
        <linearGradient id="starGrad" x1="11" y1="10" x2="28" y2="27">
          <stop offset="0%" stop-color="#DDD6FE"/>
          <stop offset="100%" stop-color="#8B5CF6"/>
        </linearGradient>
      </defs>
    </svg>`,
    name: 'Glow Plus',
    tagline: 'Untuk pengalaman perawatan kulit terbaik',
    price: 'Rp 30.000',
    priceSub: 'per bulan',
    features: [
      'Scan AI Tanpa Batas',
      'Rekomendasi Banyak Produk',
      'Alarm UV',
      'Rutinitas/Routine',
    ],
    cardClass: 'glow-plus',
    popular: true,
  },
];

export function renderSubscription() {
  const currentPlan = getSubscriptionPlan();
  const isGlowPlus = currentPlan === 'glow-plus' || currentPlan === 'flawless';

  const page = document.createElement('div');
  page.className = 'page subscription-page';

  page.innerHTML = `
    <!-- Header -->
    <header class="sub-header">
      <button class="sub-back-btn" id="sub-back-btn">
        ${icons.chevronLeft}
      </button>
      <span class="sub-header-title">Pilih Paket</span>
    </header>

    <!-- Hero -->
    <div class="sub-hero anim-fade-in">
      <span class="sub-crown-icon">
        <svg viewBox="0 0 56 56" width="56" height="56" fill="none">
          <circle cx="28" cy="28" r="27" fill="url(#crownBg)" opacity="0.15"/>
          <!-- Crown body -->
          <path d="M10 38 L14 22 L22 32 L28 16 L34 32 L42 22 L46 38 Z" fill="url(#crownFill)" stroke="url(#crownStroke)" stroke-width="1.5" stroke-linejoin="round"/>
          <!-- Crown base band -->
          <rect x="10" y="38" width="36" height="5" rx="2.5" fill="url(#crownBand)"/>
          <!-- Gems -->
          <circle cx="28" cy="20" r="3" fill="#FCD34D" stroke="#D97706" stroke-width="1"/>
          <circle cx="14" cy="23" r="2" fill="#FCA5A5" stroke="#EF4444" stroke-width="0.8"/>
          <circle cx="42" cy="23" r="2" fill="#93C5FD" stroke="#3B82F6" stroke-width="0.8"/>
          <!-- Shine -->
          <ellipse cx="22" cy="30" rx="3" ry="1.5" fill="white" opacity="0.2" transform="rotate(-30 22 30)"/>
          <defs>
            <linearGradient id="crownBg" x1="0" y1="0" x2="56" y2="56">
              <stop offset="0%" stop-color="#FDE68A"/>
              <stop offset="100%" stop-color="#F59E0B"/>
            </linearGradient>
            <linearGradient id="crownFill" x1="10" y1="16" x2="46" y2="43" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#FDE68A"/>
              <stop offset="100%" stop-color="#D97706"/>
            </linearGradient>
            <linearGradient id="crownStroke" x1="10" y1="16" x2="46" y2="43" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#FCD34D"/>
              <stop offset="100%" stop-color="#B45309"/>
            </linearGradient>
            <linearGradient id="crownBand" x1="10" y1="38" x2="46" y2="43" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#F59E0B"/>
              <stop offset="100%" stop-color="#B45309"/>
            </linearGradient>
          </defs>
        </svg>
      </span>
      <h1 class="sub-hero-title">Upgrade ke<br><span>B-Glow Premium</span></h1>
      <p class="sub-hero-desc">Dapatkan akses fitur eksklusif dan raih kulit impianmu lebih cepat.</p>
    </div>

    <!-- Plans -->
    <div class="sub-plans">
      ${plans.map((plan, idx) => {
        const isActive = plan.id === 'glow-plus' ? isGlowPlus : (!isGlowPlus && plan.id === 'basic');
        const ctaText = isActive ? '✓ Paket Aktif' : (plan.id === 'glow-plus' ? '💳 Bayar dengan Midtrans' : 'Paket Gratis');
        
        return `
          <div class="plan-card ${plan.cardClass} ${isActive ? 'is-active' : ''} anim-fade-in-up" style="animation-delay: ${idx * 100}ms" data-plan="${plan.id}">
            ${plan.popular ? `<div class="plan-popular-badge">
              <svg viewBox="0 0 16 16" width="13" height="13" fill="none" style="display:inline-block;vertical-align:middle;margin-right:3px;">
                <circle cx="8" cy="8" r="7.5" fill="#FEF3C7" stroke="#F59E0B" stroke-width="0.8"/>
                <path d="M8 3 Q6 6 4 7 Q6 6.5 8 8 Q10 6.5 12 7 Q10 6 8 3Z" fill="#F59E0B" stroke="#D97706" stroke-width="0.5" stroke-linejoin="round"/>
                <path d="M5.5 11 Q8 9 10.5 11" stroke="#D97706" stroke-width="1" stroke-linecap="round" fill="none"/>
              </svg>
              Terpopuler
            </div>` : ''}

            <div class="plan-top">
              <span class="plan-emoji">${plan.icon}</span>
              <div>
                <div class="plan-name">${plan.name}</div>
                <div class="plan-tagline">${plan.tagline}</div>
              </div>
            </div>

            <div class="plan-price-row">
              <div class="plan-price">${plan.price}</div>
              <div class="plan-price-sub">${plan.priceSub}</div>
            </div>

            <ul class="plan-features">
              ${plan.features.map(f => `
                <li>
                  <span class="fi-check">✓</span>
                  ${f}
                </li>
              `).join('')}
            </ul>

            <button class="plan-cta-btn ${isActive ? 'active-btn' : ''}" data-plan="${plan.id}" ${isActive ? 'disabled' : ''}>
              ${ctaText}
            </button>
          </div>
        `;
      }).join('')}
    </div>

    <div class="sub-restore-box" style="text-align: center; margin-top: 16px;">
      <button id="restore-purchases-btn" style="background: none; border: none; color: #6366F1; font-size: 0.85rem; font-weight: 600; text-decoration: underline; cursor: pointer; display:inline-flex; align-items:center; gap:6px;">
        <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
          <circle cx="10" cy="10" r="9" fill="#EEF2FF" stroke="#6366F1" stroke-width="1"/>
          <path d="M6.5 10a3.5 3.5 0 1 1 3.5 3.5" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M10 6.5 L10 9.5 L7.5 8" stroke="#6366F1" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>
        Cek Status Langganan
      </button>
    </div>

    <p class="sub-footer-note">
      Pembayaran aman via Midtrans — mendukung Transfer Bank, QRIS, GoPay, OVO, dan kartu kredit.<br>
      Dengan berlangganan, kamu menyetujui Syarat &amp; Ketentuan B-Glow.
    </p>
  `;

  // Helper Toast
  const showToast = (message, isError = false) => {
    const existing = document.querySelector('.sub-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'sub-toast';
    toast.style.cssText = `
      position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%);
      background: ${isError ? 'linear-gradient(135deg, #991B1B, #7F1D1D)' : 'linear-gradient(135deg, #1E1B4B, #312E81)'};
      color: white; padding: 14px 24px; border-radius: 50px;
      font-size: 0.85rem; font-weight: 600; z-index: 9999;
      box-shadow: 0 8px 30px rgba(0,0,0,0.3);
      border: 1px solid rgba(255,255,255,0.15);
      white-space: nowrap;
      animation: slideUp 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  };

  // Initialize Billing
  initBilling((result) => {
    if (result.success) {
      document.body.classList.remove('has-paywall');
      showToast('✨ Pembelian Glow Plus Berhasil!');
      setTimeout(() => {
        window.location.hash = '#/';
      }, 1500);
    } else if (result.error) {
      showToast('❌ ' + result.error, true);
    }
  });

  // Back button
  page.querySelector('#sub-back-btn').addEventListener('click', () => {
    window.history.back();
  });

  // Restore Purchases button
  page.querySelector('#restore-purchases-btn').addEventListener('click', async () => {
    showToast('🔍 Memeriksa status langganan...');
    const result = await restorePurchases();
    if (result.success) {
      document.body.classList.remove('has-paywall');
      showToast('✨ Langganan Glow Plus berhasil dipulihkan!');
      setTimeout(() => {
        window.location.hash = '#/';
      }, 1500);
    } else {
      showToast('❌ ' + (result.error || 'Tidak ditemukan langganan aktif.'), true);
    }
  });

  // CTA buttons
  page.querySelectorAll('.plan-cta-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const planId = btn.dataset.plan;
      if (planId === 'basic') return;

      btn.disabled = true;
      btn.textContent = 'Memproses...';
      showToast('💳 Membuka halaman pembayaran Midtrans...');

      try {
        const res = await purchaseGlowPlus();
        if (res && res.success) {
          document.body.classList.remove('has-paywall');
          showToast('✨ Selamat! Glow Plus berhasil diaktifkan.');
          setTimeout(() => { window.location.hash = '#/'; }, 1500);
        } else if (res && res.pending) {
          showToast('⏳ Pembayaran sedang diproses. Cek email untuk instruksi selanjutnya.', false);
          btn.disabled = false;
          btn.textContent = '💳 Bayar dengan Midtrans';
        } else if (res && res.cancelled) {
          showToast('ℹ️ Pembayaran dibatalkan.', false);
          btn.disabled = false;
          btn.textContent = '💳 Bayar dengan Midtrans';
        } else {
          showToast('❌ ' + (res?.error || 'Gagal memproses pembayaran.'), true);
          btn.disabled = false;
          btn.textContent = '💳 Bayar dengan Midtrans';
        }
      } catch (err) {
        console.error('[Subscription] Purchase error:', err);
        showToast('❌ Gagal memproses pembayaran.', true);
        btn.disabled = false;
        btn.textContent = '💳 Bayar dengan Midtrans';
      }
    });
  });

  return page;
}
