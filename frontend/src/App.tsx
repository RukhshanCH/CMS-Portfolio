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
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from './utils/supabase';
import type { PortfolioData } from './utils/supabase';
import { getPublicPortfolio, getSession } from './utils/supabase';

// ─── THEME (centralized) ───
import { ThemeProvider, applyThemeVariables } from './context/ThemeContext';

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
  const [theme, setTheme] = useState<any>(null);
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
        applyThemeVariables(themeData as any);
        setTheme(themeData);
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

  // Redirect /admin/:id to /admin/:id/dashboard
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