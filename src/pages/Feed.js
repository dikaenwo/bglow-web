import { API_BASE_URL } from '../config.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

function getAuthToken() {
  try {
    const u = JSON.parse(localStorage.getItem('bglow_user') || '{}');
    return u.token || localStorage.getItem('bglow_token') || null;
  } catch {
    return localStorage.getItem('bglow_token') || null;
  }
}

function getCurrentUserId() {
  try {
    const u = JSON.parse(localStorage.getItem('bglow_user') || '{}');
    return u.id || null;
  } catch { return null; }
}

function getCurrentUserName() {
  try {
    const u = JSON.parse(localStorage.getItem('bglow_user') || '{}');
    return u.name || 'Saya';
  } catch { return 'Saya'; }
}

function timeAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (diff < 60) return 'Baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
  return new Date(isoString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function avatarInitial(name) {
  return (name || '?').trim().charAt(0).toUpperCase();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const HEART_SVG = `<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;

const COMMENT_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`;

const CAMERA_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>`;

const PLUS_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;

const SEND_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;

// ─── State ───────────────────────────────────────────────────────────────────

let _posts     = [];
let _page      = 1;
let _hasMore   = true;
let _isLoading = false;
let _showModal = false;
let _imageFile       = null;
let _imagePreviewUrl = null;
let _submitting      = false;
let _postListEl      = null;
let _modalEl         = null;
let _overlayEl       = null;

// ─── API ─────────────────────────────────────────────────────────────────────

const authHeaders = () => ({ Authorization: `Bearer ${getAuthToken()}` });

async function apiFetchFeed(page = 1) {
  const res = await fetch(`${API_BASE_URL}/api/feed?page=${page}&limit=20`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function apiCreatePost(content, imageUrl) {
  const res = await fetch(`${API_BASE_URL}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ content, image_url: imageUrl || null })
  });
  if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.detail || 'Gagal membuat post'); }
  return res.json();
}

async function apiDeletePost(postId) {
  const res = await fetch(`${API_BASE_URL}/api/posts/${postId}`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) throw new Error('Gagal menghapus post');
}

async function apiToggleLike(postId) {
  const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, { method: 'POST', headers: authHeaders() });
  if (!res.ok) throw new Error('Gagal toggle like');
  return res.json();
}

async function apiUploadImage(file) {
  const form = new FormData();
  form.append('image', file);
  const res = await fetch(`${API_BASE_URL}/api/upload/image`, { method: 'POST', headers: authHeaders(), body: form });
  if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.detail || 'Gagal upload foto'); }
  return res.json();
}

async function apiFetchComments(postId) {
  const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Gagal load komentar');
  return res.json();
}

async function apiAddComment(postId, content) {
  const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ content })
  });
  if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.detail || 'Gagal komentar'); }
  return res.json();
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function openLightbox(urls, startIndex = 0) {
  let cur = startIndex;
  const lb = document.createElement('div');
  lb.className = 'post-lightbox';

  function render() {
    lb.innerHTML = `
      ${urls.length > 1 ? `<div class="lightbox-counter">${cur + 1} / ${urls.length}</div>` : ''}
      <button class="lightbox-close" id="lb-close">✕</button>
      <img class="lightbox-img" src="${urls[cur]}" alt="foto" draggable="false" />
      ${urls.length > 1 && cur > 0             ? `<button class="lightbox-nav prev" id="lb-prev">‹</button>` : ''}
      ${urls.length > 1 && cur < urls.length-1 ? `<button class="lightbox-nav next" id="lb-next">›</button>` : ''}
      ${urls.length > 1 ? `
        <div class="lightbox-dots">
          ${urls.map((_, i) => `<div class="lightbox-dot ${i === cur ? 'active' : ''}" data-i="${i}"></div>`).join('')}
        </div>` : ''}
    `;
    lb.querySelector('#lb-close')?.addEventListener('click', () => lb.remove());
    lb.querySelector('#lb-prev')?.addEventListener('click', () => { cur--; render(); });
    lb.querySelector('#lb-next')?.addEventListener('click', () => { cur++; render(); });
    lb.querySelectorAll('.lightbox-dot').forEach(dot => {
      dot.addEventListener('click', () => { cur = parseInt(dot.dataset.i); render(); });
    });
  }

  render();
  lb.addEventListener('click', (e) => { if (e.target === lb) lb.remove(); });
  // Swipe
  let touchStartX = 0;
  lb.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (dx < -50 && cur < urls.length - 1) { cur++; render(); }
    if (dx >  50 && cur > 0)               { cur--; render(); }
  });
  document.body.appendChild(lb);
}

