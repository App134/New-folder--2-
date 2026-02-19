/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Semantic Colors
                background: {
                    DEFAULT: 'var(--bg-primary)', // Deep Midnight
                    secondary: 'var(--bg-secondary)', // Slightly lighter navy
                    card: 'var(--bg-card)', // Glassy navy
                },
                foreground: 'var(--text-primary)',
                primary: {
                    DEFAULT: 'var(--primary)', // Electric Cyan
                    foreground: 'var(--primary-foreground)',
                },
                secondary: {
                    DEFAULT: 'var(--secondary)', // Royal Blue
                    foreground: 'var(--secondary-foreground)',
                },
                accent: {
                    DEFAULT: 'var(--accent)', // Gold/Amber
                    foreground: 'var(--accent-foreground)',
                },
                // State Colors
                success: 'var(--success)', // Neon Green
                danger: 'var(--danger)', // Bright Red
                warning: 'var(--warning)', // Orange
                info: 'var(--info)', // Sky Blue

                // Text Colors
                muted: 'var(--text-muted)',
            },
            fontFamily: {
                sans: ['var(--font-family)', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-midnight': 'linear-gradient(to bottom right, var(--bg-primary), #020617)',
                'gradient-electric': 'linear-gradient(135deg, var(--primary), var(--secondary))',
                'gradient-card': 'linear-gradient(145deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6))',
                'gradient-glow': 'radial-gradient(circle at center, var(--primary) 0%, transparent 70%)',
            },
            boxShadow: {
                'neon': '0 0 20px -5px var(--primary)',
                'neon-secondary': '0 0 20px -5px var(--secondary)',
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
        },
    },
    plugins: [],
}
