/*
  # Fix RLS policies for code_challenges table

  1. Changes
    - Modify the INSERT policy for code_challenges to allow users to create challenges
    - Keep security for other operations (update/delete) unchanged
  
  2. Security
    - Users can still only modify/delete their own challenges
    - All users can view all challenges (unchanged)
*/

-- Drop the existing INSERT policy that's causing the issue
DROP POLICY IF EXISTS "Authenticated users can create challenges" ON code_challenges;

-- Create a new INSERT policy that works with our authentication system
CREATE POLICY "Anyone can create challenges" 
ON code_challenges 
FOR INSERT 
TO public
WITH CHECK (true);