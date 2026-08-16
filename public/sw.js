/**
 * B-Glow Service Worker — PWA + UV Alarm Notification Scheduler
 * 
 * Fitur:
 * 1. Offline caching (PWA) — app tetap bisa dibuka tanpa internet
 * 2. Background notification scheduling — alarm UV muncul meski tab tidak aktif
 */

const SW_VERSION = 'bglow-sw-v2';
const CACHE_NAME = `bglow-cache-${SW_VERSION}`;

// Aset yang di-cache untuk offline mode
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.svg',
  '/pagi.png',
  '/malam.png',
  '/alarm.mp3',
  '/BGLOW-Polos.png',
];

// ─── Install ──────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  console.log(`[SW] Installing ${SW_VERSION}...`);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching assets...');
      // addAll bisa gagal jika salah satu 404, pakai add satu-satu supaya lebih toleran
      return Promise.allSettled(
        PRECACHE_ASSETS.map(url => cache.add(url).catch(e => console.warn(`[SW] Cache miss: ${url}`, e)))
      );
    }).then(() => {
      console.log('[SW] Pre-cache selesai.');
      return self.skipWaiting();
    })
  );
});

// ─── Activate ─────────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating ${SW_VERSION}...`);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith('bglow-cache-') && name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Menghapus cache lama:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ─── Fetch — Offline Caching Strategy ────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Hanya handle request GET ke origin sendiri
  if (request.method !== 'GET' || !url.origin.includes(self.location.origin.replace(/^https?:\/\//, ''))) {
    return;
  }

  // Jangan cache request ke API/backend eksternal
  const isApiRequest = url.pathname.startsWith('/api/') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('open-meteo.com') ||
    url.hostname.includes('openweathermap.org') ||
    url.hostname.includes('nominatim.openstreetmap.org') ||
    url.hostname.includes('bglow.store');

  if (isApiRequest) {
    // API: Network First (coba internet dulu, kalau gagal biarkan error)
    event.respondWith(fetch(request).catch(() => new Response('', { status: 503 })));
    return;
  }

  // Aset statis: Cache First (ambil dari cache, kalau tidak ada fetch dari network)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Kembalikan dari cache, update di background (stale-while-revalidate)
        const networkFetch = fetch(request).then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
          }
          return response;
        }).catch(() => null);

        return cached;
      }

      // Tidak ada di cache — fetch dari network dan simpan
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
        return response;
      }).catch(() => {
        // Offline & tidak ada cache — kembalikan halaman utama (SPA fallback)
        if (request.destination === 'document') {
          return caches.match('/index.html');
        }
        return new Response('', { status: 503 });
      });
    })
  );
});

// ─── Message Handler dari halaman utama ──────────────────────────────────────

self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  switch (type) {
    case 'SCHEDULE_ALARM':
      scheduleAlarm(payload);
      break;

    case 'CANCEL_ALARM':
      cancelAlarm(payload.id);
      break;

    case 'CANCEL_ALL_ALARMS':
      cancelAllAlarms();
      break;

    case 'PING':
      event.ports[0]?.postMessage({ type: 'PONG', version: SW_VERSION });
      break;

    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    default:
      console.log('[SW] Unknown message type:', type);
  }
});

// ─── Alarm Scheduling ─────────────────────────────────────────────────────────

const scheduledAlarms = new Map();

function scheduleAlarm(alarm) {
  if (!alarm || !alarm.id || !alarm.fireAt) {
    console.warn('[SW] Invalid alarm payload:', alarm);
    return;
  }

  cancelAlarm(alarm.id);

  const fireAt = typeof alarm.fireAt === 'number' ? alarm.fireAt : new Date(alarm.fireAt).getTime();
  const delayMs = fireAt - Date.now();

  if (delayMs <= 0) {
    console.warn(`[SW] Alarm ${alarm.id} sudah lewat. Skip.`);
    return;
  }

  const timeStr = new Date(fireAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  console.log(`[SW] ⏰ Alarm "${alarm.id}" dijadwalkan pukul ${timeStr} (dalam ${Math.round(delayMs / 60000)} menit)`);

  const timeoutId = setTimeout(() => {
    fireNotification(alarm);
    scheduledAlarms.delete(alarm.id);
  }, delayMs);

  scheduledAlarms.set(alarm.id, { timeoutId, alarm, fireAt });
}

function cancelAlarm(id) {
  const entry = scheduledAlarms.get(id);
  if (entry) {
    clearTimeout(entry.timeoutId);
    scheduledAlarms.delete(id);
    console.log(`[SW] Alarm "${id}" dibatalkan.`);
  }
}

function cancelAllAlarms() {
  scheduledAlarms.forEach((entry, id) => {
    clearTimeout(entry.timeoutId);
  });
  scheduledAlarms.clear();
  console.log('[SW] Semua alarm dibatalkan.');
}

// ─── Notification ─────────────────────────────────────────────────────────────

function fireNotification(alarm) {
  const title = alarm.title || '☀️ Waktunya Re-apply Sunscreen!';
  const body = alarm.body || 'Saatnya oles ulang sunscreen untuk melindungi kulit dari sinar UV.';

  const options = {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: alarm.id || 'sunscreen-reminder',
    renotify: true,
    requireInteraction: false,
    vibrate: [200, 100, 200],
    data: { url: '/#/alarm', alarmId: alarm.id },
    actions: [
      { action: 'done', title: '✅ Sudah Re-apply' },
      { action: 'snooze', title: '⏰ Snooze 10 menit' }
    ]
  };

  self.registration.showNotification(title, options)
    .then(() => console.log(`[SW] ✅ Notifikasi "${alarm.id}" ditampilkan.`))
    .catch(err => console.error('[SW] ❌ Gagal menampilkan notifikasi:', err));
}

// ─── Notification Click Handler ───────────────────────────────────────────────

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};

  if (action === 'snooze') {
    console.log('[SW] Snooze: menjadwalkan ulang +10 menit...');
    scheduleAlarm({
      id: (data.alarmId || 'sunscreen-reminder') + '-snooze',
      title: '☀️ Pengingat Sunscreen (Snooze)',
      body: 'Sudah 10 menit! Jangan lupa re-apply sunscreen ya 😊',
      fireAt: Date.now() + 10 * 60 * 1000
    });
    return;
  }

  // Klik notifikasi atau action 'done' → buka/fokus tab B-Glow
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const targetUrl = self.location.origin + (data.url || '/#/alarm');

      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          client.focus();
          if (client.navigate) client.navigate(targetUrl);
          return;
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// ─── Push Event (untuk Web Push API di masa depan) ───────────────────────────

self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title || '☀️ B-Glow', {
        body: data.body || '',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'bglow-push',
        data: data,
        actions: [
          { action: 'done', title: '✅ Sudah Re-apply' },
          { action: 'snooze', title: '⏰ Snooze 10 menit' }
        ]
      })
    );
  } catch (e) {
    console.error('[SW] Push event error:', e);
  }
});
