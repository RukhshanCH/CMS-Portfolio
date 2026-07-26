import { useTheme } from '../../context/ThemeContext';
import type { Theme } from '../../utils/supabase';

interface ThemePreviewProps {
  previewData?: Partial<Theme>; // Optional: preview specific theme data
}

export default function ThemePreview({ previewData }: ThemePreviewProps) {
  const { theme: activeTheme, loading } = useTheme();

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
        Loading preview...
      </div>
    );
  }

  if (!activeTheme) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>
        No theme loaded.
      </div>
    );
  }

  // Merge preview overrides on top of active theme
  const theme = previewData ? { ...activeTheme, ...previewData } : activeTheme;

  const isDark = !!theme.dark_mode;

  return (
    <div
      className="theme-preview"
      style={{
        marginTop: '1.5rem',
        padding: '2rem',
        borderRadius: '12px',
        border: '2px solid var(--gray)',
        color: isDark ? theme.color_light || '#e2e8f0' : theme.color_text || '#334155',
        transition: 'all 0.3s ease',
      }}
    >
      <h4
        style={{
          marginBottom: '1.5rem',
          color: isDark ? theme.color_light || '#f8fafc' : theme.color_dark || '#1e1b4b',
        }}
      >
        🎨 {previewData ? 'Preview (Unsaved)' : 'Live Preview (Active Theme)'}
      </h4>

      {/* Color Palette */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <ColorSwatch color={theme.color_primary} label="Primary" textColor="white" />
        <ColorSwatch color={theme.color_primary} label="Primary Dark" textColor="white" />
        <ColorSwatch color={theme.color_secondary} label="Secondary" textColor="white" />
        <ColorSwatch
          color={theme.color_accent || theme.color_secondary}
          label="Accent"
          textColor={theme.color_dark || '#1e1b4b'}
        />
        <ColorSwatch color={theme.color_dark || '#1e1b4b'} label="Dark" textColor="white" />
        <ColorSwatch
          color={theme.color_light || '#ffffff'}
          label="Light"
          textColor={theme.color_dark || '#1e1b4b'}
          border
        />
        <ColorSwatch color={theme.color_gray || '#e2e8f0'} label="Gray" textColor={theme.color_dark || '#1e1b4b'} />
        <ColorSwatch
          color={theme.color_gray_warm || '#f1f5f9'}
          label="Gray Warm"
          textColor={theme.color_dark || '#1e1b4b'}
        />
        <ColorSwatch color={theme.color_text || '#334155'} label="Text" textColor="white" />
        <ColorSwatch
          color={theme.color_text_muted || '#64748b'}
          label="Text Muted"
          textColor="white"
        />
      </div>

      {/* Sample Buttons */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          style={{
            background:
              theme.button_style === 'gradient'
                ? `linear-gradient(${theme.gradient_direction || '135deg'}, ${theme.color_primary}, ${theme.color_secondary})`
                : theme.color_primary,
            color: 'white',
            borderRadius: `${theme.border_radius || 12}px`,
            padding: '0.75rem 1.5rem',
            border: 'none',
            fontWeight: 600,
            marginRight: '0.75rem',
            cursor: 'pointer',
            boxShadow:
              theme.button_style === 'gradient'
                ? `0 4px 14px ${theme.color_primary}66`
                : 'none',
          }}
        >
          Primary Button
        </button>

        <button
          style={{
            background: 'transparent',
            color: isDark ? theme.color_light || '#f8fafc' : theme.color_dark || '#1e1b4b',
            borderRadius: `${theme.border_radius || 12}px`,
            padding: '0.75rem 1.5rem',
            border: `2px solid ${theme.color_accent_soft || '#e2e8f0'}`,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Secondary Button
        </button>
      </div>

      {/* Sample Card */}
      <div
        style={{
          backdropFilter: theme.card_style === 'glass' ? 'blur(10px)' : 'none',
          borderRadius: theme.card_style === 'sharp' ? '0px' : `${theme.border_radius || 12}px`,
          padding: '1.5rem',
          border: `1px solid ${theme.color_accent_soft || '#e2e8f0'}`,
          boxShadow: `0 4px 6px -1px ${theme.color_primary}1a`,
          maxWidth: '400px',
        }}
      >
        <h5
          style={{
            color: isDark ? theme.color_light || '#f8fafc' : theme.color_dark || '#1e1b4b',
            marginBottom: '0.5rem',
            fontSize: '1.1rem',
          }}
        >
          Sample Card
        </h5>
        <p
          style={{
            color: theme.color_text_muted || '#64748b',
            fontSize: '0.9rem',
            marginBottom: '1rem',
          }}
        >
          This is how your cards will look with the current theme settings.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span
            style={{
              padding: '0.25rem 0.75rem',
              background: theme.color_accent_bg || '#f0fdf4',
              color: theme.color_secondary,
              borderRadius: '999px',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            Tag 1
          </span>
          <span
            style={{
              padding: '0.25rem 0.75rem',
              background: theme.color_accent_bg || '#f0fdf4',
              color: theme.color_secondary,
              borderRadius: '999px',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            Tag 2
          </span>
        </div>
      </div>

      {/* Typography Preview */}
      <div style={{ marginTop: '1.5rem' }}>
        <h1
          style={{
            color: isDark ? theme.color_light || '#f8fafc' : theme.color_dark || '#1e1b4b',
            fontSize: '2rem',
            fontWeight: 800,
            marginBottom: '0.5rem',
            fontFamily:
              theme.font_family === 'system' || !theme.font_family
                ? undefined
                : `'${theme.font_family}', sans-serif`,
          }}
        >
          Heading 1
        </h1>
        <h2
          style={{
            color: isDark ? theme.color_light || '#f8fafc' : theme.color_dark || '#1e1b4b',
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: '0.5rem',
          }}
        >
          Heading 2
        </h2>
        <p style={{ color: theme.color_text || '#334155', lineHeight: 1.6 }}>
          Body text color:{` `}
          <code
            style={{
              background: theme.color_gray_warm || '#f1f5f9',
              padding: '0.1rem 0.3rem',
              borderRadius: '4px',
            }}
          >
            {theme.color_text || '#334155'}
          </code>
        </p>
        <p style={{ color: theme.color_text_muted || '#64748b', fontSize: '0.9rem' }}>
          Muted text color:{` `}
          <code
            style={{
              background: theme.color_gray_warm || '#f1f5f9',
              padding: '0.1rem 0.3rem',
              borderRadius: '4px',
            }}
          >
            {theme.color_text_muted || '#64748b'}
          </code>
        </p>
      </div>

      {theme.dark_mode && (
        <div
          style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: '#334155',
            color: '#f8fafc',
            borderRadius: '8px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          🌙 Dark mode is enabled
        </div>
      )}

      {theme.enable_animations === false && (
        <div
          style={{
            marginTop: '0.5rem',
            padding: '0.75rem',
            background: theme.color_gray_warm || '#f1f5f9',
            color: theme.color_text || '#334155',
            borderRadius: '8px',
            fontSize: '0.85rem',
          }}
        >
          ⚡ Animations are disabled
        </div>
      )}
    </div>
  );
}

function ColorSwatch({
  color,
  label,
  textColor,
  border,
}: {
  color: string;
  label: string;
  textColor: string;
  border?: boolean;
}) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: 50,
          height: 50,
          borderRadius: '10px',
          background: color,
          color: textColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.7rem',
          fontWeight: 700,
          marginBottom: '0.35rem',
          border: border ? '2px solid var(--gray)' : 'none',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        {color}
      </div>
      <span
        style={{ fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 500 }}
      >
        {label}
      </span>
    </div>
  );
}