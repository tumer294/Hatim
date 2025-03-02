/*
  # Initial Schema for Quran Reading Tracker

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `username` (text, nullable)
      - `created_at` (timestamp)
      - `last_active` (timestamp)
    - `user_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `juz_progress` (jsonb)
      - `total_completed` (integer)
      - `completed_hatims` (integer)
    - `hatims`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `completed_at` (timestamp)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read/write their own data
    - Add policies for public access to global statistics
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  username text,
  created_at timestamptz DEFAULT now(),
  last_active timestamptz DEFAULT now()
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  juz_progress jsonb NOT NULL,
  total_completed integer DEFAULT 0,
  completed_hatims integer DEFAULT 0
);

-- Create hatims table
CREATE TABLE IF NOT EXISTS hatims (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id) NOT NULL,
  completed_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE hatims ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Create policies for user_progress table
CREATE POLICY "Users can read their own progress"
  ON user_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON user_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON user_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policies for hatims table
CREATE POLICY "Users can read all hatims"
  ON hatims
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own hatims"
  ON hatims
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_hatims_user_id ON hatims(user_id);
CREATE INDEX IF NOT EXISTS idx_hatims_completed_at ON hatims(completed_at);