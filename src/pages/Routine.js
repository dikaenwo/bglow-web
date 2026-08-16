import { icons } from '../components/BottomNav.js';
import { 
  getRoutine, saveRoutine, 
  getSpecialSchedule, saveSpecialSchedule, 
  getProgress, saveProgress, 
  getStreak, saveStreak,
  getDateStringForDate, getMostRecentWeekdayDate,
  getTodayDateString, getLatestCompletedDate,
  isDateCompleted, setDateCompleted,
  calculateCurrentStreak, getLatestCompletedDateFromDict,
  calculateBestStreak, isPremium
} from '../utils/store.js';
import { showCustomAlert, showCustomConfirm, renderPaywallPage } from '../utils/helpers.js';

const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const dayShort = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const cleanserIcon = `
<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 12 H26 L23 48 H15 L12 12 Z" fill="#DBEAFE" stroke="#2563EB" stroke-width="2.5" stroke-linejoin="round" />
  <path d="M14 20 H24" stroke="#2563EB" stroke-width="2" />
  <rect x="16" y="28" width="6" height="8" fill="white" stroke="#2563EB" stroke-width="1.8" />
  <rect x="17" y="48" width="4" height="6" fill="#93C5FD" stroke="#2563EB" stroke-width="1.8" />
  <rect x="25" y="32" width="26" height="22" rx="4" fill="#DBEAFE" stroke="#2563EB" stroke-width="2.5" />
  <rect x="28" y="26" width="20" height="6" rx="1.5" fill="#93C5FD" stroke="#2563EB" stroke-width="2.5" />
  <path d="M30 26 C30 20, 36 18, 38 22 C40 18, 46 20, 46 26" fill="#93C5FD" stroke="#2563EB" stroke-width="2" stroke-linecap="round" />
  <circle cx="38" cy="43" r="3" fill="white" stroke="#2563EB" stroke-width="1.8" />
</svg>
`;

const moisturizerIcon = `
<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(38, 12) rotate(30)">
    <rect x="-14" y="-3" width="28" height="6" rx="1.5" fill="#6EE7B7" stroke="#059669" stroke-width="2.5" />
  </g>
  <path d="M22 34 C18 24, 38 18, 44 24 C50 18, 56 24, 52 34 Z" fill="#D1FAE5" stroke="#059669" stroke-width="2.5" stroke-linejoin="round" />
  <rect x="14" y="34" width="36" height="24" rx="5" fill="#D1FAE5" stroke="#059669" stroke-width="2.5" />
  <rect x="18" y="28" width="28" height="6" rx="1" fill="#6EE7B7" stroke="#059669" stroke-width="2.5" />
  <line x1="24" y1="46" x2="40" y2="46" stroke="#059669" stroke-width="2" stroke-linecap="round" />
</svg>
`;

const serumIcon = `
<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="25" y="16" width="14" height="8" rx="2" fill="#C4B5FD" stroke="#7C3AED" stroke-width="2.5" />
  <path d="M29 16 L29 10 C29 7, 35 7, 35 10 L35 16" fill="#EDE9FE" stroke="#7C3AED" stroke-width="2.5" />
  <path d="M19 28 C19 24, 45 24, 45 28 L45 56 C45 60, 19 60, 19 56 Z" fill="#EDE9FE" stroke="#7C3AED" stroke-width="2.5" stroke-linejoin="round" />
  <rect x="22" y="24" width="20" height="4" fill="#C4B5FD" stroke="#7C3AED" stroke-width="2" />
  <g transform="translate(36, 38)">
    <path d="M8 8 Q18 0, 20 14 Q10 18, 8 8 Z" fill="#C4B5FD" stroke="#7C3AED" stroke-width="2" stroke-linejoin="round" />
    <path d="M8 8 L16 12" stroke="#7C3AED" stroke-width="1.5" />
    <path d="M0 18 Q12 12, 18 22 Q6 28, 0 18 Z" fill="#C4B5FD" stroke="#7C3AED" stroke-width="2" stroke-linejoin="round" />
    <path d="M0 18 L12 22" stroke="#7C3AED" stroke-width="1.5" />
  </g>
</svg>
`;

const sunscreenIcon = `
<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="14" width="24" height="7" rx="1.5" fill="#FCD34D" stroke="#D97706" stroke-width="2.5" />
  <rect x="15" y="21" width="34" height="32" rx="6" fill="#FEF3C7" stroke="#D97706" stroke-width="2.5" />
  <g transform="translate(32, 38)">
    <path d="M-4 6 L4 -6" stroke="#D97706" stroke-width="2" stroke-linecap="round" />
    <path d="M-3 0 Q-10 -4, -7 -10 Q-1 -7, -3 0 Z" fill="#FCD34D" stroke="#D97706" stroke-width="1.8" />
    <path d="M1 -2 Q8 -6, 9 0 Q2 3, 1 -2 Z" fill="#FCD34D" stroke="#D97706" stroke-width="1.8" />
  </g>
</svg>
`;

