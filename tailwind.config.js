/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme-mode="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--mm-bg)',
        'bg-elevated': 'var(--mm-bg-elevated)',
        fg: 'var(--mm-fg)',
        'fg-muted': 'var(--mm-fg-muted)',
        primary: 'var(--mm-primary)',
        'primary-fg': 'var(--mm-primary-fg)',
        accent: 'var(--mm-accent)',
        border: 'var(--mm-border)',
        danger: 'var(--mm-danger)',
        success: 'var(--mm-success)',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        DEFAULT: 'var(--mm-radius)',
      },
    },
  },
  plugins: [],
}
