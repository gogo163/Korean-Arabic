/**
 * rating.js — نافذة طلب التقييم لتطبيق KoreanArabic
 * -------------------------------------------------
 * تظهر في الصفحة الرئيسية بعد: درسين، أو ستريك 3 أيام، أو 50 نقطة.
 * "لاحقًا" = تتأجّل 7 أيام | "لا شكرًا" = تتأجّل 60 يومًا | "قيّم" = لا تظهر تاني.
 *
 * الاستخدام: أضف <script src="rating.js"></script> بعد progress.js.
 * للتجربة: افتح index.html?rate=1 أو نفّذ KoreanRating.show() من الكونسول.
 *
 * فتح صفحة التطبيق في المتجر:
 *  - داخل Kodular: يرسل JS القيمة "RATE_APP" عبر AppInventor.setWebViewString
 *    (اربط حدث WebViewStringChange بـ In-App Review أو Activity Starter).
 *  - خارج Kodular: يفتح رابط Google Play في تبويب جديد.
 */
(function (global) {
  "use strict";

  var PACKAGE = "com.gogo163.koreanarabic";
  var STORE_URL = "https://play.google.com/store/apps/details?id=" + PACKAGE;
  var KEY = "korean_rating_v1";
  var DAY = 24 * 60 * 60 * 1000;
  var SNOOZE_LATER = 7 * DAY;
  var SNOOZE_NO = 60 * DAY;
  var shownThisSession = false;

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  function save(o) {
    try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {}
  }

  function engaged() {
    var P = global.KoreanProgress;
    if (!P) return false;
    try {
      var st = P.getState();
      var lessons = (st.lessonsCompleted || []).length;
      return lessons >= 2 || P.getStreak() >= 3 || st.xp >= 50;
    } catch (e) { return false; }
  }

  function eligible() {
    var st = load();
    if (st.done) return false;
    if (st.snoozeUntil && Date.now() < st.snoozeUntil) return false;
    return engaged();
  }

  function openStore() {
    try {
      if (global.AppInventor && typeof global.AppInventor.setWebViewString === "function") {
        global.AppInventor.setWebViewString("RATE_APP");
        return;
      }
    } catch (e) {}
    try { global.open(STORE_URL, "_blank"); } catch (e) { global.location.href = STORE_URL; }
  }

  function injectStyle() {
    if (document.getElementById("kr-rating-style")) return;
    var css =
      "#kr-rating{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(42,33,64,.55)}" +
      "#kr-rating .box{width:100%;max-width:360px;background:#fff;border-radius:22px;padding:24px 20px 18px;text-align:center;box-shadow:0 12px 40px rgba(42,33,64,.35);font-family:Tahoma,'Segoe UI',sans-serif;color:#2A2140;direction:rtl}" +
      "#kr-rating .stars{font-size:30px;letter-spacing:4px}" +
      "#kr-rating h2{font-size:17px;margin:8px 0 6px;color:#6C4CE0}" +
      "#kr-rating p{font-size:13px;color:#8A82A6;line-height:1.8;margin-bottom:16px}" +
      "#kr-rating button{display:block;width:100%;border:0;border-radius:14px;padding:13px;font:inherit;font-size:14.5px;font-weight:bold;cursor:pointer}" +
      "#kr-rating .go{background:#6C4CE0;color:#fff;box-shadow:0 4px 0 #4E33B8;margin-bottom:10px}" +
      "#kr-rating .later{background:#F1ECFF;color:#6C4CE0;margin-bottom:6px}" +
      "#kr-rating .no{background:transparent;color:#B0A8CC;font-size:12.5px;font-weight:normal;padding:8px}" +
      "#kr-rating button:focus-visible{outline:3px solid #FF6FA5;outline-offset:2px}";
    var s = document.createElement("style");
    s.id = "kr-rating-style";
    s.textContent = css;
    document.head.appendChild(s);
  }

  function close() {
    var el = document.getElementById("kr-rating");
    if (el) el.parentNode.removeChild(el);
    document.removeEventListener("keydown", onKey);
  }
  function onKey(e) { if (e.key === "Escape") later(); }

  function later() { var st = load(); st.snoozeUntil = Date.now() + SNOOZE_LATER; save(st); close(); }
  function no() { var st = load(); st.snoozeUntil = Date.now() + SNOOZE_NO; save(st); close(); }
  function rate() { var st = load(); st.done = true; save(st); close(); openStore(); }

  function show() {
    if (document.getElementById("kr-rating")) return;
    injectStyle();
    var wrap = document.createElement("div");
    wrap.id = "kr-rating";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");
    wrap.setAttribute("aria-labelledby", "kr-rating-title");
    wrap.innerHTML =
      '<div class="box">' +
        '<div class="stars" aria-hidden="true">⭐⭐⭐⭐⭐</div>' +
        '<h2 id="kr-rating-title">التطبيق فادك؟</h2>' +
        '<p>لو التطبيق ساعدك في تعلّم الكورية، تقييمك على المتجر بياخد ثواني وبيساعد ناس تانية تلاقيه، وبيشجّعنا نكمّل ونضيف دروس جديدة.</p>' +
        '<button class="go" id="kr-go">قيّم التطبيق</button>' +
        '<button class="later" id="kr-later">ذكّرني بعدين</button>' +
        '<button class="no" id="kr-no">لا شكرًا</button>' +
      '</div>';
    document.body.appendChild(wrap);
    document.getElementById("kr-go").onclick = rate;
    document.getElementById("kr-later").onclick = later;
    document.getElementById("kr-no").onclick = no;
    document.addEventListener("keydown", onKey);
    document.getElementById("kr-go").focus();
  }

  function maybeAsk() {
    if (shownThisSession) return;
    if (eligible()) { shownThisSession = true; show(); }
  }

  function init() {
    var forced = /[?&]rate=1\b/.test(global.location.search);
    if (forced) { show(); return; }
    setTimeout(maybeAsk, 2500);
  }

  global.KoreanRating = {
    maybeAsk: maybeAsk,
    show: show,
    reset: function () { try { localStorage.removeItem(KEY); } catch (e) {} }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(window);
