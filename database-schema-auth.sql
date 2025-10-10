-- Auth Setup for AI StudyAssist
-- Run this in your Supabase SQL Editor AFTER enabling Email Auth in Authentication settings

-- Update assignments table to include user_id
ALTER TABLE public.assignments 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update submissions table to include user_id  
ALTER TABLE public.submissions
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_assignments_user_id ON public.assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON public.submissions(user_id);

-- Update RLS policies for assignments
DROP POLICY IF EXISTS "Enable all access for assignments" ON public.assignments;

CREATE POLICY "Users can view own assignments"
  ON public.assignments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assignments"
  ON public.assignments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assignments"
  ON public.assignments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own assignments"
  ON public.assignments FOR DELETE
  USING (auth.uid() = user_id);

-- Update RLS policies for submissions
DROP POLICY IF EXISTS "Enable all access for submissions" ON public.submissions;

CREATE POLICY "Users can view own submissions"
  ON public.submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own submissions"
  ON public.submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own submissions"
  ON public.submissions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own submissions"
  ON public.submissions FOR DELETE
  USING (auth.uid() = user_id);

-- Create user profiles table (optional but useful)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
