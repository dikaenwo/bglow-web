// ─── Ripple Effect Utility ───
export function addRipple(element) {
  element.classList.add('ripple-container');
  element.addEventListener('click', (e) => {
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    element.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
}

// ─── Stagger Animation ───
export function staggerChildren(container, selector, baseDelay = 80) {
  const children = container.querySelectorAll(selector);
  children.forEach((child, i) => {
    child.style.animationDelay = `${i * baseDelay}ms`;
  });
}

// ─── Intersection Observer for Animations ───
export function animateOnScroll(elements, animClass = 'anim-fade-in-up') {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add(animClass);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  elements.forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });
}

// ─── Format Date ───
export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  }).format(date);
}

// ─── Random Int ───
export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Inject Premium Popup Styles once at module level
if (typeof document !== 'undefined' && !document.getElementById('custom-popup-styles')) {
  const style = document.createElement('style');
  style.id = 'custom-popup-styles';
  style.textContent = `
    @keyframes popupZoom {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .custom-popup-overlay {
      position: fixed !important;
      inset: 0 !important;
      background: rgba(15, 23, 42, 0.45) !important; /* Soft dark slate translucent overlay */
      z-index: 99999 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      backdrop-filter: blur(8px);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      padding: 24px !important;
    }
    .custom-popup-modal {
      width: 100% !important;
      max-width: 360px !important;
      padding: 36px 28px !important;
      text-align: center !important;
      border-radius: 28px !important;
      background: #ffffff !important; /* Clean premium white card background */
      border: 1px solid rgba(15, 23, 42, 0.08) !important;
      box-shadow: 0 24px 50px rgba(15, 23, 42, 0.15) !important;
      color: #1e293b !important;
      animation: popupZoom 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) both !important;
      box-sizing: border-box !important;
    }
    .custom-popup-modal * {
      box-sizing: border-box !important;
    }
    
    /* Subtle borders based on alert type */
    .custom-popup-modal.success {
      border-color: rgba(16, 185, 129, 0.2) !important;
    }
    .custom-popup-modal.warning {
      border-color: rgba(245, 158, 11, 0.2) !important;
    }
    .custom-popup-modal.info {
      border-color: rgba(59, 130, 246, 0.2) !important;
    }

    .custom-popup-icon-wrapper {
      width: 64px !important;
      height: 64px !important;
      border-radius: 50% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      margin: 0 auto 20px auto !important;
      font-size: 1.8rem !important;
    }
    .custom-popup-icon-wrapper.success {
      background: rgba(16, 185, 129, 0.1) !important;
      border: 1px solid rgba(16, 185, 129, 0.25) !important;
      color: #10b981 !important;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1) !important;
    }
    .custom-popup-icon-wrapper.warning {
      background: rgba(245, 158, 11, 0.1) !important;
      border: 1px solid rgba(245, 158, 11, 0.25) !important;
      color: #f59e0b !important;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.1) !important;
    }
    .custom-popup-icon-wrapper.info {
      background: rgba(59, 130, 246, 0.1) !important;
      border: 1px solid rgba(59, 130, 246, 0.25) !important;
      color: #3b82f6 !important;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1) !important;
    }
    
    .custom-popup-title {
      margin: 0 0 12px 0 !important;
      font-size: 1.25rem !important;
      font-weight: 700 !important;
      color: #0f172a !important;
      letter-spacing: -0.3px !important;
      line-height: 1.3 !important;
    }
    .custom-popup-message {
      color: #475569 !important;
      font-size: 0.95rem !important;
      line-height: 1.6 !important;
      margin: 0 0 28px 0 !important;
      white-space: pre-line !important;
      word-break: break-word !important;
    }
    .custom-popup-actions {
      display: flex !important;
      gap: 12px !important;
      width: 100% !important;
      justify-content: center !important;
    }
    
    .custom-btn-ok {
      flex: 1 !important;
      border: none !important;
      border-radius: 9999px !important;
      padding: 12px 24px !important;
      font-size: 0.95rem !important;
      font-weight: 700 !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
      text-transform: none !important;
      margin: 0 !important;
    }
    
    /* Type specific button coloring (Vibrant with White Text) */
    .success .custom-btn-ok {
      background: #10b981 !important;
      color: #ffffff !important;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2) !important;
    }
    .success .custom-btn-ok:hover {
      background: #059669 !important;
      box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35) !important;
      transform: translateY(-1px) !important;
    }
    
    .warning .custom-btn-ok {
      background: #f59e0b !important;
      color: #ffffff !important;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2) !important;
    }
    .warning .custom-btn-ok:hover {
      background: #d97706 !important;
      box-shadow: 0 6px 16px rgba(245, 158, 11, 0.35) !important;
      transform: translateY(-1px) !important;
    }
    
    .info .custom-btn-ok {
      background: #3b82f6 !important;
      color: #ffffff !important;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2) !important;
    }
    .info .custom-btn-ok:hover {
      background: #2563eb !important;
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.35) !important;
      transform: translateY(-1px) !important;
    }
    
    .custom-btn-ok:active {
      transform: translateY(1px) !important;
    }
    
    .custom-btn-cancel {
      flex: 1 !important;
      background: #f1f5f9 !important;
      color: #475569 !important;
      border: 1px solid #cbd5e1 !important;
      border-radius: 9999px !important;
      padding: 12px 24px !important;
      font-size: 0.95rem !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
      text-transform: none !important;
      margin: 0 !important;
    }
    .custom-btn-cancel:hover {
      background: #e2e8f0 !important;
      color: #0f172a !important;
      transform: translateY(-1px) !important;
    }
    .custom-btn-cancel:active {
      transform: translateY(1px) !important;
    }
  `;
  document.head.appendChild(style);
}

