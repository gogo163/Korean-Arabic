/**
 * progress.js — نظام الجيميفيكيشن الأساسي لتطبيق تعليم الكوري بالعربي
 * -----------------------------------------------------------------
 * يشمل: نقاط، ستريك يومي، مستويات، وسبيسد ريبيتيشن (SM-2 مبسّط)
 * يعتمد بالكامل على localStorage — مفيش سيرفر ولا اتصال إنترنت مطلوب
 *
 * الاستخدام: أضف <script src="progress.js"></script> في أي صفحة،
 * وهيبقى متاح عالمياً عبر الكائن: window.KoreanProgress
 */

(function (global) {
  "use strict";

  const STORAGE_KEY = "korean_progress_v1";
  const SRS_KEY = "korean_srs_v1";

  // ---------------------------------------------------------------
  // 1) الحالة الأساسية (Points / Streak / Level)
  // ---------------------------------------------------------------

  const LEVELS = [
    { level: 1, title: "مبتدئ (초보자)", minXP: 0 },
    { level: 2, title: "متعلم (학습자)", minXP: 100 },
    { level: 3, title: "طالب مجتهد (열심히 공부하는 학생)", minXP: 300 },
    { level: 4, title: "متوسط (중급자)", minXP: 700 },
    { level: 5, title: "متمكّن (숙련자)", minXP: 1500 },
    { level: 6, title: "خبير الهانغول (한글 전문가)", minXP: 3000 },
  ];

  function todayStr() {
    return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  }

  function daysBetween(a, b) {
    const d1 = new Date(a);
    const d2 = new Date(b);
    return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
  }

  function defaultState() {
    return {
      xp: 0,
      totalPoints: 0,
      streak: 0,
      lastActiveDate: null,
      longestStreak: 0,
      lessonsCompleted: [],
      badges: [],
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return { ...defaultState(), ...parsed };
    } catch (e) {
      console.warn("progress.js: failed to load state, resetting", e);
      return defaultState();
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  let state = loadState();

  // ---------------------------------------------------------------
  // 2) النقاط والمستويات
  // ---------------------------------------------------------------

  function getLevelInfo(xp) {
    let current = LEVELS[0];
    let next = LEVELS[1] || null;
    for (let i = 0; i < LEVELS.length; i++) {
      if (xp >= LEVELS[i].minXP) {
        current = LEVELS[i];
        next = LEVELS[i + 1] || null;
      }
    }
    const progress = next
      ? Math.min(1, (xp - current.minXP) / (next.minXP - current.minXP))
      : 1;
    return { current, next, progress };
  }

  function addPoints(amount, reason) {
    if (amount <= 0) return state;
    state.xp += amount;
    state.totalPoints += amount;
    updateStreak();
    saveState(state);
    emit("points", { amount, reason, xp: state.xp });
    checkBadges();
    return state;
  }

  // ---------------------------------------------------------------
  // 3) الستريك اليومي
  // ---------------------------------------------------------------

  function updateStreak() {
    const today = todayStr();
    if (state.lastActiveDate === today) return; // اتحسب النهاردة خلاص

    if (!state.lastActiveDate) {
      state.streak = 1;
    } else {
      const gap = daysBetween(state.lastActiveDate, today);
      if (gap === 1) {
        state.streak += 1;
      } else if (gap > 1) {
        state.streak = 1; // انكسر الستريك
      }
      // gap === 0 مش هيحصل هنا لأننا فلترنا فوق
    }

    state.lastActiveDate = today;
    if (state.streak > state.longestStreak) {
      state.longestStreak = state.streak;
    }
  }

  function getStreak() {
    // لو فات أكتر من يوم من غير نشاط، الستريك بيتصفر بصريًا هنا
    if (state.lastActiveDate) {
      const gap = daysBetween(state.lastActiveDate, todayStr());
      if (gap > 1) return 0;
    }
    return state.streak;
  }

  // ---------------------------------------------------------------
  // 4) البادچز (شارات الإنجاز)
  // ---------------------------------------------------------------

  const BADGE_DEFS = [
    { id: "first_lesson", label: "أول درس 🎉", test: (s) => s.lessonsCompleted.length >= 1 },
    { id: "streak_7", label: "أسبوع كامل 🔥", test: (s) => s.longestStreak >= 7 },
    { id: "streak_30", label: "شهر متواصل 💪", test: (s) => s.longestStreak >= 30 },
    { id: "xp_500", label: "500 نقطة ⭐", test: (s) => s.xp >= 500 },
    { id: "hangul_master", label: "أستاذ الهانغول 한글", test: (s) => s.lessonsCompleted.filter(l => l.startsWith("hangul_")).length >= 10 },
  ];

  function checkBadges() {
    BADGE_DEFS.forEach((b) => {
      if (!state.badges.includes(b.id) && b.test(state)) {
        state.badges.push(b.id);
        emit("badge", { id: b.id, label: b.label });
      }
    });
    saveState(state);
  }

  function completeLesson(lessonId, xpReward = 10) {
    if (!state.lessonsCompleted.includes(lessonId)) {
      state.lessonsCompleted.push(lessonId);
    }
    addPoints(xpReward, `lesson:${lessonId}`);
    saveState(state);
    return state;
  }

  // ---------------------------------------------------------------
  // 5) Spaced Repetition (SM-2 مبسّط) — للمفردات والهانغول
  // ---------------------------------------------------------------

  function loadSRS() {
    try {
      const raw = localStorage.getItem(SRS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveSRS(srs) {
    localStorage.setItem(SRS_KEY, JSON.stringify(srs));
  }

  let srs = loadSRS();

  /**
   * quality: 0-5 (زي SM-2 الأصلي)
   * 0-2 = غلط / صعب، 3-5 = صح بدرجات مختلفة من السهولة
   */
  function reviewCard(cardId, quality) {
    const card = srs[cardId] || {
      repetitions: 0,
      easeFactor: 2.5,
      interval: 0,
      dueDate: todayStr(),
    };

    if (quality < 3) {
      card.repetitions = 0;
      card.interval = 1;
    } else {
      card.repetitions += 1;
      if (card.repetitions === 1) card.interval = 1;
      else if (card.repetitions === 2) card.interval = 6;
      else card.interval = Math.round(card.interval * card.easeFactor);

      card.easeFactor = Math.max(
        1.3,
        card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
      );
    }

    const due = new Date();
    due.setDate(due.getDate() + card.interval);
    card.dueDate = due.toISOString().slice(0, 10);

    srs[cardId] = card;
    saveSRS(srs);

    if (quality >= 3) addPoints(2, `srs:${cardId}`);
    return card;
  }

  function getDueCards(allCardIds) {
    const today = todayStr();
    return allCardIds.filter((id) => {
      const card = srs[id];
      if (!card) return true; // كارت جديد لسه ما اتراجعش
      return card.dueDate <= today;
    });
  }

  // ---------------------------------------------------------------
  // 6) نظام Events بسيط عشان الـ UI يعرف يتحدث لحظياً
  // ---------------------------------------------------------------

  const listeners = {};
  function on(eventName, cb) {
    if (!listeners[eventName]) listeners[eventName] = [];
    listeners[eventName].push(cb);
  }
  function emit(eventName, payload) {
    (listeners[eventName] || []).forEach((cb) => cb(payload));
  }

  // ---------------------------------------------------------------
  // 7) API عمومي
  // ---------------------------------------------------------------

  function reset() {
    state = defaultState();
    srs = {};
    saveState(state);
    saveSRS(srs);
    emit("reset", {});
  }

  global.KoreanProgress = {
    // نقاط ومستويات
    addPoints,
    getState: () => ({ ...state }),
    getLevelInfo: () => getLevelInfo(state.xp),
    // ستريك
    getStreak,
    // دروس وبادچز
    completeLesson,
    getBadges: () => state.badges.map((id) => BADGE_DEFS.find((b) => b.id === id)),
    // SRS
    reviewCard,
    getDueCards,
    getCardInfo: (id) => srs[id] || null,
    // أحداث
    on,
    // إدارة
    reset,
  };
})(window);
