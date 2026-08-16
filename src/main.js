import './styles/variables.css';
import './styles/animations.css';
import './styles/base.css';
import './styles/nav.css';
import './styles/home.css';
import './styles/scan.css';
import './styles/bpom.css';
import './styles/alarm.css';
import './styles/diary.css';
import './styles/profile.css';
import './styles/onboarding.css';
import './styles/intro.css';
import './styles/auth.css';
import './styles/recommendations.css';
import './styles/routine.css';
import './styles/subscription.css';
import './styles/product-detail.css';
import './styles/scan-history.css';
import './styles/feed.css';
import { createBottomNav } from './components/BottomNav.js';
import { renderIntro } from './pages/Intro.js';
import { renderHome } from './pages/Home.js';
import { renderSkinScan } from './pages/SkinScan.js';
import { renderBpomCheck } from './pages/BpomCheck.js';
import { renderSunscreenAlarm } from './pages/SunscreenAlarm.js';
import { renderSkinDiary } from './pages/SkinDiary.js';
import { renderProfile } from './pages/Profile.js';
import { renderOnboarding } from './pages/Onboarding.js';
import { renderLogin } from './pages/Login.js';
import { renderRegister } from './pages/Register.js';
import { renderForgotPassword } from './pages/ForgotPassword.js';
import { renderRecommendations } from './pages/Recommendations.js';
import { renderRoutine } from './pages/Routine.js';
import { renderSettings } from './pages/Settings.js';
import { renderSubscription } from './pages/Subscription.js';
import { renderProductDetail } from './pages/ProductDetail.js';
import { renderFavorites } from './pages/Favorites.js';
import { renderScanHistory } from './pages/ScanHistory.js';
import { renderFeed } from './pages/Feed.js';
import { requestLocationWithPermission } from './utils/geolocation.js';
import { registerAlarmServiceWorker } from './utils/alarm.js';

const app = document.querySelector('#app');

// Daftarkan Service Worker untuk alarm UV (background notifications)
registerAlarmServiceWorker();

// Saat app start untuk user yang sudah login: minta perizinan & aktifkan GPS via Web API
if (localStorage.getItem('bglow_auth') === '1') {
  requestLocationWithPermission({ silent: true }).catch(err => console.warn('Startup geolocation check:', err));
}

// ─── No-nav routes (intro, onboarding, auth) ───
const noNavRoutes = ['intro', 'onboarding', 'login', 'register', 'subscription', 'product-detail', 'forgot-password'];

// ─── Route → tab mapping ───
const tabMap = {
  '': 'home',
  'scan': 'scan',
  'routine': 'routine',
  'profile': 'profile',
  'settings': 'profile',
  'bpom': 'profile',
  'alarm': 'profile',
  'diary': 'profile',
  'favorites': 'profile',
  'scan-history': 'profile',
  'feed':           'feed',
  'recommendations': 'recommendations',
};

function handleRoute() {
  const hash = window.location.hash.slice(2) || '';
  const route = hash.split('?')[0];

  // Auth & onboarding guard
  const isIntroSeen = localStorage.getItem('bglow_intro_seen');
  const isOnboarded = localStorage.getItem('bglow_onboarded');
  const isAuth = localStorage.getItem('bglow_auth');

  // 0. If intro not seen yet, show intro first (before login)
  if (isIntroSeen !== '1' && route !== 'intro') {
    if (isAuth === '1') {
      localStorage.setItem('bglow_intro_seen', '1');
    } else {
      window.location.hash = '#/intro';
      return;
    }
  }

  // 1. If not authenticated, force login first (except register & forgot-password & intro)
  if (isAuth !== '1' && route !== 'login' && route !== 'register' && route !== 'forgot-password' && route !== 'intro') {
    window.location.hash = '#/login';
    return;
  }

  // 2. If authenticated but not yet onboarded, force onboarding
  if (isAuth === '1' && isOnboarded !== '1' && route !== 'onboarding') {
    window.location.hash = '#/onboarding';
    return;
  }

  // 3. If authenticated and already onboarded, prevent accessing auth/onboarding/intro pages
  if (isAuth === '1' && isOnboarded === '1' && (route === 'onboarding' || route === 'login' || route === 'register' || route === 'intro')) {
    window.location.hash = '#/';
    return;
  }

  app.innerHTML = '';
  let pageEl;

  switch (route) {
    case 'intro': pageEl = renderIntro(); break;
    case 'onboarding': pageEl = renderOnboarding(); break;
    case 'login': pageEl = renderLogin(); break;
    case 'register': pageEl = renderRegister(); break;
    case 'forgot-password': pageEl = renderForgotPassword(); break;
    case 'scan': pageEl = renderSkinScan(); break;
    case 'bpom': pageEl = renderBpomCheck(); break;
    case 'alarm': pageEl = renderSunscreenAlarm(); break;
    case 'diary': pageEl = renderSkinDiary(); break;
    case 'profile': pageEl = renderProfile(); break;
    case 'recommendations': pageEl = renderRecommendations(); break;
    case 'routine': pageEl = renderRoutine(); break;
    case 'settings': pageEl = renderSettings(); break;
    case 'subscription': pageEl = renderSubscription(); break;
    case 'product-detail': pageEl = renderProductDetail(); break;
    case 'favorites': pageEl = renderFavorites(); break;
    case 'feed':        pageEl = renderFeed(); break;
    case 'scan-history': pageEl = renderScanHistory(); break;
    default: pageEl = renderHome(); break;
  }

  app.appendChild(pageEl);

  // Add bottom nav for authenticated routes
  if (!noNavRoutes.includes(route)) {
    const activeTab = tabMap[route] || 'home';
    app.appendChild(createBottomNav(activeTab));
  }
}

window.addEventListener('hashchange', handleRoute);
handleRoute();