// ─── Post Detail Sheet ───────────────────────────────────────────────────────────────

function openPostDetail(post) {
  const myName = getCurrentUserName();
  const images = post.image_url ? [`${API_BASE_URL}${post.image_url}`] : [];

  const overlay = document.createElement('div');
  overlay.className = 'post-detail-overlay';

  const imageGridHtml = images.length > 0 ? `
    <div class="post-image-grid" style="margin-bottom:12px">
      ${images.map((url, i) => `
        <div class="post-image-thumb" data-img-idx="${i}">
          <img src="${url}" alt="foto" loading="lazy" />
        </div>`).join('')}
    </div>` : '';

  const sheet = document.createElement('div');
  sheet.className = 'post-detail-sheet';
  sheet.innerHTML = `
    <div class="pds-header">
      <span class="pds-title">Post</span>
      <button class="pds-close" id="pds-close-btn">✕</button>
    </div>
    <div class="pds-body" id="pds-body">
      <div class="pds-post">
        <div class="post-header" style="margin-bottom:10px">
          <div class="post-avatar">${avatarInitial(post.user_name)}</div>
          <div class="post-user-info">
            <span class="post-user-name">${escapeHtml(post.user_name || 'Pengguna')}</span>
            <div class="post-meta">
              ${post.skin_type ? `<span class="post-skin-badge">${escapeHtml(post.skin_type)}</span>` : ''}
              <span class="post-time">${timeAgo(post.created_at)}</span>
            </div>
          </div>
        </div>
        ${post.content ? `<div class="post-content" style="font-size:16px;margin-bottom:12px">${escapeHtml(post.content)}</div>` : ''}
        ${imageGridHtml}
        <div class="pds-actions">
          <button class="pds-like-btn ${post.liked_by_me ? 'liked' : ''}" id="pds-like-btn">
            ${HEART_SVG} Suka ${post.like_count > 0 ? `<span style="font-size:12px;color:#65676b">(${post.like_count})</span>` : ''}
          </button>
        </div>
      </div>
      <div class="pds-comments" id="pds-comments-area">
        <div class="pds-comments-title">Komentar</div>
        <div id="pds-comment-list">
          <div class="comment-skeleton" style="margin-bottom:10px">
            <div class="skeleton-avatar" style="width:34px;height:34px"></div>
            <div style="flex:1">
              <div class="skeleton-line" style="width:50%;height:11px"></div>
              <div class="skeleton-line" style="width:80%;height:10px;margin-top:5px"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="pds-input-bar">
      <div class="comment-avatar-sm">${avatarInitial(myName)}</div>
      <div class="pds-input-wrap">
        <input class="pds-input" id="pds-comment-input" type="text" placeholder="Tulis komentar…" maxlength="500" />
        <button class="pds-send-btn" id="pds-send-btn">${SEND_SVG}</button>
      </div>
    </div>
  `;

  overlay.appendChild(sheet);
  document.body.appendChild(overlay);

  // Close
  const closeSheet = () => overlay.remove();
  sheet.querySelector('#pds-close-btn').addEventListener('click', closeSheet);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeSheet(); });

  // Image lightbox
  sheet.querySelectorAll('.post-image-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => openLightbox(images, parseInt(thumb.dataset.imgIdx) || 0));
  });

  // Like inside sheet
  const likeBtn = sheet.querySelector('#pds-like-btn');
  likeBtn?.addEventListener('click', async () => {
    const wasLiked = likeBtn.classList.contains('liked');
    likeBtn.classList.toggle('liked');
    try {
      const r = await apiToggleLike(post.id);
      if (r.liked) likeBtn.classList.add('liked'); else likeBtn.classList.remove('liked');
      // Sync feed card
      const feedCard = document.querySelector(`[data-post-id="${post.id}"] .like-btn`);
      if (feedCard) {
        if (r.liked) feedCard.classList.add('liked'); else feedCard.classList.remove('liked');
        const countEl = feedCard.querySelector('.like-count');
        if (countEl) countEl.textContent = r.like_count || '';
      }
    } catch { likeBtn.classList.toggle('liked'); }
  });

  // Load comments
  const commentListEl = sheet.querySelector('#pds-comment-list');
  (async () => {
    try {
      const data = await apiFetchComments(post.id);
      commentListEl.innerHTML = '';
      if (!data.comments || data.comments.length === 0) {
        commentListEl.innerHTML = '<div class="pds-comments-empty">Belum ada komentar</div>';
      } else {
        data.comments.forEach(c => {
          const item = document.createElement('div');
          item.className = 'pds-comment-item';
          item.innerHTML = `
            <div class="comment-avatar-sm">${avatarInitial(c.user_name)}</div>
            <div>
              <div class="pds-comment-bubble">
                <div class="pds-comment-name">${escapeHtml(c.user_name || 'Pengguna')}</div>
                <div class="pds-comment-text">${escapeHtml(c.content)}</div>
              </div>
              <div class="pds-comment-time">${timeAgo(c.created_at)}</div>
            </div>
          `;
          commentListEl.appendChild(item);
        });
        // Scroll to last comment
        setTimeout(() => {
          const body = sheet.querySelector('#pds-body');
          body.scrollTop = body.scrollHeight;
        }, 100);
      }
    } catch {
      commentListEl.innerHTML = '<div class="pds-comments-empty">Gagal memuat komentar</div>';
    }
  })();

  // Send comment
  const input = sheet.querySelector('#pds-comment-input');
  const sendBtn = sheet.querySelector('#pds-send-btn');
  let _sending = false;

  input.addEventListener('input', () => sendBtn.classList.toggle('active', input.value.trim().length > 0));
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); } });
  sendBtn.addEventListener('click', doSend);

  async function doSend() {
    const text = input.value.trim();
    if (!text || _sending) return;
    _sending = true;
    input.value = '';
    sendBtn.classList.remove('active');
    try {
      const c = await apiAddComment(post.id, text);
      commentListEl.querySelector('.pds-comments-empty')?.remove();
      const item = document.createElement('div');
      item.className = 'pds-comment-item';
      item.innerHTML = `
        <div class="comment-avatar-sm">${avatarInitial(c.user_name)}</div>
        <div>
          <div class="pds-comment-bubble">
            <div class="pds-comment-name">${escapeHtml(c.user_name || 'Saya')}</div>
            <div class="pds-comment-text">${escapeHtml(c.content)}</div>
          </div>
          <div class="pds-comment-time">Baru saja</div>
        </div>
      `;
      commentListEl.appendChild(item);
      const body = sheet.querySelector('#pds-body');
      setTimeout(() => { body.scrollTop = body.scrollHeight; }, 60);

      // Sync comment count on feed card
      const countEl = document.querySelector(`[data-post-id="${post.id}"] .comment-count-label`);
      if (countEl) countEl.textContent = parseInt(countEl.textContent || 0) + 1;
    } catch (err) {
      alert(err.message);
      input.value = text;
    } finally {
      _sending = false;
    }
  }

  // Focus input
  setTimeout(() => input.focus(), 400);
}

