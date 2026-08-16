import { icons } from '../components/BottomNav.js';
import { getStreak, getUserId, getAuthHeaders, isPremium } from '../utils/store.js';
import { API_BASE_URL } from '../config.js';
import { renderMyPosts } from './Feed.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

function initial(name) {
  return (name || 'U').charAt(0).toUpperCase();
}

function parseImageUrls(imageUrl) {
  if (!imageUrl) return [];
  if (imageUrl.startsWith('[')) {
    try { return JSON.parse(imageUrl).map(u => `${API_BASE_URL}${u}`); } catch { return []; }
  }
  return [`${API_BASE_URL}${imageUrl}`];
}

// ─── Skin profile icons (same as Settings.js) ────────────────────────────────

const SKIN_TYPE_ICONS = {
  Berminyak: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none"><path d="M12 2C7 2 3 6 3 11c0 3.5 2 6.5 5 8.2V21h8v-1.8c3-1.7 5-4.7 5-8.2 0-5-4-9-9-9z" fill="#3B82F6" opacity="0.3" stroke="#2563EB" stroke-width="1.5"/><path d="M8 14c1 1.5 2 2 4 2s3-.5 4-2" stroke="#2563EB" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>`,
  Normal:    `<svg viewBox="0 0 24 24" width="14" height="14" fill="none"><circle cx="12" cy="12" r="9" fill="#D1FAE5" stroke="#10B981" stroke-width="1.5"/><path d="M8 12c1 2 2.5 3 4 3s3-1 4-3" stroke="#10B981" stroke-width="1.5" fill="none" stroke-linecap="round"/><circle cx="9" cy="9.5" r="1" fill="#10B981"/><circle cx="15" cy="9.5" r="1" fill="#10B981"/></svg>`,
  Kombinasi: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none"><circle cx="12" cy="12" r="9" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1.5"/><path d="M12 3v9" stroke="#F59E0B" stroke-width="1.5"/><path d="M8 14c1 1.5 2 2 4 2s3-.5 4-2" stroke="#F59E0B" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>`,
  Kering:    `<svg viewBox="0 0 24 24" width="14" height="14" fill="none"><circle cx="12" cy="12" r="9" fill="#FEE2E2" stroke="#F87171" stroke-width="1.5"/><path d="M8 13c1-1 2-1.5 4-1.5s3 .5 4 1.5" stroke="#F87171" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M9 8l1 2M14 8l1 2" stroke="#F87171" stroke-width="1.2" stroke-linecap="round"/></svg>`,
};

const PROBLEM_COLORS = {
  Jerawat:        { bg: '#FEE2E2', color: '#DC2626' },
  PIE:            { bg: '#FCE7F3', color: '#DB2777' },
  PIH:            { bg: '#FDF4FF', color: '#9333EA' },
  Kemerahan:      { bg: '#FFF0F0', color: '#EF4444' },
  Hiperpigmentasi:{ bg: '#FFF7ED', color: '#EA580C' },
  Aging:          { bg: '#F5F3FF', color: '#7C3AED' },
};

function skinTypeBadge(type) {
  if (!type) return '';
  const icon = SKIN_TYPE_ICONS[type] || '';
  const c = type === 'Berminyak' ? { bg:'#EFF6FF', color:'#1D4ED8' }
          : type === 'Normal'    ? { bg:'#ECFDF5', color:'#065F46' }
          : type === 'Kombinasi' ? { bg:'#FFFBEB', color:'#92400E' }
          : type === 'Kering'    ? { bg:'#FEF2F2', color:'#991B1B' }
          : { bg:'#F3F4F6', color:'#374151' };
  return `<span style="display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:600;padding:4px 11px;border-radius:20px;background:${c.bg};color:${c.color}">${icon}${esc(type)}</span>`;
}

function problemChip(label) {
  const c = PROBLEM_COLORS[label] || { bg:'#F3F4F6', color:'#374151' };
  return `<span style="display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:600;padding:4px 11px;border-radius:20px;background:${c.bg};color:${c.color}">${esc(label)}</span>`;
}

// ─── Settings drawer ─────────────────────────────────────────────────────────

