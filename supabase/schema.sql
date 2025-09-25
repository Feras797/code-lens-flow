-- Environmental Impact Monitoring Platform - Database Schema
-- Run this script in your Supabase SQL editor to create all necessary tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For geospatial data

-- Create companies table
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    industry VARCHAR(100),
    headquarters_location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create facilities table (company locations)
CREATE TABLE IF NOT EXISTS public.facilities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    facility_type VARCHAR(100),
    size_hectares DECIMAL(10, 2),
    operational_since DATE,
    environmental_data JSONB,
    geometry GEOGRAPHY(POINT, 4326), -- PostGIS point for spatial queries
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, name)
);

-- Create index for spatial queries
CREATE INDEX IF NOT EXISTS idx_facilities_geometry ON public.facilities USING GIST(geometry);

-- Create environmental_metrics table
CREATE TABLE IF NOT EXISTS public.environmental_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
    metric_type VARCHAR(100) NOT NULL, -- e.g., 'co2_emissions', 'water_usage', 'deforestation_rate'
    value DECIMAL(20, 6) NOT NULL,
    unit VARCHAR(50) NOT NULL, -- e.g., 'tons', 'liters', 'hectares'
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_source VARCHAR(100), -- e.g., 'earth_engine', 'manual_report', 'sensor'
    confidence_score DECIMAL(3, 2), -- 0.00 to 1.00
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for time-series queries
CREATE INDEX IF NOT EXISTS idx_environmental_metrics_facility_time 
    ON public.environmental_metrics(facility_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_environmental_metrics_type 
    ON public.environmental_metrics(metric_type);

-- Create reference_patches table (for AlphaEarth embeddings comparison)
CREATE TABLE IF NOT EXISTS public.reference_patches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
    patch_id VARCHAR(255) NOT NULL, -- AlphaEarth patch identifier
    similarity_score DECIMAL(3, 2) NOT NULL, -- 0.00 to 1.00
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    patch_type VARCHAR(100), -- e.g., 'pristine', 'similar_industry', 'control'
    embedding_vector VECTOR(768), -- If using pgvector for embeddings
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    report_type VARCHAR(50) NOT NULL, -- e.g., 'annual', 'quarterly', 'incident'
    title VARCHAR(255) NOT NULL,
    content TEXT,
    summary TEXT,
    file_url TEXT,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'published', 'archived'
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create time_series_analysis table (for Earth Engine data)
CREATE TABLE IF NOT EXISTS public.time_series_analysis (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
    analysis_type VARCHAR(100) NOT NULL, -- e.g., 'vegetation_index', 'land_cover_change'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    data_points JSONB NOT NULL, -- Array of {date, value} objects
    trend VARCHAR(50), -- 'improving', 'stable', 'degrading'
    change_percentage DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'viewer', -- 'viewer', 'analyst', 'admin'
    organization VARCHAR(255),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_sessions table (for AI assistant)
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    title VARCHAR(255),
    context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- 'user', 'assistant'
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alerts table (for environmental threshold alerts)
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    threshold_value DECIMAL(20, 6),
    actual_value DECIMAL(20, 6),
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_log table
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create views for common queries

-- View: Company environmental summary
CREATE OR REPLACE VIEW public.company_environmental_summary AS
SELECT 
    c.id as company_id,
    c.name as company_name,
    COUNT(DISTINCT f.id) as facility_count,
    COUNT(DISTINCT em.id) as total_metrics,
    AVG(CASE WHEN em.metric_type = 'co2_emissions' THEN em.value END) as avg_co2_emissions,
    MAX(em.recorded_at) as last_updated
FROM public.companies c
LEFT JOIN public.facilities f ON c.id = f.company_id
LEFT JOIN public.environmental_metrics em ON f.id = em.facility_id
GROUP BY c.id, c.name;

-- View: Recent alerts
CREATE OR REPLACE VIEW public.recent_alerts AS
SELECT 
    a.*,
    f.name as facility_name,
    c.name as company_name
FROM public.alerts a
JOIN public.facilities f ON a.facility_id = f.id
JOIN public.companies c ON f.company_id = c.id
WHERE a.triggered_at > NOW() - INTERVAL '30 days'
ORDER BY a.triggered_at DESC;

-- Create RLS (Row Level Security) Policies

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.environmental_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reference_patches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_series_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your needs)

-- Companies: Everyone can read
CREATE POLICY "Companies are viewable by everyone" 
    ON public.companies FOR SELECT 
    USING (true);

-- Companies: Only admins can insert/update/delete
CREATE POLICY "Companies are editable by admins" 
    ON public.companies FOR ALL 
    USING (auth.uid() IN (
        SELECT id FROM public.users WHERE role = 'admin'
    ));

-- Facilities: Everyone can read
CREATE POLICY "Facilities are viewable by everyone" 
    ON public.facilities FOR SELECT 
    USING (true);

-- Environmental metrics: Everyone can read
CREATE POLICY "Environmental metrics are viewable by everyone" 
    ON public.environmental_metrics FOR SELECT 
    USING (true);

-- Reports: Everyone can read published reports
CREATE POLICY "Published reports are viewable by everyone" 
    ON public.reports FOR SELECT 
    USING (status = 'published' OR auth.uid() IN (
        SELECT id FROM public.users WHERE role IN ('admin', 'analyst')
    ));

-- Users: Users can read their own profile
CREATE POLICY "Users can view own profile" 
    ON public.users FOR SELECT 
    USING (auth.uid() = id);

-- Users: Users can update their own profile
CREATE POLICY "Users can update own profile" 
    ON public.users FOR UPDATE 
    USING (auth.uid() = id);

-- Chat sessions: Users can only see their own sessions
CREATE POLICY "Users can view own chat sessions" 
    ON public.chat_sessions FOR SELECT 
    USING (auth.uid() = user_id);

-- Chat messages: Users can only see messages from their sessions
CREATE POLICY "Users can view messages from own sessions" 
    ON public.chat_messages FOR SELECT 
    USING (session_id IN (
        SELECT id FROM public.chat_sessions WHERE user_id = auth.uid()
    ));

-- Create functions for common operations

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to auto-update updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON public.facilities
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON public.chat_sessions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically set facility geometry from lat/lon
CREATE OR REPLACE FUNCTION public.set_facility_geometry()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geometry = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-set geometry
CREATE TRIGGER set_facility_geometry BEFORE INSERT OR UPDATE ON public.facilities
    FOR EACH ROW EXECUTE FUNCTION public.set_facility_geometry();

-- Insert sample data (optional - remove in production)
INSERT INTO public.companies (name, description, industry) VALUES 
    ('Tesla Inc.', 'Electric vehicle and clean energy company', 'Automotive/Energy'),
    ('Amazon', 'E-commerce and cloud computing company', 'Technology/Retail'),
    ('Shell', 'Oil and gas multinational company', 'Energy')
ON CONFLICT (name) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_facilities_company_id ON public.facilities(company_id);
CREATE INDEX IF NOT EXISTS idx_environmental_metrics_recorded_at ON public.environmental_metrics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_company_id ON public.reports(company_id);
CREATE INDEX IF NOT EXISTS idx_alerts_facility_id ON public.alerts(facility_id);
CREATE INDEX IF NOT EXISTS idx_alerts_is_resolved ON public.alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);
