import { icons } from '../components/BottomNav.js';
import { clearUserData } from '../utils/store.js';
import { showCustomAlert } from '../utils/helpers.js';
import { API_BASE_URL, GOOGLE_CLIENT_ID, APPLE_CLIENT_ID } from '../config.js';

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}


export function renderLogin() {
  const page = document.createElement('div');
  page.className = 'auth-page';

  // Load Google and Apple SDKs in the background
  loadScript('https://accounts.google.com/gsi/client').catch(err => console.error("Gagal memuat Google Sign-In SDK:", err));
  loadScript('https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js').catch(err => console.error("Gagal memuat Apple Sign-In SDK:", err));

  page.innerHTML = `
    <div class="auth-brand">
      <div class="auth-logo">
        <img src="/BGLOW-Polos.png" alt="B-Glow Logo" />
      </div>
      <h1>B-Glow</h1>
      <p>Asisten Skincare AI Anda</p>
    </div>

    <div class="auth-card">
      <h2>Selamat Datang Kembali</h2>

      <div class="auth-field">
        <label>Email</label>
        <input class="auth-input" type="email" id="login-email" placeholder="email@contoh.com" />
        <div class="auth-error-text" id="email-error" style="display: none;"></div>
      </div>

      <div class="auth-field">
        <label>Kata Sandi</label>
        <div class="password-wrap">
          <input class="auth-input" type="password" id="login-password" placeholder="••••••••" />
        </div>
        <div class="auth-error-text" id="password-error" style="display: none;"></div>
      </div>

      <button class="auth-submit" id="login-btn">Masuk</button>

      <div style="text-align: right; margin-top: 12px;">
        <a id="go-forgot-password" style="font-size: var(--font-sm); color: var(--primary); font-weight: 600; cursor: pointer; text-decoration: none;">Lupa Kata Sandi?</a>
      </div>
    </div>

    <div class="auth-footer">
      Belum punya akun? <a id="go-register">Daftar</a>
    </div>
  `;

  // Helper functions for displaying input field errors
  const showFieldError = (inputEl, errorEl, msg) => {
    inputEl.classList.add('error');
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
  };

  const clearErrors = () => {
    const inputs = page.querySelectorAll('.auth-input');
    const errors = page.querySelectorAll('.auth-error-text');
    inputs.forEach(el => el.classList.remove('error'));
    errors.forEach(el => {
      el.textContent = '';
      el.style.display = 'none';
    });
  };

  // ─── Manual Form Login ───
  page.querySelector('#login-btn').addEventListener('click', async () => {
    const emailInput = page.querySelector('#login-email');
    const passwordInput = page.querySelector('#login-password');
    const emailError = page.querySelector('#email-error');
    const passwordError = page.querySelector('#password-error');

    clearErrors();

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    let hasError = false;
    if (!email) {
      showFieldError(emailInput, emailError, 'Email tidak boleh kosong!');
      hasError = true;
    }
    if (!password) {
      showFieldError(passwordInput, passwordError, 'Kata sandi tidak boleh kosong!');
      hasError = true;
    }

    if (hasError) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        clearUserData();
        localStorage.setItem('bglow_auth', '1');
        // Simpan JWT Bearer token untuk request API yang terproteksi
        if (data.token) {
          localStorage.setItem('bglow_token', data.token);
        }
        localStorage.setItem('bglow_user', JSON.stringify({ 
          id: data.user.id,
          name: data.user.name, 
          email: data.user.email 
        }));
        if (data.user.profile_photo) {
          localStorage.setItem('bglow_profile_photo_' + data.user.id, data.user.profile_photo);
        }
        localStorage.setItem('bglow_onboarded', '1'); // Bypasses onboarding force for direct login
        if (data.user.skin_type) {
          localStorage.setItem('bglow_has_scanned_' + data.user.id, '1');
          localStorage.setItem('bglow_skin_type_' + data.user.id, data.user.skin_type);
          localStorage.setItem('bglow_acne_level_' + data.user.id, data.user.acne_level);
          localStorage.setItem('bglow_oil_level_' + data.user.id, data.user.oil_level);
          localStorage.setItem('bglow_pore_condition_' + data.user.id, data.user.pore_condition);
          localStorage.setItem('bglow_skin_score_' + data.user.id, data.user.skin_score);
        }
        if (data.user.sunscreen_interval) {
          localStorage.setItem('bglow_sunscreen_interval_' + data.user.id, data.user.sunscreen_interval);
        }
        if (data.user.favorites) {
          localStorage.setItem('bglow_favorites_' + data.user.id, data.user.favorites);
        }
        if (data.user.diary_entries) {
          localStorage.setItem('bglow_diary_entries_' + data.user.id, data.user.diary_entries);
        }
        if (data.user.routine) {
          localStorage.setItem('bglow_routine_' + data.user.id, data.user.routine);
        }
        if (data.user.special_schedule) {
          localStorage.setItem('bglow_special_schedule_' + data.user.id, data.user.special_schedule);
        }
        if (data.user.streak) {
          localStorage.setItem('bglow_streak_' + data.user.id, data.user.streak);
        }
        if (data.user.routine_progress) {
          localStorage.setItem('bglow_routine_progress_' + data.user.id, data.user.routine_progress);
        }
        window.location.hash = '#/';
      } else {
        const detail = data.detail || '';
        if (detail.includes('Email tidak ditemukan')) {
          showFieldError(emailInput, emailError, 'Email tidak ditemukan');
        } else if (detail.includes('Kata sandi salah')) {
          showFieldError(passwordInput, passwordError, 'Password salah');
        } else {
          showCustomAlert(detail || "Login gagal", "Login Gagal");
        }
      }
    } catch (error) {
      console.error('Error:', error);
      showCustomAlert("Gagal terhubung ke server. Pastikan backend Python menyala.", "Koneksi Bermasalah");
    }
  });

  page.querySelector('#go-register').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.hash = '#/register';
  });

  page.querySelector('#go-forgot-password').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.hash = '#/forgot-password';
  });

  return page;
}
