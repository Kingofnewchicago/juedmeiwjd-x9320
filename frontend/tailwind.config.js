/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      colors: {
        // Legacy "sage" name kept but remapped to the new MORE indigo brand,
        // so existing panel classes recolor automatically.
        sage: {
          '50': '#EEF1FF',
          '100': '#E0E4FF',
          '200': '#C6CCFF',
          '300': '#A3ABFF',
          '400': '#7F86FB',
          '500': '#6366F1',
          '600': '#4F46E5',
          '700': '#4338CA',
          '800': '#372FA0',
          '900': '#1E1B4B'
        },
        brand: {
          '50': '#EEF1FF',
          '100': '#E0E4FF',
          '200': '#C6CCFF',
          '300': '#A3ABFF',
          '400': '#7F86FB',
          '500': '#6366F1',
          '600': '#4F46E5',
          '700': '#4338CA',
          '800': '#372FA0',
          '900': '#1E1B4B'
        },
        ink: {
          DEFAULT: '#0B0B18',
          soft: '#12122A',
          mute: '#1C1C3A'
        },
        cyanx: {
          DEFAULT: '#22D3EE',
          soft: '#A5F3FC'
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'more-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'more-float': 'more-float 6s ease-in-out infinite'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
};
