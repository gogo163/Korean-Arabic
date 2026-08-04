# KoreanArabic 🇰🇷
تعلّم الكورية بالعربي — بنفس معمارية Kodular WebView + GitHub Pages المستخدمة في NihongoArabic وArabiyomi وTaallim Chinese.

## محتوى الريبو الحالي
- `index.html` — الصفحة الرئيسية (قائمة الأقسام + إحصائيات المستخدم)
- `intro.html` — مقدمة تعريفية للمبتدئين تماماً عن اللغة الكورية
- `hangul.html` — تعلّم حروف الهانغول (24 حرف) + مكوّن مقاطع + تمرين كتابة
- `greetings.html` — قاموس تحيات مصنّف حسب مستوى الأدب (رسمي/مؤدّب/كاجوال)
- `drama.html` — عبارات دراما كورية شائعة مع صوت (Web Speech API)
- `progress.js` — نظام الجيميفيكيشن المشترك (نقاط، ستريك، مستويات، بادچز، Spaced Repetition)

## ⚠️ نظام الصوت
كل الصفحات دلوقتي بتستخدم `audio-helper.js` — نظام هجين:
1. بيحاول يشغّل ملف WAV مسجّل مسبقاً من فولدر `audio/[section]/[filename].wav`
2. لو الملف مش موجود (لسه ما اتسجّلش)، بيرجع تلقائياً لـ `speechSynthesis` (المتصفح) كحل مؤقت

**ليه التغيير ده؟** لأن Kodular WebView بيرفض يشغّل speechSynthesis بشكل موثوق حتى لو اللغة الكورية منزّلة على الجهاز — نفس المشكلة اللي حصلت مع Arabiyomi قبل كده.

**خطوات التسجيل:**
1. افتح ملف `AUDIO_RECORDING_LIST.md` — فيه كل الـ151 جملة مطلوبة، منظّمة حسب القسم، مع اسم الملف المطلوب بالظبط
2. سجّل كل جملة بـ Balabolka بصوت كوري (Microsoft Heami بعد تثبيت حزمة اللغة الكورية من إعدادات ويندوز)
3. سمّي كل ملف بالظبط زي العمود التالت في الجدول (حساس لحالة الأحرف - كله لاحروف صغيرة)
4. حط الملفات في المسار الصحيح:
   - `audio/drama/` - عبارات الدراما
   - `audio/greetings/` - قاموس التحيات
   - `audio/vocabulary/` - الكلمات الأساسية
   - `audio/conversations/` - المحادثات
   - `audio/grammar/` - أمثلة القواعد
   - `audio/wotd/` - كلمة اليوم
5. ارفع فولدر `audio/` كامل على GitHub

**ملحوظة:** التطبيق هيشتغل من غير ما تسجّل حاجة (هيستخدم speechSynthesis كـ fallback)، فمش لازم تسجّل الـ151 كلهم مرة واحدة — سجّل الأقسام الأهم ليك الأول (زي الدراما) وكمّل بعدين.

## إزاي تعمل push للريبو ده على GitHub

### الطريقة الأولى: ريبو جديد
```bash
cd KoreanArabic
git init
git add .
git commit -m "Initial commit: KoreanArabic app structure"
git branch -M main
git remote add origin https://github.com/gogo163/korean_arabic.git
git push -u origin main
```
(لازم تكون عملت الريبو الفاضي على GitHub الأول من الموقع: github.com/new)

### تفعيل GitHub Pages
1. روح لإعدادات الريبو → Settings → Pages
2. من "Branch" اختار `main` والفولدر `/ (root)`
3. احفظ، وهيبقى الموقع شغال على:
   `https://gogo163.github.io/korean_arabic/`

### تحديث لاحق (بعد أي تعديل)
```bash
git add .
git commit -m "وصف التعديل"
git push
```

## الخطوات الجاية المقترحة
- [ ] ربط الصفحات في تجربة تنقّل موحدة (bottom navigation)
- [ ] إضافة قسم HSK-style مستويات (TOPIK كمرجع)
- [ ] قسم مفردات كيبوب
- [ ] دمج SRS مع قائمة مفردات فعلية بدل الديمو
- [ ] اختبار الصوت جوه Kodular WebView وتقرير الحل النهائي (Web Speech API ولا WAV)
