// src/contexts/CMSContext.tsx
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '../utils/supabase';

// ─── TYPES ───

export interface ContentType {
  id: string;
  name: string;
  label: string;
  icon: string;
  tableName: string;
  isSingle: boolean;
}

export interface ContentItem {
  id: string;
  [key: string]: unknown;
}

interface CMSContextType {
  contentTypes: ContentType[];
  refreshContentTypes: () => void;
  getContent: (tableName: string, portfolioId: string) => Promise<ContentItem[]>;
  getContentItem: (tableName: string, id: string, portfolioId: string) => Promise<ContentItem | null>;
  createContent: (tableName: string, data: Record<string, unknown>, portfolioId: string) => Promise<ContentItem | null>;
  updateContent: (tableName: string, id: string, data: Record<string, unknown>, portfolioId: string) => Promise<ContentItem | null>;
  deleteContent: (tableName: string, id: string, portfolioId: string) => Promise<void>;
  bulkDelete: (tableName: string, ids: string[], portfolioId: string) => Promise<void>;
}

// ─── STATIC TABLE CONFIG ───

const DEFAULT_CONTENT_TYPES: ContentType[] = [
  { id: '1', name: 'project', label: 'Projects', icon: '🚀', tableName: 'projects', isSingle: false },
  { id: '2', name: 'hero', label: 'Hero', icon: '📄', tableName: 'hero', isSingle: true },
  { id: '3', name: 'about', label: 'About', icon: '👨‍💻', tableName: 'about', isSingle: true },
  { id: '4', name: 'skill', label: 'Skills', icon: '⭐', tableName: 'skills', isSingle: false },
  { id: '5', name: 'contact', label: 'Contact', icon: '📧', tableName: 'contact', isSingle: true },
  { id: '6', name: 'theme', label: 'Themes', icon: '🎨', tableName: 'themes', isSingle: false },
];

const CMSContext = createContext<CMSContextType | null>(null);

export function CMSProvider({ children }: { children: ReactNode }) {
  const [contentTypes] = useState<ContentType[]>(DEFAULT_CONTENT_TYPES);

  const refreshContentTypes = useCallback(() => {
    // Static config, nothing to refresh
  }, []);

  // ─── CRUD via Supabase (multi-tenant) ───

  const getContent = async (tableName: string, portfolioId: string): Promise<ContentItem[]> => {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('display_order', { ascending: true }); // or 'order_index' if that's your column

    if (error) {
      console.error(`getContent(${tableName}) error:`, error);
      return [];
    }
    return (data as ContentItem[]) || [];
  };

  const getContentItem = async (tableName: string, id: string, portfolioId: string): Promise<ContentItem | null> => {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .eq('portfolio_id', portfolioId)
      .single();

    if (error) {
      console.error(`getContentItem(${tableName}, ${id}) error:`, error);
      return null;
    }
    return data as ContentItem;
  };

  const createContent = async (
    tableName: string,
    payload: Record<string, unknown>,
    portfolioId: string
  ): Promise<ContentItem | null> => {
    const { data, error } = await supabase
      .from(tableName)
      .insert({ ...payload, portfolio_id: portfolioId })
      .select()
      .single();

    if (error) {
      console.error(`createContent(${tableName}) error:`, error);
      throw error;
    }
    return data as ContentItem;
  };

  const updateContent = async (
    tableName: string,
    id: string,
    payload: Record<string, unknown>,
    portfolioId: string
  ): Promise<ContentItem | null> => {
    const cleanPayload = { ...payload };
    delete cleanPayload.id;
    delete cleanPayload.created_at;
    delete cleanPayload.portfolio_id; // prevent changing ownership

    const { data, error } = await supabase
      .from(tableName)
      .update(cleanPayload)
      .eq('id', id)
      .eq('portfolio_id', portfolioId)
      .select()
      .single();

    if (error) {
      console.error(`updateContent(${tableName}, ${id}) error:`, error);
      throw error;
    }
    return data as ContentItem;
  };

  const deleteContent = async (tableName: string, id: string, portfolioId: string): Promise<void> => {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id)
      .eq('portfolio_id', portfolioId);

    if (error) {
      console.error(`deleteContent(${tableName}, ${id}) error:`, error);
      throw error;
    }
  };

  const bulkDelete = async (tableName: string, ids: string[], portfolioId: string): Promise<void> => {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .in('id', ids)
      .eq('portfolio_id', portfolioId);

    if (error) {
      console.error(`bulkDelete(${tableName}) error:`, error);
      throw error;
    }
  };

  return (
    <CMSContext.Provider value={{
      contentTypes,
      refreshContentTypes,
      getContent,
      getContentItem,
      createContent,
      updateContent,
      deleteContent,
      bulkDelete,
    }}>
      {children}
    </CMSContext.Provider>
  );
}

export function useCMS() {
  const ctx = useContext(CMSContext);
  if (!ctx) throw new Error('useCMS must be used within a CMSProvider');
  return ctx;
}