function renderSkeletons(count = 3) {
  return Array.from({ length: count }).map(() => {
    const el = document.createElement('div');
    el.className = 'post-skeleton';
    el.innerHTML = `
      <div style="display:flex;gap:10px;align-items:center;margin-bottom:12px">
        <div class="skeleton-avatar"></div>
        <div style="flex:1">
          <div class="skeleton-line" style="width:42%;height:13px"></div>
          <div class="skeleton-line" style="width:26%;height:10px;margin-top:6px"></div>
        </div>
      </div>
      <div class="skeleton-line" style="width:100%"></div>
      <div class="skeleton-line" style="width:80%"></div>
      <div class="skeleton-line" style="width:55%;margin-bottom:0"></div>
    `;
    return el;
  });
}

// ─── Comment Section ──────────────────────────────────────────────────────────

function buildCommentSection(postId, initialCount) {
  const section = document.createElement('div');
  section.className = 'comment-section';
  section.id = `comments-${postId}`;

  const myName = getCurrentUserName();

  section.innerHTML = `
    <div class="comment-input-row">
      <div class="comment-avatar-sm">${avatarInitial(myName)}</div>
      <div class="comment-input-wrap">
        <input class="comment-input" id="comment-input-${postId}" type="text" placeholder="Tulis komentar…" maxlength="500" />
        <button class="comment-send-btn" id="comment-send-${postId}">${SEND_SVG}</button>
      </div>
    </div>
    <div class="comment-list" id="comment-list-${postId}"></div>
  `;

  let _loaded = false;
  let _sending = false;

  async function loadComments() {
    const listEl = section.querySelector(`#comment-list-${postId}`);
    if (_loaded) return;
    _loaded = true;

    listEl.innerHTML = `<div class="comment-skeleton">
      <div class="skeleton-avatar" style="width:32px;height:32px"></div>
      <div style="flex:1"><div class="skeleton-line" style="width:60%;height:11px"></div><div class="skeleton-line" style="width:80%;height:10px;margin-top:4px"></div></div>
    </div>`;

    try {
      const data = await apiFetchComments(postId);
      listEl.innerHTML = '';
      if (data.comments.length === 0) {
        listEl.innerHTML = '<div class="comments-empty">Belum ada komentar. Jadilah yang pertama! 💬</div>';
      } else {
        data.comments.forEach(c => listEl.appendChild(renderCommentItem(c)));
      }
    } catch {
      listEl.innerHTML = '<div class="comments-empty">Gagal memuat komentar</div>';
    }
  }

  function renderCommentItem(c) {
    const item = document.createElement('div');
    item.className = 'comment-item';
    item.innerHTML = `
      <div class="comment-avatar-sm">${avatarInitial(c.user_name)}</div>
      <div>
        <div class="comment-bubble">
          <div class="comment-user-name">${escapeHtml(c.user_name || 'Pengguna')}</div>
          <div class="comment-text">${escapeHtml(c.content)}</div>
        </div>
        <div class="comment-time">${timeAgo(c.created_at)}</div>
      </div>
    `;
    return item;
  }

  // Send comment
  const input = section.querySelector(`#comment-input-${postId}`);
  const sendBtn = section.querySelector(`#comment-send-${postId}`);

  input.addEventListener('input', () => {
    sendBtn.classList.toggle('active', input.value.trim().length > 0);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendComment(); }
  });

  sendBtn.addEventListener('click', sendComment);

  async function sendComment() {
    const text = input.value.trim();
    if (!text || _sending) return;
    _sending = true;
    input.value = '';
    sendBtn.classList.remove('active');

    try {
      const comment = await apiAddComment(postId, text);
      const listEl = section.querySelector(`#comment-list-${postId}`);
      // Remove empty state if present
      listEl.querySelector('.comments-empty')?.remove();
      listEl.appendChild(renderCommentItem(comment));
      listEl.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // Update comment count on card
      const countEl = document.querySelector(`[data-post-id="${postId}"] .comment-count-label`);
      if (countEl) {
        const n = parseInt(countEl.textContent) + 1;
        countEl.textContent = n;
      }
    } catch (err) {
      alert(err.message);
      input.value = text;
    } finally {
      _sending = false;
    }
  }

  // Auto-load when opened
  const observer = new MutationObserver(() => {
    if (section.classList.contains('open') && !_loaded) loadComments();
  });
  observer.observe(section, { attributes: true, attributeFilter: ['class'] });

  return section;
}

