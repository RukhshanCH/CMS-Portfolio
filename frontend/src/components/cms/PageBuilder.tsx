// ============================================
// components/cms/PageBuilder.tsx — Updated for Multi-Tenant
// Manages site settings and navigation order
// ============================================

import { useState, useEffect } from 'react';
import { useAdmin } from '../../layouts/AdminLayout';
import { updateSiteSettings } from '../../utils/supabase';

const AVAILABLE_SECTIONS = [
  { id: 'hero', label: '🏠 Hero' },
  { id: 'about', label: '👤 About' },
  { id: 'skills', label: '⭐ Skills' },
  { id: 'projects', label: '🚀 Projects' },
  { id: 'contact', label: '📧 Contact' },
];

export default function PageBuilder() {
  const { portfolioId, data, refreshData } = useAdmin();
  const settings = data?.settings;

  const [navOrder, setNavOrder] = useState<string[]>([]);
  const [siteTitle, setSiteTitle] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setNavOrder(settings.nav_order || ['hero', 'about', 'skills', 'projects', 'contact']);
      setSiteTitle(settings.site_title || '');
      setSiteDescription(settings.site_description || '');
    }
  }, [settings]);

  function moveSection(index: number, direction: 'up' | 'down') {
    const newOrder = [...navOrder];
    if (direction === 'up' && index > 0) {
      [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    } else if (direction === 'down' && index < newOrder.length - 1) {
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    }
    setNavOrder(newOrder);
  }

  function toggleSection(sectionId: string) {
    if (navOrder.includes(sectionId)) {
      setNavOrder(navOrder.filter(id => id !== sectionId));
    } else {
      setNavOrder([...navOrder, sectionId]);
    }
  }

  async function handleSave() {
    if (!portfolioId || !settings?.id) return;
    setSaving(true);
    await updateSiteSettings(portfolioId, settings.id, {
      site_title: siteTitle,
      site_description: siteDescription,
      nav_order: navOrder,
    });
    await refreshData();
    setSaving(false);
  }

  return (
    <div>
      <h1 className="inbox-title">📄 Page Builder</h1>
      <p className="inbox-subtitle">Configure site settings and navigation order</p>

      {/* Site Settings */}
      <div className="dashboard-section-wrap">
        <h2 className="section-title-md">Site Settings</h2>
        <div className="form-card">
          <div className="form-group">
            <label className="form-label-sm">Site Title</label>
            <input
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              className="form-input-dark"
              placeholder="My Portfolio"
            />
          </div>
          <div className="form-group">
            <label className="form-label-sm">Site Description</label>
            <textarea
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              className="form-textarea"
              rows={3}
              placeholder="Brief description for SEO..."
            />
          </div>
        </div>
      </div>

      {/* Navigation Order */}
      <div className="dashboard-section-wrap">
        <h2 className="section-title-md">Navigation Order</h2>
        <p className="hint-text">Toggle sections to show/hide them. Drag to reorder (use arrows).</p>

        <div className="nav-list">
          {AVAILABLE_SECTIONS.map((section) => {
            const isEnabled = navOrder.includes(section.id);
            const index = navOrder.indexOf(section.id);

            return (
              <div
                key={section.id}
                className={`nav-item ${isEnabled ? 'nav-item-enabled' : 'nav-item-disabled'}`}
              >
                <div className="nav-item-left">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={`toggle-btn ${isEnabled ? 'toggle-btn-on' : 'toggle-btn-off'}`}
                  >
                    {isEnabled ? '✓' : '○'}
                  </button>
                  <span className="nav-label">{section.label}</span>
                </div>

                {isEnabled && (
                  <div className="nav-controls">
                    <span className="order-num">#{index + 1}</span>
                    <button
                      onClick={() => moveSection(index, 'up')}
                      disabled={index === 0}
                      className="move-btn"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveSection(index, 'down')}
                      disabled={index === navOrder.length - 1}
                      className="move-btn"
                    >
                      ↓
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="btn btn-primary btn-block"
      >
        {saving ? 'Saving...' : '💾 Save Changes'}
      </button>
    </div>
  );
}