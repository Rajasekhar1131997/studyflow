-- Add this to your Supabase database

-- Create submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    file_name TEXT,
    file_url TEXT,
    file_type TEXT,
    github_url TEXT,
    content TEXT,
    ai_evaluation JSONB,
    progress_added INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON public.submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_date ON public.submissions(submission_date DESC);

-- Enable Row Level Security
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your auth setup)
CREATE POLICY "Enable all access for submissions" ON public.submissions
    FOR ALL USING (true);

-- Add github_repo column to assignments table (optional)
ALTER TABLE public.assignments 
ADD COLUMN IF NOT EXISTS github_repo TEXT;

-- Add total_submissions column to assignments table
ALTER TABLE public.assignments 
ADD COLUMN IF NOT EXISTS total_submissions INTEGER DEFAULT 0;
