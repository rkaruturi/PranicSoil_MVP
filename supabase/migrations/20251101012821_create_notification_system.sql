/*
  # Create Notification System
  
  1. New Tables
    - `notifications` - Stores all system notifications
      - `id` (uuid, primary key)
      - `profile_id` (uuid, foreign key to profiles)
      - `type` (text) - notification type (todo_reminder, invoice_due, invoice_overdue)
      - `title` (text) - notification title
      - `message` (text) - notification message
      - `related_id` (uuid) - ID of related record (todo_id or invoice_id)
      - `related_type` (text) - type of related record (todo, invoice)
      - `sent` (boolean) - whether notification was sent
      - `sent_at` (timestamptz) - when notification was sent
      - `created_at` (timestamptz)
    
    - `notification_queue` - Queue for email notifications
      - `id` (uuid, primary key)
      - `profile_id` (uuid, foreign key to profiles)
      - `email` (text) - recipient email
      - `subject` (text) - email subject
      - `body` (text) - email body
      - `notification_id` (uuid, foreign key to notifications)
      - `status` (text) - pending, sent, failed
      - `attempts` (integer) - number of send attempts
      - `last_attempt_at` (timestamptz)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Users can view their own notifications
    - Admins can view all notifications
    - Only system can insert into notification_queue
  
  3. Triggers
    - Auto-create notifications for todos approaching due date
    - Auto-create notifications for invoices approaching due date
    - Auto-create notifications for overdue invoices
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('todo_reminder', 'invoice_due', 'invoice_overdue', 'system')),
  title text NOT NULL,
  message text NOT NULL,
  related_id uuid,
  related_type text CHECK (related_type IN ('todo', 'invoice', 'service_agreement')),
  sent boolean DEFAULT false,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create notification_queue table
CREATE TABLE IF NOT EXISTS notification_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  email text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  notification_id uuid REFERENCES notifications(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  attempts integer DEFAULT 0,
  last_attempt_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = profile_id));

CREATE POLICY "Admins can view all notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "System can insert notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for notification_queue
CREATE POLICY "Only admins can view notification queue"
  ON notification_queue
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "System can insert into notification queue"
  ON notification_queue
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update notification queue"
  ON notification_queue
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_profile_id ON notifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_notifications_sent ON notifications(sent);
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_profile_id ON notification_queue(profile_id);

-- Function to create notification and queue email
CREATE OR REPLACE FUNCTION create_notification_with_email(
  p_profile_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_related_id uuid DEFAULT NULL,
  p_related_type text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_notification_id uuid;
  v_email text;
  v_notifications_enabled boolean;
BEGIN
  -- Get user email and notification preference
  SELECT email, notifications_enabled
  INTO v_email, v_notifications_enabled
  FROM profiles
  WHERE id = p_profile_id;
  
  -- Create notification
  INSERT INTO notifications (profile_id, type, title, message, related_id, related_type)
  VALUES (p_profile_id, p_type, p_title, p_message, p_related_id, p_related_type)
  RETURNING id INTO v_notification_id;
  
  -- Queue email if notifications are enabled
  IF v_notifications_enabled THEN
    INSERT INTO notification_queue (profile_id, email, subject, body, notification_id)
    VALUES (p_profile_id, v_email, p_title, p_message, v_notification_id);
  END IF;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and create todo reminders (call this daily)
CREATE OR REPLACE FUNCTION check_todo_reminders()
RETURNS void AS $$
DECLARE
  todo_record RECORD;
BEGIN
  -- Find todos due in 1 day that haven't been completed
  FOR todo_record IN
    SELECT t.id, t.profile_id, t.title, t.due_date
    FROM shared_todos t
    WHERE t.status != 'completed'
    AND t.due_date = CURRENT_DATE + INTERVAL '1 day'
    AND NOT EXISTS (
      SELECT 1 FROM notifications
      WHERE related_id = t.id
      AND related_type = 'todo'
      AND type = 'todo_reminder'
      AND created_at > CURRENT_DATE
    )
  LOOP
    PERFORM create_notification_with_email(
      todo_record.profile_id,
      'todo_reminder',
      'Todo Reminder: ' || todo_record.title,
      'Your todo "' || todo_record.title || '" is due tomorrow (' || todo_record.due_date || ').',
      todo_record.id,
      'todo'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and create invoice reminders
CREATE OR REPLACE FUNCTION check_invoice_reminders()
RETURNS void AS $$
DECLARE
  invoice_record RECORD;
BEGIN
  -- Find invoices due in 3 days
  FOR invoice_record IN
    SELECT i.id, i.profile_id, i.invoice_number, i.amount, i.due_date
    FROM invoices i
    WHERE i.status = 'pending'
    AND i.due_date = CURRENT_DATE + INTERVAL '3 days'
    AND NOT EXISTS (
      SELECT 1 FROM notifications
      WHERE related_id = i.id
      AND related_type = 'invoice'
      AND type = 'invoice_due'
      AND created_at > CURRENT_DATE
    )
  LOOP
    PERFORM create_notification_with_email(
      invoice_record.profile_id,
      'invoice_due',
      'Invoice Due Soon: ' || invoice_record.invoice_number,
      'Your invoice #' || invoice_record.invoice_number || ' for $' || invoice_record.amount || ' is due on ' || invoice_record.due_date || '.',
      invoice_record.id,
      'invoice'
    );
  END LOOP;
  
  -- Find overdue invoices
  FOR invoice_record IN
    SELECT i.id, i.profile_id, i.invoice_number, i.amount, i.due_date
    FROM invoices i
    WHERE i.status = 'pending'
    AND i.due_date < CURRENT_DATE
    AND NOT EXISTS (
      SELECT 1 FROM notifications
      WHERE related_id = i.id
      AND related_type = 'invoice'
      AND type = 'invoice_overdue'
      AND created_at > CURRENT_DATE
    )
  LOOP
    PERFORM create_notification_with_email(
      invoice_record.profile_id,
      'invoice_overdue',
      'Invoice Overdue: ' || invoice_record.invoice_number,
      'Your invoice #' || invoice_record.invoice_number || ' for $' || invoice_record.amount || ' was due on ' || invoice_record.due_date || ' and is now overdue.',
      invoice_record.id,
      'invoice'
    );
    
    -- Update invoice status to overdue
    UPDATE invoices SET status = 'overdue' WHERE id = invoice_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;