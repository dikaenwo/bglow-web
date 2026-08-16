import { icons } from '../components/BottomNav.js';
import { getStreak, getUserId, getAuthHeaders, isPremium, getSubscriptionPlan } from '../utils/store.js';
import { showCustomAlert } from '../utils/helpers.js';
import { API_BASE_URL } from '../config.js';

function getScanCount() {
  const val = localStorage.getItem('bglow_scan_count_' + getUserId());
  return val ? parseInt(val) : 0;
}

function getSkinScore() {
  const key = 'bglow_diary_entries_' + getUserId();
  const data = localStorage.getItem(key);
  if (!data) return 0;
  try {
    const entries = JSON.parse(data);
    if (!entries || entries.length === 0) return 0;

    // Calculate score based on diary condition entries
    let totalScore = 0;
    const recentEntries = entries.slice(0, 10); // last 10 entries
    recentEntries.forEach(entry => {
      if (!entry.conditions || entry.conditions.length === 0) {
        totalScore += 50; // neutral
        return;
      }
      let entryScore = 50;
      entry.conditions.forEach(c => {
        if (c.type === 'good') entryScore += 15;
        else if (c.type === 'warn') entryScore -= 5;
        else if (c.type === 'bad') entryScore -= 15;
      });
      totalScore += Math.max(0, Math.min(100, entryScore));
    });
    return Math.round(totalScore / recentEntries.length);
  } catch (e) {
    return 0;
  }
}

