// Light and dark mode toggle. Starts from the visitor's system setting and remembers their choice.
// Sun and moon icons from Lucide (https://lucide.dev), ISC licence, Copyright (c) Lucide Contributors.
(() => {
  const root = document.documentElement;
  const KEY = 'theme';
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'light' || saved === 'dark') root.dataset.theme = saved;
  } catch {
    // Storage can be blocked; the system setting still applies.
  }
  const current = () =>
    root.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  const svg = (paths) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`;
  const MOON = svg('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>');
  const SUN = svg(
    '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  );

  document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('.theme-toggle');
    if (!button) return;
    const render = () => {
      // Shows the mode you switch to: a moon in light mode, a sun in dark mode.
      const label = current() === 'dark' ? 'Light mode' : 'Dark mode';
      button.innerHTML = current() === 'dark' ? SUN : MOON;
      button.setAttribute('aria-label', label);
      button.title = label;
    };
    render();
    button.hidden = false;
    button.addEventListener('click', () => {
      const next = current() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try {
        localStorage.setItem(KEY, next);
      } catch {
        // Not remembered, but the page still switches.
      }
      render();
    });
  });
})();
