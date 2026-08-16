import { API_BASE_URL } from '../config.js';

function getAuthToken() {
  try { return JSON.parse(localStorage.getItem('bglow_user') || '{}').token || localStorage.getItem('bglow_token') || null; }
  catch { return localStorage.getItem('bglow_token') || null; }
}
function getCurrentUserId() {
  try { return JSON.parse(localStorage.getItem('bglow_user') || '{}').id || null; } catch { return null; }
}
const authH = () => ({ Authorization: `Bearer ${getAuthToken()}` });

function timeAgo(iso) {
  if (!iso) return '';
  const d = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (d < 60) return 'Baru saja';
  if (d < 3600) return `${Math.floor(d / 60)} menit lalu`;
  if (d < 86400) return `${Math.floor(d / 3600)} jam lalu`;
  if (d < 604800) return `${Math.floor(d / 86400)} hari lalu`;
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}
function initial(n) { return (n || '?').trim().charAt(0).toUpperCase(); }
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

const BACK = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;

// ── Skin type icons (same as Settings.js) ──────────────────────────────────
const SKIN_TYPE_ICONS = {
  Normal: `<svg viewBox="0 0 32 32" width="18" height="18" fill="none"><circle cx="16" cy="16" r="13" fill="#D1FAE5" stroke="#10B981" stroke-width="1.5"/><circle cx="16" cy="16" r="8" fill="#6EE7B7" opacity="0.5"/><path d="M11 20c1.5 2 3.5 3 5 3s3.5-1 5-3" stroke="#059669" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="14" r="1.5" fill="#059669"/><circle cx="20" cy="14" r="1.5" fill="#059669"/></svg>`,
  Berminyak: `<svg viewBox="0 0 32 32" width="18" height="18" fill="none"><circle cx="16" cy="16" r="13" fill="#DBEAFE" stroke="#3B82F6" stroke-width="1.5"/><circle cx="16" cy="16" r="8" fill="#93C5FD" opacity="0.4"/><path d="M11 20c1.5 1.5 3.5 2 5 2s3.5-.5 5-2" stroke="#2563EB" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="14" r="1.5" fill="#2563EB"/><circle cx="20" cy="14" r="1.5" fill="#2563EB"/><circle cx="8" cy="18" r="2" fill="#93C5FD" opacity="0.6"/><circle cx="24" cy="18" r="2" fill="#93C5FD" opacity="0.6"/><circle cx="16" cy="10" r="1.5" fill="#93C5FD" opacity="0.7"/></svg>`,
  Kombinasi: `<svg viewBox="0 0 32 32" width="18" height="18" fill="none"><circle cx="16" cy="16" r="13" fill="#EDE9FE" stroke="#8B5CF6" stroke-width="1.5"/><path d="M16 3a13 13 0 010 26" fill="#C4B5FD" opacity="0.5"/><path d="M16 3a13 13 0 000 26" fill="#DDD6FE" opacity="0.3"/><path d="M11 20c1.5 1.5 3.5 2 5 2s3.5-.5 5-2" stroke="#7C3AED" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="14" r="1.5" fill="#7C3AED"/><circle cx="20" cy="14" r="1.5" fill="#7C3AED"/></svg>`,
  Kering: `<svg viewBox="0 0 32 32" width="18" height="18" fill="none"><circle cx="16" cy="16" r="13" fill="#FEF3C7" stroke="#D97706" stroke-width="1.5"/><circle cx="16" cy="16" r="8" fill="#FDE68A" opacity="0.4"/><path d="M12 19c1 1 2.5 1.5 4 1.5s3-.5 4-1.5" stroke="#B45309" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="14" r="1.5" fill="#B45309"/><circle cx="20" cy="14" r="1.5" fill="#B45309"/></svg>`,
};

const SKIN_TYPE_STYLE = {
  Normal:    { bg: '#D1FAE5', color: '#059669' },
  Berminyak: { bg: '#DBEAFE', color: '#2563EB' },
  Kombinasi: { bg: '#EDE9FE', color: '#7C3AED' },
  Kering:    { bg: '#FEF3C7', color: '#B45309' },
};

