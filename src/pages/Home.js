import { icons } from '../components/BottomNav.js';
import { addRipple } from '../utils/helpers.js';
import { getRoutine, getProgress, getStreak, getUserId } from '../utils/store.js';
import { fetchWeather } from '../utils/weather.js';
import { getStepIcon } from './Routine.js';

export function renderHome() {
  const page = document.createElement('div');
  page.className = 'page home-page';
  
  const routine = getRoutine();
  const progress = getProgress();
  const streak = getStreak();
  const userId = getUserId();
  
  const currentHour = new Date().getHours();
  const timeOfDay = currentHour < 15 ? 'Pagi' : 'Malam';
  const routineKey = currentHour < 15 ? 'morning' : 'night';
  
  const totalSteps = routine[routineKey].length;
  const completedSteps = progress[routineKey].length;
  let progressPct = 0;
  
  if (totalSteps > 0) {
    progressPct = Math.round((completedSteps / totalSteps) * 100);
  }

  const totalProducts = (routine.morning || []).length + (routine.night || []).length;
  const hasScanned = localStorage.getItem('bglow_has_scanned_' + userId) === '1';
  const jenis_kulit = localStorage.getItem('bglow_skin_type_' + userId) || 'Normal';
  const scorePercent = hasScanned ? 94 : 74;
  const scoreLabel = hasScanned ? '94' : '74';
  const compatibilityText = hasScanned 
    ? `Cocok dengan kulit ${jenis_kulit} Anda` 
    : 'Tambahkan produk Anda untuk melihat skor';

  const activeMood = localStorage.getItem('bglow_skin_mood_' + userId) || '';

  const brownBottleSvg = `
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 32px; height: 32px;">
    <rect x="29" y="8" width="6" height="12" rx="1" fill="#1E293B"/>
    <rect x="27" y="20" width="10" height="4" fill="#334155"/>
    <rect x="30" y="24" width="4" height="4" fill="#94A3B8"/>
    <rect x="20" y="28" width="24" height="28" rx="5" fill="#B45309" stroke="#451A03" stroke-width="1.8"/>
    <rect x="23" y="36" width="18" height="14" rx="1.5" fill="#F8FAFC"/>
    <line x1="26" y1="40" x2="38" y2="40" stroke="#94A3B8" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="26" y1="44" x2="32" y2="44" stroke="#94A3B8" stroke-width="1.5" stroke-linecap="round"/>
  </svg>
  `;

  // Find first uncompleted step
  const steps = routine[routineKey] || [];
  const completedIndices = progress[routineKey] || [];
  let firstUncompletedStep = null;
  for (let i = 0; i < steps.length; i++) {
    if (!completedIndices.includes(i)) {
      firstUncompletedStep = steps[i];
      break;
    }
  }

  // Choose the thumbnail icon and background color dynamically
  let activeIcon = brownBottleSvg;
  let activeBg = '#FEF3C7';

  if (totalSteps > 0 && completedSteps === totalSteps) {
    activeIcon = `
    <svg viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width: 28px; height: 28px;">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    `;
    activeBg = '#D1FAE5';
  } else if (firstUncompletedStep) {
    activeIcon = getStepIcon(firstUncompletedStep.label, firstUncompletedStep.emoji || '🧴', firstUncompletedStep.product);
    activeBg = firstUncompletedStep.bg || '#E3F2FD';
  }

  // Custom premium 3D vectors for article guides
  const skincarePumpSvg = `
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 52px; height: 52px;">
    <rect x="18" y="22" width="28" height="34" rx="10" fill="url(#paint0_linear_bottle)" />
    <rect x="29" y="16" width="6" height="6" fill="#fecdd3" />
    <rect x="27" y="14" width="10" height="2" fill="#fda4af" />
    <path d="M32 8C30 8 26 9 26 11V14H38V11C38 9 34 8 32 8Z" fill="#fecdd3" />
    <path d="M26 11H20V13H26V11Z" fill="#fecdd3" />
    <path d="M32 30C32 30 27 35 27 38C27 40.76 29.24 43 32 43C34.76 43 37 40.76 37 38C37 35 32 30 32 30Z" fill="#ffffff" opacity="0.9" />
    <defs>
      <linearGradient id="paint0_linear_bottle" x1="18" y1="22" x2="46" y2="56" gradientUnits="userSpaceOnUse">
        <stop stop-color="#ffe4e6" />
        <stop offset="1" stop-color="#fda4af" />
      </linearGradient>
    </defs>
  </svg>
  `;

  const flowerSvg = `
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 56px; height: 56px;">
    <defs>
      <linearGradient id="petalGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffd1dc" />
        <stop offset="100%" stop-color="#ff8da1" />
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#f43f5e" flood-opacity="0.3"/>
      </filter>
    </defs>
    <g transform="translate(32, 32)" filter="url(#shadow)">
      <path d="M 0 0 C -12 -28, 12 -28, 0 0" fill="url(#petalGrad)" />
      <path d="M 0 0 C -12 -28, 12 -28, 0 0" fill="url(#petalGrad)" transform="rotate(72)" />
      <path d="M 0 0 C -12 -28, 12 -28, 0 0" fill="url(#petalGrad)" transform="rotate(144)" />
      <path d="M 0 0 C -12 -28, 12 -28, 0 0" fill="url(#petalGrad)" transform="rotate(216)" />
      <path d="M 0 0 C -12 -28, 12 -28, 0 0" fill="url(#petalGrad)" transform="rotate(288)" />
      <circle cx="0" cy="0" r="7" fill="#fff5f7" />
      <circle cx="0" cy="0" r="5" fill="#ffccd5" />
      <line x1="0" y1="0" x2="0" y2="-5" stroke="#fff" stroke-width="1.5" />
      <circle cx="0" cy="-5" r="1.2" fill="#fff" />
      <line x1="0" y1="0" x2="4.75" y2="-1.54" stroke="#fff" stroke-width="1.5" transform="rotate(72)" />
      <circle cx="4.75" cy="-1.54" r="1.2" fill="#fff" transform="rotate(72)" />
      <line x1="0" y1="0" x2="4.75" y2="-1.54" stroke="#fff" stroke-width="1.5" transform="rotate(144)" />
      <circle cx="4.75" cy="-1.54" r="1.2" fill="#fff" transform="rotate(144)" />
      <line x1="0" y1="0" x2="4.75" y2="-1.54" stroke="#fff" stroke-width="1.5" transform="rotate(216)" />
      <circle cx="4.75" cy="-1.54" r="1.2" fill="#fff" transform="rotate(216)" />
      <line x1="0" y1="0" x2="4.75" y2="-1.54" stroke="#fff" stroke-width="1.5" transform="rotate(288)" />
      <circle cx="4.75" cy="-1.54" r="1.2" fill="#fff" transform="rotate(288)" />
    </g>
  </svg>
  `;

  const sunShieldSvg = `
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 52px; height: 52px;">
    <circle cx="32" cy="32" r="14" fill="url(#sunGrad)" />
    <path d="M32 6V12" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" />
    <path d="M32 52V58" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" />
    <path d="M6 32H12" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" />
    <path d="M52 32H58" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" />
    <path d="M13.6 13.6L17.8 17.8" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" />
    <path d="M46.2 46.2L50.4 50.4" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" />
    <path d="M13.6 50.4L17.8 46.2" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" />
    <path d="M46.2 17.8L50.4 13.6" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" />
    <path d="M22 28V34C22 40 32 46 32 46C32 46 42 40 42 34V28L32 24L22 28Z" fill="#3b82f6" fill-opacity="0.85" stroke="#ffffff" stroke-width="1.8" stroke-linejoin="round" />
    <path d="M28 34L31 37L37 31" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <defs>
      <linearGradient id="sunGrad" x1="18" y1="18" x2="46" y2="46">
        <stop offset="0%" stop-color="#fbbf24" />
        <stop offset="100%" stop-color="#f59e0b" />
      </linearGradient>
    </defs>
  </svg>
  `;

  // Custom vector SVGs for mood tracker
  const moodSvgs = {
    bad: `
      <svg viewBox="0 0 36 36" style="width: 32px; height: 32px;">
        <circle cx="18" cy="18" r="16" fill="#FDBA74" />
        <circle cx="13" cy="15" r="2" fill="#451A03" />
        <circle cx="23" cy="15" r="2" fill="#451A03" />
        <path d="M12 25 Q18 20 24 25" stroke="#451A03" stroke-width="2.5" fill="none" stroke-linecap="round" />
      </svg>
    `,
    meh: `
      <svg viewBox="0 0 36 36" style="width: 32px; height: 32px;">
        <circle cx="18" cy="18" r="16" fill="#FCD34D" />
        <circle cx="13" cy="16" r="2" fill="#451A03" />
        <circle cx="23" cy="16" r="2" fill="#451A03" />
        <line x1="12" y1="23" x2="24" y2="23" stroke="#451A03" stroke-width="2.5" stroke-linecap="round" />
      </svg>
    `,
    okay: `
      <svg viewBox="0 0 36 36" style="width: 32px; height: 32px;">
        <circle cx="18" cy="18" r="16" fill="#FDE047" />
        <circle cx="13" cy="15" r="2" fill="#451A03" />
        <circle cx="23" cy="15" r="2" fill="#451A03" />
        <path d="M13 22 Q18 25 23 22" stroke="#451A03" stroke-width="2" fill="none" stroke-linecap="round" />
      </svg>
    `,
    good: `
      <svg viewBox="0 0 36 36" style="width: 32px; height: 32px;">
        <circle cx="18" cy="18" r="16" fill="#FBCFE8" />
        <path d="M11 16 Q13 13 15 16" stroke="#9D174D" stroke-width="2" fill="none" stroke-linecap="round" />
        <path d="M21 16 Q23 13 25 16" stroke="#9D174D" stroke-width="2" fill="none" stroke-linecap="round" />
        <path d="M12 21 Q18 27 24 21" stroke="#9D174D" stroke-width="2.5" fill="none" stroke-linecap="round" />
      </svg>
    `,
    great: `
      <svg viewBox="0 0 36 36" style="width: 32px; height: 32px;">
        <circle cx="18" cy="18" r="16" fill="#FBCFE8" />
        <path d="M11 16 Q13 13 15 16" stroke="#9D174D" stroke-width="2" fill="none" stroke-linecap="round" />
        <path d="M21 16 Q23 13 25 16" stroke="#9D174D" stroke-width="2" fill="none" stroke-linecap="round" />
        <path d="M12 21 Q18 28 24 21 Z" fill="#ffffff" stroke="#9D174D" stroke-width="2" />
      </svg>
    `
  };

  let userName = 'Glowers';
  const userStr = localStorage.getItem('bglow_user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user && user.name) userName = user.name.split(' ')[0];
    } catch (e) {}
  }

  // Inject styles for home layout
  if (!document.getElementById('home-custom-layout-styles')) {
    const style = document.createElement('style');
    style.id = 'home-custom-layout-styles';
    style.textContent = `
      .home-page {
        background: linear-gradient(180deg, var(--primary) 0%, var(--primary-dark) 240px, var(--bg) 240px) !important;
        padding-bottom: 120px;
      }
      .mood-tracker-btn {
        flex: 1;
        background: transparent;
        border: 1px solid #cbd5e140;
        border-radius: 20px;
        padding: 12px 6px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .mood-tracker-btn:hover {
        background: #f8fafc;
        transform: translateY(-2px);
      }
      .mood-tracker-btn:active {
        transform: scale(0.95);
      }
      .mood-tracker-btn.selected {
        background: #eff6ff !important;
        border: 1.8px solid var(--primary) !important;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.12);
      }
      .articles-scroll::-webkit-scrollbar {
        display: none;
      }
      .home-routine-thumb svg {
        width: 32px;
        height: 32px;
      }
      .home-routine-thumb {
        font-size: 1.5rem;
      }
    `;
    document.head.appendChild(style);
  }

  page.innerHTML = `
    <!-- Header -->
    <header class="home-header anim-fade-in">
      <div class="home-header-top">
        <div>
          <div class="home-greeting">Selamat ${timeOfDay}, ${userName} ✨</div>
          <div class="home-name">Dashboard Kulitmu</div>
        </div>
        <button class="home-notif-btn" id="notif-btn" style="color: #F59E0B;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>
        </button>
      </div>
    </header>

    <!-- Dashboard Content -->
    <section class="dashboard-content">
      
      <!-- Weather & Env Widget -->
      <div class="weather-widget anim-fade-in-up">
        <div class="weather-main">
          <div class="weather-icon-wrap" id="w-icon">⏳</div>
          <div>
            <div class="weather-temp" id="w-temp">--°C</div>
            <div class="weather-desc" id="w-desc">Memuat cuaca...</div>
          </div>
        </div>
        <div class="weather-details">
          <div class="w-detail-item">
            <span>UV Index:</span>
            <span class="w-detail-val" id="w-uv">-</span>
          </div>
          <div class="w-detail-item">
            <span>Kelembapan:</span>
            <span class="w-detail-val" id="w-humid">-%</span>
          </div>
        </div>
      </div>

      <!-- Routine Summary Card -->
      <div class="routine-summary-card anim-fade-in-up anim-delay-1" id="routine-summary-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3 style="font-size:1.1rem; font-weight:800; color:#1e1b4b; margin:0; letter-spacing:-0.3px;">Rutinitasku</h3>
          <span style="font-size:1.3rem; color:#94a3b8; font-weight:400; line-height:1;">&rsaquo;</span>
        </div>
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
          <!-- Stats Left -->
          <div style="display:flex; gap:28px;">
            <div>
              <div style="font-size:1.25rem; font-weight:800; color:#1e1b4b; line-height:1.2;">${completedSteps}/${totalSteps}</div>
              <div style="font-size:0.75rem; color:#94a3b8; font-weight:600; margin-top:2px;">Target terpenuhi</div>
            </div>
            <div>
              <div style="font-size:1.25rem; font-weight:800; color:#1e1b4b; line-height:1.2;">${totalProducts}</div>
              <div style="font-size:0.75rem; color:#94a3b8; font-weight:600; margin-top:2px;">Produk</div>
            </div>
          </div>
          <!-- Thumbnail Right -->
          <div class="home-routine-thumb" style="width:52px; height:52px; background:${activeBg}; border-radius:14px; display:flex; align-items:center; justify-content:center; flex-shrink:0; transform:rotate(-5deg);">
            ${activeIcon}
          </div>
        </div>

        <!-- Routine Compatibility Subcard -->
        <div style="background:#F8FAFC; border-radius:16px; padding:12px 16px; display:flex; align-items:center; justify-content:space-between; width:100%; box-sizing:border-box;">
          <div style="text-align:left; flex:1; padding-right:8px;">
            <h4 style="font-size:0.8rem; font-weight:800; color:#1e1b4b; margin:0 0 2px 0;">Kecocokan Rutinitas</h4>
            <p style="font-size:0.75rem; color:#94a3b8; margin:0; line-height:1.3;">${compatibilityText}</p>
          </div>
          <!-- Circle Gauge progress -->
          <div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            <svg width="44" height="44" viewBox="0 0 36 36" style="transform: rotate(-90deg);">
              <circle cx="18" cy="18" r="15" fill="none" stroke="#E2E8F0" stroke-width="3.5" />
              <circle cx="18" cy="18" r="15" fill="none" stroke="#F59E0B" stroke-width="3.5" 
                      stroke-dasharray="94.2" stroke-dashoffset="${94.2 - (94.2 * scorePercent / 100)}" 
                      stroke-linecap="round" />
            </svg>
            <div style="position:absolute; font-size:12px; font-weight:800; color:#1E293B;">${scoreLabel}</div>
          </div>
        </div>
      </div>

      <!-- Skin Mood Tracker Card (Placed Below My Routine) -->
      <div class="anim-fade-in-up anim-delay-1" id="mood-tracker-card" style="background:#ffffff; border-radius:var(--radius-xl); padding:20px; box-shadow:0 4px 20px rgba(0,0,0,0.05); border:1px solid var(--border-light); text-align:center;">
        <h3 style="font-size:1.1rem; font-weight:800; color:#0f172a; margin:0 0 4px 0; text-align:left; letter-spacing:-0.3px;">Bagaimana kondisi kulitmu hari ini?</h3>
        <p style="font-size:0.75rem; color:#94a3b8; margin:0 0 20px 0; text-align:left; font-weight:500;">Catat untuk melihat perkembangan kulitmu</p>
        
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
          ${[
            { key: 'bad', label: 'buruk' },
            { key: 'meh', label: 'biasa' },
            { key: 'okay', label: 'cukup' },
            { key: 'good', label: 'baik' },
            { key: 'great', label: 'sangat baik' }
          ].map(m => {
            const isSelected = activeMood === m.key;
            return `
              <button class="mood-tracker-btn ${isSelected ? 'selected' : ''}" data-mood="${m.key}">
                <div style="width:32px; height:32px; display:flex; align-items:center; justify-content:center; filter: grayscale(${isSelected ? 0 : 0.2}); transform: scale(${isSelected ? 1.1 : 1}); transition: all 0.2s ease;">
                  ${moodSvgs[m.key]}
                </div>
                <span style="font-size:9.5px; font-weight:${isSelected ? 700 : 500}; color:${isSelected ? 'var(--primary)' : '#94a3b8'}; text-transform:lowercase; margin-top:2px;">${m.label}</span>
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Quick Actions Grid -->
      <div class="quick-actions-section anim-fade-in-up anim-delay-2">
        <h3 class="section-title">Aksi Cepat</h3>
        <div class="quick-actions-grid">
          <div class="qa-item" data-action="scan">
            <div class="qa-icon-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            </div>
            <span class="qa-label">Scan AI</span>
          </div>
          <div class="qa-item" data-action="diary">
            <div class="qa-icon-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
            </div>
            <span class="qa-label">Jurnal</span>
          </div>
          <div class="qa-item" data-action="alarm">
            <div class="qa-icon-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3 2 6"/><path d="m22 6-3-3"/><path d="M6.38 18.7 4 21"/><path d="M17.64 18.67 20 21"/></svg>
            </div>
            <span class="qa-label">Alarm UV</span>
          </div>
          <div class="qa-item" data-action="bpom">
            <div class="qa-icon-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <span class="qa-label">Cek BPOM</span>
          </div>
        </div>
      </div>

      <!-- Daily Tip -->
      <div class="daily-tip-card anim-fade-in-up anim-delay-3">
        <div class="tip-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EAB308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
        </div>
        <div class="tip-content">
          <h4>Tips Harian</h4>
          <p id="daily-tip-text">Memuat tips kulit...</p>
        </div>
      </div>

      <!-- Streak Consistency -->
      <div class="streak-card anim-fade-in-up anim-delay-4 ${streak.current === 0 ? 'padam' : ''}">
        <div class="sc-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
        </div>
        <div class="sc-content">
          <h4>${streak.current} Hari Beruntun!</h4>
          <p>${streak.current > 0 ? 'Luar biasa! Kamu konsisten merawat kulit. Pertahankan terus ya!' : 'Mulai rutinitas harimu untuk membangun konsistensi merawat kulit!'}</p>
        </div>
      </div>

      <!-- SkinLab Product Preview -->
      <div class="skinlab-section anim-fade-in-up anim-delay-4" id="skinlab-widget">
        <!-- Rendered dynamically -->
      </div>

      <!-- Trending Today Preview -->
      <div class="trending-section anim-fade-in-up anim-delay-4" id="trending-widget">
        <!-- Rendered dynamically -->
      </div>

    </section>
  `;

  // Attach Events
  page.querySelectorAll('.routine-summary-card, .qa-item').forEach(el => addRipple(el));

  const routineCard = page.querySelector('#routine-summary-card');
  if (routineCard) {
    routineCard.addEventListener('click', () => {
      window.location.hash = '#/routine';
    });
  }

  // Mood Tracker Smileys click listener
  page.querySelectorAll('.mood-tracker-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const mood = btn.dataset.mood;
      localStorage.setItem('bglow_skin_mood_' + userId, mood);
      
      // Update UI active state
      page.querySelectorAll('.mood-tracker-btn').forEach(b => {
        b.classList.remove('selected');
      });
      btn.classList.add('selected');

      const { showCustomAlert } = await import('../utils/helpers.js');
      showCustomAlert("Mood kulit Anda hari ini berhasil disimpan! Jaga kesehatan kulit Anda ya. ✨", "Mood Kulit Dicatat");
    });
  });

  page.querySelectorAll('.qa-item').forEach(item => {
    item.addEventListener('click', () => {
      const action = item.dataset.action;
      window.location.hash = '#/' + action;
    });
  });

  page.querySelector('#notif-btn').addEventListener('click', () => {
    window.location.hash = '#/subscription';
  });

  // Fetch real weather and update DOM
  fetchWeather().then(w => {
    if (!w) return;
    const isHighUv = w.uvIndex >= 6;
    
    const elIcon = page.querySelector('#w-icon');
    const elTemp = page.querySelector('#w-temp');
    const elDesc = page.querySelector('#w-desc');
    const elUv = page.querySelector('#w-uv');
    const elHumid = page.querySelector('#w-humid');
    const elTip = page.querySelector('#daily-tip-text');
    
    if (elIcon) elIcon.innerHTML = w.icon;
    if (elTemp) elTemp.innerHTML = w.temp + '°C';
    if (elDesc) elDesc.innerHTML = w.condition;
    
    if (elUv) {
      elUv.innerHTML = w.uvIndex + (isHighUv ? ' (Tinggi)' : '');
      elUv.className = 'w-detail-val ' + (isHighUv ? 'danger' : '');
    }
    if (elHumid) elHumid.innerHTML = w.humidity + '%';
    
    if (elTip) {
      elTip.innerHTML = isHighUv 
        ? 'UV Index lumayan tinggi hari ini! Wajib gunakan sunscreen dan re-apply tiap 2 jam ya.' 
        : 'Cuaca bersahabat, tapi jangan lupa tetap hidrasi kulitmu dari dalam dengan minum air putih.';
    }
  }).catch(err => console.error('Gagal memuat cuaca:', err));

  // Load SkinLab widget data asynchronously
  const widgetContainer = page.querySelector('#skinlab-widget');
  if (widgetContainer) {
    renderSkinLabWidget(widgetContainer, userId);
  }

  // Load Trending widget data asynchronously
  const trendingContainer = page.querySelector('#trending-widget');
  if (trendingContainer) {
    renderTrendingWidget(trendingContainer, userId);
  }

  return page;
}

async function renderSkinLabWidget(container, userId) {
  const hasScanned = localStorage.getItem('bglow_has_scanned_' + userId) === '1';

  const lockSVG = `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><circle cx="12" cy="12" r="11" fill="#EDE9FE" stroke="#8B5CF6" stroke-width="1"/><rect x="7" y="12" width="10" height="7" rx="2.5" fill="#7C3AED"/><path d="M9 12V9.5a3 3 0 0 1 6 0V12" stroke="#A78BFA" stroke-width="1.8" stroke-linecap="round" fill="none"/><circle cx="12" cy="15" r="1.3" fill="white" opacity="0.9"/><rect x="11.2" y="15.8" width="1.5" height="2" rx="0.7" fill="white" opacity="0.9"/></svg>`;
  const labIconSVG = `<svg viewBox="0 0 22 22" width="18" height="18" fill="none" style="display:inline-block;vertical-align:middle;margin-right:6px;"><circle cx="11" cy="11" r="10" fill="#EDE9FE" stroke="#8B5CF6" stroke-width="1"/><path d="M9 5v7l-3 4h10l-3-4V5" stroke="#7C3AED" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M9 5h4" stroke="#A78BFA" stroke-width="1.3" stroke-linecap="round"/><circle cx="9.5" cy="14.5" r="1" fill="#A78BFA"/><circle cx="12" cy="15.5" r="0.7" fill="#C4B5FD"/></svg>`;

  const catMeta = {
    cleanser:    { label: 'Pembersih',  color: '#E0F2FE', iconColor: '#0EA5E9', icon: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" fill="#BAE6FD" stroke="#0EA5E9" stroke-width="1.5"/></svg>` },
    moisturizer: { label: 'Pelembab',   color: '#DCFCE7', iconColor: '#22C55E', icon: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><ellipse cx="12" cy="14" rx="6" ry="7" fill="#BBF7D0" stroke="#22C55E" stroke-width="1.5"/><path d="M12 3 Q10 7 12 9 Q14 7 12 3Z" fill="#22C55E"/></svg>` },
    serum:       { label: 'Serum',      color: '#FEF3C7', iconColor: '#F59E0B', icon: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><rect x="9" y="8" width="6" height="10" rx="3" fill="#FDE68A" stroke="#F59E0B" stroke-width="1.5"/><rect x="10" y="4" width="4" height="5" rx="1" fill="#FCD34D" stroke="#F59E0B" stroke-width="1"/></svg>` },
    sunscreen:   { label: 'Sunscreen',  color: '#FFF7ED', iconColor: '#F97316', icon: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><circle cx="12" cy="12" r="5" fill="#FED7AA" stroke="#F97316" stroke-width="1.5"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="#F97316" stroke-width="1.5" stroke-linecap="round"/></svg>` },
    exfoliator:  { label: 'Eksfoliasi', color: '#F5F3FF', iconColor: '#8B5CF6', icon: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><circle cx="12" cy="12" r="8" fill="#DDD6FE" stroke="#8B5CF6" stroke-width="1.5"/><circle cx="9" cy="10" r="1.5" fill="#8B5CF6"/><circle cx="15" cy="10" r="1.5" fill="#8B5CF6"/><path d="M8.5 15a5 5 0 0 0 7 0" stroke="#7C3AED" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg>` },
  };

  if (!hasScanned) {
    container.innerHTML = `
      <h3 class="skinlab-title">${labIconSVG} Rekomendasi Produk</h3>
      <p class="skinlab-subtitle">Rekomendasi skincare yang dicocokkan khusus untuk kondisi kulit Anda.</p>
      <div style="display:flex;flex-direction:column;align-items:center;padding:24px;text-align:center;background:#faf5ff;border:1px dashed #d8b4fe;border-radius:18px;">
        ${lockSVG}
        <div style="font-weight:700;font-size:12px;color:#581c87;margin-bottom:4px;margin-top:8px;">Rekomendasi Terkunci</div>
        <p style="font-size:11px;color:#6b21a8;margin:0 0 12px 0;line-height:1.4;">Lakukan Scan AI kulit wajah Anda terlebih dahulu untuk melihat preview produk yang cocok.</p>
        <button class="btn btn-primary" id="skinlab-scan-btn" style="padding:8px 16px;font-size:11px;border-radius:8px;width:auto;font-weight:700;">Mulai Scan Kulit</button>
      </div>
    `;
    container.querySelector('#skinlab-scan-btn').addEventListener('click', () => { window.location.hash = '#/scan'; });
    return;
  }

  if (!document.getElementById('skinlab-widget-styles')) {
    const style = document.createElement('style');
    style.id = 'skinlab-widget-styles';
    style.textContent = `
      .skinlab-section{background:#fff;border-radius:var(--radius-xl);padding:var(--space-xl) var(--space-lg);box-shadow:0 4px 20px rgba(0,0,0,0.05);border:1px solid var(--border-light);margin-top:12px;}
      .skinlab-title{font-size:1.15rem;font-weight:800;color:#1e1b4b;margin-bottom:4px;letter-spacing:-0.3px;}
      .skinlab-subtitle{font-size:var(--font-xs);color:var(--text-secondary);margin-bottom:16px;line-height:1.4;}
      .skinlab-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f1f5f9;cursor:pointer;transition:background 0.15s;border-radius:8px;}
      .skinlab-row:last-child{border-bottom:none;padding-bottom:0;}
      .skinlab-row:active{background:#f8fafc;}
      .skinlab-row-img{width:52px;height:52px;border-radius:12px;overflow:hidden;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
      .skinlab-row-img img{width:100%;height:100%;object-fit:cover;}
      .skinlab-row-info{flex:1;min-width:0;}
      .skinlab-row-cat{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px;}
      .skinlab-row-name{font-size:12px;font-weight:700;color:#0f172a;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      .skinlab-row-price{font-size:11px;font-weight:600;color:var(--primary);margin-top:2px;}
      .skinlab-row-badge{font-size:9px;font-weight:700;background:rgba(34,197,94,0.12);color:#16a34a;padding:2px 7px;border-radius:20px;white-space:nowrap;flex-shrink:0;}
      .skinlab-see-all-btn{width:100%;margin-top:14px;padding:12px;background:linear-gradient(135deg,#6d28d9,#4f46e5);color:white;border:none;border-radius:12px;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.2s;letter-spacing:0.2px;}
      .skinlab-see-all-btn:active{transform:scale(0.98);}
    `;
    document.head.appendChild(style);
  }

  container.innerHTML = `
    <h3 class="skinlab-title">${labIconSVG} Rekomendasi Produk</h3>
    <p class="skinlab-subtitle">Satu produk terbaik dari tiap kategori untuk kulitmu.</p>
    <div style="height:80px;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:0.8rem;">Menganalisis kecocokan...</div>
  `;

  const jenis_kulit = localStorage.getItem('bglow_skin_type_' + userId) || 'Normal';
  const prioritas = localStorage.getItem('bglow_journey_priority_' + userId);
  const rawProblems = localStorage.getItem('bglow_skin_problems_' + userId) || '[]';
  let permasalahan = [];
  if (prioritas) {
    permasalahan = [prioritas];
  } else {
    try {
      const parsed = JSON.parse(rawProblems);
      if (parsed.length > 0) permasalahan = [parsed[0].label || parsed[0]];
    } catch (_) {}
  }

  const { RECOMMENDATIONS_API_URL } = await import('../config.js');
  const { isPremium } = await import('../utils/store.js');
  const premium = isPremium();

  const fetchTop1 = async (cat) => {
    try {
      const resp = await fetch(RECOMMENDATIONS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jenis_kulit, permasalahan: JSON.stringify(permasalahan), kategori: cat, limit: 3 })
      });
      if (!resp.ok) return null;
      const data = await resp.json();
      return (data.products || [])[0] || null;
    } catch (e) { return null; }
  };

  const categories = ['cleanser', 'moisturizer', 'serum', 'sunscreen', 'exfoliator'];
  const results = await Promise.all(categories.map(c => fetchTop1(c)));

  const rows = results.map((p, i) => ({ p, cat: categories[i] })).filter(({ p }) => p !== null);

  if (rows.length === 0) {
    container.innerHTML = `
      <h3 class="skinlab-title">${labIconSVG} Rekomendasi Produk</h3>
      <p class="skinlab-subtitle">Satu produk terbaik dari tiap kategori untuk kulitmu.</p>
      <div style="padding:20px;text-align:center;color:#64748b;font-size:0.8rem;">Tidak ada rekomendasi tersedia.</div>
    `;
    return;
  }

  // Store product data in memory to avoid data-attribute encoding issues
  window.__skinlabData = rows.map(({ p, cat }) => ({ p, cat }));

  const rowsHTML = rows.map(({ p, cat }, idx) => {
    const meta = catMeta[cat] || { label: cat, color: '#F8FAFC', iconColor: '#64748B', icon: '' };
    const scorePct = Math.round((p.score || 0) * 100);
    const imgContent = (p.image_url && p.image_url !== 'nan')
      ? `<img src="${p.image_url}" alt="product" />`
      : meta.icon;
    const priceStr = typeof p.price === 'number' ? p.price.toLocaleString('id-ID') : p.price;
    return `
      <div class="skinlab-row" data-idx="${idx}">
        <div class="skinlab-row-img" style="background:${meta.color};">${imgContent}</div>
        <div class="skinlab-row-info">
          <div class="skinlab-row-cat" style="color:${meta.iconColor};">${meta.label}</div>
          <div class="skinlab-row-name">${p.name}</div>
          <div class="skinlab-row-price">Rp${priceStr}</div>
        </div>
        <div class="skinlab-row-badge">${scorePct}% Cocok</div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <h3 class="skinlab-title">${labIconSVG} Rekomendasi Produk</h3>
    <p class="skinlab-subtitle">Satu produk terbaik dari tiap kategori untuk kulitmu.</p>
    <div id="skinlab-rows">${rowsHTML}</div>
    <button class="skinlab-see-all-btn" id="skinlab-see-all">Lihat Semua Rekomendasi</button>
  `;

  container.querySelectorAll('.skinlab-row').forEach(row => {
    row.addEventListener('click', () => {
      try {
        const idx = parseInt(row.dataset.idx);
        const entry = (window.__skinlabData || [])[idx];
        if (!entry) return;
        const { p, cat } = entry;
        const meta = catMeta[cat] || {};
        const enriched = {
          name: p.name,
          brand: (p.name || '').split(' ')[0] || '',
          price: typeof p.price === 'number' ? p.price : parseInt(p.price) || 0,
          image_url: p.image_url || '',
          emoji: '🧴',
          bgColor: meta.color || '#F8FAFC',
          rating: 4.5,
          desc: `Produk ${meta.label || cat} terpilih khusus untuk jenis kulit Anda.`,
          ingredients: p.ingredients || [],
          ingredients_analysis: p.ingredients_analysis || [],
          wsm_detail: p.wsm_detail || {},
          score: p.score || 0,
          kategori_rekomendasi: p.kategori_rekomendasi || '',
          kategori: p.kategori || cat,
          link: p.link || ''
        };
        sessionStorage.setItem('bglow_selected_product', JSON.stringify(enriched));
        window.location.hash = '#/product-detail';
      } catch (err) {
        console.error('[SkinLab] Click error:', err);
      }
    });
  });

  container.querySelector('#skinlab-see-all').addEventListener('click', () => {
    window.location.hash = premium ? '#/recommendations' : '#/subscription';
  });
}
async function renderTrendingWidget(container, userId) {
  const jenis_kulit = localStorage.getItem('bglow_skin_type_' + userId) || 'Normal';
  
  if (!document.getElementById('trending-widget-styles')) {
    const style = document.createElement('style');
    style.id = 'trending-widget-styles';
    style.textContent = `
      .trending-section {
        background: #ffffff;
        border-radius: var(--radius-xl);
        padding: var(--space-xl) var(--space-lg);
        box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        border: 1px solid var(--border-light);
        margin-top: 12px;
      }
      .trending-title {
        font-size: 1.15rem;
        font-weight: 800;
        color: #1e1b4b;
        margin-bottom: 4px;
        letter-spacing: -0.3px;
        text-align: left;
      }
      .trending-subtitle {
        font-size: var(--font-xs);
        color: var(--text-secondary);
        margin-bottom: 20px;
        line-height: 1.4;
        text-align: left;
      }
      .trending-scroll-container {
        display: flex;
        gap: 12px;
        overflow-x: auto;
        padding-bottom: 8px;
        scrollbar-width: none;
      }
      .trending-scroll-container::-webkit-scrollbar {
        display: none;
      }
      .trending-product-card {
        flex: 0 0 160px;
        background: #f8fafc;
        border: 1px solid #cbd5e130;
        border-radius: 16px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        text-align: left;
        box-sizing: border-box;
        position: relative;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .trending-product-img {
        width: 100%;
        height: 110px;
        background: #fff;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 8px;
        overflow: hidden;
      }
      .trending-product-brand {
        font-size: 10px;
        font-weight: 600;
        color: #94a3b8;
        margin-bottom: 2px;
        text-transform: uppercase;
      }
      .trending-product-name {
        font-size: 11px;
        font-weight: 700;
        color: #0f172a;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        height: 28px;
      }
      .trending-love-btn {
        position: absolute;
        top: 18px;
        right: 18px;
        background: #ffffff99;
        backdrop-filter: blur(4px);
        border: none;
        border-radius: 50%;
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 0.85rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      }
    `;
    document.head.appendChild(style);
  }

  // Trending flame icon SVG
  const flameSVG = `<svg viewBox="0 0 22 22" width="18" height="18" fill="none" style="display:inline-block;vertical-align:middle;margin-right:6px;"><circle cx="11" cy="11" r="10" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1"/><path d="M11 4c0 0-5 4.5-5 7.5a5 5 0 0 0 10 0C16 8.5 11 4 11 4z" fill="#FDE047" stroke="#D97706" stroke-width="0.8" stroke-linejoin="round"/><path d="M11 10c0 0-2 1.5-2 3a2 2 0 0 0 4 0C13 11.5 11 10 11 10z" fill="#F59E0B"/></svg>`;

  container.innerHTML = `
    <h3 class="trending-title">${flameSVG} Trending Hari Ini</h3>
    <p class="trending-subtitle">Orang lain dengan kulit ${jenis_kulit} menyukai produk ini</p>
    <div style="height:100px; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:0.8rem;">⏳ Memuat tren terhangat...</div>
  `;

  const { RECOMMENDATIONS_API_URL } = await import('../config.js');
  const { isPremium } = await import('../utils/store.js');
  const premium = isPremium();

  try {
    const resp = await fetch(RECOMMENDATIONS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jenis_kulit, permasalahan: '[]', kategori: 'sunscreen', limit: 10 })
    });
    if (!resp.ok) throw new Error();
    const data = await resp.json();
    const products = data.products || [];
    if (products.length === 0) {
      container.style.display = 'none';
      return;
    }

    // Sort descending by match score / review highest
    products.sort((a, b) => b.score - a.score);

    const showProds = products.slice(0, 4);
    const remainingCount = Math.max(0, products.length - showProds.length) || 6;

    container.innerHTML = `
      <h3 class="trending-title">${flameSVG} Trending Hari Ini</h3>
      <p class="trending-subtitle">Orang lain dengan kulit ${jenis_kulit} menyukai produk ini</p>
      <div class="trending-scroll-container">
        <!-- Trending Cards -->
        ${showProds.map(p => {
          const imgTag = p.image_url && p.image_url !== 'nan'
            ? `<img src="${p.image_url}" alt="${p.name}" style="width:100%; height:100%; object-fit:cover; border-radius:12px;" />`
            : `<span style="font-size:1.8rem;">🧴</span>`;
          const scoreRating = (4.4 + (p.score * 0.6)).toFixed(1);
          return `
            <div class="trending-product-card" data-name="${p.name}" data-price="${p.price}" data-img="${p.image_url}" data-cat="${p.kategori}">
              <div class="trending-product-img">
                ${imgTag}
              </div>
              <button class="trending-love-btn">❤️</button>
              <div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-bottom:4px;">
                <div class="trending-product-brand">${p.name.split(' ')[0] || 'B-Glow'}</div>
                <div style="font-size:10px; color:#F59E0B; font-weight:700; display:flex; align-items:center; gap:2px;">
                  <span>★</span><span>${scoreRating}</span>
                </div>
              </div>
              <div class="trending-product-name">${p.name}</div>
            </div>
          `;
        }).join('')}

        <div class="skinlab-lock-card" id="unlock-trending" style="flex: 0 0 160px; height: auto;">
          ${premium ? unlockSVG : lockSVG}
          <span class="skinlab-lock-title">${premium ? 'Lihat Semua' : `Buka ${remainingCount}+ lainnya`}</span>
        </div>
      </div>
    `;

    const unlockBtn = container.querySelector('#unlock-trending');
    if (unlockBtn) {
      unlockBtn.addEventListener('click', () => {
        window.location.hash = premium ? '#/recommendations?category=trending' : '#/subscription';
      });
    }

    // Click handlers for product cards
    container.querySelectorAll('.trending-product-card').forEach(card => {
      card.addEventListener('click', () => {
        const name = card.dataset.name;
        const price = parseInt(card.dataset.price);
        const image = card.dataset.img;
        const category = card.dataset.cat;
        
        const enriched = {
          name,
          brand: name.split(' ')[0] || name,
          price,
          emoji: '☀️',
          bgColor: '#FFFDE7',
          rating: 4.6,
          desc: `Produk trending terpilih yang sangat disukai oleh pengguna dengan jenis kulit ${jenis_kulit}.`,
          ingredients: [],
          link: ''
        };
        sessionStorage.setItem('bglow_selected_product', JSON.stringify(enriched));
        window.location.hash = '#/product-detail';
      });
    });

    // Click handlers for love buttons
    container.querySelectorAll('.trending-love-btn').forEach(loveBtn => {
      loveBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        loveBtn.innerHTML = loveBtn.innerHTML === '❤️' ? '🤍' : '❤️';
      });
    });

  } catch (e) {
    container.style.display = 'none';
  }
}
