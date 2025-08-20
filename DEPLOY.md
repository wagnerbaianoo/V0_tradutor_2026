# TranslateEvent V5 - Deploy Guide

## Production Deployment on Vercel

### Prerequisites

1. **Supabase Project**: Set up a Supabase project with the database schema
2. **Vercel Account**: Create a Vercel account and connect your GitHub repository
3. **Environment Variables**: Configure all required environment variables

### Step 1: Database Setup

1. Create a new Supabase project
2. Run the database migrations:
   \`\`\`sql
   -- Run scripts/01_create_database_schema.sql
   -- Run scripts/04_seed_production_data.sql
   \`\`\`
3. Enable Row Level Security (RLS) policies
4. Note down your Supabase URL and keys

### Step 2: Vercel Configuration

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Configure Build Settings**:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Install Command: `npm install`
   - Output Directory: `.next`

3. **Environment Variables** (Add in Vercel Dashboard):
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=https://hqysuzssoovvsokpkcdx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxeXN1enNzb292dnNva3BrY2R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NjcwMTYsImV4cCI6MjA3MTI0MzAxNn0.tQ2e1WSUj_muZdXIVs-BvQP4Zsc2zMqC7djNIhosMPA
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxeXN1enNzb292dnNva3BrY2R4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY2NzAxNiwiZXhwIjoyMDcxMjQzMDE2fQ.WOZSbfdOHDXtZ1AF2f73lmSbQNWtKtoh7H2c-P15drg
   DATABASE_URL=postgresql://postgres:W5g3n300890@db.hqysuzssoovvsokpkcdx.supabase.co:5432/postgres
   DIRECT_URL=postgresql://postgres:W5g3n300890@db.hqysuzssoovvsokpkcdx.supabase.co:5432/postgres
   NEXTAUTH_SECRET=prj_3FEXMp1gtb1LCPSCsxlQfo9iRlJJ
   NEXTAUTH_URL=https://xn--v0-repositrio-link-nu-ucc.vercel.app/
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=https://xn--v0-repositrio-link-nu-ucc.vercel.app/
   FLUE_LIVE_SECRET=0637c27d5db14166929dfaa32e9bfed9
   \`\`\`

### Step 3: Domain Configuration

1. **Custom Domain** (Optional): Add your custom domain in Vercel
2. **SSL Certificate**: Vercel automatically provides SSL certificates
3. **DNS Configuration**: Update your DNS records to point to Vercel

### Step 4: Post-Deployment

1. **Database Seeding**: Run the seed script to create demo users and events
2. **User Creation**: Create your first admin user through the Supabase dashboard
3. **Testing**: Test all functionality including:
   - User authentication and roles
   - Event creation and management
   - Audio streaming (WHIP/WHEP)
   - Translation channels

### Step 5: Monitoring and Maintenance

1. **Vercel Analytics**: Enable analytics for performance monitoring
2. **Error Tracking**: Monitor function logs in Vercel dashboard
3. **Database Monitoring**: Use Supabase dashboard for database health
4. **Regular Backups**: Set up automated database backups

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | NextAuth secret key | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `FLUE_LIVE_SECRET` | Flue.live streaming secret | Yes |

## Security Considerations

1. **Environment Variables**: Never commit secrets to version control
2. **RLS Policies**: Ensure Row Level Security is properly configured
3. **CORS Headers**: Configure appropriate CORS policies
4. **Rate Limiting**: Implement rate limiting for API endpoints
5. **Input Validation**: Validate all user inputs on both client and server

## Performance Optimization

1. **Image Optimization**: Use Next.js Image component
2. **Code Splitting**: Implement dynamic imports for large components
3. **Caching**: Configure appropriate caching headers
4. **CDN**: Leverage Vercel's global CDN
5. **Database Indexing**: Ensure proper database indexes are in place

## Troubleshooting

### Common Issues

1. **Build Failures**: Check TypeScript errors and missing dependencies
2. **Database Connection**: Verify connection strings and network access
3. **Authentication Issues**: Check Supabase configuration and RLS policies
4. **Streaming Problems**: Verify Flue.live configuration and WHIP/WHEP URLs

### Support

For deployment issues, check:
1. Vercel function logs
2. Supabase logs and metrics
3. Browser developer console
4. Network requests in browser dev tools
