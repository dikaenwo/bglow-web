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

const HEART_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
</svg>`;

const CAMERA_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>
</svg>`;

const PLUS_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
</svg>`;

// ─── State ───────────────────────────────────────────────────────────────────

let _posts = [];
let _page  = 1;
let _hasMore = true;
let _isLoading = false;
let _showModal = false;
let _imageFile  = null;
let _imagePreviewUrl = null;
let _submitting = false;
let _postListEl = null;
let _modalEl    = null;
let _overlayEl  = null;

// ─── API Calls ───────────────────────────────────────────────────────────────

async function apiFetchFeed(page = 1) {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/api/feed?page=${page}&limit=20`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function apiCreatePost(content, imageUrl) {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ content, image_url: imageUrl || null })
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.detail || 'Gagal membuat post');
  }
  return res.json();
}

async function apiDeletePost(postId) {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Gagal menghapus post');
}

async function apiToggleLike(postId) {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Gagal toggle like');
  return res.json();
}

async function apiUploadImage(file) {
  const token = getAuthToken();
  const form = new FormData();
  form.append('image', file);
  const res = await fetch(`${API_BASE_URL}/api/upload/image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.detail || 'Gagal upload foto');
  }
  return res.json();
}

// ─── Render Helpers ──────────────────────────────────────────────────────────

function renderSkeletons(count = 3) {
  return Array.from({ length: count }).map(() => {
    const el = document.createElement('div');
    el.className = 'post-skeleton';
    el.innerHTML = `
      <div style="display:flex;gap:10px;align-items:center;margin-bottom:12px">
        <div class="skeleton-avatar"></div>
        <div style="flex:1"><div class="skeleton-line" style="width:40%;height:13px"></div><div class="skeleton-line" style="width:25%;height:10px;margin-top:6px"></div></div>
      </div>
      <div class="skeleton-line" style="width:100%"></div>
      <div class="skeleton-line" style="width:85%"></div>
      <div class="skeleton-line" style="width:60%;margin-bottom:0"></div>
    `;
    return el;
  });
}

function renderPostCard(post) {
  const myId = getCurrentUserId();
  const isOwn = myId && post.user_id === myId;
  const card = document.createElement('div');
  card.className = 'post-card';
  card.dataset.postId = post.id;

  const imageHtml = post.image_url
    ? `<img src="${API_BASE_URL}${post.image_url}" alt="Post image" class="post-image" loading="lazy" />`
    : '';

  const menuHtml = isOwn
    ? `<div style="position:relative">
         <button class="post-menu-btn" data-action="menu">···</button>
       </div>`
    : '';

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
    ${imageHtml}
    <div class="post-footer">
      <button class="like-btn ${post.liked_by_me ? 'liked' : ''}" data-action="like">
        ${HEART_SVG}
        <span class="like-count">${post.like_count || 0}</span>
      </button>
    </div>
  `;

  // Like button
  card.querySelector('[data-action="like"]').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const countEl = btn.querySelector('.like-count');
    const wasLiked = btn.classList.contains('liked');

    // Optimistic update
    btn.classList.toggle('liked');
    btn.querySelector('svg').classList.add('like-pulse'); // trigger animation
    countEl.textContent = wasLiked
      ? Math.max(0, parseInt(countEl.textContent) - 1)
      : parseInt(countEl.textContent) + 1;

    try {
      const result = await apiToggleLike(post.id);
      countEl.textContent = result.like_count;
      if (result.liked) {
        btn.classList.add('liked');
      } else {
        btn.classList.remove('liked');
      }
    } catch {
      // Revert on error
      btn.classList.toggle('liked');
      countEl.textContent = wasLiked
        ? parseInt(countEl.textContent) + 1
        : Math.max(0, parseInt(countEl.textContent) - 1);
    }
  });

  // Menu button (delete)
  if (isOwn) {
    const menuBtn = card.querySelector('[data-action="menu"]');
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Remove any existing popup
      document.querySelectorAll('.delete-popup').forEach(p => p.remove());

      const popup = document.createElement('div');
      popup.className = 'delete-popup';
      popup.innerHTML = `<button class="danger-action">🗑 Hapus Post</button>`;
      menuBtn.parentElement.appendChild(popup);

      popup.querySelector('button').addEventListener('click', async () => {
        popup.remove();
        if (!confirm('Hapus post ini?')) return;
        try {
          await apiDeletePost(post.id);
          card.style.animation = 'feedSlideIn 0.2s ease reverse';
          setTimeout(() => card.remove(), 200);
        } catch (err) {
          alert(err.message);
        }
      });

      // Close on outside click
      setTimeout(() => {
        document.addEventListener('click', () => popup.remove(), { once: true });
      }, 0);
    });
  }

  return card;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Load Feed ───────────────────────────────────────────────────────────────

