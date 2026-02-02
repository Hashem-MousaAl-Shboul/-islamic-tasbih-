# 🛡️ دليل حماية مشروع التسبيح الإسلامي

## 📋 جدول المحتويات
1. [النسخ الاحتياطي](#النسخ-الاحتياطي)
2. [استخدام Git](#استخدام-git)
3. [الحماية من الأخطاء](#الحماية-من-الأخطاء)
4. [التحديثات الآمنة](#التحديثات-الآمنة)
5. [استعادة المشروع](#استعادة-المشروع)

---

## 🔄 النسخ الاحتياطي

### الطريقة 1: Git + GitHub (الأفضل) ⭐

#### الخطوة 1: تثبيت Git
```bash
# تحقق من وجود Git
git --version

# إذا لم يكن مثبتاً، حمّله من:
# https://git-scm.com/downloads
```

#### الخطوة 2: إنشاء Repository
```bash
# في مجلد المشروع
git init
git add .
git commit -m "Initial commit - Islamic Tasbeeh v1.0"
```

#### الخطوة 3: الرفع على GitHub
1. اذهب إلى https://github.com
2. أنشئ حساب جديد (إذا لم يكن لديك)
3. اضغط "New Repository"
4. سمّه: `islamic-tasbeeh`
5. اجعله **Private** (خاص)
6. ثم نفذ:

```bash
git remote add origin https://github.com/YourUsername/islamic-tasbeeh.git
git branch -M main
git push -u origin main
```

#### الخطوة 4: النسخ الاحتياطي الدوري
```bash
# بعد كل تعديل مهم:
git add .
git commit -m "وصف التعديل"
git push
```

---

### الطريقة 2: النسخ اليدوي

#### نسخ يومي:
```
📁 Backups/
  ├── 2025-01-15-islamic-tasbeeh/
  ├── 2025-01-20-islamic-tasbeeh/
  └── 2025-01-25-islamic-tasbeeh/
```

#### أماكن الحفظ:
- ✅ Google Drive
- ✅ Dropbox
- ✅ OneDrive
- ✅ قرص خارجي (USB)
- ✅ قرص صلب خارجي

---

## 🔐 الحماية من الأخطاء

### 1. قبل أي تعديل كبير
```bash
# أنشئ فرع جديد للتجربة
git checkout -b test-new-feature

# جرّب التعديلات
# إذا نجحت:
git checkout main
git merge test-new-feature

# إذا فشلت:
git checkout main
git branch -D test-new-feature
```

### 2. اختبر قبل النشر
```bash
# اختبر على الويب
npm run start-web

# اختبر على الهاتف
npm start
# ثم امسح QR Code
```

### 3. احتفظ بنسخة من الملفات المهمة
```
📁 IMPORTANT-FILES/
  ├── app.json (Bundle ID + App Name)
  ├── package.json (Dependencies)
  ├── constants/dhikr.ts (البيانات)
  └── hooks/useTasbihStore.ts (المنطق الأساسي)
```

---

## 🔄 التحديثات الآمنة

### قبل تحديث أي مكتبة:
```bash
# 1. احفظ النسخة الحالية
git add .
git commit -m "Before updating packages"
git push

# 2. حدّث مكتبة واحدة فقط
bun update expo-av

# 3. اختبر التطبيق
npm start

# 4. إذا حدثت مشكلة، ارجع:
git reset --hard HEAD
```

### لا تحدّث كل شيء مرة واحدة!
```bash
# ❌ خطر:
bun update

# ✅ آمن:
bun update expo-av
# اختبر
bun update expo-router
# اختبر
```

---

## 🚨 استعادة المشروع

### إذا تعطل المشروع:

#### من Git:
```bash
# ارجع لآخر نسخة تعمل
git log  # شاهد التواريخ
git checkout <commit-id>

# أو ارجع لآخر commit:
git reset --hard HEAD~1
```

#### من نسخة يدوية:
1. احذف المجلد الحالي
2. انسخ النسخة الاحتياطية
3. نفذ:
```bash
cd islamic-tasbeeh
bun install
npm start
```

---

## 📝 قائمة فحص يومية

### قبل إغلاق الكمبيوتر:
- [ ] هل حفظت التعديلات؟
- [ ] هل اختبرت التطبيق؟
- [ ] هل رفعت على Git؟
```bash
git add .
git commit -m "End of day - $(date)"
git push
```

### قبل النشر:
- [ ] اختبار على Android
- [ ] اختبار على iOS
- [ ] اختبار على الويب
- [ ] مراجعة الأذكار والنصوص
- [ ] التأكد من Bundle ID: `com.hashem.tasbeeh`

---

## 🆘 أرقام الطوارئ

### إذا فقدت المشروع:
1. ✅ تحقق من GitHub
2. ✅ تحقق من Google Drive
3. ✅ تحقق من سلة المحذوفات
4. ✅ استخدم برامج استعادة الملفات

### برامج استعادة الملفات:
- **Windows**: Recuva
- **Mac**: Disk Drill
- **Linux**: TestDisk

---

## 💡 نصائح ذهبية

1. **اعمل commit كل ساعة عمل**
2. **ارفع على GitHub كل يوم**
3. **احتفظ بنسخة على قرص خارجي كل أسبوع**
4. **لا تحذف النسخ القديمة قبل شهر**
5. **اختبر دائماً قبل الحذف**

---

## 📞 الدعم

إذا واجهت مشكلة:
1. لا تذعر 😊
2. لا تحذف شيئاً
3. تحقق من Git log
4. استعد آخر نسخة تعمل

---

**تم إنشاء هذا الدليل بواسطة Rork 🤖**
**آخر تحديث: 2025-01-15**
