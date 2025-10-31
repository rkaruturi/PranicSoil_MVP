/*
  # Add Foreign Key Indexes for Performance

  1. Performance Improvements
    - Add indexes on all foreign key columns to improve query performance
    - Indexes created for:
      * chat_history.profile_id
      * documents.profile_id
      * invoices.profile_id
      * invoices.service_agreement_id
      * profiles.user_id
      * service_agreements.profile_id
      * shared_todos.profile_id
      * shared_todos.created_by
      * shared_todos.assigned_to
      * todo_comments.profile_id
      * todo_comments.todo_id
    
  2. Notes
    - Uses IF NOT EXISTS to prevent errors if indexes already exist
    - Improves JOIN and WHERE clause performance on foreign keys
*/

-- Add index for chat_history.profile_id
CREATE INDEX IF NOT EXISTS idx_chat_history_profile_id 
ON chat_history(profile_id);

-- Add index for documents.profile_id
CREATE INDEX IF NOT EXISTS idx_documents_profile_id 
ON documents(profile_id);

-- Add index for invoices.profile_id
CREATE INDEX IF NOT EXISTS idx_invoices_profile_id 
ON invoices(profile_id);

-- Add index for invoices.service_agreement_id
CREATE INDEX IF NOT EXISTS idx_invoices_service_agreement_id 
ON invoices(service_agreement_id);

-- Add index for profiles.user_id
CREATE INDEX IF NOT EXISTS idx_profiles_user_id 
ON profiles(user_id);

-- Add index for service_agreements.profile_id
CREATE INDEX IF NOT EXISTS idx_service_agreements_profile_id 
ON service_agreements(profile_id);

-- Add index for shared_todos.profile_id
CREATE INDEX IF NOT EXISTS idx_shared_todos_profile_id 
ON shared_todos(profile_id);

-- Add index for shared_todos.created_by
CREATE INDEX IF NOT EXISTS idx_shared_todos_created_by 
ON shared_todos(created_by);

-- Add index for shared_todos.assigned_to
CREATE INDEX IF NOT EXISTS idx_shared_todos_assigned_to 
ON shared_todos(assigned_to);

-- Add index for todo_comments.profile_id
CREATE INDEX IF NOT EXISTS idx_todo_comments_profile_id 
ON todo_comments(profile_id);

-- Add index for todo_comments.todo_id
CREATE INDEX IF NOT EXISTS idx_todo_comments_todo_id 
ON todo_comments(todo_id);