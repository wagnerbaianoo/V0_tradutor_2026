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
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   DATABASE_URL=your_database_url
   DIRECT_URL=your_direct_url
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=https://your-domain.vercel.app
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   FLUE_LIVE_SECRET=your_flue_secret
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
