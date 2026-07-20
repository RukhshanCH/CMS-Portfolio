import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface ThemeData {
    primary: string;
    primaryDark: string;
    secondary: string;
    accent: string;
    accentSoft: string;
    accentBg: string;
    dark: string;
    light: string;
    gray: string;
    grayWarm: string;
    text: string;
    textLight: string;
    radius: string;
    maxWidth: string;
    fontFamily: string;
    gradientDirection: string;
    cardStyle: string;
    buttonStyle: string;
    enableAnimations: boolean;
    darkMode: boolean;

    success?: string;
    warning?: string;
    danger?: string;

    featured?: string;
}

const defaultTheme: ThemeData = {
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    secondary: '#8b5cf6',
    accent: '#4ade80',
    accentSoft: '#bbf7d0',
    accentBg: '#f0fdf4',
    dark: '#1e1b4b',
    light: '#ffffff',
    gray: '#e2e8f0',
    grayWarm: '#f1f5f9',
    text: '#334155',
    textLight: '#64748b',
    radius: '12',
    maxWidth: '1200',
    fontFamily: 'system',
    gradientDirection: '135deg',
    cardStyle: 'rounded',
    buttonStyle: 'gradient',
    enableAnimations: true,
    darkMode: false,
};

interface ThemeContextType {
    theme: ThemeData;
    loading: boolean;
    refreshTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<ThemeData>(defaultTheme);
    const [loading, setLoading] = useState(true);

    const fetchTheme = async () => {
        try {
            const res = await fetch(`${(import.meta as any).env?.VITE_APP_API_URL}/api/theme`);
            const data = await res.json();
            setTheme({ ...defaultTheme, ...data.data });
        } catch {
            setTheme(defaultTheme);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTheme();
    }, []);

    // Apply CSS variables whenever theme changes
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--primary', theme.primary);
        root.style.setProperty('--primary-dark', theme.primaryDark);
        root.style.setProperty('--secondary', theme.secondary);
        root.style.setProperty('--accent', theme.accent);
        root.style.setProperty('--accent-soft', theme.accentSoft);
        root.style.setProperty('--accent-bg', theme.accentBg);
        root.style.setProperty('--dark', theme.dark);
        root.style.setProperty('--light', theme.light);
        root.style.setProperty('--gray', theme.gray);
        root.style.setProperty('--gray-warm', theme.grayWarm);
        root.style.setProperty('--text', theme.text);
        root.style.setProperty('--text-light', theme.textLight);
        root.style.setProperty('--radius', `${theme.radius}px`);
        root.style.setProperty('--max-width', `${theme.maxWidth}px`);
        root.style.setProperty('--gradient-direction', theme.gradientDirection);

        root.style.setProperty('--success', theme.success || '#22c55e');
        root.style.setProperty('--warning', theme.warning || '#f59e0b');
        root.style.setProperty('--danger', theme.danger || '#ef4444');
        root.style.setProperty('--featured', theme.featured || '#fbbf24');

        // Font family
        const fontMap: Record<string, string> = {
            system: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            inter: "'Inter', sans-serif",
            roboto: "'Roboto', sans-serif",
            poppins: "'Poppins', sans-serif",
            montserrat: "'Montserrat', sans-serif",
        };
        root.style.setProperty('--font-family', fontMap[theme.fontFamily] || fontMap.system);

        // Card style
        root.style.setProperty('--card-radius', theme.cardStyle === 'sharp' ? '0px' : `${theme.radius}px`);
        root.style.setProperty('--card-glass', theme.cardStyle === 'glass' ? 'rgba(255,255,255,0.8)' : 'white');
        root.style.setProperty('--card-backdrop', theme.cardStyle === 'glass' ? 'blur(10px)' : 'none');

        // Button style
        root.style.setProperty('--btn-style', theme.buttonStyle);

        // Dark mode
        if (theme.darkMode) {
            root.classList.add('dark-mode');
        } else {
            root.classList.remove('dark-mode');
        }

        // Animations
        if (!theme.enableAnimations) {
            root.style.setProperty('--transition-base', '0s');
            root.style.setProperty('--transition-fast', '0s');
            root.style.setProperty('--transition-slow', '0s');
        } else {
            root.style.removeProperty('--transition-base');
            root.style.removeProperty('--transition-fast');
            root.style.removeProperty('--transition-slow');
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, loading, refreshTheme: fetchTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
    return ctx;
}