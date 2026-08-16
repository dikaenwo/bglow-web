/**
 * Geolocation Helper — Web Browser API
 * 
 * Menggunakan navigator.geolocation (Web API) untuk menangani permission flow
 * di browser. Tidak ada dependency ke Capacitor/native.
 */

/**
 * Buka pengaturan lokasi — di web, ini hanya log karena browser tidak bisa membuka system settings.
 */
export function openLocationSettings() {
  console.info('[Geolocation] Pengaturan lokasi tidak dapat dibuka dari browser. Silakan aktifkan GPS dari pengaturan perangkat Anda.');
  alert('Silakan aktifkan GPS/Lokasi dari pengaturan perangkat Anda, lalu refresh halaman ini.');
}

/**
 * Buka pengaturan izin aplikasi — di web, ini hanya log.
 */
export function openAppSettings() {
  console.info('[Geolocation] Pengaturan izin aplikasi tidak dapat dibuka dari browser.');
  alert('Silakan periksa izin lokasi di pengaturan browser Anda untuk situs ini, lalu refresh halaman.');
}

// ─── GMaps Location Modal (Singleton) ───

let _gmapsModalActive = false;

/**
 * Tampilkan Pop-up Dialog persis Google Maps (Akurasi Lokasi).
 * Singleton: hanya bisa tampil 1x di layar secara bersamaan.
 * 
 * @param {Object} options
 * @param {Function} options.onActivate - Callback saat tombol [Aktifkan] ditekan
 * @param {Function} options.onCancel - Callback saat tombol [Lain kali] ditekan
 * @returns {HTMLElement|null} overlay element, atau null jika sudah ada modal aktif
 */
export function showGmapsLocationModal({ onActivate, onCancel } = {}) {
  // Singleton guard — cegah pop-up muncul lebih dari 1 kali
  if (_gmapsModalActive) {
    console.log('[Geolocation] GMaps modal sudah aktif, skip duplikat.');
    return null;
  }
  _gmapsModalActive = true;

  // Hapus sisa overlay lama jika ada di DOM
  document.querySelectorAll('.gmaps-location-overlay').forEach(el => el.remove());

  // Inject keyframe animation CSS (sekali saja)
  if (!document.getElementById('gmaps-modal-styles')) {
    const style = document.createElement('style');
    style.id = 'gmaps-modal-styles';
    style.textContent = `
      @keyframes gmapsFadeIn {
        from { opacity: 0; transform: scale(0.92); }
        to { opacity: 1; transform: scale(1); }
      }
      .gmaps-location-overlay {
        position: fixed;
        inset: 0;
        z-index: 99999;
        background: rgba(0, 0, 0, 0.72);
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        box-sizing: border-box;
      }
      .gmaps-location-card {
        background: #202124;
        color: #e8eaed;
        border-radius: 28px;
        width: 100%;
        max-width: 360px;
        padding: 24px;
        box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        animation: gmapsFadeIn 0.22s cubic-bezier(0.2, 0, 0, 1);
        box-sizing: border-box;
      }
      .gmaps-btn-hover:active {
        background: rgba(138, 180, 248, 0.24) !important;
      }
    `;
    document.head.appendChild(style);
  }

  const overlay = document.createElement('div');
  overlay.className = 'gmaps-location-overlay';
  overlay.innerHTML = `
    <div class="gmaps-location-card">
      <h3 style="font-size: 1.15rem; font-weight: 500; color: #ffffff; margin: 0 0 16px 0; line-height: 1.4; text-align: left;">
        Izinkan Akses Lokasi
      </h3>
      
      <div style="font-size: 0.85rem; color: #e2e8f0; margin-bottom: 16px; text-align: left;">
        B-Glow membutuhkan akses lokasi untuk:
      </div>

      <!-- Item 1: Lokasi Perangkat -->
      <div style="display: flex; gap: 16px; align-items: flex-start; margin-bottom: 18px;">
        <div style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #8ab4f8; margin-top: 1px;">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        <div style="text-align: left;">
          <div style="font-size: 0.92rem; font-weight: 500; color: #ffffff; line-height: 1.3;">Pantau UV Index lokasimu</div>
        </div>
      </div>

      <!-- Item 2: Cuaca -->
      <div style="display: flex; gap: 16px; align-items: flex-start; margin-bottom: 16px;">
        <div style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #8ab4f8; margin-top: 1px;">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        </div>
        <div style="text-align: left;">
          <div style="font-size: 0.92rem; font-weight: 500; color: #ffffff; margin-bottom: 4px; line-height: 1.3;">Rekomendasi skincare berbasis cuaca</div>
          <div style="font-size: 0.78rem; color: #bdc1c6; line-height: 1.45;">
            Data lokasi digunakan untuk mendapatkan informasi cuaca dan UV Index real-time di area Anda.
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div style="display: flex; justify-content: flex-end; align-items: center; gap: 8px; margin-top: 20px;">
        <button id="gmaps-btn-cancel" class="gmaps-btn-hover" style="background: none; border: none; color: #8ab4f8; font-size: 0.9rem; font-weight: 600; padding: 10px 16px; border-radius: 20px; cursor: pointer; outline: none; transition: background 0.2s;">
          Lain kali
        </button>
        <button id="gmaps-btn-activate" class="gmaps-btn-hover" style="background: none; border: none; color: #8ab4f8; font-size: 0.9rem; font-weight: 700; padding: 10px 16px; border-radius: 20px; cursor: pointer; outline: none; transition: background 0.2s;">
          Izinkan
        </button>
      </div>
    </div>
  `;

  // Helper: tutup modal & reset flag
  const closeModal = () => {
    _gmapsModalActive = false;
    if (overlay.parentNode) overlay.remove();
  };

  overlay.querySelector('#gmaps-btn-cancel').addEventListener('click', () => {
    closeModal();
    if (onCancel) onCancel();
  });

  overlay.querySelector('#gmaps-btn-activate').addEventListener('click', () => {
    closeModal();
    if (onActivate) onActivate();
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal();
      if (onCancel) onCancel();
    }
  });

  document.body.appendChild(overlay);
  return overlay;
}

