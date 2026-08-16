// ─── Konfigurasi API B-Glow ───────────────────────────────────────────────

// URL Backend — ganti sesuai kebutuhan:
// export const API_BASE_URL = 'http://192.168.1.4:5050'; // 🔧 LOCAL (HP / Wi-Fi)
export const API_BASE_URL = 'https://bglow.store';        // 🌐 VPS Production (aktif sekarang)

// Endpoint BPOM Scan (live scraping via backend)
export const BPOM_API_URL = `${API_BASE_URL}/api/scan-bpom`;

// Endpoint Skin Scan (Gemini AI Vision via backend)
export const SKIN_SCAN_API_URL = `${API_BASE_URL}/api/skin-scan`;

// Endpoint Rekomendasi Produk (berbasis ingredien)
export const RECOMMENDATIONS_API_URL = `${API_BASE_URL}/api/recommendations`;

// Konfigurasi Kunci Masuk Sosial (Social Login Client IDs)
export const GOOGLE_CLIENT_ID = '500914454868-ltefle3i4i285epof5sbdigut4ep8sa3.apps.googleusercontent.com';
export const APPLE_CLIENT_ID = '';