// ─── Custom Alert Modal ───
export function showCustomAlert(message, title = 'B-Glow', callback = null) {
  const existing = document.querySelector('.custom-alert-overlay');
  if (existing) existing.remove();

  const safeTitle = typeof title === 'string' ? title : (title ? String(title) : 'B-Glow');
  const safeMsg = typeof message === 'string' ? message : (message ? String(message) : '');

  // Determine icon type based on title/message
  const title_lower = safeTitle.toLowerCase();
  const msg_lower = safeMsg.toLowerCase();
  
  let icon_type = 'info';
  let icon_char = '🔔';
  
  if (title_lower.includes('profil') || title_lower.includes('akun') || title_lower.includes('user') || msg_lower.includes('profil') || msg_lower.includes('akun') || msg_lower.includes('user')) {
    icon_type = 'success';
    icon_char = '👤'; // Human profile icon
  } else if (title_lower.includes('sukses') || title_lower.includes('berhasil') || title_lower.includes('diperbarui') || title_lower.includes('pendaftaran') || msg_lower.includes('berhasil') || msg_lower.includes('sukses')) {
    icon_type = 'success';
    icon_char = '✨';
  } else if (title_lower.includes('gagal') || title_lower.includes('salah') || title_lower.includes('kosong') || title_lower.includes('masalah') || title_lower.includes('kunci') || title_lower.includes('belum') || title_lower.includes('terkunci') || title_lower.includes('batal') || title_lower.includes('peringatan') || msg_lower.includes('gagal') || msg_lower.includes('belum')) {
    icon_type = 'warning';
    icon_char = (title_lower.includes('kunci') || title_lower.includes('belum') || title_lower.includes('terkunci') || msg_lower.includes('belum')) ? '🔒' : '⚠️';
  }

  const overlay = document.createElement('div');
  overlay.className = 'custom-popup-overlay custom-alert-overlay';
  
  // Use subheader if custom title, otherwise default title
  const displayTitle = safeTitle && safeTitle !== 'B-Glow' ? safeTitle : 'Info';

  overlay.innerHTML = `
    <div class="custom-popup-modal ${icon_type}">
      <div class="custom-popup-icon-wrapper ${icon_type}">
        <span>${icon_char}</span>
      </div>
      <h3 class="custom-popup-title">${displayTitle}</h3>
      <div class="custom-popup-message">${safeMsg}</div>
      <div class="custom-popup-actions">
        <button class="custom-btn-ok" id="btn-alert-ok">OK</button>
      </div>
    </div>
  `;

  const closeAlert = () => {
    overlay.remove();
    if (typeof callback === 'function') callback();
  };

  overlay.querySelector('#btn-alert-ok').addEventListener('click', closeAlert);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeAlert();
  });

  document.body.appendChild(overlay);
}

