/*
  # Optimize RLS Policies for Performance

  1. Changes
    - Drop existing RLS policies
    - Recreate all policies with optimized auth function calls
    - Replace auth.uid() with (select auth.uid()) to prevent re-evaluation per row
    - Replace auth.jwt() with (select auth.jwt()) for better performance
    
  2. Security
    - All policies maintain the same security rules
    - Only performance optimization, no functional changes
    
  3. Tables Updated
    - profiles
    - gardener_profiles
    - farmer_profiles
    - rancher_profiles
    - service_agreements
    - invoices
    - shared_todos
    - todo_comments
    - chat_history
    - documents
*/

-- ============================================
-- PROFILES TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    (select auth.jwt()->>'email') IN (
      SELECT email FROM profiles WHERE role = 'admin'
    )
  );

-- ============================================
-- GARDENER PROFILES TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view own gardener profile" ON gardener_profiles;
DROP POLICY IF EXISTS "Users can insert own gardener profile" ON gardener_profiles;
DROP POLICY IF EXISTS "Users can update own gardener profile" ON gardener_profiles;

CREATE POLICY "Users can view own gardener profile"
  ON gardener_profiles FOR SELECT
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert own gardener profile"
  ON gardener_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update own gardener profile"
  ON gardener_profiles FOR UPDATE
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = (select auth.uid())
    )
  );

-- ============================================
-- FARMER PROFILES TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view own farmer profile" ON farmer_profiles;
DROP POLICY IF EXISTS "Users can insert own farmer profile" ON farmer_profiles;
DROP POLICY IF EXISTS "Users can update own farmer profile" ON farmer_profiles;

CREATE POLICY "Users can view own farmer profile"
  ON farmer_profiles FOR SELECT
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert own farmer profile"
  ON farmer_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update own farmer profile"
  ON farmer_profiles FOR UPDATE
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = (select auth.uid())
    )
  );

-- ============================================
-- RANCHER PROFILES TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view own rancher profile" ON rancher_profiles;
DROP POLICY IF EXISTS "Users can insert own rancher profile" ON rancher_profiles;
DROP POLICY IF EXISTS "Users can update own rancher profile" ON rancher_profiles;

CREATE POLICY "Users can view own rancher profile"
  ON rancher_profiles FOR SELECT
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert own rancher profile"
  ON rancher_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update own rancher profile"
  ON rancher_profiles FOR UPDATE
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = (select auth.uid())
    )
  );

-- ============================================
-- SERVICE AGREEMENTS TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view own service agreements" ON service_agreements;
DROP POLICY IF EXISTS "Admins can manage all service agreements" ON service_agreements;

CREATE POLICY "Users can view own service agreements"
  ON service_agreements FOR SELECT
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can manage all service agreements"
  ON service_agreements FOR ALL
  TO authenticated
  USING (
    (select auth.jwt()->>'email') IN (
      SELECT email FROM profiles WHERE role = 'admin'
    )
  );

-- ============================================
-- INVOICES TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
DROP POLICY IF EXISTS "Admins can manage all invoices" ON invoices;

CREATE POLICY "Users can view own invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can manage all invoices"
  ON invoices FOR ALL
  TO authenticated
  USING (
    (select auth.jwt()->>'email') IN (
      SELECT email FROM profiles WHERE role = 'admin'
    )
  );

-- ============================================
-- SHARED TODOS TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view own todos" ON shared_todos;
DROP POLICY IF EXISTS "Users can create todos" ON shared_todos;
DROP POLICY IF EXISTS "Users can update own todos" ON shared_todos;
DROP POLICY IF EXISTS "Admins can manage all todos" ON shared_todos;

CREATE POLICY "Users can view own todos"
  ON shared_todos FOR SELECT
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = (select auth.uid())
    )
    OR created_by IN (
      SELECT id FROM profiles WHERE user_id = (select auth.uid())
    )
    OR assigned_to IN (
      SELECT id FROM profiles WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can create todos"
  ON shared_todos FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by IN (
      SELECT id FROM profiles WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update own todos"
  ON shared_todos FOR UPDATE
  TO authenticated
  USING (
    created_by IN (
      SELECT id FROM profiles WHERE user_id = (select auth.uid())
    )
    OR assigned_to IN (
      SELECT id FROM profiles WHERE user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    created_by IN (
      SELECT id FROM profiles WHERE user_id = (select auth.uid())
    )
    OR assigned_to IN (
      SELECT id FROM profiles WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can manage all todos"
  ON shared_todos FOR ALL
  TO authenticated
  USING (
    (select auth.jwt()->>'email') IN (
      SELECT email FROM profiles WHERE role = 'admin'
    )
  );

-- ============================================
-- TODO COMMENTS TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view comments on their todos" ON todo_comments;
DROP POLICY IF EXISTS "Users can create comments on their todos" ON todo_comments;

CREATE POLICY "Users can view comments on their todos"
  ON todo_comments FOR SELECT
  TO authenticated
  USING (
    todo_id IN (
      SELECT id FROM shared_todos 
      WHERE profile_id IN (
        SELECT id FROM profiles WHERE user_id = (select auth.uid())
      )
    )
  );

CREATE POLICY "Users can create comments on their todos"
  ON todo_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = (select auth.uid())
    )
    AND todo_id IN (
      SELECT id FROM shared_todos 
      WHERE profile_id IN (
        SELECT id FROM profiles WHERE user_id = (select auth.uid())
      )
    )
  );

-- ============================================
-- CHAT HISTORY TABLE
-- ============================================

DROP POLICY IF EXISTS "Public chats viewable by anyone" ON chat_history;
DROP POLICY IF EXISTS "Users can view own authenticated chats" ON chat_history;
DROP POLICY IF EXISTS "Public can insert public chat messages" ON chat_history;
DROP POLICY IF EXISTS "Users can insert own chat messages" ON chat_history;
DROP POLICY IF EXISTS "Admins can view all chats" ON chat_history;

CREATE POLICY "Public chats viewable by anyone"
  ON chat_history FOR SELECT
  TO authenticated
  USING (context_type = 'public');

CREATE POLICY "Users can view own authenticated chats"
  ON chat_history FOR SELECT
  TO authenticated
  USING (
    context_type = 'authenticated' 
    AND profile_id IN (
      SELECT id FROM profiles WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Public can insert public chat messages"
  ON chat_history FOR INSERT
  TO authenticated
  WITH CHECK (context_type = 'public' AND profile_id IS NULL);

CREATE POLICY "Users can insert own chat messages"
  ON chat_history FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can view all chats"
  ON chat_history FOR SELECT
  TO authenticated
  USING (
    (select auth.jwt()->>'email') IN (
      SELECT email FROM profiles WHERE role = 'admin'
    )
  );

-- ============================================
-- DOCUMENTS TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view own documents" ON documents;
DROP POLICY IF EXISTS "Users can upload own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON documents;
DROP POLICY IF EXISTS "Admins can view all documents" ON documents;

CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can upload own documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Admins can view all documents"
  ON documents FOR SELECT
  TO authenticated
  USING (
    (select auth.jwt()->>'email') IN (
      SELECT email FROM profiles WHERE role = 'admin'
    )
  );