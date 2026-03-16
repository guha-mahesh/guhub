import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, key);

export interface Post {
  id: string;
  title: string;
  slug: string;
  body: string;
  excerpt: string | null;
  tags: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
}
