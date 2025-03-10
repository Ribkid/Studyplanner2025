/*
  # Fix Python Projects system
  
  1. New Tables
    - `python_projects` - Stores project details
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text, required)
      - `difficulty` (text, required) - 'beginner', 'intermediate', 'advanced'
      - `code_template` (text, required) - Starting code template
      - `solution_code` (text, required) - Reference solution
      - `test_code` (text, required) - Code to test the solution
      - `order_number` (integer, required) - For project sequence
      - `points` (integer, required) - Points earned for completion
      - `created_at` (timestamp)
      
    - `python_project_progress` - Tracks user progress
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `project_id` (uuid, foreign key)
      - `status` (text, required) - 'not_started', 'in_progress', 'completed'
      - `user_code` (text) - The user's current code
      - `completed_at` (timestamp)
      - `created_at` (timestamp)
    
  2. Security
    - Enable RLS on both tables
    - Add appropriate security policies
*/

-- Create the python_projects table
CREATE TABLE IF NOT EXISTS python_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  code_template text NOT NULL,
  solution_code text NOT NULL,
  test_code text NOT NULL,
  order_number integer NOT NULL,
  points integer NOT NULL DEFAULT 100,
  created_at timestamptz DEFAULT now()
);

-- Create the python_project_progress table
CREATE TABLE IF NOT EXISTS python_project_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES python_projects(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')),
  user_code text,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, project_id)
);

-- Enable Row Level Security
ALTER TABLE python_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE python_project_progress ENABLE ROW LEVEL SECURITY;

-- Set up security policies for python_projects
CREATE POLICY "Anyone can view projects" 
  ON python_projects
  FOR SELECT
  TO public
  USING (true);

-- Set up security policies for python_project_progress
CREATE POLICY "Users can create their own progress" 
  ON python_project_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own progress" 
  ON python_project_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
  ON python_project_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);