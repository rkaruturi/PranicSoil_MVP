# Admin System Setup

## Admin Credentials

**Email:** admin@pranicsoil.com
**Password:** Admin@PranicSoil2024

## Admin Features

### Customer Management
- View all active customers in a sortable list
- Click on customer names to view their complete dashboard
- Access to all customer data including:
  - Profile information
  - Service agreements
  - To-do lists
  - Documents
  - Chat history

### Admin Dashboard Access
1. Login with admin credentials
2. Navigate to the "Admin" tab in the sidebar
3. View list of all customers (excludes other admin accounts)
4. Click on any customer name or "View Dashboard" button
5. Access complete customer dashboard with all data
6. Click "Back to Customers" to return to the list

### Edit Permissions
As an admin, you can:
- View all customer profile information
- Update customer notification preferences
- View and manage customer todos
- Access all service agreements
- View uploaded documents
- Review chat history

## Notification System

### Automated Email Alerts

The system includes automated notifications for:

1. **Todo Reminders**
   - Sent 1 day before todo due date
   - Only for incomplete todos
   - Respects customer notification preferences

2. **Invoice Due Reminders**
   - Sent 3 days before invoice due date
   - Only for pending invoices
   - Includes invoice number and amount

3. **Overdue Invoice Alerts**
   - Sent when invoices become overdue
   - Automatically updates invoice status to "overdue"
   - Includes payment details

### Notification Preferences
- Customers can enable/disable notifications in their profile settings
- Admin can view but should update notification preferences carefully
- Notifications are stored in the database even if email sending fails

### Triggering Notifications

Notifications are checked and created by calling database functions:
- `check_todo_reminders()` - Should run daily
- `check_invoice_reminders()` - Should run daily

Example SQL to trigger manually:
```sql
SELECT check_todo_reminders();
SELECT check_invoice_reminders();
```

### Email Notification Service

The system includes an Edge Function `send-notification-emails` that:
- Processes the notification queue
- Logs email sending attempts
- Currently logs emails to console (email service needs to be configured)

To configure actual email sending, integrate with a service like:
- SendGrid
- AWS SES
- Mailgun
- Resend

## Database Tables

### New Tables Created

1. **notifications** - Stores all system notifications
2. **notification_queue** - Queue for pending email notifications

### Row Level Security (RLS)

All tables have proper RLS policies:
- Users can only view their own data
- Admins can view all customer data
- System functions can create and update notifications

## Important Notes

1. **First-time Login**: You may need to register the admin account first through the registration page using the admin email, then the system will automatically assign the admin role.

2. **Data Safety**: All admin actions are logged and auditable through the database.

3. **Customer Privacy**: Exercise caution when viewing customer data and follow privacy best practices.

4. **Notification Scheduling**: Set up a cron job or scheduled task to call the notification check functions daily.

5. **Email Configuration**: The email notification service logs emails but doesn't send them yet. Configure an email service provider for actual email delivery.