// ─── Post Card ───────────────────────────────────────────────────────────────

function renderPostCard(post) {
  const myId  = getCurrentUserId();
  const isOwn = myId && post.user_id === myId;

  const wrapper = document.createElement('div');
  wrapper.dataset.postId = post.id;

  const card = document.createElement('div');
  card.className = 'post-card';

  const images = post.image_url ? [`${API_BASE_URL}${post.image_url}`] : [];
  const MAX_VISIBLE = 3;

  const imageGridHtml = images.length > 0 ? `
    <div class="post-image-grid">
      ${images.slice(0, MAX_VISIBLE).map((url, i) => `
        <div class="post-image-thumb" data-img-idx="${i}">
          <img src="${url}" alt="foto" loading="lazy" />
          ${i === MAX_VISIBLE - 1 && images.length > MAX_VISIBLE
            ? `<div class="img-count-badge">+${images.length - MAX_VISIBLE}</div>` : ''}
        </div>
      `).join('')}
    </div>
  ` : '';

  const menuHtml = isOwn
    ? `<div style="position:relative"><button class="post-menu-btn" data-action="menu">···</button></div>`
    : '';

  const likeCount    = post.like_count    || 0;
  const commentCount = post.comment_count || 0;

  card.innerHTML = `
    <div class="post-header">
      <div class="post-avatar">${avatarInitial(post.user_name)}</div>
      <div class="post-user-info">
        <span class="post-user-name">${escapeHtml(post.user_name || 'Pengguna')}</span>
        <div class="post-meta">
          ${post.skin_type ? `<span class="post-skin-badge">${escapeHtml(post.skin_type)}</span>` : ''}
          <span class="post-time">${timeAgo(post.created_at)}</span>
        </div>
      </div>
      ${menuHtml}
    </div>
    ${post.content ? `<div class="post-content">${escapeHtml(post.content)}</div>` : ''}
    ${imageGridHtml}
    ${likeCount > 0 || commentCount > 0 ? `
  <div class="post-stats">
    <div class="post-stats-likes">
      ${likeCount > 0 ? `
        <span class="post-stats-likes-icon">
          <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </span>
        <span class="like-stats-count">${likeCount}</span>
      ` : ''}
    </div>
    ${commentCount > 0 ? `
      <span class="post-stats-comment">
        <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        <span class="comment-count-label">${commentCount}</span> komentar
      </span>
    ` : ''}
  </div>` : '<div class="post-stats" style="display:none"></div>'}
    <div class="post-footer">
      <button class="like-btn ${post.liked_by_me ? 'liked' : ''}" data-action="like">
        ${HEART_SVG} Suka
      </button>
      <button class="comment-toggle-btn" data-action="comment">
        ${COMMENT_SVG} Komentar
      </button>
    </div>
  `;

  // Image grid → lightbox
  if (images.length > 0) {
    card.querySelectorAll('.post-image-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        openLightbox(images, parseInt(thumb.dataset.imgIdx) || 0);
      });
    });
  }

  // Like
  card.querySelector('[data-action="like"]').addEventListener('click', async (btn_e) => {
    const btn = btn_e.currentTarget;
    const wasLiked = btn.classList.contains('liked');
    btn.classList.toggle('liked');

    // Update stats row
    const statsLike = card.querySelector('.like-stats-count');
    const statsRow  = card.querySelector('.post-stats');
    if (statsLike) {
      const n = wasLiked ? Math.max(0, parseInt(statsLike.textContent) - 1) : parseInt(statsLike.textContent) + 1;
      statsLike.textContent = n;
      if (n === 0 && !card.querySelector('.comment-count-label')) {
        statsRow.style.display = 'none';
      }
    }

    try {
      const result = await apiToggleLike(post.id);
      // sync
      if (statsLike) statsLike.textContent = result.like_count;
      if (result.liked) btn.classList.add('liked'); else btn.classList.remove('liked');
      if (result.like_count > 0) statsRow.style.display = '';
    } catch {
      btn.classList.toggle('liked'); // revert
    }
  });

  // Toggle comment section
  card.querySelector('[data-action="comment"]').addEventListener('click', () => {
    const section = wrapper.querySelector('.comment-section');
    if (section) section.classList.toggle('open');
  });

  // Menu (delete)
  if (isOwn) {
    card.querySelector('[data-action="menu"]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.delete-popup').forEach(p => p.remove());
      const popup = document.createElement('div');
      popup.className = 'delete-popup';
      popup.innerHTML = `<button class="danger-action">🗑 Hapus Post</button>`;
      e.currentTarget.parentElement.appendChild(popup);
      popup.querySelector('button').addEventListener('click', async () => {
        popup.remove();
        if (!confirm('Hapus post ini?')) return;
        try {
          await apiDeletePost(post.id);
          wrapper.style.opacity = '0';
          wrapper.style.transition = 'opacity 0.2s';
          setTimeout(() => wrapper.remove(), 220);
        } catch (err) { alert(err.message); }
      });
      setTimeout(() => document.addEventListener('click', () => popup.remove(), { once: true }), 0);
    });
  }

  // Click avatar/name → user profile page
  const goToProfile = () => { if (post.user_id) window.location.hash = `#/user/${post.user_id}`; };
  card.querySelector('.post-avatar')?.addEventListener('click', (e) => { e.stopPropagation(); goToProfile(); });
  card.querySelector('.post-user-name')?.addEventListener('click', (e) => { e.stopPropagation(); goToProfile(); });

  // Click post content/header area → post detail page
  const clickTargets = [card.querySelector('.post-content')];
  clickTargets.forEach(el => {
    if (el) el.addEventListener('click', () => { window.location.hash = `#/post/${post.id}`; });
  });

  wrapper.appendChild(card);
  wrapper.appendChild(buildCommentSection(post.id, commentCount));
  return wrapper;
}

