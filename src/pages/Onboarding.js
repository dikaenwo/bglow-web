import { icons } from '../components/BottomNav.js';
import { getUserId, getAuthHeaders, syncUserData } from '../utils/store.js';
import { API_BASE_URL, SKIN_SCAN_API_URL } from '../config.js';
import { showCustomAlert } from '../utils/helpers.js';

export function renderOnboarding() {
  const page = document.createElement('div');
  page.className = 'onboarding';

  // State
  let currentStep = 0;
  const totalSteps = 12; // 0 to 11
  let cameraStream = null;
  let capturedImage = null;
  
  const userId = getUserId();

  const answers = {
    struggle: '',
    goals: [],
    age: '',
    scanResult: null,
    knowsSkinType: '',
    selectedManualSkinType: '',
    selectedSkinProblems: []
  };

  // SVGs for onboarding cards (replacing emojis)
  const leafIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary);"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2z"/><path d="M9 22v-4h4"/></svg>`;
  const bookIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary);"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`;
  const sparklesIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary);"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg>`;

  // Rich colorful icons for skin goals — same filled-circle style as Settings.js
  const targetIcon = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none"><circle cx="12" cy="12" r="11" fill="#FEE2E2" stroke="#EF4444" stroke-width="1"/><circle cx="12" cy="12" r="7" fill="#FCA5A5" opacity="0.5"/><circle cx="12" cy="12" r="3.5" fill="#EF4444"/><circle cx="9" cy="9" r="1.5" fill="#FCA5A5" stroke="#EF4444" stroke-width="0.8"/><circle cx="15" cy="10" r="1" fill="#FCA5A5" stroke="#EF4444" stroke-width="0.8"/></svg>`;

  const waveIcon = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none"><circle cx="12" cy="12" r="11" fill="#DBEAFE" stroke="#3B82F6" stroke-width="1"/><path d="M5 10c1-.7 2.5-1 4 0s3 1.5 4.5.5S16.5 9 18 10" stroke="#2563EB" stroke-width="1.5" stroke-linecap="round"/><path d="M5 13c1-.7 2.5-1 4 0s3 1.5 4.5.5S16.5 12 18 13" stroke="#3B82F6" stroke-width="1.5" stroke-linecap="round"/><path d="M5 16c1-.7 2.5-1 4 0s3 1.5 4.5.5S16.5 15 18 16" stroke="#93C5FD" stroke-width="1.2" stroke-linecap="round"/></svg>`;

  const poresIcon = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none"><circle cx="12" cy="12" r="11" fill="#EDE9FE" stroke="#8B5CF6" stroke-width="1"/><circle cx="9" cy="9" r="2" fill="#C4B5FD" stroke="#7C3AED" stroke-width="1"/><circle cx="15" cy="9" r="1.5" fill="#C4B5FD" stroke="#7C3AED" stroke-width="1"/><circle cx="9" cy="15" r="1.5" fill="#C4B5FD" stroke="#7C3AED" stroke-width="1"/><circle cx="15" cy="15" r="2" fill="#C4B5FD" stroke="#7C3AED" stroke-width="1"/><circle cx="12" cy="12" r="1.2" fill="#8B5CF6" opacity="0.6"/></svg>`;

  const sunIcon = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none"><circle cx="12" cy="12" r="11" fill="#FEF9C3" stroke="#EAB308" stroke-width="1"/><circle cx="12" cy="12" r="4" fill="#FDE047" stroke="#CA8A04" stroke-width="1"/><path d="M12 5v1.5M12 17.5V19M5 12H6.5M17.5 12H19M7.05 7.05l1.06 1.06M15.89 15.89l1.06 1.06M7.05 16.95l1.06-1.06M15.89 8.11l1.06-1.06" stroke="#CA8A04" stroke-width="1.3" stroke-linecap="round"/></svg>`;

  const dropIcon = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none"><circle cx="12" cy="12" r="11" fill="#CFFAFE" stroke="#06B6D4" stroke-width="1"/><path d="M12 6c0 0-5 4.5-5 7.5a5 5 0 0 0 10 0C17 10.5 12 6 12 6z" fill="#67E8F9" stroke="#0891B2" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14.5 15a3 3 0 0 1-2.5 1.5" stroke="#0E7490" stroke-width="1" stroke-linecap="round" opacity="0.7"/></svg>`;

  const shieldIcon = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none"><circle cx="12" cy="12" r="11" fill="#D1FAE5" stroke="#10B981" stroke-width="1"/><path d="M12 5l-5 2v4c0 3 2.5 5.5 5 7 2.5-1.5 5-4 5-7V7l-5-2z" fill="#6EE7B7" stroke="#059669" stroke-width="1.2" stroke-linejoin="round"/><path d="M9.5 12l2 2 3-3" stroke="#065F46" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  const skinGoalsList = [
    { id: 'breakouts', label: 'Mengurangi Jerawat', icon: '✨', bg: '#FEF3C7' },
    { id: 'oiliness', label: 'Mengontrol Minyak', icon: '💧', bg: '#E0F2FE' },
    { id: 'pores', label: 'Mengecilkan Pori', icon: '🔍', bg: '#F3E8FF' },
    { id: 'texture', label: 'Memperbaiki Tekstur', icon: '🌊', bg: '#E0F2FE' },
    { id: 'darkspots', label: 'Mencerahkan Noda', icon: '☀️', bg: '#FEF3C7' },
    { id: 'radiance', label: 'Meningkatkan Radiance', icon: '🌟', bg: '#FEF3C7' },
    { id: 'redness', label: 'Mengurangi Kemerahan', icon: '🩸', bg: '#FEE2E2' },
    { id: 'wrinkles', label: 'Menyamarkan Kerutan', icon: '👵', bg: '#FFEEDD' },
    { id: 'hydration', label: 'Meningkatkan Hidrasi', icon: '💦', bg: '#E0F2FE' },
    { id: 'sensitivity', label: 'Meredakan Kulit Sensitif', icon: '🛡️', bg: '#E2E8F0' }
  ];

  // Helper to stop camera webcam
  function stopCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      cameraStream = null;
    }
  }

  // Auto clean camera on hashchange
  const cleanCameraOnLeave = () => {
    stopCamera();
    window.removeEventListener('hashchange', cleanCameraOnLeave);
  };
  window.addEventListener('hashchange', cleanCameraOnLeave);

  // Mapped Permasalahan Colors & descriptions
  const PROBLEM_COLORS = {
    'Jerawat':         { hex: '#FF3B3B', bg: '#FFF0F0', emoji: '🔴' },
    'PIE':             { hex: '#3B7FFF', bg: '#EFF4FF', emoji: '🔵' },
    'PIH':             { hex: '#FF8C00', bg: '#FFF5E6', emoji: '🟠' },
    'Bopeng':          { hex: '#CC00CC', bg: '#F9EEFF', emoji: '🟣' },
    'Hiperpigmentasi': { hex: '#CCCC00', bg: '#FEFEE6', emoji: '🟡' },
    'Kemerahan':       { hex: '#00CC44', bg: '#EDFFF3', emoji: '🟢' },
  };

  const PROBLEM_DESCRIPTIONS = {
    'Jerawat':         'Peradangan folikel rambut akibat sumbatan sebum dan bakteri.',
    'PIE':             'Post-Inflammatory Erythema — kemerahan sisa bekas jerawat.',
    'PIH':             'Post-Inflammatory Hyperpigmentation — bercak gelap bekas jerawat.',
    'Bopeng':          'Jaringan parut cekung akibat kerusakan kolagen dari jerawat parah.',
    'Hiperpigmentasi': 'Penggelapan kulit akibat produksi melanin berlebih.',
    'Kemerahan':       'Iritasi atau rosacea menyebabkan kulit tampak merah.',
  };

  // Base layout skeleton
  page.innerHTML = `
    <div class="ob-header">
      <button class="ob-back-btn" id="ob-back">${icons.chevronLeft}</button>
      <div class="ob-progress-container">
        <div class="ob-progress-fill" id="ob-progress"></div>
      </div>
      <button class="ob-skip-btn" id="ob-skip" style="visibility: hidden;">Lewati</button>
    </div>
    <div class="ob-slide-container" id="ob-viewport">
      <!-- Dynamic Viewport -->
    </div>
  `;

  const viewport = page.querySelector('#ob-viewport');
  const progressBar = page.querySelector('#ob-progress');
  const backBtn = page.querySelector('#ob-back');
  const skipBtn = page.querySelector('#ob-skip');

  function updateHeader() {
    const header = page.querySelector('.ob-header');

    // Hide entire header on intro splash slides (0, 1, 2)
    if (currentStep <= 2) {
      header.style.display = 'none';
      return;
    } else {
      header.style.display = '';
    }

    const pct = Math.round((currentStep / (totalSteps - 1)) * 100);
    progressBar.style.width = `${pct}%`;

    // Only show back button for steps that are not in action/processing loops
    if (currentStep === 0 || currentStep === 7 || currentStep === 8 || currentStep === 10) {
      backBtn.style.visibility = 'hidden';
    } else {
      backBtn.style.visibility = 'visible';
    }

    // Skip is available only on kuis questions (steps 3, 4, 5)
    if (currentStep >= 3 && currentStep <= 5) {
      skipBtn.style.visibility = 'visible';
    } else {
      skipBtn.style.visibility = 'hidden';
    }
  }

  function goToStep(step) {
    // If leaving camera step, clean it up
    if (currentStep === 6 && step !== 6) {
      stopCamera();
    }
    currentStep = step;
    updateHeader();
    renderStepContent();
  }

  // Draw step HTML
  function renderStepContent() {
    viewport.innerHTML = '';
    const contentWrap = document.createElement('div');
    contentWrap.className = 'ob-content';

    let html = '';
    let isNextDisabled = false;

    switch (currentStep) {
      case 0:
        // Splash Intro 1
        html = `
          <div class="ob-logo-container" style="display: flex; justify-content: center; align-items: center; height: 160px; margin-bottom: 24px;">
            <img src="/BGLOW-Polos.png" alt="B-Glow Logo" style="width: 100px; height: 100px; object-fit: contain;" />
          </div>
          <div class="ob-title-wrap" style="text-align: center; margin-bottom: 40px; padding: 0 var(--space-md);">
            <h1 class="ob-quiz-title" style="font-size: var(--font-2xl); font-weight: 800; line-height: 1.35; margin: 0;">Bagaimana jika perawatan kulit bisa dibuat sangat mudah?</h1>
          </div>
        `;
        break;

      case 1:
        // Splash Intro 2
        html = `
          <div class="ob-title-wrap">
            <h1 class="ob-quiz-title">Jawaban atas pertanyaan kulit Anda</h1>
            <p class="ob-quiz-subtitle">Semua yang Anda butuhkan dalam satu asisten cerdas.</p>
          </div>
          <div class="ob-intro-questions">
            <div class="ob-intro-q-item">Apa yang harus saya gunakan?</div>
            <div class="ob-intro-q-item">Kandungan apa yang sebenarnya ada di dalam?</div>
            <div class="ob-intro-q-item">Bagaimana urutan pemakaian rutinitas saya?</div>
            <div class="ob-intro-q-item">Berapa lama sampai terlihat hasilnya?</div>
            <div class="ob-intro-q-item">Apakah produk ini benar-benar cocok?</div>
          </div>
        `;
        break;

      case 2:
        // Splash Intro 3
        html = `
          <div class="ob-logo-container" style="display: flex; justify-content: center; align-items: center; height: 120px; margin-bottom: 16px;">
            <img src="/BGLOW-Polos.png" alt="B-Glow Logo" style="width: 80px; height: 80px; object-fit: contain;" />
          </div>
          <div class="ob-title-wrap" style="text-align: center; margin-bottom: 24px; padding: 0 var(--space-md);">
            <h1 class="ob-quiz-title" style="font-size: var(--font-2xl); font-weight: 800; margin-bottom: 8px;">Perkenalkan B-Glow</h1>
            <p class="ob-quiz-subtitle" style="font-size: var(--font-sm); line-height: 1.5; color: var(--text-secondary); margin: 0;">Pendamping perawatan kulit berbasis sains untuk memandu transformasi kulit sehat Anda.</p>
          </div>
        `;
        break;

      case 3:
        // Q1: Skincare Familiarity
        isNextDisabled = !answers.struggle;
        html = `
          <div class="ob-title-wrap" style="text-align: center; margin-bottom: 24px;">
            <h1 class="ob-quiz-title" style="font-size: var(--font-xl); font-weight: 800; color: var(--text-primary); margin-bottom: 8px;">Seberapa paham Anda tentang skincare?</h1>
            <p class="ob-quiz-subtitle" style="font-size: var(--font-xs); color: var(--text-secondary); line-height: 1.5; margin: 0;">Ini membantu kami menyesuaikan rekomendasi dan menjelaskan informasi pada tingkat yang tepat.</p>
          </div>
          <div class="ob-options-list" style="display: flex; flex-direction: column; gap: 12px;">
            <div class="ob-option-card ${answers.struggle === 'beginner' ? 'active' : ''}" data-val="beginner" style="display: flex; align-items: center; gap: 16px; padding: var(--space-md); border: 1.5px solid var(--border-light); border-radius: var(--radius-lg); background: var(--bg-card); cursor: pointer; transition: all 0.2s ease;">
              <div class="ob-option-icon" style="background-color: #ECFDF5; width: 44px; height: 44px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                ${leafIcon}
              </div>
              <div style="text-align: left;">
                <div class="ob-option-text" style="font-weight: 700; font-size: var(--font-sm); color: var(--text-primary); margin-bottom: 4px;">Saya pemula</div>
                <div class="ob-option-desc" style="font-size: var(--font-xs); color: var(--text-secondary); line-height: 1.4;">Saya ingin langkah sederhana dan panduan produk yang jelas</div>
              </div>
            </div>
            <div class="ob-option-card ${answers.struggle === 'intermediate' ? 'active' : ''}" data-val="intermediate" style="display: flex; align-items: center; gap: 16px; padding: var(--space-md); border: 1.5px solid var(--border-light); border-radius: var(--radius-lg); background: var(--bg-card); cursor: pointer; transition: all 0.2s ease;">
              <div class="ob-option-icon" style="background-color: #EFF6FF; width: 44px; height: 44px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                ${bookIcon}
              </div>
              <div style="text-align: left;">
                <div class="ob-option-text" style="font-weight: 700; font-size: var(--font-sm); color: var(--text-primary); margin-bottom: 4px;">Paham dasar-dasar</div>
                <div class="ob-option-desc" style="font-size: var(--font-xs); color: var(--text-secondary); line-height: 1.4;">Saya menggunakan beberapa produk, tapi masih butuh bantuan memilih</div>
              </div>
            </div>
            <div class="ob-option-card ${answers.struggle === 'advanced' ? 'active' : ''}" data-val="advanced" style="display: flex; align-items: center; gap: 16px; padding: var(--space-md); border: 1.5px solid var(--border-light); border-radius: var(--radius-lg); background: var(--bg-card); cursor: pointer; transition: all 0.2s ease;">
              <div class="ob-option-icon" style="background-color: #F5F3FF; width: 44px; height: 44px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                ${sparklesIcon}
              </div>
              <div style="text-align: left;">
                <div class="ob-option-text" style="font-weight: 700; font-size: var(--font-sm); color: var(--text-primary); margin-bottom: 4px;">Sangat paham skincare</div>
                <div class="ob-option-desc" style="font-size: var(--font-xs); color: var(--text-secondary); line-height: 1.4;">Saya tahu rutinitas saya dan ingin cara lebih cerdas untuk mengoptimalkannya</div>
              </div>
            </div>
          </div>
        `;
        break;

      case 4:
        // Q2: Primary Skin Goal
        isNextDisabled = !answers.goals || answers.goals.length === 0;
        const goals = [
          { id: 'breakouts', label: 'Mengatasi jerawat', icon: targetIcon, bg: '#FEE2E2' },
          { id: 'texture', label: 'Memperbaiki tekstur kulit', icon: waveIcon, bg: '#EFF6FF' },
          { id: 'pores', label: 'Mengecilkan pori-pori', icon: poresIcon, bg: '#F5F3FF' },
          { id: 'darkspots', label: 'Mencerahkan noda hitam', icon: sunIcon, bg: '#FEF3C7' },
          { id: 'hydration', label: 'Meningkatkan hidrasi', icon: dropIcon, bg: '#E0F7FA' },
          { id: 'oiliness', label: 'Mengontrol minyak berlebih', icon: shieldIcon, bg: '#ECFDF5' }
        ];

        html = `
          <div class="ob-title-wrap" style="text-align: center; margin-bottom: 24px;">
            <h1 class="ob-quiz-title" style="font-size: var(--font-xl); font-weight: 800; color: var(--text-primary); margin-bottom: 8px;">Apa tujuan utama kulit Anda?</h1>
            <p class="ob-quiz-subtitle" style="font-size: var(--font-xs); color: var(--text-secondary); line-height: 1.5; margin: 0;">Pilih salah satu yang paling penting bagi Anda.</p>
          </div>
          <div class="ob-options-list" style="display: flex; flex-direction: column; gap: 10px;">
            ${goals.map(g => {
              const isActive = answers.goals && answers.goals.includes(g.id);
              return `
                <div class="ob-goal-option-card ${isActive ? 'active' : ''}" data-val="${g.id}" style="display: flex; align-items: center; gap: 14px; padding: 12px 16px; border: 1.5px solid var(--border-light); border-radius: var(--radius-lg); background: var(--bg-card); cursor: pointer; transition: all 0.2s ease;">
                  <div style="background-color: ${g.bg}; width: 36px; height: 36px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    ${g.icon}
                  </div>
                  <div style="flex: 1; text-align: left; font-weight: 700; font-size: var(--font-sm); color: var(--text-primary);">
                    ${g.label}
                  </div>
                  <div class="ob-checkbox-indicator" style="width: 20px; height: 20px; border-radius: 50%; border: 2px solid ${isActive ? 'var(--primary)' : 'var(--border)'}; display: flex; align-items: center; justify-content: center; background: ${isActive ? 'var(--primary)' : 'transparent'}; transition: all 0.2s ease;">
                    ${isActive ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `;
        break;

      case 5:
        // Q3: AI Scan Choice
        isNextDisabled = !answers.knowsSkinType;
        const isYesActive = answers.knowsSkinType === 'yes';
        const isNoActive = answers.knowsSkinType === 'no';
        
        html = `
          <div class="ob-title-wrap" style="text-align: center; margin-bottom: 32px;">
            <h1 class="ob-quiz-title" style="font-size: var(--font-xl); font-weight: 800; color: var(--text-primary); margin-bottom: 8px;">Apakah kamu sudah tau jenis kulitmu dan goals kulitmu apa?</h1>
            <p class="ob-quiz-subtitle" style="font-size: var(--font-xs); color: var(--text-secondary); line-height: 1.5; margin: 0;">Beri tahu kami jenis kulit Anda, atau gunakan AI untuk mendeteksinya.</p>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div class="ob-choice-card ${isYesActive ? 'active' : ''}" data-val="yes" style="padding: 16px; border: 1.5px solid ${isYesActive ? 'var(--primary)' : 'var(--border)'}; border-radius: var(--radius-lg); background: ${isYesActive ? 'var(--bg-soft)' : 'var(--bg-card)'}; cursor: pointer; font-weight: 600; font-size: var(--font-sm); text-align: left; transition: all 0.2s ease; display: flex; justify-content: space-between; align-items: center; box-shadow: var(--shadow-sm);">
              <span style="color: ${isYesActive ? 'var(--primary)' : 'var(--text-primary)'};">Ya, saya sudah tahu</span>
              ${isYesActive ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
            </div>
            
            <div class="ob-choice-card ${isNoActive ? 'active' : ''}" data-val="no" style="padding: 16px; border: 1.5px solid ${isNoActive ? 'var(--primary)' : 'var(--border)'}; border-radius: var(--radius-lg); background: ${isNoActive ? 'var(--bg-soft)' : 'var(--bg-card)'}; cursor: pointer; font-weight: 600; font-size: var(--font-sm); text-align: left; transition: all 0.2s ease; display: flex; justify-content: space-between; align-items: center; box-shadow: var(--shadow-sm);">
              <span style="color: ${isNoActive ? 'var(--primary)' : 'var(--text-primary)'};">Tidak, Scan dengan AI</span>
              ${isNoActive ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
            </div>
          </div>
        `;
        break;

      case 6:
        // AI Face Scan Camera Feed / Upload
        html = `
          <div class="ob-title-wrap" style="margin-bottom: 12px;">
            <h1 class="ob-quiz-title">Uji Coba AI Face Scan</h1>
            <p class="ob-quiz-subtitle">Posisikan wajah di tengah kamera untuk analisis kulit instan.</p>
          </div>
          
          <div style="margin: 0 auto 14px auto; max-width: 320px; padding: 10px 12px; background: #FFFDF5; border: 1.5px solid #FEF3C7; border-radius: 12px; display: flex; gap: 8px; align-items: flex-start; text-align: left;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 1px;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <div style="font-size: 10.5px; color: #B45309; line-height: 1.35;">
              <strong>Disclaimer:</strong> Analisis AI bersifat referensi pendukung dan tidak 100% akurat. Jangan dijadikan acuan medis mutlak.
            </div>
          </div>

          <div class="ob-scan-camera">
            <div class="ob-camera-feed">
              <video id="ob-webcam" autoplay playsinline muted style="width: 100%; height: 100%; object-fit: cover; display: none; transform: scaleX(-1); position: absolute; top: 0; left: 0; z-index: 1;"></video>
              
              <div class="ob-camera-placeholder" id="ob-placeholder">
                <div class="ob-placeholder-icon">
                  <svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </div>
                <span style="font-size: 13px; font-weight: 500;">Mengaktifkan kamera...</span>
              </div>
              
              <div class="ob-face-outline" style="z-index: 2;"></div>
            </div>
            
            <div class="ob-scan-controls">
              <button class="ob-scan-btn-main" id="ob-capture-btn">${icons.camera}</button>
            </div>
          </div>

          <input type="file" accept="image/*" capture="user" id="ob-camera-file" style="display: none;" />
          <input type="file" accept="image/*" id="ob-gallery-file" style="display: none;" />

          <button id="ob-upload-btn" style="
            display: flex; align-items: center; justify-content: center; gap: 8px;
            width: 100%; padding: 12px; border-radius: 12px;
            border: 1.5px dashed var(--primary); background: transparent;
            color: var(--primary); font-size: var(--font-sm); font-weight: 600;
            cursor: pointer; box-sizing: border-box; margin-top: 10px;
          ">
            <svg viewBox="0 0 24 24" style="width:18px; height:18px; stroke:currentColor; fill:none; stroke-width:2;"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Upload Gambar dari Galeri
          </button>
        `;
        break;

      case 7:
        // Scanning Animation Loop
        html = `
          <div class="ob-title-wrap" style="text-align: center;">
            <h1 class="ob-quiz-title">Memindai Wajah...</h1>
            <p class="ob-quiz-subtitle">Garis pemindai sedang memetakan topografi kulit Anda.</p>
          </div>
          <div class="ob-scan-camera">
            <div class="ob-camera-feed">
              <img src="${capturedImage || '/dummy-face.png'}" style="width:100%; height:100%; object-fit:cover; position:absolute; inset:0;" />
              <div class="ob-face-outline" style="z-index: 2;"></div>
              <div class="ob-scan-line" style="z-index: 2;"></div>
              <div class="ob-detection-points" id="ob-det-points" style="z-index: 3;"></div>
              <div class="ob-scan-status" style="z-index: 4;">
                <span class="shimmer-text">Melacak sebum dan pigmentasi kulit...</span>
              </div>
            </div>
          </div>
        `;
        break;

      case 8:
        // Processing Loader
        html = `
          <div class="ob-processing-loader-container">
            <div class="ob-processing-loader">
              <div class="ob-loader-ring"></div>
              <div class="ob-loader-ring"></div>
              <div class="ob-loader-ring"></div>
              <div class="ob-loader-glow"></div>
              <div class="ob-loader-center-icon"><img src="/face-chip-logo.png" class="ob-loader-face-chip" alt="B-Glow Chip" /></div>
              <div class="ob-particles">
                <div class="ob-particle"></div>
                <div class="ob-particle"></div>
                <div class="ob-particle"></div>
                <div class="ob-particle"></div>
              </div>
            </div>
            <h2 class="ob-quiz-title" style="font-size: var(--font-lg); margin-top: 10px; text-align: center;">Mengirim Data Ke AI B-Glow</h2>
            <p class="ob-quiz-subtitle" style="text-align: center;">Menyusun matriks profil kulit Anda...</p>
          </div>

          <div class="ob-p-steps">
            <div class="ob-p-step active" id="ob-step-1"><span class="ob-step-dot"></span> Memunggah foto ke server aman</div>
            <div class="ob-p-step" id="ob-step-2"><span class="ob-step-dot"></span> Mengidentifikasi tipe kadar minyak</div>
            <div class="ob-p-step" id="ob-step-3"><span class="ob-step-dot"></span> Menganalisis noda & inflamasi</div>
            <div class="ob-p-step" id="ob-step-4"><span class="ob-step-dot"></span> Merangkum rekomendasi skincare</div>
          </div>
        `;
        break;

      case 9:
        // Display Results
        const res = answers.scanResult;
        const rawAcne = (res.acne_level || 'Bersih').replace(/ — Grade \d+/, '');
        const cleanAcneLevel = (rawAcne === 'Bersih' || rawAcne === 'Tidak Ada') ? 'Bersih' : 'Jerawat';
        const skinTypeEmoji = {
          'Berminyak': '💦',
          'Kombinasi': '🌓',
          'Kering': '🍂',
          'Normal': '✨',
          'Sensitif': '🛡️'
        }[res.jenis_kulit] || '✨';

        const problemsHTML = (!res.permasalahan || res.permasalahan.length === 0) ? `
          <div style="text-align:center; padding: 16px; background: #F0FDF4; border-radius: 12px; border: 1.5px solid #86EFAC;">
            <p style="color: #16A34A; font-weight: 700; margin: 0; font-size:13px;">Kondisi kulit sangat sehat!</p>
            <p style="color: #4ADE80; font-size: 11px; margin: 4px 0 0;">Tidak ada anomali atau noda parah terdeteksi.</p>
          </div>
        ` : res.permasalahan.map(p => {
          const col = PROBLEM_COLORS[p.label] || { hex: '#888', bg: '#F5F5F5', emoji: '⚠️' };
          const desc = PROBLEM_DESCRIPTIONS[p.label] || p.label;
          const confPct = Math.round((p.confidence || 0.75) * 100);
          return `
            <div class="ob-problem-card">
              <div class="ob-pc-icon" style="background:${col.bg};">${col.emoji}</div>
              <div class="ob-pc-info">
                <h4>${p.label}</h4>
                <p>${desc}</p>
                <div class="ob-pc-confidence">
                  <div class="ob-pc-bar">
                    <div class="ob-pc-bar-fill" style="width:${confPct}%; background:${col.hex};"></div>
                  </div>
                  <span style="font-size:10px; color:var(--text-tertiary); font-weight:600;">${confPct}%</span>
                </div>
              </div>
            </div>
          `;
        }).join('');

        // Skin type icons matching Settings.js
        const skinTypeIconsResult = {
          'Normal':    { icon: `<svg viewBox="0 0 32 32" width="40" height="40" fill="none"><circle cx="16" cy="16" r="13" fill="#D1FAE5" stroke="#10B981" stroke-width="1.5"/><circle cx="16" cy="16" r="8" fill="#6EE7B7" opacity="0.5"/><path d="M11 20c1.5 2 3.5 3 5 3s3.5-1 5-3" stroke="#059669" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="14" r="1.5" fill="#059669"/><circle cx="20" cy="14" r="1.5" fill="#059669"/><path d="M22 8l1.5-2M10 8L8.5 6M16 6V4" stroke="#10B981" stroke-width="1.2" stroke-linecap="round"/></svg>`, color: '#10B981', bg: '#D1FAE5' },
          'Berminyak': { icon: `<svg viewBox="0 0 32 32" width="40" height="40" fill="none"><circle cx="16" cy="16" r="13" fill="#DBEAFE" stroke="#3B82F6" stroke-width="1.5"/><circle cx="16" cy="16" r="8" fill="#93C5FD" opacity="0.4"/><path d="M11 20c1.5 1.5 3.5 2 5 2s3.5-.5 5-2" stroke="#2563EB" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="14" r="1.5" fill="#2563EB"/><circle cx="20" cy="14" r="1.5" fill="#2563EB"/><circle cx="8" cy="18" r="2" fill="#93C5FD" opacity="0.6"/><circle cx="24" cy="18" r="2" fill="#93C5FD" opacity="0.6"/><circle cx="16" cy="10" r="1.5" fill="#93C5FD" opacity="0.7"/></svg>`, color: '#3B82F6', bg: '#DBEAFE' },
          'Kombinasi': { icon: `<svg viewBox="0 0 32 32" width="40" height="40" fill="none"><circle cx="16" cy="16" r="13" fill="#EDE9FE" stroke="#8B5CF6" stroke-width="1.5"/><path d="M16 3a13 13 0 010 26" fill="#C4B5FD" opacity="0.5"/><path d="M11 20c1.5 1.5 3.5 2 5 2s3.5-.5 5-2" stroke="#7C3AED" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="14" r="1.5" fill="#7C3AED"/><circle cx="20" cy="14" r="1.5" fill="#7C3AED"/><line x1="16" y1="5" x2="16" y2="27" stroke="#8B5CF6" stroke-width="0.8" stroke-dasharray="2 2"/></svg>`, color: '#8B5CF6', bg: '#EDE9FE' },
          'Kering':    { icon: `<svg viewBox="0 0 32 32" width="40" height="40" fill="none"><circle cx="16" cy="16" r="13" fill="#FEF3C7" stroke="#D97706" stroke-width="1.5"/><circle cx="16" cy="16" r="8" fill="#FDE68A" opacity="0.4"/><path d="M12 19c1 1 2.5 1.5 4 1.5s3-.5 4-1.5" stroke="#B45309" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="14" r="1.5" fill="#B45309"/><circle cx="20" cy="14" r="1.5" fill="#B45309"/><path d="M10 22l2-1M22 22l-2-1" stroke="#D97706" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/></svg>`, color: '#D97706', bg: '#FEF3C7' },
        };
        const skinTypeResult = skinTypeIconsResult[res.jenis_kulit] || skinTypeIconsResult['Normal'];

        // Problem icons + colors
        const problemIconsResult = {
          'Jerawat':   { color: '#EF4444', bg: '#FEE2E2', icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none"><circle cx="12" cy="12" r="10" fill="#FEE2E2" stroke="#EF4444" stroke-width="1.5"/><circle cx="9" cy="10" r="2" fill="#FCA5A5" stroke="#EF4444" stroke-width="1"/><circle cx="15" cy="9" r="1.5" fill="#FCA5A5" stroke="#EF4444" stroke-width="1"/><circle cx="13" cy="15" r="2.5" fill="#FCA5A5" stroke="#EF4444" stroke-width="1"/><circle cx="9" cy="10" r="0.8" fill="#EF4444"/><circle cx="13" cy="15" r="1" fill="#EF4444"/></svg>` },
          'PIE':       { color: '#EC4899', bg: '#FCE7F3', icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none"><circle cx="12" cy="12" r="10" fill="#FCE7F3" stroke="#EC4899" stroke-width="1.5"/><circle cx="9" cy="10" r="2.5" fill="none" stroke="#EC4899" stroke-width="1.2" stroke-dasharray="1.5 1.5"/><circle cx="15" cy="14" r="2" fill="none" stroke="#EC4899" stroke-width="1.2" stroke-dasharray="1.5 1.5"/><circle cx="12" cy="8" r="1.5" fill="#F9A8D4" opacity="0.6"/></svg>` },
          'PIH':       { color: '#F97316', bg: '#FFF7ED', icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none"><circle cx="12" cy="12" r="10" fill="#FFF7ED" stroke="#F97316" stroke-width="1.5"/><ellipse cx="9" cy="10" rx="2.5" ry="2" fill="#FDBA74" stroke="#F97316" stroke-width="1"/><ellipse cx="15" cy="14" rx="2" ry="1.5" fill="#FDBA74" stroke="#F97316" stroke-width="1"/></svg>` },
          'Kemerahan': { color: '#22C55E', bg: '#DCFCE7', icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none"><circle cx="12" cy="12" r="10" fill="#DCFCE7" stroke="#22C55E" stroke-width="1.5"/><circle cx="8" cy="13" r="2.5" fill="#FCA5A5" opacity="0.5"/><circle cx="16" cy="13" r="2.5" fill="#FCA5A5" opacity="0.5"/></svg>` },
          'Kusam':     { color: '#9CA3AF', bg: '#F3F4F6', icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none"><circle cx="12" cy="12" r="10" fill="#F3F4F6" stroke="#9CA3AF" stroke-width="1.5"/><path d="M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0z" fill="#D1D5DB" stroke="#9CA3AF" stroke-width="1"/><path d="M12 6v1M12 17v1M6 12h1M17 12h1" stroke="#9CA3AF" stroke-width="1" stroke-linecap="round" opacity="0.5"/></svg>` },
          'Aging':     { color: '#8B5CF6', bg: '#F3E8FF', icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none"><circle cx="12" cy="12" r="10" fill="#F3E8FF" stroke="#8B5CF6" stroke-width="1.5"/><path d="M8 9c0-1 1-2 2-2M14 9c0-1 1-2 2-2" stroke="#8B5CF6" stroke-width="1" stroke-linecap="round"/><path d="M9 14c.8 1.2 1.8 1.8 3 1.8s2.2-.6 3-1.8" stroke="#8B5CF6" stroke-width="1" stroke-linecap="round"/></svg>` },
        };

        // Deduplicate permasalahan: keep highest confidence per unique label
        const uniqueProblems = [];
        if (res.permasalahan && res.permasalahan.length > 0) {
          const seen = {};
          res.permasalahan.forEach(p => {
            const conf = p.confidence || 0;
            if (!seen[p.label] || conf > (seen[p.label].confidence || 0)) {
              seen[p.label] = p;
            }
          });
          Object.values(seen).forEach(p => uniqueProblems.push(p));
        }

        const problemsChipsHTML = uniqueProblems.length === 0 ? `
          <div style="display:flex; align-items:center; gap:10px; padding: 14px 16px; background: #F0FDF4; border-radius: 12px; border: 1.5px solid #86EFAC;">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#16A34A" stroke-width="2" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <div>
              <div style="color: #16A34A; font-weight: 700; font-size:13px;">Kondisi kulit sangat sehat!</div>
              <div style="color: #4ADE80; font-size: 11px; margin-top:2px;">Tidak ada anomali atau noda parah terdeteksi.</div>
            </div>
          </div>
        ` : `<div style="display:flex; flex-wrap:wrap; gap:8px;">${uniqueProblems.map(p => {
          const pdata = problemIconsResult[p.label] || { color: '#888', bg: '#F5F5F5', icon: '' };
          return `<div style="display:flex; align-items:center; gap:6px; padding:8px 14px; border-radius:100px; background:${pdata.bg}; border:1.5px solid ${pdata.color}30;">
            ${pdata.icon}
            <span style="font-size:12px; font-weight:700; color:${pdata.color};">${p.label}</span>
          </div>`;
        }).join('')}</div>`;

        // Encode bounding box data for canvas rendering
        const boxDataEncoded = encodeURIComponent(JSON.stringify(res.permasalahan || []));

        html = `
          <div class="ob-title-wrap" style="text-align: center; margin-bottom: 14px;">
            <h1 class="ob-quiz-title" style="font-size: var(--font-2xl); font-weight: 800; margin-bottom: 6px;">Hasil Analisis Kulit AI</h1>
            <p class="ob-quiz-subtitle" style="font-size: var(--font-sm); color: var(--text-secondary); margin: 0;">Berikut kondisi kulit wajah Anda yang terdeteksi.</p>
          </div>

          <!-- AI Medical Disclaimer Alert Banner -->
          <div style="margin: 0 auto 16px auto; max-width: 340px; padding: 10px 14px; background: #FFFDF5; border: 1.5px solid #FEF3C7; border-radius: 12px; display: flex; gap: 10px; align-items: flex-start; text-align: left;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 1px;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <div>
              <div style="font-weight: 700; font-size: 11px; color: #B45309; margin-bottom: 2px;">⚠️ Catatan Penting</div>
              <div style="font-size: 10.5px; color: #B45309; line-height: 1.4;">
                Hasil analisis AI B-Glow bersifat referensi pendukung dan tidak 100% akurat. Harap jangan dijadikan acuan medis mutlak.
              </div>
            </div>
          </div>

          <!-- Foto + Jenis Kulit -->
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${capturedImage || '/dummy-face.png'}" style="width: 90px; height: 90px; border-radius: 50%; object-fit: cover; border: 3px solid ${skinTypeResult.color}40; box-shadow: 0 4px 16px ${skinTypeResult.color}30; margin: 0 auto 14px; display: block;" />
            <div style="display:inline-flex; align-items:center; gap:10px; background:${skinTypeResult.bg}; border:1.5px solid ${skinTypeResult.color}40; border-radius:16px; padding:10px 20px; margin-bottom:10px;">
              ${skinTypeResult.icon}
              <div style="text-align:left;">
                <div style="font-size:18px; font-weight:800; color:var(--text-primary);">${res.jenis_kulit}</div>
                <div style="font-size:11px; color:${skinTypeResult.color}; font-weight:600;">Jenis Kulit</div>
              </div>
            </div>
            <p style="font-size: var(--font-xs); color: var(--text-secondary); line-height: 1.4; max-width: 300px; margin: 0 auto; padding: 0 var(--space-sm);">${res.jenis_kulit_desc}</p>
          </div>

          <!-- Masalah Kulit -->
          <div style="margin-bottom: 12px;">
            <div style="font-size: var(--font-sm); font-weight: 700; color: var(--text-primary); margin-bottom: 10px;">Masalah Kulit Terdeteksi</div>
            ${problemsChipsHTML}
          </div>

          <!-- Bounding Box Viewer Toggle -->
          ${(res.permasalahan && res.permasalahan.length > 0) ? `
          <div style="margin-bottom: 8px;">
            <button id="ob-toggle-scan-detail" style="
              width: 100%; padding: 10px 14px; border-radius: 12px;
              background: var(--bg-soft); border: 1.5px solid var(--border);
              color: var(--text-secondary); font-size: 12px; font-weight: 600;
              cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
              transition: all 0.2s ease;
            ">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              Lihat Hasil Scan Detail
              <svg id="ob-toggle-chevron" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="transition:transform 0.2s;"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div id="ob-scan-detail-panel" style="display:none; margin-top:10px; border-radius:12px; overflow:hidden; border:1.5px solid var(--border);">
              <canvas id="ob-bbox-canvas" style="width:100%; display:block;"></canvas>
            </div>
          </div>
          ` : ''}
        `;
        break;

      case 10:
        // Checklist Profile Ready Page
        html = `
          <div class="ob-success-container">
            <div class="ob-success-ring"></div>
            <h1 class="ob-quiz-title" style="margin-top: 10px;">Setup Profil Selesai!</h1>
            <p class="ob-quiz-subtitle">Semua data kuis & hasil scan berhasil dikompilasi.</p>
          </div>
          <div class="ob-checklist-loading">
            <div class="ob-checklist-item step-1">
              <div class="ob-check-icon">✓</div>
              <div class="ob-checklist-text">Sinkronisasi hasil jenis kulit ke akun Anda...</div>
            </div>
            <div class="ob-checklist-item step-2">
              <div class="ob-check-icon">✓</div>
              <div class="ob-checklist-text">Mempersonalisasikan rekomendasi produk...</div>
            </div>
            <div class="ob-checklist-item step-3">
              <div class="ob-check-icon">✓</div>
              <div class="ob-checklist-text">Menyusun pengingat routine skincare cerdas...</div>
            </div>
          </div>
        `;
        break;

      case 11: {
        // Manual Skin Type + Skin Problems selection
        isNextDisabled = !answers.selectedManualSkinType;

        // SVG Icons with colors for each skin type (matching Settings.js)
        const skinTypeIcons = {
          'Normal':    { color: '#10B981', icon: `<svg viewBox="0 0 32 32" width="22" height="22" fill="none"><circle cx="16" cy="16" r="13" fill="#D1FAE5" stroke="#10B981" stroke-width="1.5"/><circle cx="16" cy="16" r="8" fill="#6EE7B7" opacity="0.5"/><path d="M11 20c1.5 2 3.5 3 5 3s3.5-1 5-3" stroke="#059669" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="14" r="1.5" fill="#059669"/><circle cx="20" cy="14" r="1.5" fill="#059669"/><path d="M22 8l1.5-2M10 8L8.5 6M16 6V4" stroke="#10B981" stroke-width="1.2" stroke-linecap="round"/></svg>` },
          'Berminyak': { color: '#3B82F6', icon: `<svg viewBox="0 0 32 32" width="22" height="22" fill="none"><circle cx="16" cy="16" r="13" fill="#DBEAFE" stroke="#3B82F6" stroke-width="1.5"/><circle cx="16" cy="16" r="8" fill="#93C5FD" opacity="0.4"/><path d="M11 20c1.5 1.5 3.5 2 5 2s3.5-.5 5-2" stroke="#2563EB" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="14" r="1.5" fill="#2563EB"/><circle cx="20" cy="14" r="1.5" fill="#2563EB"/><circle cx="8" cy="18" r="2" fill="#93C5FD" opacity="0.6"/><circle cx="24" cy="18" r="2" fill="#93C5FD" opacity="0.6"/><circle cx="16" cy="10" r="1.5" fill="#93C5FD" opacity="0.7"/></svg>` },
          'Kombinasi': { color: '#8B5CF6', icon: `<svg viewBox="0 0 32 32" width="22" height="22" fill="none"><circle cx="16" cy="16" r="13" fill="#EDE9FE" stroke="#8B5CF6" stroke-width="1.5"/><path d="M16 3a13 13 0 010 26" fill="#C4B5FD" opacity="0.5"/><path d="M16 20c1.5 1.5 3.5 2 5 2s3.5-.5 5-2" stroke="#7C3AED" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="14" r="1.5" fill="#7C3AED"/><circle cx="20" cy="14" r="1.5" fill="#7C3AED"/><line x1="16" y1="5" x2="16" y2="27" stroke="#8B5CF6" stroke-width="0.8" stroke-dasharray="2 2"/></svg>` },
          'Kering':    { color: '#D97706', icon: `<svg viewBox="0 0 32 32" width="22" height="22" fill="none"><circle cx="16" cy="16" r="13" fill="#FEF3C7" stroke="#D97706" stroke-width="1.5"/><circle cx="16" cy="16" r="8" fill="#FDE68A" opacity="0.4"/><path d="M12 19c1 1 2.5 1.5 4 1.5s3-.5 4-1.5" stroke="#B45309" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="14" r="1.5" fill="#B45309"/><circle cx="20" cy="14" r="1.5" fill="#B45309"/><path d="M10 22l2-1M22 22l-2-1" stroke="#D97706" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/></svg>` }
        };

        // SVG Icons with colors for each skin problem (matching Settings.js)
        const skinProblemIcons = {
          'Berjerawat': { color: '#EF4444', icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><circle cx="12" cy="12" r="10" fill="#FEE2E2" stroke="#EF4444" stroke-width="1.5"/><circle cx="9" cy="10" r="2" fill="#FCA5A5" stroke="#EF4444" stroke-width="1"/><circle cx="15" cy="9" r="1.5" fill="#FCA5A5" stroke="#EF4444" stroke-width="1"/><circle cx="13" cy="15" r="2.5" fill="#FCA5A5" stroke="#EF4444" stroke-width="1"/><circle cx="9" cy="10" r="0.8" fill="#EF4444"/><circle cx="15" cy="9" r="0.6" fill="#EF4444"/><circle cx="13" cy="15" r="1" fill="#EF4444"/></svg>` },
          'PIE':        { color: '#EC4899', icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><circle cx="12" cy="12" r="10" fill="#FCE7F3" stroke="#EC4899" stroke-width="1.5"/><circle cx="9" cy="10" r="2.5" fill="none" stroke="#EC4899" stroke-width="1.2" stroke-dasharray="1.5 1.5"/><circle cx="15" cy="14" r="2" fill="none" stroke="#EC4899" stroke-width="1.2" stroke-dasharray="1.5 1.5"/><circle cx="12" cy="8" r="1.5" fill="#F9A8D4" opacity="0.6"/><circle cx="8" cy="15" r="1.8" fill="#F9A8D4" opacity="0.5"/></svg>` },
          'PIH':        { color: '#F97316', icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><circle cx="12" cy="12" r="10" fill="#FFF7ED" stroke="#F97316" stroke-width="1.5"/><ellipse cx="9" cy="10" rx="2.5" ry="2" fill="#FDBA74" stroke="#F97316" stroke-width="1"/><ellipse cx="15" cy="14" rx="2" ry="1.5" fill="#FDBA74" stroke="#F97316" stroke-width="1"/><ellipse cx="13" cy="8" rx="1.5" ry="1" fill="#FB923C" opacity="0.6"/></svg>` },
          'Aging':      { color: '#8B5CF6', icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><circle cx="12" cy="12" r="10" fill="#F3E8FF" stroke="#8B5CF6" stroke-width="1.5"/><path d="M8 9c0-1 1-2 2-2M14 9c0-1 1-2 2-2" stroke="#8B5CF6" stroke-width="1" stroke-linecap="round"/><path d="M9 14c.8 1.2 1.8 1.8 3 1.8s2.2-.6 3-1.8" stroke="#8B5CF6" stroke-width="1" stroke-linecap="round"/><path d="M7 11l3 .5M17 11l-3 .5" stroke="#A78BFA" stroke-width="0.8" stroke-linecap="round"/></svg>` },
          'Kusam':      { color: '#9CA3AF', icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><circle cx="12" cy="12" r="10" fill="#F3F4F6" stroke="#9CA3AF" stroke-width="1.5"/><path d="M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0z" fill="#D1D5DB" stroke="#9CA3AF" stroke-width="1"/><path d="M12 6v1M12 17v1M6 12h1M17 12h1" stroke="#9CA3AF" stroke-width="1" stroke-linecap="round" opacity="0.5"/></svg>` },
          'Kemerahan':  { color: '#22C55E', icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><circle cx="12" cy="12" r="10" fill="#DCFCE7" stroke="#22C55E" stroke-width="1.5"/><path d="M7 12c0-1 1.5-3 5-3s5 2 5 3" fill="#BBF7D0" stroke="#16A34A" stroke-width="1"/><circle cx="8" cy="13" r="2.5" fill="#FCA5A5" opacity="0.5"/><circle cx="16" cy="13" r="2.5" fill="#FCA5A5" opacity="0.5"/><path d="M10 16c.5.5 1.2.8 2 .8s1.5-.3 2-.8" stroke="#16A34A" stroke-width="1" stroke-linecap="round"/></svg>` }
        };

        const manualSkinTypes = [
          { id: 'Normal',    label: 'Normal' },
          { id: 'Berminyak', label: 'Berminyak' },
          { id: 'Kombinasi', label: 'Kombinasi' },
          { id: 'Kering',    label: 'Kering' }
        ];
        const skinProblems = [
          { id: 'Berjerawat', label: 'Berjerawat' },
          { id: 'PIE',        label: 'PIE' },
          { id: 'PIH',        label: 'PIH' },
          { id: 'Aging',      label: 'Aging' },
          { id: 'Kusam',      label: 'Kusam' },
          { id: 'Kemerahan',  label: 'Kemerahan' }
        ];

        html = `
          <div class="ob-title-wrap" style="text-align: center; margin-bottom: 24px;">
            <h1 class="ob-quiz-title" style="font-size: var(--font-xl); font-weight: 800; color: var(--text-primary); margin-bottom: 8px;">Pilih Profil Kulit Anda</h1>
            <p class="ob-quiz-subtitle" style="font-size: var(--font-xs); color: var(--text-secondary); line-height: 1.5; margin: 0;">Tentukan jenis dan masalah kulit yang Anda alami.</p>
          </div>

          <div class="ob-profile-section" style="margin-bottom: 24px;">
            <div class="ob-profile-section-title">Jenis Kulit</div>
            <div class="ob-skin-pill-grid">
              ${manualSkinTypes.map(st => {
                const isActive = answers.selectedManualSkinType === st.id;
                const { icon, color } = skinTypeIcons[st.id];
                return `<div class="ob-skin-pill ob-skin-type-pill ${isActive ? 'active' : ''}" data-skin-type="${st.id}" data-color="${color}">
                  <span class="ob-pill-icon">${icon}</span>
                  <span class="ob-pill-label">${st.label}</span>
                </div>`;
              }).join('')}
            </div>
          </div>

          <div class="ob-profile-section">
            <div class="ob-profile-section-title">Masalah Kulit <span style="font-weight:400; color:var(--text-tertiary);">(Bisa lebih dari 1)</span></div>
            <div class="ob-skin-pill-grid">
              ${skinProblems.map(p => {
                const isActive = answers.selectedSkinProblems && answers.selectedSkinProblems.includes(p.id);
                const { icon, color } = skinProblemIcons[p.id];
                return `<div class="ob-skin-pill ob-skin-problem-pill ${isActive ? 'active' : ''}" data-problem="${p.id}" data-color="${color}">
                  <span class="ob-pill-icon">${icon}</span>
                  <span class="ob-pill-label">${p.label}</span>
                </div>`;
              }).join('')}
            </div>
          </div>
        `;
        break;
      }


    }

    contentWrap.innerHTML = html;

    // Bottom Navigation Buttons
    const footer = document.createElement('div');
    footer.className = 'ob-footer';

    if (currentStep === 10) {
      footer.innerHTML = `<button class="ob-btn-primary" id="ob-submit-profile">Mulai Sekarang</button>`;
    } else if (currentStep === 11) {
      footer.innerHTML = `<button class="ob-btn-primary" id="ob-next" ${isNextDisabled ? 'disabled' : ''}>Selesai</button>`;
    } else if (currentStep === 6) {
      // Camera handles capture via internal camera button, no primary button needed
      footer.innerHTML = ``;
    } else if (currentStep === 7 || currentStep === 8) {
      // Auto transitions, no next button
      footer.innerHTML = ``;
    } else if (currentStep === 9) {
      // Scan results: show Lanjut + secondary "Pilih Sendiri" option
      footer.innerHTML = `
        <button class="ob-btn-primary" id="ob-next">Lanjut</button>
        <button id="ob-pick-manual" style="
          width: 100%; margin-top: 8px; padding: 12px;
          background: transparent; border: 1.5px solid var(--border);
          border-radius: var(--radius-lg); color: var(--text-secondary);
          font-size: var(--font-sm); font-weight: 600; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.2s ease;
        ">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Tidak yakin? Pilih sendiri
        </button>
      `;
    } else {
      footer.innerHTML = `<button class="ob-btn-primary" id="ob-next" ${isNextDisabled ? 'disabled' : ''}>Lanjut</button>`;
    }

    viewport.appendChild(contentWrap);
    viewport.appendChild(footer);

    attachStepEvents();
  }

  // Bind Events for Active Step
  function attachStepEvents() {
    // Step 9: "Pilih Sendiri" button → go to manual selection (step 11)
    const pickManualBtn = page.querySelector('#ob-pick-manual');
    if (pickManualBtn) {
      pickManualBtn.addEventListener('click', () => {
        // Reset any previous manual selection so user starts fresh
        answers.selectedManualSkinType = '';
        answers.selectedSkinProblems = [];
        goToStep(11);
      });
      pickManualBtn.addEventListener('mouseenter', () => {
        pickManualBtn.style.background = 'var(--bg-soft)';
        pickManualBtn.style.color = 'var(--text-primary)';
      });
      pickManualBtn.addEventListener('mouseleave', () => {
        pickManualBtn.style.background = 'transparent';
        pickManualBtn.style.color = 'var(--text-secondary)';
      });
    }

    // Step 9: Bounding box canvas toggle
    const toggleBtn = page.querySelector('#ob-toggle-scan-detail');
    const detailPanel = page.querySelector('#ob-scan-detail-panel');
    const bboxCanvas = page.querySelector('#ob-bbox-canvas');
    const chevron = page.querySelector('#ob-toggle-chevron');
    let canvasRendered = false;

    if (toggleBtn && detailPanel && bboxCanvas && capturedImage && answers.scanResult) {
      toggleBtn.addEventListener('click', () => {
        const isOpen = detailPanel.style.display !== 'none';
        detailPanel.style.display = isOpen ? 'none' : 'block';
        if (chevron) chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';

        if (!isOpen && !canvasRendered) {
          canvasRendered = true;
          const problemColors = {
            'Jerawat': '#EF4444', 'PIE': '#EC4899', 'PIH': '#F97316',
            'Kemerahan': '#22C55E', 'Kusam': '#9CA3AF', 'Aging': '#8B5CF6'
          };
          const img = new Image();
          img.onload = () => {
            bboxCanvas.width = img.naturalWidth;
            bboxCanvas.height = img.naturalHeight;
            const ctx = bboxCanvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const problems = answers.scanResult.permasalahan || [];
            problems.forEach(p => {
              if (!p.box_2d || p.box_2d.length < 4) return;
              const [ymin, xmin, ymax, xmax] = p.box_2d;
              const x = (xmin / 1000) * img.naturalWidth;
              const y = (ymin / 1000) * img.naturalHeight;
              const w = ((xmax - xmin) / 1000) * img.naturalWidth;
              const h = ((ymax - ymin) / 1000) * img.naturalHeight;
              const color = problemColors[p.label] || '#FFFFFF';

              // Draw rectangle
              ctx.strokeStyle = color;
              ctx.lineWidth = Math.max(2, img.naturalWidth * 0.004);
              ctx.strokeRect(x, y, w, h);

              // Draw fill overlay
              ctx.fillStyle = color + '25';
              ctx.fillRect(x, y, w, h);

              // Draw label background
              const fontSize = Math.max(12, img.naturalWidth * 0.032);
              ctx.font = `bold ${fontSize}px sans-serif`;
              const textW = ctx.measureText(p.label).width;
              const padX = 6, padY = 4;
              const lblH = fontSize + padY * 2;
              const lblY = y > lblH + 2 ? y - lblH - 2 : y + 2;
              ctx.fillStyle = color;
              ctx.fillRect(x, lblY, textW + padX * 2, lblH);

              // Draw label text
              ctx.fillStyle = '#FFFFFF';
              ctx.fillText(p.label, x + padX, lblY + fontSize + padY * 0.5);
            });
          };
          img.src = capturedImage;
        }
      });
    }

    // Standard option click (single select) — Step 3 only
    const options = page.querySelectorAll('.ob-option-card');
    options.forEach(card => {
      card.addEventListener('click', () => {
        const val = card.dataset.val;
        
        // Update selection styling in-place (no reload/flash)
        options.forEach(o => o.classList.remove('active'));
        card.classList.add('active');
        
        if (currentStep === 3) answers.struggle = val;
        
        // Enable next button dynamically
        const nextBtn = page.querySelector('#ob-next');
        if (nextBtn) {
          nextBtn.disabled = false;
        }
      });
    });

    // Step 11: Skin Type pill single-select
    const skinTypePills = page.querySelectorAll('[data-skin-type]');
    skinTypePills.forEach(pill => {
      pill.addEventListener('click', () => {
        const val = pill.dataset.skinType;
        answers.selectedManualSkinType = val;
        skinTypePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const nextBtn = page.querySelector('#ob-next');
        if (nextBtn) nextBtn.disabled = false;
      });
    });

    // Step 11: Skin Problems pill multi-select
    const problemPills = page.querySelectorAll('[data-problem]');
    problemPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const val = pill.dataset.problem;
        if (!answers.selectedSkinProblems) answers.selectedSkinProblems = [];
        const idx = answers.selectedSkinProblems.indexOf(val);
        if (idx === -1) {
          answers.selectedSkinProblems.push(val);
          pill.classList.add('active');
        } else {
          answers.selectedSkinProblems.splice(idx, 1);
          pill.classList.remove('active');
        }
      });
    });

    // Single-select goals option click (Step 4)
    const goalOptions = page.querySelectorAll('.ob-goal-option-card');
    goalOptions.forEach(card => {
      card.addEventListener('click', () => {
        const val = card.dataset.val;
        goalOptions.forEach(o => {
          o.classList.remove('active');
          const indicator = o.querySelector('.ob-checkbox-indicator');
          if (indicator) {
            indicator.style.borderColor = 'var(--border)';
            indicator.style.backgroundColor = 'transparent';
            indicator.innerHTML = '';
          }
        });
        card.classList.add('active');
        const indicator = card.querySelector('.ob-checkbox-indicator');
        if (indicator) {
          indicator.style.borderColor = 'var(--primary)';
          indicator.style.backgroundColor = 'var(--primary)';
          indicator.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
        }
        answers.goals = [val];
        const nextBtn = page.querySelector('#ob-next');
        if (nextBtn) nextBtn.disabled = false;
      });
    });

    // Choice cards for knowsSkinType (Step 5)
    const choiceCards = page.querySelectorAll('.ob-choice-card');
    choiceCards.forEach(card => {
      card.addEventListener('click', () => {
        const val = card.dataset.val;
        answers.knowsSkinType = val;
        
        choiceCards.forEach(c => {
          c.classList.remove('active');
          c.style.borderColor = 'var(--border)';
          c.style.backgroundColor = 'var(--bg-card)';
          const label = c.querySelector('span');
          if (label) label.style.color = 'var(--text-primary)';
          const svg = c.querySelector('svg');
          if (svg) svg.remove();
        });
        
        card.classList.add('active');
        card.style.borderColor = 'var(--primary)';
        card.style.backgroundColor = 'var(--bg-soft)';
        const label = card.querySelector('span');
        if (label) label.style.color = 'var(--primary)';
        
        if (!card.querySelector('svg')) {
          const svgMarkup = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          svgMarkup.setAttribute("width", "18");
          svgMarkup.setAttribute("height", "18");
          svgMarkup.setAttribute("viewBox", "0 0 24 24");
          svgMarkup.setAttribute("fill", "none");
          svgMarkup.setAttribute("stroke", "var(--primary)");
          svgMarkup.setAttribute("stroke-width", "3");
          svgMarkup.setAttribute("stroke-linecap", "round");
          svgMarkup.setAttribute("stroke-linejoin", "round");
          svgMarkup.innerHTML = '<polyline points="20 6 9 17 4 12"/>';
          card.appendChild(svgMarkup);
        }
        
        const nextBtn = page.querySelector('#ob-next');
        if (nextBtn) nextBtn.disabled = false;
      });
    });

    // Step Next button click
    const nextBtn = page.querySelector('#ob-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (currentStep === 5) {
          if (answers.knowsSkinType === 'yes') {
            goToStep(11);
          } else {
            goToStep(6);
          }
        } else if (currentStep === 11) {
          const selectedType = answers.selectedManualSkinType || 'Normal';
          const selectedProblems = (answers.selectedSkinProblems || []).map(p => ({ label: p, confidence: 0.85 }));
          answers.scanResult = {
            jenis_kulit: selectedType,
            jenis_kulit_desc: getSkinTypeDescription(selectedType),
            acne_level: selectedProblems.some(p => p.label === 'Berjerawat') ? 'Jerawat' : 'Bersih',
            oil_level: selectedType === 'Berminyak' ? 'Tinggi' : selectedType === 'Kering' ? 'Rendah' : 'Normal',
            pore_condition: 'Minimal',
            skin_score: 90,
            permasalahan: selectedProblems
          };
          goToStep(10);
        } else {
          goToStep(currentStep + 1);
        }
      });
    }

    // Step 6: CAMERA & GALLERY BINDINGS
    if (currentStep === 6) {
      const video = page.querySelector('#ob-webcam');
      const placeholder = page.querySelector('#ob-placeholder');
      const fileInput = page.querySelector('#ob-camera-file');
      const galleryInput = page.querySelector('#ob-gallery-file');
      const uploadBtn = page.querySelector('#ob-upload-btn');
      const captureBtn = page.querySelector('#ob-capture-btn');

      const setupFallbackMode = (msg) => {
        if (placeholder) {
          const span = placeholder.querySelector('span');
          if (span) span.textContent = msg;
          placeholder.addEventListener('click', () => fileInput.click());
        }
      };

      // Open camera feed
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
        })
        .then(s => {
          cameraStream = s;
          if (video) {
            video.srcObject = s;
            video.style.display = 'block';
            if (placeholder) placeholder.style.display = 'none';
          }
        })
        .catch(err => {
          console.warn('Onboarding camera failure:', err);
          setupFallbackMode('Kamera diblokir. Ketuk di sini untuk mengambil foto.');
        });
      } else {
        setupFallbackMode('Ketuk di sini untuk membuka kamera.');
      }

      // Handle fallback camera select file
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          capturedImage = event.target.result;
          stopCamera();
          goToStep(7);
        };
        reader.readAsDataURL(file);
      });

      // Handle upload from gallery button click
      uploadBtn.addEventListener('click', () => {
        stopCamera();
        galleryInput.click();
      });

      galleryInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          capturedImage = event.target.result;
          goToStep(7);
        };
        reader.readAsDataURL(file);
      });

      // Capture Button Snap click
      captureBtn.addEventListener('click', () => {
        if (video && cameraStream) {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            capturedImage = canvas.toDataURL('image/jpeg', 0.85);
          } catch (e) {
            console.error('Snap onboarding image failure:', e);
          }
          stopCamera();
          goToStep(7);
        } else {
          fileInput.click();
        }
      });
    }

    // Step 7: SCANNING ANIMATION PROCESS
    if (currentStep === 7) {
      const pointsWrap = page.querySelector('#ob-det-points');
      const positions = [
        { top: '30%', left: '38%' },
        { top: '38%', left: '55%' },
        { top: '50%', left: '42%' },
        { top: '42%', left: '62%' },
        { top: '58%', left: '48%' },
        { top: '35%', left: '48%' },
        { top: '55%', left: '55%' },
      ];

      // Sequential dots trigger
      positions.forEach((pos, idx) => {
        setTimeout(() => {
          const dot = document.createElement('div');
          dot.className = 'ob-det-point';
          dot.style.top = pos.top;
          dot.style.left = pos.left;
          dot.style.animationDelay = `${idx * 80}ms`;
          if (pointsWrap) pointsWrap.appendChild(dot);
        }, 300 + idx * 250);
      });

      // Move to Step 8 (Loader processing) after 2.8 seconds
      setTimeout(() => {
        goToStep(8);
      }, 2800);
    }

    // Step 8: LOADER LOOPS AND API CALL
    if (currentStep === 8) {
      // Step checklist timeline trigger
      const steps = ['ob-step-1', 'ob-step-2', 'ob-step-3', 'ob-step-4'];
      steps.forEach((id, idx) => {
        setTimeout(() => {
          if (idx > 0) {
            const prev = page.querySelector(`#${steps[idx - 1]}`);
            if (prev) { prev.classList.remove('active'); prev.classList.add('done'); }
          }
          const curr = page.querySelector(`#${id}`);
          if (curr) curr.classList.add('active');
        }, idx * 800);
      });

      // API trigger
      callGeminiAPI();
    }

    // Step 10: SUBMIT PROFILE ONBOARD DATA TO DB
    if (currentStep === 10) {
      const submitBtn = page.querySelector('#ob-submit-profile');
      if (submitBtn) {
        submitBtn.addEventListener('click', finalizeProfileSubmit);
      }

      // Auto submit profile on timer after 3.8s
      setTimeout(() => {
        const btn = page.querySelector('#ob-submit-profile');
        if (btn) btn.click();
      }, 3800);
    }
  }

  // AI Scan Call to Gemini backend
  async function callGeminiAPI() {
    try {
      const reqBody = { image: capturedImage || '' };
      if (userId && userId !== 'guest') {
        reqBody.user_id = parseInt(userId, 10);
      }

      const res = await fetch(SKIN_SCAN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userId && userId !== 'guest' ? getAuthHeaders() : {})
        },
        body: JSON.stringify(reqBody)
      });

      if (!res.ok) {
        throw new Error(`API returned HTTP ${res.status}`);
      }

      const result = await res.json();
      answers.scanResult = {
        jenis_kulit: result.jenis_kulit,
        jenis_kulit_desc: getSkinTypeDescription(result.jenis_kulit),
        acne_level: result.acne_level,
        oil_level: result.oil_level,
        pore_condition: result.pore_condition,
        skin_score: result.skin_score,
        permasalahan: result.permasalahan || []
      };

      // Add to local history too
      saveToLocalScanHistory(result);

      // Advance to result page (Step 9) after the checklist step animation completes (approx 3.2s)
      setTimeout(() => {
        goToStep(9);
      }, 3300);

    } catch (e) {
      console.warn("AI Onboarding scan server issue, triggering high fidelity mock generator:", e);
      triggerMockScanFallback();
    }
  }

  function triggerMockScanFallback() {
    // Generate an beautiful mock result based on user goals
    let type = 'Kombinasi'; // Standard default
    if (answers.goals.includes('oiliness')) type = 'Berminyak';
    else if (answers.goals.includes('hydration')) type = 'Kering';
    else if (answers.goals.includes('sensitivity')) type = 'Sensitif';

    let score = 78;
    if (answers.struggle === 'reactions') score -= 8;

    let acne = 'Bersih';
    if (answers.goals.includes('breakouts')) acne = 'Jerawat';

    let oil = 'Normal';
    if (type === 'Berminyak') oil = 'Tinggi';
    else if (type === 'Kombinasi') oil = 'Sedang — T-Zone';
    else if (type === 'Kering') oil = 'Rendah';

    let pore = 'Baik — Minimal';
    if (type === 'Berminyak' || type === 'Kombinasi') pore = 'Cukup';

    const problems = [];
    if (answers.struggle === 'reactions' || answers.goals.includes('sensitivity')) {
      problems.push({ label: 'Kemerahan', confidence: 0.85 });
    }
    if (answers.goals.includes('breakouts')) {
      problems.push({ label: 'Jerawat', confidence: 0.78 });
      problems.push({ label: 'PIE', confidence: 0.70 });
    }
    if (answers.goals.includes('darkspots')) {
      problems.push({ label: 'Hiperpigmentasi', confidence: 0.82 });
    }

    const mockResult = {
      jenis_kulit: type,
      jenis_kulit_desc: getSkinTypeDescription(type),
      acne_level: acne,
      oil_level: oil,
      pore_condition: pore,
      skin_score: score,
      permasalahan: problems
    };

    answers.scanResult = mockResult;

    // Save to local scan history as well
    saveToLocalScanHistory({
      jenis_kulit: type,
      acne_level: acne,
      oil_level: oil,
      pore_condition: pore,
      skin_score: score,
      permasalahan: problems
    });

    // Advance to results page
    setTimeout(() => {
      goToStep(9);
    }, 3300);
  }

  function getSkinTypeDescription(type) {
    return {
      'Berminyak': 'Kulit berminyak memproduksi sebum berlebih di seluruh wajah. Rentan jerawat namun lebih lambat mengalami tanda penuaan.',
      'Kombinasi': 'Kulit kombinasi berminyak di area T-zone (dahi, hidung, dagu) namun normal atau kering di area pipi.',
      'Kering': 'Kulit kering kekurangan produksi minyak alami, mudah terasa kencang, kasar, dan rentan terhadap iritasi.',
      'Normal': 'Kulit seimbang dengan produksi sebum yang ideal. Tidak terlalu berminyak atau kering.',
      'Sensitif': 'Kulit sensitif sangat rentan terhadap iritasi, kemerahan, rasa gatal, atau sensasi terbakar.'
    }[type] || `Tipe kulit terdeteksi: ${type}`;
  }

  function saveToLocalScanHistory(res) {
    try {
      const historyKey = 'bglow_scan_history_' + userId;
      let historyList = JSON.parse(localStorage.getItem(historyKey) || '[]');
      historyList.unshift({
        id: 'scan_onboard_' + Date.now(),
        date: new Date().toLocaleDateString('id-ID', {
          day: 'numeric', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        }),
        skin_type: res.jenis_kulit,
        acne_level: res.acne_level,
        oil_level: res.oil_level,
        pore_condition: res.pore_condition,
        skin_score: res.skin_score,
        image: capturedImage || '/dummy-face.png',
      });
      localStorage.setItem(historyKey, JSON.stringify(historyList));
    } catch (e) {
      console.error('Failed to append onboard scan results to history:', e);
    }
  }

  // Push user choices to DB and redirect home
  async function finalizeProfileSubmit() {
    const res = answers.scanResult;
    if (!res) {
      window.location.hash = '#/';
      return;
    }

    // Save profile locally
    localStorage.setItem('bglow_has_scanned_' + userId, '1');
    localStorage.setItem('bglow_skin_type_' + userId, res.jenis_kulit);
    localStorage.setItem('bglow_acne_level_' + userId, res.acne_level);
    localStorage.setItem('bglow_oil_level_' + userId, res.oil_level);
    localStorage.setItem('bglow_pore_condition_' + userId, res.pore_condition);
    localStorage.setItem('bglow_skin_score_' + userId, String(res.skin_score));
    localStorage.setItem('bglow_skin_problems_' + userId, JSON.stringify(res.permasalahan || []));

    // Submit sync to server
    if (userId && userId !== 'guest') {
      try {
        await syncUserData({
          skin_type: res.jenis_kulit,
          acne_level: res.acne_level,
          oil_level: res.oil_level,
          pore_condition: res.pore_condition,
          skin_score: res.skin_score
        });
      } catch (err) {
        console.error("Gagal sinkronisasi data onboarding ke database:", err);
      }
    }

    // Setup complete — mark onboarded, then go to home (user already authenticated)
    localStorage.setItem('bglow_onboarded', '1');
    window.location.hash = '#/';
  }

  // Header Nav Click handlers
  backBtn.addEventListener('click', () => {
    if (currentStep === 11 || currentStep === 6) {
      goToStep(5);
    } else {
      goToStep(currentStep - 1);
    }
  });

  skipBtn.addEventListener('click', () => {
    // If skip question blocks, jump directly to AI scan
    goToStep(6);
  });

  // Start at step 0
  goToStep(0);

  return page;
}
