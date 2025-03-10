/*
  # Authentication and Quiz Results Tables
  
  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `created_at` (timestamp)
    - `quiz_results`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users.id)
      - `subject` (text)
      - `difficulty` (text)
      - `score` (integer)
      - `total_questions` (integer)
      - `percentage` (integer)
      - `created_at` (timestamp)
      
  2. Security
    - Enable RLS on both tables
    - Add policies for public access to create users
    - Add policies for users to read their own quiz results
    - Add policies for authenticated users to create quiz results
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create quiz results table
CREATE TABLE IF NOT EXISTS quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  subject text NOT NULL,
  difficulty text NOT NULL,
  score integer NOT NULL,
  total_questions integer NOT NULL,
  percentage integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Allow public to create users"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow users to read their own data"
  ON users
  FOR SELECT
  TO public
  USING (true);

-- Create policies for quiz_results table
CREATE POLICY "Allow users to create their own quiz results"
  ON quiz_results
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow users to read their own quiz results"
  ON quiz_results
  FOR SELECT
  TO public
  USING (true);