// ============================================
// pages/PublicPortfolio.tsx — Public Portfolio View
// No auth required. Reads slug from URL.
// ============================================

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicPortfolio, getWhatsAppLink } from '../utils/supabase';
import type { PortfolioData } from '../utils/supabase';
import { applyThemeVariables } from '../context/ThemeContext';

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
    } catch (err: any) {
      console.error(err);
      setError('Failed to load portfolio.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={styles.loader}>
        <div className="spinner" />
        <p>Loading portfolio...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={styles.loader}>
        <h2 style={styles.errorTitle}>Portfolio Not Found</h2>
        <p style={styles.errorText}>{error}</p>
      </div>
    );
  }

  const { portfolio, hero, about, skills, projects, contact, settings } = data;

  // Derive skill percentage from level
  const LEVEL_TO_PERCENTAGE: Record<string, number> = {
    Beginner: 25,
    Intermediate: 50,
    Advanced: 75,
    Expert: 100,
  };

  return (
    <div
      style={{
        ...styles.container,
        fontFamily: 'var(--font-family, system-ui)',
        color: 'var(--color-text, #334155)',
        background: 'var(--color-background, #ffffff)',
      }}
    >
      <title>{settings?.site_title || portfolio?.title || 'Portfolio'}</title>

      {/* HERO SECTION */}
      {hero && (
        <section
          style={{
            ...styles.hero,
            backgroundImage: hero.background_image
              ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${hero.background_image})`
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div style={styles.heroContent}>
            <p style={styles.greeting}>{hero.greeting || 'Hello, I am'}</p>
            <h1 style={styles.heroName}>{hero.name}</h1>
            <p style={styles.heroSub}>{hero.subtitle}</p>

            {Array.isArray(hero.buttons) && hero.buttons.length > 0 && (
              <div style={styles.heroButtons}>
                {hero.buttons.map((btn: any, i: number) => (
                  <a
                    key={i}
                    href={btn.link || '#'}
                    style={{
                      ...styles.ctaButton,
                      ...(btn.variant === 'outline' && styles.ctaOutline),
                    }}
                  >
                    {btn.text}
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ABOUT SECTION */}
      {about && (
        <section style={styles.section} id="about">
          <h2 style={styles.sectionTitle}>{about.heading || 'About Me'}</h2>
          <div style={styles.aboutContent}>
            {about.image_url && (
              <img
                src={about.image_url}
                alt="About"
                style={styles.aboutImage}
              />
            )}
            <div>
              {about.bio &&
                about.bio.split(/\n\n+/).map((para: string, i: number) => (
                  <p key={i} style={styles.aboutText}>
                    {para}
                  </p>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* SKILLS SECTION */}
      {skills.length > 0 && (
        <section style={styles.section} id="skills">
          <h2 style={styles.sectionTitle}>Skills</h2>
          <div style={styles.skillsGrid}>
            {skills.map((skill) => {
              const pct =
                LEVEL_TO_PERCENTAGE[skill.level as string] ?? 50;
              return (
                <div key={skill.id} style={styles.skillCard}>
                  <span style={styles.skillName}>{skill.name}</span>
                  <span style={styles.skillLevel}>{skill.level}</span>
                  <div style={styles.skillBar}>
                    <div
                      style={{
                        ...styles.skillFill,
                        width: `${pct}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* PROJECTS SECTION */}
      {projects.length > 0 && (
        <section style={styles.section} id="projects">
          <h2 style={styles.sectionTitle}>Projects</h2>
          <div style={styles.projectsGrid}>
            {projects.map((project) => (
              <div key={project.id} style={styles.projectCard}>
                {(project.image_url ||
                  (project.images && project.images[0])) && (
                    <img
                      src={project.image_url || project.images?.[0]}
                      alt={project.title}
                      style={styles.projectImage}
                    />
                  )}
                <div style={styles.projectInfo}>
                  <h3 style={styles.projectTitle}>{project.title}</h3>
                  <p style={styles.projectDesc}>{project.description}</p>
                  {project.category && (
                    <span style={styles.projectCategory}>
                      {project.category}
                    </span>
                  )}
                  {Array.isArray(project.technologies) &&
                    project.technologies.length > 0 && (
                      <div style={styles.techStack}>
                        {project.technologies.map((tech: string, i: number) => (
                          <span key={i} style={styles.techTag}>
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  <div style={styles.projectLinks}>
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.link}
                      >
                        Live Demo →
                      </a>
                    )}
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.link}
                      >
                        GitHub →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CONTACT SECTION */}
      {contact && (
        <section style={styles.section} id="contact">
          <h2 style={styles.sectionTitle}>
            {contact.heading || 'Get In Touch'}
          </h2>
          <p style={styles.contactSub}>{contact.description}</p>

          <div style={styles.contactGrid}>
            <div style={styles.contactInfo}>
              {contact.email && (
                <p style={styles.contactItem}>📧 {contact.email}</p>
              )}
              {contact.phone && (
                <p style={styles.contactItem}>📞 {contact.phone}</p>
              )}
              {contact.location && (
                <p style={styles.contactItem}>📍 {contact.location}</p>
              )}

              {/* Social Links */}
              {([
                { url: contact.linkedin_url, label: 'LinkedIn' },
                { url: contact.github_url, label: 'GitHub' },
                { url: contact.twitter_url, label: 'Twitter' },
                { url: contact.instagram_url, label: 'Instagram' },
                { url: contact.facebook_url, label: 'Facebook' },
                { url: contact.reddit_url, label: 'Reddit' },
                { url: contact.youtube_url, label: 'YouTube' },
                { url: contact.dribbble_url, label: 'Dribbble' },
                { url: contact.behance_url, label: 'Behance' },
              ].filter((s) => !!s.url) as { url: string; label: string }[]).length > 0 && (
                  <div style={styles.socialLinks}>
                    {(
                      [
                        { url: contact.linkedin_url, label: 'LinkedIn' },
                        { url: contact.github_url, label: 'GitHub' },
                        { url: contact.twitter_url, label: 'Twitter' },
                        { url: contact.instagram_url, label: 'Instagram' },
                        { url: contact.facebook_url, label: 'Facebook' },
                        { url: contact.reddit_url, label: 'Reddit' },
                        { url: contact.youtube_url, label: 'YouTube' },
                        { url: contact.dribbble_url, label: 'Dribbble' },
                        { url: contact.behance_url, label: 'Behance' },
                      ].filter((s) => !!s.url) as {
                        url: string;
                        label: string;
                      }[]
                    ).map((s) => (
                      <a
                        key={s.label}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.socialLink}
                      >
                        {s.label}
                      </a>
                    ))}
                  </div>
                )}

              {contact.whatsapp_number && (
                <a
                  href={getWhatsAppLink(
                    contact.whatsapp_number,
                    contact.whatsapp_message
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.whatsappBtn}
                >
                  💬 Message on WhatsApp
                </a>
              )}
            </div>

            {contact.form_enabled && (
              <ContactForm portfolioId={portfolio!.id} />
            )}
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          © {new Date().getFullYear()} {portfolio?.title}. Built with Portfolio
          CMS.
        </p>
      </footer>
    </div>
  );
}

// Contact Form Component
function ContactForm({ portfolioId }: { portfolioId: string }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { submitContactForm } = await import('../utils/supabase');
    await submitContactForm(
      portfolioId,
      formData.name,
      formData.email,
      formData.message,
      formData.subject
    );
    setSubmitting(false);
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  }

  if (submitted) {
    return (
      <div style={styles.successMessage}>
        <p>✅ Thank you! Your message has been sent.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={styles.contactForm}>
      <input
        placeholder="Your Name"
        value={formData.name}
        onChange={(e) =>
          setFormData({ ...formData, name: e.target.value })
        }
        required
        style={styles.formInput}
      />
      <input
        type="email"
        placeholder="Your Email"
        value={formData.email}
        onChange={(e) =>
          setFormData({ ...formData, email: e.target.value })
        }
        required
        style={styles.formInput}
      />
      <input
        placeholder="Subject (optional)"
        value={formData.subject}
        onChange={(e) =>
          setFormData({ ...formData, subject: e.target.value })
        }
        style={styles.formInput}
      />
      <textarea
        placeholder="Your Message"
        value={formData.message}
        onChange={(e) =>
          setFormData({ ...formData, message: e.target.value })
        }
        required
        rows={5}
        style={{ ...styles.formInput, resize: 'vertical' }}
      />
      <button
        type="submit"
        disabled={submitting}
        style={styles.submitButton}
      >
        {submitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  loader: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    background: 'var(--color-background, #0f172a)',
    color: 'var(--color-text-muted, #94a3b8)',
  },
  errorTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: 'var(--color-danger, #ef4444)',
    margin: '0 0 8px 0',
  },
  errorText: {
    color: 'var(--color-text-muted, #94a3b8)',
  },
  container: {
    minHeight: '100vh',
    maxWidth: 'var(--max-width, 1200px)',
    margin: '0 auto',
    padding: '0 24px',
  },
  hero: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80vh',
    gap: '48px',
    padding: '60px 0',
    borderRadius: 'var(--radius-lg, 16px)',
    marginTop: '24px',
  },
  heroContent: {
    flex: 1,
    textAlign: 'center',
  },
  greeting: {
    fontSize: '18px',
    color: 'var(--color-primary, #3b82f6)',
    fontWeight: 500,
    margin: '0 0 12px 0',
  },
  heroName: {
    fontSize: '56px',
    fontWeight: 800,
    margin: '0 0 16px 0',
    lineHeight: 1.1,
    color: 'var(--color-text, #1e293b)',
  },
  heroSub: {
    fontSize: '17px',
    lineHeight: 1.7,
    color: 'var(--color-text-muted, #64748b)',
    margin: '0 0 32px 0',
    maxWidth: '600px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  heroButtons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  ctaButton: {
    display: 'inline-block',
    padding: '14px 32px',
    borderRadius: 'var(--radius, 12px)',
    background: 'var(--color-primary, #3b82f6)',
    color: '#fff',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: 600,
  },
  ctaOutline: {
    background: 'transparent',
    border: '2px solid var(--color-primary, #3b82f6)',
    color: 'var(--color-primary, #3b82f6)',
  },
  section: {
    padding: '80px 0',
    borderTop: '1px solid var(--color-gray, #e2e8f0)',
  },
  sectionTitle: {
    fontSize: '36px',
    fontWeight: 700,
    margin: '0 0 40px 0',
    textAlign: 'center',
    color: 'var(--color-text, #1e293b)',
  },
  aboutContent: {
    display: 'flex',
    gap: '48px',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  aboutImage: {
    width: '300px',
    height: '300px',
    objectFit: 'cover',
    borderRadius: 'var(--radius-lg, 16px)',
    flexShrink: 0,
  },
  aboutText: {
    fontSize: '16px',
    lineHeight: 1.8,
    margin: '0 0 16px 0',
    color: 'var(--color-text, #334155)',
  },
  skillsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  skillCard: {
    padding: '20px',
    background: 'var(--color-surface, #f8fafc)',
    borderRadius: 'var(--radius, 12px)',
    border: '1px solid var(--color-gray, #e2e8f0)',
  },
  skillName: {
    fontSize: '15px',
    fontWeight: 600,
    marginBottom: '4px',
    display: 'block',
    color: 'var(--color-text, #1e293b)',
  },
  skillLevel: {
    fontSize: '13px',
    color: 'var(--color-text-muted, #64748b)',
    marginBottom: '12px',
    display: 'block',
    textTransform: 'capitalize',
  },
  skillBar: {
    height: '8px',
    background: 'var(--color-gray, #e2e8f0)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  skillFill: {
    height: '100%',
    borderRadius: '4px',
    background: 'var(--color-primary, #3b82f6)',
    transition: 'width 1s ease',
  },
  projectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '24px',
  },
  projectCard: {
    background: 'var(--color-surface, #f8fafc)',
    borderRadius: 'var(--radius-lg, 16px)',
    overflow: 'hidden',
    border: '1px solid var(--color-gray, #e2e8f0)',
  },
  projectImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  projectInfo: {
    padding: '20px',
  },
  projectTitle: {
    fontSize: '18px',
    fontWeight: 700,
    margin: '0 0 8px 0',
    color: 'var(--color-text, #1e293b)',
  },
  projectDesc: {
    fontSize: '14px',
    lineHeight: 1.6,
    color: 'var(--color-text-muted, #64748b)',
    margin: '0 0 12px 0',
  },
  projectCategory: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '6px',
    background: 'var(--color-accent-soft, #a6ffc5)',
    color: 'var(--color-text, #1e293b)',
    fontSize: '12px',
    fontWeight: 600,
    marginBottom: '12px',
  },
  techStack: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '16px',
  },
  techTag: {
    padding: '4px 10px',
    borderRadius: '6px',
    background: 'var(--color-primary, #3b82f6)',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 500,
  },
  projectLinks: {
    display: 'flex',
    gap: '16px',
  },
  link: {
    color: 'var(--color-primary, #3b82f6)',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
  },
  contactSub: {
    textAlign: 'center',
    color: 'var(--color-text-muted, #64748b)',
    margin: '-24px 0 40px 0',
    fontSize: '16px',
  },
  contactGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '48px',
    maxWidth: '900px',
    margin: '0 auto',
  },
  contactInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  contactItem: {
    fontSize: '16px',
    margin: 0,
    color: 'var(--color-text, #334155)',
  },
  socialLinks: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginTop: '8px',
  },
  socialLink: {
    padding: '8px 14px',
    borderRadius: '8px',
    background: 'var(--color-surface, #f8fafc)',
    border: '1px solid var(--color-gray, #e2e8f0)',
    color: 'var(--color-text, #334155)',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 500,
  },
  whatsappBtn: {
    display: 'inline-block',
    padding: '12px 24px',
    borderRadius: '10px',
    background: '#22c55e',
    color: '#fff',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 600,
    marginTop: '8px',
  },
  contactForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  formInput: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid var(--color-gray, #e2e8f0)',
    background: 'var(--color-surface, #f8fafc)',
    fontSize: '15px',
    outline: 'none',
    color: 'var(--color-text, #334155)',
  },
  submitButton: {
    padding: '14px',
    borderRadius: '10px',
    border: 'none',
    background: 'var(--color-primary, #3b82f6)',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  successMessage: {
    padding: '40px',
    textAlign: 'center',
    background: 'var(--success-bg, rgba(34,197,94,0.1))',
    borderRadius: '12px',
    color: 'var(--success-text, #22c55e)',
    fontSize: '16px',
    fontWeight: 500,
  },
  footer: {
    padding: '40px 0',
    textAlign: 'center',
    borderTop: '1px solid var(--color-gray, #e2e8f0)',
  },
  footerText: {
    fontSize: '14px',
    color: 'var(--color-text-muted, #64748b)',
    margin: 0,
  },
};