const exfoliationIcon = `
<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 18 L28 21 L22 56 L11 54 Z" fill="#F9A8D4" stroke="#DB2777" stroke-width="2.5" stroke-linejoin="round" />
  <line x1="12" y1="26" x2="26" y2="29" stroke="#DB2777" stroke-width="2" />
  <ellipse cx="44" cy="42" rx="17" ry="18" fill="#FCE7F3" stroke="#DB2777" stroke-width="2.5" />
  <ellipse cx="37" cy="39" rx="3" ry="2" fill="white" stroke="#DB2777" stroke-width="1.8" />
  <ellipse cx="51" cy="39" rx="3" ry="2" fill="white" stroke="#DB2777" stroke-width="1.8" />
  <ellipse cx="44" cy="51" rx="3" ry="1.5" fill="white" stroke="#DB2777" stroke-width="1.8" />
</svg>
`;

const tonerIcon = `
<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="24" y="20" width="16" height="36" rx="3" fill="#D1FAE5" stroke="#059669" stroke-width="2.5" />
  <rect x="29" y="12" width="6" height="8" fill="#6EE7B7" stroke="#059669" stroke-width="2.5" />
  <path d="M32 30 C35 34, 35 40, 32 44 C29 40, 29 34, 32 30 Z" fill="#6EE7B7" stroke="#059669" stroke-width="1.8" />
  <path d="M32 34 L32 42" stroke="#059669" stroke-width="1.5" />
</svg>
`;

const maskerIcon = `
<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="22" fill="#EDE9FE" stroke="#8B5CF6" stroke-width="2.5" />
  <ellipse cx="24" cy="28" rx="4" ry="3" fill="white" stroke="#8B5CF6" stroke-width="2" />
  <ellipse cx="40" cy="28" rx="4" ry="3" fill="white" stroke="#8B5CF6" stroke-width="2" />
  <path d="M26 42 Q32 46, 38 42" stroke="#8B5CF6" stroke-width="2.5" stroke-linecap="round" />
  <path d="M44 44 L54 34" stroke="#8B5CF6" stroke-width="2.5" stroke-linecap="round" />
  <circle cx="54" cy="34" r="2.5" fill="#C4B5FD" stroke="#8B5CF6" stroke-width="2" />
</svg>
`;

const retinolIcon = `
<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="22" y="22" width="20" height="34" rx="4" fill="#E0E7FF" stroke="#4F46E5" stroke-width="2.5" />
  <rect x="26" y="14" width="12" height="8" rx="1.5" fill="#C7D2FE" stroke="#4F46E5" stroke-width="2.5" />
  <path d="M30 30 C34 30, 36 34, 34 38 C31 38, 30 35, 30 32 Z" fill="#FCD34D" stroke="#4F46E5" stroke-width="1.8" />
  <path d="M14 24 L16 26 L14 28 L12 26 Z" fill="#FCD34D" />
  <path d="M48 44 L50 46 L48 48 L46 46 Z" fill="#FCD34D" />
</svg>
`;

const eyeCreamIcon = `
<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M22 18 H42 L38 46 H26 Z" fill="#E0F7FA" stroke="#0891B2" stroke-width="2.5" stroke-linejoin="round" />
  <path d="M27 46 H37 L35 54 H29 Z" fill="#67E8F9" stroke="#0891B2" stroke-width="2" stroke-linejoin="round" />
  <path d="M26 30 C28 26, 36 26, 38 30 C36 34, 28 34, 26 30 Z" fill="white" stroke="#0891B2" stroke-width="2" stroke-linejoin="round" />
  <circle cx="32" cy="30" r="2.5" fill="#67E8F9" stroke="#0891B2" stroke-width="1.5" />
  <path d="M46 16 L49 19 L46 22 L43 19 Z" fill="#FCD34D" />
  <path d="M14 24 L16 26 L14 28 L12 26 Z" fill="#FCD34D" />
</svg>
`;


const lainnyaIcon = `
<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="18" y="28" width="28" height="24" rx="4" fill="#F1F5F9" stroke="#475569" stroke-width="2.5" />
  <rect x="22" y="20" width="20" height="8" rx="1.5" fill="#CBD5E1" stroke="#475569" stroke-width="2.5" />
  <path d="M12 16 L14 18 L12 20 L10 18 Z" fill="#475569" />
  <path d="M50 20 L52 22 L50 24 L48 22 Z" fill="#475569" />
  <path d="M46 12 L48 14 L46 16 L44 14 Z" fill="#475569" />
</svg>
`;

