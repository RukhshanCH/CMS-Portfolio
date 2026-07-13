import React, { useEffect, useState, useCallback } from 'react';
import type { Project } from '../types';

// ─── TYPES ───

interface FormState {
  title: string;
  description: string;
  category: string;
  technologies: string;
  imageUrl: string;
  liveUrl: string;
  githubUrl: string;
  featured: boolean;
  order: string;
}

interface Alert {
  type: 'success' | 'error';
  text: string;
}

const API_URL = 'http://localhost:3001/api/projects';

const emptyForm: FormState = {
  title: '',
  description: '',
  category: '',
  technologies: '',
  imageUrl: '',
  liveUrl: '',
  githubUrl: '',
  featured: false,
  order: '',
};

// ─── COMPONENT ───

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Delete mode state
  const [isDeleteMode, setIsDeleteMode] = useState(false);
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

  // ─── MODAL HELPERS ───

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingId(project._id);
    setForm({
      title: project.title,
      description: project.description || '',
      category: project.category || '',
      technologies: (project.technologies || []).join(', '),
      imageUrl: project.imageUrl || '',
      liveUrl: project.liveUrl || '',
      githubUrl: project.githubUrl || '',
      featured: project.featured || false,
      order: project.order?.toString() || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload: Record<string, unknown> = {
      title: form.title,
      description: form.description || undefined,
      category: form.category || undefined,
      technologies: form.technologies.split(',').map((t) => t.trim()).filter(Boolean),
      imageUrl: form.imageUrl || undefined,
      liveUrl: form.liveUrl || undefined,
      githubUrl: form.githubUrl || undefined,
      featured: form.featured,
      order: form.order ? Number(form.order) : 0,
    };

    if (!editingId) payload.createdAt = new Date().toISOString();

    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    try {
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Request failed');

      showAlert('success', editingId ? 'Project updated!' : 'Project added!');
      closeModal();
      await fetchProjects();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      showAlert('error', msg);
    } finally {
      setSaving(false);
    }
  };

  // ─── DELETE MODE ───

  const toggleDeleteMode = () => {
    setIsDeleteMode((prev) => {
      if (prev) setSelectedIds(new Set());
      return !prev;
    });
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === projects.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(projects.map((p) => p._id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    const confirmed = window.confirm(
      `Delete ${selectedIds.size} project(s)? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const deletePromises = Array.from(selectedIds).map((id) =>
        fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      );
      await Promise.all(deletePromises);
      showAlert('success', `${selectedIds.size} project(s) deleted!`);
      setSelectedIds(new Set());
      setIsDeleteMode(false);
      await fetchProjects();
    } catch {
      showAlert('error', 'Failed to delete some projects');
    }
  };

  // ─── RENDER ───

  return (
    <section id="projects" className="projects section">
      <div className="container">
        {/* Toolbar */}
        <div className="projects-toolbar">
          <h2 className="section-title">Featured Projects</h2>

          <div className="toolbar-actions">
            {!isDeleteMode ? (
              <>
                <button onClick={openAddModal} className="btn-admin btn-add">
                  + Add Project
                </button>
                <button onClick={toggleDeleteMode} className="btn-admin btn-delete">
                  Delete Projects
                </button>
              </>
            ) : (
              <>
                <button onClick={selectAll} className="btn-admin btn-select">
                  {selectedIds.size === projects.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedIds.size === 0}
                  className="btn-admin btn-delete-confirm"
                >
                  Delete Selected ({selectedIds.size})
                </button>
                <button onClick={toggleDeleteMode} className="btn-admin btn-cancel">
                  Cancel
                </button>
              </>
            )}
          </div>
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
          <p className="empty-state">No projects yet. Add one!</p>
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
                    {!isDeleteMode && (
                      <button onClick={() => openEditModal(project)} className="btn-edit-card">
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* ─── MODAL ─── */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editingId ? 'Edit Project' : 'Add New Project'}</h2>
              <button onClick={closeModal} className="modal-close">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <input
                  className="form-input"
                  name="title"
                  placeholder="Title *"
                  value={form.title}
                  onChange={handleFormChange}
                  required
                />
                <input
                  className="form-input"
                  name="category"
                  placeholder="Category"
                  value={form.category}
                  onChange={handleFormChange}
                />
              </div>

              <input
                className="form-input"
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleFormChange}
              />

              <div className="form-row">
                <input
                  className="form-input"
                  name="technologies"
                  placeholder="Tech (comma separated)"
                  value={form.technologies}
                  onChange={handleFormChange}
                />
                <input
                  className="form-input"
                  name="order"
                  type="number"
                  placeholder="Display Order"
                  value={form.order}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-row">
                <input
                  className="form-input"
                  name="imageUrl"
                  placeholder="Image URL"
                  value={form.imageUrl}
                  onChange={handleFormChange}
                />
                <input
                  className="form-input"
                  name="liveUrl"
                  placeholder="Live URL"
                  value={form.liveUrl}
                  onChange={handleFormChange}
                />
              </div>

              <input
                className="form-input"
                name="githubUrl"
                placeholder="GitHub URL"
                value={form.githubUrl}
                onChange={handleFormChange}
              />

              <label className="form-checkbox">
                <input
                  type="checkbox"
                  name="featured"
                  checked={form.featured}
                  onChange={handleFormChange}
                />
                <span>Featured Project</span>
              </label>

              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="btn-admin btn-cancel">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-admin btn-add"
                >
                  {saving ? 'Saving...' : editingId ? 'Update Project' : 'Add Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Projects;