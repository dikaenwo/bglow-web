import { API_BASE_URL } from '../config.js';

function getAuthToken() {
  try {
    const u = JSON.parse(localStorage.getItem('bglow_user') || '{}');
    return u.token || localStorage.getItem('bglow_token') || null;
  } catch { return localStorage.getItem('bglow_token') || null; }
}

function getCurrentUserId() {
  try { return JSON.parse(localStorage.getItem('bglow_user') || '{}').id || null; } catch { return null; }
}

function getCurrentUserName() {
  try { return JSON.parse(localStorage.getItem('bglow_user') || '{}').name || 'Saya'; } catch { return 'Saya'; }
}

const authH = () => ({ Authorization: `Bearer ${getAuthToken()}` });

function timeAgo(iso) {
  const d = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (d < 60) return 'Baru saja';
  if (d < 3600) return `${Math.floor(d / 60)} menit lalu`;
  if (d < 86400) return `${Math.floor(d / 3600)} jam lalu`;
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function initial(n) { return (n || '?').trim().charAt(0).toUpperCase(); }

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const HEART = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
const SEND  = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
const BACK  = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;
const COMMENT_SVG = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`;

function renderCommentItem(c) {
  const el = document.createElement('div');
  el.style.cssText = 'display:flex;gap:10px;margin-bottom:16px;animation:feedSlideIn 0.25s ease';
  el.innerHTML = `
    <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#1877f2,#0ea5e9);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;flex-shrink:0">${initial(c.user_name)}</div>
    <div style="flex:1">
      <div style="background:#f0f2f5;border-radius:18px;padding:9px 14px">
        <div style="font-size:13px;font-weight:700;color:#050505;margin-bottom:3px">${esc(c.user_name || 'Pengguna')}</div>
        <div style="font-size:14px;color:#050505;line-height:1.45;word-break:break-word">${esc(c.content)}</div>
      </div>
      <div style="font-size:11px;color:#65676b;margin-top:4px;padding-left:6px">${timeAgo(c.created_at)}</div>
    </div>
  `;
  return el;
}

export function renderPostDetail(postId) {
  const page = document.createElement('div');
  page.style.cssText = 'min-height:100vh;background:#f0f2f5;display:flex;flex-direction:column;padding-bottom:80px';

  // ── Header ──
  const header = document.createElement('div');
  header.style.cssText = 'position:sticky;top:0;z-index:50;background:rgba(255,255,255,0.95);backdrop-filter:blur(16px);border-bottom:1px solid #e4e6ea;display:flex;align-items:center;gap:12px;padding:12px 16px';
  header.innerHTML = `
    <button id="post-detail-back" style="background:#f2f2f2;border:none;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#050505;flex-shrink:0">${BACK}</button>
    <span style="font-size:17px;font-weight:800;color:#050505">Post</span>
  `;
  header.querySelector('#post-detail-back').addEventListener('click', () => history.back());
  page.appendChild(header);

  // ── Skeleton ──
  const body = document.createElement('div');
  body.style.cssText = 'flex:1;overflow-y:auto';
  body.innerHTML = `
    <div style="background:#fff;margin-bottom:8px;padding:16px">
      <div style="display:flex;gap:10px;margin-bottom:12px">
        <div style="width:42px;height:42px;border-radius:50%;background:#e4e6ea;animation:shimmer 1.5s infinite"></div>
        <div style="flex:1">
          <div style="height:13px;width:40%;background:#e4e6ea;border-radius:6px;animation:shimmer 1.5s infinite;margin-bottom:8px"></div>
          <div style="height:10px;width:25%;background:#e4e6ea;border-radius:6px;animation:shimmer 1.5s infinite"></div>
        </div>
      </div>
      <div style="height:12px;width:100%;background:#e4e6ea;border-radius:6px;animation:shimmer 1.5s infinite;margin-bottom:6px"></div>
      <div style="height:12px;width:80%;background:#e4e6ea;border-radius:6px;animation:shimmer 1.5s infinite"></div>
    </div>
  `;
  page.appendChild(body);

  // ── Fixed comment input ──
  const myName = getCurrentUserName();
  const inputBar = document.createElement('div');
  inputBar.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #e4e6ea;display:flex;align-items:center;gap:8px;padding:10px 14px 24px;z-index:50';
  inputBar.innerHTML = `
    <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#1877f2,#0ea5e9);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;flex-shrink:0">${initial(myName)}</div>
    <div style="flex:1;background:#f0f2f5;border-radius:22px;display:flex;align-items:center;padding:10px 14px;gap:8px">
      <input id="pd-comment-input" type="text" placeholder="Tulis komentar…" maxlength="500"
        style="flex:1;background:none;border:none;outline:none;font-size:14px;color:#050505;font-family:inherit" />
      <button id="pd-send-btn" style="background:none;border:none;color:#1877f2;cursor:pointer;display:flex;align-items:center;opacity:0.4;transition:opacity 0.2s">${SEND}</button>
    </div>
  `;
  page.appendChild(inputBar);

  // ── Load post ──
  (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}`, { headers: authH() });
      if (!res.ok) { body.innerHTML = '<div style="text-align:center;padding:40px;color:#65676b">Post tidak ditemukan</div>'; return; }
      const post = await res.json();

      const images = post.image_url ? [`${API_BASE_URL}${post.image_url}`] : [];
      const imageHtml = images.length > 0 ? `
        <div style="display:flex;gap:3px;border-radius:14px;overflow:hidden;margin:8px 0 12px">
          ${images.map(url => `<div style="flex:1;aspect-ratio:1;max-height:220px;overflow:hidden;cursor:pointer" class="pd-img-thumb">
            <img src="${url}" style="width:100%;height:100%;object-fit:cover;display:block" loading="lazy" />
          </div>`).join('')}
        </div>` : '';

      body.innerHTML = `
        <!-- Post card -->
        <div style="background:#fff;padding:16px;margin-bottom:8px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
            <div id="pd-avatar" style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#1877f2,#0ea5e9);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:#fff;cursor:pointer;flex-shrink:0">${initial(post.user_name)}</div>
            <div style="flex:1">
              <div id="pd-author-name" style="font-size:15px;font-weight:700;color:#050505;cursor:pointer">${esc(post.user_name || 'Pengguna')}</div>
              <div style="display:flex;gap:6px;align-items:center;margin-top:2px">
                ${post.skin_type ? `<span style="font-size:10px;padding:2px 7px;border-radius:20px;background:#e7f3ff;color:#1877f2;font-weight:600">${esc(post.skin_type)}</span>` : ''}
                <span style="font-size:11.5px;color:#65676b">${timeAgo(post.created_at)}</span>
              </div>
            </div>
          </div>
          ${post.content ? `<div style="font-size:16px;color:#050505;line-height:1.65;white-space:pre-wrap;word-break:break-word;margin-bottom:12px">${esc(post.content)}</div>` : ''}
          ${imageHtml}
          <!-- Stats -->
          ${post.like_count > 0 || post.comment_count > 0 ? `
          <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px;color:#65676b;border-bottom:1px solid #e4e6ea">
            <span>${post.like_count > 0 ? `❤️ ${post.like_count} suka` : ''}</span>
            <span>${post.comment_count > 0 ? `${post.comment_count} komentar` : ''}</span>
          </div>` : ''}
          <!-- Actions -->
          <div style="display:flex;border-top:1px solid #f0f2f5;padding-top:4px">
            <button id="pd-like-btn" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;background:none;border:none;padding:9px;cursor:pointer;border-radius:6px;font-size:13.5px;font-weight:600;color:${post.liked_by_me ? '#1877f2' : '#65676b'};transition:background 0.15s">
              <svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:${post.liked_by_me ? '#1877f2' : 'none'};stroke:${post.liked_by_me ? '#1877f2' : 'currentColor'};stroke-width:2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              Suka
            </button>
            <button id="pd-comment-focus-btn" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;background:none;border:none;padding:9px;cursor:pointer;border-radius:6px;font-size:13.5px;font-weight:600;color:#65676b;transition:background 0.15s">
              ${COMMENT_SVG} Komentar
            </button>
          </div>
        </div>
        <!-- Comments -->
        <div style="background:#fff;padding:14px 16px 12px">
          <div style="font-size:14px;font-weight:700;color:#65676b;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid #f0f2f5">Komentar</div>
          <div id="pd-comment-list">
            <div style="display:flex;gap:10px;margin-bottom:10px">
              <div style="width:34px;height:34px;border-radius:50%;background:#e4e6ea;animation:shimmer 1.5s infinite;flex-shrink:0"></div>
              <div style="flex:1">
                <div style="height:11px;width:50%;background:#e4e6ea;border-radius:6px;animation:shimmer 1.5s infinite;margin-bottom:6px"></div>
                <div style="height:10px;width:80%;background:#e4e6ea;border-radius:6px;animation:shimmer 1.5s infinite"></div>
              </div>
            </div>
          </div>
        </div>
      `;

      // Lightbox
      body.querySelectorAll('.pd-img-thumb').forEach((el, i) => {
        el.addEventListener('click', () => {
          const lb = document.createElement('div');
          lb.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:9999;display:flex;align-items:center;justify-content:center';
          lb.innerHTML = `<img src="${images[i]}" style="max-width:100vw;max-height:85vh;object-fit:contain;border-radius:4px" /><button style="position:absolute;top:14px;right:14px;background:rgba(255,255,255,0.15);border:none;color:#fff;width:36px;height:36px;border-radius:50%;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center">✕</button>`;
          lb.querySelector('button').addEventListener('click', () => lb.remove());
          lb.addEventListener('click', e => { if (e.target === lb) lb.remove(); });
          document.body.appendChild(lb);
        });
      });

      // Navigate to user profile
      const goToProfile = () => { window.location.hash = `#/user/${post.user_id}`; };
      body.querySelector('#pd-avatar')?.addEventListener('click', goToProfile);
      body.querySelector('#pd-author-name')?.addEventListener('click', goToProfile);

      // Like
      let liked = post.liked_by_me;
      const likeBtn = body.querySelector('#pd-like-btn');
      likeBtn?.addEventListener('click', async () => {
        liked = !liked;
        likeBtn.style.color = liked ? '#1877f2' : '#65676b';
        likeBtn.querySelector('svg').style.fill = liked ? '#1877f2' : 'none';
        likeBtn.querySelector('svg').style.stroke = liked ? '#1877f2' : 'currentColor';
        try {
          await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, { method: 'POST', headers: authH() });
        } catch { liked = !liked; }
      });

      // Focus comment input
      body.querySelector('#pd-comment-focus-btn')?.addEventListener('click', () => {
        inputBar.querySelector('#pd-comment-input')?.focus();
      });

      // Load comments
      const commentListEl = body.querySelector('#pd-comment-list');
      try {
        const cRes = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, { headers: authH() });
        const cData = await cRes.json();
        commentListEl.innerHTML = '';
        if (!cData.comments || cData.comments.length === 0) {
          commentListEl.innerHTML = '<div style="text-align:center;padding:20px;color:#65676b;font-size:13.5px">Belum ada komentar. Jadilah yang pertama!</div>';
        } else {
          cData.comments.forEach(c => commentListEl.appendChild(renderCommentItem(c)));
        }
      } catch {
        commentListEl.innerHTML = '<div style="text-align:center;padding:20px;color:#65676b">Gagal memuat komentar</div>';
      }

    } catch (err) {
      body.innerHTML = `<div style="text-align:center;padding:40px;color:#65676b">Gagal memuat post: ${err.message}</div>`;
    }
  })();

  // Send comment
  const commentInput = inputBar.querySelector('#pd-comment-input');
  const sendBtn      = inputBar.querySelector('#pd-send-btn');
  let _sending = false;

  commentInput.addEventListener('input', () => {
    sendBtn.style.opacity = commentInput.value.trim() ? '1' : '0.4';
  });

  commentInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); }
  });
  sendBtn.addEventListener('click', doSend);

  async function doSend() {
    const text = commentInput.value.trim();
    if (!text || _sending) return;
    _sending = true;
    commentInput.value = '';
    sendBtn.style.opacity = '0.4';
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authH() },
        body: JSON.stringify({ content: text })
      });
      const c = await res.json();
      const listEl = body.querySelector('#pd-comment-list');
      listEl?.querySelector('div[style*="text-align:center"]')?.remove();
      listEl?.appendChild(renderCommentItem(c));
      // Scroll to bottom
      listEl?.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (err) {
      alert(err.message);
      commentInput.value = text;
    } finally {
      _sending = false;
    }
  }

  return page;
}
