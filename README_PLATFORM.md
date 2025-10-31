# Pranic Soil Agricultural Consultation Platform

A complete web-based agricultural consultation MVP featuring role-specific user registration, AI-powered chat assistance, document management, and collaborative task tracking.

## Features Implemented

### 1. **Authentication & User Management**
- Email/password authentication powered by Supabase
- Role-based registration for three user types:
  - **Gardeners**: Home gardens, community gardens, urban farming
  - **Farmers**: Commercial farming operations and crop production
  - **Ranchers**: Livestock operations and grazing management
- Secure login with protected routes
- Dynamic registration forms adapting to selected role

### 2. **Public Welcome Page**
- Beautiful landing page with role selection cards
- Service overview and "How It Works" section
- Voice chat interface placeholder for general business inquiries
- Clear call-to-action buttons for sign up and sign in

### 3. **User Dashboard**
- **Overview Tab**: Statistics cards, quick actions, recent activity
- **Profile Tab**: Editable profile with role-specific fields
  - Gardeners: property size, garden type, growing zones, soil type, challenges
  - Farmers: farm size, crop types, farming practices, challenges
  - Ranchers: ranch size, livestock types, grazing management, challenges
- **Documents Tab**: Upload and view soil tests, photos, farm plans
- **To-Do List Tab**: Collaborative task management
  - Create, update, and complete tasks
  - Priority levels (low, medium, high)
  - Due dates and status tracking
  - Shared between clients and admin
- **Agreements Tab**: View service agreements and invoices
  - Service agreement status tracking
  - Invoice management with payment status
  - Payment integration stubs (ready for Stripe)
- **AI Assistant Tab**: Contextual chat interface
  - Voice input toggle (placeholder for future implementation)
  - Personalized responses based on user role and profile
  - Chat history display
  - Context-aware assistance

### 4. **Database Schema**
All tables are created with Row Level Security (RLS) enabled:
- `profiles`: User profiles with role information
- `gardener_profiles`, `farmer_profiles`, `rancher_profiles`: Role-specific data
- `service_agreements`: Contract and service tracking
- `invoices`: Payment and billing management
- `shared_todos`: Collaborative task list with comments
- `chat_history`: Conversation logs for context retention
- `documents`: File metadata and storage references

### 5. **Security**
- Row Level Security policies ensure data isolation
- Users can only access their own data
- Admin role has elevated permissions (ready for admin dashboard)
- Secure authentication flows with Supabase Auth

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Routing**: React Router v7
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Supabase
  - Authentication
  - PostgreSQL Database
  - Row Level Security
- **Build Tool**: Vite

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account (already configured)

### Environment Variables
The `.env` file contains:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Type Check
```bash
npm run typecheck
```

## User Flows

### Registration Flow
1. User visits welcome page
2. Selects role (gardener/farmer/rancher)
3. Fills out general information (name, email, phone)
4. Provides role-specific details
5. Creates account and is redirected to dashboard

### Dashboard Flow
1. User logs in
2. Sees personalized overview with statistics
3. Can edit profile information
4. Upload and manage documents
5. Create and track tasks
6. View agreements and invoices
7. Chat with AI assistant for personalized advice

## Future Enhancements

### Voice Chat Integration
- Real-time speech-to-text using Web Speech API
- Text-to-speech for assistant responses
- Integration with AI providers (OpenAI, Anthropic, etc.)

### Payment Processing
- Stripe integration for invoice payments
- Subscription management
- Payment history tracking

### Admin Dashboard
- User management interface
- Service agreement creation tools
- Task assignment to clients
- Chat history review
- Analytics and reporting

### Document Storage
- Supabase Storage integration
- Direct file uploads
- Image preview and processing
- PDF generation for reports

### Enhanced AI Features
- Document analysis (soil tests, photos)
- Personalized recommendations based on location
- Seasonal planning assistance
- Pest and disease identification

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ChatInterface.tsx
│   ├── DocumentsList.tsx
│   ├── ProfileSection.tsx
│   ├── ProtectedRoute.tsx
│   ├── ServiceAgreements.tsx
│   └── TodoList.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── lib/               # Utilities and configurations
│   └── supabase.ts
├── pages/             # Page components
│   ├── DashboardPage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── WelcomePage.tsx
├── types/             # TypeScript type definitions
│   └── database.ts
├── App.tsx            # Main app component with routing
└── main.tsx           # Application entry point
```

## Database Policies

All tables implement restrictive RLS policies:
- Users can only view and edit their own data
- Shared resources (todos, comments) accessible to both creator and assignee
- Admin users have cross-user access
- Public chat history allows anonymous access for welcome page

## Notes

- Email verification is disabled by default in Supabase Auth
- Voice features are placeholder UI (implementation ready for integration)
- Payment buttons are stubbed (Stripe integration architecture ready)
- Chat responses are placeholder (ready for AI API integration)
- Admin dashboard is architecturally prepared but not yet implemented

## Support

For technical issues or questions about the platform implementation, refer to the inline code documentation or review the database schema in Supabase.