const stepTypes = [
  { label: 'Pembersih', icon: cleanserIcon, emoji: '🧴', bg: '#E3F2FD' },
  { label: 'Toner', icon: tonerIcon, emoji: '🌿', bg: '#E8F5E9' },
  { label: 'Serum', icon: serumIcon, emoji: '✨', bg: '#FFF3E0' },
  { label: 'Pelembap', icon: moisturizerIcon, emoji: '💧', bg: '#E1F5FE' },
  { label: 'Tabir Surya', icon: sunscreenIcon, emoji: '☀️', bg: '#FFF9C4' },
  { label: 'Masker', icon: maskerIcon, emoji: '🎭', bg: '#F3E5F5' },
  { label: 'Exfoliator', icon: exfoliationIcon, emoji: '🌟', bg: '#FBE9E7' },
  { label: 'Retinol', icon: retinolIcon, emoji: '🌙', bg: '#EDE7F6' },
  { label: 'Eye Cream', icon: eyeCreamIcon, emoji: '👁️', bg: '#E0F7FA' },
  { label: 'Lainnya', icon: lainnyaIcon, emoji: '✨', bg: '#F5F5F5' },
];

export function getStepIcon(label, fallbackEmoji, productName = '') {
  let matchedLabel = label;

  const labelLower = (label || '').toLowerCase();
  const nameLower = (productName || '').toLowerCase();

  if (labelLower === 'produk baru' || labelLower === 'produk' || labelLower === 'new product') {
    if (nameLower.includes('cleanser') || nameLower.includes('cleanse') || fallbackEmoji === '🧴' || fallbackEmoji === '🫧') {
      matchedLabel = 'Pembersih';
    } else if (nameLower.includes('moisture') || nameLower.includes('pelembab') || nameLower.includes('cream') || nameLower.includes('gel') || fallbackEmoji === '🪴' || fallbackEmoji === '💧' || fallbackEmoji === '🐌') {
      matchedLabel = 'Pelembap';
    } else if (nameLower.includes('serum') || nameLower.includes('ampoule') || fallbackEmoji === '✨' || fallbackEmoji === '⚗️') {
      matchedLabel = 'Serum';
    } else if (nameLower.includes('sun') || nameLower.includes('spf') || nameLower.includes('uv') || fallbackEmoji === '☀️' || fallbackEmoji === '🌊' || fallbackEmoji === '🛡️' || fallbackEmoji === '🪞') {
      matchedLabel = 'Tabir Surya';
    } else if (nameLower.includes('toner') || nameLower.includes('essence') || fallbackEmoji === '🌿' || fallbackEmoji === '🍃' || fallbackEmoji === '🌱' || fallbackEmoji === '🍚') {
      matchedLabel = 'Toner';
    } else if (nameLower.includes('mask') || fallbackEmoji === '🎭') {
      matchedLabel = 'Masker';
    } else if (nameLower.includes('exfoliat') || nameLower.includes('aha') || nameLower.includes('bha') || fallbackEmoji === '🌟') {
      matchedLabel = 'Exfoliator';
    } else if (nameLower.includes('retinol') || fallbackEmoji === '🌙') {
      matchedLabel = 'Retinol';
    } else if (nameLower.includes('eye') || fallbackEmoji === '👁️') {
      matchedLabel = 'Eye Cream';
    }
  } else {
    if (labelLower === 'cleansers' || labelLower === 'pembersih') {
      matchedLabel = 'Pembersih';
    } else if (labelLower === 'pelembab' || labelLower === 'pelembap' || labelLower === 'moisturizer') {
      matchedLabel = 'Pelembap';
    } else if (labelLower === 'tabir surya' || labelLower === 'sunscreen') {
      matchedLabel = 'Tabir Surya';
    } else if (labelLower === 'eksfoliasi' || labelLower === 'exfoliator') {
      matchedLabel = 'Exfoliator';
    }
  }

  const type = stepTypes.find(t => t.label === matchedLabel);
  return type ? type.icon : fallbackEmoji;
}

