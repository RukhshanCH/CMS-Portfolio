import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCMS } from '../../context/CMSContext';
import type { ContentItem } from '../../index';

interface Stats {
  totalContent: number;
  published: number;
  drafts: number;
  recentItems: ContentItem[];
}

export default function AdminDashboard() {
  const { contentTypes, refreshContentTypes, getContent } = useCMS();
  const [stats, setStats] = useState<Stats>({
    totalContent: 0,
    published: 0,
    drafts: 0,
    recentItems: [],
  });

  useEffect(() => {
    refreshContentTypes();
    loadStats();
  }, []);

  const loadStats = async () => {
    let total = 0;
    let published = 0;
    let drafts = 0;
    const allItems: ContentItem[] = [];

    // Use contentTypes from CMS context instead of hardcoded array
    for (const type of contentTypes) {
      try {
        const items = await getContent(type.name);
        total += items.length;
        published += items.filter((i) => i.status === 'published').length;
        drafts += items.filter((i) => i.status === 'draft').length;
        allItems.push(...items);
      } catch {
        // content type might not exist yet
      }
    }

    const recent = allItems
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);

    setStats({ totalContent: total, published, drafts, recentItems: recent });
  };

  const statCards = [
    { label: 'Content Types', value: contentTypes.length, icon: '🏗️', color: '#3b82f6' },
    { label: 'Total Content', value: stats.totalContent, icon: '📄', color: '#8b5cf6' },
    { label: 'Published', value: stats.published, icon: '✅', color: '#22c55e' },
    { label: 'Drafts', value: stats.drafts, icon: '📝', color: '#f59e0b' },
  ];

  return (
    <div className="cms-dashboard">
      <h1 className="cms-page-title">📊 Dashboard</h1>

      <div className="stats-grid">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card" style={{ borderLeft: `4px solid ${card.color}` }}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-info">
              <div className="stat-value">{card.value}</div>
              <div className="stat-label-cms">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h2>🏗️ Content Types</h2>
          <div className="content-type-list">
            {contentTypes.map((ct) => (
              <Link key={ct._id} to={`/admin/content/${ct.name}`} className="content-type-card">
                <span className="ct-icon">{ct.icon}</span>
                <div className="ct-info">
                  <div className="ct-name">{ct.label}</div>
                  <div className="ct-fields">{ct.fields.length} fields</div>
                </div>
                <span className="ct-arrow">→</span>
              </Link>
            ))}
            <Link to="/admin/content-types" className="content-type-card add-new">
              <span className="ct-icon">+</span>
              <div className="ct-info">
                <div className="ct-name">Create New</div>
                <div className="ct-fields">Add a content type</div>
              </div>
            </Link>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>🕐 Recent Activity</h2>
          {stats.recentItems.length === 0 ? (
            <p className="empty-state-small">No recent activity</p>
          ) : (
            <div className="recent-list">
              {stats.recentItems.map((item) => (
                <div key={item._id} className="recent-item">
                  <span className={`status-dot status-${item.status}`} />
                  <div className="recent-info">
                    <div className="recent-title">{String(item.data.title || 'Untitled')}</div>
                    <div className="recent-meta">
                      {item.contentType} • {new Date(item.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}