// ─── Feed Loading ────────────────────────────────────────────────────────────

async function loadFeed(reset = false) {
  if (_isLoading) return;
  if (!reset && !_hasMore) return;
  _isLoading = true;

  if (reset) {
    _page = 1; _posts = []; _hasMore = true;
    if (_postListEl) _postListEl.innerHTML = '';
  }

  const skeletons = renderSkeletons(3);
  if (_postListEl && _page === 1) skeletons.forEach(s => _postListEl.appendChild(s));

  try {
    const data = await apiFetchFeed(_page);
    skeletons.forEach(s => s.remove());
    _hasMore = data.has_more;
    _page++;

    if (data.posts.length === 0 && _posts.length === 0) { renderEmptyState(); return; }

    _posts.push(...data.posts);
    data.posts.forEach(post => { if (_postListEl) _postListEl.appendChild(renderPostCard(post)); });
    updateLoadMoreButton();
  } catch (err) {
    skeletons.forEach(s => s.remove());
    console.error('[Feed]', err);
    if (_postListEl && _posts.length === 0) renderEmptyState();
  } finally {
    _isLoading = false;
  }
}

function renderEmptyState() {
  if (!_postListEl) return;
  _postListEl.innerHTML = `
    <div class="feed-empty">
      <div class="feed-empty-icon" style="font-size:38px;margin-bottom:10px">💬</div>
      <h3 style="font-size:15px;margin:0 0 6px">Belum ada post</h3>
      <p style="font-size:13px;margin:0 0 16px;color:#65676b">Jadilah yang pertama berbagi tips &amp; pengalaman skincare!</p>
      <button class="feed-empty-btn" id="feed-empty-post-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="width:14px;height:14px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Buat Post
      </button>
    </div>
  `;
  document.getElementById('feed-empty-post-btn')?.addEventListener('click', openModal);
}

