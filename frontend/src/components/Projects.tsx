import { useEffect, useState, useMemo } from 'react';
import type { ContentItem } from '../index';

const API_URL = 'http://localhost:3001/api/content/project?status=published&sort=order';

export default function Projects() {
  const [projects, setProjects] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: ContentItem[]) => setProjects(data))
      .catch((err) => console.error('Failed to load projects:', err))
      .finally(() => setLoading(false));
  }, []);

  // Extract unique categories from project data
  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      const cat = String((p.data as Record<string, unknown>).category || '').trim();
      if (cat) set.add(cat);
    });
    return ['All', ...Array.from(set).sort()];
  }, [projects]);

  // Filtered projects
  const filtered = useMemo(() => {
    if (activeCategory === 'All') return projects;
    return projects.filter((p) => {
      const cat = String((p.data as Record<string, unknown>).category || '').trim();
      return cat === activeCategory;
    });
  }, [projects, activeCategory]);

  if (loading) {
    return (
      <section className="projects section">
        <div className="container">
          <p className="loading-text">Loading projects...</p>
        </div>
      </section>
    );
  }

  if (projects.length === 0) {
    return (
      <section id="projects" className="projects section">
        <div className="container">
          <h2 className="section-title">Featured Projects</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>
            No projects yet.{' '}
            <a href="/admin/content/project" style={{ color: 'var(--primary)' }}>
              Add some in the admin panel
            </a>
            .
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="projects section">
      <div className="container">
        <h2 className="section-title">Featured Projects</h2>

        {/* ─── CATEGORY FILTER ─── */}
        {categories.length > 1 && (
          <div className="project-filters">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`filter-chip ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="projects-grid">
          {filtered.map((project, index) => {
            const d = project.data as Record<string, unknown>;
            const title = String(d.title || 'Untitled');
            const description = String(d.description || '');
            const technologies = (d.technologies as string[]) || [];
            const imageUrl = d.imageUrl ? String(d.imageUrl) : d.imageurl ? String(d.imageurl) : null;
            const liveUrl = d.liveUrl ? String(d.liveUrl) : d.liveurl ? String(d.liveurl) : null;
            const githubUrl = d.githubUrl ? String(d.githubUrl) : d.githuburl ? String(d.githuburl) : null;
            const category = String(d.category || '');

            return (
              <article key={project._id} className="project-card">
                <div className="project-image">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const placeholder = document.createElement('div');
                        placeholder.className = 'image-placeholder';
                        placeholder.innerHTML = `<span>Project ${index + 1}</span>`;
                        target.parentElement?.appendChild(placeholder);
                      }}
                    />
                  ) : (
                    <div className="image-placeholder">
                      <span>Project {index + 1}</span>
                    </div>
                  )}
                  {category && <span className="project-category-badge">{category}</span>}
                </div>
                <div className="project-content">
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <div className="project-tags">
                    {technologies.map((tag: string, idx: number) => (
                      <span key={idx} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="project-links">
                    {liveUrl && (
                      <a href={liveUrl} className="link-primary" target="_blank" rel="noreferrer">
                        Live Demo →
                      </a>
                    )}
                    {githubUrl && (
                      <a href={githubUrl} className="link-secondary" target="_blank" rel="noreferrer">
                        GitHub
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {filtered.length === 0 && activeCategory !== 'All' && (
          <p className="empty-state" style={{ marginTop: '2rem' }}>
            No projects in <strong>{activeCategory}</strong> category.
          </p>
        )}
      </div>
    </section>
  );
}