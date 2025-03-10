/*
  # Fix RLS policies for code_translations table

  1. Changes
    - Modify the INSERT policy for code_translations to allow users to create translations
    - Keep security for other operations (update/delete) unchanged
  
  2. Security
    - Users can still only modify/delete their own translations
    - All users can view all translations (unchanged)
*/

-- Drop the existing INSERT policy for translations if it exists
DROP POLICY IF EXISTS "Authenticated users can create translations" ON code_translations;

-- Create a new INSERT policy that works with our authentication system
CREATE POLICY "Anyone can create translations" 
ON code_translations 
FOR INSERT 
TO public
WITH CHECK (true);