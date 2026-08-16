import { icons } from '../components/BottomNav.js';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { BPOM_API_URL, API_BASE_URL } from '../config.js';
import { getUserId, getAuthHeaders } from '../utils/store.js';

// Mock BPOM data
const bpomData = [
  { name: 'Somethinc Niacinamide Serum', regNo: 'NA18210100123', manufacturer: 'PT Beautyhaul Indonesia', status: 'registered', barcode: '8991234567890' },
  { name: 'Wardah UV Shield Sunscreen', regNo: 'NA18200500456', manufacturer: 'PT Paragon Technology', status: 'registered', barcode: '8990987654321' },
  { name: 'Skintific 5X Ceramide Moisturizer', regNo: 'NA18220300789', manufacturer: 'PT Skintific Indonesia', status: 'registered', barcode: '8991122334455' },
  { name: 'MS Glow Whitening Cream', regNo: 'NA18190700321', manufacturer: 'PT Kosmetika Global', status: 'registered', barcode: '8995544332211' },
  { name: 'Unknown Beauty Cream X', regNo: '-', manufacturer: 'Unknown', status: 'not-registered', barcode: '0000000000000' },
];

function getLocalBpomHistory(userId) {
  const key = 'bglow_bpom_history_' + userId;
  const data = localStorage.getItem(key);
  if (data) {
    try { return JSON.parse(data); } catch(e) { return []; }
  }
  return [];
}

function saveLocalBpomHistory(userId, list) {
  const key = 'bglow_bpom_history_' + userId;
  localStorage.setItem(key, JSON.stringify(list));
}