// ── Skin problem icons (same as Settings.js) ──────────────────────────────
const PROBLEM_ICONS = {
  Jerawat: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none"><circle cx="12" cy="12" r="10" fill="#FEE2E2" stroke="#EF4444" stroke-width="1.5"/><circle cx="9" cy="10" r="2" fill="#FCA5A5" stroke="#EF4444" stroke-width="1"/><circle cx="15" cy="9" r="1.5" fill="#FCA5A5" stroke="#EF4444" stroke-width="1"/><circle cx="13" cy="15" r="2.5" fill="#FCA5A5" stroke="#EF4444" stroke-width="1"/></svg>`,
  PIE: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none"><circle cx="12" cy="12" r="10" fill="#FCE7F3" stroke="#EC4899" stroke-width="1.5"/><circle cx="9" cy="10" r="2.5" fill="none" stroke="#EC4899" stroke-width="1.2" stroke-dasharray="1.5 1.5"/><circle cx="15" cy="14" r="2" fill="none" stroke="#EC4899" stroke-width="1.2" stroke-dasharray="1.5 1.5"/><circle cx="12" cy="8" r="1.5" fill="#F9A8D4" opacity="0.6"/></svg>`,
  PIH: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none"><circle cx="12" cy="12" r="10" fill="#FFF7ED" stroke="#F97316" stroke-width="1.5"/><ellipse cx="9" cy="10" rx="2.5" ry="2" fill="#FDBA74" stroke="#F97316" stroke-width="1"/><ellipse cx="15" cy="14" rx="2" ry="1.5" fill="#FDBA74" stroke="#F97316" stroke-width="1"/></svg>`,
  Kemerahan: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none"><circle cx="12" cy="12" r="10" fill="#DCFCE7" stroke="#22C55E" stroke-width="1.5"/><circle cx="8" cy="13" r="2.5" fill="#FCA5A5" opacity="0.5"/><circle cx="16" cy="13" r="2.5" fill="#FCA5A5" opacity="0.5"/></svg>`,
  Hiperpigmentasi: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none"><circle cx="12" cy="12" r="10" fill="#FEF9C3" stroke="#EAB308" stroke-width="1.5"/><rect x="7" y="13" width="4" height="3" rx="1" fill="#CA8A04" opacity="0.3"/><rect x="13" y="11" width="3" height="4" rx="1" fill="#CA8A04" opacity="0.25"/></svg>`,
  Aging: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none"><circle cx="12" cy="12" r="10" fill="#F3E8FF" stroke="#8B5CF6" stroke-width="1.5"/><path d="M8 9c0-1 1-2 2-2M14 9c0-1 1-2 2-2" stroke="#8B5CF6" stroke-width="1" stroke-linecap="round"/><path d="M9 14c.8 1.2 1.8 1.8 3 1.8s2.2-.6 3-1.8" stroke="#8B5CF6" stroke-width="1" stroke-linecap="round"/></svg>`,
};

const PROBLEM_STYLE = {
  Jerawat:         { bg: '#FEE2E2', color: '#DC2626' },
  PIE:             { bg: '#FCE7F3', color: '#DB2777' },
  PIH:             { bg: '#FFF7ED', color: '#EA580C' },
  Kemerahan:       { bg: '#DCFCE7', color: '#16A34A' },
  Hiperpigmentasi: { bg: '#FEF9C3', color: '#CA8A04' },
  Aging:           { bg: '#F3E8FF', color: '#7C3AED' },
};

function skinTypeBadge(type) {
  const st = SKIN_TYPE_STYLE[type] || { bg: '#f0f2f5', color: '#374151' };
  const icon = SKIN_TYPE_ICONS[type] || '';
  return `<span style="display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;padding:4px 10px;border-radius:20px;background:${st.bg};color:${st.color}">${icon}${esc(type)}</span>`;
}

function problemChip(label) {
  const ps = PROBLEM_STYLE[label] || { bg: '#f0f2f5', color: '#374151' };
  const icon = PROBLEM_ICONS[label] || '';
  return `<span style="display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;padding:4px 11px;border-radius:20px;background:${ps.bg};color:${ps.color}">${icon}${esc(label)}</span>`;
}

