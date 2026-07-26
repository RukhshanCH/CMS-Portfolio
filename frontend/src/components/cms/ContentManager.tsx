// ============================================
// components/cms/ContentManager.tsx — Multi-Tenant Content Manager
// Generic content manager that works with any content type
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAdmin } from '../../layouts/AdminLayout';
import {
  getProjects,
  getSkills,
  getContact,
  getHero,
  getAbout,
  getSiteSettings,
  getAllThemes,
  updateProject,
  createTheme,
  deleteTheme,
  updateSkill,
  updateContact,
  updateHero,
  updateAbout,
  updateSiteSettings,
  updateTheme,
  createProject,
  createSkill,
  deleteProject,
  deleteSkill,
} from '../../utils/supabase';

import ThemePreview from './ThemePreview';
import GenericContentPreview from './GenericContentPreview';

// ─── Types ───

interface ContentField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  defaultValue?: any;
  options?: string[] | { label: string; value: string }[];
}

interface ContentConfig {
  name: string;
  title: string;
  table: string;
  getData: (portfolioId: string) => Promise<any>;
  updateData: (portfolioId: string, id: string, data: any) => Promise<boolean>;
  createData?: (portfolioId: string, data: any) => Promise<any>;
  deleteData?: (portfolioId: string, id: string) => Promise<boolean>;
  fields: ContentField[];
}

// ─── Content Type Configurations ───

