// Light and dark mode toggle. Starts from the visitor's system setting and remembers their choice.
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

  document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('.theme-toggle');
    if (!button) return;
    const render = () => {
      button.textContent = current() === 'dark' ? 'Light mode' : 'Dark mode';
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