export function renderUserProfile(userId) {
  const myId = getCurrentUserId();
  const isOwnProfile = String(myId) === String(userId);

  const page = document.createElement('div');
  page.style.cssText = 'min-height:100vh;background:#f0f2f5;display:flex;flex-direction:column';

  // ── Sticky header ──
  const header = document.createElement('div');
  header.style.cssText = 'position:sticky;top:0;z-index:50;background:rgba(255,255,255,0.95);backdrop-filter:blur(16px);border-bottom:1px solid #e4e6ea;display:flex;align-items:center;gap:12px;padding:12px 16px';
  header.innerHTML = `
    <button id="up-back" style="background:#f2f2f2;border:none;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#050505;flex-shrink:0">${BACK}</button>
    <span id="up-header-name" style="font-size:17px;font-weight:800;color:#050505">Profil</span>
  `;
  header.querySelector('#up-back').addEventListener('click', () => history.back());
  page.appendChild(header);

  const body = document.createElement('div');
  body.style.cssText = 'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch';
  body.innerHTML = `
    <div style="background:#fff;padding:24px 16px;margin-bottom:8px;display:flex;flex-direction:column;align-items:center;gap:12px">
      <div style="width:80px;height:80px;border-radius:50%;background:#e4e6ea;animation:shimmer 1.5s infinite"></div>
      <div style="height:16px;width:40%;background:#e4e6ea;border-radius:8px;animation:shimmer 1.5s infinite"></div>
    </div>
  `;
  page.appendChild(body);

  (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${userId}/profile`, { headers: authH() });
      if (!res.ok) { body.innerHTML = '<div style="text-align:center;padding:48px;color:#65676b">Pengguna tidak ditemukan</div>'; return; }
      const data = await res.json();
      const user = data.user;

      header.querySelector('#up-header-name').textContent = user.name || 'Profil';

      let isFollowing = data.is_following || false;
      let followerCount = data.follower_count || 0;

      // Parse skin problems from user data (not in API currently, will show what's available)
      const skinProblems = [];
      if (user.acne_level && user.acne_level !== 'Bersih') skinProblems.push('Jerawat');

      body.innerHTML = `
        <div style="background:#fff;margin-bottom:8px">
          <!-- Avatar + name -->
          <div style="padding:28px 16px 20px;display:flex;flex-direction:column;align-items:center;gap:10px;border-bottom:1px solid #f0f2f5">
            <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#1877f2,#0ea5e9);display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:800;color:#fff;box-shadow:0 4px 16px rgba(24,119,242,0.25)">
              ${initial(user.name)}
            </div>
            <div style="text-align:center">
              <div style="font-size:20px;font-weight:800;color:#050505;margin-bottom:6px">${esc(user.name || 'Pengguna')}</div>
              <!-- Skin badge (own profile) OR Follow button (others) -->
              ${isOwnProfile && user.skin_type
                ? skinTypeBadge(user.skin_type)
                : !isOwnProfile
                  ? `<button id="up-follow-btn" style="
                      padding:7px 22px;border-radius:20px;font-size:13px;font-weight:700;
                      cursor:pointer;border:${isFollowing ? '1.5px solid #ccc' : 'none'};
                      background:${isFollowing ? '#fff' : '#1877f2'};
                      color:${isFollowing ? '#050505' : '#fff'};
                      transition:all 0.2s;min-width:100px"
                    >${isFollowing ? 'Following' : '+ Follow'}</button>`
                  : ''}
            </div>
            <!-- Stats -->
            <div style="display:flex;gap:32px;margin-top:4px">
              <div style="text-align:center">
                <div style="font-size:20px;font-weight:800;color:#050505">${data.post_count || 0}</div>
                <div style="font-size:12px;color:#65676b;font-weight:500">Post</div>
              </div>
              <div style="text-align:center">
                <div id="up-follower-count" style="font-size:20px;font-weight:800;color:#050505">${followerCount}</div>
                <div style="font-size:12px;color:#65676b;font-weight:500">Followers</div>
              </div>
              <div style="text-align:center">
                <div style="font-size:20px;font-weight:800;color:#050505">${data.following_count || 0}</div>
                <div style="font-size:12px;color:#65676b;font-weight:500">Following</div>
              </div>
            </div>
          </div>

          <!-- Skin Profile section -->
          ${user.skin_type ? `
          <div style="padding:14px 16px">
            <div style="font-size:13px;font-weight:700;color:#65676b;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.3px">Skin Profile</div>
            <div style="display:flex;flex-wrap:wrap;gap:8px">
              ${user.skin_type ? skinTypeBadge(user.skin_type) : ''}
              ${user.acne_level ? problemChip(`Jerawat: ${esc(user.acne_level)}`) : ''}
              ${user.oil_level  ? `<span style="display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;padding:4px 11px;border-radius:20px;background:#DBEAFE;color:#2563EB">${SKIN_TYPE_ICONS.Berminyak}Minyak: ${esc(user.oil_level)}</span>` : ''}
              ${user.pore_condition ? `<span style="display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;padding:4px 11px;border-radius:20px;background:#F3E8FF;color:#7C3AED"><svg viewBox="0 0 24 24" width="16" height="16" fill="none"><circle cx="12" cy="12" r="10" fill="#F3E8FF" stroke="#8B5CF6" stroke-width="1.5"/><circle cx="9" cy="9" r="2" fill="none" stroke="#8B5CF6" stroke-width="1"/><circle cx="15" cy="9" r="1.5" fill="none" stroke="#8B5CF6" stroke-width="1"/><circle cx="12" cy="15" r="2.5" fill="none" stroke="#8B5CF6" stroke-width="1"/></svg>Pori: ${esc(user.pore_condition)}</span>` : ''}
            </div>
          </div>` : ''}
        </div>

        <!-- Posts section -->
        <div style="background:#fff;padding:14px 0">
          <div style="font-size:15px;font-weight:800;color:#050505;padding:0 16px 12px;border-bottom:1px solid #e4e6ea">
            Post dari ${esc(user.name || 'Pengguna')}
          </div>
          <div id="up-posts-list">
            ${data.posts.length === 0 ? '<div style="text-align:center;padding:32px;color:#65676b;font-size:13.5px">Belum ada post</div>' : ''}
          </div>
        </div>
      `;

      // ── Follow button handler ──
      if (!isOwnProfile) {
        const followBtn = body.querySelector('#up-follow-btn');
        const followerEl = body.querySelector('#up-follower-count');
        followBtn?.addEventListener('click', async () => {
          const prev = isFollowing;
          isFollowing = !isFollowing;
          followerCount += isFollowing ? 1 : -1;
          followBtn.textContent = isFollowing ? 'Following' : '+ Follow';
          followBtn.style.background = isFollowing ? '#fff' : '#1877f2';
          followBtn.style.color = isFollowing ? '#050505' : '#fff';
          followBtn.style.border = isFollowing ? '1.5px solid #ccc' : 'none';
          if (followerEl) followerEl.textContent = followerCount;
          try {
            const r = await fetch(`${API_BASE_URL}/api/users/${userId}/follow`, { method: 'POST', headers: authH() });
            const d = await r.json();
            followerCount = d.follower_count;
            isFollowing = d.following;
            if (followerEl) followerEl.textContent = followerCount;
            followBtn.textContent = isFollowing ? 'Following' : '+ Follow';
          } catch {
            isFollowing = prev;
            followerCount += isFollowing ? 1 : -1;
            followBtn.textContent = isFollowing ? 'Following' : '+ Follow';
          }
        });
      }

      // ── Render posts ──
      const postsList = body.querySelector('#up-posts-list');
      data.posts.forEach(p => {
        const item = document.createElement('div');
        item.style.cssText = 'border-bottom:1px solid #f0f2f5;padding:14px 16px;cursor:pointer;transition:background 0.15s';
        item.addEventListener('mouseover', () => item.style.background = '#f9f9f9');
        item.addEventListener('mouseout',  () => item.style.background = '');
        item.addEventListener('click', () => { window.location.hash = `#/post/${p.id}`; });

        const imageHtml = p.image_url ? `
          <div style="margin:8px 0;border-radius:12px;overflow:hidden;max-height:200px">
            <img src="${API_BASE_URL}${p.image_url}" style="width:100%;object-fit:cover;display:block;max-height:200px" loading="lazy" />
          </div>` : '';

        item.innerHTML = `
          ${p.content ? `<div style="font-size:14px;color:#050505;line-height:1.55;word-break:break-word;white-space:pre-wrap;margin-bottom:6px">${esc(p.content)}</div>` : ''}
          ${imageHtml}
          <div style="display:flex;gap:12px;font-size:12px;color:#65676b;margin-top:6px;align-items:center">
            <span style="display:flex;align-items:center;gap:3px">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="#e41e3f"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              ${p.like_count || 0}
            </span>
            <span style="display:flex;align-items:center;gap:3px">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#65676b" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              ${p.comment_count || 0}
            </span>
            <span style="margin-left:auto;font-size:11px" data-created-at="${p.created_at}">${timeAgo(p.created_at)}</span>
          </div>
        `;
        postsList.appendChild(item);
      });

    } catch (err) {
      body.innerHTML = `<div style="text-align:center;padding:48px;color:#65676b">Gagal memuat profil<br><small>${err.message}</small></div>`;
    }
  })();

  return page;
}