const CONTENT_CONFIG: Record<string, ContentConfig> = {
  theme: {
    name: 'theme',
    title: 'Themes',
    table: 'themes',
    getData: getAllThemes,
    updateData: updateTheme,
    createData: createTheme,
    deleteData: deleteTheme,
    fields: [
      { name: 'name', label: 'Theme Name', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text' },
      { name: 'color_primary', label: 'Primary Color', type: 'color' },
      { name: 'color_secondary', label: 'Secondary Color', type: 'color' },
      { name: 'color_accent', label: 'Accent Color', type: 'color' },
      { name: 'color_accent_soft', label: 'Accent Soft', type: 'color' },
      { name: 'color_accent_bg', label: 'Accent Background', type: 'color' },
      { name: 'color_dark', label: 'Dark Color', type: 'color' },
      { name: 'color_light', label: 'Light Color', type: 'color' },
      { name: 'color_gray', label: 'Gray', type: 'color' },
      { name: 'color_gray_warm', label: 'Warm Gray', type: 'color' },
      { name: 'color_text', label: 'Text Color', type: 'color' },
      { name: 'color_text_muted', label: 'Muted Text Color', type: 'color' },
      { name: 'color_success', label: 'Success Color', type: 'color' },
      { name: 'color_warning', label: 'Warning Color', type: 'color' },
      { name: 'color_danger', label: 'Danger Color', type: 'color' },
      { name: 'color_featured', label: 'Featured Color', type: 'color' },
      { name: 'border_radius', label: 'Border Radius', type: 'number' },
      { name: 'max_width', label: 'Max Width', type: 'number' },
      { name: 'font_family', label: 'Font Family', type: 'select' },
      { name: 'gradient_direction', label: 'Gradient Direction', type: 'text' },
      { name: 'card_style', label: 'Card Style', type: 'select' },
      { name: 'button_style', label: 'Button Style', type: 'select' },
      { name: 'dark_mode', label: 'Dark Mode', type: 'checkbox' },
      { name: 'enable_animations', label: 'Enable Animations', type: 'checkbox' },
      { name: 'is_active', label: 'Active Theme', type: 'checkbox' },
      { name: 'is_featured', label: 'Featured', type: 'checkbox' },
      { name: 'order_index', label: 'Order Index', type: 'number' },
    ],
  },
  hero: {
    name: 'hero',
    title: 'Hero Section',
    table: 'hero',
    getData: getHero,
    updateData: updateHero,
    fields: [
      { name: 'greeting', label: 'Greeting', type: 'text' },
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea' },
      { name: 'background_image', label: 'Background Image URL', type: 'text' },
      {
        name: 'buttons',
        label: 'Buttons (JSON Array)',
        type: 'textarea',
        defaultValue: JSON.stringify([
          { text: 'View Projects', link: '/projects', variant: 'primary' },
          { text: 'Contact Me', link: '/contact', variant: 'outline' },
        ], null, 2),
      },
      { name: 'is_active', label: 'Active', type: 'checkbox' },
    ],
  },
  about: {
    name: 'about',
    title: 'About Section',
    table: 'about',
    getData: getAbout,
    updateData: updateAbout,
    fields: [
      { name: 'heading', label: 'Heading', type: 'text', required: true },
      { name: 'bio', label: 'Bio (separate paragraphs with blank lines)', type: 'textarea' },
      { name: 'image_url', label: 'Profile Image URL', type: 'text' },
      { name: 'stats', label: 'Stats (JSON Array)', type: 'textarea' },
      { name: 'is_active', label: 'Active', type: 'checkbox' },
    ],
  },
  project: {
    name: 'projects',
    title: 'Projects',
    table: 'projects',
    getData: getProjects,
    updateData: updateProject,
    createData: createProject,
    deleteData: deleteProject,
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text' },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'description', label: 'Short Description', type: 'textarea' },
      { name: 'long_description', label: 'Long Description', type: 'richtext' },
      { name: 'technologies', label: 'Technologies (comma separated)', type: 'text' },
      { name: 'featured', label: 'Featured', type: 'checkbox' },
      { name: 'images', label: 'Image Gallery (JSON Array)', type: 'textarea' },
      { name: 'image_url', label: 'Primary Image URL', type: 'text' },
      { name: 'live_url', label: 'Live URL', type: 'text' },
      { name: 'github_url', label: 'GitHub URL', type: 'text' },
      { name: 'insta_url', label: 'Instagram URL', type: 'text' },
      { name: 'fb_url', label: 'Facebook URL', type: 'text' },
      { name: 'behance_url', label: 'Behance URL', type: 'text' },
      { name: 'linkedin_url', label: 'LinkedIn URL', type: 'text' },
      { name: 'reddit_url', label: 'Reddit URL', type: 'text' },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { label: 'In Progress', value: 'in_progress' },
          { label: 'Completed', value: 'completed' },
          { label: 'Archived', value: 'archived' },
          { label: 'Planned', value: 'planned' },
        ],
      },
      { name: 'display_order', label: 'Display Order', type: 'number' },
      { name: 'is_active', label: 'Active', type: 'checkbox' },
    ],
  },
  skill: {
    name: 'skill',
    title: 'Skills',
    table: 'skills',
    getData: getSkills,
    updateData: updateSkill,
    createData: createSkill,
    deleteData: deleteSkill,
    fields: [
      { name: 'name', label: 'Skill Name', type: 'text', required: true },
      {
        name: 'level',
        label: 'Level',
        type: 'select',
        options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      },
      { name: 'is_active', label: 'Active', type: 'checkbox' },
    ],
  },
  contact: {
    name: 'contact',
    title: 'Contact',
    table: 'contact',
    getData: getContact,
    updateData: updateContact,
    fields: [
      { name: 'heading', label: 'Heading', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'whatsapp_number', label: 'WhatsApp Number', type: 'text' },
      { name: 'whatsapp_message', label: 'WhatsApp Default Message', type: 'text' },
      { name: 'linkedin_url', label: 'LinkedIn URL', type: 'text' },
      { name: 'github_url', label: 'GitHub URL', type: 'text' },
      { name: 'twitter_url', label: 'Twitter URL', type: 'text' },
      { name: 'instagram_url', label: 'Instagram URL', type: 'text' },
      { name: 'facebook_url', label: 'Facebook URL', type: 'text' },
      { name: 'reddit_url', label: 'Reddit URL', type: 'text' },
      { name: 'youtube_url', label: 'YouTube URL', type: 'text' },
      { name: 'dribbble_url', label: 'Dribbble URL', type: 'text' },
      { name: 'behance_url', label: 'Behance URL', type: 'text' },
      { name: 'form_enabled', label: 'Enable Contact Form', type: 'checkbox' },
      { name: 'form_success_message', label: 'Success Message', type: 'text' },
      { name: 'is_active', label: 'Active', type: 'checkbox' },
    ],
  },
  settings: {
    name: 'settings',
    title: 'Site Settings',
    table: 'site_settings',
    getData: getSiteSettings,
    updateData: updateSiteSettings,
    fields: [
      { name: 'site_title', label: 'Site Title', type: 'text', required: true },
      { name: 'site_description', label: 'Site Description', type: 'textarea' },
      { name: 'favicon_url', label: 'Favicon URL', type: 'text' },
      { name: 'og_image_url', label: 'OG Image URL', type: 'text' },
      { name: 'nav_order', label: 'Navigation Order (JSON)', type: 'textarea' },
    ],
  },
};

