-- Auth Setup for AI StudyAssist (Updated - No Conflicts)
-- Run this in your Supabase SQL Editor

-- Step 1: Add user_id columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assignments' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.assignments 
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'submissions' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.submissions
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 2: Create indexes (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_assignments_user_id ON public.assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON public.submissions(user_id);

-- Step 3: Drop and recreate ALL policies for assignments
DROP POLICY IF EXISTS "Enable all access for assignments" ON public.assignments;
DROP POLICY IF EXISTS "Users can view own assignments" ON public.assignments;
DROP POLICY IF EXISTS "Users can insert own assignments" ON public.assignments;
DROP POLICY IF EXISTS "Users can update own assignments" ON public.assignments;
DROP POLICY IF EXISTS "Users can delete own assignments" ON public.assignments;

-- Create new policies for assignments
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

-- Step 4: Drop and recreate ALL policies for submissions
DROP POLICY IF EXISTS "Enable all access for submissions" ON public.submissions;
DROP POLICY IF EXISTS "Users can view own submissions" ON public.submissions;
DROP POLICY IF EXISTS "Users can insert own submissions" ON public.submissions;
DROP POLICY IF EXISTS "Users can update own submissions" ON public.submissions;
DROP POLICY IF EXISTS "Users can delete own submissions" ON public.submissions;

-- Create new policies for submissions
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

-- Step 5: Create profiles table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop and recreate profile policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Step 6: Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Trigger to automatically create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Auth setup complete! Each user now has their own workspace.';
END $$;
