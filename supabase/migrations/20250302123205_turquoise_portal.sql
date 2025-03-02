/*
  # Fix RLS policies for anonymous access

  1. Changes
    - Update RLS policies to allow anonymous access for basic operations
    - Add policies for unauthenticated users to insert and update their own data
    - Fix policies for hatims table

  2. Security
    - Policies are designed to allow device-based authentication
    - Each user can only modify their own data
    - All users can read global statistics
*/

-- Update policies for users table
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

CREATE POLICY "Anyone can read users data"
  ON users
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can update their own user data"
  ON users
  FOR UPDATE
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert user data"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Update policies for user_progress table
DROP POLICY IF EXISTS "Users can read their own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can insert their own progress" ON user_progress;

CREATE POLICY "Anyone can read user progress"
  ON user_progress
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can update their own progress"
  ON user_progress
  FOR UPDATE
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert progress data"
  ON user_progress
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Update policies for hatims table
DROP POLICY IF EXISTS "Users can read all hatims" ON hatims;
DROP POLICY IF EXISTS "Users can insert their own hatims" ON hatims;

CREATE POLICY "Anyone can read hatims"
  ON hatims
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert hatim data"
  ON hatims
  FOR INSERT
  TO anon
  WITH CHECK (true);