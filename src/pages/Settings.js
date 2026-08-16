import { icons } from '../components/BottomNav.js';
import { clearUserData, getUserId, getAuthHeaders } from '../utils/store.js';
import { showCustomAlert, showCustomConfirm } from '../utils/helpers.js';
import { API_BASE_URL } from '../config.js';

export function renderSettings() {
  const page = document.createElement('div');
  page.className = 'page';

  page.innerHTML = `
    <style>
      .premium-select {
        appearance: none !important;
        -webkit-appearance: none !important;
        -moz-appearance: none !important;
        background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") !important;
        background-repeat: no-repeat !important;
        background-position: right 14px center !important;
        background-size: 16px !important;
        padding-right: 40px !important;
        cursor: pointer !important;
        background-color: white !important;
        font-family: inherit !important;
        transition: all 0.2s ease !important;
      }
      .premium-select:focus {
        border-color: var(--primary) !important;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        outline: none !important;
      }
    </style>
    <div class="page-header">
      <h1>Pengaturan</h1>
    </div>
    <div class="profile-menu">
      <div class="menu-section">
        <div class="menu-section-title">Aplikasi</div>
        <div class="menu-item anim-fade-in-up anim-delay-3" id="menu-edit-profile" style="cursor:pointer;">
          <div class="mi-icon blue">${icons.profile}</div>
          <span class="mi-text">Edit Profil</span>
          <span class="mi-arrow">${icons.chevronRight}</span>
        </div>
        <div class="menu-item anim-fade-in-up anim-delay-4" id="menu-privacy" style="cursor:pointer;">
          <div class="mi-icon green">${icons.shield}</div>
          <span class="mi-text">Privasi & Keamanan</span>
          <span class="mi-arrow">${icons.chevronRight}</span>
        </div>
        <div class="menu-item anim-fade-in-up anim-delay-5" id="menu-skin-profile" style="cursor:pointer;">
          <div class="mi-icon blue">${icons.droplet}</div>
          <span class="mi-text">Profil Kulit</span>
          <span class="mi-arrow">${icons.chevronRight}</span>
        </div>
        <div class="menu-item anim-fade-in-up anim-delay-5" id="menu-location-gps" style="cursor:pointer;">
          <div class="mi-icon amber" style="background:#FEF3C7; display:flex; align-items:center; justify-content:center;">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#D97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="10" r="3"/>
              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
            </svg>
          </div>
          <span class="mi-text">Akurasi Lokasi & GPS</span>
          <span class="mi-arrow">${icons.chevronRight}</span>
        </div>
      </div>

      <div class="menu-section">
        <div class="menu-section-title">Dukungan</div>
        <div class="menu-item anim-fade-in-up anim-delay-5" id="menu-rate-bglow" style="cursor:pointer;">
          <div class="mi-icon amber">${icons.star}</div>
          <span class="mi-text">Nilai B-Glow</span>
          <span class="mi-arrow">${icons.chevronRight}</span>
        </div>
        <div class="menu-item anim-fade-in-up anim-delay-6" id="menu-help" style="cursor:pointer;">
          <div class="mi-icon blue">${icons.info}</div>
          <span class="mi-text">Bantuan & Dukungan</span>
          <span class="mi-arrow">${icons.chevronRight}</span>
        </div>
        <div class="menu-item anim-fade-in-up anim-delay-7" id="logout-btn" style="cursor:pointer;">
          <div class="mi-icon red">${icons.logout}</div>
          <span class="mi-text" style="color:var(--danger);">Keluar</span>
          <span class="mi-arrow"></span>
        </div>
        <div class="menu-item anim-fade-in-up anim-delay-8" id="menu-delete-account" style="cursor:pointer;">
          <div class="mi-icon red" style="background:#FEE2E2; display:flex; align-items:center; justify-content:center;">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#DC2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </div>
          <span class="mi-text" style="color:var(--danger); font-weight:600;">Hapus Akun Permanen</span>
          <span class="mi-arrow"></span>
        </div>
      </div>
    </div>
    <div class="profile-version">B-Glow v1.0.0</div>
  `;

  // Attach Events
  setTimeout(() => {
    const logoutBtn = page.querySelector('#logout-btn');
    const editProfileBtn = page.querySelector('#menu-edit-profile');
    const skinProfileBtn = page.querySelector('#menu-skin-profile');
    const locationGpsBtn = page.querySelector('#menu-location-gps');
    const privacyBtn = page.querySelector('#menu-privacy');
    const rateBtn = page.querySelector('#menu-rate-bglow');
    const helpBtn = page.querySelector('#menu-help');

    if (locationGpsBtn) {
      locationGpsBtn.addEventListener('click', async () => {
        const { requestLocationWithPermission: reqLoc } = await import('../utils/geolocation.js');
        const pos = await reqLoc({ silent: false });
        if (pos && pos.lat !== null && pos.lon !== null) {
          showCustomAlert("Akurasi Lokasi dan GPS Anda berhasil diaktifkan secara otomatis! 📍", "Lokasi Aktif");
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        clearUserData();
        localStorage.setItem('bglow_auth', '0');
        localStorage.removeItem('bglow_user');
        localStorage.removeItem('bglow_token'); // Hapus JWT token saat logout
        window.location.hash = '#/login';
      });
    }

    if (editProfileBtn) {
      editProfileBtn.addEventListener('click', () => {
        openEditProfileModal();
      });
    }

    if (skinProfileBtn) {
      skinProfileBtn.addEventListener('click', () => {
        openSkinProfileModal();
      });
    }

    if (privacyBtn) {
      privacyBtn.addEventListener('click', () => {
        openPrivacyModal();
      });
    }

    if (rateBtn) {
      rateBtn.addEventListener('click', () => {
        openRateModal();
      });
    }

    const deleteAccountBtn = page.querySelector('#menu-delete-account');

    if (helpBtn) {
      helpBtn.addEventListener('click', () => {
        openHelpModal();
      });
    }

    if (deleteAccountBtn) {
      deleteAccountBtn.addEventListener('click', () => {
        openDeleteAccountModal();
      });
    }
  }, 0);

  function openDeleteAccountModal() {
    const userId = getUserId();
    if (!userId || userId === 'guest') {
      showCustomAlert("Akun guest tidak tersimpan di server.", "Informasi");
      return;
    }

    showCustomConfirm(
      "Apakah Anda yakin ingin menghapus akun B-Glow Anda secara permanen? Seluruh data riwayat kulit, diary, dan favorit Anda akan dihapus dari server dan tidak dapat dikembalikan.",
      async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/user/${userId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
          });
          const data = await res.json();
          if (res.ok) {
            clearUserData();
            localStorage.setItem('bglow_auth', '0');
            localStorage.removeItem('bglow_user');
            localStorage.removeItem('bglow_token');
            showCustomAlert("Akun Anda telah berhasil dihapus secara permanen.", "Akun Dihapus", () => {
              window.location.hash = '#/login';
            });
          } else {
            showCustomAlert(data.detail || "Gagal menghapus akun.", "Gagal Hapus Akun");
          }
        } catch (err) {
          console.error(err);
          showCustomAlert("Terjadi kesalahan jaringan saat menghapus akun.", "Koneksi Bermasalah");
        }
      },
      "⚠️ Hapus Akun Permanen"
    );
  }

  function openEditProfileModal() {
    const userId = getUserId();
    let userName = '';
    let userEmail = '';
    
    const userStr = localStorage.getItem('bglow_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userName = user.name || '';
        userEmail = user.email || '';
      } catch (e) {}
    }
    
    const overlay = document.createElement('div');
    overlay.className = 'diary-modal-overlay';
    overlay.innerHTML = `
      <div class="diary-modal" style="border-radius: var(--radius-lg) var(--radius-lg) 0 0;">
        <div class="modal-handle"></div>
        <div class="modal-title">Edit Profil</div>
        
        <div class="modal-field">
          <label>Nama Lengkap</label>
          <input type="text" id="edit-name" class="auth-input" value="${userName}" style="border: 1.5px solid var(--border); border-radius: var(--radius-md); padding: 12px; width: 100%; box-sizing: border-box;" />
        </div>
        
        <div class="modal-field">
          <label>Email</label>
          <input type="email" id="edit-email" class="auth-input" value="${userEmail}" style="border: 1.5px solid var(--border); border-radius: var(--radius-md); padding: 12px; width: 100%; box-sizing: border-box;" />
        </div>
        
        <div class="modal-actions" style="display:flex; gap:10px; margin-top:20px;">
          <button class="btn btn-outline" id="btn-cancel-edit" style="flex:1; padding: 12px; border-radius: var(--radius-md); font-weight:600; cursor:pointer;">Batal</button>
          <button class="btn btn-primary" id="btn-save-edit" style="flex:1; padding: 12px; border-radius: var(--radius-md); font-weight:600; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color:white; border:none; cursor:pointer;">Simpan</button>
        </div>
      </div>
    `;
    
    overlay.querySelector('#btn-cancel-edit').addEventListener('click', () => overlay.remove());
    
    overlay.querySelector('#btn-save-edit').addEventListener('click', async () => {
      const newName = overlay.querySelector('#edit-name').value.trim();
      const newEmail = overlay.querySelector('#edit-email').value.trim();
      
      if (!newName || !newEmail) {
        showCustomAlert("Nama dan email tidak boleh kosong!", "Validasi Gagal");
        return;
      }
      
      if (userId && userId !== 'guest') {
        try {
          overlay.querySelector('#btn-save-edit').textContent = 'Menyimpan...';
          overlay.querySelector('#btn-save-edit').disabled = true;
          
          const res = await fetch(`${API_BASE_URL}/api/user/${userId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ name: newName, email: newEmail })
          });
          
          if (res.ok) {
            const result = await res.json();
            localStorage.setItem('bglow_user', JSON.stringify({
              id: result.user.id,
              name: result.user.name,
              email: result.user.email
            }));
            showCustomAlert("Profil berhasil diperbarui!", "Profil Diperbarui", () => {
              overlay.remove();
              window.location.hash = '#/profile';
            });
          } else {
            const data = await res.json();
            showCustomAlert(data.detail || "Gagal memperbarui profil", "Gagal Memperbarui");
            overlay.querySelector('#btn-save-edit').textContent = 'Simpan';
            overlay.querySelector('#btn-save-edit').disabled = false;
          }
        } catch (err) {
          console.error(err);
          showCustomAlert("Gagal terhubung ke server. Pastikan backend menyala.", "Koneksi Bermasalah");
          overlay.querySelector('#btn-save-edit').textContent = 'Simpan';
          overlay.querySelector('#btn-save-edit').disabled = false;
        }
      } else {
        localStorage.setItem('bglow_user', JSON.stringify({ id: 'guest', name: newName, email: newEmail }));
        showCustomAlert("Profil (Guest) diperbarui!", "Profil Diperbarui", () => {
          overlay.remove();
          window.location.hash = '#/profile';
        });
      }
    });
    
    document.body.appendChild(overlay);
  }

  function openSkinProfileModal() {
    const userId = getUserId();
    
    const skinType = localStorage.getItem('bglow_skin_type_' + userId) || 'Kombinasi';
    
    // Load existing skin problems
    let currentProblems = [];
    try {
      const raw = localStorage.getItem('bglow_skin_problems_' + userId);
      if (raw) {
        const parsed = JSON.parse(raw);
        currentProblems = parsed.map(p => p.label || p);
      }
    } catch (_) {}

    let selectedType = skinType;
    let selectedProblems = [...currentProblems];

    const skinTypes = [
      { id: 'Normal', icon: `<svg viewBox="0 0 32 32" width="28" height="28" fill="none"><circle cx="16" cy="16" r="13" fill="#D1FAE5" stroke="#10B981" stroke-width="1.5"/><circle cx="16" cy="16" r="8" fill="#6EE7B7" opacity="0.5"/><path d="M11 20c1.5 2 3.5 3 5 3s3.5-1 5-3" stroke="#059669" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="14" r="1.5" fill="#059669"/><circle cx="20" cy="14" r="1.5" fill="#059669"/><path d="M22 8l1.5-2M10 8L8.5 6M16 6V4" stroke="#10B981" stroke-width="1.2" stroke-linecap="round"/></svg>`, desc: 'Seimbang' },
      { id: 'Berminyak', icon: `<svg viewBox="0 0 32 32" width="28" height="28" fill="none"><circle cx="16" cy="16" r="13" fill="#DBEAFE" stroke="#3B82F6" stroke-width="1.5"/><circle cx="16" cy="16" r="8" fill="#93C5FD" opacity="0.4"/><path d="M11 20c1.5 1.5 3.5 2 5 2s3.5-.5 5-2" stroke="#2563EB" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="14" r="1.5" fill="#2563EB"/><circle cx="20" cy="14" r="1.5" fill="#2563EB"/><path d="M9 9c0 2-2 3-2 5" stroke="#60A5FA" stroke-width="1.2" stroke-linecap="round"/><path d="M23 9c0 2 2 3 2 5" stroke="#60A5FA" stroke-width="1.2" stroke-linecap="round"/><circle cx="8" cy="18" r="2" fill="#93C5FD" opacity="0.6"/><circle cx="24" cy="18" r="2" fill="#93C5FD" opacity="0.6"/><circle cx="16" cy="10" r="1.5" fill="#93C5FD" opacity="0.7"/></svg>`, desc: 'Produksi sebum berlebih' },
      { id: 'Kombinasi', icon: `<svg viewBox="0 0 32 32" width="28" height="28" fill="none"><circle cx="16" cy="16" r="13" fill="#EDE9FE" stroke="#8B5CF6" stroke-width="1.5"/><path d="M16 3a13 13 0 010 26" fill="#C4B5FD" opacity="0.5"/><path d="M16 3a13 13 0 000 26" fill="#DDD6FE" opacity="0.3"/><path d="M11 20c1.5 1.5 3.5 2 5 2s3.5-.5 5-2" stroke="#7C3AED" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="14" r="1.5" fill="#7C3AED"/><circle cx="20" cy="14" r="1.5" fill="#7C3AED"/><line x1="16" y1="5" x2="16" y2="27" stroke="#8B5CF6" stroke-width="0.8" stroke-dasharray="2 2"/><circle cx="14" cy="10" r="1.2" fill="#93C5FD" opacity="0.7"/><circle cx="16" cy="8" r="1" fill="#93C5FD" opacity="0.6"/></svg>`, desc: 'Berminyak di T-zone' },
      { id: 'Kering', icon: `<svg viewBox="0 0 32 32" width="28" height="28" fill="none"><circle cx="16" cy="16" r="13" fill="#FEF3C7" stroke="#D97706" stroke-width="1.5"/><circle cx="16" cy="16" r="8" fill="#FDE68A" opacity="0.4"/><path d="M12 19c1 1 2.5 1.5 4 1.5s3-.5 4-1.5" stroke="#B45309" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="14" r="1.5" fill="#B45309"/><circle cx="20" cy="14" r="1.5" fill="#B45309"/><path d="M8 12l1.5 1M24 12l-1.5 1" stroke="#D97706" stroke-width="1" stroke-linecap="round"/><path d="M10 22l2-1M22 22l-2-1M13 24l1-1.5M19 24l-1-1.5" stroke="#D97706" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/></svg>`, desc: 'Kekurangan kelembapan' },
    ];

    const skinProblems = [
      { id: 'Jerawat', icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><circle cx="12" cy="12" r="10" fill="#FEE2E2" stroke="#EF4444" stroke-width="1.5"/><circle cx="9" cy="10" r="2" fill="#FCA5A5" stroke="#EF4444" stroke-width="1"/><circle cx="15" cy="9" r="1.5" fill="#FCA5A5" stroke="#EF4444" stroke-width="1"/><circle cx="13" cy="15" r="2.5" fill="#FCA5A5" stroke="#EF4444" stroke-width="1"/><circle cx="9" cy="10" r="0.8" fill="#EF4444"/><circle cx="15" cy="9" r="0.6" fill="#EF4444"/><circle cx="13" cy="15" r="1" fill="#EF4444"/></svg>`, color: '#EF4444' },
      { id: 'PIE', icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><circle cx="12" cy="12" r="10" fill="#FCE7F3" stroke="#EC4899" stroke-width="1.5"/><circle cx="9" cy="10" r="2.5" fill="none" stroke="#EC4899" stroke-width="1.2" stroke-dasharray="1.5 1.5"/><circle cx="15" cy="14" r="2" fill="none" stroke="#EC4899" stroke-width="1.2" stroke-dasharray="1.5 1.5"/><circle cx="12" cy="8" r="1.5" fill="#F9A8D4" opacity="0.6"/><circle cx="8" cy="15" r="1.8" fill="#F9A8D4" opacity="0.5"/></svg>`, color: '#EC4899' },
      { id: 'PIH', icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><circle cx="12" cy="12" r="10" fill="#FFF7ED" stroke="#F97316" stroke-width="1.5"/><ellipse cx="9" cy="10" rx="2.5" ry="2" fill="#FDBA74" stroke="#F97316" stroke-width="1"/><ellipse cx="15" cy="14" rx="2" ry="1.5" fill="#FDBA74" stroke="#F97316" stroke-width="1"/><ellipse cx="13" cy="8" rx="1.5" ry="1" fill="#FB923C" opacity="0.6"/></svg>`, color: '#F97316' },
      { id: 'Kemerahan', icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><circle cx="12" cy="12" r="10" fill="#DCFCE7" stroke="#22C55E" stroke-width="1.5"/><path d="M7 12c0-1 1.5-3 5-3s5 2 5 3" fill="#BBF7D0" stroke="#16A34A" stroke-width="1"/><circle cx="8" cy="13" r="2.5" fill="#FCA5A5" opacity="0.5"/><circle cx="16" cy="13" r="2.5" fill="#FCA5A5" opacity="0.5"/><path d="M10 16c.5.5 1.2.8 2 .8s1.5-.3 2-.8" stroke="#16A34A" stroke-width="1" stroke-linecap="round"/></svg>`, color: '#22C55E' },
      { id: 'Hiperpigmentasi', icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><circle cx="12" cy="12" r="10" fill="#FEF9C3" stroke="#EAB308" stroke-width="1.5"/><circle cx="12" cy="12" r="7" fill="#FDE047" opacity="0.3"/><path d="M8 10c1-1 2.5-1.5 4-1.5s3 .5 4 1.5" stroke="#CA8A04" stroke-width="1" stroke-linecap="round"/><rect x="7" y="13" width="4" height="3" rx="1" fill="#CA8A04" opacity="0.3"/><rect x="13" y="11" width="3" height="4" rx="1" fill="#CA8A04" opacity="0.25"/><rect x="10" y="15" width="3" height="2" rx="0.8" fill="#CA8A04" opacity="0.2"/></svg>`, color: '#EAB308' },
      { id: 'Aging', icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><circle cx="12" cy="12" r="10" fill="#F3E8FF" stroke="#8B5CF6" stroke-width="1.5"/><path d="M8 9c0-1 1-2 2-2M14 9c0-1 1-2 2-2" stroke="#8B5CF6" stroke-width="1" stroke-linecap="round"/><path d="M9 14c.8 1.2 1.8 1.8 3 1.8s2.2-.6 3-1.8" stroke="#8B5CF6" stroke-width="1" stroke-linecap="round"/><path d="M7 11l3 .5M17 11l-3 .5" stroke="#A78BFA" stroke-width="0.8" stroke-linecap="round"/><path d="M8 16l2-.5M16 16l-2-.5" stroke="#A78BFA" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/></svg>`, color: '#8B5CF6' },
    ];
    
    const overlay = document.createElement('div');
    overlay.className = 'diary-modal-overlay';
    overlay.innerHTML = `
      <div class="diary-modal" style="border-radius: var(--radius-lg) var(--radius-lg) 0 0; max-height:85vh;">
        <style>
          .sp-chip-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .sp-chip {
            display: flex; align-items: center; gap: 10px;
            padding: 12px 14px; border-radius: 12px;
            border: 1.5px solid var(--border-light); background: #fafafa;
            cursor: pointer; transition: all 0.2s ease; user-select: none;
          }
          .sp-chip:hover { border-color: var(--primary); background: var(--bg-overlay); }
          .sp-chip.active {
            border-color: var(--primary) !important;
            background: var(--bg-overlay) !important;
            box-shadow: 0 0 0 2px rgba(59,130,246,0.15);
          }
          .sp-chip-emoji { font-size: 1.2rem; flex-shrink: 0; }
          .sp-chip-label { font-size: 13px; font-weight: 600; color: var(--text-primary); }
          .sp-chip-desc { font-size: 11px; color: var(--text-tertiary); margin-top: 1px; }
          .sp-prob-chip {
            display: flex; align-items: center; gap: 8px;
            padding: 10px 14px; border-radius: 100px;
            border: 1.5px solid var(--border-light); background: #fafafa;
            cursor: pointer; transition: all 0.2s ease; user-select: none;
            font-size: 13px; font-weight: 600; color: var(--text-secondary);
          }
          .sp-prob-chip:hover { border-color: var(--primary); }
          .sp-prob-chip.active {
            color: white !important; border-color: transparent !important;
          }
          .sp-section-title {
            font-size: 13px; font-weight: 700; color: var(--text-primary);
            margin-bottom: 10px; margin-top: 20px;
            display: flex; align-items: center; gap: 6px;
          }
          .sp-section-title:first-of-type { margin-top: 12px; }
          .sp-prob-grid { display: flex; flex-wrap: wrap; gap: 8px; }
          .sp-hint {
            font-size: 11px; color: var(--text-tertiary); margin-top: 8px; line-height: 1.4;
          }
        </style>
        <div class="modal-handle"></div>
        <div class="modal-title">Profil Kulit Anda</div>
        
        <div class="sp-section-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
          Jenis Kulit
        </div>
        <div class="sp-chip-grid" id="sp-skin-types">
          ${skinTypes.map(t => `
            <div class="sp-chip ${selectedType === t.id ? 'active' : ''}" data-type="${t.id}">
              <span class="sp-chip-emoji">${t.icon}</span>
              <div>
                <div class="sp-chip-label">${t.id}</div>
                <div class="sp-chip-desc">${t.desc}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="sp-section-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Masalah Kulit
        </div>
        <div class="sp-prob-grid" id="sp-problems">
          ${skinProblems.map(p => `
            <div class="sp-prob-chip ${selectedProblems.includes(p.id) ? 'active' : ''}" data-prob="${p.id}" style="${selectedProblems.includes(p.id) ? `background:${p.color}; border-color:${p.color};` : ''}">
              <span>${p.icon}</span>
              <span>${p.id}</span>
            </div>
          `).join('')}
        </div>
        <div class="sp-hint">Pilih semua masalah kulit yang sedang kamu alami. Bisa lebih dari satu.</div>
        
        <div class="modal-actions" style="display:flex; gap:10px; margin-top:20px;">
          <button class="btn btn-outline" id="btn-cancel-skin" style="flex:1; padding: 12px; border-radius: var(--radius-md); font-weight:600; cursor:pointer;">Batal</button>
          <button class="btn btn-primary" id="btn-save-skin" style="flex:1; padding: 12px; border-radius: var(--radius-md); font-weight:600; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color:white; border:none; cursor:pointer;">Simpan</button>
        </div>
      </div>
    `;

    // Skin type chip selection
    overlay.querySelectorAll('.sp-chip[data-type]').forEach(chip => {
      chip.addEventListener('click', () => {
        selectedType = chip.dataset.type;
        overlay.querySelectorAll('.sp-chip[data-type]').forEach(c => c.classList.toggle('active', c.dataset.type === selectedType));
      });
    });

    // Problem chip multi-select
    const probColors = {};
    skinProblems.forEach(p => probColors[p.id] = p.color);

    overlay.querySelectorAll('.sp-prob-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const val = chip.dataset.prob;
        const idx = selectedProblems.indexOf(val);
        if (idx === -1) {
          selectedProblems.push(val);
          chip.classList.add('active');
          chip.style.background = probColors[val];
          chip.style.borderColor = probColors[val];
        } else {
          selectedProblems.splice(idx, 1);
          chip.classList.remove('active');
          chip.style.background = '#fafafa';
          chip.style.borderColor = '';
        }
      });
    });

    overlay.querySelector('#btn-cancel-skin').addEventListener('click', () => overlay.remove());
    
    overlay.querySelector('#btn-save-skin').addEventListener('click', async () => {
      const formattedProblems = selectedProblems.map(p => ({ label: p, confidence: 0.95 }));

      if (userId && userId !== 'guest') {
        try {
          overlay.querySelector('#btn-save-skin').textContent = 'Menyimpan...';
          overlay.querySelector('#btn-save-skin').disabled = true;
          
          const res = await fetch(`${API_BASE_URL}/api/user/${userId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              skin_type: selectedType
            })
          });
          
          if (res.ok) {
            localStorage.setItem('bglow_has_scanned_' + userId, '1');
            localStorage.setItem('bglow_skin_type_' + userId, selectedType);
            localStorage.setItem('bglow_skin_problems_' + userId, JSON.stringify(formattedProblems));
            
            showCustomAlert("Profil kulit berhasil diperbarui!", "Profil Kulit Diperbarui", () => {
              overlay.remove();
            });
          } else {
            const data = await res.json();
            showCustomAlert(data.detail || "Gagal memperbarui profil kulit", "Gagal Memperbarui");
            overlay.querySelector('#btn-save-skin').textContent = 'Simpan';
            overlay.querySelector('#btn-save-skin').disabled = false;
          }
        } catch (err) {
          console.error(err);
          showCustomAlert("Gagal terhubung ke server. Pastikan backend menyala.", "Koneksi Bermasalah");
          overlay.querySelector('#btn-save-skin').textContent = 'Simpan';
          overlay.querySelector('#btn-save-skin').disabled = false;
        }
      } else {
        localStorage.setItem('bglow_has_scanned_' + userId, '1');
        localStorage.setItem('bglow_skin_type_' + userId, selectedType);
        localStorage.setItem('bglow_skin_problems_' + userId, JSON.stringify(formattedProblems));
        showCustomAlert("Profil kulit (Guest) diperbarui!", "Profil Kulit Diperbarui", () => {
          overlay.remove();
        });
      }
    });
    
    document.body.appendChild(overlay);
  }

  function openPrivacyModal() {
    const userId = getUserId();
    
    const analysisVal = localStorage.getItem('privacy_skin_analysis_' + userId) !== '0';
    const localVal = localStorage.getItem('privacy_local_storage_' + userId) !== '0';
    const cloudVal = localStorage.getItem('privacy_cloud_backup_' + userId) === '1';
    
    const overlay = document.createElement('div');
    overlay.className = 'diary-modal-overlay';
    overlay.innerHTML = `
      <div class="diary-modal" style="border-radius: var(--radius-lg) var(--radius-lg) 0 0; max-height:85vh;">
        <style>
          .privacy-toggle-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 0;
            border-bottom: 1.5px solid var(--border-light);
          }
          .privacy-toggle-info {
            flex: 1;
            padding-right: 16px;
          }
          .privacy-toggle-title {
            font-weight: 600;
            color: var(--text-primary);
            font-size: 14px;
            margin-bottom: 4px;
          }
          .privacy-toggle-desc {
            font-size: 12px;
            color: var(--text-secondary);
            line-height: 1.4;
          }
          .ios-switch {
            position: relative;
            display: inline-block;
            width: 46px;
            height: 26px;
            flex-shrink: 0;
          }
          .ios-switch input {
            opacity: 0;
            width: 0;
            height: 0;
          }
          .ios-slider {
            position: absolute;
            cursor: pointer;
            top: 0; left: 0; right: 0; bottom: 0;
            background-color: var(--border);
            transition: .2s ease;
            border-radius: 26px;
          }
          .ios-slider:before {
            position: absolute;
            content: "";
            height: 20px;
            width: 20px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: .2s ease;
            border-radius: 50%;
            box-shadow: 0 1px 3px rgba(0,0,0,0.15);
          }
          .ios-switch input:checked + .ios-slider {
            background-color: var(--success);
          }
          .ios-switch input:checked + .ios-slider:before {
            transform: translateX(20px);
          }
          .danger-zone {
            margin-top: var(--space-lg);
            padding: var(--space-md);
            border: 1.5px solid var(--danger-bg);
            background: var(--bg-soft);
            border-radius: var(--radius-md);
          }
          .danger-zone-title {
            font-weight: 700;
            color: var(--danger);
            font-size: 14px;
            margin-bottom: 6px;
          }
          .danger-zone-desc {
            font-size: 12px;
            color: var(--text-secondary);
            margin-bottom: 12px;
            line-height: 1.4;
          }
        </style>
        <div class="modal-handle"></div>
        <div class="modal-title">Privasi & Keamanan</div>
        
        <div style="background:var(--bg-overlay); border: 1px solid rgba(59, 130, 246, 0.15); padding: 12px var(--space-md); border-radius: var(--radius-md); font-size: 12px; color: var(--text-secondary); margin-bottom: 16px; line-height: 1.5; display: flex; gap: 10px; align-items: flex-start;">
          <span style="font-size:16px;">🛡️</span>
          <span>Kami berkomitmen menjaga privasi Anda. Foto hasil scan wajah Anda diproses di perangkat lokal Anda dan tidak disalahgunakan.</span>
        </div>
        
        <div class="privacy-toggle-item">
          <div class="privacy-toggle-info">
            <div class="privacy-toggle-title">Data Analisis Kulit</div>
            <div class="privacy-toggle-desc">Izinkan AI menganalisis foto wajah untuk memberikan saran produk skincare yang cocok.</div>
          </div>
          <label class="ios-switch">
            <input type="checkbox" id="privacy-analysis" ${analysisVal ? 'checked' : ''} />
            <span class="ios-slider"></span>
          </label>
        </div>

        <div class="privacy-toggle-item">
          <div class="privacy-toggle-info">
            <div class="privacy-toggle-title">Enkripsi Penyimpanan Lokal</div>
            <div class="privacy-toggle-desc">Amankan data riwayat harian kulit Anda menggunakan database terenkripsi di perangkat.</div>
          </div>
          <label class="ios-switch">
            <input type="checkbox" id="privacy-local" ${localVal ? 'checked' : ''} />
            <span class="ios-slider"></span>
          </label>
        </div>

        <div class="privacy-toggle-item" style="border-bottom:none;">
          <div class="privacy-toggle-info">
            <div class="privacy-toggle-title">Sinkronisasi Cloud Backup</div>
            <div class="privacy-toggle-desc">Cadangkan data riwayat scan kulit Anda secara aman ke cloud agar tidak hilang saat ganti perangkat.</div>
          </div>
          <label class="ios-switch">
            <input type="checkbox" id="privacy-cloud" ${cloudVal ? 'checked' : ''} />
            <span class="ios-slider"></span>
          </label>
        </div>
        
        <div class="danger-zone">
          <div class="danger-zone-title">Zona Bahaya</div>
          <div class="danger-zone-desc">Menghapus seluruh data profil, riwayat scan, riwayat harian kulit, serta alarm sunscreen secara permanen.</div>
          <button class="btn btn-outline" id="btn-delete-all-data" style="width:100%; border-color:var(--danger); color:var(--danger); padding:10px; font-weight:600; cursor:pointer; background:transparent;">Hapus Seluruh Data Akun</button>
        </div>
        
        <div class="modal-actions" style="display:flex; gap:10px; margin-top:20px;">
          <button class="btn btn-outline" id="btn-cancel-privacy" style="flex:1; padding: 12px; border-radius: var(--radius-md); font-weight:600; cursor:pointer;">Batal</button>
          <button class="btn btn-primary" id="btn-save-privacy" style="flex:1; padding: 12px; border-radius: var(--radius-md); font-weight:600; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color:white; border:none; cursor:pointer;">Simpan</button>
        </div>
      </div>
    `;
    
    overlay.querySelector('#btn-cancel-privacy').addEventListener('click', () => overlay.remove());
    
    overlay.querySelector('#btn-save-privacy').addEventListener('click', () => {
      const isAnalysisChecked = overlay.querySelector('#privacy-analysis').checked;
      const isLocalChecked = overlay.querySelector('#privacy-local').checked;
      const isCloudChecked = overlay.querySelector('#privacy-cloud').checked;
      
      localStorage.setItem('privacy_skin_analysis_' + userId, isAnalysisChecked ? '1' : '0');
      localStorage.setItem('privacy_local_storage_' + userId, isLocalChecked ? '1' : '0');
      localStorage.setItem('privacy_cloud_backup_' + userId, isCloudChecked ? '1' : '0');
      
      showCustomAlert("Pengaturan privasi berhasil diperbarui!", "Privasi Diperbarui", () => {
        overlay.remove();
      });
    });
    
    overlay.querySelector('#btn-delete-all-data').addEventListener('click', () => {
      showCustomConfirm(
        "Apakah Anda yakin ingin menghapus seluruh data akun? Tindakan ini akan menghapus semua riwayat scan dan harian kulit Anda secara permanen. Anda juga akan dikeluarkan dari aplikasi.",
        () => {
          clearUserData();
          localStorage.setItem('bglow_auth', '0');
          
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('bglow_') || key.startsWith('privacy_')) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(k => localStorage.removeItem(k));
          
          overlay.remove();
          showCustomAlert("Seluruh data berhasil dihapus.", "Data Dihapus", () => {
            window.location.hash = '#/login';
          });
        },
        "Konfirmasi Hapus Data"
      );
    });
    
    document.body.appendChild(overlay);
  }

  function openRateModal() {
    const userId = getUserId();
    const existingRating = localStorage.getItem('bglow_app_rating_' + userId) || '0';
    const existingFeedback = localStorage.getItem('bglow_app_feedback_' + userId) || '';
    
    let selectedRating = parseInt(existingRating);
    
    const overlay = document.createElement('div');
    overlay.className = 'diary-modal-overlay';
    overlay.innerHTML = `
      <div class="diary-modal" style="border-radius: var(--radius-lg) var(--radius-lg) 0 0; text-align:center;">
        <style>
          .rating-stars-container {
            display: flex;
            justify-content: center;
            gap: 12px;
            margin: 20px 0;
          }
          .rating-star-btn {
            background: none;
            border: none;
            font-size: 36px;
            cursor: pointer;
            color: var(--text-tertiary);
            transition: transform 0.1s ease, color 0.1s ease;
            padding: 4px;
          }
          .rating-star-btn:hover {
            transform: scale(1.2);
          }
          .rating-star-btn.active {
            color: #F59E0B;
          }
          .rating-text-feedback {
            text-align: center;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 20px;
            font-size: 15px;
            min-height: 22px;
          }
        </style>
        <div class="modal-handle"></div>
        <div class="modal-title">Nilai Aplikasi B-Glow</div>
        <p style="color:var(--text-secondary); font-size:14px; margin-bottom:15px;">Bagaimana pengalaman Anda menggunakan B-Glow? Penilaian Anda membantu kami terus berkembang!</p>
        
        <div class="rating-stars-container">
          <button class="rating-star-btn" data-star="1">★</button>
          <button class="rating-star-btn" data-star="2">★</button>
          <button class="rating-star-btn" data-star="3">★</button>
          <button class="rating-star-btn" data-star="4">★</button>
          <button class="rating-star-btn" data-star="5">★</button>
        </div>
        
        <div class="rating-text-feedback" id="rating-status-text">Ketuk bintang untuk memberi nilai</div>
        
        <div class="modal-field" style="text-align:left;">
          <label>Masukan Anda (Opsional)</label>
          <textarea id="rating-comment" class="modal-textarea" style="width:100%; min-height:90px; box-sizing:border-box; padding:12px;" placeholder="Tulis kritik, saran, atau masukan Anda di sini...">${existingFeedback}</textarea>
        </div>
        
        <div class="modal-actions" style="display:flex; gap:10px; margin-top:20px;">
          <button class="btn btn-outline" id="btn-cancel-rate" style="flex:1; padding: 12px; border-radius: var(--radius-md); font-weight:600; cursor:pointer;">Batal</button>
          <button class="btn btn-primary" id="btn-submit-rate" style="flex:1; padding: 12px; border-radius: var(--radius-md); font-weight:600; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color:white; border:none; cursor:pointer;">Kirim Penilaian</button>
        </div>
      </div>
    `;
    
    const stars = overlay.querySelectorAll('.rating-star-btn');
    const statusText = overlay.querySelector('#rating-status-text');
    const commentInput = overlay.querySelector('#rating-comment');
    
    const ratingTexts = {
      0: "Ketuk bintang untuk memberi nilai",
      1: "Sangat Buruk 😞",
      2: "Buruk 🙁",
      3: "Cukup Baik 😐",
      4: "Sangat Baik 😊",
      5: "Luar Biasa! 😍"
    };
    
    function updateStarsDisplay(rating) {
      stars.forEach(star => {
        const starVal = parseInt(star.getAttribute('data-star'));
        if (starVal <= rating) {
          star.classList.add('active');
        } else {
          star.classList.remove('active');
        }
      });
      statusText.textContent = ratingTexts[rating];
    }
    
    updateStarsDisplay(selectedRating);
    
    stars.forEach(star => {
      star.addEventListener('click', () => {
        selectedRating = parseInt(star.getAttribute('data-star'));
        updateStarsDisplay(selectedRating);
      });
      
      star.addEventListener('mouseenter', () => {
        const hoverVal = parseInt(star.getAttribute('data-star'));
        updateStarsDisplay(hoverVal);
      });
    });
    
    overlay.querySelector('.rating-stars-container').addEventListener('mouseleave', () => {
      updateStarsDisplay(selectedRating);
    });
    
    overlay.querySelector('#btn-cancel-rate').addEventListener('click', () => overlay.remove());
    
    overlay.querySelector('#btn-submit-rate').addEventListener('click', () => {
      if (selectedRating === 0) {
        showCustomAlert("Silakan pilih rating bintang terlebih dahulu!", "Rating Diperlukan");
        return;
      }
      
      const comment = commentInput.value.trim();
      
      localStorage.setItem('bglow_app_rating_' + userId, String(selectedRating));
      localStorage.setItem('bglow_app_feedback_' + userId, comment);
      
      let successMsg = "Terima kasih atas ulasan Anda! Ulasan Anda telah disimpan secara lokal.";
      if (selectedRating >= 4) {
        successMsg = "Terima kasih banyak atas dukungannya! 😍 Kami senang Anda menyukai B-Glow.";
      }
      
      showCustomAlert(successMsg, "Penilaian Dikirim", () => {
        overlay.remove();
      });
    });
    
    document.body.appendChild(overlay);
  }

  function openHelpModal() {
    const overlay = document.createElement('div');
    overlay.className = 'diary-modal-overlay';
    overlay.innerHTML = `
      <div class="diary-modal" style="border-radius: var(--radius-lg) var(--radius-lg) 0 0; max-height:85vh; padding-bottom: 40px;">
        <style>
          .faq-section {
            margin-top: 15px;
            margin-bottom: 25px;
          }
          .faq-search-box {
            position: relative;
            margin-bottom: 16px;
          }
          .faq-search-input {
            width: 100%;
            padding: 12px 16px 12px 40px;
            border: 1.5px solid var(--border);
            border-radius: var(--radius-md);
            font-size: 14px;
            background: var(--bg-soft);
            box-sizing: border-box;
            transition: all 0.2s ease;
          }
          .faq-search-input:focus {
            border-color: var(--primary);
            background: white;
            outline: none;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
          }
          .faq-search-icon {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-tertiary);
            pointer-events: none;
            font-size: 16px;
          }
          .faq-item {
            border: 1.5px solid var(--border-light);
            border-radius: var(--radius-md);
            margin-bottom: 10px;
            overflow: hidden;
            background: var(--bg);
            transition: all 0.2s ease;
          }
          .faq-header {
            padding: 14px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            font-weight: 600;
            color: var(--text-primary);
            font-size: 13.5px;
            user-select: none;
          }
          .faq-header:hover {
            background: var(--bg-soft);
          }
          .faq-arrow {
            transition: transform 0.2s ease;
            color: var(--text-secondary);
            display: flex;
            align-items: center;
            font-size: 12px;
          }
          .faq-item.active {
            border-color: var(--primary-light);
          }
          .faq-item.active .faq-arrow {
            transform: rotate(180deg);
            color: var(--primary);
          }
          .faq-body {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.25s ease-out;
            background: var(--bg-soft);
            font-size: 12.5px;
            color: var(--text-secondary);
            line-height: 1.5;
          }
          .faq-body-content {
            padding: 14px 16px;
            border-top: 1px solid var(--border-light);
          }
          .support-cards {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 25px;
          }
          .support-card {
            border: 1.5px solid var(--border);
            border-radius: var(--radius-md);
            padding: 14px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .support-card:hover {
            border-color: var(--primary);
            transform: translateY(-2px);
            box-shadow: var(--shadow-sm);
          }
          .support-card-icon {
            font-size: 24px;
            margin-bottom: 8px;
          }
          .support-card-title {
            font-weight: 600;
            color: var(--text-primary);
            font-size: 13px;
            margin-bottom: 2px;
          }
          .support-card-desc {
            font-size: 11px;
            color: var(--text-secondary);
          }
          .ticket-form {
            border: 1.5px solid var(--border-light);
            border-radius: var(--radius-md);
            padding: 16px;
            background: var(--bg-soft);
          }
          .custom-select-container {
            position: relative;
            width: 100%;
          }
          .custom-select-trigger {
            width: 100%;
            padding: 12px 14px;
            border: 1.5px solid var(--border);
            border-radius: var(--radius-md);
            background: white;
            font-size: 13px;
            color: var(--text-primary);
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            box-sizing: border-box;
            transition: all 0.2s ease;
          }
          .custom-select-trigger:hover {
            border-color: var(--primary-light);
          }
          .custom-select-container.open .custom-select-trigger {
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
          .custom-select-arrow {
            font-size: 9px;
            color: var(--text-secondary);
            transition: transform 0.2s ease;
          }
          .custom-select-container.open .custom-select-arrow {
            transform: rotate(180deg);
            color: var(--primary);
          }
          .custom-select-options {
            position: absolute;
            top: calc(100% + 6px);
            left: 0;
            right: 0;
            background: white;
            border: 1.5px solid var(--border-light);
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 100;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-8px);
            transition: all 0.2s ease;
            max-height: 180px;
            overflow-y: auto;
          }
          .custom-select-container.open .custom-select-options {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
          }
          .custom-select-option {
            padding: 10px 14px;
            font-size: 13px;
            color: var(--text-secondary);
            cursor: pointer;
            text-align: left;
            transition: all 0.2s ease;
          }
          .custom-select-option:hover {
            background: var(--bg-soft);
            color: var(--primary);
          }
          .custom-select-option.active {
            background: var(--bg-overlay);
            color: var(--primary);
            font-weight: 600;
          }
        </style>
        <div class="modal-handle"></div>
        <div class="modal-title">Bantuan & Dukungan</div>
        
        <div class="faq-search-box">
          <span class="faq-search-icon">🔍</span>
          <input type="text" class="faq-search-input" id="faq-search" placeholder="Cari topik bantuan atau FAQ..." />
        </div>
        
        <h4 style="margin: 0 0 10px 0; font-size:14px; font-weight:700; color:var(--text-primary);">Tanya Jawab Populer (FAQ)</h4>
        
        <div class="faq-section" id="faq-container">
          <div class="faq-item" data-keywords="scan ai analisis foto kulit wajah jerawat">
            <div class="faq-header">
              <span>Bagaimana B-Glow menganalisis kondisi kulit?</span>
              <span class="faq-arrow">▼</span>
            </div>
            <div class="faq-body">
              <div class="faq-body-content">
                B-Glow menggunakan algoritma Computer Vision AI yang menganalisis foto wajah untuk mendeteksi jerawat, mengukur tingkat sebum minyak, memantau kemerahan kulit, serta mengidentifikasi ukuran pori-pori.
              </div>
            </div>
          </div>
          
          <div class="faq-item" data-keywords="aman foto privasi database server simpan">
            <div class="faq-header">
              <span>Apakah data foto wajah saya aman?</span>
              <span class="faq-arrow">▼</span>
            </div>
            <div class="faq-body">
              <div class="faq-body-content">
                Sangat aman. Kami memproses dan menganalisis gambar langsung secara lokal di perangkat Anda. Data numerik hasil scan yang dikirim ke server pun dilindungi oleh enkripsi modern dan tidak dibagikan ke pihak ketiga.
              </div>
            </div>
          </div>
          
          <div class="faq-item" data-keywords="alarm sunscreen notifikasi berbunyi mati">
            <div class="faq-header">
              <span>Mengapa alarm sunscreen saya tidak berbunyi?</span>
              <span class="faq-arrow">▼</span>
            </div>
            <div class="faq-body">
              <div class="faq-body-content">
                Umumnya hal ini disebabkan oleh pembatasan notifikasi di HP Anda. Pastikan Anda telah memberikan izin notifikasi penuh untuk aplikasi B-Glow di Pengaturan Sistem HP Anda dan mematikan mode hemat baterai untuk B-Glow.
              </div>
            </div>
          </div>
          
          <div class="faq-item" data-keywords="bpom barcode cari kecocokan bahan produk">
            <div class="faq-header">
              <span>Bagaimana cara kerja cek produk BPOM?</span>
              <span class="faq-arrow">▼</span>
            </div>
            <div class="faq-body">
              <div class="faq-body-content">
                Anda hanya perlu memasukkan nomor registrasi BPOM atau memindai barcode produk skincare. Aplikasi kami akan mencocokkan bahan aktif produk dengan profil kulit Anda untuk menghasilkan skor kecocokan yang dipersonalisasi.
              </div>
            </div>
          </div>
          
          <div class="faq-item" data-keywords="ubah ganti profil kulit jenis manual">
            <div class="faq-header">
              <span>Bagaimana cara merubah profil kulit saya?</span>
              <span class="faq-arrow">▼</span>
            </div>
            <div class="faq-body">
              <div class="faq-body-content">
                Anda dapat memperbarui profil kulit secara manual kapan saja dengan masuk ke menu <strong>Pengaturan > Profil Kulit</strong>, lalu memilih jenis kulit, level minyak, dan tingkat jerawat yang sesuai.
              </div>
            </div>
          </div>
        </div>
        
        <h4 style="margin: 0 0 10px 0; font-size:14px; font-weight:700; color:var(--text-primary);">Hubungi Dukungan</h4>
        <div class="support-cards">
          <a class="support-card" href="https://wa.me/6281234567890" target="_blank">
            <span class="support-card-icon">💬</span>
            <span class="support-card-title">WhatsApp Support</span>
            <span class="support-card-desc">Respon cepat 09.00 - 18.00</span>
          </a>
          <a class="support-card" href="mailto:support@bglow.com">
            <span class="support-card-icon">✉️</span>
            <span class="support-card-title">Email Dukungan</span>
            <span class="support-card-desc">Kirim pesan kapan saja</span>
          </a>
        </div>
        
        <h4 style="margin: 0 0 10px 0; font-size:14px; font-weight:700; color:var(--text-primary);">Kirim Laporan Kendala</h4>
        <div class="ticket-form">
          <div class="modal-field">
            <label style="font-size:12px;">Kategori Masalah</label>
            <div class="custom-select-container" id="select-category-container">
              <div class="custom-select-trigger">
                <span class="custom-select-value">Scan AI & Kamera</span>
                <span class="custom-select-arrow">▼</span>
              </div>
              <div class="custom-select-options">
                <div class="custom-select-option active" data-value="Scan AI & Kamera">Scan AI & Kamera</div>
                <div class="custom-select-option" data-value="Alarm Sunscreen">Alarm Sunscreen</div>
                <div class="custom-select-option" data-value="Pencarian & BPOM">Pencarian & BPOM</div>
                <div class="custom-select-option" data-value="Masalah Akun & Login">Masalah Akun & Login</div>
                <div class="custom-select-option" data-value="Lainnya">Lainnya</div>
              </div>
              <input type="hidden" id="ticket-category" value="Scan AI & Kamera" />
            </div>
          </div>
          
          <div class="modal-field">
            <label style="font-size:12px;">Deskripsi Kendala</label>
            <textarea id="ticket-desc" class="modal-textarea" style="width:100%; min-height:80px; box-sizing:border-box; padding:10px; font-size:13px;" placeholder="Jelaskan detail kendala yang Anda alami..."></textarea>
          </div>
          
          <button class="btn btn-primary" id="btn-submit-ticket" style="width:100%; padding: 12px; border-radius: var(--radius-md); font-weight:600; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color:white; border:none; cursor:pointer;">Kirim Laporan</button>
        </div>
        
        <div class="modal-actions" style="display:flex; gap:10px; margin-top:20px;">
          <button class="btn btn-outline" id="btn-close-help" style="width:100%; padding: 12px; border-radius: var(--radius-md); font-weight:600; cursor:pointer;">Tutup</button>
        </div>
      </div>
    `;
    
    const faqItems = overlay.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const header = item.querySelector('.faq-header');
      const body = item.querySelector('.faq-body');
      
      header.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        faqItems.forEach(otherItem => {
          if (otherItem !== item && otherItem.classList.contains('active')) {
            otherItem.classList.remove('active');
            otherItem.querySelector('.faq-body').style.maxHeight = '0';
          }
        });
        
        if (isActive) {
          item.classList.remove('active');
          body.style.maxHeight = '0';
        } else {
          item.classList.add('active');
          body.style.maxHeight = body.scrollHeight + 'px';
        }
      });
    });
    
    const searchInput = overlay.querySelector('#faq-search');
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      
      faqItems.forEach(item => {
        const keywords = item.getAttribute('data-keywords').toLowerCase();
        const headerText = item.querySelector('.faq-header span').textContent.toLowerCase();
        const bodyText = item.querySelector('.faq-body-content').textContent.toLowerCase();
        
        if (keywords.includes(query) || headerText.includes(query) || bodyText.includes(query)) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
    
    // Custom select trigger and click outside handling
    const selectContainer = overlay.querySelector('#select-category-container');
    const selectTrigger = selectContainer.querySelector('.custom-select-trigger');
    const selectValue = selectContainer.querySelector('.custom-select-value');
    const hiddenInput = selectContainer.querySelector('#ticket-category');
    const selectOptions = selectContainer.querySelectorAll('.custom-select-option');

    selectTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      selectContainer.classList.toggle('open');
    });

    selectOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = option.getAttribute('data-value');
        selectValue.textContent = val;
        hiddenInput.value = val;
        
        selectOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        
        selectContainer.classList.remove('open');
      });
    });

    const closeSelectOutside = () => {
      selectContainer.classList.remove('open');
    };
    document.addEventListener('click', closeSelectOutside);

    overlay.querySelector('#btn-close-help').addEventListener('click', () => {
      document.removeEventListener('click', closeSelectOutside);
      overlay.remove();
    });
    
    overlay.querySelector('#btn-submit-ticket').addEventListener('click', () => {
      const category = hiddenInput.value;
      const desc = overlay.querySelector('#ticket-desc').value.trim();
      
      if (!desc) {
        showCustomAlert("Silakan tuliskan deskripsi kendala Anda terlebih dahulu!", "Deskripsi Diperlukan");
        return;
      }
      
      const userId = getUserId();
      const existingTicketsStr = localStorage.getItem('bglow_support_tickets_' + userId) || '[]';
      let tickets = [];
      try {
        tickets = JSON.parse(existingTicketsStr);
      } catch (e) {}
      
      tickets.push({
        id: 'TKT-' + Date.now(),
        category,
        desc,
        date: new Date().toISOString(),
        status: 'Diproses'
      });
      localStorage.setItem('bglow_support_tickets_' + userId, JSON.stringify(tickets));
      
      showCustomAlert(
        `Laporan kendala mengenai "${category}" berhasil dikirim! Tim kami akan meninjau keluhan Anda dan menghubungi lewat email dalam 24 jam.`,
        "Laporan Terkirim",
        () => {
          overlay.querySelector('#ticket-desc').value = '';
        }
      );
    });
    
    document.body.appendChild(overlay);
  }

  return page;
}