export function renderRoutine() {
  // ── Paywall: hanya untuk Glow Plus ─────────────────────────────────────────
  if (!isPremium()) {
    return renderPaywallPage('Rutinitas', '📚', [
      'Pantau rutinitas skincare pagi & malam',
      'Tracking streak & progress harian',
      'Jadwal produk khusus hari tertentu',
    ]);
  }

  const page = document.createElement('div');
  page.className = 'page routine-page';

  const today = new Date();
  let selectedDay = today.getDay();

  function getStepsForDay(dayIdx, time) {
    const routine = getRoutine();
    const base = (routine[time] || []).map(s => ({ ...s, _source: 'base' }));
    
    const specials = getSpecialSchedule();
    const schedule = specials[time];

    if (schedule && schedule[dayIdx]) {
      schedule[dayIdx].forEach(sp => {
        const item = { ...sp, _source: 'special' };
        const insertIdx = base.findIndex(s => s.label === sp.insertAfter);
        if (insertIdx !== -1) {
          base.splice(insertIdx + 1, 0, item);
        } else {
          base.push(item);
        }
      });
    }
    return base;
  }

  const morningSteps = getStepsForDay(today.getDay(), 'morning');
  const progressData = getProgress();
  const morningDone = morningSteps.length === 0 || (progressData.morning && progressData.morning.length === morningSteps.length);

  let currentTime = today.getHours() < 15 ? 'morning' : 'night';
  if (currentTime === 'night' && !morningDone) {
    currentTime = 'morning';
  }

  function getSteps() {
    return getStepsForDay(selectedDay, currentTime);
  }

  function hasSpecial(dayIdx) {
    const specials = getSpecialSchedule();
    return (specials.morning && specials.morning[dayIdx] && specials.morning[dayIdx].length > 0) || 
           (specials.night && specials.night[dayIdx] && specials.night[dayIdx].length > 0);
  }

  function getSpecialLabels(dayIdx) {
    const specials = getSpecialSchedule();
    let labels = [];
    if (specials.morning && specials.morning[dayIdx]) {
      labels = labels.concat(specials.morning[dayIdx].map(s => s.label));
    }
    if (specials.night && specials.night[dayIdx]) {
      labels = labels.concat(specials.night[dayIdx].map(s => s.label));
    }
    return [...new Set(labels)].join(', ');
  }

  const getSelectedDateStr = () => {
    return getDateStringForDate(getMostRecentWeekdayDate(selectedDay, today));
  };

  function getDoneIndices() {
    const progress = getProgress(getSelectedDateStr());
    return progress[currentTime] || [];
  }

  function checkStreakStatus(dayIdx, dateStr) {
    const progress = getProgress(dateStr);
    const morningSteps = getStepsForDay(dayIdx, 'morning');
    const nightSteps = getStepsForDay(dayIdx, 'night');
    
    const morningDone = morningSteps.length === 0 || (progress.morning && progress.morning.length === morningSteps.length);
    const nightDone = nightSteps.length === 0 || (progress.night && progress.night.length === nightSteps.length);
    const hasAnySteps = morningSteps.length > 0 || nightSteps.length > 0;
    
    const isBothDone = morningDone && nightDone && hasAnySteps;
    
    const streak = getStreak();
    const wasStreakDone = isDateCompleted(streak, dateStr);
    
    if (isBothDone && !wasStreakDone) {
      setDateCompleted(streak, dateStr, true);
      streak.current = calculateCurrentStreak(streak.completedDays);
      streak.lastDate = getLatestCompletedDateFromDict(streak.completedDays);
      streak.best = calculateBestStreak(streak.completedDays);
      saveStreak(streak);
      
      // Only show popup and trigger animations if we completed the routine for TODAY
      if (dateStr === getTodayDateString()) {
        setTimeout(() => {
          showCompletionPopup();
        }, 500);
      }
      return true;
    } else if (!isBothDone && wasStreakDone) {
      setDateCompleted(streak, dateStr, false);
      streak.current = calculateCurrentStreak(streak.completedDays);
      streak.lastDate = getLatestCompletedDateFromDict(streak.completedDays);
      streak.best = calculateBestStreak(streak.completedDays);
      saveStreak(streak);
      return true;
    }
    return false;
  }

  function updateStepInPlace(idx, isDone) {
    const stepEl = page.querySelector(`.routine-step[data-idx="${idx}"]`);
    if (stepEl) {
      if (isDone) {
        stepEl.classList.add('done');
      } else {
        stepEl.classList.remove('done');
      }
    }

    const checkEl = page.querySelector(`.rs-check[data-idx="${idx}"]`);
    if (checkEl) {
      if (isDone) {
        checkEl.classList.add('checked');
      } else {
        checkEl.classList.remove('checked');
      }
    }

    const steps = getSteps();
    const doneIndices = getDoneIndices();
    const progressPct = steps.length > 0 ? Math.round((doneIndices.length / steps.length) * 100) : 0;

    const infoH3 = page.querySelector('.routine-progress-info h3');
    const infoP = page.querySelector('.routine-progress-info p');
    if (infoH3) {
      infoH3.textContent = progressPct === 100 && steps.length > 0 ? 'Selesai Semua! ✨' : 'Terus Lanjutkan!';
    }
    if (infoP) {
      infoP.textContent = `${doneIndices.length} dari ${steps.length} langkah selesai`;
    }

    const fill = page.querySelector('#routine-ring-fill');
    const pct = page.querySelector('#routine-percent');
    if (fill) {
      fill.style.strokeDashoffset = 220 - (220 * progressPct / 100);
    }
    if (pct) {
      pct.textContent = `${progressPct}%`;
    }
  }

  function toggleStep(idx) {
    const dateStr = getSelectedDateStr();
    const progress = getProgress(dateStr);
    if (!progress[currentTime]) progress[currentTime] = [];
    
    const wasDone = progress[currentTime].includes(idx);
    if (wasDone) {
      progress[currentTime] = progress[currentTime].filter(i => i !== idx);
    } else {
      progress[currentTime].push(idx);
    }
    saveProgress(progress, dateStr);
    
    const streakChanged = checkStreakStatus(selectedDay, dateStr);
    if (streakChanged) {
      render();
    } else {
      updateStepInPlace(idx, !wasDone);
    }
  }

  function showCompletionPopup() {
    const overlay = document.createElement('div');
    overlay.className = 'diary-modal-overlay';
    overlay.innerHTML = `
      <div class="diary-modal" style="text-align:center;">
        <div class="modal-handle"></div>
        <div style="font-size: 3rem; margin-bottom: 10px;">🎉</div>
        <h2 style="margin-bottom: 10px;">Hebat! Rutinitas Selesai</h2>
        <p style="color: var(--text-secondary); margin-bottom: 20px;">Kamu sudah menyelesaikan rutinitas ${currentTime === 'morning' ? 'pagi' : 'malam'} hari ini. Catat perkembangan kulitmu di jurnal yuk!</p>
        <button class="btn btn-primary" id="btn-to-diary" style="width: 100%; margin-bottom: 10px;">Isi Jurnal Sekarang</button>
        <button class="btn btn-outline" id="btn-close-popup" style="width: 100%;">Nanti Saja</button>
      </div>
    `;
    
    overlay.querySelector('#btn-to-diary').addEventListener('click', () => {
      overlay.remove();
      window.location.hash = '#/diary?new=true';
    });
    
    overlay.querySelector('#btn-close-popup').addEventListener('click', () => overlay.remove());
    
    document.body.appendChild(overlay);
    createFireAnimation();
  }

  function createFireAnimation() {
    for (let i = 0; i < 30; i++) {
      const fire = document.createElement('div');
      fire.className = 'fire-particle';
      fire.textContent = '🔥';
      fire.style.left = Math.random() * 100 + 'vw';
      fire.style.animationDelay = Math.random() * 1.5 + 's';
      fire.style.fontSize = (Math.random() * 2 + 1) + 'rem';
      document.body.appendChild(fire);
      setTimeout(() => fire.remove(), 2500);
    }
  }

  function deleteStep(idx, source, step) {
    if (source === 'special') {
      const specials = getSpecialSchedule();
      const scheduleDay = specials[currentTime][selectedDay];
      if (scheduleDay) {
        const spIdx = scheduleDay.findIndex(s => s.product === step.product && s.label === step.label);
        if (spIdx !== -1) scheduleDay.splice(spIdx, 1);
        if (scheduleDay.length === 0) delete specials[currentTime][selectedDay];
      }
      saveSpecialSchedule(specials);
    } else {
      const routine = getRoutine();
      let baseIdx = 0;
      const allSteps = getSteps();
      for (let i = 0; i < idx; i++) {
        if (allSteps[i]._source === 'base') baseIdx++;
      }
      routine[currentTime].splice(baseIdx, 1);
      saveRoutine(routine);
    }
    
    const dateStr = getSelectedDateStr();
    const progress = getProgress(dateStr);
    progress[currentTime] = [];
    saveProgress(progress, dateStr);
    
    checkStreakStatus(selectedDay, dateStr);
    render();
  }

  function showAddStepModal(isSpecialMode) {
    let selectedType = null;
    let selectedDays = isSpecialMode ? new Set() : null;
    let selectedInsertAfter = null;
    let targetTime = currentTime;

    const getBaseLabels = (time) => {
      const routine = getRoutine();
      return (routine[time] || []).map(s => s.label);
    };
    
    function updateInsertOptions(overlay, time) {
      if (!isSpecialMode) return;
      const bLabels = getBaseLabels(time);
      const container = overlay.querySelector('.insert-after-options');
      if(container) {
        container.innerHTML = bLabels.map(l => `
          <button class="insert-pick-chip" data-label="${l}">${l}</button>
        `).join('') + '<button class="insert-pick-chip" data-label="_last">Di Akhir</button>';

        container.querySelectorAll('.insert-pick-chip').forEach(chip => {
          chip.addEventListener('click', () => {
            container.querySelectorAll('.insert-pick-chip').forEach(c => c.classList.remove('selected'));
            chip.classList.add('selected');
            selectedInsertAfter = chip.dataset.label;
          });
        });
        selectedInsertAfter = null;
      }
    }

    const overlay = document.createElement('div');
    overlay.className = 'diary-modal-overlay';
    overlay.innerHTML = `
      <div class="diary-modal add-step-modal">
        <div class="modal-handle"></div>
        <div class="modal-title">${isSpecialMode ? '⭐ Tambah Produk Khusus' : 'Tambah Langkah Harian'}</div>
        ${isSpecialMode ? '<p class="modal-subtitle">Produk ini hanya muncul di hari yang dipilih</p>' : ''}

        <div class="modal-field">
          <label>Waktu Rutinitas</label>
          <div class="time-picker-modal">
            <button class="time-pick-btn ${targetTime === 'morning' ? 'active' : ''}" data-time="morning" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
              <img src="/pagi.png" alt="Pagi" style="width: 20px; height: 20px; object-fit: contain;" /> Pagi
            </button>
            <button class="time-pick-btn ${targetTime === 'night' ? 'active' : ''}" data-time="night" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
              <img src="/malam.png" alt="Malam" style="width: 20px; height: 20px; object-fit: contain;" /> Malam
            </button>
          </div>
        </div>

        <div class="modal-field">
          <label>Jenis Produk</label>
          <div class="step-type-grid">
            ${stepTypes.map((t, i) => `
              <button class="step-type-chip" data-idx="${i}">
                <div class="stc-icon">${t.icon}</div>
                <span class="stc-label">${t.label}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="modal-field">
          <label>Nama Produk</label>
          <input class="auth-input" type="text" id="step-product" placeholder="cth: Retinol 0.5% Serum" />
        </div>

        <div class="modal-field">
          <label>Brand / Merek</label>
          <input class="auth-input" type="text" id="step-brand" placeholder="cth: Avoskin" />
        </div>

        ${isSpecialMode ? `
          <div class="modal-field">
            <label>Pilih Hari</label>
            <div class="day-picker">
              ${dayShort.map((d, i) => `
                <button class="day-pick-chip" data-day="${i}">${d}</button>
              `).join('')}
            </div>
          </div>

          <div class="modal-field">
            <label>Sisipkan Setelah</label>
            <div class="insert-after-options">
              <!-- populated dynamically -->
            </div>
          </div>
        ` : ''}

        <div class="modal-actions">
          <button class="btn btn-outline" id="modal-cancel">Batal</button>
          <button class="btn btn-primary" id="modal-save">${isSpecialMode ? 'Tambah Khusus' : 'Tambah'}</button>
        </div>
      </div>
    `;

    overlay.querySelectorAll('.time-pick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        overlay.querySelectorAll('.time-pick-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        targetTime = btn.dataset.time;
        if (isSpecialMode) updateInsertOptions(overlay, targetTime);
      });
    });

    if (isSpecialMode) {
      updateInsertOptions(overlay, targetTime);
    }

    overlay.querySelectorAll('.step-type-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        overlay.querySelectorAll('.step-type-chip').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        selectedType = parseInt(chip.dataset.idx);
      });
    });

    if (isSpecialMode) {
      overlay.querySelectorAll('.day-pick-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const day = parseInt(chip.dataset.day);
          if (selectedDays.has(day)) {
            selectedDays.delete(day);
            chip.classList.remove('selected');
          } else {
            selectedDays.add(day);
            chip.classList.add('selected');
          }
        });
      });
    }

    overlay.querySelector('#modal-cancel').addEventListener('click', () => overlay.remove());

    overlay.querySelector('#modal-save').addEventListener('click', () => {
      const productName = overlay.querySelector('#step-product').value.trim();
      const brandName = overlay.querySelector('#step-brand').value.trim();

      if (selectedType === null || !productName) {
        return; // handle error visually if needed
      }

      if (isSpecialMode && selectedDays.size === 0) {
        return;
      }

      const type = stepTypes[selectedType];
      const targetLabels = getBaseLabels(targetTime);

      if (isSpecialMode) {
        const specials = getSpecialSchedule();
        const insertLabel = selectedInsertAfter === '_last' ? null : selectedInsertAfter;
        selectedDays.forEach(day => {
          if (!specials[targetTime]) specials[targetTime] = {};
          if (!specials[targetTime][day]) specials[targetTime][day] = [];
          specials[targetTime][day].push({
            label: type.label,
            product: productName,
            brand: brandName || '-',
            emoji: type.emoji,
            bg: type.bg,
            insertAfter: insertLabel || (targetLabels.length > 0 ? targetLabels[targetLabels.length - 1] : null),
          });
        });
        saveSpecialSchedule(specials);
      } else {
        const routine = getRoutine();
        if(!routine[targetTime]) routine[targetTime] = [];
        routine[targetTime].push({
          label: type.label,
          product: productName,
          brand: brandName || '-',
          emoji: type.emoji,
          bg: type.bg,
        });
        saveRoutine(routine);
      }

      overlay.remove();
      currentTime = targetTime;
      render();
    });

    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
  }

  function render() {
    const steps = getSteps();
    const doneIndices = getDoneIndices();
    const progressPct = steps.length > 0 ? Math.round((doneIndices.length / steps.length) * 100) : 0;
    const streakData = getStreak();
    const isToday = selectedDay === today.getDay();
    const specialLabels = getSpecialLabels(selectedDay);

    page.innerHTML = `
      <div class="page-header">
        <h1>Rutinitas Saya</h1>
      </div>
      <div class="page-content">
        <!-- Streak Banner -->
        <div class="streak-banner anim-fade-in">
          <div class="streak-fire ${streakData.current === 0 ? 'padam' : ''}">🔥</div>
          <div class="streak-info">
            <div class="streak-count">${streakData.current} Hari Beruntun!</div>
            <div class="streak-sub">Rekor terbaik: ${streakData.best} hari</div>
          </div>
          <div class="streak-dots">
            ${Array.from({length: 7}).map((_, i) => {
              const dayIdx = (today.getDay() - 6 + i + 7) % 7;
              const targetDateStr = getDateStringForDate(getMostRecentWeekdayDate(dayIdx, today));
              const isDone = isDateCompleted(streakData, targetDateStr);
              return `<div class="streak-dot ${isDone ? 'done' : ''} ${i === 6 ? 'today' : ''}">
                ${isDone ? '<div class="sd-fire-icon">🔥</div>' : ''}
                <span class="sd-label">${dayShort[dayIdx]}</span>
              </div>`;
            }).join('')}
          </div>
        </div>

        <!-- Weekly Day Selector -->
        <div class="week-selector anim-fade-in-up anim-delay-1">
          ${dayShort.map((d, i) => {
            const isFuture = i > today.getDay();
            return `
              <button class="week-day ${i === selectedDay ? 'active' : ''} ${i === today.getDay() ? 'is-today' : ''} ${isFuture ? 'disabled' : ''}" data-day="${i}" ${isFuture ? 'disabled' : ''}>
                <span class="wd-name">${d}</span>
                ${hasSpecial(i) ? '<span class="wd-special-dot"></span>' : ''}
              </button>
            `;
          }).join('')}
        </div>

        <!-- Day Info -->
        <div class="day-info-bar anim-fade-in-up anim-delay-2">
          <div class="dib-day">${dayNames[selectedDay]}${isToday ? ' (Hari ini)' : ''}</div>
          ${specialLabels ? `<div class="dib-special">⭐ ${specialLabels}</div>` : '<div class="dib-special dib-normal">Rutinitas biasa</div>'}
        </div>

        <!-- Progress Ring -->
        <div class="routine-progress-card anim-fade-in-up anim-delay-1">
          <div class="routine-ring">
            <svg viewBox="0 0 80 80">
              <circle class="rr-bg" cx="40" cy="40" r="35"/>
              <circle class="rr-fill" cx="40" cy="40" r="35" id="routine-ring-fill"/>
            </svg>
            <div class="rr-value" id="routine-percent">0%</div>
          </div>
          <div class="routine-progress-info">
            <h3>${progressPct === 100 && steps.length > 0 ? 'Selesai Semua! ✨' : 'Terus Lanjutkan!'}</h3>
            <p>${doneIndices.length} dari ${steps.length} langkah selesai</p>
          </div>
        </div>

        <!-- Toggle -->
        <div class="routine-toggle anim-fade-in-up anim-delay-2">
          <button class="routine-toggle-btn ${currentTime === 'morning' ? 'active' : ''}" data-time="morning">
            <img src="/pagi.png" alt="Pagi" class="toggle-icon-img" /> Pagi
          </button>
          <button class="routine-toggle-btn ${currentTime === 'night' ? 'active' : ''}" data-time="night">
            <img src="/malam.png" alt="Malam" class="toggle-icon-img" /> Malam
          </button>
        </div>

        <!-- Steps or Empty State -->
        <div class="routine-steps" id="routine-steps">
          ${steps.length === 0 ? `
            <div class="empty-routine anim-fade-in-up" style="text-align:center; padding: 40px 20px; background: white; border-radius: 16px; margin-top: 20px;">
              <div style="font-size: 3rem; margin-bottom: 15px;">🔍</div>
              <h3 style="margin-bottom: 10px;">Rutinitas Kosong</h3>
              <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 20px;">Kamu belum menambahkan produk ke rutinitas ini. Lakukan Scan AI untuk mendapatkan rekomendasi terbaik!</p>
              <button class="btn btn-primary" id="btn-scan-empty" style="width: 100%;">Mulai Scan AI</button>
            </div>
          ` : steps.map((s, i) => {
            const isDone = doneIndices.includes(i);
            const isSpecial = s._source === 'special';
            return `
            <div class="routine-step ${isDone ? 'done' : ''} ${isSpecial ? 'special-step' : ''}" data-idx="${i}">
              <div class="rs-icon" style="background:${s.bg || '#E3F2FD'}">${getStepIcon(s.label, s.emoji || '🧴', s.product)}</div>
              <div class="rs-info">
                <div class="rs-step-label">
                  Langkah ${i + 1} — ${s.label}
                  ${isSpecial ? '<span class="special-star">⭐</span>' : ''}
                </div>
                <div class="rs-product-name">${s.product}</div>
                <div class="rs-product-brand">${s.brand}${isSpecial ? ` · Khusus ${dayNames[selectedDay]}` : ''}</div>
              </div>
              <div class="rs-actions">
                <div class="rs-check ${isDone ? 'checked' : ''}" data-idx="${i}">
                  ${icons.check}
                </div>
                <button class="rs-delete" data-idx="${i}" title="Hapus langkah">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          `}).join('')}
        </div>

        <!-- Action Buttons -->
        <div class="routine-action-group" style="margin-top: 20px;">
          <button class="add-step-btn" id="add-step-btn">
            ${icons.plus} Tambah Langkah Harian
          </button>
          <button class="add-step-btn add-special-btn" id="add-special-btn">
            ⭐ Tambah Produk Khusus Hari Tertentu
          </button>
        </div>
      </div>
    `;

    page.querySelectorAll('.week-day').forEach(btn => {
      btn.addEventListener('click', () => {
        const day = parseInt(btn.dataset.day);
        if (day > today.getDay()) {
          showCustomAlert("Anda tidak dapat membuka rutinitas untuk hari berikutnya!", "Rutinitas Terkunci");
          return;
        }
        selectedDay = day;
        render();
      });
    });

    page.querySelectorAll('.routine-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTime = btn.dataset.time;
        if (targetTime === 'night') {
          const morningSteps = getStepsForDay(selectedDay, 'morning');
          const progress = getProgress(getSelectedDateStr());
          const morningDone = morningSteps.length === 0 || (progress.morning && progress.morning.length === morningSteps.length);
          if (!morningDone) {
            showCustomAlert("Rutinitas pagi belum diselesaikan semua! Selesaikan semua langkah pagi terlebih dahulu sebelum mengakses rutinitas malam.", "Rutinitas Pagi Belum Selesai");
            return;
          }
        }
        currentTime = targetTime;
        render();
      });
    });

    const btnScan = page.querySelector('#btn-scan-empty');
    if (btnScan) {
      btnScan.addEventListener('click', () => {
        window.location.hash = '#/scan';
      });
    }

    page.querySelectorAll('.rs-check').forEach(chk => {
      chk.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleStep(parseInt(chk.dataset.idx));
      });
    });

    page.querySelectorAll('.rs-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        showCustomConfirm("Yakin ingin menghapus langkah ini?", () => {
          const idx = parseInt(btn.dataset.idx);
          const step = steps[idx];
          deleteStep(idx, step._source, step);
        }, "Hapus Langkah");
      });
    });

    page.querySelector('#add-step-btn').addEventListener('click', () => showAddStepModal(false));
    page.querySelector('#add-special-btn').addEventListener('click', () => showAddStepModal(true));

    setTimeout(() => {
      const fill = page.querySelector('#routine-ring-fill');
      const pct = page.querySelector('#routine-percent');
      if (fill) fill.style.strokeDashoffset = 220 - (220 * progressPct / 100);
      if (pct) {
        let cur = 0;
        const sv = progressPct / 20;
        if(progressPct === 0) pct.textContent = '0%';
        else {
          const timer = setInterval(() => {
            cur += sv;
            if (cur >= progressPct) { cur = progressPct; clearInterval(timer); }
            pct.textContent = `${Math.round(cur)}%`;
          }, 30);
        }
      }
    }, 300);
  }

  render();
  return page;
}
