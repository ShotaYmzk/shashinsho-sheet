const STORAGE_KEY = 'color-scheme';

export type ThemeChoice = 'system' | 'light' | 'dark';

function applyTheme(choice: ThemeChoice): void {
  const root = document.documentElement;
  if (choice === 'light') {
    root.setAttribute('data-theme', 'light');
  } else if (choice === 'dark') {
    root.setAttribute('data-theme', 'dark');
  } else {
    root.removeAttribute('data-theme');
  }
}

/** 初回ペイント前のちらつき防止用（index.html のインラインと同一ロジック） */
export function initTheme(): void {
  const select = document.querySelector<HTMLSelectElement>('#theme-select');
  if (!select) return;

  const stored = localStorage.getItem(STORAGE_KEY) as ThemeChoice | null;
  const initial: ThemeChoice =
    stored === 'light' || stored === 'dark' || stored === 'system'
      ? stored
      : 'system';
  select.value = initial;
  applyTheme(initial);

  select.addEventListener('change', () => {
    const v = select.value as ThemeChoice;
    localStorage.setItem(STORAGE_KEY, v);
    applyTheme(v);
  });
}