function updateLoadMoreButton() {
  document.getElementById('feed-load-more-wrap')?.remove();
  if (_hasMore && _postListEl) {
    const wrap = document.createElement('div');
    wrap.id = 'feed-load-more-wrap';
    wrap.className = 'feed-load-more';
    wrap.innerHTML = `<button class="feed-load-more-btn">Muat Lebih Banyak</button>`;
    wrap.querySelector('button').addEventListener('click', () => loadFeed());
    _postListEl.parentElement.appendChild(wrap);
  }
}

// ─── Create Post Modal ────────────────────────────────────────────────────────

function openModal() {
  if (_showModal) return;
  _showModal = true;
  _imageFile = null; _imagePreviewUrl = null;

  _overlayEl = document.createElement('div');
  _overlayEl.className = 'modal-overlay';

  _modalEl = document.createElement('div');
  _modalEl.className = 'create-post-modal';
  _modalEl.innerHTML = `
    <div class="modal-handle"></div>
    <div class="modal-header">
      <span class="modal-title">Buat Post</span>
      <button class="modal-close-btn" id="modal-close">✕</button>
    </div>
    <textarea class="post-textarea" id="post-content" placeholder="Apa yang sedang kamu pikirkan tentang skincare?" maxlength="1000"></textarea>
    <div class="char-count" id="char-count">0 / 1000</div>
    <div id="image-preview-container"></div>
    <div class="modal-actions">
      <label class="upload-photo-btn" for="post-photo-input">${CAMERA_SVG} Foto</label>
      <input type="file" id="post-photo-input" accept="image/*" style="display:none" />
      <button class="post-submit-btn" id="post-submit-btn" disabled>Posting</button>
    </div>
  `;

  _overlayEl.appendChild(_modalEl);
  document.body.appendChild(_overlayEl);

  document.getElementById('modal-close').addEventListener('click', closeModal);
  _overlayEl.addEventListener('click', (e) => { if (e.target === _overlayEl) closeModal(); });

  const textarea  = document.getElementById('post-content');
  const charCount = document.getElementById('char-count');
  const submitBtn = document.getElementById('post-submit-btn');

  textarea.addEventListener('input', () => {
    const len = textarea.value.length;
    charCount.textContent = `${len} / 1000`;
    charCount.classList.toggle('near-limit', len > 850);
    submitBtn.disabled = (!textarea.value.trim() && !_imageFile) || _submitting;
  });

  document.getElementById('post-photo-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    _imageFile = file;
    _imagePreviewUrl = URL.createObjectURL(file);
    const container = document.getElementById('image-preview-container');
    container.innerHTML = `
      <div class="image-preview-wrap">
        <img src="${_imagePreviewUrl}" class="post-image-preview" alt="preview" />
        <button class="remove-image-btn" id="remove-img-btn">✕</button>
      </div>
    `;
    document.getElementById('remove-img-btn').addEventListener('click', () => {
      _imageFile = null; _imagePreviewUrl = null; container.innerHTML = '';
      submitBtn.disabled = !textarea.value.trim() || _submitting;
    });
    submitBtn.disabled = _submitting;
  });

  submitBtn.addEventListener('click', submitPost);
  setTimeout(() => textarea.focus(), 80);
}