function openSettingsDrawer() {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.35);z-index:1000;';

  const drawer = document.createElement('div');
  drawer.style.cssText = `
    position:fixed;top:0;right:0;bottom:0;width:82%;max-width:320px;
    background:#fff;z-index:1001;
    box-shadow:-4px 0 24px rgba(0,0,0,0.15);
    display:flex;flex-direction:column;
    transform:translateX(100%);transition:transform 0.28s cubic-bezier(.4,0,.2,1);
  `;

  const isPrem = isPremium();

  drawer.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:18px 16px 12px;border-bottom:1px solid #f0f2f5">
      <span style="font-size:17px;font-weight:800;color:#050505">Pengaturan</span>
      <button id="drawer-close" style="background:none;border:none;font-size:22px;cursor:pointer;color:#65676b;width:32px;height:32px;display:flex;align-items:center;justify-content:center">✕</button>
    </div>
    <div style="flex:1;overflow-y:auto;padding:8px 0">

      <!-- Akun -->
      <div style="padding:10px 16px 4px;font-size:11px;font-weight:700;color:#65676b;text-transform:uppercase;letter-spacing:0.5px">Akun</div>
      <div class="dr-item" id="dr-edit-profil">
        <div class="dr-icon" style="background:#EFF6FF">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#2563EB" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <span>Edit Profil</span>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#c0c0c0" stroke-width="2" class="dr-chevron"><polyline points="9,18 15,12 9,6"/></svg>
      </div>
      ${!isPrem ? `
      <div class="dr-item" id="dr-upgrade">
        <div class="dr-icon" style="background:#FFF7ED">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#EA580C" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" fill="#FDBA74"/></svg>
        </div>
        <span>Upgrade ke Glow Plus</span>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#c0c0c0" stroke-width="2" class="dr-chevron"><polyline points="9,18 15,12 9,6"/></svg>
      </div>` : ''}

      <!-- Akses Cepat -->
      <div style="padding:14px 16px 4px;font-size:11px;font-weight:700;color:#65676b;text-transform:uppercase;letter-spacing:0.5px">Akses Cepat</div>
      <div class="dr-item" id="dr-bpom">
        <div class="dr-icon" style="background:#ECFDF5">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#059669" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <span>Cek BPOM Produk</span>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#c0c0c0" stroke-width="2" class="dr-chevron"><polyline points="9,18 15,12 9,6"/></svg>
      </div>
      <div class="dr-item" id="dr-alarm">
        <div class="dr-icon" style="background:#FFFBEB">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#D97706" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>
        </div>
        <span>Alarm Sunscreen</span>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#c0c0c0" stroke-width="2" class="dr-chevron"><polyline points="9,18 15,12 9,6"/></svg>
      </div>
      <div class="dr-item" id="dr-diary">
        <div class="dr-icon" style="background:#F5F3FF">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#7C3AED" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
        </div>
        <span>Diary Kulit</span>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#c0c0c0" stroke-width="2" class="dr-chevron"><polyline points="9,18 15,12 9,6"/></svg>
      </div>

      <!-- Perawatan Kulit -->
      <div style="padding:14px 16px 4px;font-size:11px;font-weight:700;color:#65676b;text-transform:uppercase;letter-spacing:0.5px">Perawatan Kulit</div>
      <div class="dr-item" id="dr-scan-history">
        <div class="dr-icon" style="background:#EFF6FF">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#2563EB" stroke-width="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
        </div>
        <span>Riwayat Scan</span>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#c0c0c0" stroke-width="2" class="dr-chevron"><polyline points="9,18 15,12 9,6"/></svg>
      </div>
      <div class="dr-item" id="dr-favorites">
        <div class="dr-icon" style="background:#FEF2F2">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#DC2626" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
        </div>
        <span>Produk Favorit</span>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#c0c0c0" stroke-width="2" class="dr-chevron"><polyline points="9,18 15,12 9,6"/></svg>
      </div>
      <div class="dr-item" id="dr-settings">
        <div class="dr-icon" style="background:#F3F4F6">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#6B7280" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
        </div>
        <span>Pengaturan Akun</span>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#c0c0c0" stroke-width="2" class="dr-chevron"><polyline points="9,18 15,12 9,6"/></svg>
      </div>

      <!-- Lainnya -->
      <div style="padding:14px 16px 4px;font-size:11px;font-weight:700;color:#65676b;text-transform:uppercase;letter-spacing:0.5px">Lainnya</div>
      <div class="dr-item" id="dr-logout" style="color:#DC2626">
        <div class="dr-icon" style="background:#FEF2F2">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#DC2626" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </div>
        <span style="color:#DC2626">Keluar</span>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#DC2626" stroke-width="2" class="dr-chevron"><polyline points="9,18 15,12 9,6"/></svg>
      </div>

      <div style="padding:20px 16px;font-size:11px;color:#bbb;text-align:center">B-Glow v2.0.0</div>
    </div>
  `;

  // Inline styles for dr-item
  const style = document.createElement('style');
  style.textContent = `
    .dr-item { display:flex;align-items:center;gap:12px;padding:13px 16px;cursor:pointer;transition:background 0.15s; }
    .dr-item:hover { background:#f9fafb; }
    .dr-item span { flex:1;font-size:14.5px;font-weight:500;color:#050505; }
    .dr-icon { width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
    .dr-chevron { flex-shrink:0; }
  `;
  drawer.prepend(style);

  overlay.appendChild(drawer);
  document.body.appendChild(overlay);

  // Animate in
  requestAnimationFrame(() => { drawer.style.transform = 'translateX(0)'; });

  const close = () => {
    drawer.style.transform = 'translateX(100%)';
    setTimeout(() => overlay.remove(), 280);
  };
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  drawer.querySelector('#drawer-close').addEventListener('click', close);

  // Navigation
  const nav = (hash) => { close(); setTimeout(() => { window.location.hash = hash; }, 80); };
  drawer.querySelector('#dr-edit-profil')?.addEventListener('click', () => nav('#/settings'));
  drawer.querySelector('#dr-upgrade')?.addEventListener('click', () => nav('#/subscription'));
  drawer.querySelector('#dr-bpom')?.addEventListener('click', () => nav('#/bpom'));
  drawer.querySelector('#dr-alarm')?.addEventListener('click', () => nav('#/alarm'));
  drawer.querySelector('#dr-diary')?.addEventListener('click', () => nav('#/diary'));
  drawer.querySelector('#dr-scan-history')?.addEventListener('click', () => nav('#/scan-history'));
  drawer.querySelector('#dr-favorites')?.addEventListener('click', () => nav('#/favorites'));
  drawer.querySelector('#dr-settings')?.addEventListener('click', () => nav('#/settings'));
  drawer.querySelector('#dr-logout')?.addEventListener('click', () => {
    close();
    setTimeout(() => {
      localStorage.clear();
      window.location.hash = '#/login';
    }, 80);
  });
}

// ─── Main render ─────────────────────────────────────────────────────────────

export function renderProfile() {
  const page = document.createElement('div');
  page.className = 'page';

  const userId  = getUserId();
  const userStr = localStorage.getItem('bglow_user');
  let userName  = 'Pengguna B-Glow';
  let userEmail = '';
  try {
    const u = JSON.parse(userStr || '{}');
    if (u.name) userName = u.name;
    if (u.email) userEmail = u.email;
  } catch {}

  const skinType     = localStorage.getItem('bglow_skin_type_' + userId) || '';
  const skinProblems = '';  // loaded async from API

  page.innerHTML = `
    <!-- Top bar -->
    <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px 10px;background:#fff;position:sticky;top:0;z-index:10;border-bottom:1px solid #f0f2f5">
      <span style="font-size:17px;font-weight:800;color:#050505" id="prof-header-name">${esc(userName)}</span>
      <button id="prof-hamburger" style="background:none;border:none;cursor:pointer;padding:4px;display:flex;align-items:center;justify-content:center">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#050505" stroke-width="2" stroke-linecap="round">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- Profile info block -->
    <div style="background:#fff;padding:20px 16px 14px">
      <div style="display:flex;align-items:center;gap:20px">
        <!-- Avatar -->
        <div id="prof-avatar" style="width:76px;height:76px;border-radius:50%;background:linear-gradient(135deg,#1877f2,#0ea5e9);display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:800;color:#fff;flex-shrink:0;box-shadow:0 4px 14px rgba(24,119,242,0.25)">
          ${initial(userName)}
        </div>
        <!-- Stats -->
        <div style="flex:1;display:flex;gap:0">
          <div style="flex:1;text-align:center">
            <div style="font-size:18px;font-weight:800;color:#050505" id="prof-post-count">—</div>
            <div style="font-size:12px;color:#65676b;font-weight:500">Post</div>
          </div>
          <div style="flex:1;text-align:center;cursor:pointer" id="prof-followers-btn">
            <div style="font-size:18px;font-weight:800;color:#050505" id="prof-follower-count">—</div>
            <div style="font-size:12px;color:#65676b;font-weight:500">Followers</div>
          </div>
          <div style="flex:1;text-align:center;cursor:pointer" id="prof-following-btn">
            <div style="font-size:18px;font-weight:800;color:#050505" id="prof-following-count">—</div>
            <div style="font-size:12px;color:#65676b;font-weight:500">Following</div>
          </div>
        </div>
      </div>

      <!-- Name + bio -->
      <div style="margin-top:12px">
        <div style="font-size:15px;font-weight:700;color:#050505" id="prof-name">${esc(userName)}</div>
        ${userEmail ? `<div style="font-size:12px;color:#65676b;margin-top:2px">${esc(userEmail)}</div>` : ''}
      </div>

      <!-- Skin badges -->
      <div id="prof-skin-badges" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">
        ${skinType ? skinTypeBadge(skinType) : ''}
      </div>

      <!-- Edit profile button -->
      <div style="margin-top:12px">
        <button id="prof-edit-btn" style="width:100%;padding:7px;border:1.5px solid #dbdbdb;border-radius:8px;background:#fff;font-size:13.5px;font-weight:600;cursor:pointer;color:#050505;transition:background 0.15s">
          Edit Profil
        </button>
      </div>
    </div>

    <!-- Posts grid -->
    <div id="prof-posts-grid" style="background:#fff;margin-top:3px"></div>
  `;

  // ── Event wiring ──
  setTimeout(() => {
    page.querySelector('#prof-hamburger')?.addEventListener('click', openSettingsDrawer);
    page.querySelector('#prof-edit-btn')?.addEventListener('click', () => { window.location.hash = '#/settings'; });

    // Load posts
    const gridEl = page.querySelector('#prof-posts-grid');
    if (gridEl) renderMyPosts(gridEl);

    // Load profile stats from API
    if (userId && userId !== 'guest') {
      (async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/users/${userId}/profile`, { headers: getAuthHeaders() });
          if (!res.ok) return;
          const data = await res.json();

          // Post count
          const postCountEl = page.querySelector('#prof-post-count');
          if (postCountEl) postCountEl.textContent = data.posts?.length ?? 0;

          // Follower/following
          const follEl = page.querySelector('#prof-follower-count');
          const folwEl = page.querySelector('#prof-following-count');
          if (follEl) follEl.textContent = data.follower_count ?? 0;
          if (folwEl) folwEl.textContent = data.following_count ?? 0;

          // Name sync
          if (data.user?.name) {
            page.querySelector('#prof-header-name')?.setAttribute('textContent', data.user.name);
            page.querySelector('#prof-name')?.textContent && (page.querySelector('#prof-name').textContent = data.user.name);
            page.querySelector('#prof-avatar')?.textContent && (page.querySelector('#prof-avatar').textContent = initial(data.user.name));
          }

          // Skin badges
          const badgesEl = page.querySelector('#prof-skin-badges');
          if (badgesEl && data.user) {
            const st = data.user.skin_type || skinType;
            const sp = (data.user.skin_problems || '').split(',').filter(p => p.trim());
            badgesEl.innerHTML = (st ? skinTypeBadge(st) : '') + sp.map(p => problemChip(p.trim())).join('');
          }
        } catch (err) {
          console.error('Profile stats load error', err);
        }
      })();
    }
  }, 0);

  return page;
}
