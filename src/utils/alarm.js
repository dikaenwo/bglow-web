/**
 * B-Glow Alarm Utility
 * 
 * Utility untuk mengelola alarm sunscreen via Service Worker.
 * Menyediakan API yang mudah dipakai oleh SunscreenAlarm.js.
 */

let _swRegistration = null;
let _swReady = false;

// ─── Inisialisasi Service Worker ─────────────────────────────────────────────

/**
 * Daftarkan Service Worker B-Glow.
 * Dipanggil sekali saat app start dari main.js.
 */
export async function registerAlarmServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('[Alarm] Service Worker tidak didukung browser ini.');
    return false;
  }
  if (!('Notification' in window)) {
    console.warn('[Alarm] Notification API tidak didukung browser ini.');
    return false;
  }

  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    _swRegistration = reg;
    _swReady = true;
    console.log('[Alarm] Service Worker berhasil didaftarkan:', reg.scope);

    // Dengarkan pesan dari SW (opsional untuk debugging)
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('[Alarm] Pesan dari SW:', event.data);
    });

    return true;
  } catch (err) {
    console.error('[Alarm] Gagal mendaftarkan Service Worker:', err);
    return false;
  }
}

/**
 * Dapatkan SW registration yang aktif.
 * Coba ambil dari cache dulu, lalu fallback ke navigator.serviceWorker.ready.
 */
async function getSwRegistration() {
  if (_swRegistration) return _swRegistration;

  if ('serviceWorker' in navigator) {
    try {
      _swRegistration = await navigator.serviceWorker.ready;
      return _swRegistration;
    } catch (e) {
      console.warn('[Alarm] Gagal mendapat SW registration:', e);
    }
  }
  return null;
}

// ─── Permission ───────────────────────────────────────────────────────────────

/**
 * Minta izin notifikasi dari user.
 * @returns {Promise<boolean>} true jika granted
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('[Alarm] Notification API tidak tersedia.');
    return false;
  }

  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') {
    console.warn('[Alarm] Notifikasi diblokir oleh user.');
    return false;
  }

  try {
    const result = await Notification.requestPermission();
    console.log('[Alarm] Notification permission:', result);
    return result === 'granted';
  } catch (e) {
    console.error('[Alarm] Gagal meminta permission notifikasi:', e);
    return false;
  }
}

/**
 * Cek apakah notifikasi sudah di-izinkan.
 */
export function isNotificationGranted() {
  return 'Notification' in window && Notification.permission === 'granted';
}

// ─── Alarm Scheduling ─────────────────────────────────────────────────────────

/**
 * Jadwalkan alarm sunscreen via Service Worker.
 * Notifikasi akan muncul di background meski tab tidak aktif.
 * 
 * @param {Object} options
 * @param {string} options.id - ID unik alarm
 * @param {string} options.title - Judul notifikasi
 * @param {string} options.body - Isi notifikasi
 * @param {number|string} options.fireAt - Timestamp (ms) atau ISO string kapan notifikasi dikirim
 * @returns {Promise<boolean>}
 */
export async function scheduleAlarm({ id, title, body, fireAt }) {
  const reg = await getSwRegistration();

  if (reg && reg.active) {
    // Kirim pesan ke SW untuk schedule alarm
    reg.active.postMessage({
      type: 'SCHEDULE_ALARM',
      payload: { id, title, body, fireAt }
    });
    console.log(`[Alarm] Alarm "${id}" dikirim ke SW.`);
    return true;
  }

  // Fallback: gunakan setTimeout biasa di tab (hanya bekerja saat tab aktif)
  console.warn('[Alarm] SW tidak aktif, fallback ke setTimeout...');
  return scheduleAlarmFallback({ id, title, body, fireAt });
}

/**
 * Jadwalkan SEMUA slot alarm hari ini sekaligus.
 * 
 * @param {Array} schedules - Array of { timeStr: 'HH:MM', label: string }
 */
export async function scheduleAllAlarms(schedules) {
  const reg = await getSwRegistration();

  // Cancel semua alarm lama dulu
  await cancelAllAlarms();

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  let count = 0;

  for (const slot of schedules) {
    const [h, m] = slot.timeStr.split(':').map(Number);
    const fireDate = new Date(`${today}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`);

    // Skip slot yang sudah lewat hari ini
    if (fireDate.getTime() <= now.getTime()) continue;

    const alarmId = `sunscreen-${slot.timeStr.replace(':', '')}`;
    const title = '☀️ Waktunya Re-apply Sunscreen!';
    const body = `Saatnya oles ulang sunscreen (${slot.label} pukul ${slot.timeStr}) untuk melindungi kulit dari sinar UV. ✨`;

    await scheduleAlarm({ id: alarmId, title, body, fireAt: fireDate.getTime() });
    count++;
  }

  console.log(`[Alarm] ${count} alarm dari ${schedules.length} slot dijadwalkan hari ini.`);
  return count;
}

/**
 * Batalkan alarm berdasarkan ID.
 */
export async function cancelAlarm(id) {
  const reg = await getSwRegistration();
  if (reg && reg.active) {
    reg.active.postMessage({ type: 'CANCEL_ALARM', payload: { id } });
  }
  // Juga batalkan fallback timeout jika ada
  _cancelFallbackTimeout(id);
}

/**
 * Batalkan semua alarm yang sedang dijadwalkan.
 */
export async function cancelAllAlarms() {
  const reg = await getSwRegistration();
  if (reg && reg.active) {
    reg.active.postMessage({ type: 'CANCEL_ALL_ALARMS' });
  }
  // Juga batalkan semua fallback timeouts
  _cancelAllFallbackTimeouts();
}

// ─── Fallback (tanpa SW) ──────────────────────────────────────────────────────

const _fallbackTimeouts = new Map();

function scheduleAlarmFallback({ id, title, body, fireAt }) {
  _cancelFallbackTimeout(id);

  const fireAtMs = typeof fireAt === 'number' ? fireAt : new Date(fireAt).getTime();
  const delayMs = fireAtMs - Date.now();

  if (delayMs <= 0) return false;

  const timeoutId = setTimeout(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/pagi.png',
          tag: id,
          renotify: true
        });
      } catch (e) {
        console.error('[Alarm] Fallback notification error:', e);
      }
    }
    _fallbackTimeouts.delete(id);
  }, delayMs);

  _fallbackTimeouts.set(id, timeoutId);
  return true;
}

function _cancelFallbackTimeout(id) {
  const tid = _fallbackTimeouts.get(id);
  if (tid != null) {
    clearTimeout(tid);
    _fallbackTimeouts.delete(id);
  }
}

function _cancelAllFallbackTimeouts() {
  _fallbackTimeouts.forEach((tid) => clearTimeout(tid));
  _fallbackTimeouts.clear();
}
