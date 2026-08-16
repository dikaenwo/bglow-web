import { API_BASE_URL } from '../config.js';

function getAuthToken() {
  try {
    const u = JSON.parse(localStorage.getItem('bglow_user') || '{}');
    return u.token || localStorage.getItem('bglow_token') || null;
  } catch { return localStorage.getItem('bglow_token') || null; }
}

function getCurrentUserName() {
  try { return JSON.parse(localStorage.getItem('bglow_user') || '{}').name || 'Saya'; } catch { return 'Saya'; }
}

const authH = () => ({ Authorization: `Bearer ${getAuthToken()}` });

// Parse image_url: single string OR JSON array "[...]"
function parseImageUrls(imageUrl) {
  if (!imageUrl) return [];
  if (imageUrl.startsWith('[')) {
    try { return JSON.parse(imageUrl).map(u => `${API_BASE_URL}${u}`); } catch { return []; }
  }
  return [`${API_BASE_URL}${imageUrl}`];
}

function timeAgo(iso) {
  if (!iso) return '';
  const d = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (d < 60) return 'Baru saja';
  if (d < 3600) return `${Math.floor(d / 60)}m`;
  if (d < 86400) return `${Math.floor(d / 3600)}j`;
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function initial(n) { return (n || '?').trim().charAt(0).toUpperCase(); }

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const BACK = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;
const SEND = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
const COMMENT_SVG = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`;

// ── Reply state ──
let _replyTo = null; // { id, user_name }

// ── Build one comment element (with like + reply) ──
function buildCommentEl(c, { onReply, onLike, isReply = false }) {
  const el = document.createElement('div');
  el.dataset.commentId = c.id;
  el.style.cssText = `
    display:flex; gap:8px;
    margin-bottom:${isReply ? '10px' : '14px'};
    ${isReply ? 'margin-left:38px;' : ''}
    animation: feedSlideIn 0.22s ease;
  `;

  const avatarSize = isReply ? 28 : 34;
  const nameFz    = isReply ? '12px' : '13px';
  const textFz    = isReply ? '13px' : '14px';

  el.innerHTML = `
    <div style="width:${avatarSize}px;height:${avatarSize}px;border-radius:50%;
      background:linear-gradient(135deg,#1877f2,#0ea5e9);
      display:flex;align-items:center;justify-content:center;
      font-size:${isReply ? '11px' : '13px'};font-weight:700;color:#fff;flex-shrink:0">
      ${initial(c.user_name)}
    </div>
    <div style="flex:1;min-width:0">
      <div style="background:#f0f2f5;border-radius:16px;padding:8px 13px;display:inline-block;max-width:100%">
        <div style="font-size:${nameFz};font-weight:700;color:#050505;margin-bottom:2px">
          ${esc(c.user_name || 'Pengguna')}
        </div>
        <div style="font-size:${textFz};color:#050505;line-height:1.45;word-break:break-word">
          ${c.content.startsWith('@') ? `<span style="color:#1877f2;font-weight:600">${esc(c.content.split(' ')[0])}</span> ${esc(c.content.split(' ').slice(1).join(' '))}` : esc(c.content)}
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;margin-top:4px;padding-left:4px">
        <span style="font-size:11px;color:#65676b">${timeAgo(c.created_at)}</span>
        <button class="cl-like-btn" data-liked="${c.liked_by_me ? '1' : '0'}" data-count="${c.like_count || 0}"
          style="background:none;border:none;font-size:12px;font-weight:700;cursor:pointer;
            color:${c.liked_by_me ? '#e41e3f' : '#65676b'};display:flex;align-items:center;gap:3px;padding:0">
          <svg viewBox="0 0 24 24" width="13" height="13"
            fill="${c.liked_by_me ? '#e41e3f' : 'none'}"
            stroke="${c.liked_by_me ? '#e41e3f' : 'currentColor'}" stroke-width="2">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <span class="cl-like-count">${c.like_count > 0 ? c.like_count : ''}</span>
        </button>
        ${!isReply ? `<button class="cl-reply-btn"
          style="background:none;border:none;font-size:12px;font-weight:700;
            color:#65676b;cursor:pointer;padding:0">Balas</button>` : ''}
      </div>
      <div class="replies-container"></div>
    </div>
  `;

  // Like
  const likeBtn = el.querySelector('.cl-like-btn');
  likeBtn?.addEventListener('click', () => onLike(c.id, likeBtn));

  // Reply
  const replyBtn = el.querySelector('.cl-reply-btn');
  replyBtn?.addEventListener('click', () => onReply(c));

  // Render nested replies
  if (c.replies && c.replies.length > 0) {
    const repliesContainer = el.querySelector('.replies-container');
    c.replies.forEach(r => {
      repliesContainer.appendChild(buildCommentEl(r, { onReply, onLike, isReply: true }));
    });
  }

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

  // ── Body ──
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

  // ── Fixed bottom input bar ──
  const myName = getCurrentUserName();
  const inputBar = document.createElement('div');
  inputBar.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #e4e6ea;z-index:50';

  // Reply context strip
  const replyStrip = document.createElement('div');
  replyStrip.id = 'reply-strip';
  replyStrip.style.cssText = 'display:none;align-items:center;justify-content:space-between;padding:6px 14px 0;font-size:12px;color:#1877f2;font-weight:600';
  replyStrip.innerHTML = `
    <span id="reply-strip-label">Membalas komentar</span>
    <button id="cancel-reply-btn" style="background:none;border:none;color:#65676b;font-size:18px;cursor:pointer;line-height:1;padding:0">✕</button>
  `;

  const inputRow = document.createElement('div');
  inputRow.style.cssText = 'display:flex;align-items:center;gap:8px;padding:10px 14px 24px';
  inputRow.innerHTML = `
    <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#1877f2,#0ea5e9);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;flex-shrink:0">${initial(myName)}</div>
    <div style="flex:1;background:#f0f2f5;border-radius:22px;display:flex;align-items:center;padding:10px 14px;gap:8px">
      <input id="pd-comment-input" type="text" placeholder="Tulis komentar…" maxlength="500"
        style="flex:1;background:none;border:none;outline:none;font-size:14px;color:#050505;font-family:inherit" />
      <button id="pd-send-btn" style="background:none;border:none;color:#1877f2;cursor:pointer;display:flex;align-items:center;opacity:0.4;transition:opacity 0.2s">${SEND}</button>
    </div>
  `;

  inputBar.appendChild(replyStrip);
  inputBar.appendChild(inputRow);
  page.appendChild(inputBar);

  const commentInput = inputRow.querySelector('#pd-comment-input');
  const sendBtn      = inputRow.querySelector('#pd-send-btn');

  // Cancel reply
  replyStrip.querySelector('#cancel-reply-btn').addEventListener('click', () => {
    _replyTo = null;
    replyStrip.style.display = 'none';
    commentInput.placeholder = 'Tulis komentar…';
    commentInput.value = '';
  });

  // ── Callbacks for comment actions ──
  function onReply(c) {
    _replyTo = { id: c.id, user_name: c.user_name };
    replyStrip.style.display = 'flex';
    replyStrip.querySelector('#reply-strip-label').textContent = `Membalas ${c.user_name}`;
    commentInput.placeholder = `@${c.user_name} `;
    commentInput.value = `@${c.user_name} `;
    commentInput.focus();
    sendBtn.style.opacity = '1';
  }

  async function onLike(commentId, btn) {
    const wasLiked = btn.dataset.liked === '1';
    const newLiked = !wasLiked;
    btn.dataset.liked = newLiked ? '1' : '0';
    const svg = btn.querySelector('svg');
    const countEl = btn.querySelector('.cl-like-count');
    const newColor = newLiked ? '#e41e3f' : '#65676b';
    btn.style.color = newColor;
    svg.style.fill = newLiked ? '#e41e3f' : 'none';
    svg.style.stroke = newColor;
    let cnt = parseInt(btn.dataset.count || 0);
    cnt = newLiked ? cnt + 1 : Math.max(0, cnt - 1);
    btn.dataset.count = cnt;
    countEl.textContent = cnt > 0 ? cnt : '';
    try {
      const r = await fetch(`${API_BASE_URL}/api/comments/${commentId}/like`, { method: 'POST', headers: authH() });
      const data = await r.json();
      btn.dataset.count = data.like_count;
      countEl.textContent = data.like_count > 0 ? data.like_count : '';
    } catch {
      // revert
      btn.dataset.liked = wasLiked ? '1' : '0';
    }
  }

  // ── Load post & comments ──
  let commentListEl = null;

  (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}`, { headers: authH() });
      if (!res.ok) { body.innerHTML = '<div style="text-align:center;padding:40px;color:#65676b">Post tidak ditemukan</div>'; return; }
      const post = await res.json();

      const images = parseImageUrls(post.image_url);
      // Carousel: show 1 image + swipe
      const carouselId = 'pd-carousel-' + postId;
      const imageHtml = images.length > 0 ? `
        <div id="${carouselId}" style="position:relative;border-radius:14px;overflow:hidden;margin:8px 0 12px;background:#000;touch-action:pan-y">
          <div class="pd-slides" style="display:flex;transition:transform 0.3s ease;will-change:transform">
            ${images.map(url => `
              <div style="min-width:100%;flex-shrink:0">
                <img src="${url}" style="width:100%;max-height:340px;object-fit:contain;display:block;background:#111" loading="lazy" />
              </div>`).join('')}
          </div>
          ${images.length > 1 ? `
            <div style="position:absolute;bottom:8px;left:50%;transform:translateX(-50%);display:flex;gap:5px;z-index:2">
              ${images.map((_, i) => `<span class="pd-dot" data-i="${i}" style="width:6px;height:6px;border-radius:50%;background:${i === 0 ? '#fff' : 'rgba(255,255,255,0.45)'};transition:background 0.2s"></span>`).join('')}
            </div>
            <div style="position:absolute;top:8px;right:10px;background:rgba(0,0,0,0.45);color:#fff;font-size:11px;font-weight:700;padding:3px 8px;border-radius:12px;z-index:2" class="pd-counter">1 / ${images.length}</div>
          ` : ''}
        </div>` : '';

      body.innerHTML = `
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
          ${post.like_count > 0 || post.comment_count > 0 ? `
          <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px;color:#65676b;border-bottom:1px solid #e4e6ea">
            <span>${post.like_count > 0 ? `❤️ ${post.like_count} suka` : ''}</span>
            <span>${post.comment_count > 0 ? `${post.comment_count} komentar` : ''}</span>
          </div>` : ''}
          <div style="display:flex;border-top:1px solid #f0f2f5;padding-top:4px">
            <button id="pd-like-btn" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;background:none;border:none;padding:9px;cursor:pointer;border-radius:6px;font-size:13.5px;font-weight:600;color:${post.liked_by_me ? '#1877f2' : '#65676b'};transition:background 0.15s">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="${post.liked_by_me ? '#1877f2' : 'none'}" stroke="${post.liked_by_me ? '#1877f2' : 'currentColor'}" stroke-width="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              Suka
            </button>
            <button id="pd-comment-focus-btn" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;background:none;border:none;padding:9px;cursor:pointer;border-radius:6px;font-size:13.5px;font-weight:600;color:#65676b;transition:background 0.15s">
              ${COMMENT_SVG} Komentar
            </button>
          </div>
        </div>
        <div style="background:#fff;padding:14px 16px 80px">
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

      // ── Touch Carousel Init ──
      if (images.length > 1) {
        const carouselEl = body.querySelector(`#${carouselId}`);
        const slidesEl   = carouselEl?.querySelector('.pd-slides');
        const dots       = carouselEl?.querySelectorAll('.pd-dot');
        const counter    = carouselEl?.querySelector('.pd-counter');
        if (carouselEl && slidesEl) {
          let cur = 0;
          const goTo = (idx) => {
            cur = Math.max(0, Math.min(idx, images.length - 1));
            slidesEl.style.transform = `translateX(-${cur * 100}%)`;
            dots?.forEach((d, i) => d.style.background = i === cur ? '#fff' : 'rgba(255,255,255,0.45)');
            if (counter) counter.textContent = `${cur + 1} / ${images.length}`;
          };
          // Touch
          let tx0 = 0;
          carouselEl.addEventListener('touchstart', e => { tx0 = e.touches[0].clientX; }, { passive: true });
          carouselEl.addEventListener('touchend', e => {
            const dx = e.changedTouches[0].clientX - tx0;
            if (Math.abs(dx) > 40) goTo(cur + (dx < 0 ? 1 : -1));
          }, { passive: true });
          // Tap on image → fullscreen lightbox
          carouselEl.querySelectorAll('img').forEach((img, i) => {
            img.addEventListener('click', () => {
              const lb = document.createElement('div');
              lb.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:9999;display:flex;align-items:center;justify-content:center;touch-action:pan-y';
              lb.innerHTML = `<img src="${images[i]}" style="max-width:100vw;max-height:90vh;object-fit:contain" /><button style="position:absolute;top:14px;right:14px;background:rgba(255,255,255,0.15);border:none;color:#fff;width:36px;height:36px;border-radius:50%;font-size:18px;cursor:pointer">✕</button>`;
              lb.querySelector('button').addEventListener('click', () => lb.remove());
              lb.addEventListener('click', e => { if (e.target === lb) lb.remove(); });
              document.body.appendChild(lb);
            });
          });
        }
      } else if (images.length === 1) {
        // Single image tap → fullscreen
        body.querySelector(`#${carouselId} img`)?.addEventListener('click', () => {
          const lb = document.createElement('div');
          lb.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:9999;display:flex;align-items:center;justify-content:center';
          lb.innerHTML = `<img src="${images[0]}" style="max-width:100vw;max-height:90vh;object-fit:contain" /><button style="position:absolute;top:14px;right:14px;background:rgba(255,255,255,0.15);border:none;color:#fff;width:36px;height:36px;border-radius:50%;font-size:18px;cursor:pointer">✕</button>`;
          lb.querySelector('button').addEventListener('click', () => lb.remove());
          lb.addEventListener('click', e => { if (e.target === lb) lb.remove(); });
          document.body.appendChild(lb);
        });
      }

      // Profile nav
      const goToProfile = () => { window.location.hash = `#/user/${post.user_id}`; };
      body.querySelector('#pd-avatar')?.addEventListener('click', goToProfile);
      body.querySelector('#pd-author-name')?.addEventListener('click', goToProfile);

      // Post like
      let liked = post.liked_by_me;
      const likeBtn = body.querySelector('#pd-like-btn');
      likeBtn?.addEventListener('click', async () => {
        liked = !liked;
        likeBtn.style.color = liked ? '#1877f2' : '#65676b';
        likeBtn.querySelector('svg').setAttribute('fill', liked ? '#1877f2' : 'none');
        likeBtn.querySelector('svg').setAttribute('stroke', liked ? '#1877f2' : 'currentColor');
        try { await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, { method: 'POST', headers: authH() }); }
        catch { liked = !liked; }
      });

      // Focus comment btn
      body.querySelector('#pd-comment-focus-btn')?.addEventListener('click', () => commentInput.focus());

      // Load comments
      commentListEl = body.querySelector('#pd-comment-list');
      await loadComments();

    } catch (err) {
      body.innerHTML = `<div style="text-align:center;padding:40px;color:#65676b">Gagal memuat post: ${err.message}</div>`;
    }
  })();

  async function loadComments() {
    if (!commentListEl) return;
    try {
      const cRes = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, { headers: authH() });
      const cData = await cRes.json();
      commentListEl.innerHTML = '';
      if (!cData.comments || cData.comments.length === 0) {
        commentListEl.innerHTML = '<div style="text-align:center;padding:20px;color:#65676b;font-size:13.5px">Belum ada komentar. Jadilah yang pertama!</div>';
      } else {
        cData.comments.forEach(c => {
          commentListEl.appendChild(buildCommentEl(c, { onReply, onLike }));
        });
      }
    } catch {
      if (commentListEl) commentListEl.innerHTML = '<div style="text-align:center;padding:20px;color:#65676b">Gagal memuat komentar</div>';
    }
  }

  // Input handlers
  commentInput.addEventListener('input', () => {
    sendBtn.style.opacity = commentInput.value.trim() ? '1' : '0.4';
  });
  commentInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); }
  });
  sendBtn.addEventListener('click', doSend);

  let _sending = false;

  async function doSend() {
    const text = commentInput.value.trim();
    if (!text || _sending) return;
    _sending = true;

    const savedText  = text;
    const savedReplyTo = _replyTo;

    commentInput.value = '';
    sendBtn.style.opacity = '0.4';
    replyStrip.style.display = 'none';
    _replyTo = null;

    try {
      const payload = { content: savedText };
      if (savedReplyTo) payload.parent_id = savedReplyTo.id;

      const res = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authH() },
        body: JSON.stringify(payload)
      });

      const c = await res.json();
      if (!res.ok) throw new Error(c.detail || `Server error ${res.status}`);

      if (!commentListEl) return;
      commentListEl.querySelector('div[style*="text-align:center"]')?.remove();

      if (savedReplyTo) {
        const parentEl = commentListEl.querySelector(`[data-comment-id="${savedReplyTo.id}"]`);
        const container = parentEl?.querySelector('.replies-container');
        if (container) {
          container.appendChild(buildCommentEl(c, { onReply, onLike, isReply: true }));
          container.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          commentListEl.appendChild(buildCommentEl(c, { onReply, onLike }));
          commentListEl.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      } else {
        commentListEl.appendChild(buildCommentEl(c, { onReply, onLike }));
        commentListEl.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } catch (err) {
      // restore input on failure
      commentInput.value = savedText;
      sendBtn.style.opacity = commentInput.value.trim() ? '1' : '0.4';
      alert('Gagal kirim komentar: ' + err.message);
    } finally {
      _sending = false;
    }
  }

  return page;
}
