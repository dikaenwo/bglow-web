import { showCustomAlert } from '../utils/helpers.js';
import { API_BASE_URL } from '../config.js';

export function renderForgotPassword() {
  const page = document.createElement('div');
  page.className = 'auth-page';

  let currentPhase = 'email'; // email -> otp -> reset
  let userEmail = '';
  let mockOtp = '1234';

  function render() {
    if (currentPhase === 'email') {
      page.innerHTML = `
        <div class="auth-brand">
          <div class="auth-logo">
            <img src="/BGLOW-Polos.png" alt="B-Glow Logo" />
          </div>
          <h1>B-Glow</h1>
          <p>Pemulihan Kata Sandi</p>
        </div>

        <div class="auth-card">
          <h2>Lupa Kata Sandi</h2>
          <p style="color: var(--text-secondary); font-size: var(--font-sm); margin-bottom: var(--space-md); line-height: 1.5;">
            Masukkan alamat email Anda untuk menerima kode OTP pemulihan kata sandi.
          </p>

          <div class="auth-field">
            <label>Alamat Email</label>
            <input class="auth-input" type="email" id="forgot-email" placeholder="email@contoh.com" />
            <div class="auth-error-text" id="forgot-email-error" style="display: none;"></div>
          </div>

          <button class="auth-submit" id="send-otp-btn">Kirim OTP</button>
        </div>

        <div class="auth-footer">
          Kembali ke halaman <a id="go-login-back">Masuk</a>
        </div>
      `;

      // Event Listeners for Email Phase
      const emailInput = page.querySelector('#forgot-email');
      const emailError = page.querySelector('#forgot-email-error');
      const sendOtpBtn = page.querySelector('#send-otp-btn');
      const goLoginBack = page.querySelector('#go-login-back');

      goLoginBack.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = '#/login';
      });

      sendOtpBtn.addEventListener('click', async () => {
        const email = emailInput.value.trim();
        emailInput.classList.remove('error');
        emailError.style.display = 'none';

        if (!email) {
          emailInput.classList.add('error');
          emailError.textContent = 'Email tidak boleh kosong!';
          emailError.style.display = 'block';
          return;
        }

        try {
          sendOtpBtn.textContent = 'Mengirim...';
          sendOtpBtn.disabled = true;

          const response = await fetch(`${API_BASE_URL}/api/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });

          const data = await response.json();

          if (response.ok) {
            userEmail = email;
            mockOtp = data.otp || '1234';
            currentPhase = 'otp';
            showCustomAlert(`Kode OTP pemulihan telah berhasil dikirim ke ${userEmail}.\n\nSilakan periksa kotak masuk (inbox) atau folder spam email Anda.`, "OTP Terkirim", () => {
              render();
            });
          } else {
            emailInput.classList.add('error');
            emailError.textContent = data.detail || 'Email tidak ditemukan';
            emailError.style.display = 'block';
            sendOtpBtn.textContent = 'Kirim OTP';
            sendOtpBtn.disabled = false;
          }
        } catch (error) {
          console.error(error);
          showCustomAlert("Gagal menghubungi server. Pastikan backend Python menyala.", "Koneksi Gagal");
          sendOtpBtn.textContent = 'Kirim OTP';
          sendOtpBtn.disabled = false;
        }
      });

    } else if (currentPhase === 'otp') {
      page.innerHTML = `
        <div class="auth-brand">
          <div class="auth-logo">
            <img src="/BGLOW-Polos.png" alt="B-Glow Logo" />
          </div>
          <h1>B-Glow</h1>
          <p>Verifikasi OTP</p>
        </div>

        <div class="auth-card">
          <h2>Masukkan Kode OTP</h2>
          <p style="color: var(--text-secondary); font-size: var(--font-sm); margin-bottom: var(--space-md); line-height: 1.5;">
            Masukkan 4 digit kode OTP yang telah dikirim ke <strong>${userEmail}</strong>.
          </p>

          <div class="auth-field">
            <label>Kode OTP</label>
            <input class="auth-input" type="text" id="otp-code" maxlength="4" placeholder="••••" style="text-align: center; letter-spacing: 8px; font-weight: bold; font-size: var(--font-xl);" />
            <div class="auth-error-text" id="otp-error" style="display: none;"></div>
          </div>

          <button class="auth-submit" id="verify-otp-btn">Verifikasi OTP</button>
        </div>

        <div class="auth-footer">
          Kembali ke halaman <a id="go-login-back">Masuk</a>
        </div>
      `;

      const otpInput = page.querySelector('#otp-code');
      const otpError = page.querySelector('#otp-error');
      const verifyOtpBtn = page.querySelector('#verify-otp-btn');
      const goLoginBack = page.querySelector('#go-login-back');

      goLoginBack.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = '#/login';
      });

      verifyOtpBtn.addEventListener('click', () => {
        const otp = otpInput.value.trim();
        otpInput.classList.remove('error');
        otpError.style.display = 'none';

        if (!otp) {
          otpInput.classList.add('error');
          otpError.textContent = 'Kode OTP tidak boleh kosong!';
          otpError.style.display = 'block';
          return;
        }

        if (otp === mockOtp) {
          currentPhase = 'reset';
          render();
        } else {
          otpInput.classList.add('error');
          otpError.textContent = 'Kode OTP salah atau telah kadaluarsa. Silakan periksa kembali email Anda.';
          otpError.style.display = 'block';
        }
      });

    } else if (currentPhase === 'reset') {
      page.innerHTML = `
        <div class="auth-brand">
          <div class="auth-logo">
            <img src="/BGLOW-Polos.png" alt="B-Glow Logo" />
          </div>
          <h1>B-Glow</h1>
          <p>Buat Sandi Baru</p>
        </div>

        <div class="auth-card">
          <h2>Atur Ulang Sandi</h2>
          <p style="color: var(--text-secondary); font-size: var(--font-sm); margin-bottom: var(--space-md); line-height: 1.5;">
            Masukkan kata sandi baru Anda untuk email <strong>${userEmail}</strong>.
          </p>

          <div class="auth-field">
            <label>Kata Sandi Baru</label>
            <input class="auth-input" type="password" id="new-password" placeholder="Min. 8 karakter" />
            <div class="auth-error-text" id="new-pass-error" style="display: none;"></div>
          </div>

          <div class="auth-field">
            <label>Konfirmasi Kata Sandi Baru</label>
            <input class="auth-input" type="password" id="confirm-new-password" placeholder="Ulangi kata sandi" />
            <div class="auth-error-text" id="confirm-pass-error" style="display: none;"></div>
          </div>

          <button class="auth-submit" id="reset-password-btn">Perbarui Kata Sandi</button>
        </div>

        <div class="auth-footer">
          Kembali ke halaman <a id="go-login-back">Masuk</a>
        </div>
      `;

      const newPassInput = page.querySelector('#new-password');
      const confirmPassInput = page.querySelector('#confirm-new-password');
      const newPassError = page.querySelector('#new-pass-error');
      const confirmPassError = page.querySelector('#confirm-pass-error');
      const resetPassBtn = page.querySelector('#reset-password-btn');
      const goLoginBack = page.querySelector('#go-login-back');

      goLoginBack.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = '#/login';
      });

      resetPassBtn.addEventListener('click', async () => {
        newPassInput.classList.remove('error');
        confirmPassInput.classList.remove('error');
        newPassError.style.display = 'none';
        confirmPassError.style.display = 'none';

        const newPass = newPassInput.value;
        const confirmPass = confirmPassInput.value;

        let hasError = false;
        if (!newPass || newPass.length < 8) {
          newPassInput.classList.add('error');
          newPassError.textContent = 'Kata sandi minimal terdiri dari 8 karakter!';
          newPassError.style.display = 'block';
          hasError = true;
        }

        if (newPass !== confirmPass) {
          confirmPassInput.classList.add('error');
          confirmPassError.textContent = 'Konfirmasi kata sandi tidak cocok!';
          confirmPassError.style.display = 'block';
          hasError = true;
        }

        if (hasError) return;

        try {
          resetPassBtn.textContent = 'Menyimpan...';
          resetPassBtn.disabled = true;

          const response = await fetch(`${API_BASE_URL}/api/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail, password: newPass })
          });

          if (response.ok) {
            showCustomAlert("Kata sandi Anda berhasil diperbarui! Silakan masuk kembali.", "Berhasil", () => {
              window.location.hash = '#/login';
            });
          } else {
            const data = await response.json();
            showCustomAlert(data.detail || "Gagal mengubah kata sandi", "Gagal");
            resetPassBtn.textContent = 'Perbarui Kata Sandi';
            resetPassBtn.disabled = false;
          }
        } catch (error) {
          console.error(error);
          showCustomAlert("Gagal terhubung ke server. Pastikan backend Python menyala.", "Koneksi Bermasalah");
          resetPassBtn.textContent = 'Perbarui Kata Sandi';
          resetPassBtn.disabled = false;
        }
      });
    }
  }

  render();
  return page;
}
