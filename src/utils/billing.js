import { setSubscriptionPlan, getUserId } from './store.js';
import { API_BASE_URL } from '../config.js';

export const PRODUCT_GLOW_PLUS = 'glow_plus_monthly';

let _snapLoaded = false;
let _snapClientKey = null;
let _snapScriptUrl = null;

/**
 * Ambil konfigurasi Midtrans dari backend (Client Key aman dari server).
 */
async function fetchPaymentConfig() {
  if (_snapClientKey) return { client_key: _snapClientKey, snap_url: _snapScriptUrl };
  try {
    const res = await fetch(`${API_BASE_URL}/api/payment/config`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    _snapClientKey = data.client_key;
    _snapScriptUrl = data.snap_url;
    return data;
  } catch (e) {
    console.error('[Billing] Gagal mengambil payment config:', e);
    return null;
  }
}

/**
 * Load Midtrans Snap.js secara dinamis (sekali saja per session).
 */
async function loadSnapScript(snapUrl) {
  if (_snapLoaded && window.snap) return true;
  return new Promise((resolve) => {
    // Hapus script lama jika ada (misalnya saat ganti environment)
    const existing = document.getElementById('midtrans-snap-script');
    if (existing) existing.remove();
    _snapLoaded = false;

    const script = document.createElement('script');
    script.id = 'midtrans-snap-script';
    script.src = snapUrl;
    script.setAttribute('data-client-key', _snapClientKey || '');
    script.onload = () => {
      _snapLoaded = true;
      console.log('[Billing] Midtrans Snap.js berhasil dimuat.');
      resolve(true);
    };
    script.onerror = () => {
      console.error('[Billing] Gagal memuat Midtrans Snap.js');
      resolve(false);
    };
    document.head.appendChild(script);
  });
}

/**
 * Ambil token auth dari localStorage.
 */
function getAuthToken() {
  try {
    const userData = JSON.parse(localStorage.getItem('bglow_user') || '{}');
    return userData.token || localStorage.getItem('bglow_token') || null;
  } catch {
    return localStorage.getItem('bglow_token') || null;
  }
}

/**
 * Inisialisasi Billing — preload config Midtrans di background.
 * Tetap ada untuk kompatibilitas dengan Subscription.js.
 */
export function initBilling(onStatusUpdate) {
  fetchPaymentConfig().then(config => {
    if (config) loadSnapScript(config.snap_url);
  });
  return Promise.resolve(false);
}

/**
 * Poll status transaksi Midtrans setiap 3 detik.
 * Sama persis dengan teknik yang dipakai di Rukkamu self-printing.
 * Begitu status 'settlement'/'capture', auto-close popup & aktifkan Glow Plus.
 */
function startPaymentPolling(orderId, token, onSuccess, stopSignal) {
  const POLL_INTERVAL_MS = 3000;
  const MAX_POLL_DURATION_MS = 10 * 60 * 1000; // max 10 menit
  const startTime = Date.now();

  const interval = setInterval(async () => {
    // Stop jika sudah di-handle callback lain atau timeout
    if (stopSignal.handled) {
      clearInterval(interval);
      return;
    }

    if (Date.now() - startTime > MAX_POLL_DURATION_MS) {
      clearInterval(interval);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/payment/transaction-status/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) return; // Gagal poll, coba lagi nanti

      const data = await res.json();
      const status = data.transaction_status;
      const fraud  = data.fraud_status;

      console.log(`[Billing Polling] order=${orderId} status=${status} fraud=${fraud}`);

      const isPaid = (status === 'settlement') ||
                     (status === 'capture' && fraud === 'accept');

      if (isPaid && !stopSignal.handled) {
        stopSignal.handled = true;
        clearInterval(interval);

        // Tutup popup Midtrans otomatis
        try { window.snap.hide(); } catch (e) { /* ignore */ }

        // Aktifkan Glow Plus
        setSubscriptionPlan('glow-plus');
        onSuccess(data);
      }
    } catch (e) {
      // Gagal polling — abaikan, coba lagi di interval berikutnya
      console.warn('[Billing Polling] Error:', e.message);
    }
  }, POLL_INTERVAL_MS);

  return interval;
}

/**
 * Buat transaksi Midtrans dan buka popup Snap Payment.
 * Menggunakan auto-polling sehingga Glow Plus aktif OTOMATIS
 * begitu pembayaran terdeteksi — tanpa klik "Check status".
 *
 * Flow:
 * 1. Minta snap_token dari backend
 * 2. Load Midtrans Snap.js
 * 3. Buka popup + mulai polling setiap 3 detik
 * 4. Begitu paid → window.snap.hide() + aktifkan Glow Plus
 */
