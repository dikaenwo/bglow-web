import { icons } from '../components/BottomNav.js';
import { getRoutine, getProgress, getUserId, syncUserData, isPremium } from '../utils/store.js';
import { renderPaywallPage } from '../utils/helpers.js';

// ─── Skin Journey helpers ────────────────────────────────────────────────
const JOURNEY_PRIORITY_ORDER = ['Jerawat', 'Kemerahan', 'PIE', 'PIH', 'Hiperpigmentasi', 'Bopeng'];

const JOURNEY_COLORS = {
  'Jerawat':         { hex: '#FF3B3B', bg: '#FFF0F0', emoji: '🔴' },
  'PIE':             { hex: '#3B7FFF', bg: '#EFF4FF', emoji: '🔵' },
  'PIH':             { hex: '#FF8C00', bg: '#FFF5E6', emoji: '🟠' },
  'Bopeng':          { hex: '#CC00CC', bg: '#F9EEFF', emoji: '🟣' },
  'Hiperpigmentasi': { hex: '#B8860B', bg: '#FEFEE6', emoji: '🟡' },
  'Kemerahan':       { hex: '#00AA44', bg: '#EDFFF3', emoji: '🟢' },
};

const JOURNEY_INFO_DIARY = {
  'Jerawat': {
    tagline: 'Atasi akar masalahnya dulu',
    done_when: 'Tidak ada jerawat aktif selama ≥ 2 minggu berturut-turut',
    ingredients: ['Salicylic Acid', 'Niacinamide', 'Benzoyl Peroxide'],
    duration: '4–8 minggu',
    good_foods: ['Sayuran Hijau', 'Ikan Salmon/Tuna', 'Buah Beri'],
    avoid_foods: ['Susu & Olahan (Dairy)', 'Makanan Manis', 'Fast Food'],
    exercises: ['Yoga', 'Jalan Kaki Ringan'],
    lifestyle: ['Ganti sarung bantal 2x seminggu', 'Tidur 7-8 jam/hari'],
  },
  'Kemerahan': {
    tagline: 'Tenangkan peradangan kulit',
    done_when: 'Kemerahan berkurang signifikan dan kulit terasa lebih tenang',
    ingredients: ['Centella Asiatica', 'Azelaic Acid', 'Aloe Vera'],
    duration: '6–10 minggu',
    good_foods: ['Ketimun & Seledri', 'Tomat & Wortel', 'Air Putih (Min. 2L)'],
    avoid_foods: ['Makanan Pedas', 'Alkohol & Kafein', 'Makanan Panas'],
    exercises: ['Berenang (suhu sejuk)', 'Pilates'],
    lifestyle: ['Gunakan air suhu ruang untuk cuci muka', 'Hindari sinar matahari langsung'],
  },
  'PIE': {
    tagline: 'Pudarkan kemerahan bekas jerawat',
    done_when: 'Kemerahan bekas jerawat memudar dan warna kulit lebih merata',
    ingredients: ['Azelaic Acid', 'Niacinamide', 'Tranexamic Acid'],
    duration: '8–12 minggu',
    good_foods: ['Jeruk & Kiwi (Vit C)', 'Bayam', 'Brokoli'],
    avoid_foods: ['Gorengan berlebih', 'Makanan ultra-proses'],
    exercises: ['Kardio ringan'],
    lifestyle: ['Re-apply sunscreen tiap 2-3 jam', 'Gunakan soothing gel saat panas'],
  },
  'PIH': {
    tagline: 'Cerahkan flek hitam bekas jerawat',
    done_when: 'Flek hitam memudar dan warna kulit lebih merata',
    ingredients: ['Alpha Arbutin', 'Vitamin C', 'Kojic Acid'],
    duration: '12–24 minggu',
    good_foods: ['Almond', 'Teh Hijau', 'Tomat'],
    avoid_foods: ['Makanan tinggi gula', 'Lemak jahat'],
    exercises: ['Jogging pagi'],
    lifestyle: ['Gunakan topi saat terik', 'Eksfoliasi kimia ringan 1-2x seminggu'],
  },
  'Hiperpigmentasi': {
    tagline: 'Ratakan warna kulit secara menyeluruh',
    done_when: 'Warna kulit lebih merata dan bercak gelap berkurang',
    ingredients: ['Vitamin C', 'Kojic Acid', 'Retinol'],
    duration: '12–20 minggu',
    good_foods: ['Wortel', 'Pepaya', 'Chia Seed'],
    avoid_foods: ['Karbohidrat olahan', 'Minuman bersoda'],
    exercises: ['Bersepeda santai', 'Senam Aerobik'],
    lifestyle: ['Konsisten produk pencerah', 'Jangan memencet kulit'],
  },
  'Bopeng': {
    tagline: 'Pulihkan tekstur kulit',
    done_when: 'Tekstur kulit membaik dan bekas luka cekung berkurang',
    ingredients: ['Retinol', 'Peptide', 'Bakuchiol'],
    duration: '6–12 bulan',
    good_foods: ['Kaldu Tulang (Kolagen)', 'Telur', 'Alpukat'],
    avoid_foods: ['Junk food berlebih'],
    exercises: ['Latihan Beban'],
    lifestyle: ['Gunakan retinol malam hari', 'Pertimbangkan treatment klinis'],
  },
};

function getJourneyState(uid) {
  try {
    return JSON.parse(localStorage.getItem('bglow_journey_state_' + uid) || 'null');
  } catch { return null; }
}

function saveJourneyState(uid, state) {
  localStorage.setItem('bglow_journey_state_' + uid, JSON.stringify(state));
}

function buildJourneySteps(uid) {
  const raw = localStorage.getItem('bglow_skin_problems_' + uid);
  if (!raw) return [];
  try {
    const problems = JSON.parse(raw);
    const detectedLabels = problems.map(p => p.label);
    return JOURNEY_PRIORITY_ORDER
      .filter(label => detectedLabels.includes(label))
      .map((label, idx) => ({ label, stepNum: idx + 1 }));
  } catch { return []; }
}

function getJourneyPhotos(uid) {
  try {
    return JSON.parse(localStorage.getItem('bglow_journey_photos_' + uid) || '{}');
  } catch { return {}; }
}

function saveJourneyPhotos(uid, photos) {
  localStorage.setItem('bglow_journey_photos_' + uid, JSON.stringify(photos));
}

const defaultEntries = [
  {
    date: '13 Mar 2026',
    mood: '😊',
    conditions: [
      { label: 'Kulit Bersih', type: 'good' },
      { label: 'Sedikit Berminyak', type: 'warn' },
    ],
    products: 'Somethinc Niacinamide, Wardah Sunscreen',
    notes: 'Kulit terasa lembap hari ini. T-zone sedikit berminyak di siang hari.',
    image: 'https://images.unsplash.com/photo-1616688587122-eb193c6f443c?auto=format&fit=crop&q=80&w=400'
  },
  {
    date: '12 Mar 2026',
    mood: '😐',
    conditions: [
      { label: 'Jerawat Kecil', type: 'bad' },
      { label: 'Kulit Kering', type: 'warn' },
    ],
    products: 'CeraVe Cleanser, The Ordinary HA',
    notes: 'Muncul jerawat baru di dagu. Mungkin karena moisturizer baru.',
  },
  {
    date: '11 Mar 2026',
    mood: '😊',
    conditions: [
      { label: 'Tekstur Halus', type: 'good' },
      { label: 'Terhidrasi', type: 'good' },
    ],
    products: 'Avoskin Serum, Emina Moisturizer',
    notes: 'Hari yang bagus untuk kulit! Rutinitas pagi bekerja dengan baik.',
  },
];

function getDiaryEntries() {
  const data = localStorage.getItem('bglow_diary_entries_' + getUserId());
  if (data) return JSON.parse(data);
  return [];
}

function saveDiaryEntries(entries) {
  localStorage.setItem('bglow_diary_entries_' + getUserId(), JSON.stringify(entries));
  syncUserData({ diary_entries: JSON.stringify(entries) });
}

