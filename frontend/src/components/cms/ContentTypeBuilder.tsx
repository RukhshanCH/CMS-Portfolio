// ============================================
// components/cms/ContentTypeBuilder.tsx — Updated for Multi-Tenant
// Simplified version since Supabase uses typed tables, not dynamic content types
// This page now shows a reference of available content types and their fields
// ============================================

import { useAdmin } from '../../layouts/AdminLayout';

const CONTENT_TYPES = [
  {
    name: 'theme',
    label: 'Theme',
    icon: '🎨',
    description: 'Manage colors, fonts, spacing, and visual style',
    fields: ['name', 'color_primary', 'color_secondary', 'color_accent', 'border_radius', 'font_family', 'dark_mode'],
  },
  {
    name: 'hero',
    label: 'Hero',
    icon: '🏠',
    description: 'Landing section with greeting, name, headline',
    fields: ['greeting', 'name', 'headline', 'subheadline', 'cta_text', 'image_url'],
  },
  {
    name: 'about',
    label: 'About',
    icon: '👤',
    description: 'Bio, profile image, and personal details',
    fields: ['title', 'content', 'short_bio', 'image_url', 'resume_url'],
  },
  {
    name: 'project',
    label: 'Project',
    icon: '🚀',
    description: 'Portfolio projects with links and tech stack',
    fields: ['title', 'slug', 'description', 'thumbnail_url', 'live_url', 'repo_url', 'tech_stack'],
  },
  {
    name: 'skill',
    label: 'Skill',
    icon: '⭐',
    description: 'Skills with proficiency levels and categories',
    fields: ['name', 'category', 'proficiency', 'icon', 'color'],
  },
  {
    name: 'contact',
    label: 'Contact',
    icon: '📧',
    description: 'Contact info, social links, WhatsApp',
    fields: ['email', 'phone', 'location', 'whatsapp_number', 'form_enabled'],
  },
];

export default function ContentTypeBuilder() {
  const { portfolioId } = useAdmin();

  return (
    <div>
      <h1 className="inbox-title">🏗️ Content Types</h1>
      <p className="inbox-subtitle">
        Portfolio ID: <code className="inline-code">{portfolioId}</code>
      </p>
      <p className="page-desc">
        Your portfolio uses typed tables in Supabase. Each content type below corresponds to a database table.
        Click on any type to manage its content.
      </p>

      <div className="content-types-grid">
        {CONTENT_TYPES.map((type) => (
          <div key={type.name} className="content-ref-card">
            <div className="ref-card-header">
              <span className="ref-icon">{type.icon}</span>
              <h3 className="ref-card-title">{type.label}</h3>
            </div>
            <p className="ref-card-desc">{type.description}</p>
            <div className="ref-fields">
              <span className="ref-fields-label">Fields:</span>
              <div className="ref-field-tags">
                {type.fields.map(f => (
                  <span key={f} className="ref-field-tag">{f}</span>
                ))}
              </div>
            </div>
            <a
              href={`/admin/${portfolioId}/${type.name === 'project' ? 'projects' : type.name === 'skill' ? 'skills' : type.name}`}
              className="ref-link"
            >
              Manage {type.label} →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}