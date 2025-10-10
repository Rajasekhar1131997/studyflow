import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  contact: string;
  notify_method: string;
  progress: number;
  ai_plan: string | null;
  created_at: string;
}
