import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { CMSPage, ContentItem } from '../index';

export default function DynamicPage() {
  const { route } = useParams<{ route: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<CMSPage | null>(null);
  const [sections, setSections] = useState<ContentItem[]>([]);

  useEffect(() => {
    loadPage();
  }, [route]);

  const loadPage = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/pages/${route}`);
      if (!res.ok) {
        navigate('/'); // page not found → home
        return;
      }
      const pageData: CMSPage = await res.json();
      setPage(pageData);

      // Load all section content
      const sectionData = await Promise.all(
        pageData.sections.map(async (section) => {
          const res = await fetch(
            `http://localhost:3001/api/content/${section.contentType}/${section.contentId}`
          );
          return res.json();
        })
      );
      setSections(sectionData);
    } catch {
      navigate('/');
    }
  };

  if (!page) return <div className="loading-text">Loading...</div>;

  return (
    <div className="dynamic-page section">
      <div className="container">
        <h1 className="section-title">{page.title}</h1>
        {page.metaDescription && <p className="page-description">{page.metaDescription}</p>}

        <div className="page-sections">
          {sections.map((section, index) => (
            <div key={index} className="page-section">
              {renderSection(section)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function renderSection(item: ContentItem) {
  const d = item.data as Record<string, unknown>;

  switch (item.contentType) {
    case 'project':
      return (
        <div className="project-card">
          <h3>{String(d.title)}</h3>
          <p>{String(d.description || '')}</p>
          <div className="project-tags">
            {(d.technologies as string[] || []).map((t, i) => (
              <span key={i} className="tag">{t}</span>
            ))}
          </div>
        </div>
      );
    case 'skill':
      return (
        <div className="skill-item">
          <div className="skill-header">
            <span className="skill-name">{String(d.name || d.title)}</span>
            <span className="skill-level">{String(d.level || 'Beginner')}</span>
          </div>
          <div className="skill-bar">
            <div className="skill-fill" style={{ width: `${Number(d.percentage || 50)}%` }} />
          </div>
        </div>
      );
    default:
      return <pre>{JSON.stringify(d, null, 2)}</pre>;
  }
}