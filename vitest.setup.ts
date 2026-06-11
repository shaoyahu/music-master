import '@testing-library/jest-dom/vitest'

// Polyfill localStorage (happy-dom provides it, but be safe)
if (typeof globalThis.localStorage === 'undefined' || !globalThis.localStorage.getItem) {
  const store: Record<string, string> = {}
  globalThis.localStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v) },
    removeItem: (k) => { delete store[k] },
    clear: () => { Object.keys(store).forEach((k) => delete store[k]) },
    key: (i) => Object.keys(store)[i] ?? null,
    get length() { return Object.keys(store).length },
  } as Storage
}
