/*
  # Add Code Translation Game Tables

  1. New Tables
    - `code_challenges`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `title` (text)
      - `description` (text)
      - `code` (text)
      - `is_python` (boolean) - true if Python code, false if pseudocode
      - `created_at` (timestamp)
    
    - `code_translations`
      - `id` (uuid, primary key)
      - `challenge_id` (uuid, foreign key to code_challenges)
      - `user_id` (uuid, foreign key to users)
      - `translation` (text)
      - `votes` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for:
      - Anyone can read challenges and translations
      - Authenticated users can create challenges and translations
      - Users can only update/delete their own submissions
*/

-- Create code challenges table
CREATE TABLE IF NOT EXISTS code_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  title text NOT NULL,
  description text,
  code text NOT NULL,
  is_python boolean NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT code_length_check CHECK (length(code) >= 10)
);

-- Create code translations table
CREATE TABLE IF NOT EXISTS code_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES code_challenges(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) NOT NULL,
  translation text NOT NULL,
  votes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT translation_length_check CHECK (length(translation) >= 10)
);

-- Enable RLS
ALTER TABLE code_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_translations ENABLE ROW LEVEL SECURITY;

-- Policies for code_challenges
CREATE POLICY "Anyone can view challenges"
  ON code_challenges
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create challenges"
  ON code_challenges
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenges"
  ON code_challenges
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own challenges"
  ON code_challenges
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for code_translations
CREATE POLICY "Anyone can view translations"
  ON code_translations
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create translations"
  ON code_translations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own translations"
  ON code_translations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own translations"
  ON code_translations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);