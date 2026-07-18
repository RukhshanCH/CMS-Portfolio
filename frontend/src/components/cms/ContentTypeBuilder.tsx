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
  { value: 'image', label: 'Image Upload' },
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

  // For managing options inline
  const [optionInputs, setOptionInputs] = useState<Record<number, string>>({});

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
    setOptionInputs({});
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
    setFields(ct.fields.length > 0 ? ct.fields.map(f => ({ ...f })) : [{ ...emptyField }]);
    setOptionInputs({});
    setIsModalOpen(true);
  };

  const addField = () => {
    setFields([...fields, { ...emptyField }]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
    setOptionInputs(prev => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const updateField = (index: number, key: keyof ContentField, value: unknown) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], [key]: value };

    // Reset options when switching away from select
    if (key === 'type' && value !== 'select') {
      delete updated[index].options;
    }
    // Initialize options when switching to select
    if (key === 'type' && value === 'select' && !updated[index].options) {
      updated[index].options = [];
    }

    setFields(updated);
  };

  // ─── OPTIONS MANAGEMENT ───
  const addOption = (fieldIndex: number) => {
    const inputVal = optionInputs[fieldIndex]?.trim();
    if (!inputVal) return;

    const updated = [...fields];
    const currentOptions = updated[fieldIndex].options || [];
    if (currentOptions.includes(inputVal)) {
      showAlert('error', 'Option already exists');
      return;
    }

    updated[fieldIndex].options = [...currentOptions, inputVal];
    setFields(updated);
    setOptionInputs(prev => ({ ...prev, [fieldIndex]: '' }));
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const updated = [...fields];
    updated[fieldIndex].options = (updated[fieldIndex].options || []).filter((_, i) => i !== optionIndex);
    setFields(updated);
  };

  const handleOptionInputChange = (fieldIndex: number, value: string) => {
    setOptionInputs(prev => ({ ...prev, [fieldIndex]: value }));
  };

  const handleOptionKeyDown = (e: React.KeyboardEvent, fieldIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addOption(fieldIndex);
    }
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

    // Validate select fields have options
    for (const f of validFields) {
      if (f.type === 'select' && (!f.options || f.options.length === 0)) {
        showAlert('error', `Field "${f.label}" is a dropdown but has no options`);
        return;
      }
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        isModalOpen && setIsModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setIsModalOpen, isModalOpen]);

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
                    {f.label} <small>({f.type}{f.type === 'select' && f.options ? ` • ${f.options.length} options` : ''})</small>
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
                  <div key={index} className="field-row-wrapper">
                    <div className="field-row">
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

                    {/* ─── OPTIONS MANAGER FOR SELECT FIELDS ─── */}
                    {field.type === 'select' && (
                      <div className="options-manager">
                        <label className="form-label">Dropdown Options</label>

                        <div className="options-list">
                          {(field.options || []).map((opt, optIdx) => (
                            <span key={optIdx} className="option-chip">
                              {opt}
                              <button
                                type="button"
                                className="option-remove"
                                onClick={() => removeOption(index, optIdx)}
                                title="Remove option"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>

                        <div className="option-add-row">
                          <input
                            className="form-input"
                            type="text"
                            placeholder="Type option and press Enter"
                            value={optionInputs[index] || ''}
                            onChange={(e) => handleOptionInputChange(index, e.target.value)}
                            onKeyDown={(e) => handleOptionKeyDown(e, index)}
                          />
                          <button
                            type="button"
                            className="btn-admin btn-add"
                            onClick={() => addOption(index)}
                          >
                            Add
                          </button>
                        </div>
                      </div>
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