-- migration_add_category_style.sql
-- Add type, icon, and color columns to categories table and update row level security policies

ALTER TABLE categories ADD COLUMN IF NOT EXISTS type text;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon text;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS color text;

-- Ensure RLS is active on categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Select policy: users can read their own categories
CREATE POLICY IF NOT EXISTS "Allow own categories select" 
  ON categories FOR SELECT 
  USING (auth.uid() = user_id);

-- Insert policy: users can insert their own categories
CREATE POLICY IF NOT EXISTS "Allow own categories insert" 
  ON categories FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Update policy: users can update their own categories
CREATE POLICY IF NOT EXISTS "Allow own categories update" 
  ON categories FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Delete policy: users can delete their own categories
CREATE POLICY IF NOT EXISTS "Allow own categories delete" 
  ON categories FOR DELETE 
  USING (auth.uid() = user_id);
