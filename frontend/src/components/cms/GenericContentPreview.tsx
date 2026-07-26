// src/components/cms/GenericContentPreview.tsx

interface GenericContentPreviewProps {
    item: Record<string, unknown>;
    type: string;
}

export default function GenericContentPreview({ item, type }: GenericContentPreviewProps) {
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
                <div key={key} className="preview-field">
                    <label className="preview-label">{key}</label>
                    <img
                        src={value}
                        alt={key}
                        className="preview-image"
                    />
                </div>
            );
        }

        // Long text
        if (typeof value === 'string' && value.length > 100) {
            return (
                <div key={key} className="preview-field">
                    <label className="preview-label">{key}</label>
                    <p className="preview-text-long">{value}</p>
                </div>
            );
        }

        // Boolean
        if (typeof value === 'boolean') {
            return (
                <div key={key} className="preview-bool-row">
                    <span className="preview-label-inline">{key}:</span>
                    <span className={`badge-bool ${value ? 'badge-bool-true' : 'badge-bool-false'}`}>
                        {value ? 'Yes' : 'No'}
                    </span>
                </div>
            );
        }

        // Default
        return (
            <div key={key} className="preview-field-sm">
                <span className="preview-label-inline">{key}: </span>
                <span className="preview-value">{String(value)}</span>
            </div>
        );
    };

    return (
        <div className="preview-panel">
            <div className="preview-badges">
                <span className="preview-badge-type">
                    {type}
                </span>
                {(item.is_active === false) && (
                    <span className="preview-badge-inactive">
                        Inactive
                    </span>
                )}
            </div>

            {Object.entries(item).map(([key, value]) => renderField(key, value))}
        </div>
    );
}