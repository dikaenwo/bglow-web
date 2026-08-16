import { getUserId, getAuthHeaders, isPremium } from '../utils/store.js';
import { API_BASE_URL } from '../config.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
function initial(n) { return (n || 'U').charAt(0).toUpperCase(); }
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

// Upload helpers — NO Content-Type for FormData
function uploadOnlyAuthHeaders() {
  const token = localStorage.getItem('bglow_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}
async function doUploadFile(blob, filename = 'photo.jpg') {
  const fd = new FormData();
  fd.append('image', blob, filename);
  const res = await fetch(`${API_BASE_URL}/api/upload/image`, {
    method: 'POST',
    headers: uploadOnlyAuthHeaders(),
    body: fd
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Upload gagal (${res.status}) ${t.slice(0, 80)}`);
  }
  const { image_url } = await res.json();
  return image_url;
}
async function savePhotoField(userId, field, image_url) {
  const res = await fetch(`${API_BASE_URL}/api/user/${userId}`, {
    method: 'PUT',
    headers: { ...uploadOnlyAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ [field]: image_url })
  });
  if (!res.ok) throw new Error('Simpan gagal');
}
function showToast(msg, color = '#1877f2') {
  const t = document.createElement('div');
  t.style.cssText = `position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:${color};color:#fff;padding:10px 22px;border-radius:20px;font-size:13px;font-weight:600;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,0.25);transition:opacity 0.3s`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2500);
}

// ─── Circular Cropper ─────────────────────────────────────────────────────────
function openCircleCropper(file, onCropped) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:9000;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px';

  const title = document.createElement('div');
  title.style.cssText = 'color:#fff;font-size:15px;font-weight:700;margin-bottom:16px;text-align:center';
  title.textContent = 'Sesuaikan foto profil';

  const hint = document.createElement('div');
  hint.style.cssText = 'color:rgba(255,255,255,0.55);font-size:12px;margin-bottom:12px;text-align:center';
  hint.textContent = 'Geser & cubit untuk menyesuaikan';

  const SIZE = Math.min(window.innerWidth - 48, 300);
  const canvas = document.createElement('canvas');
  canvas.width = SIZE; canvas.height = SIZE;
  canvas.style.cssText = `width:${SIZE}px;height:${SIZE}px;border-radius:50%;border:3px solid #1877f2;touch-action:none;cursor:grab;box-shadow:0 0 0 9999px rgba(0,0,0,0.6)`;
  const ctx = canvas.getContext('2d');

  const img = new Image();
  img.onload = () => {
    let scale = SIZE / Math.min(img.naturalWidth, img.naturalHeight);
    let ox = (SIZE - img.naturalWidth * scale) / 2;
    let oy = (SIZE - img.naturalHeight * scale) / 2;

    const draw = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.save();
      ctx.beginPath();
      ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, ox, oy, img.naturalWidth * scale, img.naturalHeight * scale);
      ctx.restore();
    };
    draw();

    // Mouse drag
    let dragging = false, lx = 0, ly = 0;
    canvas.addEventListener('mousedown', e => { dragging = true; lx = e.clientX; ly = e.clientY; canvas.style.cursor = 'grabbing'; });
    window.addEventListener('mousemove', e => {
      if (!dragging) return;
      ox += e.clientX - lx; oy += e.clientY - ly;
      lx = e.clientX; ly = e.clientY; draw();
    });
    window.addEventListener('mouseup', () => { dragging = false; canvas.style.cursor = 'grab'; });

    // Touch drag + pinch zoom
    let ltx = 0, lty = 0, ld = 0;
    canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      if (e.touches.length === 1) { ltx = e.touches[0].clientX; lty = e.touches[0].clientY; }
      if (e.touches.length === 2) ld = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    }, { passive: false });
    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      if (e.touches.length === 1) {
        ox += e.touches[0].clientX - ltx; oy += e.touches[0].clientY - lty;
        ltx = e.touches[0].clientX; lty = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        const nd = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        const old = scale;
        scale = Math.max(SIZE / Math.max(img.naturalWidth, img.naturalHeight) * 0.5, Math.min(scale * (nd / ld), 5));
        ox -= (scale - old) * img.naturalWidth / 2;
        oy -= (scale - old) * img.naturalHeight / 2;
        ld = nd;
      }
      draw();
    }, { passive: false });

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:12px;margin-top:22px;width:100%;max-width:300px';

    const cancelBtn = document.createElement('button');
    cancelBtn.style.cssText = 'flex:1;padding:12px;border:1.5px solid rgba(255,255,255,0.25);border-radius:12px;background:transparent;color:#fff;font-size:14px;font-weight:700;cursor:pointer';
    cancelBtn.textContent = 'Batal';
    cancelBtn.onclick = () => overlay.remove();

    const saveBtn = document.createElement('button');
    saveBtn.style.cssText = 'flex:1;padding:12px;border:none;border-radius:12px;background:#1877f2;color:#fff;font-size:14px;font-weight:700;cursor:pointer';
    saveBtn.textContent = 'Simpan';
    saveBtn.onclick = () => {
      const out = document.createElement('canvas');
      out.width = 400; out.height = 400;
      const oc = out.getContext('2d');
      const f = 400 / SIZE;
      oc.save();
      oc.beginPath();
      oc.arc(200, 200, 200, 0, Math.PI * 2);
      oc.clip();
      oc.drawImage(img, ox * f, oy * f, img.naturalWidth * scale * f, img.naturalHeight * scale * f);
      oc.restore();
      out.toBlob(blob => { overlay.remove(); onCropped(blob); }, 'image/jpeg', 0.92);
    };

    btnRow.append(cancelBtn, saveBtn);
    overlay.append(title, hint, canvas, btnRow);
    document.body.appendChild(overlay);
  };
  img.src = URL.createObjectURL(file);
}

