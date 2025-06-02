# Environment Setup for Data Generation

## Required Environment Variables

To run the data generation script, you need to add the following variables to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Where to Find These Values

### 1. Supabase Dashboard
Go to your Supabase project dashboard: https://app.supabase.com/

### 2. API Settings
Navigate to: **Settings** → **API**

### 3. Copy the Values
- **Project URL**: Copy this to `NEXT_PUBLIC_SUPABASE_URL`
- **Anon/Public Key**: Copy this to `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Service Role Key**: Copy this to `SUPABASE_SERVICE_ROLE_KEY`

## Example .env.local File

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMjI0ODk5MSwiZXhwIjoxOTQ3ODI0OTkxfQ.example_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjMyMjQ4OTkxLCJleHAiOjE5NDc4MjQ5OTF9.example_service_role_key_here
```

## Security Notes

⚠️ **IMPORTANT**: 
- The `SUPABASE_SERVICE_ROLE_KEY` has admin privileges
- Never commit your `.env.local` file to version control
- Keep this key secure and only use it in server-side scripts
- The service role key bypasses Row Level Security (RLS)

## Next Steps

1. Create/update your `.env.local` file with the above variables
2. Run the data generation script: `npm run generate-data`
3. Check your Supabase dashboard to see the generated data 