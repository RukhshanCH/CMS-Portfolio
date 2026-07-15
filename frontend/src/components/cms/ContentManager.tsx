import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useCMS } from '../../context/CMSContext';
import type { ContentType, ContentItem } from '../../index';

export default function ContentManager() {
  const { typeName } = useParams<{ typeName: string }>();
//   const navigate = useNavigate();
  const { contentTypes, refreshContentTypes, getContent, createContent, updateContent, deleteContent, bulkDelete } = useCMS();

  const [items, setItems] = useState<ContentItem[]>([]);
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    refreshContentTypes();
  }, [refreshContentTypes]);

  useEffect(() => {
    const ct = contentTypes.find((t) => t.name === typeName);
    setContentType(ct || null);
    if (ct) loadItems();
  }, [typeName, contentTypes]);

  const loadItems = useCallback(async () => {
    if (!typeName) return;
    const data = await getContent(typeName);
    setItems(data);
  }, [typeName, getContent]);

  const showAlert = (type: 'success' | 'error', text: string) => {
    setAlert({ type, text });
    setTimeout(() => setAlert(null), 3500);
  };

  const openAdd = () => {
    const defaults: Record<string, unknown> = {};
    contentType?.fields.forEach((f) => {
      if (f.defaultValue !== undefined) defaults[f.name] = f.defaultValue;
    });
    setFormData(defaults);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: ContentItem) => {
    setFormData(item.data);
    setEditingId(item._id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeName || !contentType) return;

    try {
      if (editingId) {
        await updateContent(typeName, editingId, formData);
        showAlert('success', 'Updated successfully!');
      } else {
        await createContent(typeName, formData);
        showAlert('success', 'Created successfully!');
      }
      setIsModalOpen(false);
      await loadItems();
    } catch (err) {
      showAlert('error', err instanceof Error ? err.message : 'Failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this item?')) return;
    if (!typeName) return;
    await deleteContent(typeName, id);
    showAlert('success', 'Deleted!');
    await loadItems();
  };

  const handleBulkDelete = async () => {
    if (!typeName || selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} items?`)) return;
    await bulkDelete(typeName, Array.from(selectedIds));
    setSelectedIds(new Set());
    setIsDeleteMode(false);
    showAlert('success', `${selectedIds.size} items deleted!`);
    await loadItems();
  };

  const renderField = (field: ContentType['fields'][0]) => {
    const value = formData[field.name] ?? '';
    const onChange = (v: unknown) => setFormData((prev) => ({ ...prev, [field.name]: v }));

    switch (field.type) {
      case 'textarea':
        return <textarea className="form-input" rows={3} value={String(value)} onChange={(e) => onChange(e.target.value)} placeholder={field.label} />;
      case 'boolean':
        return (
          <label className="form-checkbox">
            <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
            <span>{field.label}</span>
          </label>
        );
      case 'number':
        return <input className="form-input" type="number" value={String(value)} onChange={(e) => onChange(Number(e.target.value))} placeholder={field.label} />;
      case 'array':
        return <input className="form-input" value={Array.isArray(value) ? value.join(', ') : String(value)} onChange={(e) => onChange(e.target.value.split(',').map((s) => s.trim()))} placeholder={`${field.label} (comma separated)`} />;
      case 'select':
        return (
          <select className="form-input" value={String(value)} onChange={(e) => onChange(e.target.value)}>
            <option value="">Select {field.label}</option>
            {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        );
      default:
        return <input className="form-input" type={field.type === 'url' ? 'url' : 'text'} value={String(value)} onChange={(e) => onChange(e.target.value)} placeholder={field.label} required={field.required} />;
    }
  };

  if (!contentType) return <div className="cms-loading">Loading content type...</div>;

  return (
    <div className="cms-content-manager">
      <div className="cms-header">
        <h1>{contentType.icon} {contentType.label}</h1>
        <div className="cms-actions">
          {!isDeleteMode ? (
            <>
              <button className="btn-admin btn-add" onClick={openAdd}>+ Add {contentType.label}</button>
              <button className="btn-admin btn-delete" onClick={() => setIsDeleteMode(true)}>Bulk Delete</button>
            </>
          ) : (
            <>
              <button className="btn-admin btn-select" onClick={() => setSelectedIds(selectedIds.size === items.length ? new Set() : new Set(items.map((i) => i._id)))}>
                {selectedIds.size === items.length ? 'Deselect All' : 'Select All'}
              </button>
              <button className="btn-admin btn-delete-confirm" disabled={selectedIds.size === 0} onClick={handleBulkDelete}>
                Delete ({selectedIds.size})
              </button>
              <button className="btn-admin btn-cancel" onClick={() => { setIsDeleteMode(false); setSelectedIds(new Set()); }}>Cancel</button>
            </>
          )}
        </div>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.text}</div>}

      {items.length === 0 ? (
        <p className="empty-state">No {contentType.label.toLowerCase()}s yet. Add one!</p>
      ) : (
        <div className="cms-table-wrapper">
          <table className="cms-table">
            <thead>
              <tr>
                {isDeleteMode && <th>Select</th>}
                {contentType.fields.map((f) => <th key={f.name}>{f.label}</th>)}
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className={isDeleteMode && selectedIds.has(item._id) ? 'selected-row' : ''}>
                  {isDeleteMode && (
                    <td>
                      <input type="checkbox" checked={selectedIds.has(item._id)} onChange={() => {
                        const next = new Set(selectedIds);
                        next.has(item._id) ? next.delete(item._id) : next.add(item._id);
                        setSelectedIds(next);
                      }} />
                    </td>
                  )}
                  {contentType.fields.map((f) => (
                    <td key={f.name}>
                      {f.type === 'boolean' ? (item.data[f.name] ? '✅' : '❌') :
                       f.type === 'array' ? (item.data[f.name] as string[])?.join(', ') :
                       String(item.data[f.name] ?? '-')}
                    </td>
                  ))}
                  <td><span className={`status-badge status-${item.status}`}>{item.status}</span></td>
                  <td>
                    {!isDeleteMode && (
                      <>
                        <button className="btn-edit-card" onClick={() => openEdit(item)}>Edit</button>
                        <button className="btn-delete-small" onClick={() => handleDelete(item._id)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editingId ? 'Edit' : 'Add'} {contentType.label}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              {contentType.fields.map((field) => (
                <div key={field.name} className="form-group">
                  <label className="form-label">{field.label}{field.required && ' *'}</label>
                  {renderField(field)}
                </div>
              ))}
              <div className="modal-actions">
                <button type="button" className="btn-admin btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-admin btn-add">{editingId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}