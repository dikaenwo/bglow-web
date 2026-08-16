import { icons } from '../components/BottomNav.js';
import { getUserId } from '../utils/store.js';
import { showCustomAlert, showCustomConfirm } from '../utils/helpers.js';

function getScanHistory() {
  const userId = getUserId();
  const data = localStorage.getItem('bglow_scan_history_' + userId);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }
  return [];
}

function saveScanHistory(list) {
  const userId = getUserId();
  localStorage.setItem('bglow_scan_history_' + userId, JSON.stringify(list));
}

export function renderScanHistory() {
  const page = document.createElement('div');
  page.className = 'page scan-history-page';

  function render() {
    const list = getScanHistory();

    if (list.length === 0) {
      page.innerHTML = `
        <div class="page-header">
          <button class="back-btn" id="history-back-btn">${icons.chevronLeft}</button>
          <h1 style="width: 100%; text-align: center; margin-right: 40px;">Riwayat Scan</h1>
        </div>
        <div class="page-content">
          <div class="empty-state anim-fade-in" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 60px 20px; text-align:center; background: var(--bg-card); border-radius: 16px; border: 1px dashed var(--border-light); margin: 20px 0;">
            <div style="font-size:4.5rem; margin-bottom:20px;">📷</div>
            <h3 style="margin-bottom:10px; color: var(--text-primary); font-size: 1.15rem; font-weight: 600;">Belum Ada Riwayat</h3>
            <p style="color:var(--text-secondary); margin-bottom:24px; line-height:1.6; font-size:0.85rem; max-width: 280px;">
              Anda belum pernah melakukan scan kulit AI. Pindai kulit wajah Anda sekarang untuk melihat riwayat perkembangan di sini.
            </p>
            <button class="btn btn-primary" id="btn-scan-now" style="padding: 12px 24px; border-radius: 12px; font-weight: 600;">Mulai Scan AI</button>
          </div>
        </div>
      `;

      page.querySelector('#history-back-btn').addEventListener('click', () => {
        window.location.hash = '#/profile';
      });

      page.querySelector('#btn-scan-now').addEventListener('click', () => {
        window.location.hash = '#/scan';
      });

      return;
    }

    let cardsHTML = '';
    list.forEach((item, index) => {
      const isGood = item.skin_score >= 80;
      const isWarn = item.skin_score >= 60 && item.skin_score < 80;
      const scoreClass = isGood ? 'hc-score-good' : (isWarn ? 'hc-score-warn' : 'hc-score-bad');

      cardsHTML += `
        <div class="history-card" data-idx="${index}" style="animation-delay: ${index * 80}ms;">
          ${item.image 
            ? `<div class="hc-img" style="background-image: url('${item.image}')"></div>` 
            : '<div class="hc-img">👤</div>'
          }
          <div class="hc-content">
            <div class="hc-header">
              <span class="hc-date">${item.date}</span>
              <span class="hc-score-badge ${scoreClass}">${item.skin_score}/100</span>
            </div>
            <div class="hc-title">Analisis Kulit ${item.skin_type}</div>
            <div class="hc-tags">
              <span class="hc-tag">${item.acne_level.split(' — ')[0]}</span>
              <span class="hc-tag">${item.oil_level.split(' — ')[0]}</span>
              <span class="hc-tag">${item.pore_condition.split(' — ')[0]}</span>
            </div>
          </div>
          <button class="hc-delete-btn" data-idx="${index}" title="Hapus riwayat">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      `;
    });

    page.innerHTML = `
      <div class="page-header">
        <button class="back-btn" id="history-back-btn">${icons.chevronLeft}</button>
        <h1 style="width: 100%; text-align: center; margin-right: 40px;">Riwayat Scan</h1>
      </div>
      <div class="page-content">
        <div class="history-container">
          ${cardsHTML}
        </div>
      </div>
    `;

    page.querySelector('#history-back-btn').addEventListener('click', () => {
      window.location.hash = '#/profile';
    });

    // Handle view detail click (clicking card body)
    page.querySelectorAll('.history-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // Prevent trigger if clicking delete button
        if (e.target.closest('.hc-delete-btn')) return;
        
        const idx = parseInt(card.dataset.idx);
        showHistoryDetailModal(list[idx]);
      });
    });

    // Handle delete click
    page.querySelectorAll('.hc-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.idx);
        showCustomConfirm("Yakin ingin menghapus riwayat scan ini?", () => {
          const currentList = getScanHistory();
          currentList.splice(idx, 1);
          saveScanHistory(currentList);
          render();
        }, "Hapus Riwayat");
      });
    });
  }

  function showHistoryDetailModal(item) {
    const isGood = item.skin_score >= 80;
    const isWarn = item.skin_score >= 60 && item.skin_score < 80;
    const scoreClass = isGood ? 'hc-score-good' : (isWarn ? 'hc-score-warn' : 'hc-score-bad');
    const scoreLabel = isGood ? 'Sangat Baik' : (isWarn ? 'Normal/Baik' : 'Butuh Perhatian');

    const overlay = document.createElement('div');
    overlay.className = 'diary-modal-overlay';
    overlay.innerHTML = `
      <div class="diary-modal history-detail-modal">
        <div class="modal-handle"></div>
        <div class="modal-title" style="margin-bottom:15px; text-align:center;">Analisis Wajah AI</div>
        <p style="text-align:center; font-size:0.8rem; color:var(--text-tertiary); margin-bottom:15px; margin-top:-10px;">Dipindai pada ${item.date}</p>
        
        ${item.image 
          ? `<div class="hdm-img" style="background-image: url('${item.image}')"></div>` 
          : '<div class="hdm-img">👤</div>'
        }
        
        <div class="hdm-score-row">
          <div class="hdm-score-info">
            <h4>Skor Kesehatan Kulit</h4>
            <div class="hdm-score-val">${item.skin_score}/100</div>
          </div>
          <span class="hdm-score-badge ${scoreClass}">${scoreLabel}</span>
        </div>

        <div class="hdm-section">
          <h4>Karakteristik Tipe Kulit</h4>
          <p>
            Kulit Anda berjenis <strong>${item.skin_type}</strong>. Ini berarti ada perbedaan kadar kelembapan dan sebum di area T-zone dibandingkan dengan pipi.
          </p>
        </div>

        <div class="hdm-section">
          <h4>Rincian Deteksi Masalah</h4>
          <div class="hdm-grid">
            <div class="hdm-item">
              <div class="hdmi-label">Jerawat (Acne)</div>
              <div class="hdmi-val">${item.acne_level}</div>
            </div>
            <div class="hdm-item">
              <div class="hdmi-label">Level Minyak</div>
              <div class="hdmi-val">${item.oil_level}</div>
            </div>
            <div class="hdm-item">
              <div class="hdmi-label">Kondisi Pori</div>
              <div class="hdmi-val">${item.pore_condition}</div>
            </div>
            <div class="hdm-item">
              <div class="hdmi-label">Tipe Kulit</div>
              <div class="hdmi-val">${item.skin_type}</div>
            </div>
          </div>
        </div>

        <button class="btn btn-primary hdm-close-btn" style="margin-top:20px; width:100%">Tutup</button>
      </div>
    `;

    overlay.querySelector('.hdm-close-btn').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    document.body.appendChild(overlay);
  }

  render();
  return page;
}
