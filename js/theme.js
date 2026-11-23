const themeToggle = document.querySelector('#themeToggle');
const themeKey = 'starhit-theme';

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  if (themeToggle) {
    themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
    themeToggle.textContent = theme === 'dark' ? 'Светлая тема' : 'Тёмная тема';
  }
}

function loadTheme() {
  try {
    const stored = localStorage.getItem(themeKey);
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
  } catch {
    return 'light';
  }
  return 'light';
}

function saveTheme(theme) {
  localStorage.setItem(themeKey, theme);
}

let currentTheme = loadTheme();
applyTheme(currentTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(currentTheme);
    saveTheme(currentTheme);
  });
}