import { useState, useEffect } from 'react';
import { useCMS } from '../../context/CMSContext';
import type { ContentField, ContentType } from '../../index';

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'date', label: 'Date' },
  { value: 'url', label: 'URL' },
  { value: 'array', label: 'Array (comma separated)' },
  { value: 'select', label: 'Select Dropdown' },
  { value: 'richtext', label: 'Rich Text' },
  { value: 'image', label: 'Image URL' },
] as const;

const emptyField: ContentField = {
  name: '',
  label: '',
  type: 'text',
  required: false,
};

export default function ContentTypeBuilder() {
  const { contentTypes, refreshContentTypes } = useCMS();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [label, setLabel] = useState('');
  const [icon, setIcon] = useState('📄');
  const [fields, setFields] = useState<ContentField[]>([{ ...emptyField }]);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    refreshContentTypes();
  }, []);

  const showAlert = (type: 'success' | 'error', text: string) => {
    setAlert({ type, text });
    setTimeout(() => setAlert(null), 3500);
  };

  const resetForm = () => {
    setName('');
    setLabel('');
    setIcon('📄');
    setFields([{ ...emptyField }]);
    setEditingId(null);
  };

  const openAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEdit = (ct: ContentType) => {
    setEditingId(ct._id);
    setName(ct.name);
    setLabel(ct.label);
    setIcon(ct.icon);
    setFields(ct.fields.length > 0 ? [...ct.fields] : [{ ...emptyField }]);
    setIsModalOpen(true);
  };

  const addField = () => setFields([...fields, { ...emptyField }]);

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, key: keyof ContentField, value: unknown) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], [key]: value };
    setFields(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !label.trim()) {
      showAlert('error', 'Name and label are required');
      return;
    }

    const validFields = fields.filter((f) => f.name.trim() && f.label.trim());
    if (validFields.length === 0) {
      showAlert('error', 'At least one field is required');
      return;
    }

    const payload = {
      name: name.toLowerCase().replace(/\s+/g, '-'),
      label,
      icon,
      fields: validFields,
      isActive: true,
    };

    try {
      const url = editingId
        ? `http://localhost:3001/api/content-types/${editingId}`
        : 'http://localhost:3001/api/content-types';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save');

      showAlert('success', editingId ? 'Content type updated!' : 'Content type created!');
      setIsModalOpen(false);
      resetForm();
      await refreshContentTypes();
    } catch (err) {
      showAlert('error', err instanceof Error ? err.message : 'Failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this content type? All associated content will also be deleted.')) return;

    try {
      const res = await fetch(`http://localhost:3001/api/content-types/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      showAlert('success', 'Content type deleted!');
      await refreshContentTypes();
    } catch (err) {
      showAlert('error', err instanceof Error ? err.message : 'Failed');
    }
  };

  return (
    <div className="cms-content-types">
      <div className="cms-header">
        <h1>🏗️ Content Types</h1>
        <button className="btn-admin btn-add" onClick={openAdd}>+ Create Content Type</button>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.text}</div>}

      {contentTypes.length === 0 ? (
        <p className="empty-state">No content types yet. Create one to get started!</p>
      ) : (
        <div className="content-types-grid">
          {contentTypes.map((ct) => (
            <div key={ct._id} className="content-type-item">
              <div className="ct-header">
                <span className="ct-icon-large">{ct.icon}</span>
                <div className="ct-details">
                  <h3>{ct.label}</h3>
                  <code className="ct-code">{ct.name}</code>
                </div>
              </div>
              <div className="ct-fields-list">
                {ct.fields.map((f) => (
                  <span key={f.name} className="ct-field-tag">
                    {f.label} <small>({f.type})</small>
                  </span>
                ))}
              </div>
              <div className="ct-actions">
                <button className="btn-edit-card" onClick={() => openEdit(ct)}>Edit</button>
                <button className="btn-delete-small" onClick={() => handleDelete(ct._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="modal modal-large">
            <div className="modal-header">
              <h2>{editingId ? 'Edit' : 'Create'} Content Type</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Name (API key) *</label>
                  <input
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., blog-post"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Label *</label>
                  <input
                    className="form-input"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g., Blog Post"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Icon</label>
                <input
                  className="form-input"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="e.g., 📝"
                />
              </div>

              <div className="fields-section">
                <div className="fields-header">
                  <h3>Fields</h3>
                  <button type="button" className="btn-admin btn-add" onClick={addField}>+ Add Field</button>
                </div>

                {fields.map((field, index) => (
                  <div key={index} className="field-row">
                    <input
                      className="form-input"
                      placeholder="Field name"
                      value={field.name}
                      onChange={(e) => updateField(index, 'name', e.target.value)}
                    />
                    <input
                      className="form-input"
                      placeholder="Field label"
                      value={field.label}
                      onChange={(e) => updateField(index, 'label', e.target.value)}
                    />
                    <select
                      className="form-input"
                      value={field.type}
                      onChange={(e) => updateField(index, 'type', e.target.value)}
                    >
                      {FIELD_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <label className="form-checkbox inline">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateField(index, 'required', e.target.checked)}
                      />
                      Required
                    </label>
                    {fields.length > 1 && (
                      <button type="button" className="btn-delete-small" onClick={() => removeField(index)}>
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-admin btn-cancel" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-admin btn-add">
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}