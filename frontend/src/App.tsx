// ============================================
// App.tsx — Complete Multi-Tenant Portfolio CMS
// Public portfolio view + Auth + Dashboard + Admin + Invites
// ============================================

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
  useLocation,
} from 'react-router-dom';
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { supabase } from './utils/supabase';
import type { Theme, PortfolioData } from './utils/supabase';
import { getPublicPortfolio, getSession } from './utils/supabase';

// ─── COMPONENTS ───
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Contact from './components/Contact';
import Loader from './components/Loader';

// ─── PAGES ───
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import InvitePage from './pages/InvitePage';

// ─── ADMIN ───
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './components/cms/AdminDashboard';
import ContentManager from './components/cms/ContentManager';
import ContentTypeBuilder from './components/cms/ContentTypeBuilder';
import PageBuilder from './components/cms/PageBuilder';
import MembersPage from './admin/MembersPage';
import InboxPage from './admin/InboxPage';

import './App.css';

// ─── THEME CONTEXT ───

interface ThemeContextType {
  theme: Theme | null;
  loading: boolean;
  refreshTheme: () => Promise<void>;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: null,
  loading: true,
  refreshTheme: async () => { },
});

export const useTheme = () => useContext(ThemeContext);

// ─── PORTFOLIO CONTEXT ───

interface PortfolioContextType {
  portfolioId: string | null;
}

export const PortfolioContext = createContext<PortfolioContextType>({
  portfolioId: null,
});

export const usePortfolio = () => useContext(PortfolioContext);

// Helper: build absolute admin paths (prevents URL stacking)
export function useAdminPath(section: string = '') {
  const { portfolioId } = usePortfolio();
  if (!portfolioId) return '/dashboard';
  return section ? `/admin/${portfolioId}/${section}` : `/admin/${portfolioId}`;
}

// ─── CSS VARIABLES INJECTOR ───

