document.getElementById('year').textContent = new Date().getFullYear();
const themeSelect = document.getElementById('theme');
themeSelect.value = document.documentElement.dataset.theme || 'system';
themeSelect.closest('label').hidden = false;
themeSelect.addEventListener('change', () => {
  const value = themeSelect.value;
  if (value === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = value;
  try {
    if (value === 'system') localStorage.removeItem('brady-theme');
    else localStorage.setItem('brady-theme', value);
  } catch (_) { /* The chosen theme still works for this visit. */ }
});
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('reveal-pending');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  if (!motionPreference.matches) document.querySelectorAll('.reveal').forEach(element => {
    element.classList.add('reveal-pending');
    observer.observe(element);
  });
  motionPreference.addEventListener('change', event => {
    if (event.matches) {
      observer.disconnect();
      document.querySelectorAll('.reveal-pending').forEach(element => element.classList.remove('reveal-pending'));
    }
  });
}

const art = document.querySelector('.art-wrap');
const motionToggle = document.querySelector('.motion-toggle');
function syncHeroMotion() {
  art.classList.toggle('motion-enabled', !motionPreference.matches);
  motionToggle.hidden = motionPreference.matches;
}
syncHeroMotion();
motionPreference.addEventListener('change', syncHeroMotion);
motionToggle.addEventListener('click', () => {
  const paused = art.classList.toggle('motion-paused');
  motionToggle.textContent = paused ? 'Resume animation' : 'Pause animation';
});