async function loadBpomHistoryList(userId) {
  let localList = getLocalBpomHistory(userId);
  if (localList.length === 0 && userId === 'guest') {
    localList = bpomData.slice(0, 3);
    saveLocalBpomHistory(userId, localList);
  }

  if (userId !== 'guest') {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bpom-history/${userId}`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const dbList = await response.json();
        const formatted = dbList.map(item => ({
          name: item.product_name,
          regNo: item.reg_no,
          manufacturer: item.manufacturer,
          status: item.status,
          barcode: item.reg_no
        }));
        saveLocalBpomHistory(userId, formatted);
        return formatted;
      }
    } catch (e) {
      console.error("Failed to load BPOM history from database, using offline cache:", e);
    }
  }
  return localList;
}

async function saveBpomHistoryEntry(userId, product) {
  let list = getLocalBpomHistory(userId);
  list = list.filter(item => !(item.name === product.name && item.regNo === product.regNo));
  list.unshift(product);
  list = list.slice(0, 10);
  saveLocalBpomHistory(userId, list);

  if (userId !== 'guest') {
    try {
      await fetch(`${API_BASE_URL}/api/bpom-history`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          user_id: userId,
          product_name: product.name,
          reg_no: product.regNo,
          manufacturer: product.manufacturer,
          status: product.status
        })
      });
    } catch (e) {
      console.error("Failed to save BPOM history to database:", e);
    }
  }
}

export function renderBpomCheck() {
  const page = document.createElement('div');
  page.className = 'page';
  let html5QrCode;

  function renderMain() {
    page.innerHTML = `
      <div class="page-header">
        <button class="back-btn" id="back-btn">${icons.chevronLeft}</button>
        <h1>Cek BPOM</h1>
      </div>

      <!-- Scanner Styles -->
      <style>
        #reader video {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
          border-radius: 0 0 var(--radius-xl) var(--radius-xl);
        }
        #reader { border: none !important; }
        #reader__scan_region { background: transparent !important; }
        #reader__dashboard_section_csr { display: none !important; }
      </style>

      <!-- Scanner -->
      <div class="bpom-scanner" style="display: block; position: relative;">
        <div class="scanner-feed" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
          <div id="reader" style="width: 100%; height: 100%;"></div>
          <div class="barcode-frame" style="display: none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10; pointer-events: none;">
            <div class="barcode-corner-tr"></div>
            <div class="barcode-corner-bl"></div>
            <div class="laser-line" id="laser-line" style="display: none;"></div>
          </div>
        </div>
        <div class="scanner-label" style="z-index: 20; background: rgba(0,0,0,0.5); padding: 4px 12px; border-radius: 12px; bottom: 12px; left: 50%; transform: translateX(-50%); width: max-content;">Arahkan kamera ke QR Code BPOM</div>
      </div>
      
      <!-- Scanner Controls -->
      <div style="padding: 0 var(--space-lg); margin-top: var(--space-md);">
        <button id="start-scan-btn" class="bpom-search-btn" style="margin-top: 0;">Mulai Scan Kamera</button>
        <button id="stop-scan-btn" class="bpom-search-btn" style="margin-top: 0; display: none; background: var(--danger); color: white;">Hentikan Scan</button>
      </div>

      <!-- Search -->
      <div class="bpom-search anim-fade-in-up">
        <div class="search-divider">atau cari berdasarkan nama / Nomor Registrasi</div>
        <div class="search-input-wrap">
          ${icons.search}
          <input type="text" id="bpom-search-input" placeholder="Masukkan nama atau Nomor Registrasi (NA)..." />
        </div>
        <button class="bpom-search-btn" id="bpom-search-btn" style="margin-top:16px;">Cari Produk</button>

        <!-- Recent Checks -->
        <div class="recent-checks" style="margin-top: 24px;">
          <div class="section-title">Pengecekan Terakhir</div>
          <div id="recent-list"></div>
        </div>
      </div>
    `;

    // Removed static barcode bars generation

    // Recent checks
    const recentList = page.querySelector('#recent-list');
    const userId = getUserId();
    loadBpomHistoryList(userId).then(list => {
      recentList.innerHTML = '';
      if (list.length === 0) {
        recentList.innerHTML = '<div style="color: var(--text-tertiary); font-size: 0.85rem; padding: 10px 0;">Belum ada riwayat pengecekan.</div>';
        return;
      }
      list.forEach(item => {
        const div = document.createElement('div');
        div.className = 'recent-item';
        div.innerHTML = `
          <div class="ri-icon">${icons.bpom}</div>
          <div class="ri-info">
            <div class="ri-name">${item.name}</div>
            <div class="ri-status">${item.status === 'registered' ? '✅ Terdaftar' : '❌ Tidak Ditemukan'}</div>
          </div>
        `;
        div.addEventListener('click', () => showResult(item));
        recentList.appendChild(div);
      });
    });

    page.querySelector('#back-btn').addEventListener('click', () => {
      stopScanner();
      window.location.hash = '#/';
    });

    page.querySelector('#bpom-search-btn').addEventListener('click', () => {
      const query = page.querySelector('#bpom-search-input').value.trim();
      if (query.length > 0) {
        stopScanner();
        startSearch(query);
      }
    });

    page.querySelector('#bpom-search-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = e.target.value.trim();
        if (query.length > 0) {
          stopScanner();
          startSearch(query);
        }
      }
    });

    const startBtn = page.querySelector('#start-scan-btn');
    const stopBtn = page.querySelector('#stop-scan-btn');
    
    startBtn.addEventListener('click', () => {
      startScanner();
      startBtn.style.display = 'none';
      stopBtn.style.display = 'block';
    });
    
    stopBtn.addEventListener('click', () => {
      stopScanner();
      startBtn.style.display = 'block';
      stopBtn.style.display = 'none';
    });
  }

  function startScanner() {
    html5QrCode = new Html5Qrcode("reader", {
      formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ]
    });
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    
    html5QrCode.start({ facingMode: "environment" }, config,
      (decodedText, decodedResult) => {
        stopScanner();
        // Ekstrak nomor registrasi dari URL QR Code BPOM
        let extractedQuery = decodedText.trim();
        // Cek pola NA/NB/NC/ND/NE + 11 digit (format registrasi BPOM)
        const nieMatch = extractedQuery.match(/(N[A-E])[\s\-]?(\d{11})/i);
        if (nieMatch) {
          extractedQuery = nieMatch[1].toUpperCase() + nieMatch[2];
        } else if (extractedQuery.includes('cekbpom.pom.go.id') || extractedQuery.startsWith('http')) {
          // Ambil segment terakhir dari URL
          try {
            const urlObj = new URL(extractedQuery);
            // Cek query param
            const q = urlObj.searchParams.get('query') || urlObj.searchParams.get('q') || urlObj.searchParams.get('id');
            if (q) {
              extractedQuery = q;
            } else {
              const segments = urlObj.pathname.split('/').filter(s => s.length > 0);
              extractedQuery = segments[segments.length - 1] || extractedQuery;
            }
          } catch(e) {
            const parts = extractedQuery.split('/');
            extractedQuery = parts[parts.length - 1].split('?')[0] || extractedQuery;
          }
        }
        startSearch(extractedQuery);
      },
      (errorMessage) => {
        // Scanning...
      }
    ).then(() => {
      const laser = page.querySelector('#laser-line');
      if (laser) laser.style.display = 'block';
    }).catch((err) => {
      console.error("Camera failed to start:", err);
      // Import showCustomAlert dynamically to avoid cyclical dependency if any, or just import at the top
      import('../utils/helpers.js').then(({ showCustomAlert }) => {
        showCustomAlert("Gagal mengakses kamera. Pastikan memberikan izin kamera.", "Akses Kamera Gagal");
      });
      const startBtn = page.querySelector('#start-scan-btn');
      const stopBtn = page.querySelector('#stop-scan-btn');
      if (startBtn && stopBtn) {
        startBtn.style.display = 'block';
        stopBtn.style.display = 'none';
      }
    });
  }

  function stopScanner() {
    const laser = page.querySelector('#laser-line');
    if (laser) laser.style.display = 'none';
    
    if (html5QrCode && html5QrCode.isScanning) {
      html5QrCode.stop().then(() => {
        html5QrCode.clear();
      }).catch(err => {
        console.error("Failed to stop scanner", err);
      });
    }
  }

  function startSearch(query) {
    // Show loading
    page.innerHTML = `
      <div class="page-header">
        <button class="back-btn" id="back-btn">${icons.chevronLeft}</button>
        <h1>Mencari...</h1>
      </div>
      <div class="bpom-loading anim-fade-in">
        <p class="shimmer-text" style="display:inline-block; background: linear-gradient(90deg, var(--text-tertiary), var(--primary), var(--text-tertiary)); background-size: 200% 100%; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: shimmer 2s infinite;">
          Mencari di database BPOM...
        </p>
        <div class="skeleton-cards">
          <div class="skeleton-card">
            <div class="sk-icon skeleton"></div>
            <div class="sk-lines">
              <div class="sk-line w-80 skeleton"></div>
              <div class="sk-line w-60 skeleton"></div>
            </div>
          </div>
          <div class="skeleton-card">
            <div class="sk-icon skeleton"></div>
            <div class="sk-lines">
              <div class="sk-line w-80 skeleton"></div>
              <div class="sk-line w-60 skeleton"></div>
            </div>
          </div>
          <div class="skeleton-card">
            <div class="sk-icon skeleton"></div>
            <div class="sk-lines">
              <div class="sk-line w-80 skeleton"></div>
              <div class="sk-line w-60 skeleton"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    page.querySelector('#back-btn').addEventListener('click', () => renderMain());

    // Request to real BPOM backend with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 detik timeout

    fetch(`${BPOM_API_URL}?na=${encodeURIComponent(query)}`, { signal: controller.signal })
      .then(response => {
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then(data => {
        if (data.results && data.results.length > 0) {
          const res = data.results[0];
          const product = {
            name: res.nama_produk || query,
            regNo: res.nomor_registrasi || '-',
            manufacturer: res.pendaftar || res.merek || 'Unknown',
            status: 'registered',
            barcode: query
          };
          saveBpomHistoryEntry(getUserId(), product);
          showResult(product);
        } else {
          const product = {
            name: query,
            regNo: '-',
            manufacturer: 'Tidak ditemukan di database BPOM',
            status: 'not-registered',
            barcode: query
          };
          saveBpomHistoryEntry(getUserId(), product);
          showResult(product);
        }
      })
      .catch(err => {
        clearTimeout(timeoutId);
        const isTimeout = err.name === 'AbortError';
        const errMsg = isTimeout ? 'Koneksi timeout (30s)' : err.message;
        console.error('Fetch error:', errMsg);
        showResult({
          name: query,
          regNo: '-',
          manufacturer: `⚠️ Gagal: ${errMsg} — pastikan backend menyala & HP terhubung WiFi yang sama`,
          status: 'not-registered',
          barcode: query
        });
      });
  }

  function showResult(product) {
    const isRegistered = product.status === 'registered';

    page.innerHTML = `
      <div class="page-header">
        <button class="back-btn" id="back-btn">${icons.chevronLeft}</button>
        <h1>Hasil Produk</h1>
      </div>
      <div class="bpom-result anim-fade-in">
        <div style="text-align:center; margin-bottom:var(--space-lg);">
          <div class="bpom-status-badge ${isRegistered ? 'registered' : 'not-registered'}">
            ${isRegistered ? icons.check : icons.alert}
            ${isRegistered ? 'Terdaftar BPOM ✓' : 'Tidak Terdaftar ✗'}
          </div>
        </div>

        <div class="bpom-info-cards">
          <div class="bpom-info-card">
            <div class="info-label">Nama Produk</div>
            <div class="info-value">${product.name}</div>
          </div>
          <div class="bpom-info-card">
            <div class="info-label">Nomor Registrasi BPOM</div>
            <div class="info-value">${product.regNo}</div>
          </div>
          <div class="bpom-info-card">
            <div class="info-label">Produsen</div>
            <div class="info-value">${product.manufacturer}</div>
          </div>
          <div class="bpom-info-card">
            <div class="info-label">Status Produk</div>
            <div class="info-value" style="color: ${isRegistered ? 'var(--success)' : 'var(--danger)'};">
              ${isRegistered ? '✅ Terdaftar dan Terverifikasi' : '⚠️ Tidak Ditemukan di Database BPOM'}
            </div>
          </div>
        </div>

        <button class="bpom-search-btn" id="new-search-btn" style="margin-top:24px;">Cek Produk Lain</button>
      </div>
    `;

    page.querySelector('#back-btn').addEventListener('click', () => renderMain());
    page.querySelector('#new-search-btn').addEventListener('click', () => renderMain());
  }

  renderMain();
  return page;
}
