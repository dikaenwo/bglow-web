import { getUserId, getAuthHeaders, isPremium } from '../utils/store.js';
import { API_BASE_URL } from '../config.js';
import { renderMyPosts } from './Feed.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function esc(s) { const d = document.createElement('div'); d.textContent = s||''; return d.innerHTML; }
function initial(n) { return (n||'U').charAt(0).toUpperCase(); }

function parseImageUrls(u) {
  if (!u) return [];
  if (u.startsWith('[')) { try { return JSON.parse(u).map(x=>`${API_BASE_URL}${x}`); } catch{return[];} }
  return [`${API_BASE_URL}${u}`];
}

// ─── Skin badges ─────────────────────────────────────────────────────────────
const SKIN_ICONS = {
  Berminyak:`<svg viewBox="0 0 24 24" width="12" height="12" fill="none"><path d="M12 2C7 2 3 6 3 11c0 3.5 2 6.5 5 8.2V21h8v-1.8c3-1.7 5-4.7 5-8.2 0-5-4-9-9-9z" fill="#93C5FD" stroke="#3B82F6" stroke-width="1.5"/></svg>`,
  Normal:   `<svg viewBox="0 0 24 24" width="12" height="12" fill="none"><circle cx="12" cy="12" r="9" fill="#BBF7D0" stroke="#22C55E" stroke-width="1.5"/></svg>`,
  Kombinasi:`<svg viewBox="0 0 24 24" width="12" height="12" fill="none"><circle cx="12" cy="12" r="9" fill="#FDE68A" stroke="#F59E0B" stroke-width="1.5"/></svg>`,
  Kering:   `<svg viewBox="0 0 24 24" width="12" height="12" fill="none"><circle cx="12" cy="12" r="9" fill="#FCA5A5" stroke="#EF4444" stroke-width="1.5"/></svg>`,
};
const PROB_COLORS = {
  Jerawat:{bg:'rgba(239,68,68,0.15)',c:'#FCA5A5'},PIE:{bg:'rgba(236,72,153,0.15)',c:'#F9A8D4'},
  PIH:{bg:'rgba(168,85,247,0.15)',c:'#D8B4FE'},Kemerahan:{bg:'rgba(239,68,68,0.15)',c:'#FCA5A5'},
  Hiperpigmentasi:{bg:'rgba(249,115,22,0.15)',c:'#FDBA74'},Aging:{bg:'rgba(139,92,246,0.15)',c:'#C4B5FD'},
};

function skinBadge(type) {
  if (!type) return '';
  const icon = SKIN_ICONS[type]||'';
  return `<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;background:rgba(255,255,255,0.18);color:#fff;border:1px solid rgba(255,255,255,0.3)">${icon}${esc(type)}</span>`;
}
function probChip(label) {
  const c=PROB_COLORS[label]||{bg:'rgba(255,255,255,0.12)',c:'rgba(255,255,255,0.8)'};
  return `<span style="display:inline-flex;align-items:center;font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;background:${c.bg};color:${c.c};border:1px solid ${c.c}33">${esc(label)}</span>`;
}

