// ============================================
// pages/PublicPortfolio.tsx — Public Portfolio View
// No auth required. Reads slug from URL.
// ============================================

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicPortfolio } from '../utils/supabase';
import { applyThemeVariables } from '../context/ThemeContext';
import type { PortfolioData } from '../utils/supabase';

import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Projects from '../components/Projects';
import Skills from '../components/Skills';
import Contact from '../components/Contact';
import Loader from '../components/Loader';

export default function PublicPortfolio() {
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

  if (loading) {
    return <Loader fullPage />;
  }

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

  const { hero, about, skills, projects, contact, settings } = data;
  const title =  settings?.site_title || data.portfolio?.title + ' Portfolio' || 'Portfolio';

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