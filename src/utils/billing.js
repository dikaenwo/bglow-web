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
 * Load Midtrans Snap.js secara dinamis (sekali saja).
 */
async function loadSnapScript(snapUrl) {
  if (_snapLoaded) return true;
  return new Promise((resolve) => {
    // Hapus script lama jika ada
    const existing = document.getElementById('midtrans-snap-script');
    if (existing) existing.remove();

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
 * Inisialisasi Billing — load config Midtrans dari backend.
 * Placeholder untuk kompatibilitas dengan Subscription.js.
 */
export function initBilling(onStatusUpdate) {
  // Preload config di background
  fetchPaymentConfig().then(config => {
    if (config) {
      loadSnapScript(config.snap_url);
    }
  });
  return Promise.resolve(false);
}

/**
 * Buat transaksi Midtrans dan buka popup Snap Payment.
 * Flow:
 * 1. Minta snap_token dari backend
 * 2. Load Midtrans Snap.js
 * 3. Buka popup pembayaran
 * 4. Handle callback sukses/gagal
 */
export async function purchaseGlowPlus() {
  console.log('[Billing] Memulai pembayaran Midtrans...');

  // Ambil token auth dari localStorage
  const authData = (() => {
    try { return JSON.parse(localStorage.getItem('bglow_user') || '{}'); } catch { return {}; }
  })();
  const token = authData.token || localStorage.getItem('bglow_token');

  if (!token) {
    return { success: false, error: 'Silakan login terlebih dahulu.' };
  }

  // 1. Ambil config Midtrans
  const config = await fetchPaymentConfig();
  if (!config || !config.client_key) {
    return { success: false, error: 'Payment gateway tidak tersedia. Coba lagi nanti.' };
  }

  // 2. Minta snap_token dari backend
  let snapToken;
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
    console.log('[Billing] Snap token diterima:', snapToken);
  } catch (e) {
    console.error('[Billing] Error create-transaction:', e);
    return { success: false, error: 'Gagal terhubung ke server pembayaran.' };
  }

  // 3. Load Snap.js jika belum
  const loaded = await loadSnapScript(config.snap_url);
  if (!loaded || !window.snap) {
    return { success: false, error: 'Gagal memuat halaman pembayaran. Periksa koneksi internet.' };
  }

  // 4. Buka popup pembayaran Midtrans Snap
  return new Promise((resolve) => {
    window.snap.pay(snapToken, {
      onSuccess: (result) => {
        console.log('[Billing] Pembayaran berhasil:', result);
        // Aktifkan premium di localStorage (webhook backend akan update DB)
        setSubscriptionPlan('glow-plus');
        resolve({ success: true, result });
      },
      onPending: (result) => {
        console.log('[Billing] Pembayaran pending:', result);
        resolve({ success: false, pending: true, error: 'Pembayaran sedang diproses. Cek email untuk instruksi selanjutnya.' });
      },
      onError: (result) => {
        console.error('[Billing] Pembayaran gagal:', result);
        resolve({ success: false, error: 'Pembayaran gagal atau dibatalkan.' });
      },
      onClose: () => {
        console.log('[Billing] Popup pembayaran ditutup.');
        resolve({ success: false, cancelled: true, error: 'Pembayaran dibatalkan.' });
      }
    });
  });
}

/**
 * Restore pembelian — cek status subscription dari backend.
 */
export async function restorePurchases() {
  console.log('[Billing] Mengecek status subscription...');

  const authData = (() => {
    try { return JSON.parse(localStorage.getItem('bglow_user') || '{}'); } catch { return {}; }
  })();
  const token = authData.token || localStorage.getItem('bglow_token');
  const userId = authData.id || getUserId();

  if (!token || !userId) {
    return { success: false, error: 'Silakan login terlebih dahulu.' };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/user/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      return { success: false, error: 'Gagal memeriksa status langganan.' };
    }

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
