// ============================================
// components/cms/ContentTypeBuilder.tsx — Updated for Multi-Tenant
// Simplified version since Supabase uses typed tables, not dynamic content types
// This page now shows a reference of available content types and their fields
// ============================================

import React from 'react';
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
      <h1 style={styles.title}>🏗️ Content Types</h1>
      <p style={styles.subtitle}>
        Portfolio ID: <code style={styles.code}>{portfolioId}</code>
      </p>
      <p style={styles.desc}>
        Your portfolio uses typed tables in Supabase. Each content type below corresponds to a database table.
        Click on any type to manage its content.
      </p>

      <div style={styles.grid}>
        {CONTENT_TYPES.map((type) => (
          <div key={type.name} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.icon}>{type.icon}</span>
              <h3 style={styles.cardTitle}>{type.label}</h3>
            </div>
            <p style={styles.cardDesc}>{type.description}</p>
            <div style={styles.fields}>
              <span style={styles.fieldsLabel}>Fields:</span>
              <div style={styles.fieldTags}>
                {type.fields.map(f => (
                  <span key={f} style={styles.fieldTag}>{f}</span>
                ))}
              </div>
            </div>
            <a 
              href={`/admin/${portfolioId}/${type.name === 'project' ? 'projects' : type.name === 'skill' ? 'skills' : type.name}`}
              style={styles.link}
            >
              Manage {type.label} →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  title: {
    fontSize: '24px',
    fontWeight: 700,
    margin: '0 0 8px 0',
    color: 'var(--color-text, #e2e8f0)',
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--color-text-muted, #94a3b8)',
    margin: '0 0 8px 0',
  },
  code: {
    fontFamily: 'monospace',
    background: 'var(--color-surface, #1e293b)',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  desc: {
    fontSize: '14px',
    color: 'var(--color-text-muted, #94a3b8)',
    margin: '0 0 24px 0',
    lineHeight: 1.6,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
  },
  card: {
    padding: '20px',
    background: 'var(--color-surface, #1e293b)',
    borderRadius: '12px',
    border: '1px solid var(--color-gray, #334155)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  icon: {
    fontSize: '24px',
  },
  cardTitle: {
    fontSize: '17px',
    fontWeight: 600,
    margin: 0,
    color: 'var(--color-text, #e2e8f0)',
  },
  cardDesc: {
    fontSize: '13px',
    color: 'var(--color-text-muted, #94a3b8)',
    margin: '0 0 14px 0',
    lineHeight: 1.5,
  },
  fields: {
    marginBottom: '14px',
  },
  fieldsLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--color-text-muted, #94a3b8)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'block',
    marginBottom: '6px',
  },
  fieldTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  fieldTag: {
    padding: '3px 8px',
    borderRadius: '6px',
    background: 'rgba(59,130,246,0.1)',
    color: 'var(--color-primary, #3b82f6)',
    fontSize: '12px',
    fontFamily: 'monospace',
  },
  link: {
    color: 'var(--color-primary, #3b82f6)',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
  },
};