// ─── Component ───
interface ContentManagerProps {
  defaultTypeName?: string;
}

interface PreviewState {
  isOpen: boolean;
  item: Record<string, unknown> | null;
  contentType: string;
}

export default function ContentManager({ defaultTypeName }: ContentManagerProps) {
  const { typeName: paramTypeName } = useParams<{ typeName: string }>();
  const typeName = defaultTypeName || paramTypeName;
  const { portfolioId, refreshData } = useAdmin();

  const config = typeName ? CONTENT_CONFIG[typeName] : null;

  const [items, setItems] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [preview, setPreview] = useState<PreviewState>({
    isOpen: false,
    item: null,
    contentType: '',
  });

  const handlePreview = (item: Record<string, unknown>, contentType: string) => {
    setPreview({ isOpen: true, item, contentType });
  };

  const closePreview = () => {
    setPreview({ isOpen: false, item: null, contentType: '' });
  };

  useEffect(() => {
    if (preview.isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closePreview();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [preview.isOpen]);

  const loadData = useCallback(async () => {
    if (!config || !portfolioId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await config.getData(portfolioId);
      setItems(Array.isArray(data) ? data : data ? [data] : []);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load content.');
    } finally {
      setLoading(false);
    }
  }, [config, portfolioId]);

  useEffect(() => {
    if (config && portfolioId) {
      loadData();
    } else if (!typeName) {
      setLoading(false);
    }
  }, [typeName, portfolioId, config, loadData]);

  function validateForm(): string | null {
    if (!config) return 'Unknown content type.';
    const missing = config.fields.filter((f) => {
      if (!f.required) return false;
      const val = formData[f.name];
      return val === undefined || val === null || val === '';
    });
    if (missing.length > 0) {
      return `Please fill in required fields: ${missing.map((f) => f.label).join(', ')}`;
    }
    return null;
  }

  function processFormData(raw: Record<string, any>): Record<string, any> {
    if (!config) return raw;

    const processed: Record<string, any> = {};

    config.fields.forEach((field) => {
      let val = raw[field.name];

      if (field.type === 'checkbox') {
        processed[field.name] = !!val;
      } else if (field.type === 'number') {
        processed[field.name] =
          val === '' || val === undefined || val === null ? null : Number(val);
      } else if (field.type === 'textarea' || field.type === 'richtext') {
        processed[field.name] = val === '' ? null : val;
      } else {
        processed[field.name] = val === '' ? null : val;
      }
    });

    switch (typeName) {
      case 'about':
        if (typeof processed.stats === 'string') {
          try {
            processed.stats = JSON.parse(processed.stats);
          } catch {
            /* invalid JSON — Supabase will reject */
          }
        }
        break;

      case 'project':
        if (typeof processed.technologies === 'string') {
          processed.technologies = processed.technologies
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean);
        }
        if (typeof processed.images === 'string') {
          try {
            processed.images = JSON.parse(processed.images);
          } catch {
            /* invalid JSON — Supabase will reject */
          }
        }
        if (processed.display_order !== undefined && processed.display_order !== '') {
          processed.display_order = Number(processed.display_order);
        }
        break;

      case 'settings':
        if (typeof processed.nav_order === 'string' && processed.nav_order.trim()) {
          try {
            processed.nav_order = JSON.parse(processed.nav_order);
          } catch {
            /* leave as string */
          }
        }
        break;

      case 'theme':
        if (processed.border_radius !== undefined && processed.border_radius !== '') {
          processed.border_radius = Number(processed.border_radius);
        }
        if (processed.max_width !== undefined && processed.max_width !== '') {
          processed.max_width = Number(processed.max_width);
        }
        break;

      case 'skill':
        if (processed.proficiency !== undefined && processed.proficiency !== '') {
          processed.proficiency = Number(processed.proficiency);
        }
        if (processed.display_order !== undefined && processed.display_order !== '') {
          processed.display_order = Number(processed.display_order);
        }
        break;

      default:
        break;
    }

    return processed;
  }

  function handleEdit(item: any) {
    const editable: Record<string, any> = { ...item };

    Object.keys(editable).forEach((key) => {
      const val = editable[key];
      if (Array.isArray(val) || (val !== null && typeof val === 'object' && !(val instanceof Date))) {
        editable[key] = JSON.stringify(val, null, 2);
      }
    });

    setEditingId(item.id);
    setFormData(editable);
    setSaveError(null);
  }

  function handleNew() {
    setEditingId('new');
    const empty: Record<string, any> = {};
    config?.fields.forEach((f) => {
      if (f.defaultValue !== undefined) {
        empty[f.name] = f.defaultValue;
      } else if (f.type === 'checkbox') {
        empty[f.name] = false;
      } else if (f.type === 'number') {
        empty[f.name] = null;
      } else if (
        f.name === 'buttons' ||
        f.name === 'stats' ||
        f.name === 'images' ||
        f.name === 'nav_order' ||
        f.name === 'social_links'
      ) {
        empty[f.name] = '[]';
      } else {
        empty[f.name] = '';
      }
    });
    setFormData(empty);
    setSaveError(null);
  }

  const handleSave = useCallback(async () => {
    if (!config || !portfolioId) return;

    const validationError = validateForm();
    if (validationError) {
      setSaveError(validationError);
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const processed = processFormData(formData);

      if (editingId === 'new' && config.createData) {
        await config.createData(portfolioId, processed);
      } else if (editingId) {
        await config.updateData(portfolioId, editingId, processed);
      }

      await loadData();
      await refreshData();
      setEditingId(null);
      setFormData({});
    } catch (err: any) {
      console.error('Save failed:', err);
      setSaveError(err?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [setSaveError, config, portfolioId, editingId, formData, validateForm, loadData, refreshData]);

  async function handleDelete(id: string) {
    if (!config?.deleteData || !portfolioId) return;

    const confirmed = window.confirm('Are you sure you want to delete this item?');
    if (!confirmed) return;

    try {
      await config.deleteData(portfolioId, id);
      await loadData();
      await refreshData();
    } catch (err: any) {
      console.error('Delete failed:', err);
      setError(err?.message || 'Failed to delete item.');
    }
  }

  function handleChange(field: string, value: any) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  useEffect(() => {
    if (!editingId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEditingId(null);
        setFormData({});
        setSaveError(null);
      }
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingId, handleSave]);

  function renderField(field: ContentField) {
    const value = formData[field.name];

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            rows={4}
            className="form-textarea"
          />
        );
      case 'richtext':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            rows={8}
            className="form-textarea"
            placeholder="Supports markdown..."
          />
        );
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => handleChange(field.name, e.target.checked)}
            className="form-checkbox-input"
          />
        );
      case 'color':
        return (
          <div className="color-field">
            <input
              type="color"
              value={value || '#000000'}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="color-picker"
            />
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="form-input-dark"
            />
          </div>
        );
      case 'number':
        return (
          <input
            type="number"
            value={value ?? 0}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className="form-input-dark"
          />
        );
      case 'select': {
        const options =
          field.options ??
          (field.name === 'font_family'
            ? ['system', 'inter', 'roboto', 'poppins', 'montserrat']
            : field.name === 'card_style'
              ? ['rounded', 'sharp', 'glass']
              : field.name === 'button_style'
                ? ['gradient', 'solid', 'outline', 'glow']
                : field.name === 'level'
                  ? ['Beginner', 'Intermediate', 'Advanced', 'Expert']
                  : []);

        return (
          <select
            value={value || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className="form-select"
          >
            <option value="" disabled>
              — Select {field.label} —
            </option>
            {options.map((opt) => {
              const label = typeof opt === 'string' ? opt : opt.label;
              const val = typeof opt === 'string' ? opt : opt.value;
              return (
                <option key={val} value={val}>
                  {label}
                </option>
              );
            })}
          </select>
        );
      }
      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className="form-input-dark"
          />
        );
    }
  }

  if (!config) {
    return (
      <div className="content-manager">
        <h2 className="content-title">Unknown Content Type</h2>
        <p className="text-dim">
          The content type "{typeName}" is not configured.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="content-manager">
        <p className="text-dim">Loading...</p>
      </div>
    );
  }

  return (
    <div className="content-manager">
      <div className="content-header">
        <h1 className="content-title">{config.title}</h1>
        {config.createData && (
          <button onClick={handleNew} className="btn-new">
            + New {config.title.replace(/s$/, '')}
          </button>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="alert alert-error alert-dismissible">
          {error}
          <button onClick={() => setError(null)} className="btn-close-alert">
            ×
          </button>
        </div>
      )}

      {/* Edit Form */}
      {editingId && (
        <form
          className="form-card"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <h3 className="form-title">
            {editingId === 'new' ? `Create New ${config.title.replace(/s$/, '')}` : 'Edit'}
          </h3>

          {saveError && <div className="alert alert-error">{saveError}</div>}

          <div className="form-grid">
            {config.fields.map((field) => (
              <div key={field.name} className="form-group">
                <label className="form-label-sm">
                  {field.label}
                  {field.required && <span className="required-mark"> *</span>}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>
          <div className="modal-actions-row">
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setFormData({});
                setSaveError(null);
              }}
              className="btn-modal-cancel"
            >
              Cancel
            </button>
            <button type='submit' disabled={saving} className="btn-modal-submit">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      )}

      {/* Items List */}
      <div className="items-list">
        {items.length === 0 ? (
          <div className="empty-state-box">
            No items yet. Click "New" to create one.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="item-card">
              <div className="item-info">
                <h4 className="item-title">
                  {item.name || item.title || item.site_title || 'Untitled'}
                  {item.is_active === false && (
                    <span className="badge-inactive">Inactive</span>
                  )}
                  {item.is_featured && <span className="badge-featured-sm">Featured</span>}
                </h4>
                {item.description && (
                  <p className="item-desc">{item.description.substring(0, 100)}...</p>
                )}
              </div>
              <div className="item-actions">
                <button onClick={() => handleEdit(item)} className="btn-outline-primary-sm">
                  Edit
                </button>
                {config.deleteData && (
                  <button onClick={() => handleDelete(item.id)} className="btn-outline-danger-sm">
                    Delete
                  </button>
                )}
                <button
                  onClick={() => handlePreview(item, config.name || 'content')}
                  className="btn-preview-sm"
                >
                  Preview
                </button>
              </div>
            </div>
          ))
        )}
        {preview.isOpen && preview.item && (
          <div className="modal-overlay" onClick={closePreview}>
            <div className="modal-content-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-sticky">
                <h3>Preview: {String(preview.item.name || preview.item.title || 'Content')}</h3>
                <button onClick={closePreview} className="btn-close-modal">×</button>
              </div>

              <div className="modal-body">
                {preview.contentType === 'theme' ? (
                  <ThemePreview previewData={preview.item as any} />
                ) : (
                  <GenericContentPreview item={preview.item} type={preview.contentType} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}