const acneData = [3, 5, 4, 2, 3, 1, 2]; // week data
const oilData = [6, 7, 5, 6, 4, 5, 3];
const conditionData = [60, 55, 65, 70, 68, 75, 80]; // percentage
const dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export function renderSkinDiary() {
  // ── Paywall: hanya untuk Glow Plus ─────────────────────────────────────────
  if (!isPremium()) {
    return renderPaywallPage('Jurnal Kulit', '📔', [
      'Catat kondisi kulit harian dengan foto',
      'Skin Journey tracker per masalah kulit',
      'Grafik perkembangan kulit bulanan',
    ]);
  }

  const page = document.createElement('div');
  page.className = 'page';

  const now = new Date();
  let currentMonth = now.getMonth();
  let currentYear = now.getFullYear();
  let selectedDay = now.getDate();
  let isFutureDate = false;

  function renderCalendar(year, month) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();
    const monthName = new Date(year, month).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    // Parse entriedDays from actual diary entries
    const entries = getDiaryEntries();
    const entriedDays = [];
    entries.forEach(entry => {
      try {
        const parts = entry.date.split(' '); // e.g. ['8', 'Jun', '2026']
        if (parts.length === 3) {
          const day = parseInt(parts[0]);
          const monthStr = parts[1].toLowerCase();
          const entryYear = parseInt(parts[2]);
          
          const monthMap = {
            'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'mei': 4, 'jun': 5,
            'jul': 6, 'agu': 7, 'sep': 8, 'okt': 9, 'nov': 10, 'des': 11
          };
          
          let mIdx = -1;
          for (const key in monthMap) {
            if (monthStr.startsWith(key)) {
              mIdx = monthMap[key];
              break;
            }
          }
          
          if (entryYear === year && mIdx === month) {
            entriedDays.push(day);
          }
        }
      } catch (e) {
        console.error("Gagal parse tanggal diary:", e);
      }
    });

    let daysHTML = '';
    const startDay = firstDay === 0 ? 6 : firstDay - 1;

    // Previous month days
    for (let i = startDay - 1; i >= 0; i--) {
      daysHTML += `<div class="cal-day other-month">${prevDays - i}</div>`;
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = d === now.getDate() && month === now.getMonth() && year === now.getFullYear();
      const isSelected = d === selectedDay;
      const hasEntry = entriedDays.includes(d);
      
      // Check if this day is in the future
      const isFuture = (year > now.getFullYear()) || 
                       (year === now.getFullYear() && month > now.getMonth()) ||
                       (year === now.getFullYear() && month === now.getMonth() && d > now.getDate());

      daysHTML += `<div class="cal-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isFuture ? 'future-day' : ''}" data-day="${d}">
        ${d}
        ${hasEntry ? '<span class="day-dot"></span>' : ''}
      </div>`;
    }

    // Next month days
    const totalCells = startDay + daysInMonth;
    const remaining = 7 - (totalCells % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        daysHTML += `<div class="cal-day other-month">${i}</div>`;
      }
    }

    return { monthName, daysHTML };
  }

  let activeTab = 'journey';

  function render() {
    isFutureDate = (currentYear > now.getFullYear()) ||
                   (currentYear === now.getFullYear() && currentMonth > now.getMonth()) ||
                   (currentYear === now.getFullYear() && currentMonth === now.getMonth() && selectedDay > now.getDate());

    const { monthName, daysHTML } = renderCalendar(currentYear, currentMonth);

    page.innerHTML = `
      <div class="page-header">
        <button class="back-btn" id="back-btn">${icons.chevronLeft}</button>
        <h1 style="width: 100%; text-align: center; margin-right: 40px;">Diary Kulit</h1>
      </div>
      <div class="page-content">
        <!-- Calendar -->
        <div class="diary-calendar anim-fade-in">
          <div class="calendar-header">
            <div class="cal-month">${monthName}</div>
            <div class="cal-nav">
              <button id="cal-prev">${icons.chevronLeft}</button>
              <button id="cal-next">${icons.chevronRight}</button>
            </div>
          </div>
          <div class="cal-weekdays">
            <span>Sn</span><span>Sl</span><span>Rb</span><span>Km</span><span>Jm</span><span>Sb</span><span>Mg</span>
          </div>
          <div class="cal-days">${daysHTML}</div>
        </div>

        <!-- Tabs -->
        <div class="diary-tabs">
          <button class="diary-tab ${activeTab === 'journey' ? 'active' : ''}" data-tab="journey">Journey</button>
          <button class="diary-tab ${activeTab === 'foto' ? 'active' : ''}" data-tab="foto">Foto</button>
          <button class="diary-tab ${activeTab === 'progress' ? 'active' : ''}" data-tab="progress">Grafik</button>
        </div>

        <!-- Tab Content -->
        <div id="tab-content"></div>
      </div>

      <!-- FAB hidden -->
    `;

    // Render tab content
    const tabContent = page.querySelector('#tab-content');
    if (activeTab === 'journey') {
      renderJourneyTab(tabContent);
    } else if (activeTab === 'foto') {
      renderPhotoTab(tabContent);
    } else {
      renderProgress(tabContent);
    }

    // Events
    page.querySelector('#back-btn').addEventListener('click', () => {
      window.location.hash = '#/';
    });

    page.querySelectorAll('.diary-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        activeTab = tab.dataset.tab;
        render();
      });
    });

    // Day selection events
    page.querySelectorAll('.cal-days .cal-day').forEach(dayEl => {
      dayEl.addEventListener('click', () => {
        const day = parseInt(dayEl.dataset.day);
        if (day) {
          selectedDay = day;
          render();
        }
      });
    });

    const prevBtn = page.querySelector('#cal-prev');
    const nextBtn = page.querySelector('#cal-next');

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
          currentMonth = 0;
          currentYear++;
        }
        if (currentMonth === now.getMonth() && currentYear === now.getFullYear()) {
          selectedDay = now.getDate();
        } else {
          selectedDay = 1;
        }
        render();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
          currentMonth = 11;
          currentYear--;
        }
        if (currentMonth === now.getMonth() && currentYear === now.getFullYear()) {
          selectedDay = now.getDate();
        } else {
          selectedDay = 1;
        }
        render();
      });
    }

    page.querySelector('#diary-fab')?.addEventListener('click', () => {
      showNewEntryModal();
    });

    // Auto trigger
    if (window.location.hash.includes('?new=true')) {
      showNewEntryModal();
      window.location.hash = '#/diary';
    }
  }

  // ─── JOURNEY TAB (clean, no emoji) ──────────────────────────────
  function renderJourneyTab(container) {
    const uid = getUserId();
    const steps = buildJourneySteps(uid);

    if (steps.length === 0) {
      container.innerHTML = `
        <div class="je-empty">
          <div class="je-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          </div>
          <div class="je-empty-title">Belum Ada Journey</div>
          <div class="je-empty-desc">Lakukan scan kulit terlebih dahulu untuk memulai Skin Journey kamu.</div>
          <button class="je-empty-btn" id="go-scan-btn">Mulai Scan</button>
        </div>
      `;
      container.querySelector('#go-scan-btn').addEventListener('click', () => window.location.hash = '#/scan');
      return;
    }

    let state = getJourneyState(uid);
    if (!state || state.version !== steps.map(s => s.label).join(',')) {
      state = { version: steps.map(s => s.label).join(','), completedLabels: [], startedAt: new Date().toISOString() };
      saveJourneyState(uid, state);
    }

    const completedLabels = state.completedLabels || [];
    const activeStep = steps.find(s => !completedLabels.includes(s.label)) || null;
    const allDone = !activeStep;
    const pct = Math.round(100 * completedLabels.length / steps.length);
    const circumference = 97.4;
    const offset = circumference - (circumference * completedLabels.length / steps.length);

    const stepsHTML = steps.map((step, idx) => {
      const col = JOURNEY_COLORS[step.label] || { hex: '#64748B', bg: '#F1F5F9' };
      const info = JOURNEY_INFO_DIARY[step.label] || {};
      const isDone = completedLabels.includes(step.label);
      const isActive = !isDone && step.label === (activeStep?.label);
      const isLocked = !isDone && !isActive;

      return `
      <div class="jt-step ${isDone ? 'jt-step--done' : isActive ? 'jt-step--active' : 'jt-step--locked'}">
        ${idx < steps.length - 1 ? '<div class="jt-connector"></div>' : ''}
        <div class="jt-step-left">
          <div class="jt-circle" style="${isDone ? 'background:#22c55e; border-color:#22c55e; color:#fff;' : isActive ? `background:${col.hex}; border-color:${col.hex}; color:#fff;` : 'background:var(--bg-card); border-color:var(--border);'}">
            ${isDone
              ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="width:14px;height:14px;"><polyline points="20 6 9 17 4 12"/></svg>'
              : `<span>${step.stepNum}</span>`}
          </div>
        </div>
        <div class="jt-step-body ${isDone ? 'jt-body--done' : isActive ? 'jt-body--active' : ''}" ${isActive ? `style="border-left:3px solid ${col.hex};"` : ''}>
          <div class="jt-step-header">
            <div class="jt-meta-row">
              <span class="jt-status-pill ${isDone ? 'jt-pill--done' : isActive ? 'jt-pill--active' : 'jt-pill--locked'}" ${isActive ? `style="background:${col.hex}12; color:${col.hex}; border-color:${col.hex}30;"` : ''}>
                ${isDone ? 'Selesai' : isActive ? 'Fokus Sekarang' : `Tahap ${step.stepNum}`}
              </span>
              <span class="jt-duration-text">${info.duration || ''}</span>
            </div>
            <div class="jt-label" style="${isActive ? `color:${col.hex};` : isDone ? 'color:#16A34A;' : ''}">${step.label}</div>
            <div class="jt-tagline">${info.tagline || ''}</div>
          </div>

          ${isActive ? `
          <div class="jt-detail-card">
            <div class="jt-when-block">
              <div class="jt-when-heading">Kapan lanjut ke tahap berikutnya?</div>
              <div class="jt-when-body">${info.done_when || ''}</div>
            </div>

            <div class="jt-action-row">
              <button class="jt-find-btn" data-label="${step.label}" style="border-color:${col.hex}20; color:${col.hex};">Cari Produk</button>
              <button class="jt-done-btn" data-label="${step.label}" style="background:${col.hex};">Sudah Membaik</button>
            </div>
          </div>` : ''}

          ${isDone ? `<div class="jt-done-note">Tahap ini sudah selesai</div>` : ''}
          ${isLocked ? `<div class="jt-locked-note">Selesaikan <strong>${steps[idx - 1]?.label || 'tahap sebelumnya'}</strong> terlebih dahulu</div>` : ''}
        </div>
      </div>`;
    }).join('');

    container.innerHTML = `
      <div class="journey-tab-content">
        <div class="jt-header-card">
          <div class="jt-hc-left">
            <div class="jt-hc-title">Skin Journey</div>
            <div class="jt-hc-sub">${completedLabels.length} dari ${steps.length} tahap selesai</div>
            <div class="jt-hc-bar">
              <div class="jt-hc-bar-fill" style="width:${pct}%"></div>
            </div>
          </div>
          <div class="jt-hc-ring">
            <svg viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#E5E7EB" stroke-width="2.5"/>
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#22c55e" stroke-width="2.5"
                stroke-dasharray="${(circumference * completedLabels.length / steps.length).toFixed(1)} ${circumference}"
                stroke-linecap="round" transform="rotate(-90 18 18)"/>
            </svg>
            <span>${pct}%</span>
          </div>
        </div>

        ${allDone ? `
        <div class="jt-celebration">
          <div class="jt-cel-title">Journey Selesai</div>
          <div class="jt-cel-desc">Semua tahap sudah kamu lewati. Scan ulang untuk melihat kondisi kulit terkini.</div>
          <button class="jt-cel-btn" id="jt-rescan-btn">Scan Ulang</button>
        </div>` : ''}

        <div class="jt-steps">${stepsHTML}</div>
      </div>
    `;

    container.querySelectorAll('.jt-done-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const label = btn.dataset.label;
        if (!completedLabels.includes(label)) { completedLabels.push(label); state.completedLabels = completedLabels; saveJourneyState(uid, state); }
        renderJourneyTab(container);
      });
    });
    container.querySelectorAll('.jt-find-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        localStorage.setItem('bglow_journey_priority_' + uid, btn.dataset.label);
        window.location.hash = '#/recommendations';
      });
    });
    const rescanBtn = container.querySelector('#jt-rescan-btn');
    if (rescanBtn) rescanBtn.addEventListener('click', () => window.location.hash = '#/scan');

  }




  // ─── FOTO TAB (folder per periode journey) ──────────────────────
  function renderPhotoTab(container) {
    const uid = getUserId();
    const steps = buildJourneySteps(uid);
    let state = getJourneyState(uid);
    const completedLabels = state?.completedLabels || [];
    const activeStep = steps.find(s => !completedLabels.includes(s.label)) || null;
    let photos = getJourneyPhotos(uid); // { 'Jerawat': [{url, date},...], ... }
    let openFolder = null; // which folder is open, null = folder list view

    function renderFolderList() {
      if (steps.length === 0) {
        container.innerHTML = `
          <div class="je-empty">
            <div class="je-empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg></div>
            <div class="je-empty-title">Belum Ada Folder</div>
            <div class="je-empty-desc">Lakukan scan kulit terlebih dahulu untuk membuat folder foto perjalananmu.</div>
            <button class="je-empty-btn" id="foto-go-scan">Mulai Scan</button>
          </div>`;
        container.querySelector('#foto-go-scan')?.addEventListener('click', () => window.location.hash = '#/scan');
        return;
      }

      const foldersHTML = steps.map(step => {
        const col = JOURNEY_COLORS[step.label] || { hex: '#64748B', bg: '#F1F5F9' };
        const stepPhotos = photos[step.label] || [];
        const isDone = completedLabels.includes(step.label);
        const isActive = step.label === activeStep?.label;
        const previewPhotos = stepPhotos.slice(0, 3);

        return `
        <div class="pf-folder" data-label="${step.label}">
          <div class="pf-folder-header">
            <div class="pf-folder-color" style="background:${col.hex};"></div>
            <div class="pf-folder-info">
              <div class="pf-folder-name">${step.label}</div>
              <div class="pf-folder-meta">
                <span class="pf-folder-count">${stepPhotos.length} foto</span>
                <span class="pf-folder-status ${isDone ? 'pf-status--done' : isActive ? 'pf-status--active' : 'pf-status--locked'}" style="${isActive ? `color:${col.hex};` : ''}">${isDone ? 'Selesai' : isActive ? 'Aktif' : 'Menunggu'}</span>
              </div>
            </div>
            <svg class="pf-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          ${previewPhotos.length > 0 ? `
          <div class="pf-preview-strip">
            ${previewPhotos.map(p => `<div class="pf-preview-thumb" style="background-image:url('${p.url}')"></div>`).join('')}
            ${stepPhotos.length > 3 ? `<div class="pf-preview-more">+${stepPhotos.length - 3}</div>` : ''}
          </div>` : `
          <div class="pf-empty-strip">Belum ada foto untuk periode ini</div>`}
        </div>`;
      }).join('');

      container.innerHTML = `
        <div class="pf-container">
          <div class="pf-header">
            <div class="pf-header-title">Foto Perkembangan</div>
            <div class="pf-header-sub">Folder per periode perjalanan kulitmu</div>
          </div>
          <div class="pf-folders">${foldersHTML}</div>
        </div>
      `;

      container.querySelectorAll('.pf-folder').forEach(folder => {
        folder.addEventListener('click', () => {
          openFolder = folder.dataset.label;
          renderFolderDetail(openFolder);
        });
      });
    }

    function renderFolderDetail(label) {
      photos = getJourneyPhotos(uid);
      const col = JOURNEY_COLORS[label] || { hex: '#64748B', bg: '#F1F5F9' };
      const stepPhotos = photos[label] || [];
      const isActive = label === activeStep?.label;

      const gridHTML = stepPhotos.length > 0
        ? stepPhotos.map((p, i) => `
          <div class="pf-grid-item" data-idx="${i}">
            <img src="${p.url}" alt="Foto ${i+1}" loading="lazy" />
            <div class="pf-grid-meta">${p.date}</div>
          </div>`).join('')
        : `<div class="pf-grid-empty">Belum ada foto. Tambahkan foto perkembanganmu.</div>`;

      container.innerHTML = `
        <div class="pf-detail">
          <div class="pf-detail-header">
            <button class="pf-back-btn" id="pf-back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div>
              <div class="pf-detail-title">${label}</div>
              <div class="pf-detail-sub">${stepPhotos.length} foto</div>
            </div>
            <button class="pf-add-btn" id="pf-add" style="background:${col.hex};">+ Foto</button>
          </div>
          <div class="pf-grid">${gridHTML}</div>
          <input type="file" accept="image/*" id="pf-file-input" style="display:none;" />
        </div>
      `;

      container.querySelector('#pf-back')?.addEventListener('click', () => {
        openFolder = null;
        renderFolderList();
      });

      container.querySelector('#pf-add')?.addEventListener('click', () => {
        container.querySelector('#pf-file-input')?.click();
      });

      container.querySelector('#pf-file-input')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxSize = 800;
            let w = img.width, h = img.height;
            if (w > h) { if (w > maxSize) { h = h * maxSize / w; w = maxSize; } }
            else { if (h > maxSize) { w = w * maxSize / h; h = maxSize; } }
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            const url = canvas.toDataURL('image/jpeg', 0.85);

            const modal = document.createElement('div');
            modal.className = 'pf-modal-overlay';
            
            const conditionOptions = [
              { label: 'Makin Membaik', type: 'good' },
              { label: 'Jerawat Berkurang', type: 'good' },
              { label: 'Kemerahan Pudar', type: 'good' },
              { label: 'Terasa Kering', type: 'warn' },
              { label: 'Lebih Berminyak', type: 'warn' },
              { label: 'Perih / Iritasi', type: 'bad' },
              { label: 'Jerawat Baru', type: 'bad' }
            ];

            const chipsHTML = conditionOptions.map((c, i) => 
              `<button class="pf-modal-chip ${c.type}" data-idx="${i}">${c.label}</button>`
            ).join('');

            modal.innerHTML = `
              <div class="pf-modal">
                <div class="pf-modal-handle"></div>
                <div class="pf-modal-title">Catatan Perkembangan</div>
                <div class="pf-modal-preview" style="background-image: url('${url}')"></div>
                
                <div class="pf-modal-label">Kondisi saat ini:</div>
                <div class="pf-modal-chips">${chipsHTML}</div>

                <textarea class="pf-modal-textarea" id="pf-note-input" placeholder="Apa detail yang kamu rasakan setelah menggunakan produk? (opsional)"></textarea>
                <button class="pf-modal-btn" id="pf-save-btn">Simpan Catatan</button>
              </div>
            `;
            
            modal.addEventListener('click', (ev) => {
              if (ev.target === modal) modal.remove();
            });

            // Toggle chips
            let selectedConditions = [];
            modal.querySelectorAll('.pf-modal-chip').forEach(chip => {
              chip.addEventListener('click', () => {
                const idx = parseInt(chip.dataset.idx);
                const condition = conditionOptions[idx];
                const exists = selectedConditions.findIndex(c => c.label === condition.label);
                
                if (exists >= 0) {
                  selectedConditions.splice(exists, 1);
                  chip.classList.remove('selected');
                } else {
                  selectedConditions.push(condition);
                  chip.classList.add('selected');
                }
              });
            });
            
            modal.querySelector('#pf-save-btn').addEventListener('click', () => {
              const notes = modal.querySelector('#pf-note-input').value.trim();
              const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
              photos = getJourneyPhotos(uid);
              if (!photos[label]) photos[label] = [];
              photos[label].unshift({ url, date: dateStr, notes, conditions: selectedConditions });
              saveJourneyPhotos(uid, photos);

              // Auto-sync to diary entries as well
              try {
                const dEntries = getDiaryEntries();
                dEntries.unshift({
                  date: dateStr,
                  mood: selectedConditions.some(c => c.type === 'bad') ? '😟' : '😊',
                  conditions: selectedConditions,
                  products: label,
                  notes: notes || `Foto perkembangan: ${label}`,
                  image: url
                });
                saveDiaryEntries(dEntries);
              } catch (e) { console.warn("Sync diary entry error:", e); }

              modal.remove();
              renderFolderDetail(label);
            });
            
            document.body.appendChild(modal);
          };
          img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
      });

      // Tap photo to enlarge
      container.querySelectorAll('.pf-grid-item').forEach(item => {
        item.addEventListener('click', () => {
          const idx = parseInt(item.dataset.idx);
          const p = stepPhotos[idx];
          if (!p) return;
          let conditionsHTML = '';
          if (p.conditions && p.conditions.length > 0) {
            conditionsHTML = '<div style="display:flex; gap:6px; flex-wrap:wrap; justify-content:center; margin-top:6px; margin-bottom:8px;">' +
              p.conditions.map(c => {
                let bg = '#333', col = '#fff', border = '#555';
                if (c.type === 'good') { bg = 'rgba(5, 150, 105, 0.2)'; col = '#34D399'; border = '#059669'; }
                if (c.type === 'warn') { bg = 'rgba(217, 119, 6, 0.2)'; col = '#FBBF24'; border = '#D97706'; }
                if (c.type === 'bad') { bg = 'rgba(220, 38, 38, 0.2)'; col = '#F87171'; border = '#DC2626'; }
                return `<span style="background:${bg}; color:${col}; border:1px solid ${border}; padding:4px 10px; border-radius:100px; font-size:11px; font-weight:600;">${c.label}</span>`;
              }).join('') +
              '</div>';
          }

          const overlay = document.createElement('div');
          overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:200;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;';
          overlay.innerHTML = `
            <img src="${p.url}" style="max-width:92vw;max-height:55vh;border-radius:12px;object-fit:contain;" />
            <div style="color:rgba(255,255,255,0.6);font-size:13px; margin-top:4px;">${p.date}</div>
            ${conditionsHTML}
            ${p.notes ? `<div class="pf-enlarged-notes">"${p.notes}"</div>` : ''}
            <button id="pf-del-btn" style="padding:10px 20px;border-radius:10px;background:#EF4444;color:#fff;border:none;font-weight:600;font-size:14px;cursor:pointer; margin-top:4px;">Hapus Foto</button>
          `;
          overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
          overlay.querySelector('#pf-del-btn').addEventListener('click', () => {
            photos = getJourneyPhotos(uid);
            if (photos[label]) { photos[label].splice(idx, 1); saveJourneyPhotos(uid, photos); }
            overlay.remove();
            renderFolderDetail(label);
          });
          document.body.appendChild(overlay);
        });
      });
    }

    if (openFolder) renderFolderDetail(openFolder);
    else renderFolderList();
  }

  function renderEntries(container) {
    if (isFutureDate) {
      container.innerHTML = `
        <div class="empty-state anim-fade-in" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 40px 20px; text-align:center; background: var(--bg-card); border-radius: 16px; border: 1px dashed var(--border-light); margin: 16px 0;">
          <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(99, 102, 241, 0.12); color: var(--primary); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto;">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h3 style="color:var(--text-secondary); font-size:0.95rem; font-weight:500; line-height: 1.5;">Belum dapat mengisi catatan dan perkembangan</h3>
        </div>
      `;
      return;
    }

    const entries = getDiaryEntries();
    const dateStr = new Date(currentYear, currentMonth, selectedDay).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const filteredEntries = entries.filter(e => e.date === dateStr);

    if (filteredEntries.length === 0) {
      container.innerHTML = `
        <div class="empty-state anim-fade-in" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 40px 20px; text-align:center; background: var(--bg-card); border-radius: 16px; border: 1px dashed var(--border-light); margin: 16px 0;">
          <div style="font-size:3.5rem; margin-bottom:16px;">📔</div>
          <h3 style="margin-bottom:8px; color: var(--text-primary); font-size: 1.1rem; font-weight: 600;">Belum Ada Catatan</h3>
          <p style="color:var(--text-secondary); margin-bottom:16px; line-height:1.5; font-size:0.85rem;">
            Catat perkembangan kulit Anda pada tanggal <strong>${dateStr}</strong> dengan menekan tombol "+" di bawah.
          </p>
        </div>
      `;
      return;
    }

    let html = '<div class="diary-entries">';
    filteredEntries.forEach((entry, idx) => {
      const originalIdx = entries.findIndex(e => e.date === entry.date && e.notes === entry.notes);
      html += `
        <div class="diary-entry-card" data-idx="${originalIdx}">
          ${entry.image ? `<div class="de-img-thumb" style="background-image: url('${entry.image}')"></div>` : ''}
          <div class="de-content">
            <div class="de-header">
              <div class="de-date">${entry.date}</div>
              <div class="de-mood">${entry.mood}</div>
            </div>
            <div class="de-condition">
              ${entry.conditions.map(c => `<span class="de-tag ${c.type}">${c.label}</span>`).join('')}
            </div>
            <div class="de-products"><strong>Produk:</strong> ${entry.products}</div>
            <div class="de-notes">${entry.notes}</div>
          </div>
        </div>
      `;
    });
    html += '</div>';
    container.innerHTML = html;

    // Attach click to open detail
    container.querySelectorAll('.diary-entry-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.idx);
        showEntryDetailModal(entries[idx]);
      });
    });
  }

  function showEntryDetailModal(entry) {
    const overlay = document.createElement('div');
    overlay.className = 'diary-modal-overlay';
    overlay.innerHTML = `
      <div class="diary-modal detail-modal">
        <div class="modal-handle"></div>
        <div class="detail-header">
          <div class="dh-date">${entry.date}</div>
          <div class="dh-mood">${entry.mood}</div>
        </div>
        
        ${entry.image ? `<div class="detail-image" style="background-image: url('${entry.image}')"></div>` : ''}
        
        <div class="detail-section">
          <h4>Kondisi Kulit</h4>
          <div class="de-condition">
            ${entry.conditions.map(c => `<span class="de-tag ${c.type}">${c.label}</span>`).join('')}
          </div>
        </div>

        <div class="detail-section">
          <h4>Produk Digunakan</h4>
          <p>${entry.products || '-'}</p>
        </div>

        <div class="detail-section">
          <h4>Catatan & Reaksi</h4>
          <p>${entry.notes || '-'}</p>
        </div>

        <button class="btn btn-primary detail-close-btn" style="margin-top:20px; width:100%">Tutup</button>
      </div>
    `;

    overlay.querySelector('.detail-close-btn').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
    document.body.appendChild(overlay);
  }

  function renderProgress(container) {
    const uid = getUserId();
    const entries = getDiaryEntries();
    const photos = getJourneyPhotos(uid);

    // Scan history for skin score progress chart
    const scanHistory = (() => {
      try {
        return JSON.parse(localStorage.getItem('bglow_scan_history_' + uid) || '[]');
      } catch { return []; }
    })();
    // Oldest first for the chart
    const scanChronological = [...scanHistory].reverse();

    let allPhotos = [];
    Object.keys(photos).forEach(label => {
      allPhotos = allPhotos.concat(photos[label]);
    });

    // Build per-day sentiment data from diary entries + journey photos (last 14 days)
    const today = new Date();
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push(d);
    }

    const monthShort = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

    function getDayMonthYearKey(input) {
      if (!input) return '';
      if (input instanceof Date) {
        return `${input.getFullYear()}-${input.getMonth() + 1}-${input.getDate()}`;
      }
      if (typeof input === 'number') {
        const d = new Date(input);
        return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      }

      const str = String(input).trim().toLowerCase();
      if (!str) return '';

      let month = 0;
      if (str.includes('jan')) month = 1;
      else if (str.includes('feb')) month = 2;
      else if (str.includes('mar')) month = 3;
      else if (str.includes('apr')) month = 4;
      else if (str.includes('mei') || str.includes('may')) month = 5;
      else if (str.includes('jun')) month = 6;
      else if (str.includes('jul')) month = 7;
      else if (str.includes('ag') || str.includes('au')) month = 8;
      else if (str.includes('sep')) month = 9;
      else if (str.includes('okt') || str.includes('oct')) month = 10;
      else if (str.includes('nov')) month = 11;
      else if (str.includes('des') || str.includes('dec')) month = 12;

      const nums = str.match(/\d+/g);
      if (!nums || nums.length === 0) return '';

      let day = 0, year = 0;

      if (month > 0) {
        if (nums.length >= 2) {
          if (nums[0].length === 4) {
            year = parseInt(nums[0]); day = parseInt(nums[1]);
          } else {
            day = parseInt(nums[0]); year = parseInt(nums[1]);
            if (year < 100) year += 2000;
          }
        } else {
          day = parseInt(nums[0]); year = new Date().getFullYear();
        }
      } else {
        if (nums.length >= 3) {
          if (nums[0].length === 4) {
            year = parseInt(nums[0]); month = parseInt(nums[1]); day = parseInt(nums[2]);
          } else {
            day = parseInt(nums[0]); month = parseInt(nums[1]); year = parseInt(nums[2]);
            if (year < 100) year += 2000;
          }
        } else if (nums.length === 2) {
          day = parseInt(nums[0]); month = parseInt(nums[1]); year = new Date().getFullYear();
        } else {
          day = parseInt(nums[0]); month = new Date().getMonth() + 1; year = new Date().getFullYear();
        }
      }

      return `${year}-${month}-${day}`;
    }

    // Build synthetic entries from journey photo conditions so they appear in the chart
    const photoEntries = allPhotos
      .filter(p => p.conditions && p.conditions.length > 0 && p.date)
      .map(p => ({ date: p.date, conditions: p.conditions }));

    // Merge diary entries + photo entries for chart calculations
    const allConditionEntries = [...entries, ...photoEntries];

    // Score: good=85%, warn=55%, bad=35% → clear visible levels for all logged conditions
    const scoreByDay = days.map(d => {
      const targetKey = getDayMonthYearKey(d);
      const dayEntries = allConditionEntries.filter(e => getDayMonthYearKey(e.date) === targetKey);
      if (dayEntries.length === 0) return null;
      let totalScore = 0, count = 0;
      dayEntries.forEach(e => {
        (e.conditions || []).forEach(c => {
          if (c.type === 'good') totalScore += 85;
          else if (c.type === 'warn') totalScore += 55;
          else if (c.type === 'bad') totalScore += 35;
          else totalScore += 55;
          count++;
        });
      });
      return count > 0 ? Math.round(totalScore / count) : 35;
    });

    // Fail-safe: if allConditionEntries has data but no day matched in scoreByDay, assign to latest day
    if (allConditionEntries.length > 0 && scoreByDay.every(v => v === null)) {
      let totalScore = 0, count = 0;
      allConditionEntries.forEach(e => {
        (e.conditions || []).forEach(c => {
          if (c.type === 'good') totalScore += 85;
          else if (c.type === 'warn') totalScore += 55;
          else if (c.type === 'bad') totalScore += 35;
          else totalScore += 55;
          count++;
        });
      });
      if (count > 0) {
        scoreByDay[scoreByDay.length - 1] = Math.round(totalScore / count);
      }
    }

    // Build SVG line chart
    function buildLineChart(data, labelDays) {
      const W = 340, H = 160, PAD_L = 36, PAD_R = 16, PAD_T = 24, PAD_B = 28;
      const cW = W - PAD_L - PAD_R;
      const cH = H - PAD_T - PAD_B;

      // Clamped Y position so score=0 (or 0%) stays 8px above bottom line and doesn't get clipped
      const yForScore = (v) => PAD_T + (1 - Math.max(v, 6) / 100) * cH;

      // Map days with data to coordinates
      const points = data.map((v, i) => {
        const x = PAD_L + (i / (data.length - 1)) * cW;
        const y = v !== null ? yForScore(v) : null;
        return { x, y, v, i };
      }).filter(p => p.y !== null);

      if (points.length === 0) return `<text x="${W/2}" y="${H/2}" text-anchor="middle" fill="var(--text-tertiary)" font-size="12">Belum ada data</text>`;

      // If only 1 data point, create a baseline starting point from day 0 at 50% height so a line connects across
      let linePoints = [...points];
      if (points.length === 1) {
        const firstX = PAD_L;
        const firstY = yForScore(50);
        if (points[0].i > 0) {
          linePoints = [{ x: firstX, y: firstY, v: 50, isBaseline: true }, points[0]];
        }
      }

      // Smooth bezier path
      function bezier(pts) {
        if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
        let d = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 0; i < pts.length - 1; i++) {
          const cpX = (pts[i].x + pts[i+1].x) / 2;
          d += ` C ${cpX} ${pts[i].y}, ${cpX} ${pts[i+1].y}, ${pts[i+1].x} ${pts[i+1].x ? pts[i+1].y : pts[i].y}`;
        }
        return d;
      }

      const linePath = bezier(linePoints);
      const areaPath = linePath + ` L ${linePoints[linePoints.length-1].x} ${PAD_T + cH} L ${linePoints[0].x} ${PAD_T + cH} Z`;

      // Y axis labels
      const yLabels = ['Buruk', '50%', 'Baik'];
      const yLabelYs = [PAD_T + cH, PAD_T + cH/2, PAD_T + 4];

      // X axis ticks — show every 3-4 days + ALWAYS show the last day (today)
      const xTicks = data.map((_, i) => {
        if (i === 0 || i === data.length - 1 || (i % 3 === 0)) {
          const d = labelDays[i];
          return { x: PAD_L + (i / (data.length - 1)) * cW, label: `${d.getDate()}/${d.getMonth()+1}` };
        }
        return null;
      }).filter(Boolean);

      // Data point dots + score text labels
      const dots = points.map(p => {
        const color = p.v >= 60 ? '#10B981' : p.v >= 35 ? '#F59E0B' : '#EF4444';
        const labelY = p.y - 8;
        return `
          <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="6" fill="${color}" stroke="white" stroke-width="2.5"/>
          <text x="${p.x.toFixed(1)}" y="${labelY.toFixed(1)}" text-anchor="middle" font-size="9" font-weight="800" fill="${color}" font-family="inherit">${p.v}%</text>`;
      }).join('');

      return `
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#3B82F6" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <!-- Grid lines -->
        ${[0, 0.5, 1].map(r => `<line x1="${PAD_L}" y1="${(PAD_T + r * cH).toFixed(1)}" x2="${W - PAD_R}" y2="${(PAD_T + r * cH).toFixed(1)}" stroke="var(--border-light)" stroke-width="1" stroke-dasharray="4 4"/>`).join('')}
        <!-- Y labels -->
        ${yLabels.map((l, i) => `<text x="${PAD_L - 5}" y="${yLabelYs[i] + 4}" text-anchor="end" font-size="9" fill="var(--text-tertiary)" font-family="inherit">${l}</text>`).join('')}
        <!-- X labels -->
        ${xTicks.map(t => `<text x="${t.x.toFixed(1)}" y="${PAD_T + cH + 16}" text-anchor="middle" font-size="9" fill="var(--text-tertiary)" font-family="inherit">${t.label}</text>`).join('')}
        <!-- Area fill -->
        <path d="${areaPath}" fill="url(#areaGrad)"/>
        <!-- Thick Line (Excel style) -->
        <path d="${linePath}" fill="none" stroke="#2563EB" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Dots and score text -->
        ${dots}
      `;
    }

    // Sentiment totals — from diary entries + journey photo conditions combined
    let totalGood = 0, totalWarn = 0, totalBad = 0;
    const conditionCounts = {};
    allConditionEntries.forEach(e => {
      (e.conditions || []).forEach(c => {
        conditionCounts[c.label] = (conditionCounts[c.label] || 0) + 1;
        if (c.type === 'good') totalGood++;
        else if (c.type === 'warn') totalWarn++;
        else if (c.type === 'bad') totalBad++;
      });
    });
    const total = totalGood + totalWarn + totalBad;
    const goodPct = total > 0 ? Math.round(totalGood / total * 100) : 0;
    const warnPct = total > 0 ? Math.round(totalWarn / total * 100) : 0;
    const badPct = total > 0 ? Math.round(totalBad / total * 100) : 0;

    // Donut chart SVG
    function buildDonut(good, warn, bad) {
      const cx = 60, cy = 60, r = 46, stroke = 12;
      const circ = 2 * Math.PI * r;
      const gArc = circ * good / 100;
      const wArc = circ * warn / 100;
      const bArc = circ * bad / 100;
      const gOffset = -circ * 0.25;
      const wOffset = gOffset - gArc;
      const bOffset = wOffset - wArc;
      const dominantColor = good >= warn && good >= bad ? '#10B981' : bad >= warn ? '#EF4444' : '#F59E0B';
      const dominantPct = good >= warn && good >= bad ? good : bad >= warn ? bad : warn;

      return `
        <svg viewBox="0 0 120 120" width="110" height="110" style="display:block;margin:auto;">
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--border-light)" stroke-width="${stroke}"/>
          ${good > 0 ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#10B981" stroke-width="${stroke}"
            stroke-dasharray="${gArc.toFixed(2)} ${circ.toFixed(2)}" stroke-dashoffset="${gOffset.toFixed(2)}"
            stroke-linecap="butt" transform="rotate(0 ${cx} ${cy})"/>` : ''}
          ${warn > 0 ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#F59E0B" stroke-width="${stroke}"
            stroke-dasharray="${wArc.toFixed(2)} ${circ.toFixed(2)}" stroke-dashoffset="${wOffset.toFixed(2)}"
            stroke-linecap="butt"/>` : ''}
          ${bad > 0 ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#EF4444" stroke-width="${stroke}"
            stroke-dasharray="${bArc.toFixed(2)} ${circ.toFixed(2)}" stroke-dashoffset="${bOffset.toFixed(2)}"
            stroke-linecap="butt"/>` : ''}
          <text x="${cx}" y="${cy - 5}" text-anchor="middle" font-size="18" font-weight="800" fill="${dominantColor}" font-family="inherit">${dominantPct}%</text>
          <text x="${cx}" y="${cy + 12}" text-anchor="middle" font-size="9" fill="var(--text-tertiary)" font-family="inherit">kondisi baik</text>
        </svg>`;
    }

    const topConditions = Object.entries(conditionCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const hasEntries = allConditionEntries.length > 0;

    // Build skin score progress bar chart from scan history
    function buildScoreBarChart(scans) {
      if (scans.length === 0) {
        return `<div class="chart-empty" style="margin-top:8px;">Belum ada riwayat scan AI. Lakukan scan untuk melihat grafik kenaikan skor kulit.</div>`;
      }
      const maxScore = 100;
      const barW = Math.min(36, Math.floor(280 / scans.length));
      const gap = Math.max(6, Math.floor((280 - barW * scans.length) / (scans.length + 1)));
      const chartH = 140;
      const labelH = 32;
      const totalW = Math.max(280, scans.length * (barW + gap) + gap);

      let bars = '', xLabels = '', deltas = '';
      scans.forEach((s, i) => {
        const score = s.skin_score || 0;
        const x = gap + i * (barW + gap);
        const barH = Math.max(12, Math.round((score / maxScore) * chartH));
        const y = chartH - barH;

        let color = '#10B981';
        if (i === 0) {
          color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
        } else {
          const prev = scans[i - 1].skin_score || 0;
          if (score > prev) {
            color = '#10B981'; // Green for positive increase (Kenaikan)!
          } else if (score === prev) {
            color = '#3B82F6';
          } else {
            color = '#EF4444';
          }
        }
        const lightColor = color === '#10B981' ? 'rgba(16,185,129,0.18)' : color === '#3B82F6' ? 'rgba(59,130,246,0.18)' : 'rgba(239,68,68,0.15)';

        // Bar with rounded top
        bars += `
          <rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="6" ry="6" fill="${lightColor}"/>
          <rect x="${x}" y="${y}" width="${barW}" height="${Math.min(barH, 8)}" rx="4" ry="4" fill="${color}"/>
          <rect x="${x}" y="${y + 4}" width="${barW}" height="${Math.max(0, barH - 4)}" rx="0" ry="0" fill="${color}" opacity="0.85"/>
          <text x="${x + barW/2}" y="${y - 4}" text-anchor="middle" font-size="9" font-weight="800" fill="${color}" font-family="inherit">${score}</text>`;

        // X label: short date
        const dateParts = (s.date || '').split(' ');
        const shortDate = dateParts.length >= 2 ? `${dateParts[0]} ${dateParts[1]}` : (s.date || '');
        xLabels += `<text x="${x + barW/2}" y="${chartH + 14}" text-anchor="middle" font-size="8" fill="var(--text-tertiary)" font-family="inherit">${shortDate}</text>`;

        // Delta arrow between bars
        if (i > 0) {
          const prev = scans[i - 1].skin_score || 0;
          const diff = score - prev;
          if (diff !== 0) {
            const midX = x - gap / 2;
            const midY = chartH - Math.round(((score + prev) / 2 / maxScore) * chartH) - 14;
            const arrow = diff > 0 ? '▲' : '▼';
            const dColor = diff > 0 ? '#10B981' : '#EF4444';
            deltas += `<text x="${midX}" y="${midY}" text-anchor="middle" font-size="8" font-weight="700" fill="${dColor}" font-family="inherit">${arrow}${Math.abs(diff)}</text>`;
          }
        }
      });

      // Grid lines
      const grids = [0, 25, 50, 75, 100].map(v => {
        const gy = chartH - Math.round((v / 100) * chartH);
        return `<line x1="0" y1="${gy}" x2="${totalW}" y2="${gy}" stroke="var(--border-light)" stroke-width="1" stroke-dasharray="3 3"/>
                <text x="${-4}" y="${gy + 3}" text-anchor="end" font-size="8" fill="var(--text-tertiary)" font-family="inherit">${v}</text>`;
      }).join('');

      return `
        <div style="overflow-x:auto; padding-bottom:4px;">
          <svg viewBox="0 ${-8} ${totalW + 18} ${chartH + labelH + 8}" width="100%" style="min-width:${Math.min(totalW, 280)}px; display:block; overflow:visible;">
            <g transform="translate(18,8)">
              ${grids}
              ${bars}
              ${deltas}
              ${xLabels}
            </g>
          </svg>
        </div>`;
    }

    // Summary: first vs latest score delta
    let scoreDeltaHTML = '';
    if (scanChronological.length >= 2) {
      const first = scanChronological[0].skin_score || 0;
      const latest = scanChronological[scanChronological.length - 1].skin_score || 0;
      const diff = latest - first;
      const dColor = diff > 0 ? '#10B981' : diff < 0 ? '#EF4444' : '#6b7280';
      const iconBg = diff > 0 ? 'rgba(16,185,129,0.12)' : diff < 0 ? 'rgba(239,68,68,0.12)' : 'rgba(107,114,128,0.12)';
      const iconSvg = diff > 0
        ? `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`
        : `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>`;

      scoreDeltaHTML = `
        <div style="display:flex; align-items:center; gap:12px; margin-top:12px; padding:12px 14px; background:var(--bg-soft); border-radius:12px;">
          <div style="width:40px; height:40px; border-radius:10px; background:${iconBg}; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            ${iconSvg}
          </div>
          <div>
            <div style="font-size:11px; color:var(--text-tertiary); font-weight:500;">Perubahan skor sejak scan pertama</div>
            <div style="font-size:1.05rem; font-weight:800; color:${dColor};">${diff >= 0 ? '+' : ''}${diff} poin · ${latest}/100</div>
          </div>
        </div>`;
    } else if (scanChronological.length === 1) {
      const score = scanChronological[0].skin_score || 0;
      const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
      scoreDeltaHTML = `
        <div style="display:flex; align-items:center; gap:12px; margin-top:12px; padding:12px 14px; background:var(--bg-soft); border-radius:12px;">
          <div style="width:40px; height:40px; border-radius:10px; background:rgba(99,102,241,0.12); display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:1.3rem;">
            🩺
          </div>
          <div>
            <div style="font-size:11px; color:var(--text-tertiary); font-weight:500;">Skor scan terakhirmu</div>
            <div style="font-size:1.05rem; font-weight:800; color:${color};">${score}/100</div>
          </div>
        </div>`;
    }

    container.innerHTML = `
      <div class="progress-section">

        <!-- Line Chart: Trend -->
        <div class="chart-card anim-fade-in-up">
          <div class="chart-title">📈 Tren Kondisi Kulit (14 Hari)</div>
          <div class="chart-legend">
            <span class="cl-dot" style="background:#10B981;"></span><span>Baik</span>
            <span class="cl-dot" style="background:#F59E0B;"></span><span>Netral</span>
            <span class="cl-dot" style="background:#EF4444;"></span><span>Keluhan</span>
          </div>
          <div style="overflow-x:auto;">
            <svg viewBox="0 0 340 150" width="100%" style="min-width:280px; display:block;">
              ${buildLineChart(scoreByDay, days)}
            </svg>
          </div>
          ${!hasEntries ? '<div class="chart-empty">Tambah catatan diary untuk melihat grafik tren</div>' : ''}
        </div>

        <!-- Donut + Sentiment -->
        <div class="chart-card anim-fade-in-up anim-delay-2">
          <div class="chart-title">🎯 Sentimen Keseluruhan</div>
          ${total === 0
            ? '<div class="chart-empty">Belum ada tag kondisi yang dipilih pada catatan diary</div>'
            : `<div style="display:flex; align-items:center; gap:20px;">
                ${buildDonut(goodPct, warnPct, badPct)}
                <div style="display:flex; flex-direction:column; gap:10px; flex:1;">
                  <div class="sent-row"><span class="sent-dot" style="background:#10B981;"></span><div><div class="sent-label">Membaik</div><div class="sent-val" style="color:#10B981;">${goodPct}%</div></div></div>
                  <div class="sent-row"><span class="sent-dot" style="background:#F59E0B;"></span><div><div class="sent-label">Netral</div><div class="sent-val" style="color:#F59E0B;">${warnPct}%</div></div></div>
                  <div class="sent-row"><span class="sent-dot" style="background:#EF4444;"></span><div><div class="sent-label">Keluhan</div><div class="sent-val" style="color:#EF4444;">${badPct}%</div></div></div>
                </div>
              </div>`
          }
        </div>

        <!-- Top Conditions -->
        ${topConditions.length > 0 ? `
        <div class="chart-card anim-fade-in-up anim-delay-4">
          <div class="chart-title">🔖 Kondisi Paling Sering</div>
          <div style="display:flex; flex-direction:column; gap:14px; margin-top:4px;">
            ${topConditions.map(([label, count], idx) => {
              const maxCount = topConditions[0][1];
              const w = Math.max(8, Math.round((count / maxCount) * 100));
              const colors = ['#8B5CF6','#3B82F6','#10B981','#F59E0B','#EF4444'];
              const c = colors[idx % colors.length];
              return `
              <div>
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                  <span style="font-size:12px; font-weight:600; color:var(--text-secondary);">${label}</span>
                  <span style="font-size:11px; font-weight:800; color:${c};">${count}x</span>
                </div>
                <div style="background:var(--bg-soft); height:7px; border-radius:100px; overflow:hidden;">
                  <div style="width:${w}%; background:${c}; height:100%; border-radius:100px; transition:width 1.2s ease;"></div>
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>` : ''}

        <!-- Stats row -->
        <div class="stats-row">
          <div class="stat-mini">
            <div class="stat-mini-val">${allConditionEntries.length}</div>
            <div class="stat-mini-label">Catatan</div>
          </div>
          <div class="stat-mini">
            <div class="stat-mini-val">${allPhotos.length}</div>
            <div class="stat-mini-label">Foto</div>
          </div>
          <div class="stat-mini">
            <div class="stat-mini-val">${goodPct}%</div>
            <div class="stat-mini-label">Positif</div>
          </div>
        </div>

      </div>
    `;
  }

  function showNewEntryModal() {
    let selectedImageURL = null;
    let localStream = null;

    const stopLocalStream = () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
      }
    };

    const overlay = document.createElement('div');
    overlay.className = 'diary-modal-overlay';
    overlay.innerHTML = `
      <div class="diary-modal">
        <div class="modal-handle"></div>
        <div class="modal-title">Catatan Diary Baru</div>

        <div class="modal-field">
          <label>Foto Kulit (Opsional)</label>
          <div class="image-upload-wrapper">
            <input type="file" id="diary-image-camera" accept="image/*" capture="environment" style="display:none;" />
            <input type="file" id="diary-image-gallery" accept="image/*" style="display:none;" />
            
            <div id="upload-buttons-container" style="display:flex; gap: 10px;">
              <button class="image-upload-btn" id="camera-trigger-btn" style="flex: 1; padding: 12px; font-size: 0.85rem; justify-content: center;">
                ${icons.camera || '📷'} Ambil Foto
              </button>
              <button class="image-upload-btn" id="gallery-trigger-btn" style="flex: 1; padding: 12px; font-size: 0.85rem; justify-content: center;">
                🖼️ Pilih Galeri
              </button>
            </div>

            <!-- Webcam stream container -->
            <div id="camera-stream-container" style="display:none; flex-direction:column; gap:10px; align-items:center; margin-top:10px;">
              <video id="diary-webcam" autoplay playsinline style="width: 100%; max-height: 240px; border-radius: 12px; background: #000; object-fit: cover; transform: scaleX(-1);"></video>
              <div style="display:flex; gap: 10px; width: 100%;">
                <button class="btn btn-outline" id="camera-cancel-btn" style="flex: 1; padding: 8px; font-size: 0.8rem; height: 36px; display: flex; align-items: center; justify-content: center;">Batal</button>
                <button class="btn btn-primary" id="camera-capture-btn" style="flex: 1; padding: 8px; font-size: 0.8rem; height: 36px; display: flex; align-items: center; justify-content: center;">Jepret</button>
              </div>
            </div>
            
            <div id="image-preview-container" style="display:none; margin-top: 10px; position:relative;">
              <img id="diary-image-preview" src="" alt="Preview" style="border-radius:12px; max-width:100%; height:auto;" />
              <button class="remove-img-btn" id="remove-img-btn" style="position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.5); color:white; border:none; border-radius:50%; width:28px; height:28px; cursor:pointer;">×</button>
            </div>
          </div>
        </div>

        <div class="modal-field">
          <label>Bagaimana kondisi kulitmu hari ini?</label>
          <div class="condition-options">
            <button class="condition-chip" data-val="Bersih" data-type="good">😊 Bersih</button>
            <button class="condition-chip" data-val="Berminyak" data-type="warn">😐 Berminyak</button>
            <button class="condition-chip" data-val="Kering" data-type="warn">🤔 Kering</button>
            <button class="condition-chip" data-val="Berjerawat" data-type="bad">😟 Berjerawat</button>
            <button class="condition-chip" data-val="Sensitif" data-type="bad">😣 Sensitif</button>
          </div>
        </div>

        <div class="modal-field">
          <label>Produk yang Digunakan</label>
          <textarea id="entry-products" class="modal-textarea" placeholder="cth: Niacinamide Serum, Sunscreen SPF 50..."></textarea>
        </div>

        <div class="modal-field">
          <label>Catatan & Reaksi</label>
          <textarea id="entry-notes" class="modal-textarea" placeholder="Bagaimana kondisi kulit hari ini? Ada reaksi?"></textarea>
        </div>

        <div class="modal-actions">
          <button class="btn btn-outline" id="modal-cancel">Batal</button>
          <button class="btn btn-primary" id="modal-save">Simpan</button>
        </div>
      </div>
    `;

    // Pre-fill products if available
    const routine = getRoutine();
    const progress = getProgress();
    const allDoneProducts = [];
    ['morning', 'night'].forEach(time => {
      if (routine[time] && progress[time]) {
        progress[time].forEach(idx => {
          if (routine[time][idx]) allDoneProducts.push(routine[time][idx].product);
        });
      }
    });
    if (allDoneProducts.length > 0) {
      overlay.querySelector('#entry-products').value = [...new Set(allDoneProducts)].join(', ');
    }

    // Image Upload Logic
    const cameraInput = overlay.querySelector('#diary-image-camera');
    const galleryInput = overlay.querySelector('#diary-image-gallery');
    const cameraBtn = overlay.querySelector('#camera-trigger-btn');
    const galleryBtn = overlay.querySelector('#gallery-trigger-btn');
    const buttonsContainer = overlay.querySelector('#upload-buttons-container');
    const cameraStreamContainer = overlay.querySelector('#camera-stream-container');
    const captureBtn = overlay.querySelector('#camera-capture-btn');
    const cancelCaptureBtn = overlay.querySelector('#camera-cancel-btn');
    const videoElement = overlay.querySelector('#diary-webcam');
    
    const previewContainer = overlay.querySelector('#image-preview-container');
    const previewImg = overlay.querySelector('#diary-image-preview');
    const removeImgBtn = overlay.querySelector('#remove-img-btn');

    // "Ambil Foto" click handler - try webcam getUserMedia
    cameraBtn.addEventListener('click', () => {
      buttonsContainer.style.display = 'none';
      cameraStreamContainer.style.display = 'flex';
      
      navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      })
      .then(s => {
        localStream = s;
        if (videoElement) {
          videoElement.srcObject = s;
          videoElement.play();
        }
      })
      .catch(err => {
        console.warn("Gagal membuka webcam, fallback ke input camera intent:", err);
        // Stop stream if any, clean up UI
        stopLocalStream();
        cameraStreamContainer.style.display = 'none';
        buttonsContainer.style.display = 'flex';
        // Fallback: trigger system native camera
        cameraInput.click();
      });
    });

    // "Jepret" click handler
    captureBtn.addEventListener('click', () => {
      if (videoElement && localStream) {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = videoElement.videoWidth || 640;
          canvas.height = videoElement.videoHeight || 480;
          const ctx = canvas.getContext('2d');
          
          // Mirror image for front camera feel
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          
          selectedImageURL = canvas.toDataURL('image/jpeg', 0.85);
          previewImg.src = selectedImageURL;
          previewContainer.style.display = 'block';
          
          stopLocalStream();
          cameraStreamContainer.style.display = 'none';
        } catch (e) {
          console.error("Gagal menangkap gambar dari webcam stream:", e);
        }
      }
    });

    // Cancel webcam capture handler
    cancelCaptureBtn.addEventListener('click', () => {
      stopLocalStream();
      cameraStreamContainer.style.display = 'none';
      buttonsContainer.style.display = 'flex';
    });

    // "Pilih Galeri" click handler
    galleryBtn.addEventListener('click', () => galleryInput.click());

    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('Ukuran foto terlalu besar. Maksimal 5MB.');
          return;
        }

        const reader = new FileReader();
        reader.onload = (evt) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxSize = 600; // max size of 600px is great for diary photos
            let w = img.width;
            let h = img.height;
            if (w > h) {
              if (w > maxSize) { h = (h * maxSize) / w; w = maxSize; }
            } else {
              if (h > maxSize) { w = (w * maxSize) / h; h = maxSize; }
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            
            selectedImageURL = canvas.toDataURL('image/jpeg', 0.85);
            previewImg.src = selectedImageURL;
            previewContainer.style.display = 'block';
            buttonsContainer.style.display = 'none';
          };
          img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
      }
    };

    cameraInput.addEventListener('change', handleImageChange);
    galleryInput.addEventListener('change', handleImageChange);

    removeImgBtn.addEventListener('click', () => {
      selectedImageURL = null;
      cameraInput.value = '';
      galleryInput.value = '';
      previewContainer.style.display = 'none';
      buttonsContainer.style.display = 'flex';
    });

    // Condition chips
    overlay.querySelectorAll('.condition-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        chip.classList.toggle('selected');
      });
    });

    overlay.querySelector('#modal-cancel').addEventListener('click', () => {
      stopLocalStream();
      overlay.remove();
    });

    overlay.querySelector('#modal-save').addEventListener('click', () => {
      const selectedConditions = Array.from(overlay.querySelectorAll('.condition-chip.selected')).map(chip => ({
        label: chip.dataset.val,
        type: chip.dataset.type
      }));

      const products = overlay.querySelector('#entry-products').value;
      const notes = overlay.querySelector('#entry-notes').value;

      const dateStr = new Date(currentYear, currentMonth, selectedDay).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      const newEntry = {
        date: dateStr,
        mood: selectedConditions.length > 0 && selectedConditions.some(c => c.type === 'bad') ? '😟' : '😊',
        conditions: selectedConditions,
        products: products || '-',
        notes: notes || '-',
        image: selectedImageURL
      };

      // Add to beginning to show immediately
      const entries = getDiaryEntries();
      entries.unshift(newEntry);
      saveDiaryEntries(entries);
      
      stopLocalStream();
      overlay.remove();
      render(); // re-render diary
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        stopLocalStream();
        overlay.remove();
      }
    });

    document.body.appendChild(overlay);
  }

  render();
  
  // Auto-open modal if ?new=true
  if (window.location.hash.includes('?new=true')) {
    setTimeout(showNewEntryModal, 300);
    // remove hash param silently
    window.history.replaceState(null, '', window.location.pathname + '#/diary');
  }
  
  return page;
}