// ─── Location Request API ───

/**
 * Minta izin lokasi dan langsung ambil koordinat via Web Geolocation API.
 * Jika gagal dan silent=false, tampilkan pop-up untuk minta user aktifkan lokasi.
 * 
 * @param {Object} options
 * @param {boolean} options.silent - true = tidak tampilkan pop-up apapun
 * @param {number} options.timeout - Timeout dalam ms (default 10000)
 * @returns {Promise<{lat, lon, error}>}
 */
export async function requestLocationWithPermission({ silent = false, timeout = 10000 } = {}) {
  // Cek apakah browser mendukung geolocation
  if (!('geolocation' in navigator)) {
    console.warn('[Geolocation] Browser tidak mendukung Geolocation API.');
    return { lat: null, lon: null, error: 'GEOLOCATION_NOT_SUPPORTED' };
  }

  // Coba ambil posisi langsung
  const quickResult = await _tryGetPosition(timeout);
  if (quickResult && quickResult.lat !== null) {
    return quickResult;
  }

  // Gagal mendapat posisi — jika silent, kembalikan saja hasilnya
  if (silent) {
    return quickResult || { lat: null, lon: null, error: 'POSITION_UNAVAILABLE' };
  }

  // Tidak silent → Tampilkan pop-up untuk minta user aktifkan lokasi
  return new Promise((resolve) => {
    const modal = showGmapsLocationModal({
      onActivate: async () => {
        // User tekan "Izinkan" → coba ambil posisi lagi (browser akan tampilkan permission prompt)
        const freshResult = await _tryGetPosition(timeout);
        resolve(freshResult || { lat: null, lon: null, error: 'POSITION_UNAVAILABLE' });
      },
      onCancel: () => {
        resolve({ lat: null, lon: null, error: 'CANCELLED_BY_USER' });
      }
    });

    // Jika modal gagal muncul (singleton guard), langsung resolve
    if (!modal) {
      resolve(quickResult || { lat: null, lon: null, error: 'MODAL_BLOCKED' });
    }
  });
}

/**
 * Internal: Coba ambil posisi GPS via Web API, return { lat, lon } atau { lat: null, lon: null }.
 */
async function _tryGetPosition(timeout = 8000) {
  if (!('geolocation' in navigator)) {
    return { lat: null, lon: null, error: 'GEOLOCATION_NOT_SUPPORTED' };
  }

  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: timeout,
        maximumAge: 5000
      });
    });

    if (position && position.coords) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      localStorage.setItem('bglow_user_lat', lat);
      localStorage.setItem('bglow_user_lon', lon);
      return { lat, lon, error: null };
    }
  } catch (err) {
    console.warn('[Geolocation] getCurrentPosition error:', err);
  }

  return { lat: null, lon: null, error: 'POSITION_UNAVAILABLE' };
}

/**
 * Cek apakah permission lokasi sudah granted (Web Permissions API).
 * @returns {Promise<boolean>}
 */
export async function isLocationPermissionGranted() {
  try {
    if (navigator.permissions) {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      return result.state === 'granted';
    }
  } catch (e) {
    console.warn('Permissions API not supported:', e);
  }
  return false;
}

/**
 * Watch posisi lokasi secara continuous via Web API.
 * Mengembalikan watchId yang bisa dipakai untuk clearWatch.
 * 
 * @param {Function} onPosition - Callback saat posisi berubah: ({ lat, lon }) => void
 * @param {Function} onError - Callback saat error
 * @returns {number|null} watchId
 */
export function watchLocation(onPosition, onError) {
  if (!('geolocation' in navigator)) {
    if (onError) onError(new Error('Geolocation not supported'));
    return null;
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      if (position && position.coords) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        localStorage.setItem('bglow_user_lat', lat);
        localStorage.setItem('bglow_user_lon', lon);
        if (onPosition) onPosition({ lat, lon });
      }
    },
    (err) => {
      console.warn('[Geolocation] watchPosition error:', err);
      if (onError) onError(err);
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
  );

  return watchId;
}

/**
 * Stop watching posisi.
 * @param {number} watchId
 */
export function clearLocationWatch(watchId) {
  if (watchId != null && 'geolocation' in navigator) {
    navigator.geolocation.clearWatch(watchId);
  }
}