export async function purchaseGlowPlus() {
  console.log('[Billing] Memulai pembayaran Midtrans...');

  const token = getAuthToken();
  if (!token) {
    return { success: false, error: 'Silakan login terlebih dahulu.' };
  }

  // 1. Ambil config Midtrans
  const config = await fetchPaymentConfig();
  if (!config || !config.client_key) {
    return { success: false, error: 'Payment gateway tidak tersedia. Coba lagi nanti.' };
  }

  // 2. Minta snap_token dari backend
  let snapToken, orderId;
  try {
    const res = await fetch(`${API_BASE_URL}/api/payment/create-transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ plan: 'glow-plus' })
    });

    const data = await res.json();

    if (!res.ok || !data.snap_token) {
      return {
        success: false,
        error: data.detail || 'Gagal membuat transaksi pembayaran.'
      };
    }

    snapToken = data.snap_token;
    orderId   = data.order_id;
    console.log('[Billing] Snap token diterima, order:', orderId);
  } catch (e) {
    console.error('[Billing] Error create-transaction:', e);
    return { success: false, error: 'Gagal terhubung ke server pembayaran.' };
  }

  // 3. Load Snap.js
  const loaded = await loadSnapScript(config.snap_url);
  if (!loaded || !window.snap) {
    return { success: false, error: 'Gagal memuat halaman pembayaran. Periksa koneksi internet.' };
  }

  // 4. Buka popup + auto-polling
  return new Promise((resolve) => {
    // Shared state untuk koordinasi antara polling & snap callbacks
    const stopSignal = { handled: false };
    let pollInterval = null;

    const handleSuccess = (result) => {
      console.log('[Billing] ✅ Glow Plus aktif via polling/callback!');
      resolve({ success: true, result });
    };

    // Mulai polling setiap 3 detik — deteksi bayar otomatis
    pollInterval = startPaymentPolling(orderId, token, handleSuccess, stopSignal);

    window.snap.pay(snapToken, {
      onSuccess: (result) => {
        if (stopSignal.handled) return;
        stopSignal.handled = true;
        clearInterval(pollInterval);
        setSubscriptionPlan('glow-plus');
        console.log('[Billing] onSuccess callback fired');
        resolve({ success: true, result });
      },
      onPending: async () => {
        // Polling tetap jalan di background — tidak perlu tindakan manual
        console.log('[Billing] onPending — polling tetap aktif di background');
        // Coba cek sekali lagi manual kalau-kalau sudah bayar
        if (!stopSignal.handled) {
          try {
            const res = await fetch(`${API_BASE_URL}/api/payment/transaction-status/${orderId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            const paid = data.transaction_status === 'settlement' ||
                         (data.transaction_status === 'capture' && data.fraud_status === 'accept');
            if (paid && !stopSignal.handled) {
              stopSignal.handled = true;
              clearInterval(pollInterval);
              try { window.snap.hide(); } catch {}
              setSubscriptionPlan('glow-plus');
              resolve({ success: true, result: data });
            }
          } catch {}
        }
      },
      onError: (result) => {
        clearInterval(pollInterval);
        if (stopSignal.handled) return;
        console.error('[Billing] Pembayaran gagal:', result);
        resolve({ success: false, error: 'Pembayaran gagal atau dibatalkan.' });
      },
      onClose: async () => {
        // User tutup popup — polling masih jalan 30 detik lagi untuk jaga-jaga
        if (stopSignal.handled) return;
        console.log('[Billing] Popup ditutup, polling lanjut 30 detik...');

        // Cek sekali langsung
        try {
          const res = await fetch(`${API_BASE_URL}/api/payment/transaction-status/${orderId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          const paid = data.transaction_status === 'settlement' ||
                       (data.transaction_status === 'capture' && data.fraud_status === 'accept');
          if (paid && !stopSignal.handled) {
            stopSignal.handled = true;
            clearInterval(pollInterval);
            setSubscriptionPlan('glow-plus');
            resolve({ success: true, result: data });
            return;
          }
        } catch {}

        // Stop polling setelah 30 detik jika belum ada konfirmasi
        setTimeout(() => {
          if (!stopSignal.handled) {
            stopSignal.handled = true;
            clearInterval(pollInterval);
            resolve({ success: false, cancelled: true, error: 'Pembayaran dibatalkan.' });
          }
        }, 30000);
      }
    });
  });
}

/**
 * Cek status subscription dari backend — untuk restore/verify.
 */
export async function restorePurchases() {
  console.log('[Billing] Mengecek status subscription...');

  const token = getAuthToken();
  const authData = (() => { try { return JSON.parse(localStorage.getItem('bglow_user') || '{}'); } catch { return {}; } })();
  const userId = authData.id || getUserId();

  if (!token || !userId) {
    return { success: false, error: 'Silakan login terlebih dahulu.' };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/user/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) return { success: false, error: 'Gagal memeriksa status langganan.' };

    const data = await res.json();
    const plan = data.subscription_plan || data.plan || 'basic';

    if (plan === 'glow-plus' || plan === 'flawless') {
      setSubscriptionPlan(plan);
      return { success: true };
    }

    return { success: false, error: 'Tidak ada langganan aktif yang ditemukan.' };
  } catch (e) {
    console.error('[Billing] Restore error:', e);
    return { success: false, error: 'Gagal terhubung ke server.' };
  }
}
