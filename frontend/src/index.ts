// ─── CMS TYPES ───

export interface ContentField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'date' | 'url' | 'array' | 'select' | 'richtext' | 'image';
  required?: boolean;
  options?: string[];
  defaultValue?: unknown;
}

export interface ContentType {
  _id: string;
  name: string;
  label: string;
  fields: ContentField[];
  icon: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface ContentItem {
  _id: string;
  contentType: string;
  data: Record<string, unknown>;
  slug?: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface CMSPage {
  _id: string;
  route: string;
  title: string;
  metaDescription?: string;
  sections: {
    contentType: string;
    contentId: string;
    order: number;
  }[];
  isActive: boolean;
}

// ─── LEGACY (for backward compat) ───

export interface Project {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  technologies?: string[];
  imageUrl?: string;
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  order?: number;
  createdAt?: string;
}