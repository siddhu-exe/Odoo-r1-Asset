/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg)',
        'bg-secondary': 'var(--card)',
        'bg-tertiary': 'var(--card-alt)',
        foreground: 'var(--text-primary)',
        'text-secondary': 'var(--text-muted)',
        primary: 'var(--accent)',
        'primary-dark': '#C6501F',
        accent: 'var(--accent-secondary)',
        'accent-light': '#74A388',
        success: 'var(--chart-3)',
        warning: 'var(--neutral)',
        danger: 'var(--chart-6)',
        'border-color': 'var(--border)',
        'chart-1': 'var(--chart-1)',
        'chart-2': 'var(--chart-2)',
        'chart-3': 'var(--chart-3)',
        'chart-4': 'var(--chart-4)',
        'chart-5': 'var(--chart-5)',
        'chart-6': 'var(--chart-6)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace']
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-in': 'slideIn 0.5s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        pulseGlow: {
          '0%': { boxShadow: '0 0 0 0 rgba(232, 98, 44, 0.5)' },
          '50%': { boxShadow: '0 0 0 10px rgba(232, 98, 44, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(232, 98, 44, 0)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' }
        }
      },
      spacing: {
        '128': '32rem'
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem'
      }
    }
  },
  plugins: []
}