function applyThemeVariables(theme: Theme | null) {
  if (!theme) return;

  const root = document.documentElement;
  const isDark = !!theme.dark_mode;

  // ─── Explicit Background / Surface (new DB columns) ───
  // Use DB values if present; otherwise derive from dark/light mode
  const backgroundColor = theme.color_background || (isDark ? theme.color_dark || '#0f172a' : theme.color_light || '#ffffff');
  const surfaceColor = theme.color_surface || (isDark ? '#1e293b' : theme.color_light || '#f8fafc');

  root.style.setProperty('--color-background', backgroundColor);
  root.style.setProperty('--color-surface', surfaceColor);

  // ─── Core Colors (legacy + normalized) ───
  root.style.setProperty('--primary', theme.color_primary);
  root.style.setProperty('--color-primary', theme.color_primary);
  root.style.setProperty('--primary-dark', theme.color_primary);
  root.style.setProperty('--secondary', theme.color_secondary);
  root.style.setProperty('--color-secondary', theme.color_secondary);
  root.style.setProperty('--accent', theme.color_accent || theme.color_secondary);
  root.style.setProperty('--color-accent', theme.color_accent || theme.color_secondary);
  root.style.setProperty('--accent-light', `color-mix(in srgb, ${theme.color_accent || theme.color_secondary} 30%, transparent)`);
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
  root.style.setProperty('--color-text', isDark ? (theme.color_light || '#e2e8f0') : (theme.color_text || '#334155'));
  root.style.setProperty('--text-light', theme.color_text_muted || '#64748b');
  root.style.setProperty('--color-text-muted', isDark ? '#94a3b8' : (theme.color_text_muted || '#64748b'));

  // ─── Semantic Colors ───
  root.style.setProperty('--success', theme.color_success || '#22c55e');
  root.style.setProperty('--color-success', theme.color_success || '#22c55e');
  root.style.setProperty('--success-bg', `color-mix(in srgb, ${theme.color_success || '#22c55e'} 10%, white)`);
  root.style.setProperty('--success-text', theme.color_success || '#22c55e');
  root.style.setProperty('--success-border', `color-mix(in srgb, ${theme.color_success || '#22c55e'} 30%, white)`);
  root.style.setProperty('--warning', theme.color_warning || '#f59e0b');
  root.style.setProperty('--color-warning', theme.color_warning || '#f59e0b');
  root.style.setProperty('--warning-dark', theme.color_warning || '#f59e0b');
  root.style.setProperty('--warning-bg', `color-mix(in srgb, ${theme.color_warning || '#f59e0b'} 10%, white)`);
  root.style.setProperty('--warning-text', theme.color_warning || '#f59e0b');
  root.style.setProperty('--danger', theme.color_danger || '#ef4444');
  root.style.setProperty('--color-danger', theme.color_danger || '#ef4444');
  root.style.setProperty('--danger-dark', theme.color_danger || '#ef4444');
  root.style.setProperty('--danger-darker', `color-mix(in srgb, ${theme.color_danger || '#ef4444'} 70%, black)`);
  root.style.setProperty('--danger-bg', `color-mix(in srgb, ${theme.color_danger || '#ef4444'} 10%, white)`);
  root.style.setProperty('--danger-text', theme.color_danger || '#ef4444');
  root.style.setProperty('--danger-border', `color-mix(in srgb, ${theme.color_danger || '#ef4444'} 30%, white)`);
  root.style.setProperty('--featured', theme.color_featured || '#fbbf24');
  root.style.setProperty('--featured-glow', theme.color_featured || '#fbbf24');

  // ─── Dark Mode Classes ───
  if (isDark) {
    root.style.setProperty('--dm-bg', theme.color_dark || '#0f172a');
    root.style.setProperty('--dm-bg-secondary', `color-mix(in srgb, ${theme.color_dark || '#0f172a'} 80%, ${theme.color_light || '#fff'})`);
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
  root.style.setProperty('--gradient-primary', `linear-gradient(${gradDir}, ${theme.color_primary}, ${theme.color_secondary})`);
  root.style.setProperty('--gradient-primary-accent', `linear-gradient(90deg, ${theme.color_primary}, ${theme.color_accent || theme.color_secondary})`);
  root.style.setProperty('--gradient-danger', `linear-gradient(${gradDir}, ${theme.color_danger || '#ef4444'}, ${theme.color_danger || '#ef4444'})`);
  root.style.setProperty('--gradient-danger-hover', `linear-gradient(${gradDir}, ${theme.color_danger || '#ef4444'}, color-mix(in srgb, ${theme.color_danger || '#ef4444'} 70%, black))`);
  root.style.setProperty('--gradient-warning', `linear-gradient(${gradDir}, ${theme.color_warning || '#f59e0b'}, ${theme.color_warning || '#f59e0b'})`);
  root.style.setProperty('--gradient-accent', `linear-gradient(135deg, ${theme.color_accent_soft || '#bbf7d0'}, ${theme.color_accent_bg || '#f0fdf4'})`);
  root.style.setProperty('--gradient-skill', `linear-gradient(90deg, ${theme.color_primary}, ${theme.color_accent || theme.color_secondary})`);
  root.style.setProperty('--gradient-dark', `linear-gradient(180deg, ${theme.color_dark || '#1e1b4b'} 0%, color-mix(in srgb, ${theme.color_dark || '#1e1b4b'} 80%, ${theme.color_light || '#fff'}) 100%)`);
  root.style.setProperty('--gradient-light', `linear-gradient(180deg, ${theme.color_light || '#fff'} 0%, ${theme.color_accent_bg || '#f0fdf4'} 100%)`);

  // ─── Component Tokens ───
  root.style.setProperty('--card-radius', `${theme.border_radius || 12}px`);
  root.style.setProperty('--card-glass', isDark ? 'rgba(255,255,255,0.05)' : 'white');
  root.style.setProperty('--card-backdrop', theme.card_style === 'glass' ? 'blur(10px)' : 'none');
  root.style.setProperty('--card-border', `1px solid ${theme.color_accent_soft || '#e2e8f0'}`);
  root.style.setProperty('--btn-style', theme.button_style || 'gradient');
  root.style.setProperty('--focus-ring', `0 0 0 3px color-mix(in srgb, ${theme.color_accent || theme.color_secondary} 20%, transparent)`);
  root.style.setProperty('--focus-ring-danger', `0 0 0 4px color-mix(in srgb, ${theme.color_danger || '#ef4444'} 15%, transparent)`);
  root.style.setProperty('--backdrop-blur', 'blur(10px)');
  root.style.setProperty('--backdrop-blur-sm', 'blur(4px)');
}

// ─── AUTH GUARD ───

function RequireAuth({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  useEffect(() => {
    let mounted = true;

    getSession().then((session) => {
      if (!mounted) return;
      setAuthState(session ? 'authenticated' : 'unauthenticated');
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        setAuthState(session ? 'authenticated' : 'unauthenticated');
      } else if (event === 'SIGNED_OUT') {
        setAuthState('unauthenticated');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (authState === 'loading') {
    return <Loader fullPage />;
  }

  if (authState === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// ─── THEME PROVIDER ───

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshTheme = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('themes')
        .select('*')
        .eq('is_active', true)
        .single();
      if (data) {
        applyThemeVariables(data as Theme);
        setTheme(data as Theme);
      }
    } catch (err) {
      console.error('Failed to refresh theme:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTheme();
  }, [refreshTheme]);

  return (
    <ThemeContext.Provider value={{ theme, loading, refreshTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── PUBLIC PORTFOLIO VIEWER ───

function PublicPortfolioViewer() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPortfolio();
  }, [slug]);

  async function loadPortfolio() {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const portfolioData = await getPublicPortfolio(slug);
      if (!portfolioData) {
        setError('Portfolio not found or not published.');
      } else {
        setData(portfolioData);
        if (portfolioData.theme) {
          applyThemeVariables(portfolioData.theme);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load portfolio.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loader fullPage />;
  if (error || !data) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          background: 'var(--color-background, #0f172a)',
          color: 'var(--color-text, #e2e8f0)',
        }}
      >
        <h2 style={{ color: 'var(--color-danger, #ef4444)' }}>Portfolio Not Found</h2>
        <p style={{ color: 'var(--color-text-muted, #94a3b8)' }}>{error}</p>
      </div>
    );
  }

  const { theme, hero, about, skills, projects, contact } = data;
  const title = theme?.name || data.portfolio?.title || 'Portfolio';

  return (
    <div className="app" style={{ fontFamily: 'var(--font-family)' }}>
      <title>{title}</title>
      <Navbar />
      <main>
        <Hero data={hero as any} />
        <About data={about as any} />
        <Projects items={projects as any} />
        <Skills items={skills as any} />
        <Contact data={contact as any} />
      </main>
      <footer className="footer">
        <p>
          © {new Date().getFullYear()} {title}. Built with Portfolio CMS.
        </p>
      </footer>
    </div>
  );
}

// ─── HOME PAGE (Default Portfolio) ───

function HomePage() {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [hero, setHero] = useState<unknown>(null);
  const [about, setAbout] = useState<unknown>(null);
  const [projects, setProjects] = useState<unknown[]>([]);
  const [skills, setSkills] = useState<unknown[]>([]);
  const [contact, setContact] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHomeData();
  }, []);

  async function loadHomeData() {
    try {
      // Multi-tenant: fetch the first published portfolio as default
      const { data: portfolios, error: portfolioError } = await supabase
        .from('portfolios')
        .select('id, title')
        .eq('is_published', true)
        .order('created_at', { ascending: true })
        .limit(1);

      if (portfolioError) throw portfolioError;

      const defaultPortfolio = portfolios?.[0];
      if (!defaultPortfolio) {
        setError('No published portfolios found.');
        setLoading(false);
        return;
      }

      const pid = defaultPortfolio.id;

      const [
        { data: themeData, error: themeErr },
        { data: heroData, error: heroErr },
        { data: aboutData, error: aboutErr },
        { data: projectsData, error: projectsErr },
        { data: skillsData, error: skillsErr },
        { data: contactData, error: contactErr },
      ] = await Promise.all([
        supabase.from('themes').select('*').eq('portfolio_id', pid).eq('is_active', true).single(),
        supabase.from('hero').select('*').eq('portfolio_id', pid).eq('is_active', true).single(),
        supabase.from('about').select('*').eq('portfolio_id', pid).eq('is_active', true).single(),
        supabase
          .from('projects')
          .select('*')
          .eq('portfolio_id', pid)
          .eq('is_active', true)
          .order('display_order', { ascending: true }),
        supabase
          .from('skills')
          .select('*')
          .eq('portfolio_id', pid)
          .eq('is_active', true)
          .order('created_at', { ascending: true }),
        supabase.from('contact').select('*').eq('portfolio_id', pid).eq('is_active', true).single(),
      ]);

      // Log individual errors but don't fail entirely
      if (themeErr) console.warn('Theme fetch error:', themeErr);
      if (heroErr) console.warn('Hero fetch error:', heroErr);
      if (aboutErr) console.warn('About fetch error:', aboutErr);
      if (projectsErr) console.warn('Projects fetch error:', projectsErr);
      if (skillsErr) console.warn('Skills fetch error:', skillsErr);
      if (contactErr) console.warn('Contact fetch error:', contactErr);

      if (themeData) {
        applyThemeVariables(themeData as Theme);
        setTheme(themeData as Theme);
      }
      setHero(heroData || null);
      setAbout(aboutData || null);
      setProjects(projectsData || []);
      setSkills(skillsData || []);
      setContact(contactData || null);
    } catch (err) {
      console.error('Failed to load home data:', err);
      setError('Failed to load portfolio data.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loader fullPage />;
  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          background: 'var(--color-background, #0f172a)',
          color: 'var(--color-text, #e2e8f0)',
        }}
      >
        <h2 style={{ color: 'var(--color-danger, #ef4444)' }}>Error</h2>
        <p style={{ color: 'var(--color-text-muted, #94a3b8)' }}>{error}</p>
      </div>
    );
  }

  const title = theme?.name || 'Portfolio';

  return (
    <div className="app" style={{ fontFamily: 'var(--font-family)' }}>
      <title>{title}</title>
      <Navbar />
      <main>
        <Hero data={hero as any} />
        <About data={about as any} />
        <Projects items={projects as any} />
        <Skills items={skills as any} />
        <Contact data={contact as any} />
      </main>
      <footer className="footer">
        <p>
          © {new Date().getFullYear()} {title}. Built with Portfolio CMS.
        </p>
      </footer>
    </div>
  );
}

// ─── ADMIN ROUTES ───

function AdminRoutes() {
  const { portfolioId } = useParams<{ portfolioId: string }>();
  const location = useLocation();

  // Redirect /admin/:id to /admin/:id/hero
  if (location.pathname === `/admin/${portfolioId}`) {
    return <Navigate to={`/admin/${portfolioId}/dashboard`} replace />;
  }

  return (
    <PortfolioContext.Provider value={{ portfolioId: portfolioId || null }}>
      <RequireAuth>
        <AdminLayout>
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="hero" element={<ContentManager defaultTypeName="hero" />} />
            <Route path="about" element={<ContentManager defaultTypeName="about" />} />
            <Route path="skills" element={<ContentManager defaultTypeName="skill" />} />
            <Route path="projects" element={<ContentManager defaultTypeName="project" />} />
            <Route path="theme" element={<ContentManager defaultTypeName="theme" />} />
            <Route path="contact" element={<ContentManager defaultTypeName="contact" />} />

            <Route path="settings" element={<ContentTypeBuilder />} />
            <Route path="content/:typeName" element={<ContentManager />} />
            <Route path="pages" element={<PageBuilder />} />
            <Route path="members" element={<MembersPage />} />
            <Route path="inbox" element={<InboxPage />} />
          </Routes>
        </AdminLayout>
      </RequireAuth>
    </PortfolioContext.Provider>
  );
}

// ─── APP ───

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/portfolio/:slug" element={<PublicPortfolioViewer />} />
          <Route path="/invite/:token" element={<InvitePage />} />

          {/* Auth */}
          <Route path="/login" element={<AuthPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardPage />
              </RequireAuth>
            }
          />

          {/* Admin — Portfolio-scoped */}
          <Route path="/admin/:portfolioId/*" element={<AdminRoutes />} />

          {/* Legacy admin redirect */}
          <Route path="/admin" element={<Navigate to="/dashboard" replace />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}