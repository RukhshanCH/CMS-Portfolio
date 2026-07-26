// src/components/cms/GenericContentPreview.tsx
interface GenericContentPreviewProps {
    item: Record<string, unknown>;
    type: string;
}

export default function GenericContentPreview({ item, type }: GenericContentPreviewProps) {
    const isDark = document.documentElement.classList.contains('dark-mode');

    const renderField = (key: string, value: unknown) => {
        if (value === null || value === undefined) return null;
        if (key === 'id' || key === 'created_at' || key === 'portfolio_id') return null;

        // Image fields
        if (
            typeof value === 'string' &&
            (key.includes('image') || key.includes('photo') || key.includes('avatar')) &&
            value.match(/^https?:\/\//)
        ) {
            return (
                <div key={key} style={{ marginBottom: '1rem' }}>
                    <label style={styles.label}>{key}</label>
                    <img
                        src={value}
                        alt={key}
                        style={{ maxWidth: '100%', borderRadius: '8px', maxHeight: '200px', objectFit: 'cover' }}
                    />
                </div>
            );
        }

        // Long text
        if (typeof value === 'string' && value.length > 100) {
            return (
                <div key={key} style={{ marginBottom: '1rem' }}>
                    <label style={styles.label}>{key}</label>
                    <p style={{ ...styles.text, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{value}</p>
                </div>
            );
        }

        // Boolean
        if (typeof value === 'boolean') {
            return (
                <div key={key} style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={styles.label}>{key}:</span>
                    <span style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: value ? 'var(--success-bg)' : 'var(--danger-bg)',
                        color: value ? 'var(--success-text)' : 'var(--danger-text)',
                    }}>
                        {value ? 'Yes' : 'No'}
                    </span>
                </div>
            );
        }

        // Default
        return (
            <div key={key} style={{ marginBottom: '0.75rem' }}>
                <span style={styles.label}>{key}: </span>
                <span style={styles.text}>{String(value)}</span>
            </div>
        );
    };

    return (
        <div style={{
            padding: '1.5rem',
            background: isDark ? 'var(--color-surface)' : 'var(--color-light)',
            borderRadius: '12px',
            border: '1px solid var(--gray)',
        }}>
            <div style={{ marginBottom: '1rem' }}>
                <span style={{
                    padding: '0.25rem 0.75rem',
                    background: 'var(--accent-bg)',
                    color: 'var(--secondary)',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                }}>
                    {type}
                </span>
                {(item.is_active === false) && (
                    <span style={{
                        marginLeft: '0.5rem',
                        padding: '0.25rem 0.75rem',
                        background: 'var(--danger-bg)',
                        color: 'var(--danger-text)',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                    }}>
                        Inactive
                    </span>
                )}
            </div>

            {Object.entries(item).map(([key, value]) => renderField(key, value))}
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    label: {
        fontSize: '0.75rem',
        fontWeight: 600,
        color: 'var(--text-light)',
        textTransform: 'capitalize',
        display: 'block',
        marginBottom: '0.25rem',
    },
    text: {
        color: 'var(--color-text)',
        fontSize: '0.9rem',
    },
};