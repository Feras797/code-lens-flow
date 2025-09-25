# Supabase Setup Guide

This guide will help you set up Supabase for the Environmental Impact Monitoring Platform.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js and npm installed
- Your `.env` file configured with Supabase credentials

## Step 1: Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New project"
3. Fill in the project details:
   - **Project name**: Environmental Impact Platform
   - **Database Password**: Choose a strong password
   - **Region**: Select the closest region to your users
   - **Pricing Plan**: Choose based on your needs (Free tier available)

## Step 2: Configure Environment Variables

1. Once your project is created, go to **Settings → API**
2. Copy the following values to your `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Optional: For server-side operations (keep this secret!)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Step 3: Set Up Database Schema

1. Go to the **SQL Editor** in your Supabase dashboard
2. Click "New query"
3. Copy the entire contents of `supabase/schema.sql`
4. Paste it into the SQL editor
5. Click "Run" to execute the schema creation

This will create:
- All necessary tables (companies, facilities, environmental_metrics, etc.)
- Database views for common queries
- Row Level Security policies
- Triggers and functions
- Sample data (3 companies)

## Step 4: Enable Required Extensions

The schema automatically enables these extensions:
- `uuid-ossp` - For UUID generation
- `postgis` - For geospatial data (optional, comment out if not needed)

If you need vector embeddings for AlphaEarth integration:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

## Step 5: Configure Authentication

1. Go to **Authentication → Settings**
2. Configure the following:
   - **Site URL**: `http://localhost:5173` (for development)
   - **Redirect URLs**: Add `http://localhost:5173/*`
   - **Email Auth**: Enable email/password authentication
   - **Email Templates**: Customize if needed

## Step 6: Set Up Storage (Optional)

If you plan to store company logos, reports, or other files:

1. Go to **Storage**
2. Create buckets:
   ```sql
   INSERT INTO storage.buckets (id, name, public)
   VALUES 
     ('company-logos', 'company-logos', true),
     ('reports', 'reports', false),
     ('environmental-data', 'environmental-data', false);
   ```

## Step 7: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:5173

3. You should see the login screen

4. Create a test account:
   - Click "Sign Up"
   - Enter your email and password
   - Check your email for verification (if email confirmation is enabled)

## Step 8: Verify Database Connection

Test that data fetching works:

1. Sign in to the application
2. Check the browser console for any errors
3. The Companies Overview component should load (may show "No Companies Found" initially)

## Database Structure Overview

### Main Tables

- **companies**: Stores company information
- **facilities**: Company locations/facilities with geographic data
- **environmental_metrics**: Time-series environmental data
- **reference_patches**: Similar land patches for comparison (AlphaEarth)
- **reports**: Environmental impact reports
- **time_series_analysis**: Earth Engine analysis results
- **users**: User profiles (extends Supabase auth)
- **chat_sessions/messages**: AI assistant chat history
- **alerts**: Environmental threshold alerts

### Key Features

- **Row Level Security (RLS)**: Configured for data access control
- **Real-time subscriptions**: Available for live data updates
- **Spatial queries**: Enabled with PostGIS
- **Automatic timestamps**: updated_at triggers
- **Audit logging**: Track all database changes

## Common Operations

### Adding a Company
```javascript
const { data, error } = await supabase
  .from('companies')
  .insert({
    name: 'Company Name',
    description: 'Company description',
    industry: 'Technology'
  })
  .select()
  .single()
```

### Adding a Facility
```javascript
const { data, error } = await supabase
  .from('facilities')
  .insert({
    company_id: 'company-uuid',
    name: 'Facility Name',
    location_name: 'City, Country',
    latitude: 37.7749,
    longitude: -122.4194,
    facility_type: 'Manufacturing'
  })
  .select()
  .single()
```

### Recording Environmental Metrics
```javascript
const { data, error } = await supabase
  .from('environmental_metrics')
  .insert({
    facility_id: 'facility-uuid',
    metric_type: 'co2_emissions',
    value: 1250.50,
    unit: 'tons',
    data_source: 'earth_engine'
  })
```

## Troubleshooting

### Connection Issues

1. Verify your `.env` file has the correct values
2. Check that your Supabase project is active
3. Ensure RLS policies are correctly configured

### Authentication Issues

1. Check email verification settings
2. Verify redirect URLs are configured
3. Check browser console for specific error messages

### Data Not Showing

1. Check RLS policies in Supabase dashboard
2. Verify data exists in tables (SQL Editor)
3. Check browser DevTools Network tab for API responses

## Production Deployment

When deploying to production:

1. Update environment variables in your hosting platform
2. Update Site URL and Redirect URLs in Supabase Auth settings
3. Review and tighten RLS policies
4. Enable additional security features:
   - Email verification
   - Password strength requirements
   - Rate limiting

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)

## Support

If you encounter any issues:
1. Check the Supabase dashboard logs
2. Review the browser console for errors
3. Check the [Supabase Discord](https://discord.supabase.com) community
4. Open an issue in the project repository
