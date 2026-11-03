// التقاط لقطات لكل شاشات التطبيق عبر Playwright على خادم Metro المحلي
// الاستخدام: node scripts/capture-screens.mjs [baseUrl]
import { chromium } from '/usr/local/lib/node_modules/playwright/index.mjs';

const BASE = process.argv[2] || 'http://127.0.0.1:8081';
const OUT = new URL('../.rork/web-verification/all/', import.meta.url).pathname;

const initStorage = (theme) => `
  try {
    localStorage.setItem('@sabbah_guest_user', JSON.stringify({ uid: 'guest_user', name: 'z', email: '', photoURL: null, provider: 'Guest' }));
    localStorage.setItem('welcome_screen_seen', 'true');
    localStorage.setItem('@tasbih_settings', JSON.stringify({ theme: '${theme}', colorTheme: 'gold', backgroundTheme: 'default' }));
  } catch {}
`;

const DARK_TABS = [
  ['/tasbih', 'tasbih', 9000],
  ['/quran', 'quran', 14000],
  ['/adhkar', 'adhkar', 10000],
  ['/qibla', 'qibla', 12000],
  ['/settings', 'settings', 9000],
  ['/statistics', 'statistics', 10000],
  ['/quran-reader', 'quran-reader', 14000],
];

const LIGHT_TABS = [
  ['/tasbih', 'tasbih', 9000],
  ['/quran', 'quran', 14000],
  ['/adhkar', 'adhkar', 10000],
  ['/qibla', 'qibla', 12000],
  ['/settings', 'settings', 9000],
];

async function capture(context, theme, shots) {
  let errors = 0;
  const page = await context.newPage();
  page.on('pageerror', () => errors++);
  for (const [route, name, wait] of shots) {
    await page.goto(BASE + route, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(wait);
    await page.screenshot({ path: OUT + name + '-' + theme + '.png' });
    console.log('OK ' + name + '-' + theme + ' (errors so far: ' + errors + ')');
  }
  return errors;
}

const browser = await chromium.launch();

// ضيف — داكن (الافتراضي)
const ctxDark = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await ctxDark.addInitScript(initStorage('dark'));
const e1 = await capture(ctxDark, 'dark', DARK_TABS);

// ضيف — فاتح (التبويبات الأساسية فقط)
const ctxLight = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await ctxLight.addInitScript(initStorage('light'));
const e2 = await capture(ctxLight, 'light', LIGHT_TABS);

// زائر جديد — تسجيل الدخول والترحيب
const ctxFresh = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await ctxFresh.addInitScript(`try { localStorage.clear(); } catch {}`);
const e3 = await capture(ctxFresh, 'guest', [
  ['/sign-in', 'sign-in', 9000],
  ['/welcome', 'welcome', 9000],
]);

console.log('DONE totalPageErrors=' + (e1 + e2 + e3));
await browser.close();