async function loadFeed(reset = false) {
  if (_isLoading) return;
  if (!reset && !_hasMore) return;

  _isLoading = true;

  if (reset) {
    _page = 1;
    _posts = [];
    _hasMore = true;
    if (_postListEl) _postListEl.innerHTML = '';
  }

  // Show skeletons on first load
  const skeletons = renderSkeletons(3);
  if (_postListEl && _page === 1) skeletons.forEach(s => _postListEl.appendChild(s));

  try {
    const data = await apiFetchFeed(_page);
    skeletons.forEach(s => s.remove());

    _hasMore = data.has_more;
    _page++;

    if (data.posts.length === 0 && _posts.length === 0) {
      renderEmptyState();
      return;
    }

    _posts.push(...data.posts);
    data.posts.forEach(post => {
      if (_postListEl) _postListEl.appendChild(renderPostCard(post));
    });

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
      <div class="feed-empty-icon">🌸</div>
      <h3>Belum ada post</h3>
      <p>Jadilah yang pertama berbagi tips skincare!</p>
      <button class="feed-empty-btn" id="feed-empty-post-btn">${PLUS_SVG} Buat Post Pertama</button>
    </div>
  `;
  document.getElementById('feed-empty-post-btn')?.addEventListener('click', openModal);
}

function updateLoadMoreButton() {
  const existing = document.getElementById('feed-load-more-wrap');
  if (existing) existing.remove();

  if (_hasMore && _postListEl) {
    const wrap = document.createElement('div');
    wrap.id = 'feed-load-more-wrap';
    wrap.className = 'feed-load-more';
    wrap.innerHTML = `<button class="feed-load-more-btn">Muat Lebih Banyak</button>`;
    wrap.querySelector('button').addEventListener('click', () => loadFeed());
    _postListEl.parentElement.appendChild(wrap);
  }
}

// ─── Create Post Modal ───────────────────────────────────────────────────────

function openModal() {
  if (_showModal) return;
  _showModal = true;
  _imageFile = null;
  _imagePreviewUrl = null;

  _overlayEl = document.createElement('div');
  _overlayEl.className = 'modal-overlay';

  _modalEl = document.createElement('div');
  _modalEl.className = 'create-post-modal';
  _modalEl.innerHTML = `
    <div class="modal-handle"></div>
    <div class="modal-header">
      <span class="modal-title">✨ Buat Post Baru</span>
      <button class="modal-close-btn" id="modal-close">✕</button>
    </div>
    <textarea class="post-textarea" id="post-content" placeholder="Bagikan tips skincare, pengalaman, atau pertanyaan kamu…" maxlength="1000"></textarea>
    <div class="char-count" id="char-count">0 / 1000</div>
    <div id="image-preview-container"></div>
    <div class="modal-actions">
      <label class="upload-photo-btn" for="post-photo-input">
        ${CAMERA_SVG} Foto
      </label>
      <input type="file" id="post-photo-input" accept="image/*" style="display:none" />
      <button class="post-submit-btn" id="post-submit-btn" disabled>Posting</button>
    </div>
  `;

  _overlayEl.appendChild(_modalEl);
  document.body.appendChild(_overlayEl);

  // Close
  document.getElementById('modal-close').addEventListener('click', closeModal);
  _overlayEl.addEventListener('click', (e) => { if (e.target === _overlayEl) closeModal(); });

  // Char counter
  const textarea = document.getElementById('post-content');
  const charCount = document.getElementById('char-count');
  const submitBtn = document.getElementById('post-submit-btn');

  textarea.addEventListener('input', () => {
    const len = textarea.value.length;
    charCount.textContent = `${len} / 1000`;
    charCount.classList.toggle('near-limit', len > 850);
    const hasContent = textarea.value.trim().length > 0 || _imageFile;
    submitBtn.disabled = !hasContent || _submitting;
  });

  // Photo upload
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
      _imageFile = null;
      _imagePreviewUrl = null;
      container.innerHTML = '';
      const hasContent = textarea.value.trim().length > 0;
      submitBtn.disabled = !hasContent || _submitting;
    });

    const hasContent = textarea.value.trim().length > 0 || true; // image alone is fine
    submitBtn.disabled = !hasContent || _submitting;
  });

  // Submit
  submitBtn.addEventListener('click', submitPost);

  // Focus textarea
  setTimeout(() => textarea.focus(), 100);
}

function closeModal() {
  if (!_showModal) return;
  _showModal = false;
  if (_overlayEl) _overlayEl.remove();
  _overlayEl = null;
  _modalEl = null;
  if (_imagePreviewUrl) URL.revokeObjectURL(_imagePreviewUrl);
}

async function submitPost() {
  if (_submitting) return;
  const textarea = document.getElementById('post-content');
  const submitBtn = document.getElementById('post-submit-btn');
  const content = textarea ? textarea.value.trim() : '';

  if (!content && !_imageFile) return;

  _submitting = true;
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Memposting…'; }

  try {
    let imageUrl = null;

    // Upload foto jika ada
    if (_imageFile) {
      const uploadResult = await apiUploadImage(_imageFile);
      imageUrl = uploadResult.image_url;
    }

    const newPost = await apiCreatePost(content, imageUrl);
    newPost.like_count   = 0;
    newPost.liked_by_me  = false;

    closeModal();

    // Tambahkan ke atas feed
    if (_postListEl) {
      const emptyState = _postListEl.querySelector('.feed-empty');
      if (emptyState) emptyState.remove();

      const card = renderPostCard(newPost);
      card.style.animation = 'feedSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
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

// ─── Main Render ─────────────────────────────────────────────────────────────

export function renderFeed() {
  // Reset state
  _posts = [];
  _page = 1;
  _hasMore = true;
  _isLoading = false;
  _showModal = false;

  const page = document.createElement('div');
  page.className = 'feed-page';

  page.innerHTML = `
    <div class="feed-header">
      <div>
        <h1>Komunitas B-Glow ✨</h1>
        <div class="feed-header-sub">Berbagi tips & pengalaman skincare</div>
      </div>
      <button class="feed-create-btn" id="feed-create-btn">
        ${PLUS_SVG} Post
      </button>
    </div>
    <div class="feed-list" id="feed-post-list"></div>
  `;

  document.head.insertAdjacentHTML('beforeend', `<link rel="stylesheet" href="/src/styles/feed.css" />`);

  _postListEl = page.querySelector('#feed-post-list');

  page.querySelector('#feed-create-btn').addEventListener('click', openModal);

  // Load feed after render
  requestAnimationFrame(() => loadFeed(true));

  return page;
}