export function renderProfile() {
  const page = document.createElement('div');
  page.className = 'page';

  let userName = 'Pengguna B-Glow';
  let userEmail = 'user@bglow.app';
  let userInitial = 'B';

  const userStr = localStorage.getItem('bglow_user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user && user.name) {
        userName = user.name;
        userInitial = user.name.charAt(0).toUpperCase();
      }
      if (user && user.email) {
        userEmail = user.email;
      }
    } catch (e) {}
  }

  // Dynamic stats from real data
  const streakData = getStreak();
  const skinScore = getSkinScore();
  const scanCount = getScanCount();
  const streakCount = streakData.current;

  // Profile avatar (inisial saja, tanpa upload foto)
  const avatarContent = `<span class="profile-avatar-initial">${userInitial}</span>`;

  page.innerHTML = `
    <!-- Profile Header -->
    <div class="profile-header-card anim-fade-in">
      <div class="profile-avatar-wrapper" id="avatar-wrapper">
        <div class="profile-avatar">
          ${avatarContent}
        </div>
      </div>
      <div class="profile-name">${userName}</div>
      <div class="profile-email">${userEmail}</div>
      <!-- Subscription Badge -->
      <div class="profile-sub-badge anim-fade-in-up anim-delay-1" id="sub-badge">
        ${isPremium()
          ? `<div style="display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,#312e81,#4f46e5);border-radius:20px;padding:10px 20px;">
              <svg viewBox="0 0 28 28" width="26" height="26" fill="none">
                <circle cx="14" cy="14" r="13" fill="url(#crownPBg)" opacity="0.2"/>
                <path d="M5 19 L7.5 11 L11 16 L14 8 L17 16 L20.5 11 L23 19 Z" fill="url(#crownPFill)" stroke="#FCD34D" stroke-width="0.8" stroke-linejoin="round"/>
                <rect x="5" y="19" width="18" height="2.5" rx="1.2" fill="url(#crownPBand)"/>
                <circle cx="14" cy="10" r="1.5" fill="#FCD34D"/>
                <defs>
                  <linearGradient id="crownPBg" x1="0" y1="0" x2="28" y2="28"><stop offset="0%" stop-color="#FDE68A"/><stop offset="100%" stop-color="#F59E0B"/></linearGradient>
                  <linearGradient id="crownPFill" x1="5" y1="8" x2="23" y2="22" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#FDE68A"/><stop offset="100%" stop-color="#D97706"/></linearGradient>
                  <linearGradient id="crownPBand" x1="5" y1="19" x2="23" y2="22" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#FCD34D"/><stop offset="100%" stop-color="#B45309"/></linearGradient>
                </defs>
              </svg>
              <div>
                <div style="font-size:13px;font-weight:800;color:#FDE68A;letter-spacing:0.2px;">Glow Plus</div>
                <div style="font-size:10px;color:rgba(255,255,255,0.7);font-weight:500;">Akses penuh ke semua fitur</div>
              </div>
            </div>`
          : `<div style="display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.12);border-radius:20px;padding:10px 16px;border:1px solid rgba(255,255,255,0.2);">
              <div style="display:flex;align-items:center;gap:10px;">
                <svg viewBox="0 0 28 28" width="24" height="24" fill="none">
                  <circle cx="14" cy="14" r="13" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
                  <path d="M14 9v7l-3 4h6l-3-4V9" stroke="rgba(255,255,255,0.7)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                  <path d="M11 9h6" stroke="rgba(255,255,255,0.7)" stroke-width="1.3" stroke-linecap="round"/>
                </svg>
                <div>
                  <div style="font-size:12px;font-weight:700;color:white;">Pengguna Basic</div>
                  <div style="font-size:10px;color:rgba(255,255,255,0.6);">Upgrade untuk akses penuh</div>
                </div>
              </div>
              <button id="profile-upgrade-btn" style="background:linear-gradient(135deg,#FDE68A,#F59E0B);color:#1e1b4b;font-size:10px;font-weight:800;border:none;border-radius:12px;padding:6px 12px;cursor:pointer;white-space:nowrap;">Upgrade</button>
            </div>`
        }
      </div>
    </div>

    <!-- Menu -->
    <div class="profile-menu">
      <div class="menu-section">
        <div class="menu-section-title">Akses Cepat</div>
        <div class="menu-item anim-fade-in-up anim-delay-2" id="menu-bpom">
          <div class="mi-icon green">${icons.shield || '🛡️'}</div>
          <span class="mi-text">Cek BPOM Produk</span>
          <span class="mi-arrow">${icons.chevronRight || '>'}</span>
        </div>
        <div class="menu-item anim-fade-in-up anim-delay-3" id="menu-alarm">
          <div class="mi-icon amber">${icons.sun || '☀️'}</div>
          <span class="mi-text">Alarm Sunscreen</span>
          <span class="mi-arrow">${icons.chevronRight || '>'}</span>
        </div>
        <div class="menu-item anim-fade-in-up anim-delay-4" id="menu-diary">
          <div class="mi-icon purple">${icons.book || '📔'}</div>
          <span class="mi-text">Diary Kulit</span>
          <span class="mi-arrow">${icons.chevronRight || '>'}</span>
        </div>
      </div>

      <div class="menu-section">
        <div class="menu-section-title">Perawatan Kulit</div>
        <div class="menu-item anim-fade-in-up anim-delay-4" id="menu-history">
          <div class="mi-icon blue">${icons.camera || '📷'}</div>
          <span class="mi-text">Riwayat Scan</span>
          <span class="mi-arrow">${icons.chevronRight || '>'}</span>
        </div>
        <div class="menu-item anim-fade-in-up anim-delay-5" id="menu-favorites">
          <div class="mi-icon red">${icons.heart || '❤️'}</div>
          <span class="mi-text">Produk Favorit</span>
          <span class="mi-arrow">${icons.chevronRight || '>'}</span>
        </div>
        <div class="menu-item anim-fade-in-up anim-delay-6" id="menu-settings">
          <div class="mi-icon gray">${icons.settings || '⚙️'}</div>
          <span class="mi-text">Pengaturan Akun</span>
          <span class="mi-arrow">${icons.chevronRight || '>'}</span>
        </div>
      </div>
    </div>

    <div class="profile-version">B-Glow v1.0.0</div>
  `;

  setTimeout(() => {
    const bpom = page.querySelector('#menu-bpom');
    const alarm = page.querySelector('#menu-alarm');
    const diary = page.querySelector('#menu-diary');
    const settings = page.querySelector('#menu-settings');
    const favorites = page.querySelector('#menu-favorites');
    const history = page.querySelector('#menu-history');

    if (bpom) bpom.addEventListener('click', () => window.location.hash = '#/bpom');
    if (alarm) alarm.addEventListener('click', () => window.location.hash = '#/alarm');
    if (diary) diary.addEventListener('click', () => window.location.hash = '#/diary');
    if (settings) settings.addEventListener('click', () => window.location.hash = '#/settings');
    if (favorites) favorites.addEventListener('click', () => window.location.hash = '#/favorites');
    if (history) history.addEventListener('click', () => window.location.hash = '#/scan-history');

    // Upgrade button (only shown for basic users)
    const upgradeBtn = page.querySelector('#profile-upgrade-btn');
    if (upgradeBtn) upgradeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.location.hash = '#/subscription';
    });

    (async () => {
      const userId = getUserId();
      if (userId && userId !== 'guest') {
        try {
          const res = await fetch(`${API_BASE_URL}/api/user/${userId}`, {
            headers: getAuthHeaders()
          });
          if (res.ok) {
            const user = await res.json();
            
            // Sync with local cache
            localStorage.setItem('bglow_user', JSON.stringify({
              id: user.id,
              name: user.name,
              email: user.email
            }));
            
            if (user.profile_photo) {
              localStorage.setItem('bglow_profile_photo_' + userId, user.profile_photo);
            }
            if (user.skin_type) {
              localStorage.setItem('bglow_has_scanned_' + userId, '1');
              localStorage.setItem('bglow_skin_type_' + userId, user.skin_type);
              localStorage.setItem('bglow_acne_level_' + userId, user.acne_level);
              localStorage.setItem('bglow_oil_level_' + userId, user.oil_level);
              localStorage.setItem('bglow_pore_condition_' + userId, user.pore_condition);
              localStorage.setItem('bglow_skin_score_' + userId, user.skin_score);
            }
            if (user.sunscreen_interval) {
              localStorage.setItem('bglow_sunscreen_interval_' + userId, user.sunscreen_interval);
            }
            if (user.favorites) {
              localStorage.setItem('bglow_favorites_' + userId, user.favorites);
            }
            if (user.diary_entries) {
              localStorage.setItem('bglow_diary_entries_' + userId, user.diary_entries);
            }
            if (user.routine) {
              localStorage.setItem('bglow_routine_' + userId, user.routine);
            }
            if (user.special_schedule) {
              localStorage.setItem('bglow_special_schedule_' + userId, user.special_schedule);
            }
            if (user.streak) {
              localStorage.setItem('bglow_streak_' + userId, user.streak);
            }
            if (user.routine_progress) {
              localStorage.setItem('bglow_routine_progress_' + userId, user.routine_progress);
            }

            // Update DOM dynamically
            const nameEl = page.querySelector('.profile-name');
            const emailEl = page.querySelector('.profile-email');
            const avatarEl = page.querySelector('.profile-avatar');
            
            if (nameEl && user.name) nameEl.textContent = user.name;
            if (emailEl && user.email) emailEl.textContent = user.email;
            
            if (avatarEl) {
              const initial = user.name ? user.name.charAt(0).toUpperCase() : 'B';
              avatarEl.innerHTML = `<span class="profile-avatar-initial">${initial}</span>`;
            }

            if (user.skin_score) {
              const scoreEl = page.querySelector('.profile-stat:nth-child(1) .ps-value');
              if (scoreEl) scoreEl.textContent = user.skin_score;
            }
          }
        } catch (err) {
          console.error("Gagal sinkronisasi profil dari server:", err);
        }
      }
    })();
  }, 0);

  return page;
}
