import React, { useEffect, useState, useCallback } from 'react';
import type { Project } from '../types';

interface Alert {
  type: 'success' | 'error';
  text: string;
}

const API_URL = 'http://localhost:3001/api/projects';

// ─── COMPONENT ───

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Delete mode state
  const [isDeleteMode, ] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Alert
  const [alert, setAlert] = useState<Alert | null>(null);

  const showAlert = useCallback((type: 'success' | 'error', text: string) => {
    setAlert({ type, text });
    setTimeout(() => setAlert(null), 3500);
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch');
      const data: Project[] = await res.json();
      setProjects(data);
    } catch {
      showAlert('error', 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ─── RENDER ───

  return (
    <section id="projects" className="projects section">
      <div className="container">
        {/* Toolbar */}
        <div className="projects-toolbar">
          <h2 className="section-title">Featured Projects</h2>
        </div>

        {/* Alert */}
        {alert && (
          <div className={`alert alert-${alert.type}`}>
            {alert.text}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <p className="loading-text">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="empty-state">No projects yet.</p>
        ) : (
          <div className="projects-grid">
            {projects.map((project, index) => (
              <article
                key={project._id}
                className={`project-card ${isDeleteMode && selectedIds.has(project._id) ? 'selected-delete' : ''}`}
              >
                {/* Delete Checkbox */}
                {isDeleteMode && (
                  <label className="delete-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(project._id)}
                      onChange={() => toggleSelection(project._id)}
                    />
                    <span>Select</span>
                  </label>
                )}

                {/* Image */}
                <div className="project-image">
                  {project.imageUrl ? (
                    <img src={project.imageUrl} alt={project.title} />
                  ) : (
                    <div className="image-placeholder">
                      <span>Project {index + 1}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="project-content">
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>

                  <div className="project-tags">
                    {(project.technologies || []).map((tag: string, idx: number) => (
                      <span key={idx} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="project-links">
                    <div className="project-links-left">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          className="link-primary"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Live Demo →
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          className="link-secondary"
                          target="_blank"
                          rel="noreferrer"
                        >
                          GitHub
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects;