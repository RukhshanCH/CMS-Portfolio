// ============================================
// components/cms/ContentManager.tsx — Multi-Tenant Content Manager
// Generic content manager that works with any content type
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
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

// ─── Types ───

interface ContentField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  defaultValue?: any;
  options?: { label: string; value: string }[];
}

interface ContentConfig {
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
    title: 'Themes',
    table: 'themes',
    getData: getAllThemes,
    updateData: updateTheme,
    createData: createTheme,
    deleteData: deleteTheme,
    fields: [
      { name: 'name', label: 'Theme Name', type: 'text', required: true },
      { name: 'color_primary', label: 'Primary Color', type: 'color' },
      { name: 'color_secondary', label: 'Secondary Color', type: 'color' },
      { name: 'color_accent', label: 'Accent Color', type: 'color' },
      { name: 'color_background', label: 'Background Color', type: 'color' },
      { name: 'color_text', label: 'Text Color', type: 'color' },
      { name: 'color_success', label: 'Success Color', type: 'color' },
      { name: 'color_warning', label: 'Warning Color', type: 'color' },
      { name: 'color_danger', label: 'Danger Color', type: 'color' },
      { name: 'color_featured', label: 'Featured Color', type: 'color' },
      { name: 'border_radius', label: 'Border Radius', type: 'number' },
      { name: 'max_width', label: 'Max Width', type: 'number' },
      { name: 'font_family', label: 'Font Family', type: 'select' },
      { name: 'card_style', label: 'Card Style', type: 'select' },
      { name: 'button_style', label: 'Button Style', type: 'select' },
      { name: 'dark_mode', label: 'Dark Mode', type: 'checkbox' },
      { name: 'enable_animations', label: 'Enable Animations', type: 'checkbox' },
      { name: 'is_active', label: 'Active Theme', type: 'checkbox' },
    ],
  },
  hero: {
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
    title: 'Skills',
    table: 'skills',
    getData: getSkills,
    updateData: updateSkill,
    createData: createSkill,
    deleteData: deleteSkill,
    fields: [
      { name: 'name', label: 'Skill Name', type: 'text', required: true },
      { name: 'level', label: 'Level (e.g. Beginner, Intermediate, Advanced)', type: 'text' },
      { name: 'percentage', label: 'Proficiency % (0-100)', type: 'number' },
      { name: 'is_active', label: 'Active', type: 'checkbox' },
    ],
  },
  contact: {
    title: 'Contact',
    table: 'contact',
    getData: getContact,
    updateData: updateContact,
    fields: [
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'whatsapp_number', label: 'WhatsApp Number', type: 'text' },
      { name: 'whatsapp_default_message', label: 'WhatsApp Default Message', type: 'text' },
      { name: 'form_enabled', label: 'Enable Contact Form', type: 'checkbox' },
      { name: 'form_success_message', label: 'Success Message', type: 'text' },
      { name: 'is_active', label: 'Active', type: 'checkbox' },
    ],
  },
  settings: {
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

    // Build a clean payload from config.fields ONLY
    const processed: Record<string, any> = {};

    config.fields.forEach((field) => {
      let val = raw[field.name];

      if (field.type === 'checkbox') {
        // Force real boolean — never "", undefined, or null
        processed[field.name] = !!val;
      } else if (field.type === 'number') {
        // Empty number inputs become null so DB defaults work
        processed[field.name] =
          val === '' || val === undefined || val === null ? null : Number(val);
      } else if (field.type === 'textarea' || field.type === 'richtext') {
        processed[field.name] = val === '' ? null : val;
      } else {
        // text, color, select, etc.
        processed[field.name] = val === '' ? null : val;
      }
    });

    // Type-specific transformations
    switch (typeName) {
      case 'about':
        if (typeof processed.stats === 'string') {
          try {
            processed.stats = JSON.parse(processed.stats);
          } catch {
            // Invalid JSON — Supabase will reject it
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
            // Invalid JSON — Supabase will reject it
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
            // Leave as string if invalid JSON; DB or API should reject if strict
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

    // Stringify arrays/objects so textareas display valid JSON instead of [object Object]
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
      } else if (f.type === 'checkbox' ? false : f.type === 'number' ? 0 : '') {
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
        // JSON fields: start with a valid empty array string
        empty[f.name] = '[]';
      } else {
        empty[f.name] = '';
      }
    });
    setFormData(empty);
    setSaveError(null);
  }

  async function handleSave() {
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
  }

  async function handleDelete(id: string) {
    if (!config?.deleteData || !portfolioId) return;

    // Replace native confirm with a custom modal in production
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

  function renderField(field: ContentField) {
    const value = formData[field.name];

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            rows={4}
            style={styles.textarea}
          />
        );
      case 'richtext':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            rows={8}
            style={styles.textarea}
            placeholder="Supports markdown..."
          />
        );
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => handleChange(field.name, e.target.checked)}
            style={styles.checkbox}
          />
        );
      case 'color':
        return (
          <div style={styles.colorInputWrapper}>
            <input
              type="color"
              value={value || '#000000'}
              onChange={(e) => handleChange(field.name, e.target.value)}
              style={styles.colorInput}
            />
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              style={{ ...styles.input, flex: 1 }}
            />
          </div>
        );
      case 'number':
        return (
          <input
            type="number"
            value={value ?? 0}
            onChange={(e) => handleChange(field.name, e.target.value)}
            style={styles.input}
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
                : []);

        return (
          <select
            value={value || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            style={styles.select}
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
            style={styles.input}
          />
        );
    }
  }

  if (!config) {
    return (
      <div style={{ padding: '24px' }}>
        <h2 style={{ color: 'var(--color-text, #e2e8f0)' }}>Unknown Content Type</h2>
        <p style={{ color: 'var(--color-text-muted, #94a3b8)' }}>
          The content type "{typeName}" is not configured.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <p style={{ color: 'var(--color-text-muted, #94a3b8)', padding: '24px' }}>
        Loading...
      </p>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={styles.header}>
        <h1 style={styles.title}>{config.title}</h1>
        {config.createData && (
          <button onClick={handleNew} style={styles.newButton}>
            + New {config.title.replace(/s$/, '')}
          </button>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div style={styles.errorBanner}>
          {error}
          <button onClick={() => setError(null)} style={styles.errorClose}>
            ×
          </button>
        </div>
      )}

      {/* Edit Form */}
      {editingId && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>
            {editingId === 'new' ? `Create New ${config.title.replace(/s$/, '')}` : 'Edit'}
          </h3>

          {saveError && <div style={styles.saveError}>{saveError}</div>}

          <div style={styles.formGrid}>
            {config.fields.map((field) => (
              <div key={field.name} style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>
                  {field.label}
                  {field.required && <span style={styles.required}> *</span>}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>
          <div style={styles.formActions}>
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({});
                setSaveError(null);
              }}
              style={styles.cancelBtn}
            >
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} style={styles.saveBtn}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Items List */}
      <div style={styles.list}>
        {items.length === 0 ? (
          <p style={styles.empty}>
            No items yet. Click "New" to create one.
          </p>
        ) : (
          items.map((item) => (
            <div key={item.id} style={styles.itemCard}>
              <div style={styles.itemInfo}>
                <h4 style={styles.itemTitle}>
                  {item.name || item.title || item.site_title || 'Untitled'}
                  {item.is_active === false && (
                    <span style={styles.inactiveBadge}>Inactive</span>
                  )}
                  {item.is_featured && <span style={styles.featuredBadge}>Featured</span>}
                </h4>
                {item.description && (
                  <p style={styles.itemDesc}>{item.description.substring(0, 100)}...</p>
                )}
              </div>
              <div style={styles.itemActions}>
                <button onClick={() => handleEdit(item)} style={styles.editBtn}>
                  Edit
                </button>
                {config.deleteData && (
                  <button onClick={() => handleDelete(item.id)} style={styles.deleteBtn}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Styles ───

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    margin: 0,
    color: 'var(--color-text, #e2e8f0)',
  },
  newButton: {
    padding: '10px 20px',
    borderRadius: '10px',
    border: 'none',
    background: 'var(--color-primary, #3b82f6)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  errorBanner: {
    padding: '12px 16px',
    background: 'var(--danger-bg, rgba(239,68,68,0.1))',
    border: '1px solid var(--danger-border, rgba(239,68,68,0.3))',
    borderRadius: '8px',
    color: 'var(--danger-text, #ef4444)',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorClose: {
    background: 'transparent',
    border: 'none',
    color: 'inherit',
    fontSize: '18px',
    cursor: 'pointer',
    lineHeight: 1,
  },
  saveError: {
    padding: '10px 14px',
    background: 'var(--danger-bg, rgba(239,68,68,0.1))',
    border: '1px solid var(--danger-border, rgba(239,68,68,0.3))',
    borderRadius: '8px',
    color: 'var(--danger-text, #ef4444)',
    marginBottom: '16px',
    fontSize: '14px',
  },
  formCard: {
    padding: '24px',
    background: 'var(--color-surface, #1e293b)',
    borderRadius: '12px',
    border: '1px solid var(--color-gray, #334155)',
    marginBottom: '24px',
  },
  formTitle: {
    fontSize: '18px',
    fontWeight: 600,
    margin: '0 0 20px 0',
    color: 'var(--color-text, #e2e8f0)',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  fieldLabel: {
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--color-text, #e2e8f0)',
  },
  required: {
    color: '#ef4444',
  },
  input: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid var(--color-gray, #334155)',
    background: 'var(--color-background, #0f172a)',
    color: 'var(--color-text, #e2e8f0)',
    fontSize: '14px',
    outline: 'none',
  },
  textarea: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid var(--color-gray, #334155)',
    background: 'var(--color-background, #0f172a)',
    color: 'var(--color-text, #e2e8f0)',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  select: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid var(--color-gray, #334155)',
    background: 'var(--color-background, #0f172a)',
    color: 'var(--color-text, #e2e8f0)',
    fontSize: '14px',
    outline: 'none',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
  },
  colorInputWrapper: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  colorInput: {
    width: '40px',
    height: '40px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    padding: 0,
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid var(--color-gray, #334155)',
    background: 'transparent',
    color: 'var(--color-text-muted, #94a3b8)',
    fontSize: '14px',
    cursor: 'pointer',
  },
  saveBtn: {
    padding: '10px 24px',
    borderRadius: '8px',
    border: 'none',
    background: 'var(--color-primary, #3b82f6)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  empty: {
    padding: '40px',
    textAlign: 'center',
    color: 'var(--color-text-muted, #94a3b8)',
    background: 'var(--color-surface, #1e293b)',
    borderRadius: '12px',
    border: '1px solid var(--color-gray, #334155)',
  },
  itemCard: {
    padding: '16px 20px',
    background: 'var(--color-surface, #1e293b)',
    borderRadius: '10px',
    border: '1px solid var(--color-gray, #334155)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: '15px',
    fontWeight: 600,
    margin: '0 0 4px 0',
    color: 'var(--color-text, #e2e8f0)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  itemDesc: {
    fontSize: '13px',
    color: 'var(--color-text-muted, #94a3b8)',
    margin: 0,
  },
  itemActions: {
    display: 'flex',
    gap: '8px',
  },
  editBtn: {
    padding: '6px 14px',
    borderRadius: '6px',
    border: '1px solid var(--color-primary, #3b82f6)',
    background: 'transparent',
    color: 'var(--color-primary, #3b82f6)',
    fontSize: '13px',
    cursor: 'pointer',
  },
  deleteBtn: {
    padding: '6px 14px',
    borderRadius: '6px',
    border: '1px solid #ef4444',
    background: 'transparent',
    color: '#ef4444',
    fontSize: '13px',
    cursor: 'pointer',
  },
  inactiveBadge: {
    padding: '2px 8px',
    borderRadius: '10px',
    background: 'rgba(148,163,184,0.2)',
    color: '#94a3b8',
    fontSize: '11px',
    fontWeight: 500,
  },
  featuredBadge: {
    padding: '2px 8px',
    borderRadius: '10px',
    background: 'rgba(251,191,36,0.2)',
    color: '#fbbf24',
    fontSize: '11px',
    fontWeight: 500,
  },
};