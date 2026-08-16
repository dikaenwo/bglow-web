import { icons } from '../components/BottomNav.js';
import { showCustomAlert } from '../utils/helpers.js';
import { API_BASE_URL } from '../config.js';
import { clearUserData } from '../utils/store.js';

export function renderRegister() {
  const page = document.createElement('div');
  page.className = 'auth-page';

  let currentStep = 'form'; // 'form' | 'otp'
  let pendingUser = { name: '', email: '', password: '' };
  let receivedOtp = '';

  function render() {
    if (currentStep === 'form') {
      page.innerHTML = `
        <div class="auth-brand">
          <div class="auth-logo">
            <img src="/BGLOW-Polos.png" alt="B-Glow Logo" />
          </div>
          <h1>B-Glow</h1>
          <p>Mulai perjalanan glow-up Anda</p>
        </div>

        <div class="auth-card">
          <h2>Buat Akun</h2>

          <div class="auth-field">
            <label>Nama Lengkap</label>
            <input class="auth-input" type="text" id="reg-name" placeholder="Nama lengkap Anda" value="${pendingUser.name || ''}" />
            <div class="auth-error-text" id="name-error" style="display: none;"></div>
          </div>

          <div class="auth-field">
            <label>Email</label>
            <input class="auth-input" type="email" id="reg-email" placeholder="email@contoh.com" value="${pendingUser.email || ''}" />
            <div class="auth-error-text" id="email-error" style="display: none;"></div>
          </div>

          <div class="auth-field">
            <label>Kata Sandi</label>
            <div class="password-wrap">
              <input class="auth-input" type="password" id="reg-password" placeholder="Min. 8 karakter" value="${pendingUser.password || ''}" />
            </div>
            <div class="auth-error-text" id="password-error" style="display: none;"></div>
          </div>

          <div class="auth-field">
            <label>Konfirmasi Kata Sandi</label>
            <div class="password-wrap">
              <input class="auth-input" type="password" id="reg-confirm-password" placeholder="Ulangi kata sandi Anda" value="${pendingUser.password || ''}" />
            </div>
            <div class="auth-error-text" id="confirm-password-error" style="display: none;"></div>
          </div>

          <div class="auth-field" style="margin-top: 14px; margin-bottom: 8px; display: flex; align-items: flex-start; gap: 10px;">
            <input type="checkbox" id="reg-terms-check" style="margin-top: 3px; cursor: pointer; width: 18px; height: 18px; accent-color: var(--primary);" />
            <label for="reg-terms-check" style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.45; cursor: pointer; text-align: left;">
              Saya menyetujui <a id="link-terms" style="color: var(--primary); font-weight: 600; text-decoration: underline; cursor: pointer;">Syarat & Ketentuan</a> serta <a id="link-privacy" style="color: var(--primary); font-weight: 600; text-decoration: underline; cursor: pointer;">Kebijakan Privasi</a> B-Glow.
            </label>
          </div>
          <div class="auth-error-text" id="terms-error" style="display: none; margin-bottom: 12px;"></div>

          <button class="auth-submit" id="register-btn">Kirim OTP & Buat Akun</button>
        </div>

        <div class="auth-footer">
          Sudah punya akun? <a id="go-login">Masuk</a>
        </div>
      `;

      bindFormListeners();
    } else if (currentStep === 'otp') {
      page.innerHTML = `
        <div class="auth-brand">
          <div class="auth-logo">
            <img src="/BGLOW-Polos.png" alt="B-Glow Logo" />
          </div>
          <h1>B-Glow</h1>
          <p>Verifikasi Pendaftaran</p>
        </div>

        <div class="auth-card">
          <h2>Masukkan Kode OTP</h2>
          <p style="color: var(--text-secondary); font-size: var(--font-sm); margin-bottom: var(--space-md); line-height: 1.5;">
            Masukkan 4 digit kode OTP yang telah dikirim ke email <strong>${pendingUser.email}</strong> untuk menyelesaikan pendaftaran akun Anda.
          </p>

          <div class="auth-field">
            <label>Kode OTP</label>
            <input class="auth-input" type="text" id="reg-otp-code" maxlength="4" placeholder="••••" style="text-align: center; letter-spacing: 8px; font-weight: bold; font-size: var(--font-xl);" />
            <div class="auth-error-text" id="reg-otp-error" style="display: none;"></div>
          </div>

          <button class="auth-submit" id="verify-reg-otp-btn">Verifikasi & Lanjutkan</button>
          
          <div style="text-align: center; margin-top: 14px;">
            <a id="resend-reg-otp" style="font-size: var(--font-sm); color: var(--primary); font-weight: 600; cursor: pointer; text-decoration: none;">Kirim Ulang OTP</a>
          </div>
        </div>

        <div class="auth-footer">
          Kembali ke <a id="go-reg-back">Form Registrasi</a>
        </div>
      `;

      bindOtpListeners();
    }
  }

  const showFieldError = (inputEl, errorEl, msg) => {
    if (inputEl && inputEl.classList) inputEl.classList.add('error');
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
    }
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

  function bindFormListeners() {
    const nameInput = page.querySelector('#reg-name');
    const emailInput = page.querySelector('#reg-email');
    const passwordInput = page.querySelector('#reg-password');
    const confirmPasswordInput = page.querySelector('#reg-confirm-password');
    
    const nameError = page.querySelector('#name-error');
    const emailError = page.querySelector('#email-error');
    const passwordError = page.querySelector('#password-error');
    const confirmPasswordError = page.querySelector('#confirm-password-error');
    const termsCheck = page.querySelector('#reg-terms-check');
    const termsError = page.querySelector('#terms-error');

    passwordInput?.addEventListener('input', () => {
      const val = passwordInput ? passwordInput.value : '';
      if (val.length > 0 && val.length < 8) {
        showFieldError(passwordInput, passwordError, 'minimal 8 karakter');
      } else if (passwordInput && passwordError) {
        passwordInput.classList.remove('error');
        passwordError.textContent = '';
        passwordError.style.display = 'none';
      }
      if (confirmPasswordInput && confirmPasswordInput.value.length > 0 && confirmPasswordInput.value !== val) {
        showFieldError(confirmPasswordInput, confirmPasswordError, 'Konfirmasi kata sandi tidak cocok!');
      } else if (confirmPasswordInput && confirmPasswordInput.value === val) {
        confirmPasswordInput.classList.remove('error');
        confirmPasswordError.textContent = '';
        confirmPasswordError.style.display = 'none';
      }
    });

    confirmPasswordInput?.addEventListener('input', () => {
      if (confirmPasswordInput && passwordInput && confirmPasswordInput.value !== passwordInput.value) {
        showFieldError(confirmPasswordInput, confirmPasswordError, 'Konfirmasi kata sandi tidak cocok!');
      } else if (confirmPasswordInput && passwordInput) {
        confirmPasswordInput.classList.remove('error');
        confirmPasswordError.textContent = '';
        confirmPasswordError.style.display = 'none';
      }
    });

    page.querySelector('#register-btn')?.addEventListener('click', async () => {
      clearErrors();

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value : '';
      const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';

      let hasError = false;
      if (!name) {
        showFieldError(nameInput, nameError, 'Nama lengkap tidak boleh kosong!');
        hasError = true;
      }
      if (!email) {
        showFieldError(emailInput, emailError, 'Email tidak boleh kosong!');
        hasError = true;
      }
      if (!password) {
        showFieldError(passwordInput, passwordError, 'Kata sandi tidak boleh kosong!');
        hasError = true;
      } else if (password.length < 8) {
        showFieldError(passwordInput, passwordError, 'minimal 8 karakter');
        hasError = true;
      }

      if (!confirmPassword) {
        showFieldError(confirmPasswordInput, confirmPasswordError, 'Konfirmasi kata sandi tidak boleh kosong!');
        hasError = true;
      } else if (confirmPassword !== password) {
        showFieldError(confirmPasswordInput, confirmPasswordError, 'Konfirmasi kata sandi tidak cocok!');
        hasError = true;
      }

      if (termsCheck && !termsCheck.checked) {
        showFieldError(termsCheck, termsError, 'Anda harus menyetujui Syarat & Ketentuan dan Kebijakan Privasi untuk mendaftar.');
        hasError = true;
      }

      if (hasError) return;

      const btn = page.querySelector('#register-btn');
      try {
        if (btn) {
          btn.textContent = 'Mengirim OTP...';
          btn.disabled = true;
        }

        const response = await fetch(`${API_BASE_URL}/api/register-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          pendingUser = { name, email, password };
          receivedOtp = data.otp || '';
          currentStep = 'otp';
          showCustomAlert(`Kode OTP pendaftaran telah dikirim ke ${email}.\n\nSilakan periksa kotak masuk (inbox) atau folder spam email Anda.`, "OTP Terkirim", () => {
            render();
          });
        } else {
          if (btn) {
            btn.textContent = 'Kirim OTP & Buat Akun';
            btn.disabled = false;
          }
          const detail = data.detail || '';
          if (detail.includes('Email sudah terdaftar')) {
            showFieldError(emailInput, emailError, 'Email sudah terdaftar');
          } else {
            showCustomAlert(detail || "Gagal mengirim OTP pendaftaran", "Pendaftaran Gagal");
          }
        }
      } catch (error) {
        console.error('Error:', error);
        if (btn) {
          btn.textContent = 'Kirim OTP & Buat Akun';
          btn.disabled = false;
        }
        showCustomAlert("Gagal terhubung ke server. Pastikan backend Python menyala.", "Koneksi Bermasalah");
      }
    });

    page.querySelector('#link-terms')?.addEventListener('click', (e) => {
      e.preventDefault();
      openTermsModal();
    });

    page.querySelector('#link-privacy')?.addEventListener('click', (e) => {
      e.preventDefault();
      openPrivacyPolicyModal();
    });

    page.querySelector('#go-login')?.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = '#/login';
    });
  }

  function bindOtpListeners() {
    const otpInput = page.querySelector('#reg-otp-code');
    const otpError = page.querySelector('#reg-otp-error');
    const verifyBtn = page.querySelector('#verify-reg-otp-btn');
    const resendBtn = page.querySelector('#resend-reg-otp');
    const goRegBack = page.querySelector('#go-reg-back');

    goRegBack?.addEventListener('click', (e) => {
      e.preventDefault();
      currentStep = 'form';
      render();
    });

    resendBtn?.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        if (resendBtn) resendBtn.textContent = 'Mengirim...';
        const response = await fetch(`${API_BASE_URL}/api/register-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: pendingUser.name, email: pendingUser.email })
        });
        const data = await response.json();
        if (response.ok) {
          receivedOtp = data.otp || '';
          showCustomAlert("Kode OTP baru telah berhasil dikirim ke email Anda.", "OTP Ulang Terkirim");
        } else {
          showCustomAlert(data.detail || "Gagal mengirim ulang OTP.", "Gagal");
        }
      } catch (err) {
        showCustomAlert("Gagal terhubung ke server.", "Koneksi Bermasalah");
      } finally {
        if (resendBtn) resendBtn.textContent = 'Kirim Ulang OTP';
      }
    });

    verifyBtn?.addEventListener('click', async () => {
      const enteredOtp = otpInput ? otpInput.value.trim() : '';
      if (otpInput) otpInput.classList.remove('error');
      if (otpError) otpError.style.display = 'none';

      if (!enteredOtp) {
        showFieldError(otpInput, otpError, 'Kode OTP tidak boleh kosong!');
        return;
      }

      if (enteredOtp !== receivedOtp) {
        showFieldError(otpInput, otpError, 'Kode OTP tidak cocok atau telah kadaluarsa!');
        return;
      }

      // OTP Valid -> Insert account into database now!
      try {
        verifyBtn.textContent = 'Membuat Akun...';
        verifyBtn.disabled = true;

        const response = await fetch(`${API_BASE_URL}/api/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: pendingUser.name,
            email: pendingUser.email,
            password: pendingUser.password
          })
        });

        const data = await response.json();

        if (response.ok) {
          // Auto login to start onboarding
          const loginRes = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: pendingUser.email, password: pendingUser.password })
          });
          const loginData = await loginRes.json();

          if (loginRes.ok) {
            clearUserData();
            localStorage.setItem('bglow_auth', '1');
            if (loginData.token) {
              localStorage.setItem('bglow_token', loginData.token);
            }
            localStorage.setItem('bglow_user', JSON.stringify({ 
              id: loginData.user.id,
              name: loginData.user.name, 
              email: loginData.user.email 
            }));
            localStorage.removeItem('bglow_onboarded'); // Forces onboarding flow

            showCustomAlert("Pendaftaran berhasil dan terverifikasi! Memulai pertanyaan onboarding Anda...", "Verifikasi Berhasil", () => {
              window.location.hash = '#/onboarding';
            });
          } else {
            showCustomAlert("Pendaftaran berhasil! Silakan masuk.", "Verifikasi Berhasil", () => {
              window.location.hash = '#/login';
            });
          }
        } else {
          verifyBtn.textContent = 'Verifikasi & Lanjutkan';
          verifyBtn.disabled = false;
          showCustomAlert(data.detail || "Gagal menyimpan akun ke database.", "Pendaftaran Gagal");
        }
      } catch (err) {
        console.error(err);
        verifyBtn.textContent = 'Verifikasi & Lanjutkan';
        verifyBtn.disabled = false;
        showCustomAlert("Gagal terhubung ke server saat mendaftarkan akun.", "Koneksi Bermasalah");
      }
    });
  }

  // Modals for Terms & Privacy Policy
  const openTermsModal = () => {
    const overlay = document.createElement('div');
    overlay.className = 'diary-modal-overlay';
    overlay.innerHTML = `
      <div class="diary-modal" style="border-radius: var(--radius-lg); max-width: 420px; padding: 24px; text-align: left; background: white; max-height: 80vh; overflow-y: auto;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px;">
          <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(99, 102, 241, 0.12); color: var(--primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <h3 style="font-weight: 700; color: var(--text-primary); font-size: 1.15rem; margin: 0;">Syarat & Ketentuan B-Glow</h3>
        </div>
        <div style="font-size: 0.83rem; color: var(--text-secondary); line-height: 1.55; display: flex; flex-direction: column; gap: 10px;">
          <p>Selamat datang di <strong>B-Glow</strong>. Dengan mendaftar atau menggunakan aplikasi B-Glow, Anda menyetujui ketentuan berikut:</p>
          <p><strong>1. Layanan Perawatan Kulit:</strong> B-Glow memberikan rekomendasi skincare dan analisis AI untuk membantu perawatan kulit Anda. Analisis ini bersifat referensi pendukung dan bukan pengganti diagnosis medis resmi dokter spesialis kulit.</p>
          <p><strong>2. Keamanan Akun:</strong> Anda bertanggung jawab atas kerahasiaan kata sandi akun Anda. Anda berhak menghapus akun Anda kapan saja melalui menu Pengaturan.</p>
          <p><strong>3. Privasi & Data:</strong> Data Anda dilindungi dengan enkripsi aman dan tidak dijual kepada pihak ketiga.</p>
        </div>
        <button class="btn btn-primary" id="btn-close-terms" style="width: 100%; margin-top: 18px; padding: 11px; font-weight: 600; border-radius: var(--radius-md); border: none; background: var(--primary); color: white; cursor: pointer;">Saya Mengerti</button>
      </div>
    `;
    overlay.querySelector('#btn-close-terms').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
  };

  const openPrivacyPolicyModal = () => {
    const overlay = document.createElement('div');
    overlay.className = 'diary-modal-overlay';
    overlay.innerHTML = `
      <div class="diary-modal" style="border-radius: var(--radius-lg); max-width: 420px; padding: 24px; text-align: left; background: white; max-height: 80vh; overflow-y: auto;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px;">
          <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(99, 102, 241, 0.12); color: var(--primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h3 style="font-weight: 700; color: var(--text-primary); font-size: 1.15rem; margin: 0;">Kebijakan Privasi B-Glow</h3>
        </div>
        <div style="font-size: 0.83rem; color: var(--text-secondary); line-height: 1.55; display: flex; flex-direction: column; gap: 10px;">
          <p>Privasi Anda adalah prioritas utama kami. Kebijakan Privasi ini menguraikan bagaimana B-Glow mengelola informasi Anda:</p>
          <p><strong>1. Informasi yang Dikumpulkan:</strong> Nama, email, foto profil, riwayat analisis kulit, serta data lokasi GPS (digunakan secara lokal hanya untuk cuaca & UV Index).</p>
          <p><strong>2. Keamanan Enkripsi:</strong> Seluruh lalu lintas data dienkripsi dengan standar HTTPS (TLS/SSL). Kami tidak menjual atau membagikan data pribadi Anda.</p>
          <p><strong>3. Hak Penghapusan Akun:</strong> Sesuai kebijakan Google Play, Anda memiliki hak penuh untuk menghapus akun dan seluruh data pribadi secara permanen melalui Pengaturan Aplikasi.</p>
        </div>
        <button class="btn btn-primary" id="btn-close-privacy" style="width: 100%; margin-top: 18px; padding: 11px; font-weight: 600; border-radius: var(--radius-md); border: none; background: var(--primary); color: white; cursor: pointer;">Tutup</button>
      </div>
    `;
    overlay.querySelector('#btn-close-privacy').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
  };

  render();
  return page;
}
