const localeCache = new Map();
let activeLocale = 'zh-TW', messages = null;
function preferredLocale() {
  const requested = new URLSearchParams(location.search).get('lang');
  if (['en', 'zh-TW'].includes(requested)) return requested;
  try { const saved = localStorage.getItem('crown-site-language'); if (['en','zh-TW'].includes(saved)) return saved; } catch {}
  return 'zh-TW';
}
function t(key, values = {}) {
  return (messages.ui[key] || key).replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ''));
}
function localizedCard(card) { return {...card, ...messages.cards[card.id]}; }
async function setLocale(lang) {
  const control = document.querySelector('#language');
  control.disabled = true;
  try {
    if (!localeCache.has(lang)) {
      const response = await fetch(`locales/${lang}.json`);
      if (!response.ok) throw new Error('Language file could not be loaded');
      localeCache.set(lang, await response.json());
    }
    messages = localeCache.get(lang); activeLocale = lang;
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-Hant';
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = messages.strings[el.dataset.i18n]; });
    for (const attr of ['placeholder','aria-label','alt','title']) {
      document.querySelectorAll(`[data-i18n-${attr}]`).forEach(el => el.setAttribute(attr, messages.strings[el.getAttribute(`data-i18n-${attr}`)]));
    }
    document.querySelectorAll('[data-logo]').forEach(el => { el.src = `branding/crown-islands-${lang}.webp`; el.alt = t('logo'); });
    control.value = lang; control.setAttribute('aria-label', t('language'));
    document.querySelectorAll('[data-language-link]').forEach(el => { el.href = `${el.dataset.languageLink}?lang=${encodeURIComponent(lang)}`; });
    document.dispatchEvent(new Event('localechange'));
  } finally { control.disabled = false; }
}