// ─── Settings Drawer ──────────────────────────────────────────────────────────
function openSettingsDrawer() {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;backdrop-filter:blur(2px)';
  const drawer = document.createElement('div');
  drawer.style.cssText = 'position:fixed;top:0;right:0;bottom:0;width:82%;max-width:320px;background:#0f172a;z-index:1001;box-shadow:-4px 0 32px rgba(0,0,0,0.4);display:flex;flex-direction:column;transform:translateX(100%);transition:transform 0.28s cubic-bezier(.4,0,.2,1)';
  const isPrem = isPremium();
  const style = document.createElement('style');
  style.textContent = `.dr2-item{display:flex;align-items:center;gap:12px;padding:14px 16px;cursor:pointer;transition:background 0.15s}.dr2-item:hover{background:rgba(255,255,255,0.06)}.dr2-item span{flex:1;font-size:14.5px;font-weight:500;color:#e2e8f0}.dr2-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}.dr2-sec{padding:14px 16px 4px;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.8px}`;
  drawer.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:18px 16px 14px;border-bottom:1px solid rgba(255,255,255,0.08)">
      <span style="font-size:17px;font-weight:800;color:#f1f5f9">Menu</span>
      <button id="dr2-close" style="background:rgba(255,255,255,0.08);border:none;color:#94a3b8;width:32px;height:32px;border-radius:50%;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center">✕</button>
    </div>
    <div style="flex:1;overflow-y:auto;padding:6px 0 20px">
      <div class="dr2-sec">Akun</div>
      <div class="dr2-item" id="dr2-edit"><div class="dr2-icon" style="background:rgba(59,130,246,0.2)"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#60a5fa" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div><span>Edit Profil</span><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#475569" stroke-width="2"><polyline points="9,18 15,12 9,6"/></svg></div>
      ${!isPrem ? `<div class="dr2-item" id="dr2-upgrade"><div class="dr2-icon" style="background:rgba(234,179,8,0.2)"><svg viewBox="0 0 24 24" width="17" height="17" fill="#fbbf24" stroke="#fbbf24" stroke-width="1"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.86L12 17.77l-6.18 3.23 1.18-6.86-5-4.87 6.91-1.01L12 2z"/></svg></div><span style="color:#fde68a">Upgrade ke Glow Plus</span><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#475569" stroke-width="2"><polyline points="9,18 15,12 9,6"/></svg></div>` : ''}
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
    </div>`;
  drawer.prepend(style);
  overlay.appendChild(drawer);
  document.body.appendChild(overlay);
  requestAnimationFrame(() => { drawer.style.transform = 'translateX(0)'; });
  const close = () => { drawer.style.transform = 'translateX(100%)'; setTimeout(() => overlay.remove(), 280); };
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
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

// ─── Post card renderer ───────────────────────────────────────────────────────
function renderPostCard(p, isLiked = false) {
  const imgs = parseImageUrls(p.image_url);
  const authorName = p.user_name || 'Saya';
  const av = authorName.charAt(0).toUpperCase();
  const imgHtml = imgs.length > 0 ? `
    <div style="margin-top:10px;border-radius:12px;overflow:hidden;border:1px solid #f0f2f5">
      ${imgs.length === 1
        ? `<img src="${imgs[0]}" style="width:100%;max-height:280px;object-fit:cover;display:block" loading="lazy" />`
        : `<div style="display:grid;grid-template-columns:repeat(${Math.min(imgs.length, 3)},1fr);gap:2px">${imgs.slice(0, 3).map(u => `<img src="${u}" style="width:100%;aspect-ratio:1;object-fit:cover;display:block" loading="lazy"/>`).join('')}</div>`
      }
    </div>` : '';
  const card = document.createElement('div');
  card.style.cssText = 'display:flex;gap:10px;padding:14px 16px;border-bottom:1px solid #f0f2f5;background:#fff;cursor:pointer;transition:background 0.15s';
  const userId = (() => { try { return JSON.parse(localStorage.getItem('bglow_user') || '{}').id || ''; } catch { return ''; } })();
  const myPhoto = p.profile_photo || localStorage.getItem('bglow_profile_photo_' + userId);
  card.innerHTML = `
    <div style="width:40px;height:40px;border-radius:50%;background:${myPhoto ? 'none' : 'linear-gradient(135deg,#1877f2,#0ea5e9)'};display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;color:#fff;flex-shrink:0;overflow:hidden">
      ${myPhoto ? `<img src="${API_BASE_URL}${myPhoto}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>` : av}
    </div>
    <div style="flex:1;min-width:0">
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
        <span style="font-size:14px;font-weight:700;color:#050505">${esc(authorName)}</span>
        ${p.skin_type ? `<span style="font-size:11px;padding:2px 7px;border-radius:20px;background:#EFF6FF;color:#1D4ED8;font-weight:600">${esc(p.skin_type)}</span>` : ''}
        <span style="font-size:12px;color:#65676b;margin-left:auto">${timeAgo(p.created_at)}</span>
      </div>
      ${p.content ? `<div style="font-size:14px;color:#050505;margin-top:5px;line-height:1.55;word-break:break-word;white-space:pre-wrap">${esc(p.content)}</div>` : ''}
      ${imgHtml}
      <div style="display:flex;gap:18px;margin-top:10px;color:#65676b;font-size:13px">
        <span style="display:flex;align-items:center;gap:4px">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="${isLiked ? '#e03131' : 'none'}" stroke="${isLiked ? '#e03131' : '#65676b'}" stroke-width="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          ${p.like_count || 0}
        </span>
        <span style="display:flex;align-items:center;gap:4px">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#65676b" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          ${p.comment_count || 0}
        </span>
      </div>
    </div>`;
  card.addEventListener('mouseover', () => card.style.background = '#f9fafb');
  card.addEventListener('mouseout', () => card.style.background = '#fff');
  card.addEventListener('click', () => { window.location.hash = `#/post/${p.id}`; });
  return card;
}

