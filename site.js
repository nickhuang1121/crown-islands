// Shared language controls for the home page and the privacy policy.
const languageControl = document.querySelector('#language');
function showLocaleError(key, fallback) {
  const status = document.querySelector('#locale-status') || document.querySelector('#count');
  if (status) status.textContent = messages ? t(key) : fallback;
}
languageControl.addEventListener('change', async event => {
  const lang = event.target.value;
  try {
    await setLocale(lang);
    try { localStorage.setItem('crown-site-language', lang); } catch {}
    const url = new URL(location.href); url.searchParams.set('lang', lang);
    history.replaceState(null, '', url);
  } catch {
    event.target.value = activeLocale;
    showLocaleError('localeError', 'Could not load this language. Please try again.');
  }
});
function applyShareMeta() {
  const image = new URL('branding/shareimg.jpg', location.href).href;
  document.querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]').forEach(meta => {
    meta.content = image;
  });
  const pageUrl = new URL(location.href);
  pageUrl.hash = '';
  let ogUrl = document.querySelector('meta[property="og:url"]');
  if (!ogUrl) {
    ogUrl = document.createElement('meta');
    ogUrl.setAttribute('property', 'og:url');
    document.head.appendChild(ogUrl);
  }
  ogUrl.content = pageUrl.href;
  document.querySelectorAll('meta[property="og:title"], meta[name="twitter:title"]').forEach(meta => {
    meta.content = document.title;
  });
}
document.addEventListener('localechange', applyShareMeta);
applyShareMeta();
setLocale(preferredLocale()).catch(() => setLocale('en')).catch(() => {
  showLocaleError('loadError', 'Could not load this page. Please reload it.');
});
function bindExpandable(root, proseSelector, id) {
  const prose = root.querySelector(proseSelector);
  const button = root.querySelector('.story-expand');
  if (!prose || !button) return;
  if (!prose.id) prose.id = id;
  button.setAttribute('aria-controls', prose.id);
  button.addEventListener('click', () => {
    const open = root.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(open));
    if (!open && root.getBoundingClientRect().top < 80) root.scrollIntoView({ block: 'start' });
  });
}
document.querySelectorAll('.music-story').forEach((story, index) => {
  bindExpandable(story, '.story-prose', `music-story-prose-${index + 1}`);
});
const creatorStory = document.querySelector('#creator');
if (creatorStory) bindExpandable(creatorStory, '.creator-prose', 'creator-story-prose');
const releaseNotice = document.querySelector('#release-notice');
if (releaseNotice) {
  document.querySelectorAll('[data-platform]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelector('#release-platform').textContent = button.dataset.platform;
      releaseNotice.showModal();
    });
  });
  releaseNotice.addEventListener('click', event => {
    if (event.target === releaseNotice) releaseNotice.close();
  });
}
