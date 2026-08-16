import { API_BASE_URL } from '../config.js';

function getAuthToken() {
  try { return JSON.parse(localStorage.getItem('bglow_user') || '{}').token || localStorage.getItem('bglow_token') || null; }
  catch { return localStorage.getItem('bglow_token') || null; }
}
function getCurrentUserId() {
  try { return JSON.parse(localStorage.getItem('bglow_user') || '{}').id || null; } catch { return null; }
}
const authH = () => {
  const t = getAuthToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

function parseImageUrls(u) {
  if (!u) return [];
  if (u.startsWith('[')) { try { return JSON.parse(u).map(x => `${API_BASE_URL}${x}`); } catch { return []; } }
  return [`${API_BASE_URL}${u}`];
}
function timeAgo(iso) {
  if (!iso) return '';
  const d = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (d < 60) return 'Baru saja';
  if (d < 3600) return `${Math.floor(d / 60)} mnt lalu`;
  if (d < 86400) return `${Math.floor(d / 3600)} jam lalu`;
  return `${Math.floor(d / 86400)} hari lalu`;
}
function initial(n) { return (n || '?').trim().charAt(0).toUpperCase(); }
function esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

const SKIN_TYPE_STYLE = {
  Normal:    { bg: '#D1FAE5', color: '#059669' },
  Berminyak: { bg: '#DBEAFE', color: '#2563EB' },
  Kombinasi: { bg: '#EDE9FE', color: '#7C3AED' },
  Kering:    { bg: '#FEF3C7', color: '#B45309' },
};
const PROBLEM_STYLE = {
  Jerawat:         { bg: '#FEE2E2', color: '#DC2626' },
  PIE:             { bg: '#FCE7F3', color: '#DB2777' },
  PIH:             { bg: '#FFF7ED', color: '#EA580C' },
  Kemerahan:       { bg: '#DCFCE7', color: '#16A34A' },
  Hiperpigmentasi: { bg: '#FEF9C3', color: '#CA8A04' },
  Aging:           { bg: '#F3E8FF', color: '#7C3AED' },
};

export function renderUserProfile(userId) {
  const myId = getCurrentUserId();
  const isOwnProfile = String(myId) === String(userId);

  const page = document.createElement('div');
  page.className = 'page';
  page.style.background = '#f8fafc';

  // ── Scoped CSS ──
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .up-banner { height:130px; background:linear-gradient(135deg,#0ea5e9 0%,#2563eb 45%,#7c3aed 100%); position:relative; background-size:cover; background-position:center; }
    .up-topbar { position:absolute;top:0;left:0;right:0;display:flex;align-items:center;padding:12px 14px;z-index:2; }
    .up-back-btn { width:34px;height:34px;border-radius:50%;background:rgba(0,0,0,0.35);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;backdrop-filter:blur(4px); }
    .up-header-name { color:#fff;font-size:16px;font-weight:800;margin-left:10px;text-shadow:0 1px 4px rgba(0,0,0,0.3); }
    .up-avatar-wrap { position:absolute;bottom:-38px;left:16px;z-index:3; }
    .up-avatar { width:78px;height:78px;border-radius:50%;background:linear-gradient(135deg,#0ea5e9,#7c3aed);border:3px solid #fff;box-shadow:0 4px 16px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:800;color:#fff;overflow:hidden; }
    .up-info { background:#fff;padding:52px 16px 16px;border-bottom:1px solid #f0f2f5; }
    .up-name { font-size:19px;font-weight:800;color:#050505; }
    .up-stats { display:flex;gap:20px;margin-top:12px; }
    .up-stat strong { font-size:14px;font-weight:800;color:#050505; }
    .up-stat span { font-size:13px;color:#65676b;margin-left:3px; }
    .up-badges { display:flex;flex-wrap:wrap;gap:6px;margin-top:10px; }
    .up-badge { display:inline-flex;align-items:center;font-size:12px;font-weight:600;padding:4px 11px;border-radius:20px; }
    .up-follow-btn { margin-top:12px;padding:8px 28px;border-radius:20px;border:none;font-size:14px;font-weight:700;cursor:pointer;background:#1877f2;color:#fff;transition:all 0.2s; }
    .up-follow-btn.following { background:#fff;color:#050505;border:1.5px solid #dbdbdb; }
    .up-tabs { display:flex;background:#fff;border-bottom:1px solid #f0f2f5;margin-top:8px; }
    .up-tab { flex:1;padding:13px 0;border:none;background:none;font-size:14px;cursor:pointer;transition:all 0.2s; }
    .up-card { display:flex;gap:10px;padding:14px 16px;border-bottom:1px solid #f0f2f5;background:#fff;cursor:pointer;transition:background 0.15s; }
    .up-card:hover { background:#f9fafb; }
  `;
  page.appendChild(styleEl);

  // Shimmer placeholder
  const shimmer = document.createElement('div');
  shimmer.innerHTML = `
    <div class="up-banner" style="animation:shimmer 1.5s infinite"></div>
    <div style="background:#fff;padding:52px 16px 20px">
      <div style="height:20px;width:45%;background:#e4e6ea;border-radius:8px;animation:shimmer 1.5s infinite;margin-bottom:8px"></div>
      <div style="height:14px;width:30%;background:#e4e6ea;border-radius:8px;animation:shimmer 1.5s infinite"></div>
    </div>`;
  page.appendChild(shimmer);

  // ── Fetch profile ──
  (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${userId}/profile`, { headers: authH() });
      if (!res.ok) { page.innerHTML = '<div style="text-align:center;padding:48px;color:#65676b">Pengguna tidak ditemukan</div>'; return; }
      const data = await res.json();
      const user = data.user || {};
      let isFollowing = data.is_following || false;
      let followerCount = data.follower_count || 0;

      shimmer.remove();

      // ── Banner ──
      const bannerEl = document.createElement('div');
      bannerEl.className = 'up-banner';
      if (user.cover_photo) bannerEl.style.backgroundImage = `url(${API_BASE_URL}${user.cover_photo})`;
      bannerEl.innerHTML = `
        <div class="up-topbar">
          <button class="up-back-btn" id="up-back">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span class="up-header-name">${esc(user.name || 'Profil')}</span>
        </div>
        <div class="up-avatar-wrap">
          <div class="up-avatar" id="up-avatar">
            ${user.profile_photo
              ? `<img src="${API_BASE_URL}${user.profile_photo}" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />`
              : initial(user.name)
            }
          </div>
        </div>`;
      bannerEl.querySelector('#up-back').addEventListener('click', () => history.back());
      page.appendChild(bannerEl);

      // ── Info block ──
      const st = SKIN_TYPE_STYLE[user.skin_type] || { bg: '#EFF6FF', c: '#1D4ED8' };
      const sp = (user.skin_problems || '').split(',').filter(p => p.trim());

      const infoEl = document.createElement('div');
      infoEl.className = 'up-info';
      infoEl.innerHTML = `
        <div class="up-name">${esc(user.name || 'Pengguna')}</div>
        <div class="up-badges" id="up-badges">
          ${user.skin_type ? `<span class="up-badge" style="background:${st.bg};color:${st.color}">${esc(user.skin_type)}</span>` : ''}
          ${sp.map(p => { const c = PROBLEM_STYLE[p] || { bg: '#F3F4F6', color: '#374151' }; return `<span class="up-badge" style="background:${c.bg};color:${c.color}">${esc(p)}</span>`; }).join('')}
        </div>
        <div class="up-stats">
          <div class="up-stat"><strong>${data.post_count ?? 0}</strong><span>Post</span></div>
          <div class="up-stat"><strong id="up-follower-count">${followerCount}</strong><span>Pengikut</span></div>
          <div class="up-stat"><strong>${data.following_count ?? 0}</strong><span>Mengikuti</span></div>
        </div>
        ${!isOwnProfile
          ? `<button class="up-follow-btn ${isFollowing ? 'following' : ''}" id="up-follow-btn">${isFollowing ? 'Mengikuti' : '+ Ikuti'}</button>`
          : `<button class="up-follow-btn" style="background:#fff;color:#050505;border:1.5px solid #dbdbdb" onclick="location.hash='#/profile'">Lihat Profil Saya</button>`
        }`;
      page.appendChild(infoEl);

      // Follow handler
      const followBtn = infoEl.querySelector('#up-follow-btn');
      const followerEl = infoEl.querySelector('#up-follower-count');
      if (followBtn && !isOwnProfile) {
        followBtn.addEventListener('click', async () => {
          const prev = isFollowing;
          isFollowing = !isFollowing;
          followerCount += isFollowing ? 1 : -1;
          followBtn.textContent = isFollowing ? 'Mengikuti' : '+ Ikuti';
          followBtn.className = `up-follow-btn${isFollowing ? ' following' : ''}`;
          if (followerEl) followerEl.textContent = followerCount;
          try {
            const r = await fetch(`${API_BASE_URL}/api/users/${userId}/follow`, { method: 'POST', headers: authH() });
            const d = await r.json();
            isFollowing = d.following;
            followerCount = d.follower_count;
            followBtn.textContent = isFollowing ? 'Mengikuti' : '+ Ikuti';
            followBtn.className = `up-follow-btn${isFollowing ? ' following' : ''}`;
            if (followerEl) followerEl.textContent = followerCount;
          } catch {
            isFollowing = prev; followerCount += isFollowing ? 1 : -1;
            followBtn.textContent = isFollowing ? 'Mengikuti' : '+ Ikuti';
            followBtn.className = `up-follow-btn${isFollowing ? ' following' : ''}`;
          }
        });
      }

      // ── Tabs ──
      const tabsEl = document.createElement('div');
      tabsEl.className = 'up-tabs';
      tabsEl.innerHTML = `
        <button class="up-tab" id="up-tab-posts" style="font-weight:700;color:#1877f2;border-bottom:3px solid #1877f2">Post</button>
        <button class="up-tab" id="up-tab-liked" style="font-weight:600;color:#65676b;border-bottom:3px solid transparent">Suka</button>`;
      page.appendChild(tabsEl);

      const tabContent = document.createElement('div');
      page.appendChild(tabContent);

      // ── Post card renderer ──
      function renderCard(p) {
        const imgs = parseImageUrls(p.image_url);
        const card = document.createElement('div');
        card.className = 'up-card';
        const av = initial(p.user_name || user.name);
        const imgHtml = imgs.length > 0 ? `
          <div style="margin-top:10px;border-radius:12px;overflow:hidden;border:1px solid #f0f2f5">
            ${imgs.length === 1
              ? `<img src="${imgs[0]}" style="width:100%;max-height:260px;object-fit:cover;display:block" loading="lazy"/>`
              : `<div style="display:grid;grid-template-columns:repeat(${Math.min(imgs.length, 3)},1fr);gap:2px">${imgs.slice(0, 3).map(u => `<img src="${u}" style="width:100%;aspect-ratio:1;object-fit:cover;display:block" loading="lazy"/>`).join('')}</div>`
            }
          </div>` : '';

        // For post tab: use user's actual avatar if available
        const avatarHtml = user.profile_photo
          ? `<img src="${API_BASE_URL}${user.profile_photo}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
          : av;
        const avatarBg = user.profile_photo ? 'none' : 'linear-gradient(135deg,#1877f2,#0ea5e9)';

        card.innerHTML = `
          <div style="width:40px;height:40px;border-radius:50%;background:${avatarBg};display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;color:#fff;flex-shrink:0;overflow:hidden">
            ${avatarHtml}
          </div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
              <span style="font-size:14px;font-weight:700;color:#050505">${esc(user.name || 'Pengguna')}</span>
              ${user.skin_type ? `<span style="font-size:11px;padding:2px 7px;border-radius:20px;background:${st.bg};color:${st.color};font-weight:600">${esc(user.skin_type)}</span>` : ''}
              <span style="font-size:12px;color:#65676b;margin-left:auto">${timeAgo(p.created_at)}</span>
            </div>
            ${p.content ? `<div style="font-size:14px;color:#050505;margin-top:5px;line-height:1.55;word-break:break-word;white-space:pre-wrap">${esc(p.content)}</div>` : ''}
            ${imgHtml}
            <div style="display:flex;gap:18px;margin-top:10px;color:#65676b;font-size:13px">
              <span style="display:flex;align-items:center;gap:4px">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="#e03131" stroke="#e03131" stroke-width="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                ${p.like_count || 0}
              </span>
              <span style="display:flex;align-items:center;gap:4px">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#65676b" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                ${p.comment_count || 0}
              </span>
            </div>
          </div>`;
        card.addEventListener('click', () => { window.location.hash = `#/post/${p.id}`; });
        return card;
      }

      // ── Load tab data ──
      async function loadTab(tab) {
        tabContent.innerHTML = `<div style="text-align:center;padding:32px;color:#65676b;font-size:14px">Memuat…</div>`;
        try {
          let posts = [];
          if (tab === 'posts') {
            // Use already-fetched posts from profile API
            posts = data.posts || [];
          } else {
            // Liked posts: only available for own profile
            if (!isOwnProfile) {
              tabContent.innerHTML = `<div style="text-align:center;padding:48px;color:#65676b;font-size:14px">Tab ini hanya untuk profil sendiri</div>`;
              return;
            }
            const r = await fetch(`${API_BASE_URL}/api/users/me/liked`, { headers: authH() });
            const d = await r.json();
            posts = d.posts || [];
          }
          tabContent.innerHTML = '';
          if (posts.length === 0) {
            tabContent.innerHTML = `<div style="text-align:center;padding:48px;color:#65676b;font-size:14px">Belum ada post</div>`;
            return;
          }
          posts.forEach(p => tabContent.appendChild(renderCard(p)));
        } catch {
          tabContent.innerHTML = `<div style="text-align:center;padding:32px;color:#e03131;font-size:13px">Gagal memuat postingan</div>`;
        }
      }

      function switchTab(tab) {
        const tp = tabsEl.querySelector('#up-tab-posts');
        const tl = tabsEl.querySelector('#up-tab-liked');
        tp.style.color = tab === 'posts' ? '#1877f2' : '#65676b';
        tp.style.fontWeight = tab === 'posts' ? '700' : '600';
        tp.style.borderBottom = tab === 'posts' ? '3px solid #1877f2' : '3px solid transparent';
        tl.style.color = tab === 'liked' ? '#1877f2' : '#65676b';
        tl.style.fontWeight = tab === 'liked' ? '700' : '600';
        tl.style.borderBottom = tab === 'liked' ? '3px solid #1877f2' : '3px solid transparent';
        loadTab(tab);
      }

      tabsEl.querySelector('#up-tab-posts')?.addEventListener('click', () => switchTab('posts'));
      tabsEl.querySelector('#up-tab-liked')?.addEventListener('click', () => switchTab('liked'));
      loadTab('posts');

    } catch (err) {
      page.innerHTML = `<div style="text-align:center;padding:48px;color:#65676b">Gagal memuat profil<br><small>${err.message}</small></div>`;
    }
  })();

  return page;
}
