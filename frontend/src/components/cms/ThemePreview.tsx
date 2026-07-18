import { useTheme } from '../../context/ThemeContext';

interface ThemePreviewProps {
  previewData?: Record<string, unknown>; // Optional: preview specific theme data
}

export default function ThemePreview({ previewData }: ThemePreviewProps) {
  const { theme: activeTheme } = useTheme();
  
  // Use preview data if provided, otherwise fall back to active theme
  const theme = previewData 
    ? { ...activeTheme, ...previewData } as typeof activeTheme
    : activeTheme;

  return (
    <div 
      className="theme-preview" 
      style={{ 
        marginTop: '1.5rem', 
        padding: '2rem', 
        borderRadius: '12px', 
        border: '2px solid var(--gray)',
        background: theme.darkMode ? '#0f172a' : theme.light,
        transition: 'all 0.3s ease'
      }}
    >
      <h4 style={{ marginBottom: '1.5rem', color: theme.darkMode ? '#f8fafc' : theme.dark }}>
        🎨 {previewData ? 'Preview (Unsaved)' : 'Live Preview (Active Theme)'}
      </h4>
      
      {/* Color Palette */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <ColorSwatch color={theme.primary} label="Primary" textColor="white" />
        <ColorSwatch color={theme.primaryDark} label="Primary Dark" textColor="white" />
        <ColorSwatch color={theme.secondary} label="Secondary" textColor="white" />
        <ColorSwatch color={theme.accent} label="Accent" textColor={theme.dark} />
        <ColorSwatch color={theme.dark} label="Dark" textColor="white" />
        <ColorSwatch color={theme.light} label="Light" textColor={theme.dark} border />
        <ColorSwatch color={theme.gray} label="Gray" textColor={theme.dark} />
        <ColorSwatch color={theme.grayWarm} label="Gray Warm" textColor={theme.dark} />
        <ColorSwatch color={theme.text} label="Text" textColor="white" />
        <ColorSwatch color={theme.textLight} label="Text Light" textColor="white" />
      </div>

      {/* Sample Buttons */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button 
          style={{
            background: theme.buttonStyle === 'gradient' 
              ? `linear-gradient(${theme.gradientDirection}, ${theme.primary}, ${theme.secondary})`
              : theme.primary,
            color: 'white',
            borderRadius: `${theme.radius}px`,
            padding: '0.75rem 1.5rem',
            border: 'none',
            fontWeight: 600,
            marginRight: '0.75rem',
            cursor: 'pointer',
            boxShadow: theme.buttonStyle === 'gradient' ? `0 4px 14px ${theme.primary}66` : 'none'
          }}
        >
          Primary Button
        </button>
        
        <button 
          style={{
            background: 'transparent',
            color: theme.dark,
            borderRadius: `${theme.radius}px`,
            padding: '0.75rem 1.5rem',
            border: `2px solid ${theme.accentSoft}`,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Secondary Button
        </button>
      </div>

      {/* Sample Card */}
      <div 
        style={{
          background: theme.cardStyle === 'glass' 
            ? 'rgba(255,255,255,0.1)' 
            : theme.cardStyle === 'sharp' 
              ? theme.grayWarm 
              : 'white',
          backdropFilter: theme.cardStyle === 'glass' ? 'blur(10px)' : 'none',
          borderRadius: theme.cardStyle === 'sharp' ? '0px' : `${theme.radius}px`,
          padding: '1.5rem',
          border: `1px solid ${theme.accentSoft}`,
          boxShadow: `0 4px 6px -1px ${theme.primary}1a`,
          maxWidth: '400px'
        }}
      >
        <h5 style={{ color: theme.dark, marginBottom: '0.5rem', fontSize: '1.1rem' }}>
          Sample Card
        </h5>
        <p style={{ color: theme.textLight, fontSize: '0.9rem', marginBottom: '1rem' }}>
          This is how your cards will look with the current theme settings.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ 
            padding: '0.25rem 0.75rem', 
            background: theme.accentBg, 
            color: theme.secondary,
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: 600
          }}>
            Tag 1
          </span>
          <span style={{ 
            padding: '0.25rem 0.75rem', 
            background: theme.accentBg, 
            color: theme.secondary,
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: 600
          }}>
            Tag 2
          </span>
        </div>
      </div>

      {/* Typography Preview */}
      <div style={{ marginTop: '1.5rem' }}>
        <h1 style={{ 
          color: theme.dark, 
          fontSize: '2rem', 
          fontWeight: 800,
          marginBottom: '0.5rem',
          fontFamily: theme.fontFamily === 'system' ? undefined : theme.fontFamily
        }}>
          Heading 1
        </h1>
        <h2 style={{ 
          color: theme.dark, 
          fontSize: '1.5rem', 
          fontWeight: 700,
          marginBottom: '0.5rem' 
        }}>
          Heading 2
        </h2>
        <p style={{ color: theme.text, lineHeight: 1.6 }}>
          Body text color: <code style={{ background: theme.grayWarm, padding: '0.1rem 0.3rem', borderRadius: '4px' }}>{theme.text}</code>
        </p>
        <p style={{ color: theme.textLight, fontSize: '0.9rem' }}>
          Muted text color: <code style={{ background: theme.grayWarm, padding: '0.1rem 0.3rem', borderRadius: '4px' }}>{theme.textLight}</code>
        </p>
      </div>

      {theme.darkMode && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem', 
          background: '#334155', 
          color: '#f8fafc',
          borderRadius: '8px',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          🌙 Dark mode is enabled
        </div>
      )}

      {!theme.enableAnimations && (
        <div style={{ 
          marginTop: '0.5rem', 
          padding: '0.75rem', 
          background: theme.grayWarm, 
          color: theme.text,
          borderRadius: '8px',
          fontSize: '0.85rem'
        }}>
          ⚡ Animations are disabled
        </div>
      )}
    </div>
  );
}

function ColorSwatch({ color, label, textColor, border }: { 
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
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        {color}
      </div>
      <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 500 }}>
        {label}
      </span>
    </div>
  );
}