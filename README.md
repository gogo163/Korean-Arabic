# KoreanArabic 🇰🇷
تعلّم الكورية بالعربي — بنفس معمارية Kodular WebView + GitHub Pages المستخدمة في NihongoArabic وArabiyomi وTaallim Chinese.

## محتوى الريبو الحالي
- `index.html` — الصفحة الرئيسية (قائمة الأقسام + إحصائيات المستخدم)
- `intro.html` — مقدمة تعريفية للمبتدئين تماماً عن اللغة الكورية
- `hangul.html` — تعلّم حروف الهانغول (24 حرف) + مكوّن مقاطع + تمرين كتابة
- `greetings.html` — قاموس تحيات مصنّف حسب مستوى الأدب (رسمي/مؤدّب/كاجوال)
- `drama.html` — عبارات دراما كورية شائعة مع صوت (Web Speech API)
- `progress.js` — نظام الجيميفيكيشن المشترك (نقاط، ستريك، مستويات، بادچز، Spaced Repetition)

## ⚠️ ملاحظة عن الصوت
الصوت في `drama.html` و `greetings.html` بيستخدم `speechSynthesis` بتاع المتصفح (`ko-KR`) — مفيش ملفات WAV مطلوبة. لو الصوت طلع ضعيف أو مش موجود جوه Kodular WebView (زي مشكلة Arabiyomi قبل كده)، الحل البديل: توليد WAV مسبق بصوت كوري (مثلاً Microsoft Heami / InJoon) بنفس طريقة NihongoArabic، وتحويل أزرار الصوت لـ `<audio>` tags بدل `speechSynthesis`.

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
