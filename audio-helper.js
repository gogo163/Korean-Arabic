/**
 * audio-helper.js — نظام تشغيل الصوت الموحّد لتطبيق KoreanArabic
 * -----------------------------------------------------------------
 * بيحاول يشغّل ملف WAV مسجّل مسبقاً من فولدر audio/ الأول.
 * لو الملف مش موجود (لسه ما اتسجّلش)، بيرجع تلقائياً لـ speechSynthesis
 * كحل مؤقت (المتصفح العادي بيدعمه، لكن بعض WebViews زي Kodular لأ).
 *
 * الاستخدام: أضف <script src="audio-helper.js"></script> بعد progress.js
 * في أي صفحة، وهيبقى متاح عالمياً: window.playKoreanAudio(kr, roman)
 */

(function (global) {
  "use strict";

  // ---------------------------------------------------------------
  // تحويل النص الروماني لاسم ملف صالح (نفس المنطق دايماً لنفس الكلمة)
  // مثال: "annyeonghaseyo" → "annyeonghaseyo.wav"
  //       "gamsahamnida (formal)" → "gamsahamnida_formal.wav"
  // ---------------------------------------------------------------
  function slugify(str) {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  // ---------------------------------------------------------------
  // كاش بسيط عشان مانحاولش نحمّل نفس الملف الغير موجود كذا مرة
  // ---------------------------------------------------------------
  const missingFilesCache = new Set();

  let koreanVoice = null;
  function loadVoices() {
    if (!("speechSynthesis" in global)) return;
    const voices = speechSynthesis.getVoices();
    koreanVoice = voices.find((v) => v.lang === "ko-KR") || voices.find((v) => v.lang.startsWith("ko"));
  }
  if ("speechSynthesis" in global) {
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }

  function speakFallback(krText) {
    if (!("speechSynthesis" in global)) {
      console.warn("لا يوجد ملف صوت مسجّل ولا دعم speechSynthesis لهذه الكلمة:", krText);
      return;
    }
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(krText);
    utter.lang = "ko-KR";
    if (koreanVoice) utter.voice = koreanVoice;
    speechSynthesis.speak(utter);
  }

  /**
   * playKoreanAudio(krText, romanText, folder)
   * krText: النص الكوري (يُستخدم لو رجعنا لـ speechSynthesis)
   * romanText: الروماني (يُستخدم لتوليد اسم الملف)
   * folder: فولدر الصوت (افتراضي: "audio")
   */
  function playKoreanAudio(krText, romanText, folder) {
    folder = folder || "audio";
    const filename = `${folder}/${slugify(romanText)}.wav`;

    if (missingFilesCache.has(filename)) {
      speakFallback(krText);
      return;
    }

    const audio = new Audio(filename);
    let handled = false;

    audio.addEventListener("canplaythrough", () => {
      if (handled) return;
      handled = true;
      audio.play().catch(() => speakFallback(krText));
    });

    audio.addEventListener("error", () => {
      if (handled) return;
      handled = true;
      missingFilesCache.add(filename);
      speakFallback(krText);
    });

    // لو مفيش رد بعد نص ثانية، اعتبره فشل وارجع للصوت الاصطناعي
    setTimeout(() => {
      if (!handled) {
        handled = true;
        speakFallback(krText);
      }
    }, 500);
  }

  global.playKoreanAudio = playKoreanAudio;
  global.slugifyKorean = slugify;
})(window);