// ─── Settings Drawer ──────────────────────────────────────────────────────────
function openSettingsDrawer() {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;backdrop-filter:blur(2px)';

  const drawer = document.createElement('div');
  drawer.style.cssText = `
    position:fixed;top:0;right:0;bottom:0;width:82%;max-width:320px;
    background:#0f172a;z-index:1001;
    box-shadow:-4px 0 32px rgba(0,0,0,0.4);
    display:flex;flex-direction:column;
    transform:translateX(100%);transition:transform 0.28s cubic-bezier(.4,0,.2,1);
  `;

  const isPrem = isPremium();
  const style = document.createElement('style');
  style.textContent = `
    .dr2-item{display:flex;align-items:center;gap:12px;padding:14px 16px;cursor:pointer;transition:background 0.15s;border-radius:0}
    .dr2-item:hover{background:rgba(255,255,255,0.06)}
    .dr2-item span{flex:1;font-size:14.5px;font-weight:500;color:#e2e8f0}
    .dr2-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .dr2-sec{padding:14px 16px 4px;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.8px}
  `;

  drawer.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:18px 16px 14px;border-bottom:1px solid rgba(255,255,255,0.08)">
      <span style="font-size:17px;font-weight:800;color:#f1f5f9">Menu</span>
      <button id="dr2-close" style="background:rgba(255,255,255,0.08);border:none;color:#94a3b8;width:32px;height:32px;border-radius:50%;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center">✕</button>
    </div>
    <div style="flex:1;overflow-y:auto;padding:6px 0 20px">
      <div class="dr2-sec">Akun</div>
      <div class="dr2-item" id="dr2-edit"><div class="dr2-icon" style="background:rgba(59,130,246,0.2)"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#60a5fa" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div><span>Edit Profil</span><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#475569" stroke-width="2"><polyline points="9,18 15,12 9,6"/></svg></div>
      ${!isPrem?`<div class="dr2-item" id="dr2-upgrade"><div class="dr2-icon" style="background:rgba(234,179,8,0.2)"><svg viewBox="0 0 24 24" width="17" height="17" fill="#fbbf24" stroke="#fbbf24" stroke-width="1"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.86L12 17.77l-6.18 3.23 1.18-6.86-5-4.87 6.91-1.01L12 2z"/></svg></div><span style="color:#fde68a">Upgrade ke Glow Plus</span><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#475569" stroke-width="2"><polyline points="9,18 15,12 9,6"/></svg></div>`:''}

      <div class="dr2-sec">Akses Cepat</div>
      <div class="dr2-item" id="dr2-bpom"><div class="dr2-icon" style="background:rgba(34,197,94,0.15)"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#4ade80" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div><span>Cek BPOM Produk</span><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#475569" stroke-width="2"><polyline points="9,18 15,12 9,6"/></svg></div>
      <div class="dr2-item" id="dr2-alarm"><div class="dr2-icon" style="background:rgba(251,191,36,0.15)"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#fbbf24" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg></div><span>Alarm Sunscreen</span><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#475569" stroke-width="2"><polyline points="9,18 15,12 9,6"/></svg></div>
      <div class="dr2-item" id="dr2-diary"><div class="dr2-icon" style="background:rgba(167,139,250,0.15)"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#a78bfa" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg></div><span>Diary Kulit</span><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#475569" stroke-width="2"><polyline points="9,18 15,12 9,6"/></svg></div>

      <div class="dr2-sec">Perawatan Kulit</div>
      <div class="dr2-item" id="dr2-scan"><div class="dr2-icon" style="background:rgba(59,130,246,0.15)"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#60a5fa" stroke-width="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg></div><span>Riwayat Scan</span><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#475569" stroke-width="2"><polyline points="9,18 15,12 9,6"/></svg></div>
      <div class="dr2-item" id="dr2-fav"><div class="dr2-icon" style="background:rgba(239,68,68,0.15)"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#f87171" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg></div><span>Produk Favorit</span><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#475569" stroke-width="2"><polyline points="9,18 15,12 9,6"/></svg></div>
      <div class="dr2-item" id="dr2-settings"><div class="dr2-icon" style="background:rgba(100,116,139,0.2)"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg></div><span>Pengaturan Akun</span><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#475569" stroke-width="2"><polyline points="9,18 15,12 9,6"/></svg></div>

      <div style="height:1px;background:rgba(255,255,255,0.07);margin:10px 0"></div>
      <div class="dr2-item" id="dr2-logout"><div class="dr2-icon" style="background:rgba(239,68,68,0.15)"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#f87171" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></div><span style="color:#f87171">Keluar</span><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#475569" stroke-width="2"><polyline points="9,18 15,12 9,6"/></svg></div>
      <div style="padding:20px;text-align:center;font-size:11px;color:#334155">B-Glow v2.0.0</div>
    </div>
  `;
  drawer.prepend(style);
  overlay.appendChild(drawer);
  document.body.appendChild(overlay);
  requestAnimationFrame(() => { drawer.style.transform = 'translateX(0)'; });

  const close = () => { drawer.style.transform='translateX(100%)'; setTimeout(()=>overlay.remove(), 280); };
  overlay.addEventListener('click', e => { if(e.target===overlay) close(); });
  drawer.querySelector('#dr2-close')?.addEventListener('click', close);

  const nav = h => { close(); setTimeout(() => { window.location.hash = h; }, 80); };
  drawer.querySelector('#dr2-edit')?.addEventListener('click', () => nav('#/settings'));
  drawer.querySelector('#dr2-upgrade')?.addEventListener('click', () => nav('#/subscription'));
  drawer.querySelector('#dr2-bpom')?.addEventListener('click', () => nav('#/bpom'));
  drawer.querySelector('#dr2-alarm')?.addEventListener('click', () => nav('#/alarm'));
  drawer.querySelector('#dr2-diary')?.addEventListener('click', () => nav('#/diary'));
  drawer.querySelector('#dr2-scan')?.addEventListener('click', () => nav('#/scan-history'));
  drawer.querySelector('#dr2-fav')?.addEventListener('click', () => nav('#/favorites'));
  drawer.querySelector('#dr2-settings')?.addEventListener('click', () => nav('#/settings'));
  drawer.querySelector('#dr2-logout')?.addEventListener('click', () => { close(); setTimeout(() => { localStorage.clear(); window.location.hash = '#/login'; }, 80); });
}

// ─── Main render ─────────────────────────────────────────────────────────────
export function renderProfile() {
  const page = document.createElement('div');
  page.className = 'page';
  page.style.background = '#f8fafc';

  const userId  = getUserId();
  const userStr = localStorage.getItem('bglow_user');
  let userName  = 'Pengguna B-Glow';
  let userEmail = '';
  try { const u=JSON.parse(userStr||'{}'); if(u.name) userName=u.name; if(u.email) userEmail=u.email; } catch{}

  const skinType = localStorage.getItem('bglow_skin_type_' + userId) || '';

  // Inject scoped styles
  const style = document.createElement('style');
  style.textContent = `
    .prof-banner {
      height: 130px;
      background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 40%, #7c3aed 100%);
      position: relative;
    }
    .prof-banner::after {
      content:'';
      position:absolute;inset:0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='20'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }
    .prof-topbar {
      position: absolute; top: 0; left: 0; right: 0;
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 14px 0;
      z-index: 2;
    }
    .prof-topbar-btn {
      width: 34px; height: 34px; border-radius: 50%;
      background: rgba(0,0,0,0.3); border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      backdrop-filter: blur(4px);
    }
    .prof-avatar-wrap {
      position: absolute; bottom: -38px; left: 16px; z-index: 3;
    }
    .prof-avatar-circle {
      width: 78px; height: 78px; border-radius: 50%;
      background: linear-gradient(135deg, #0ea5e9, #7c3aed);
      border: 3px solid #fff;
      box-shadow: 0 4px 16px rgba(0,0,0,0.18);
      display: flex; align-items: center; justify-content: center;
      font-size: 30px; font-weight: 800; color: #fff;
    }
    .prof-info-block {
      background: #fff;
      padding: 52px 16px 16px;
      border-bottom: 1px solid #f0f2f5;
    }
    .prof-name {
      font-size: 19px; font-weight: 800; color: #050505; line-height: 1.2;
    }
    .prof-email {
      font-size: 13px; color: #65676b; margin-top: 2px;
    }
    .prof-badges { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
    .prof-badge {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 12px; font-weight: 600; padding: 4px 11px;
      border-radius: 20px;
    }
    .prof-stats-row {
      display: flex; gap: 16px; margin-top: 12px;
    }
    .prof-stat { cursor: pointer; }
    .prof-stat strong { font-size: 14px; font-weight: 800; color: #050505; }
    .prof-stat span { font-size: 13px; color: #65676b; margin-left: 3px; }
    .prof-edit-btn {
      margin-top: 12px; width: 100%; padding: 8px;
      border: 1.5px solid #dbdbdb; border-radius: 20px;
      background: #fff; font-size: 14px; font-weight: 700;
      cursor: pointer; color: #050505;
      transition: background 0.15s;
    }
    .prof-edit-btn:hover { background: #f9fafb; }
    .prof-posts-header {
      background: #fff; padding: 14px 16px 12px;
      border-bottom: 3px solid #1877f2;
      font-size: 14px; font-weight: 700; color: #1877f2;
      margin-top: 8px;
    }
  `;
  page.appendChild(style);

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <!-- Banner -->
    <div class="prof-banner">
      <div class="prof-topbar">
        <div></div>
        <button class="prof-topbar-btn" id="prof-hamburger">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>
      <!-- Avatar overlapping banner -->
      <div class="prof-avatar-wrap">
        <div class="prof-avatar-circle" id="prof-avatar">${initial(userName)}</div>
      </div>
    </div>

    <!-- Info block -->
    <div class="prof-info-block">
      <div class="prof-name" id="prof-name">${esc(userName)}</div>
      ${userEmail ? `<div class="prof-email">${esc(userEmail)}</div>` : ''}

      <!-- Skin badges -->
      <div class="prof-badges" id="prof-badges">
        ${skinType ? `<span class="prof-badge" style="background:#EFF6FF;color:#1D4ED8">${esc(skinType)}</span>` : ''}
      </div>

      <!-- Stats row -->
      <div class="prof-stats-row">
        <div class="prof-stat" id="prof-posts-stat">
          <strong id="prof-post-count">—</strong>
          <span>Post</span>
        </div>
        <div class="prof-stat" id="prof-followers-stat">
          <strong id="prof-follower-count">—</strong>
          <span>Pengikut</span>
        </div>
        <div class="prof-stat" id="prof-following-stat">
          <strong id="prof-following-count">—</strong>
          <span>Mengikuti</span>
        </div>
      </div>

      <!-- Edit btn -->
      <button class="prof-edit-btn" id="prof-edit-btn">Edit Profil</button>
    </div>

    <!-- Posts section -->
    <div class="prof-posts-header">📋 Postingan Saya</div>
    <div id="prof-posts-container"></div>
  `;
  page.appendChild(wrapper);

  // ── Events ──
  setTimeout(() => {
    page.querySelector('#prof-hamburger')?.addEventListener('click', openSettingsDrawer);
    page.querySelector('#prof-edit-btn')?.addEventListener('click', () => { window.location.hash = '#/settings'; });

    // Load posts
    const postsEl = page.querySelector('#prof-posts-container');
    if (postsEl) renderMyPosts(postsEl);

    // Load API stats
    if (userId && userId !== 'guest') {
      (async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/users/${userId}/profile`, { headers: getAuthHeaders() });
          if (!res.ok) return;
          const data = await res.json();

          // Post count
          const pc = page.querySelector('#prof-post-count');
          if (pc) pc.textContent = data.posts?.length ?? 0;

          const fc = page.querySelector('#prof-follower-count');
          const fw = page.querySelector('#prof-following-count');
          if (fc) fc.textContent = data.follower_count ?? 0;
          if (fw) fw.textContent = data.following_count ?? 0;

          // Sync name
          const u = data.user || {};
          if (u.name) {
            page.querySelector('#prof-name')?.textContent === '' || (page.querySelector('#prof-name').textContent = u.name);
            const av = page.querySelector('#prof-avatar');
            if (av) av.textContent = initial(u.name);
          }

          // Skin badges
          const badgesEl = page.querySelector('#prof-badges');
          if (badgesEl && u) {
            const st = u.skin_type || skinType;
            const sp = (u.skin_problems||'').split(',').filter(p=>p.trim());
            const stColor = st==='Berminyak' ? {bg:'#EFF6FF',c:'#1D4ED8'}
              : st==='Normal' ? {bg:'#ECFDF5',c:'#065F46'}
              : st==='Kombinasi' ? {bg:'#FFFBEB',c:'#92400E'}
              : st==='Kering' ? {bg:'#FEF2F2',c:'#991B1B'}
              : {bg:'#F3F4F6',c:'#374151'};
            const PROB_C = {
              Jerawat:{bg:'#FEE2E2',c:'#DC2626'},PIE:{bg:'#FCE7F3',c:'#DB2777'},
              PIH:{bg:'#FDF4FF',c:'#9333EA'},Kemerahan:{bg:'#FFF0F0',c:'#EF4444'},
              Hiperpigmentasi:{bg:'#FFF7ED',c:'#EA580C'},Aging:{bg:'#F5F3FF',c:'#7C3AED'},
            };
            badgesEl.innerHTML = (st ? `<span class="prof-badge" style="background:${stColor.bg};color:${stColor.c}">${esc(st)}</span>` : '')
              + sp.map(p => { const pc2=PROB_C[p.trim()]||{bg:'#F3F4F6',c:'#374151'}; return `<span class="prof-badge" style="background:${pc2.bg};color:${pc2.c}">${esc(p.trim())}</span>`; }).join('');
          }

          // Sync localStorage
          if (u.name || u.email) {
            const cached = JSON.parse(localStorage.getItem('bglow_user')||'{}');
            localStorage.setItem('bglow_user', JSON.stringify({...cached, ...(u.name && {name:u.name}), ...(u.email && {email:u.email})}));
          }
        } catch(e) { console.error('Profile load error', e); }
      })();
    }
  }, 0);

  return page;
}
