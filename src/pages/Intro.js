export function renderIntro() {
  const page = document.createElement('div');
  page.className = 'intro-page';

  let currentSlide = 0;
  const totalSlides = 3;

  const slides = [
    {
      // Slide 1: Use face-chip-logo.png image
      iconType: 'image',
      iconSrc: '/face-chip-logo.png',
      title: 'Analisis Kulit AI',
      desc: 'Temukan kebutuhan kulit Anda yang sebenarnya dengan pemindai AI canggih kami. Dapatkan wawasan instan dan akurat tentang jenis serta masalah kulit Anda.',
      circleBg: '#EFF6FF',
      ringColor: 'rgba(59, 130, 246, 0.15)',
      accent: '#3B82F6',
      accentLight: '#93C5FD',
      accentDot: '#BFDBFE',
      borderAccent: '#3B82F6'
    },
    {
      // Slide 2: Shield SVG
      iconType: 'svg',
      iconSvg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" class="intro-svg-icon">
        <path d="M40 12 L62 23 L62 42 C62 56 40 68 40 68 C40 68 18 56 18 42 L18 23 Z" stroke="#10B981" stroke-width="3" fill="none" stroke-linejoin="round"/>
      </svg>`,
      title: 'Rekomendasi Cerdas',
      desc: 'Dapatkan rekomendasi produk skincare yang dipersonalisasi sesuai profil kulit unik Anda. Hanya produk yang terverifikasi dan aman.',
      circleBg: '#ECFDF5',
      ringColor: 'rgba(16, 185, 129, 0.15)',
      accent: '#10B981',
      accentLight: '#6EE7B7',
      accentDot: '#A7F3D0',
      borderAccent: '#10B981'
    },
    {
      // Slide 3: Star SVG
      iconType: 'svg',
      iconSvg: `<svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" class="intro-svg-icon">
        <polygon points="40,14 48,34 70,34 53,46 60,66 40,54 20,66 27,46 10,34 32,34" stroke="#8B5CF6" stroke-width="3" fill="none" stroke-linejoin="round"/>
      </svg>`,
      title: 'Pantau Perjalanan Kulitmu',
      desc: 'Pantau perjalanan kulit Anda dengan rutinitas harian, grafik perkembangan, dan pengingat cerdas. Saksikan transformasi kulit Anda.',
      circleBg: '#F5F3FF',
      ringColor: 'rgba(139, 92, 246, 0.15)',
      accent: '#8B5CF6',
      accentLight: '#C4B5FD',
      accentDot: '#DDD6FE',
      borderAccent: '#8B5CF6'
    }
  ];

  function renderSlide() {
    const slide = slides[currentSlide];
    const isLast = currentSlide === totalSlides - 1;

    // Build icon content
    let iconContent;
    if (slide.iconType === 'image') {
      iconContent = `<img src="${slide.iconSrc}" alt="${slide.title}" class="intro-icon-img" />`;
    } else {
      iconContent = slide.iconSvg;
    }

    page.innerHTML = `
      <div class="intro-slide">
        <div class="intro-main-content">
          <div class="intro-visual">
            <!-- Floating accent dots -->
            <div class="intro-float-dot dot-1" style="background: ${slide.accent};"></div>
            <div class="intro-float-dot dot-2" style="background: ${slide.accentLight};"></div>
            <div class="intro-float-dot dot-3" style="background: ${slide.accentDot};"></div>
            <div class="intro-float-dot dot-4" style="background: ${slide.accentLight};"></div>

            <!-- Outer ring -->
            <div class="intro-ring" style="border-color: ${slide.ringColor};">
              <!-- Inner circle with icon -->
              <div class="intro-icon-circle" style="background: ${slide.circleBg};">
                ${iconContent}
              </div>
            </div>
          </div>

          <div class="intro-text-wrap">
            <h1 class="intro-title">${slide.title}</h1>
            <p class="intro-desc">${slide.desc}</p>
          </div>
        </div>

        <div class="intro-bottom">
          <div class="intro-dots">
            ${Array.from({ length: totalSlides }, (_, i) => `
              <div class="intro-dot ${i === currentSlide ? 'active' : ''}" ${i === currentSlide ? `style="background:${slide.accent}; width: 22px;"` : ''}></div>
            `).join('')}
          </div>

          <div class="intro-actions">
            <button class="intro-btn-primary" id="intro-next" style="background: linear-gradient(135deg, ${slide.accent}, ${slide.accent}cc);">
              ${isLast ? 'Mulai Sekarang' : 'Lanjut'}
            </button>
            <button class="intro-btn-skip" id="intro-skip">Lewati</button>
          </div>
        </div>
      </div>
    `;

    // Events
    page.querySelector('#intro-next').addEventListener('click', () => {
      if (isLast) {
        goToLogin();
      } else {
        currentSlide++;
        renderSlide();
      }
    });

    page.querySelector('#intro-skip').addEventListener('click', goToLogin);
  }

  function goToLogin() {
    localStorage.setItem('bglow_intro_seen', '1');
    window.location.hash = '#/login';
  }

  renderSlide();
  return page;
}