// ─── Main render ─────────────────────────────────────────────────────────────
export function renderProfile() {
  const page = document.createElement('div');
  page.className = 'page';
  page.style.background = '#f8fafc';

  const userId = getUserId();
  let userName = 'Pengguna B-Glow';
  let userEmail = '';
  try {
    const u = JSON.parse(localStorage.getItem('bglow_user') || '{}');
    if (u.name) userName = u.name;
    if (u.email) userEmail = u.email;
  } catch {}
  const skinType = localStorage.getItem('bglow_skin_type_' + userId) || '';

  // Scoped CSS
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .prof-banner { height:130px; background:linear-gradient(135deg,#0ea5e9 0%,#2563eb 45%,#7c3aed 100%); position:relative; }
    .prof-topbar { position:absolute;top:0;left:0;right:0; display:flex;align-items:center;justify-content:flex-end; padding:14px 14px 0; z-index:2; gap:8px; }
    .prof-topbar-btn { width:34px;height:34px;border-radius:50%; background:rgba(0,0,0,0.3);border:none;cursor:pointer; display:flex;align-items:center;justify-content:center; backdrop-filter:blur(4px); }
    .prof-avatar-wrap { position:absolute;bottom:-38px;left:16px;z-index:3; }
    .prof-avatar-circle { width:78px;height:78px;border-radius:50%; background:linear-gradient(135deg,#0ea5e9,#7c3aed); border:3px solid #fff; box-shadow:0 4px 16px rgba(0,0,0,0.2); display:flex;align-items:center;justify-content:center; font-size:30px;font-weight:800;color:#fff; overflow:hidden; }
    .prof-info-block { background:#fff; padding:52px 16px 16px; border-bottom:1px solid #f0f2f5; }
    .prof-name { font-size:19px;font-weight:800;color:#050505;line-height:1.2; }
    .prof-email { font-size:13px;color:#65676b;margin-top:2px; }
    .prof-badges { display:flex;flex-wrap:wrap;gap:6px;margin-top:10px; }
    .prof-badge { display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:600;padding:4px 11px;border-radius:20px; }
    .prof-stats-row { display:flex;gap:16px;margin-top:12px; }
    .prof-stat { cursor:pointer; }
    .prof-stat strong { font-size:14px;font-weight:800;color:#050505; }
    .prof-stat span { font-size:13px;color:#65676b;margin-left:3px; }
    .prof-edit-btn { margin-top:12px;width:100%;padding:8px;border:1.5px solid #dbdbdb;border-radius:20px; background:#fff;font-size:14px;font-weight:700;cursor:pointer;color:#050505;transition:background 0.15s; }
    .prof-edit-btn:hover { background:#f9fafb; }
    .prof-tabs-bar { display:flex;background:#fff;border-bottom:1px solid #f0f2f5;margin-top:8px; }
    .prof-tab { flex:1;padding:13px 0;border:none;background:none;font-size:14px;cursor:pointer;transition:all 0.2s; }
  `;
  page.appendChild(styleEl);

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="prof-banner" id="prof-banner">
      <div class="prof-topbar">
        <label for="cover-upload" class="prof-topbar-btn" style="cursor:pointer" title="Ganti foto sampul">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" stroke-width="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
        </label>
        <input type="file" id="cover-upload" accept="image/*" style="display:none" />
        <button class="prof-topbar-btn" id="prof-hamburger">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="prof-avatar-wrap">
        <div style="position:relative;display:inline-block">
          <div class="prof-avatar-circle" id="prof-avatar">${initial(userName)}</div>
          <label for="avatar-upload" style="position:absolute;bottom:2px;right:2px;width:26px;height:26px;border-radius:50%;background:#1877f2;border:2px solid #fff;display:flex;align-items:center;justify-content:center;cursor:pointer" title="Ganti foto profil">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#fff" stroke-width="2.5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
          </label>
          <input type="file" id="avatar-upload" accept="image/*" style="display:none" />
        </div>
      </div>
    </div>

    <div class="prof-info-block">
      <div class="prof-name" id="prof-name">${esc(userName)}</div>
      ${userEmail ? `<div class="prof-email">${esc(userEmail)}</div>` : ''}
      <div class="prof-badges" id="prof-badges">
        ${skinType ? `<span class="prof-badge" style="background:#EFF6FF;color:#1D4ED8">${esc(skinType)}</span>` : ''}
      </div>
      <div class="prof-stats-row">
        <div class="prof-stat"><strong id="prof-post-count">—</strong><span>Post</span></div>
        <div class="prof-stat"><strong id="prof-follower-count">—</strong><span>Pengikut</span></div>
        <div class="prof-stat"><strong id="prof-following-count">—</strong><span>Mengikuti</span></div>
      </div>
      <button class="prof-edit-btn" id="prof-edit-btn">Edit Profil</button>
    </div>

    <div class="prof-tabs-bar">
      <button class="prof-tab" id="tab-posts" style="font-weight:700;color:#1877f2;border-bottom:3px solid #1877f2">Post</button>
      <button class="prof-tab" id="tab-liked" style="font-weight:600;color:#65676b;border-bottom:3px solid transparent">Suka</button>
    </div>
    <div id="prof-tab-content"></div>
  `;
  page.appendChild(wrapper);

  setTimeout(() => {
    page.querySelector('#prof-hamburger')?.addEventListener('click', openSettingsDrawer);
    page.querySelector('#prof-edit-btn')?.addEventListener('click', () => { window.location.hash = '#/settings'; });

    // ── Avatar upload with circular crop ──
    page.querySelector('#avatar-upload')?.addEventListener('change', e => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = '';
      openCircleCropper(file, async (blob) => {
        showToast('Mengunggah foto profil…');
        try {
          const url = await doUploadFile(blob, 'avatar.jpg');
          await savePhotoField(userId, 'profile_photo', url);
          const av = page.querySelector('#prof-avatar');
          if (av) { av.style.background = 'none'; av.innerHTML = `<img src="${API_BASE_URL}${url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`; }
          localStorage.setItem('bglow_profile_photo_' + userId, url);
          showToast('✓ Foto profil diperbarui!', '#22c55e');
        } catch (err) { showToast('✗ ' + err.message, '#ef4444'); }
      });
    });

    // ── Cover photo upload ──
    page.querySelector('#cover-upload')?.addEventListener('change', async e => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = '';
      showToast('Mengunggah foto sampul…');
      try {
        const url = await doUploadFile(file, 'cover.jpg');
        await savePhotoField(userId, 'cover_photo', url);
        const banner = page.querySelector('#prof-banner');
        if (banner) banner.style.background = `url(${API_BASE_URL}${url}) center/cover no-repeat`;
        localStorage.setItem('bglow_cover_photo_' + userId, url);
        showToast('✓ Foto sampul diperbarui!', '#22c55e');
      } catch (err) { showToast('✗ ' + err.message, '#ef4444'); }
    });

    // ── Tabs ──
    const tabContent = page.querySelector('#prof-tab-content');
    const tabPosts = page.querySelector('#tab-posts');
    const tabLiked = page.querySelector('#tab-liked');

    async function loadTab(tab) {
      tabContent.innerHTML = `<div style="text-align:center;padding:32px;color:#65676b;font-size:14px">Memuat…</div>`;
      try {
        const url = tab === 'posts' ? `${API_BASE_URL}/api/users/me/posts` : `${API_BASE_URL}/api/users/me/liked`;
        const res = await fetch(url, { headers: getAuthHeaders() });
        const data = await res.json();
        const posts = data.posts || [];
        tabContent.innerHTML = '';
        if (posts.length === 0) {
          tabContent.innerHTML = `<div style="text-align:center;padding:48px 20px;color:#65676b;font-size:14px">${tab === 'posts' ? 'Belum ada postingan' : 'Belum ada post yang disukai'}</div>`;
          return;
        }
        posts.forEach(p => tabContent.appendChild(renderPostCard(p, tab === 'liked')));
        if (tab === 'posts') {
          const pc = page.querySelector('#prof-post-count');
          if (pc) pc.textContent = data.total ?? posts.length;
        }
      } catch {
        tabContent.innerHTML = `<div style="text-align:center;padding:32px;color:#e03131;font-size:13px">Gagal memuat postingan</div>`;
      }
    }

    function switchTab(tab) {
      tabPosts.style.color = tab === 'posts' ? '#1877f2' : '#65676b';
      tabPosts.style.fontWeight = tab === 'posts' ? '700' : '600';
      tabPosts.style.borderBottom = tab === 'posts' ? '3px solid #1877f2' : '3px solid transparent';
      tabLiked.style.color = tab === 'liked' ? '#1877f2' : '#65676b';
      tabLiked.style.fontWeight = tab === 'liked' ? '700' : '600';
      tabLiked.style.borderBottom = tab === 'liked' ? '3px solid #1877f2' : '3px solid transparent';
      loadTab(tab);
    }

    tabPosts?.addEventListener('click', () => switchTab('posts'));
    tabLiked?.addEventListener('click', () => switchTab('liked'));
    loadTab('posts');

    // ── Load API profile (photos + stats + badges) ──
    // Show cached photos instantly
    const cachedPhoto = localStorage.getItem('bglow_profile_photo_' + userId);
    const cachedCover = localStorage.getItem('bglow_cover_photo_' + userId);
    if (cachedPhoto) {
      const av = page.querySelector('#prof-avatar');
      if (av) { av.style.background = 'none'; av.innerHTML = `<img src="${API_BASE_URL}${cachedPhoto}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`; }
    }
    if (cachedCover) {
      const banner = page.querySelector('#prof-banner');
      if (banner) banner.style.background = `url(${API_BASE_URL}${cachedCover}) center/cover no-repeat`;
    }

    if (userId && userId !== 'guest') {
      (async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/users/${userId}/profile`, { headers: getAuthHeaders() });
          if (!res.ok) return;
          const data = await res.json();
          const u = data.user || {};

          const fc = page.querySelector('#prof-follower-count');
          const fw = page.querySelector('#prof-following-count');
          if (fc) fc.textContent = data.follower_count ?? 0;
          if (fw) fw.textContent = data.following_count ?? 0;

          if (u.name) { const el = page.querySelector('#prof-name'); if (el) el.textContent = u.name; }

          if (u.profile_photo) {
            const av = page.querySelector('#prof-avatar');
            if (av) { av.style.background = 'none'; av.innerHTML = `<img src="${API_BASE_URL}${u.profile_photo}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`; }
            localStorage.setItem('bglow_profile_photo_' + userId, u.profile_photo);
          }
          if (u.cover_photo) {
            const banner = page.querySelector('#prof-banner');
            if (banner) banner.style.background = `url(${API_BASE_URL}${u.cover_photo}) center/cover no-repeat`;
            localStorage.setItem('bglow_cover_photo_' + userId, u.cover_photo);
          }

          // Skin badges
          const badgesEl = page.querySelector('#prof-badges');
          if (badgesEl) {
            const st = u.skin_type || skinType;
            const sp = (u.skin_problems || '').split(',').filter(p => p.trim());
            const SC = { Berminyak: { bg: '#EFF6FF', c: '#1D4ED8' }, Normal: { bg: '#ECFDF5', c: '#065F46' }, Kombinasi: { bg: '#FFFBEB', c: '#92400E' }, Kering: { bg: '#FEF2F2', c: '#991B1B' } };
            const PC = { Jerawat: { bg: '#FEE2E2', c: '#DC2626' }, PIE: { bg: '#FCE7F3', c: '#DB2777' }, PIH: { bg: '#FDF4FF', c: '#9333EA' }, Kemerahan: { bg: '#FFF0F0', c: '#EF4444' }, Hiperpigmentasi: { bg: '#FFF7ED', c: '#EA580C' }, Aging: { bg: '#F5F3FF', c: '#7C3AED' } };
            const sc = SC[st] || { bg: '#F3F4F6', c: '#374151' };
            badgesEl.innerHTML = (st ? `<span class="prof-badge" style="background:${sc.bg};color:${sc.c}">${esc(st)}</span>` : '')
              + sp.map(p => { const c = PC[p.trim()] || { bg: '#F3F4F6', c: '#374151' }; return `<span class="prof-badge" style="background:${c.bg};color:${c.c}">${esc(p.trim())}</span>`; }).join('');
          }

          if (u.name || u.email) {
            const cached = JSON.parse(localStorage.getItem('bglow_user') || '{}');
            localStorage.setItem('bglow_user', JSON.stringify({ ...cached, ...(u.name && { name: u.name }), ...(u.email && { email: u.email }) }));
          }
        } catch (e) { console.error('Profile load error', e); }
      })();
    }
  }, 0);

  return page;
}
