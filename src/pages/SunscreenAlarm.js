import { icons } from '../components/BottomNav.js';
import { fetchWeather } from '../utils/weather.js';
import { getUserId, syncUserData, isPremium } from '../utils/store.js';
import { showCustomAlert, renderPaywallPage } from '../utils/helpers.js';
import { requestLocationWithPermission, isLocationPermissionGranted, openLocationSettings, openAppSettings } from '../utils/geolocation.js';
import { requestNotificationPermission, scheduleAllAlarms, cancelAllAlarms, isNotificationGranted } from '../utils/alarm.js';

export function renderSunscreenAlarm() {
  // ── Paywall: hanya untuk Glow Plus ─────────────────────────────────────────
  if (!isPremium()) {
    return renderPaywallPage('Alarm UV', '☀️', [
      'Pantau indeks UV real-time di lokasimu',
      'Pengingat re-apply sunscreen otomatis',
      'Jadwal sunscreen terpersonalisasi',
    ]);
  }

  const page = document.createElement('div');
  page.className = 'page';

  const now = new Date();
  const currentHourLocal = now.getHours();
  const isNightTime = currentHourLocal >= 18 || currentHourLocal < 6;

  const userId = getUserId();
  let currentInterval = parseInt(localStorage.getItem('bglow_sunscreen_interval_' + userId)) || 2;
  
  let activeAlarmAudio = null;

  // Request notification permission on mount & schedule semua alarm hari ini
  requestNotificationPermission().then((granted) => {
    if (granted) {
      _scheduleAllTodayAlarms();
    }
  });

  /**
   * Schedule semua slot alarm hari ini via Service Worker.
   * Dipanggil saat page mount dan setiap kali interval/start time berubah.
   */
  async function _scheduleAllTodayAlarms() {
    const schedules = getSchedulesForInterval(currentInterval);
    const count = await scheduleAllAlarms(schedules);
    _updateAlarmStatusBadge(count);
    return count;
  }

  /**
   * Update badge/status di UI yang menunjukkan berapa alarm aktif.
   */
  function _updateAlarmStatusBadge(count) {
    const badge = page.querySelector('#alarm-status-badge');
    if (!badge) return;
    if (count > 0) {
      badge.textContent = `🔔 ${count} alarm aktif hari ini`;
      badge.style.display = 'flex';
    } else {
      badge.textContent = '🌙 Tidak ada alarm tersisa hari ini';
      badge.style.display = 'flex';
    }
  }

  // Today key for completed slots persistence
  const getTodayKey = () => new Date().toISOString().slice(0, 10);

  function getCompletedSlots() {
    try {
      return JSON.parse(localStorage.getItem(`bglow_sunscreen_completed_${userId}_${getTodayKey()}`)) || [];
    } catch (e) {
      return [];
    }
  }

  function toggleCompletedSlot(timeStr) {
    let list = getCompletedSlots();
    if (list.includes(timeStr)) {
      list = list.filter(t => t !== timeStr);
      showCustomAlert(`Status re-apply pukul ${timeStr} dibatalkan.`, "Dibatalkan ℹ️");
    } else {
      list.push(timeStr);
      showCustomAlert(`Berhasil ditandai: Sudah re-apply sunscreen pukul ${timeStr}! ✨`, "Sudah Re-apply ✅");
    }
    localStorage.setItem(`bglow_sunscreen_completed_${userId}_${getTodayKey()}`, JSON.stringify(list));
    renderTimeline();
  }

  // Helper to calculate schedules dynamically based on interval and start time
  function getSchedulesForInterval(intervalHrs) {
    const startTimeStr = localStorage.getItem('bglow_sunscreen_start_time_' + userId);
    let startH = 7;
    let startM = 0;

    if (startTimeStr) {
      const parts = startTimeStr.split(':').map(Number);
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        startH = parts[0];
        startM = parts[1];
      }
    }

    const schedules = [];
    const labels = [
      'Pemakaian Pagi',
      'Oles Ulang Pertama',
      'Oles Ulang Kedua',
      'Oles Ulang Ketiga',
      'Oles Ulang Keempat',
      'Oles Ulang Kelima',
      'Oles Ulang Keenam',
      'Oles Ulang Ketujuh',
      'Oles Ulang Kedelapan'
    ];

    let currentMinsTotal = startH * 60 + startM;
    const endMinsTotal = 19 * 60; // Max up to 19:00
    let labelIdx = 0;

    while (currentMinsTotal <= endMinsTotal && labelIdx < labels.length) {
      const h = Math.floor(currentMinsTotal / 60);
      const m = currentMinsTotal % 60;
      const hStr = String(h).padStart(2, '0');
      const mStr = String(m).padStart(2, '0');
      
      schedules.push({
        timeStr: `${hStr}:${mStr}`,
        label: labelIdx === 0 ? labels[0] : labels[labelIdx],
        mins: currentMinsTotal
      });

      currentMinsTotal += intervalHrs * 60;
      labelIdx++;
    }

    return schedules;
  }

  // Helper to calculate the next schedule dynamically
  function getNextSchedule() {
    const d = new Date();
    const currentMins = d.getHours() * 60 + d.getMinutes();
    
    const schedules = getSchedulesForInterval(currentInterval);
    
    let next = schedules.find(s => s.mins > currentMins);
    if (!next) {
      next = { ...schedules[0], isTomorrow: true };
    }
    return next;
  }

  // Helper to get seconds remaining to next schedule
  function getSecondsRemaining(nextSchedule) {
    const d = new Date();
    const target = new Date();
    const [h, m] = nextSchedule.timeStr.split(':').map(Number);
    target.setHours(h, m, 0, 0);
    if (nextSchedule.isTomorrow) {
      target.setDate(target.getDate() + 1);
    }
    return Math.max(0, Math.floor((target.getTime() - d.getTime()) / 1000));
  }

  const initialSchedule = getNextSchedule();
  let seconds = getSecondsRemaining(initialSchedule);

  page.innerHTML = `
    <div class="page-header">
      <button class="back-btn" id="back-btn">${icons.chevronLeft}</button>
      <h1>Alarm Sunscreen</h1>
    </div>
    <div class="page-content">
      <!-- Dasbor UV -->
      <div class="uv-dashboard ${isNightTime ? 'night-theme' : ''} anim-fade-in-up">
        <div class="uv-dash-header">
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <div class="uv-title">Indeks UV</div>
            <div class="uv-location" id="uv-location-text" title="Klik untuk memperbarui lokasi">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; flex-shrink: 0;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span id="uv-location-val">Mendeteksi lokasi...</span>
            </div>
          </div>
          <div class="uv-date">${now.toLocaleDateString('id-ID', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
        </div>
        <div class="uv-gauge-wrap">
          <div class="uv-gauge">
            <svg viewBox="0 0 100 100">
              <circle class="gauge-bg" cx="50" cy="50" r="40"/>
              <circle class="gauge-fill" cx="50" cy="50" r="40" id="uv-gauge-fill"/>
            </svg>
            <div class="gauge-value">
              <div class="gauge-number" id="uv-number">0</div>
              <div class="gauge-label">UV</div>
            </div>
          </div>
          <div class="uv-info-right">
            <div class="uv-level-text" id="uv-level-text">Memuat...</div>
            <div class="uv-level-desc" id="uv-level-desc">Mendeteksi tingkat UV saat ini...</div>
            <div class="sun-animated">${icons.sun}</div>
          </div>
        </div>
      </div>

      <!-- Reminder Schedule -->
      <div class="reminder-section anim-fade-in-up anim-delay-2">
        <div class="reminder-title">Interval Pengingat</div>
        <div class="reminder-options">
          <button class="reminder-chip ${currentInterval === 2 ? 'active' : ''}" data-interval="2">2 jam</button>
          <button class="reminder-chip ${currentInterval === 3 ? 'active' : ''}" data-interval="3">3 jam</button>
          <button class="reminder-chip ${currentInterval !== 2 && currentInterval !== 3 ? 'active' : ''}" data-interval="custom">
            ${currentInterval !== 2 && currentInterval !== 3 ? `${currentInterval} jam` : 'Kustom'}
          </button>
        </div>
      </div>

      <!-- Timeline -->
      <div class="reminder-section anim-fade-in-up anim-delay-3">
        <div class="reminder-title">Jadwal Hari Ini</div>
        <div class="alarm-timeline" id="timeline-container"></div>
      </div>

      <!-- Active Alarm Card -->
      <div class="active-alarm-card anim-fade-in-up anim-delay-5">
        <div class="alarm-card-header">
          ${icons.bell}
          <span>Pengingat Berikutnya</span>
        </div>
        <div class="alarm-countdown" id="countdown">--:--:--</div>
        <div class="alarm-next-text" id="alarm-next-text">Menghitung jadwal...</div>
        <button class="btn btn-outline" id="btn-set-start-time" style="margin-top: 14px; width: 100%; border-color: rgba(255,255,255,0.4); color: white; padding: 10px; font-size: 0.85rem; font-weight: 600; border-radius: var(--radius-md); background: rgba(255,255,255,0.18); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;">
          ${isNightTime ? '🌙 Mode Malam Aktif' : `⚙️ Atur Jam Mulai & Ulangi (${localStorage.getItem('bglow_sunscreen_start_time_' + userId) || '07:00'})`}
        </button>
        <div id="alarm-status-badge" style="display:none; margin-top: 10px; justify-content: center; align-items: center; gap: 6px; font-size: 0.78rem; font-weight: 600; color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.12); border-radius: var(--radius-full); padding: 6px 14px; border: 1px solid rgba(255,255,255,0.2);"></div>
      </div>
    </div>

    <!-- Toast -->
    <div class="toast-notification" id="toast">
      <span class="toast-icon">☀️</span>
      <span class="toast-text">Waktunya oles ulang sunscreen ☀️</span>
    </div>
  `;

  // Back button
  page.querySelector('#back-btn').addEventListener('click', () => {
    window.location.hash = '#/';
  });

  // Action button: Setel / Atur Jam Mulai Pengingat
  page.querySelector('#btn-set-start-time')?.addEventListener('click', () => {
    const curH = new Date().getHours();
    const curIsNight = curH >= 18 || curH < 6;

    if (curIsNight) {
      showCustomAlert(
        "Mode Malam Aktif 🌙\nPengingat sunscreen tidak dapat diaktifkan pada malam hari (18:00 - 06:00). Pengingat akan otomatis aktif besok pagi pukul 07:00.",
        "Mode Malam Aktif 🌙"
      );
      return;
    }

    showSetStartTimeModal();
  });

  // Helper to show Custom Start Time and Repeat Daily Modal
  function showSetStartTimeModal() {
    const existing = document.querySelector('.custom-start-time-overlay');
    if (existing) existing.remove();

    const d = new Date();
    const nowH = String(d.getHours()).padStart(2, '0');
    const nowM = String(d.getMinutes()).padStart(2, '0');
    const nowTimeStr = `${nowH}:${nowM}`;
    const currentSavedTime = localStorage.getItem('bglow_sunscreen_start_time_' + userId) || '07:00';
    const isRepeat = localStorage.getItem('bglow_sunscreen_repeat_daily_' + userId) !== 'false';

    const overlay = document.createElement('div');
    overlay.className = 'diary-modal-overlay custom-start-time-overlay';
    overlay.innerHTML = `
      <div class="diary-modal custom-start-time-modal anim-fade-in-up" style="max-width: 330px; padding: 24px; text-align: center; border-radius: var(--radius-lg); background: white;">
        <div class="modal-handle" style="width: 40px; height: 4px; background: var(--border-light); border-radius: var(--radius-full); margin: 0 auto 16px auto;"></div>
        <div style="font-size: 2.5rem; margin-bottom: 12px; animation: bounce 2s infinite;">⏰</div>
        <h3 style="margin-bottom: 6px; font-weight: 700; color: var(--text-primary); font-size: 1.2rem;">Atur Jam Mulai Pengingat</h3>
        <p style="color: var(--text-secondary); font-size: 0.82rem; margin-bottom: 16px; line-height: 1.4;">
          Jadwal re-apply berikutnya akan dihitung otomatis setiap <strong>${currentInterval} jam</strong> dari jam mulai yang Anda tentukan.
        </p>

        <div style="margin-bottom: 16px; text-align: left;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <label style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary);">Jam Mulai Pemakaian:</label>
            <button id="btn-use-now" style="background: none; border: none; color: var(--primary); font-size: 0.75rem; font-weight: 600; cursor: pointer; text-decoration: underline;">
              Jam Sekarang (${nowTimeStr})
            </button>
          </div>
          <input type="time" id="start-time-picker" class="auth-input" value="${currentSavedTime}" style="font-size: 1.3rem; font-weight: 700; text-align: center; padding: 10px; width: 100%; box-sizing: border-box; border-radius: var(--radius-md); border: 1.5px solid var(--border-light); color: var(--primary);" />
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: #F8FAFC; border-radius: var(--radius-md); margin-bottom: 20px; border: 1px solid var(--border-light);">
          <div style="text-align: left;">
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary);">🔄 Ulangi Setiap Hari</div>
            <div style="font-size: 0.75rem; color: var(--text-tertiary);">Otomatis aktifkan jadwal ini tiap pagi</div>
          </div>
          <input type="checkbox" id="repeat-daily-check" ${isRepeat ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--primary); cursor: pointer;" />
        </div>

        <div style="display: flex; gap: 10px;">
          <button class="btn btn-outline" id="btn-cancel-start-time" style="flex:1; padding: 12px; font-weight: 600; border-radius: var(--radius-md);">Batal</button>
          <button class="btn btn-primary" id="btn-save-start-time" style="flex:1; padding: 12px; font-weight: 600; border-radius: var(--radius-md); background: var(--primary); color: white; border: none;">Simpan</button>
        </div>
      </div>
    `;

    overlay.querySelector('#btn-use-now').addEventListener('click', () => {
      overlay.querySelector('#start-time-picker').value = nowTimeStr;
    });

    overlay.querySelector('#btn-cancel-start-time').addEventListener('click', () => {
      overlay.remove();
    });

    overlay.querySelector('#btn-save-start-time').addEventListener('click', () => {
      const selectedTime = overlay.querySelector('#start-time-picker').value;
      const isChecked = overlay.querySelector('#repeat-daily-check').checked;

      if (!selectedTime) {
        showCustomAlert("Mohon pilih jam mulai yang valid!", "Validasi Gagal");
        return;
      }

      localStorage.setItem('bglow_sunscreen_start_time_' + userId, selectedTime);
      localStorage.setItem('bglow_sunscreen_repeat_daily_' + userId, isChecked ? 'true' : 'false');
      
      overlay.remove();

      const setBtnEl = page.querySelector('#btn-set-start-time');
      if (setBtnEl) {
        setBtnEl.textContent = `⚙️ Atur Jam Mulai & Ulangi (${selectedTime})`;
      }

      renderTimeline();
      const next = getNextSchedule();
      seconds = getSecondsRemaining(next);
      
      const nextTextEl = page.querySelector('#alarm-next-text');
      if (nextTextEl) {
        nextTextEl.textContent = `Oles ulang sunscreen pukul ${next.timeStr}${next.isTomorrow ? ' (Besok)' : ''}`;
      }

      _scheduleAllTodayAlarms();

      showCustomAlert(
        `Pengingat sunscreen di-setel mulai pukul ${selectedTime} (tiap ${currentInterval} jam). ${isChecked ? 'Ulangi setiap hari aktif.' : ''}`,
        "Pengingat Aktif ⏰"
      );
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    document.body.appendChild(overlay);
  }

  // Render timeline dynamically with interactive checklist
  function renderTimeline() {
    const container = page.querySelector('#timeline-container');
    if (!container) return;
    container.innerHTML = '';

    const d = new Date();
    const currentMins = d.getHours() * 60 + d.getMinutes();
    
    const schedules = getSchedulesForInterval(currentInterval);
    const completedList = getCompletedSlots();

    let foundCurrent = false;
    schedules.forEach(item => {
      const isCompleted = completedList.includes(item.timeStr);
      let state;

      if (isCompleted) {
        state = 'done';
      } else if (item.mins <= currentMins) {
        state = 'current';
      } else if (!foundCurrent) {
        state = 'current';
        foundCurrent = true;
      } else {
        state = 'upcoming';
      }

      const el = document.createElement('div');
      el.className = `timeline-item ${state}`;
      el.innerHTML = `
        <div class="tl-time">${item.timeStr}</div>
        <div class="tl-label">${item.label}</div>
        <button class="tl-check-btn ${isCompleted ? 'checked' : 'unchecked'}" data-time="${item.timeStr}">
          ${isCompleted ? '✓ Sudah Re-apply' : '+ Tandai Sudah Re-apply'}
        </button>
      `;

      el.querySelector('.tl-check-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCompletedSlot(item.timeStr);
      });

      container.appendChild(el);
    });
  }

  // Initial timeline render
  renderTimeline();

  // Custom alarm sound using alarm.mp3
  function playAlarmSound() {
    stopAlarmSound(); // stop any existing sound first
    
    try {
      const audio = new Audio('/alarm.mp3');
      audio.loop = true;
      audio.volume = 1.0;
      audio.play().catch(e => console.error('Gagal memutar alarm.mp3:', e));
      activeAlarmAudio = audio;
    } catch (e) {
      console.error("Gagal memutar suara alarm:", e);
    }
  }

  function stopAlarmSound() {
    if (activeAlarmAudio) {
      try {
        activeAlarmAudio.pause();
        activeAlarmAudio.currentTime = 0;
      } catch (e) {
        console.error("Gagal menghentikan audio alarm:", e);
      }
      activeAlarmAudio = null;
    }
  }



  // Helper to show a custom interval popup modal instead of browser prompt
  function showCustomIntervalModal(callback) {
    const existing = document.querySelector('.custom-interval-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'diary-modal-overlay custom-interval-overlay';
    overlay.innerHTML = `
      <div class="diary-modal custom-interval-modal anim-fade-in-up" style="max-width: 320px; padding: 24px; text-align: center; border-radius: var(--radius-lg); background: white;">
        <div class="modal-handle" style="width: 40px; height: 4px; background: var(--border-light); border-radius: var(--radius-full); margin: 0 auto 16px auto;"></div>
        <div style="font-size: 2.5rem; margin-bottom: 12px; animation: bounce 2s infinite;">⏱️</div>
        <h3 style="margin-bottom: 8px; font-weight: 700; color: var(--text-primary); font-size: 1.2rem;">Interval Kustom</h3>
        <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 16px; line-height: 1.4;">
          Berapa jam interval pengingat sunscreen yang Anda inginkan?
        </p>
        
        <input type="number" id="custom-hrs-input" class="auth-input" min="1" max="24" value="${currentInterval !== 2 && currentInterval !== 3 ? currentInterval : 4}" style="text-align: center; font-size: 1.3rem; font-weight: 700; margin-bottom: 20px; padding: 12px; border: 1.5px solid var(--border-light); border-radius: var(--radius-md); width: 100%; box-sizing: border-box; color: var(--primary);" />
        
        <div style="display: flex; gap: 12px; width: 100%;">
          <button class="btn btn-outline" id="btn-custom-cancel" style="flex: 1; padding: 12px; font-size: 0.9rem; font-weight: 600; border-radius: var(--radius-md); cursor: pointer;">Batal</button>
          <button class="btn btn-primary" id="btn-custom-save" style="flex: 1; padding: 12px; font-size: 0.9rem; font-weight: 600; border-radius: var(--radius-md); cursor: pointer; background: var(--primary); color: white; border: none;">Simpan</button>
        </div>
      </div>
    `;

    overlay.querySelector('#btn-custom-cancel').addEventListener('click', () => {
      overlay.remove();
    });

    overlay.querySelector('#btn-custom-save').addEventListener('click', () => {
      const inputVal = overlay.querySelector('#custom-hrs-input').value;
      const hrs = parseInt(inputVal);
      if (hrs && !isNaN(hrs) && hrs > 0) {
        callback(hrs);
        overlay.remove();
      } else {
        showCustomAlert("Mohon masukkan angka jam yang valid (minimal 1 jam)!", "Validasi Gagal");
      }
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    document.body.appendChild(overlay);
    
    // Auto focus and select input
    setTimeout(() => {
      const input = overlay.querySelector('#custom-hrs-input');
      if (input) {
        input.focus();
        input.select();
      }
    }, 100);
  }

  // Reminder chips
  page.querySelectorAll('.reminder-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const nextTextEl = page.querySelector('#alarm-next-text');
      const interval = chip.dataset.interval;
      
      if (interval === 'custom') {
        showCustomIntervalModal((hrs) => {
          if (hrs && !isNaN(hrs) && hrs > 0) {
            currentInterval = hrs;
            page.querySelectorAll('.reminder-chip').forEach(c => {
              c.classList.remove('active');
              if (c.dataset.interval === 'custom') {
                c.textContent = `${hrs} jam`;
              } else {
                const baseInt = c.dataset.interval;
                c.textContent = `${baseInt} jam`;
              }
            });
            chip.classList.add('active');

            // Save locally and sync to database
            localStorage.setItem('bglow_sunscreen_interval_' + userId, currentInterval);
            syncUserData({ sunscreen_interval: currentInterval });

            renderTimeline();
            const next = getNextSchedule();
            seconds = getSecondsRemaining(next);
            if (nextTextEl) {
              nextTextEl.textContent = `Oles ulang sunscreen pukul ${next.timeStr}${next.isTomorrow ? ' (Besok)' : ''}`;
            }
            _scheduleAllTodayAlarms();
          }
        });
      } else {
        currentInterval = parseInt(interval);
        page.querySelectorAll('.reminder-chip').forEach(c => {
          c.classList.remove('active');
          if (c.dataset.interval === 'custom') {
            c.textContent = 'Kustom';
          } else {
            const baseInt = c.dataset.interval;
            c.textContent = `${baseInt} jam`;
          }
        });
        chip.classList.add('active');

        // Save locally and sync to database
        localStorage.setItem('bglow_sunscreen_interval_' + userId, currentInterval);
        syncUserData({ sunscreen_interval: currentInterval });

        renderTimeline();
        const next = getNextSchedule();
        seconds = getSecondsRemaining(next);
        if (nextTextEl) {
          nextTextEl.textContent = `Oles ulang sunscreen pukul ${next.timeStr}${next.isTomorrow ? ' (Besok)' : ''}`;
        }
        _scheduleAllTodayAlarms();
      }
    });
  });

  // Helper to update the weather UI components
  function updateWeatherUI(w) {
    if (!w) return;
    const uvIndex = w.uvIndex;
    const isHighUv = uvIndex >= 6;
    
    const locationValEl = page.querySelector('#uv-location-val');
    if (locationValEl) {
      locationValEl.textContent = w.locationName || 'Lokasi tidak diketahui';
    }
    
    const levelText = page.querySelector('#uv-level-text');
    const levelDesc = page.querySelector('#uv-level-desc');
    const currentHourLocal = new Date().getHours();
    const isNightTimeVal = currentHourLocal >= 18 || currentHourLocal < 6;
    
    if (levelText) {
      if (isNightTimeVal) {
        levelText.textContent = 'Malam Hari';
        levelText.style.color = '#C7D2FE';
      } else {
        const baseLevel = isHighUv ? 'Tinggi' : (uvIndex >= 3 ? 'Sedang' : 'Rendah');
        levelText.textContent = w.condition ? `${baseLevel} • ${w.condition}` : baseLevel;
        levelText.style.color = isHighUv ? '#EF4444' : (uvIndex >= 3 ? '#F59E0B' : '#10B981');
      }
    }
    
    if (levelDesc) {
      if (isNightTimeVal) {
        levelDesc.textContent = 'Sudah malam hari. Sunscreen tidak diperlukan saat ini. Selamat beristirahat!';
      } else {
        // Base protection advice
        let baseAdvice = '';
        if (isHighUv) {
          baseAdvice = 'Perlindungan diperlukan. Gunakan sunscreen SPF 30+ setiap 2 jam.';
        } else if (uvIndex >= 3) {
          baseAdvice = 'Gunakan sunscreen jika beraktivitas di luar.';
        } else {
          baseAdvice = 'Indeks UV aman. Perlindungan ringan cukup.';
        }
        
        // Dynamically customize advice depending on weather condition
        if (w.condition) {
          const condLower = w.condition.toLowerCase();
          if (condLower.includes('hujan') || condLower.includes('badai')) {
            levelDesc.textContent = `Cuaca sedang ${w.condition}. Meskipun mendung atau hujan, radiasi UV tetap menembus awan. ${baseAdvice}`;
          } else if (condLower.includes('berawan') || condLower.includes('kabut')) {
            levelDesc.textContent = `Cuaca sedang ${w.condition}. Sinar UV masih bisa menembus lapisan awan tipis. ${baseAdvice}`;
          } else if (condLower.includes('cerah')) {
            levelDesc.textContent = `Cuaca sedang ${w.condition} terik. Radiasi UV langsung terpancar. ${baseAdvice}`;
          } else {
            levelDesc.textContent = `Cuaca ${w.condition}. ${baseAdvice}`;
          }
        } else {
          levelDesc.textContent = baseAdvice;
        }
      }
    }

    const fill = page.querySelector('#uv-gauge-fill');
    const num = page.querySelector('#uv-number');
    if (fill && num) {
      const percent = Math.min(uvIndex / 11, 1);
      const offset = 251 - (251 * percent);
      fill.style.strokeDashoffset = offset;
      
      if (isNightTimeVal) {
        fill.style.stroke = '#38BDF8';
      } else if (isHighUv) {
        fill.style.stroke = '#EF4444';
      } else if (uvIndex >= 3) {
        fill.style.stroke = '#F59E0B';
      } else {
        fill.style.stroke = '#10B981';
      }

      if (isNightTimeVal) {
        const sunAnim = page.querySelector('.sun-animated');
        if (sunAnim) {
          sunAnim.style.display = 'none';
        }
      } else {
        const sunAnim = page.querySelector('.sun-animated');
        if (sunAnim) {
          sunAnim.style.display = 'block';
        }
      }

      let current = 0;
      const step = (uvIndex || 1) / 20;
      const timer = setInterval(() => {
        current += step;
        if (current >= uvIndex) { current = uvIndex; clearInterval(timer); }
        num.textContent = Math.round(current);
      }, 40);
    }
  }

  // Function to show location permission guide modal
  function showLocationPermissionDeniedModal() {
    const existing = document.querySelector('.location-guide-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'diary-modal-overlay location-guide-overlay';
    overlay.innerHTML = `
      <div class="diary-modal location-guide-modal anim-fade-in-up" style="max-width: 340px; padding: 24px; text-align: center; border-radius: var(--radius-lg); background: white;">
        <div style="width: 54px; height: 54px; border-radius: 50%; background: rgba(239, 68, 68, 0.12); color: #EF4444; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto;">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h3 style="margin-bottom: 8px; font-weight: 700; color: var(--text-primary); font-size: 1.25rem;">Izin Lokasi Diblokir</h3>
        <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 20px; line-height: 1.5;">
          Perizinan lokasi diblokir oleh sistem HP. Tekan tombol di bawah untuk membuka halaman izin aplikasi secara langsung.
        </p>
        <button class="btn btn-primary" id="btn-open-app-settings" style="width: 100%; padding: 13px; font-size: 0.9rem; font-weight: 700; border-radius: var(--radius-md); cursor: pointer; background: var(--primary); color: white; border: none; margin-bottom: 8px;">⚙️ Buka Pengaturan Izin</button>
        <button class="btn btn-outline" id="btn-location-guide-ok" style="width: 100%; padding: 10px; font-size: 0.85rem; font-weight: 600; border-radius: var(--radius-md); cursor: pointer;">Batal</button>
      </div>
    `;

    overlay.querySelector('#btn-open-app-settings').addEventListener('click', () => {
      overlay.remove();
      openAppSettings();
    });

    overlay.querySelector('#btn-location-guide-ok').addEventListener('click', () => {
      overlay.remove();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    document.body.appendChild(overlay);
  }

  // Function to show GPS OFF guide modal when app permission is granted but phone GPS is off
  function showGpsOffModal() {
    const existing = document.querySelector('.gps-off-guide-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'diary-modal-overlay gps-off-guide-overlay';
    overlay.innerHTML = `
      <div class="diary-modal gps-off-guide-modal anim-fade-in-up" style="max-width: 340px; padding: 24px; text-align: center; border-radius: var(--radius-lg); background: white;">
        <div class="modal-handle" style="width: 40px; height: 4px; background: var(--border-light); border-radius: var(--radius-full); margin: 0 auto 16px auto;"></div>
        <div style="font-size: 3rem; margin-bottom: 12px; animation: pulse 1s infinite alternate;">📍</div>
        <h3 style="margin-bottom: 8px; font-weight: 700; color: #EF4444; font-size: 1.2rem;">GPS HP Masih Non-Aktif</h3>
        <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 20px; line-height: 1.5;">
          Izin lokasi sudah <strong>Di-ACC ✅</strong>, tapi <strong>GPS HP masih MATI (OFF)</strong>.
          <br><br>
          Tekan tombol di bawah untuk langsung membuka halaman pengaturan GPS HP Anda.
        </p>
        <button class="btn btn-primary" id="btn-open-gps-settings" style="width: 100%; padding: 13px; font-size: 0.9rem; font-weight: 700; border-radius: var(--radius-md); cursor: pointer; background: #EF4444; color: white; border: none; margin-bottom: 8px;">📍 Aktifkan GPS Sekarang</button>
        <button class="btn btn-outline" id="btn-gps-off-ok" style="width: 100%; padding: 10px; font-size: 0.85rem; font-weight: 600; border-radius: var(--radius-md); cursor: pointer;">Nanti Saja</button>
      </div>
    `;

    overlay.querySelector('#btn-open-gps-settings').addEventListener('click', () => {
      overlay.remove();
      openLocationSettings();
    });

    overlay.querySelector('#btn-gps-off-ok').addEventListener('click', () => {
      overlay.remove();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    document.body.appendChild(overlay);
  }

  // Request actual user geolocation via Capacitor native plugin
  async function requestUserLocation(silent = false) {
    const locationValEl = page.querySelector('#uv-location-val');
    if (locationValEl) {
      locationValEl.textContent = 'Mendeteksi koordinat...';
    }

    try {
      const pos = await requestLocationWithPermission({
        silent: silent,
        timeout: 12000,
        maxRetries: 1
      });

      if (pos && pos.lat !== null && pos.lon !== null) {
        if (locationValEl) {
          locationValEl.textContent = 'Menghubungkan satelit cuaca...';
        }

        const w = await fetchWeather(pos.lat, pos.lon);
        updateWeatherUI(w);
        if (!silent) {
          showCustomAlert("Lokasi Anda berhasil diperbarui secara akurat!", "Lokasi Aktif 📍");
        }
      } else if (pos && pos.error === 'PERMISSION_DENIED') {
        fetchWeather().then(updateWeatherUI);
        showLocationPermissionDeniedModal();
      } else {
        fetchWeather().then(updateWeatherUI);
      }
    } catch (err) {
      console.error("Gagal mendeteksi lokasi:", err);
      fetchWeather().then(updateWeatherUI);
    }
  }

  // Fetch real weather and animate gauge — then auto-request location (silent agar tidak double popup dgn main.js)
  fetchWeather().then(async (w) => {
    updateWeatherUI(w);
    await requestUserLocation(true);
  }).catch(err => console.error('Gagal memuat UV:', err));

  // Auto-retry lokasi saat user kembali dari halaman Settings GPS
  function onVisibilityChange() {
    if (document.visibilityState === 'visible') {
      // User kembali ke app (mungkin habis dari GPS settings), retry silent
      requestUserLocation(true);
    }
  }
  document.addEventListener('visibilitychange', onVisibilityChange);

  // Click handler to refresh or activate GPS location
  const uvLocTextEl = page.querySelector('#uv-location-text');
  if (uvLocTextEl) {
    uvLocTextEl.addEventListener('click', (e) => {
      e.stopPropagation();
      requestUserLocation(false);
    });
  }

  // Initialize countdown labels
  const nextTextEl = page.querySelector('#alarm-next-text');
  const alarmHeaderSpan = page.querySelector('.alarm-card-header span');

  if (nextTextEl) {
    if (isNightTime) {
      nextTextEl.textContent = `Kembali aktif pukul 07:00 besok pagi`;
      if (alarmHeaderSpan) {
        alarmHeaderSpan.innerHTML = 'Mode Malam Aktif';
      }
    } else {
      nextTextEl.textContent = `Oles ulang sunscreen pukul ${initialSchedule.timeStr}${initialSchedule.isTomorrow ? ' (Besok)' : ''}`;
    }
  }

  // Schedule native push notification for the next upcoming slot automatically
  scheduleNextNativeNotification();

  // Countdown timer
  const countdownEl = page.querySelector('#countdown');
  
  const timerInterval = setInterval(() => {
    const curHour = new Date().getHours();
    const curNight = curHour >= 18 || curHour < 6;
    
    if (curNight) {
      if (countdownEl) {
        countdownEl.textContent = 'MALAM';
      }
      if (nextTextEl) {
        nextTextEl.textContent = `Kembali aktif pukul 07:00 besok pagi`;
      }
      if (alarmHeaderSpan) {
        alarmHeaderSpan.innerHTML = 'Mode Malam Aktif';
      }
      return;
    }

    if (seconds > 0) {
      seconds--;
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      if (countdownEl) {
        countdownEl.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      }
    } else {
      // Time is up!
      playAlarmSound();
      showAlarmPopup();
      
      // Send system push notification
      sendNotification("Waktunya Re-apply! ☀️", "Ayo oleskan ulang sunscreen Anda untuk melindungi kulit dari sinar UV.");

      // Update timeline status dynamically since a slot just passed
      renderTimeline();
      
      // Recalculate next schedule
      const next = getNextSchedule();
      seconds = getSecondsRemaining(next);
      if (nextTextEl) {
        nextTextEl.textContent = `Oles ulang sunscreen pukul ${next.timeStr}${next.isTomorrow ? ' (Besok)' : ''}`;
      }
    }
  }, 1000);

  function showAlarmPopup() {
    // Prevent duplicate overlays
    const existing = document.querySelector('.alarm-popup-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'diary-modal-overlay alarm-popup-overlay';
    overlay.innerHTML = `
      <div class="diary-modal" style="text-align:center;">
        <div class="modal-handle"></div>
        <div style="font-size: 3.5rem; margin-bottom: 15px; animation: pulse 1s infinite alternate;">☀️</div>
        <h2 style="margin-bottom: 10px; color: #F43F5E;">Waktunya Re-apply!</h2>
        <p style="color: var(--text-secondary); margin-bottom: 20px; line-height: 1.5;">Indeks UV saat ini memerlukan perlindungan aktif. Segera oleskan ulang sunscreen-mu untuk menjaga kulit dari sinar matahari.</p>
        <button class="btn btn-primary" id="btn-done-reapply" style="width: 100%; margin-bottom: 10px; background: #F43F5E; border: none; padding: 12px; font-weight: 600; border-radius: var(--radius-md); color: white; cursor: pointer;">Sudah Re-apply</button>
        <button class="btn btn-outline" id="btn-snooze" style="width: 100%; padding: 12px; font-weight: 600; border-radius: var(--radius-md); cursor: pointer;">Ingatkan 10 menit lagi</button>
      </div>
    `;
    
    overlay.querySelector('#btn-done-reapply').addEventListener('click', () => {
      overlay.remove();
      stopAlarmSound();
      // Recalculate and reset
      const next = getNextSchedule();
      seconds = getSecondsRemaining(next);
      renderTimeline();
      scheduleNextNativeNotification();
    });
    
    overlay.querySelector('#btn-snooze').addEventListener('click', () => {
      overlay.remove();
      stopAlarmSound();
      seconds = 600; // snooze for 10 minutes
    });
    
    document.body.appendChild(overlay);
  }

  // Clear interval when leaving page to avoid memory leaks
  const originalRemove = page.remove;
  page.remove = function() {
    clearInterval(timerInterval);
    stopAlarmSound();
    document.removeEventListener('visibilitychange', onVisibilityChange);
    originalRemove.call(this);
  };

  return page;
}
