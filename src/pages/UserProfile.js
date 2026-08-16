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

const SKIN_LABEL = {
  Berminyak: { bg: '#fef3c7', color: '#92400e', label: '💧 Berminyak' },
  Kering:    { bg: '#e0f2fe', color: '#075985', label: '🌵 Kering' },
  Normal:    { bg: '#dcfce7', color: '#14532d', label: '✨ Normal' },
  Kombinasi: { bg: '#ede9fe', color: '#4c1d95', label: '⚡ Kombinasi' },
};

export function renderUserProfile(userId) {
  const myId = getCurrentUserId();
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
      const isOwnProfile = data.is_own_profile || (String(myId) === String(userId));

      header.querySelector('#up-header-name').textContent = user.name || 'Profil';

      const skin = user.skin_type ? (SKIN_LABEL[user.skin_type] || { bg: '#f0f2f5', color: '#374151', label: user.skin_type }) : null;

      let isFollowing = data.is_following || false;
      let followerCount = data.follower_count || 0;

      const followBtnHtml = isOwnProfile ? '' : `
        <button id="up-follow-btn" style="
          padding:8px 24px;border-radius:20px;font-size:13px;font-weight:700;
          cursor:pointer;border:${isFollowing ? '1.5px solid #ccc' : 'none'};
          background:${isFollowing ? '#fff' : '#1877f2'};
          color:${isFollowing ? '#050505' : '#fff'};
          transition:all 0.2s;min-width:100px;margin-top:4px
        ">${isFollowing ? 'Following' : '+ Follow'}</button>
      `;

      body.innerHTML = `
        <div style="background:#fff;margin-bottom:8px">
          <div style="padding:28px 16px 20px;display:flex;flex-direction:column;align-items:center;gap:10px;border-bottom:1px solid #f0f2f5">
            <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#1877f2,#0ea5e9);display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:800;color:#fff;box-shadow:0 4px 16px rgba(24,119,242,0.25)">
              ${initial(user.name)}
            </div>
            <div style="text-align:center">
              <div style="font-size:20px;font-weight:800;color:#050505;margin-bottom:4px">${esc(user.name || 'Pengguna')}</div>
              ${skin ? `<span style="font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;background:${skin.bg};color:${skin.color}">${skin.label}</span>` : ''}
            </div>
            <!-- Stats row -->
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
            ${followBtnHtml}
          </div>
          ${user.skin_type ? `
          <div style="padding:14px 16px">
            <div style="font-size:13px;font-weight:700;color:#65676b;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.3px">Skin Profile</div>
            <div style="display:flex;flex-wrap:wrap;gap:8px">
              ${skin ? `<span style="font-size:12px;font-weight:600;padding:5px 12px;border-radius:20px;background:${skin.bg};color:${skin.color}">${skin.label}</span>` : ''}
              ${user.acne_level ? `<span style="font-size:12px;padding:5px 12px;border-radius:20px;background:#fff1f2;color:#be123c;font-weight:600">🔴 Jerawat: ${esc(user.acne_level)}</span>` : ''}
              ${user.oil_level  ? `<span style="font-size:12px;padding:5px 12px;border-radius:20px;background:#fef3c7;color:#92400e;font-weight:600">💧 Minyak: ${esc(user.oil_level)}</span>` : ''}
              ${user.pore_condition ? `<span style="font-size:12px;padding:5px 12px;border-radius:20px;background:#f0fdf4;color:#15803d;font-weight:600">⭕ Pori: ${esc(user.pore_condition)}</span>` : ''}
            </div>
          </div>` : ''}
        </div>

        <div style="background:#fff;padding:14px 0">
          <div style="font-size:15px;font-weight:800;color:#050505;padding:0 16px 12px;border-bottom:1px solid #e4e6ea">
            Post dari ${esc(user.name || 'Pengguna')}
          </div>
          <div id="up-posts-list">
            ${data.posts.length === 0 ? '<div style="text-align:center;padding:32px;color:#65676b;font-size:13.5px">Belum ada post</div>' : ''}
          </div>
        </div>
      `;

      // Follow button handler
      if (!isOwnProfile) {
        const followBtn = body.querySelector('#up-follow-btn');
        const followerCountEl = body.querySelector('#up-follower-count');
        followBtn?.addEventListener('click', async () => {
          const prev = isFollowing;
          isFollowing = !isFollowing;
          followerCount += isFollowing ? 1 : -1;
          followBtn.textContent = isFollowing ? 'Following' : '+ Follow';
          followBtn.style.background = isFollowing ? '#fff' : '#1877f2';
          followBtn.style.color = isFollowing ? '#050505' : '#fff';
          followBtn.style.border = isFollowing ? '1.5px solid #ccc' : 'none';
          if (followerCountEl) followerCountEl.textContent = followerCount;
          try {
            const r = await fetch(`${API_BASE_URL}/api/users/${userId}/follow`, { method: 'POST', headers: authH() });
            const d = await r.json();
            followerCount = d.follower_count;
            isFollowing = d.following;
            if (followerCountEl) followerCountEl.textContent = followerCount;
            followBtn.textContent = isFollowing ? 'Following' : '+ Follow';
          } catch {
            // revert
            isFollowing = prev;
            followerCount += isFollowing ? 1 : -1;
            followBtn.textContent = isFollowing ? 'Following' : '+ Follow';
          }
        });
      }

      // Render posts
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
            <span>❤️ ${p.like_count || 0}</span>
            <span>💬 ${p.comment_count || 0}</span>
            <span style="margin-left:auto" data-created-at="${p.created_at}">${timeAgo(p.created_at)}</span>
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
