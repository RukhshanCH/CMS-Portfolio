import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '../utils/supabase';
import type { Theme } from '../utils/supabase';

// ─── CSS VARIABLES INJECTOR ───

export function applyThemeVariables(theme: Theme | null) {
    if (!theme) return;

    const root = document.documentElement;
    const isDark = !!theme.dark_mode;

    // ─── Core Colors ───
    root.style.setProperty('--primary', theme.color_primary);
    root.style.setProperty('--color-primary', theme.color_primary);
    root.style.setProperty('--primary-dark', theme.color_primary);
    root.style.setProperty('--secondary', theme.color_secondary);
    root.style.setProperty('--color-secondary', theme.color_secondary);
    root.style.setProperty('--accent', theme.color_accent || theme.color_secondary);
    root.style.setProperty('--color-accent', theme.color_accent || theme.color_secondary);
    root.style.setProperty(
        '--accent-light',
        `color-mix(in srgb, ${theme.color_accent || theme.color_secondary} 30%, transparent)`
    );
    root.style.setProperty('--accent-soft', theme.color_accent_soft || '#bbf7d0');
    root.style.setProperty('--accent-bg', theme.color_accent_bg || '#f0fdf4');
    root.style.setProperty('--dark', theme.color_dark || '#1e1b4b');
    root.style.setProperty('--color-dark', theme.color_dark || '#1e1b4b');
    root.style.setProperty('--light', theme.color_light || '#ffffff');
    root.style.setProperty('--color-light', theme.color_light || '#ffffff');
    root.style.setProperty('--gray', theme.color_gray || '#e2e8f0');
    root.style.setProperty('--color-gray', theme.color_gray || '#334155');
    root.style.setProperty('--gray-warm', theme.color_gray_warm || '#f1f5f9');
    root.style.setProperty('--text', theme.color_text || '#334155');
    root.style.setProperty(
        '--color-text',
        isDark ? theme.color_light || '#e2e8f0' : theme.color_text || '#334155'
    );
    root.style.setProperty('--text-light', theme.color_text_muted || '#64748b');
    root.style.setProperty(
        '--color-text-muted',
        isDark ? '#94a3b8' : theme.color_text_muted || '#64748b'
    );

    // ─── Semantic Colors ───
    root.style.setProperty('--success', theme.color_success || '#22c55e');
    root.style.setProperty('--color-success', theme.color_success || '#22c55e');
    root.style.setProperty(
        '--success-bg',
        `color-mix(in srgb, ${theme.color_success || '#22c55e'} 10%, white)`
    );
    root.style.setProperty('--success-text', theme.color_success || '#22c55e');
    root.style.setProperty(
        '--success-border',
        `color-mix(in srgb, ${theme.color_success || '#22c55e'} 30%, white)`
    );
    root.style.setProperty('--warning', theme.color_warning || '#f59e0b');
    root.style.setProperty('--color-warning', theme.color_warning || '#f59e0b');
    root.style.setProperty('--warning-dark', theme.color_warning || '#f59e0b');
    root.style.setProperty(
        '--warning-bg',
        `color-mix(in srgb, ${theme.color_warning || '#f59e0b'} 10%, white)`
    );
    root.style.setProperty('--warning-text', theme.color_warning || '#f59e0b');
    root.style.setProperty('--danger', theme.color_danger || '#ef4444');
    root.style.setProperty('--color-danger', theme.color_danger || '#ef4444');
    root.style.setProperty('--danger-dark', theme.color_danger || '#ef4444');
    root.style.setProperty(
        '--danger-darker',
        `color-mix(in srgb, ${theme.color_danger || '#ef4444'} 70%, black)`
    );
    root.style.setProperty(
        '--danger-bg',
        `color-mix(in srgb, ${theme.color_danger || '#ef4444'} 10%, white)`
    );
    root.style.setProperty('--danger-text', theme.color_danger || '#ef4444');
    root.style.setProperty(
        '--danger-border',
        `color-mix(in srgb, ${theme.color_danger || '#ef4444'} 30%, white)`
    );
    root.style.setProperty('--featured', theme.color_featured || '#fbbf24');
    root.style.setProperty('--featured-glow', theme.color_featured || '#fbbf24');

    // ─── Dark Mode Classes ───
    if (isDark) {
        root.style.setProperty('--dm-bg', theme.color_dark || '#0f172a');
        root.style.setProperty(
            '--dm-bg-secondary',
            `color-mix(in srgb, ${theme.color_dark || '#0f172a'} 80%, ${theme.color_light || '#fff'})`
        );
        root.style.setProperty('--dm-text', theme.color_light || '#e2e8f0');
        root.style.setProperty('--dm-text-light', theme.color_text_muted || '#94a3b8');
        document.documentElement.classList.add('dark-mode', 'dark');
    } else {
        root.style.setProperty('--dm-bg', '#0f172a');
        root.style.setProperty('--dm-bg-secondary', '#1e293b');
        root.style.setProperty('--dm-text', '#e2e8f0');
        root.style.setProperty('--dm-text-light', '#94a3b8');
        document.documentElement.classList.remove('dark-mode', 'dark');
    }

    // ─── Layout ───
    const borderRadius = Number(theme.border_radius) || 12;
    root.style.setProperty('--radius', `${borderRadius}px`);
    root.style.setProperty('--radius-sm', `${Math.max(4, borderRadius - 6)}px`);
    root.style.setProperty('--radius-md', `${Math.max(6, borderRadius - 4)}px`);
    root.style.setProperty('--radius-lg', `${Math.max(8, borderRadius - 2)}px`);
    root.style.setProperty('--radius-pill', '999px');
    root.style.setProperty('--radius-circle', '50%');
    root.style.setProperty('--max-width', `${theme.max_width || 1200}px`);

    // ─── Typography ───
    const fontMap: Record<string, string> = {
        system: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        inter: "'Inter', -apple-system, sans-serif",
        roboto: "'Roboto', sans-serif",
        poppins: "'Poppins', sans-serif",
        montserrat: "'Montserrat', sans-serif",
        serif: "Georgia, 'Times New Roman', serif",
        mono: "'Fira Code', 'Consolas', monospace",
    };
    root.style.setProperty('--font-family', fontMap[theme.font_family] || fontMap.system);

    // ─── Gradients ───
    const gradDir = theme.gradient_direction || '135deg';
    root.style.setProperty('--gradient-direction', gradDir);
    root.style.setProperty(
        '--gradient-primary',
        `linear-gradient(${gradDir}, ${theme.color_primary}, ${theme.color_secondary})`
    );
    root.style.setProperty(
        '--gradient-primary-accent',
        `linear-gradient(90deg, ${theme.color_primary}, ${theme.color_accent || theme.color_secondary})`
    );
    root.style.setProperty(
        '--gradient-danger',
        `linear-gradient(${gradDir}, ${theme.color_danger || '#ef4444'}, ${theme.color_danger || '#ef4444'})`
    );
    root.style.setProperty(
        '--gradient-danger-hover',
        `linear-gradient(${gradDir}, ${theme.color_danger || '#ef4444'}, color-mix(in srgb, ${theme.color_danger || '#ef4444'} 70%, black))`
    );
    root.style.setProperty(
        '--gradient-warning',
        `linear-gradient(${gradDir}, ${theme.color_warning || '#f59e0b'}, ${theme.color_warning || '#f59e0b'})`
    );
    root.style.setProperty(
        '--gradient-accent',
        `linear-gradient(135deg, ${theme.color_accent_soft || '#bbf7d0'}, ${theme.color_accent_bg || '#f0fdf4'})`
    );
    root.style.setProperty(
        '--gradient-skill',
        `linear-gradient(90deg, ${theme.color_primary}, ${theme.color_accent || theme.color_secondary})`
    );
    root.style.setProperty(
        '--gradient-dark',
        `linear-gradient(180deg, ${theme.color_dark || '#1e1b4b'} 0%, color-mix(in srgb, ${theme.color_dark || '#1e1b4b'} 80%, ${theme.color_light || '#fff'}) 100%)`
    );
    root.style.setProperty(
        '--gradient-light',
        `linear-gradient(180deg, ${theme.color_light || '#fff'} 0%, ${theme.color_accent_bg || '#f0fdf4'} 100%)`
    );

    // ─── Component Tokens ───
    root.style.setProperty('--card-radius', `${theme.border_radius || 12}px`);
    root.style.setProperty('--card-glass', isDark ? 'rgba(255,255,255,0.05)' : 'white');
    root.style.setProperty('--card-backdrop', theme.card_style === 'glass' ? 'blur(10px)' : 'none');
    root.style.setProperty('--card-border', `1px solid ${theme.color_accent_soft || '#e2e8f0'}`);
    root.style.setProperty('--btn-style', theme.button_style || 'gradient');
    root.style.setProperty(
        '--focus-ring',
        `0 0 0 3px color-mix(in srgb, ${theme.color_accent || theme.color_secondary} 20%, transparent)`
    );
    root.style.setProperty(
        '--focus-ring-danger',
        `0 0 0 4px color-mix(in srgb, ${theme.color_danger || '#ef4444'} 15%, transparent)`
    );
    root.style.setProperty('--backdrop-blur', 'blur(10px)');
    root.style.setProperty('--backdrop-blur-sm', 'blur(4px)');
}

// ─── CONTEXT ───

interface ThemeContextType {
    theme: Theme | null;
    loading: boolean;
    refreshTheme: () => Promise<void>;
    applyTheme: (theme: Theme | null) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: null,
    loading: true,
    refreshTheme: async () => { },
    applyTheme: () => { },
});

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme | null>(null);
    const [loading, setLoading] = useState(true);

    const applyTheme = useCallback((themeData: Theme | null) => {
        applyThemeVariables(themeData);
        setTheme(themeData);
    }, []);

    const refreshTheme = useCallback(async () => {
        try {
            const { data } = await supabase
                .from('themes')
                .select('*')
                .eq('is_active', true)
                .maybeSingle();
            if (data) {
                applyTheme(data as Theme);
            }
        } catch (err) {
            console.error('Failed to refresh theme:', err);
        } finally {
            setLoading(false);
        }
    }, [applyTheme]);

    useEffect(() => {
        refreshTheme();
    }, [refreshTheme]);

    return (
        <ThemeContext.Provider value={{ theme, loading, refreshTheme, applyTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
    return ctx;
}