function closeModal() {
  if (!_showModal) return;
  _showModal = false;
  if (_overlayEl) _overlayEl.remove();
  _overlayEl = null; _modalEl = null;
  if (_imagePreviewUrl) URL.revokeObjectURL(_imagePreviewUrl);
}

async function submitPost() {
  if (_submitting) return;
  const textarea  = document.getElementById('post-content');
  const submitBtn = document.getElementById('post-submit-btn');
  const content   = textarea?.value.trim() || '';
  if (!content && !_imageFile) return;

  _submitting = true;
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Memposting…'; }

  try {
    let imageUrl = null;
    if (_imageFile) {
      const r = await apiUploadImage(_imageFile);
      imageUrl = r.image_url;
    }
    const newPost = await apiCreatePost(content, imageUrl);
    newPost.like_count = 0; newPost.liked_by_me = false; newPost.comment_count = 0;

    closeModal();
    if (_postListEl) {
      _postListEl.querySelector('.feed-empty')?.remove();
      const card = renderPostCard(newPost);
      _postListEl.insertBefore(card, _postListEl.firstChild);
    }
    _posts.unshift(newPost);
  } catch (err) {
    alert(err.message || 'Gagal memposting');
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Posting'; }
  } finally {
    _submitting = false;
  }
}

// ─── Main Render ──────────────────────────────────────────────────────────────