// ─── Custom Confirm Modal ───
export function showCustomConfirm(message, callback, title = 'Konfirmasi') {
  const existing = document.querySelector('.custom-confirm-overlay');
  if (existing) existing.remove();

  // Handle case where title and callback might be swapped or title omitted
  let realCallback = typeof callback === 'function' ? callback : (typeof title === 'function' ? title : () => {});
  let realTitle = typeof title === 'string' ? title : (typeof callback === 'string' ? callback : 'Konfirmasi');

  const safeTitle = String(realTitle || 'Konfirmasi');
  const safeMsg = typeof message === 'string' ? message : (message ? String(message) : '');

  // Determine icon type based on title/message
  const title_lower = safeTitle.toLowerCase();
  const msg_lower = safeMsg.toLowerCase();
  
  let icon_type = 'info';
  let icon_char = '❓';
  
  if (title_lower.includes('profil') || title_lower.includes('akun') || title_lower.includes('user') || msg_lower.includes('profil') || msg_lower.includes('akun') || msg_lower.includes('user')) {
    icon_type = 'info';
    icon_char = '👤'; // Human profile icon
  } else if (title_lower.includes('hapus') || msg_lower.includes('hapus') || title_lower.includes('yakin') || msg_lower.includes('yakin')) {
    icon_type = 'warning';
    icon_char = '⚠️';
  }

  const overlay = document.createElement('div');
  overlay.className = 'custom-popup-overlay custom-confirm-overlay';
  overlay.innerHTML = `
    <div class="custom-popup-modal ${icon_type}">
      <div class="custom-popup-icon-wrapper ${icon_type}">
        <span>${icon_char}</span>
      </div>
      <h3 class="custom-popup-title">${safeTitle}</h3>
      <div class="custom-popup-message">${safeMsg}</div>
      <div class="custom-popup-actions">
        <button class="custom-btn-cancel" id="btn-confirm-cancel">Batal</button>
        <button class="custom-btn-ok" id="btn-confirm-ok">OK</button>
      </div>
    </div>
  `;

  overlay.querySelector('#btn-confirm-cancel').addEventListener('click', () => {
    overlay.remove();
  });

  overlay.querySelector('#btn-confirm-ok').addEventListener('click', () => {
    overlay.remove();
    realCallback();
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  document.body.appendChild(overlay);
}

// ─── Floating Toast Notification ───
export function showToast(message, duration = 2000) {
  const existing = document.querySelector('.custom-toast-notification');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'custom-toast-notification';
  toast.innerHTML = `<span>${message}</span>`;
  toast.style.cssText = `
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(15, 23, 42, 0.88);
    backdrop-filter: blur(8px);
    color: #ffffff;
    padding: 10px 20px;
    border-radius: 30px;
    font-size: 0.85rem;
    font-weight: 500;
    z-index: 999999;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    animation: toastFadeIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    pointer-events: none;
    text-align: center;
    white-space: nowrap;
  `;

  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      @keyframes toastFadeIn {
        from { opacity: 0; transform: translate(-50%, 15px); }
        to { opacity: 1; transform: translate(-50%, 0); }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ─── Glow Plus Paywall Page ───────────────────────────────────────────────────
/**
 * Render a full-page paywall screen for Glow Plus locked features.
 * @param {string} featureName   - Nama fitur (e.g. 'Alarm UV', 'Rutinitas', 'Jurnal Kulit')
 * @param {string} featureEmoji  - Emoji representasi fitur
 * @param {string[]} benefits    - List manfaat fitur (max 3)
 * @returns {HTMLElement}        - div.page siap di-return
 */
export function renderPaywallPage(featureName, featureEmoji, benefits = []) {
  const page = document.createElement('div');
  page.className = 'page paywall-page';

  const benefitItems = benefits.map(b => `
    <div class="pw-benefit-item">
      <span class="pw-benefit-check">✓</span>
      <span>${b}</span>
    </div>
  `).join('');

  page.innerHTML = `
    <div class="pw-container">
      <button class="pw-back-btn" id="pw-back-btn">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <div class="pw-hero">
        <div class="pw-crown-glow"></div>
        <div class="pw-feature-emoji">${featureEmoji}</div>
        <div class="pw-lock-badge">
          <svg viewBox="0 0 38 38" width="28" height="28" fill="none">
            <rect x="9" y="18" width="20" height="13" rx="4" fill="url(#pwLockBody)"/>
            <path d="M13 18v-4.5a6 6 0 0 1 12 0V18" stroke="url(#pwShackle)" stroke-width="2.5" stroke-linecap="round" fill="none"/>
            <circle cx="19" cy="24" r="2.2" fill="white" opacity="0.9"/>
            <rect x="18" y="25" width="2" height="3.5" rx="1" fill="white" opacity="0.9"/>
            <defs>
              <linearGradient id="pwLockBody" x1="9" y1="18" x2="29" y2="31" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#7c3aed"/>
                <stop offset="100%" stop-color="#4f46e5"/>
              </linearGradient>
              <linearGradient id="pwShackle" x1="13" y1="10" x2="25" y2="18" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#c4b5fd"/>
                <stop offset="100%" stop-color="#a78bfa"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      <div class="pw-content">
        <div class="pw-crown-label">
          <svg viewBox="0 0 16 16" width="13" height="13" fill="none" style="display:inline-block;vertical-align:middle;margin-right:4px;">
            <circle cx="8" cy="8" r="7.5" fill="#EDE9FE" stroke="#8B5CF6" stroke-width="0.8"/>
            <path d="M8 4 L9 6.5 L11.5 6.5 L9.5 8 L10.2 10.5 L8 9 L5.8 10.5 L6.5 8 L4.5 6.5 L7 6.5 Z" fill="#8B5CF6" stroke="#7C3AED" stroke-width="0.3" stroke-linejoin="round"/>
          </svg>
          Eksklusif Glow Plus
        </div>
        <h1 class="pw-title">${featureName}</h1>
        <p class="pw-subtitle">Fitur ini tersedia khusus untuk member Glow Plus. Upgrade sekarang untuk akses penuh!</p>
        ${benefits.length > 0 ? `<div class="pw-benefits">${benefitItems}</div>` : ''}
        <div class="pw-price-card">
          <div class="pw-price-left">
            <div class="pw-price-label">Glow Plus</div>
            <div class="pw-price-amount">Rp 30.000<span>/bulan</span></div>
          </div>
          <div class="pw-price-badge">
            <svg viewBox="0 0 14 14" width="10" height="10" fill="none" style="display:inline-block;vertical-align:middle;margin-right:3px;">
              <circle cx="7" cy="7" r="6.5" fill="#FEF3C7" stroke="#F59E0B" stroke-width="0.7"/>
              <path d="M7 2.5 Q5.5 5 4 5.8 Q5.5 5.3 7 6.2 Q8.5 5.3 10 5.8 Q8.5 5 7 2.5Z" fill="#F59E0B" stroke="#D97706" stroke-width="0.4" stroke-linejoin="round"/>
              <path d="M4.5 9.5 Q7 8 9.5 9.5" stroke="#D97706" stroke-width="0.8" stroke-linecap="round" fill="none"/>
            </svg>
            POPULER
          </div>
        </div>
        <button class="pw-cta-btn" id="pw-upgrade-btn">
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" style="display:inline-block;vertical-align:middle;margin-right:6px;">
            <circle cx="10" cy="10" r="9.5" fill="#FDE68A" stroke="#D97706" stroke-width="0.8"/>
            <path d="M4 13 L6 7 L10 11 L14 7 L16 13 Z" fill="url(#ctaCrown)" stroke="#D97706" stroke-width="0.8" stroke-linejoin="round"/>
            <rect x="4" y="13" width="12" height="2" rx="1" fill="#F59E0B"/>
            <defs>
              <linearGradient id="ctaCrown" x1="4" y1="7" x2="16" y2="15">
                <stop offset="0%" stop-color="#FDE68A"/>
                <stop offset="100%" stop-color="#F59E0B"/>
              </linearGradient>
            </defs>
          </svg>
          Upgrade ke Glow Plus
        </button>
        <button class="pw-secondary-btn" id="pw-back-btn2">Kembali</button>
      </div>
    </div>

    <style>
      .paywall-page {
        background: linear-gradient(160deg, #0f0a2e 0%, #1e1b4b 50%, #2d1b69 100%);
        min-height: 100vh; display: flex; flex-direction: column; overflow-y: auto; position: relative;
      }
      .pw-container {
        display: flex; flex-direction: column; align-items: center;
        padding: 20px 24px 40px; min-height: 100%; position: relative;
      }
      .pw-back-btn {
        align-self: flex-start; background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.15); border-radius: 50%;
        width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;
        color: white; cursor: pointer; margin-bottom: 20px; flex-shrink: 0; transition: background 0.2s;
      }
      .pw-back-btn:hover { background: rgba(255,255,255,0.2); }
      .pw-hero {
        position: relative; display: flex; align-items: center; justify-content: center;
        width: 150px; height: 150px; margin-bottom: 28px;
      }
      .pw-crown-glow {
        position: absolute; inset: -10px; border-radius: 50%;
        background: radial-gradient(circle, rgba(167,139,250,0.35) 0%, transparent 70%);
        animation: pwPulse 2.5s ease-in-out infinite;
      }
      @keyframes pwPulse {
        0%, 100% { transform: scale(1); opacity: 0.7; }
        50% { transform: scale(1.12); opacity: 1; }
      }
      .pw-feature-emoji {
        font-size: 5rem; filter: drop-shadow(0 0 20px rgba(167,139,250,0.5));
        position: relative; z-index: 1; animation: pwFloat 3s ease-in-out infinite;
      }
      @keyframes pwFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }
      .pw-lock-badge {
        position: absolute; bottom: 4px; right: 4px; width: 38px; height: 38px;
        background: linear-gradient(135deg, #312e81, #4c1d95); border-radius: 50%;
        border: 2px solid rgba(167,139,250,0.4); display: flex; align-items: center;
        justify-content: center; font-size: 1.1rem; z-index: 2;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      }
      .pw-content { width: 100%; display: flex; flex-direction: column; align-items: center; text-align: center; }
      .pw-crown-label {
        font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
        color: #a78bfa; margin-bottom: 10px;
      }
      .pw-title {
        font-size: 1.75rem; font-weight: 800; color: #ffffff;
        margin: 0 0 12px; line-height: 1.2; letter-spacing: -0.5px;
      }
      .pw-subtitle {
        font-size: 0.9rem; color: rgba(196,181,253,0.8); line-height: 1.6;
        margin: 0 0 24px; max-width: 300px;
      }
      .pw-benefits {
        width: 100%; background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1); border-radius: 14px;
        padding: 14px 16px; margin-bottom: 20px;
        display: flex; flex-direction: column; gap: 10px; text-align: left;
      }
      .pw-benefit-item { display: flex; align-items: center; gap: 10px; font-size: 0.875rem; color: rgba(255,255,255,0.85); font-weight: 500; }
      .pw-benefit-check {
        width: 20px; height: 20px; background: rgba(34,197,94,0.2); border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 11px; color: #4ade80; font-weight: 700; flex-shrink: 0;
      }
      .pw-price-card {
        width: 100%; background: rgba(255,255,255,0.07);
        border: 1px solid rgba(167,139,250,0.25); border-radius: 14px;
        padding: 14px 18px; display: flex; align-items: center;
        justify-content: space-between; margin-bottom: 20px;
      }
      .pw-price-label {
        font-size: 11px; font-weight: 600; color: rgba(196,181,253,0.7);
        text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px;
      }
      .pw-price-amount { font-size: 1.3rem; font-weight: 800; color: #fff; }
      .pw-price-amount span { font-size: 0.8rem; font-weight: 500; color: rgba(196,181,253,0.7); }
      .pw-price-badge {
        background: linear-gradient(135deg, #f59e0b, #d97706); color: white;
        font-size: 10px; font-weight: 800; padding: 5px 10px;
        border-radius: 100px; letter-spacing: 0.3px;
      }
      .pw-cta-btn {
        width: 100%; padding: 16px; border-radius: 14px;
        background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white;
        font-size: 1rem; font-weight: 800; border: none; cursor: pointer;
        letter-spacing: 0.3px; box-shadow: 0 6px 24px rgba(124,58,237,0.4);
        transition: all 0.2s ease; margin-bottom: 12px;
      }
      .pw-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(124,58,237,0.5); }
      .pw-secondary-btn {
        width: 100%; padding: 12px; border-radius: 14px; background: transparent;
        color: rgba(196,181,253,0.7); font-size: 0.875rem; font-weight: 600;
        border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: all 0.2s;
      }
      .pw-secondary-btn:hover { background: rgba(255,255,255,0.05); color: white; }

      /* Hide bottom nav while paywall is active */
      body.has-paywall .bottom-nav { display: none !important; }
    </style>
  `;

  // Apply body class immediately to hide bottom nav
  document.body.classList.add('has-paywall');

  const restoreNav = () => {
    document.body.classList.remove('has-paywall');
  };

  const goBack = () => { restoreNav(); window.history.back(); };
  page.querySelector('#pw-back-btn').addEventListener('click', goBack);
  page.querySelector('#pw-back-btn2').addEventListener('click', goBack);
  page.querySelector('#pw-upgrade-btn').addEventListener('click', () => {
    restoreNav();
    window.location.hash = '#/subscription';
  });

  return page;
}
