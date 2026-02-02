#!/bin/bash

# تشغيل جميع الاختبارات
echo "🧪 تشغيل جميع الاختبارات..."
npm test

echo ""
echo "📊 تشغيل الاختبارات مع تقرير التغطية..."
npm run test:coverage

echo ""
echo "👀 تشغيل الاختبارات في وضع المراقبة..."
echo "استخدم Ctrl+C للخروج من وضع المراقبة"
npm run test:watch