export function renderFeed() {
  _posts = []; _page = 1; _hasMore = true;
  _isLoading = false; _showModal = false;

  const page = document.createElement('div');
  page.className = 'feed-page';
  page.innerHTML = `
    <div class="feed-header">
      <div>
        <h1>B-Glow Community</h1>
        <div class="feed-header-sub">Berbagi tips & pengalaman skincare</div>
      </div>
      <button class="feed-create-btn" id="feed-create-btn">${PLUS_SVG} Post</button>
    </div>
    <div class="feed-list" id="feed-post-list"></div>
  `;

  _postListEl = page.querySelector('#feed-post-list');
  page.querySelector('#feed-create-btn').addEventListener('click', openModal);
  requestAnimationFrame(() => loadFeed(true));
  return page;
}

// ─── Profile Posts Section (exported for Profile page) ────────────────────────

export async function renderMyPosts(containerEl) {
  if (!containerEl) return;

  const POST_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`;

  containerEl.innerHTML = `
    <div class="profile-posts-section">
      <div class="profile-posts-title">${POST_SVG} Post Saya</div>
      <div class="profile-posts-grid" id="my-posts-grid">
        ${Array.from({length:6}).map(() => `
          <div class="profile-post-thumb" style="background:#f0f2f5">
            <div class="skeleton-line" style="width:100%;height:100%;margin:0;border-radius:0"></div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  try {
    const res = await fetch(`${API_BASE_URL}/api/users/me/posts`, { headers: authHeaders() });
    const data = await res.json();
    const gridEl = containerEl.querySelector('#my-posts-grid');

    if (!data.posts || data.posts.length === 0) {
      gridEl.outerHTML = `<div class="profile-posts-empty">Belum ada post. <button style="color:#1877f2;background:none;border:none;cursor:pointer;font-weight:600" onclick="window.location.hash='#/feed'">Buat Post →</button></div>`;
      return;
    }

    gridEl.innerHTML = '';
    data.posts.forEach(p => {
      const thumb = document.createElement('div');
      if (p.image_url) {
        thumb.className = 'profile-post-thumb';
        thumb.innerHTML = `<img src="${API_BASE_URL}${p.image_url}" loading="lazy" alt="post" />`;
      } else {
        thumb.className = 'profile-post-thumb-text';
        thumb.innerHTML = `<p>${escapeHtml(p.content || '')}</p>`;
      }
      thumb.title = `${p.like_count || 0} suka · ${p.comment_count || 0} komentar`;
      thumb.addEventListener('click', () => { window.location.hash = '#/feed'; });
      gridEl.appendChild(thumb);
    });
  } catch (err) {
    console.warn('[Profile Posts]', err);
    containerEl.querySelector('#my-posts-grid').innerHTML = '<div class="profile-posts-empty">Gagal memuat post</div>';
  }
}
