import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  }
});

export interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  progress: number;
  contact: string;
  notify_method: string;
  ai_plan?: string;
  created_at?: string;
  user_id?: string;
  github_repo?: string;
  total_submissions?: number;
}
