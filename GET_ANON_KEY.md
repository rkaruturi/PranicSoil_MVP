# Get Your Supabase Anon Key

## Quick Steps:

1. **Open this URL in your browser:**
   https://app.supabase.com/project/YOUR_PROJECT_ID/settings/api
   (Replace YOUR_PROJECT_ID with your actual Supabase project ID)

2. **Find "Project API keys" section**

3. **Copy the `anon` `public` key** (it's a long string starting with `eyJ...`)

4. **Open the `.env` file** in PranicSoil_MVP folder

5. **Replace `your-anon-key-here`** with your actual anon key

Your `.env` should look like:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ANON_KEY_HERE
```

**After updating the .env file, come back and we'll deploy the function!**

