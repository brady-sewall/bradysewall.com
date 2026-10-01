// Apply an explicit override before paint; system preference stays in CSS.
(() => {
  try {
    const theme = localStorage.getItem('brady-theme');
    if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
  } catch (_) { /* Storage may be unavailable; system preference still works. */ }
})();
