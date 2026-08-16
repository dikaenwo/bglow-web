import { API_BASE_URL } from '../config.js';

export function getUserId() {
  const userStr = localStorage.getItem('bglow_user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user.id || 'guest';
    } catch (e) {
      return 'guest';
    }
  }
  return 'guest';
}

/**
 * Ambil JWT token dari localStorage.
 * Return null jika belum login.
 */
export function getAuthToken() {
  return localStorage.getItem('bglow_token') || null;
}

/**
 * Buat object headers dengan Authorization Bearer token.
 * Selalu sertakan Content-Type JSON.
 */
export function getAuthHeaders() {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export function getRoutine() {
  const data = localStorage.getItem('bglow_routine_' + getUserId());
  if (data) return JSON.parse(data);
  return { morning: [], night: [] };
}

export function saveRoutine(routine) {
  localStorage.setItem('bglow_routine_' + getUserId(), JSON.stringify(routine));
  syncUserData({ routine: JSON.stringify(routine) });
}


export function getSpecialSchedule() {
  const data = localStorage.getItem('bglow_special_schedule_' + getUserId());
  if (data) return JSON.parse(data);
  return { morning: {}, night: {} }; // e.g. { morning: { 1: [steps...], 3: [steps...] } }
}

export function saveSpecialSchedule(schedule) {
  localStorage.setItem('bglow_special_schedule_' + getUserId(), JSON.stringify(schedule));
  syncUserData({ special_schedule: JSON.stringify(schedule) });
}

export function getTodayDateString() {
  const now = new Date();
  return `${now.getFullYear()}_${now.getMonth() + 1}_${now.getDate()}`;
}

export function getProgress(dateStr = getTodayDateString()) {
  const userId = getUserId();
  const dbProgressStr = localStorage.getItem(`bglow_routine_progress_${userId}`);
  if (dbProgressStr) {
    try {
      const parsed = JSON.parse(dbProgressStr);
      // Check if it's the old format: { date: "...", progress: ... }
      if (parsed && typeof parsed.date === 'string' && parsed.progress) {
        const newFormat = { [parsed.date]: parsed.progress };
        return newFormat[dateStr] || { morning: [], night: [] };
      }
      // Otherwise, it's the new format (dictionary of dateStr -> progress)
      if (parsed && typeof parsed === 'object') {
        return parsed[dateStr] || { morning: [], night: [] };
      }
    } catch (e) {
      console.error("Gagal parse database progress:", e);
    }
  }
  
  // Legacy key fallback
  const legacyKey = `bglow_progress_${userId}_${dateStr}`;
  const legacyData = localStorage.getItem(legacyKey);
  if (legacyData) return JSON.parse(legacyData);

  return { morning: [], night: [] };
}

export function saveProgress(progress, dateStr = getTodayDateString()) {
  const userId = getUserId();
  
  let history = {};
  const dbProgressStr = localStorage.getItem(`bglow_routine_progress_${userId}`);
  if (dbProgressStr) {
    try {
      const parsed = JSON.parse(dbProgressStr);
      if (parsed && typeof parsed.date === 'string' && parsed.progress) {
        history = { [parsed.date]: parsed.progress };
      } else if (parsed && typeof parsed === 'object') {
        history = parsed;
      }
    } catch (e) {
      console.error("Gagal parse progress history:", e);
    }
  }
  
  history[dateStr] = progress;
  
  localStorage.setItem(`bglow_routine_progress_${userId}`, JSON.stringify(history));
  
  const legacyKey = `bglow_progress_${userId}_${dateStr}`;
  localStorage.setItem(legacyKey, JSON.stringify(progress));
  
  syncUserData({ routine_progress: JSON.stringify(history) });
}

export function getDateStringForDate(date) {
  return `${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}`;
}

export function getMostRecentWeekdayDate(targetDayIdx, referenceDate = new Date()) {
  const resultDate = new Date(referenceDate);
  const currentDayIdx = referenceDate.getDay();
  let daysDiff = currentDayIdx - targetDayIdx;
  if (daysDiff < 0) {
    daysDiff += 7;
  }
  resultDate.setDate(referenceDate.getDate() - daysDiff);
  return resultDate;
}

export function parseDateString(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split('_');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1;
  const day = parseInt(parts[2]);
  return new Date(year, month, day);
}

export function getDaysBetween(dateStr1, dateStr2) {
  const d1 = parseDateString(dateStr1);
  const d2 = parseDateString(dateStr2);
  if (!d1 || !d2) return 0;
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function getLatestCompletedDate(completedDays) {
  let latestDate = null;
  let latestTime = 0;
  completedDays.forEach(dateStr => {
    if (dateStr && typeof dateStr === 'string') {
      const d = parseDateString(dateStr);
      if (d) {
        const t = d.getTime();
        if (t > latestTime) {
          latestTime = t;
          latestDate = dateStr;
        }
      }
    }
  });
  return latestDate;
}

export function isDateCompleted(streak, dateStr) {
  if (!streak || !streak.completedDays) return false;
  if (Array.isArray(streak.completedDays)) {
    return streak.completedDays.includes(dateStr);
  }
  return !!streak.completedDays[dateStr];
}

export function setDateCompleted(streak, dateStr, completed) {
  if (!streak.completedDays) {
    streak.completedDays = {};
  }
  if (Array.isArray(streak.completedDays)) {
    const dict = {};
    streak.completedDays.forEach(d => {
      if (d) dict[d] = true;
    });
    streak.completedDays = dict;
  }
  if (completed) {
    streak.completedDays[dateStr] = true;
  } else {
    delete streak.completedDays[dateStr];
  }
}

export function calculateCurrentStreak(completedDays) {
  if (!completedDays) return 0;
  let count = 0;
  const tempDate = new Date();
  const todayStr = getDateStringForDate(tempDate);
  
  const isCompleted = (dStr) => {
    if (Array.isArray(completedDays)) {
      return completedDays.includes(dStr);
    }
    return !!completedDays[dStr];
  };

  if (isCompleted(todayStr)) {
    count = 1;
    tempDate.setDate(tempDate.getDate() - 1);
    while (isCompleted(getDateStringForDate(tempDate))) {
      count++;
      tempDate.setDate(tempDate.getDate() - 1);
    }
  } else {
    tempDate.setDate(tempDate.getDate() - 1);
    const yesterdayStr = getDateStringForDate(tempDate);
    if (isCompleted(yesterdayStr)) {
      count = 1;
      tempDate.setDate(tempDate.getDate() - 1);
      while (isCompleted(getDateStringForDate(tempDate))) {
        count++;
        tempDate.setDate(tempDate.getDate() - 1);
      }
    }
  }
  return count;
}

export function getLatestCompletedDateFromDict(completedDays) {
  if (!completedDays) return null;
  let dateList = [];
  if (Array.isArray(completedDays)) {
    dateList = completedDays.filter(Boolean);
  } else {
    dateList = Object.keys(completedDays).filter(k => completedDays[k]);
  }
  return getLatestCompletedDate(dateList);
}

export function calculateBestStreak(completedDays) {
  if (!completedDays) return 0;
  
  let dateList = [];
  if (Array.isArray(completedDays)) {
    dateList = completedDays.filter(Boolean);
  } else {
    dateList = Object.keys(completedDays).filter(k => completedDays[k]);
  }
  
  if (dateList.length === 0) return 0;
  
  const dates = dateList
    .map(dStr => parseDateString(dStr))
    .filter(Boolean)
    .sort((a, b) => a.getTime() - b.getTime());
    
  if (dates.length === 0) return 0;
  
  let maxRun = 1;
  let currentRun = 1;
  
  for (let i = 1; i < dates.length; i++) {
    const prev = dates[i - 1];
    const curr = dates[i];
    
    const prevMidnight = new Date(prev.getFullYear(), prev.getMonth(), prev.getDate());
    const currMidnight = new Date(curr.getFullYear(), curr.getMonth(), curr.getDate());
    
    const diffTime = currMidnight.getTime() - prevMidnight.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      currentRun++;
    } else if (diffDays > 1) {
      maxRun = Math.max(maxRun, currentRun);
      currentRun = 1;
    }
  }
  
  return Math.max(maxRun, currentRun);
}

export function getStreak() {
  const data = localStorage.getItem('bglow_streak_' + getUserId());
  let streak;
  if (data) {
    try {
      streak = JSON.parse(data);
    } catch (e) {
      streak = { current: 0, best: 0, lastDate: null, completedDays: {} };
    }
  } else {
    streak = { current: 0, best: 0, lastDate: null, completedDays: {} };
  }

  // Convert array to dictionary if old format
  if (Array.isArray(streak.completedDays)) {
    const dict = {};
    streak.completedDays.forEach(d => {
      if (d) dict[d] = true;
    });
    streak.completedDays = dict;
  }

  // Recalculate streak count dynamically
  streak.current = calculateCurrentStreak(streak.completedDays);
  streak.lastDate = getLatestCompletedDateFromDict(streak.completedDays);
  streak.best = calculateBestStreak(streak.completedDays);

  return streak;
}


export function saveStreak(streak) {
  localStorage.setItem('bglow_streak_' + getUserId(), JSON.stringify(streak));
  syncUserData({ streak: JSON.stringify(streak) });
}

export function clearUserData() {
  // Obsolete: Data is now scoped per-user. We don't delete it.
}

export async function syncUserData(fields) {
  const userId = getUserId();
  if (userId && userId !== 'guest') {
    try {
      await fetch(`${API_BASE_URL}/api/user/${userId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(fields)
      });
    } catch (e) {
      console.error("Gagal sinkronisasi data ke server:", e);
    }
  }
}

export function getSubscriptionPlan() {
  const userId = getUserId();
  return localStorage.getItem('bglow_subscription_plan_' + userId) || 'basic';
}

export function isPremium() {
  const plan = getSubscriptionPlan();
  return plan === 'glow-plus' || plan === 'flawless';
}

export function setSubscriptionPlan(planId) {
  const userId = getUserId();
  localStorage.setItem('bglow_subscription_plan_' + userId, planId);
  syncUserData({ subscription_plan: planId });
}
