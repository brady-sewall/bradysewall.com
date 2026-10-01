(() => {
  'use strict';
  const key = 'brady-analytics-consent-v1';
  const duration = 180 * 24 * 60 * 60 * 1000;
  const liveHost = ['bradysewall.com', 'www.bradysewall.com'].includes(location.hostname);
  const privacySignal = navigator.globalPrivacyControl === true || ['1', 'yes'].includes(navigator.doNotTrack) || window.doNotTrack === '1';
  const panel = document.querySelector('.consent-panel');
  const status = document.querySelector('.consent-status');
  const settings = document.querySelector('.privacy-settings');
  const accept = document.querySelector('[data-consent="accepted"]');
  const decline = document.querySelector('[data-consent="declined"]');
  const close = document.querySelector('.consent-close');
  let loaded = false;
  let choice = null;
  try {
    const stored = JSON.parse(localStorage.getItem(key));
    if (stored && ['accepted', 'declined'].includes(stored.choice) && typeof stored.at === 'number' && stored.at <= Date.now() && Date.now() - stored.at < duration) choice = stored.choice;
  } catch (_) { /* A per-visit choice still works when storage is unavailable. */ }
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window['ga-disable-G-5J759DPK0N'] = true;
  const consent = granted => ({analytics_storage: granted ? 'granted' : 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', functionality_storage: 'granted', security_storage: 'granted'});
  window.gtag('consent', 'default', consent(false));
  window.gtag('set', {allow_google_signals: false, allow_ad_personalization_signals: false, ads_data_redaction: true});
  function loadAnalytics() {
    if (loaded || !liveHost || privacySignal) return;
    loaded = true;
    window['ga-disable-G-5J759DPK0N'] = false;
    window.gtag('consent', 'update', consent(true));
    window.dataLayer.push({'gtm.start': Date.now(), event: 'gtm.js'});
    const gtm = document.createElement('script');
    gtm.async = true;
    gtm.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-564FG55';
    document.head.appendChild(gtm);
    if (!panel.hidden) status.textContent = 'Analytics are currently on.';
  }
  function clearAnalyticsCookies() {
    const domains = ['', location.hostname, '.bradysewall.com'];
    const paths = new Set(['/']);
    const segments = location.pathname.split('/').filter(Boolean);
    for (let i = 1; i <= segments.length; i++) paths.add('/' + segments.slice(0, i).join('/'));
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.trim().split('=')[0];
      if (!/^(_ga(?:_|$)|_gid$|_gat|_gcl_|_clck$|_clsk$)/.test(name)) return;
      for (const domain of domains) for (const path of paths) document.cookie = name + '=; Max-Age=0; path=' + path + (domain ? '; domain=' + domain : '') + '; SameSite=Lax';
    });
  }
  function save(value) {
    choice = value;
    try { localStorage.setItem(key, JSON.stringify({choice: value, at: Date.now()})); } catch (_) {}
  }
  function syncConsentSpace() {
    document.documentElement.style.setProperty('--consent-height', panel.hidden ? '0px' : (panel.getBoundingClientRect().height + 36) + 'px');
  }
  window.addEventListener('resize', syncConsentSpace);
  if ('ResizeObserver' in window) new ResizeObserver(syncConsentSpace).observe(panel);
  function dismiss() { panel.hidden = true; syncConsentSpace(); if (!close.hidden) settings.focus(); else document.querySelector('main').focus({preventScroll:true}); }
  accept.addEventListener('click', () => {
    if (privacySignal) return;
    save('accepted');
    loadAnalytics();
    dismiss();
  });
  decline.addEventListener('click', () => {
    save('declined');
    window['ga-disable-G-5J759DPK0N'] = true;
    if (loaded) {
      window.gtag('consent', 'update', consent(false));
    }
    clearAnalyticsCookies();
    dismiss();
    if (loaded) location.reload(); // Ends vendor runtimes; no scripts load on the next page.
  });
  settings.hidden = false;
  close.addEventListener('click', dismiss);
  settings.addEventListener('click', () => {
    status.textContent = privacySignal ? 'Your browser sends a privacy signal, so optional analytics are off.' : loaded ? 'Analytics are currently on.' : 'Your current choice: analytics off.';
    panel.hidden = false;
    close.hidden = false;
    syncConsentSpace();
    (privacySignal ? decline : accept).focus();
  });
  panel.addEventListener('keydown', event => { if (event.key === 'Escape' && !close.hidden) dismiss(); });
  if (privacySignal) {
    accept.disabled = true;
    clearAnalyticsCookies();
    status.textContent = 'Your browser sends a privacy signal, so optional analytics are off.';
  } else if (choice === 'accepted') loadAnalytics();
  // Never open preferences automatically. Outside the US, collection stays off
  // unless the visitor explicitly enables it through the footer.
  async function checkRegion() {
    if (!liveHost || privacySignal || choice) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    try {
      const response = await fetch('/cdn-cgi/trace', {cache: 'no-store', credentials: 'omit', signal: controller.signal});
      if (!response.ok) return;
      const trace = await response.text();
      // Read only the country; never store or send the trace's IP address.
      const regionAllowsAnalytics = /^loc=US\r?$/m.test(trace) && /^h=(?:www\.)?bradysewall\.com\r?$/m.test(trace);
      // A choice made while the request was pending takes precedence.
      if (regionAllowsAnalytics && !choice) loadAnalytics();
    } catch (_) { /* Unknown location, unavailable proxy, or timeout: remain off. */ }
    finally { clearTimeout(timeout); }
  }
  checkRegion();
  syncConsentSpace();
})();
