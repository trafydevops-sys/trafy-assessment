-- Run this in your Supabase SQL Editor

-- 1. Candidates table
CREATE TABLE candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  organization TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Sessions table
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES candidates(id),
  assessment_id TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]',
  score NUMERIC(5,2),
  max_score NUMERIC(5,2),
  percentage NUMERIC(5,2),
  coding_score NUMERIC(5,2),
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  email_sent BOOLEAN DEFAULT false
);

-- 3. Set up Row Level Security (RLS)
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (since users are taking tests before signing up)
CREATE POLICY "Allow public insert to candidates" ON candidates FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public insert to sessions" ON sessions FOR INSERT TO public WITH CHECK (true);

-- Allow public read for leaderboard
CREATE POLICY "Allow public read sessions" ON sessions FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read candidates" ON candidates FOR SELECT TO public USING (true);
