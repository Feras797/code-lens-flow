-- Supabase schema extensions for storing LangChain analysis results
-- Run this migration in your Supabase SQL editor

-- Create claude_chat_logs table (main conversation data)
CREATE TABLE IF NOT EXISTS claude_chat_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_query TEXT NOT NULL,
  claude_response TEXT,
  user_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  interaction_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  anonymous_user_id TEXT,
  project_name TEXT NOT NULL,
  installation_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  completed_at TIMESTAMPTZ
);

-- Create indexes for claude_chat_logs
CREATE INDEX IF NOT EXISTS idx_claude_chat_logs_project_id ON claude_chat_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_claude_chat_logs_user_id ON claude_chat_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_claude_chat_logs_timestamp ON claude_chat_logs(interaction_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_claude_chat_logs_status ON claude_chat_logs(status);

-- Table for storing team health analysis results
CREATE TABLE IF NOT EXISTS team_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  analysis_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  team_health_score INTEGER NOT NULL CHECK (team_health_score >= 1 AND team_health_score <= 10),
  key_topics TEXT[] NOT NULL DEFAULT '{}',
  collaboration_patterns TEXT NOT NULL,
  risk_indicators TEXT[] DEFAULT '{}',
  productivity_trends TEXT NOT NULL,
  communication_quality INTEGER NOT NULL CHECK (communication_quality >= 1 AND communication_quality <= 10),
  knowledge_sharing_level INTEGER NOT NULL CHECK (knowledge_sharing_level >= 1 AND knowledge_sharing_level <= 10),
  bottlenecks TEXT[] NOT NULL DEFAULT '{}',
  recommendations TEXT[] NOT NULL DEFAULT '{}',
  conversations_analyzed INTEGER NOT NULL DEFAULT 0,
  model_used TEXT NOT NULL DEFAULT 'gpt-4',
  processing_time_ms INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table for storing developer profile analysis results
CREATE TABLE IF NOT EXISTS developer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  analysis_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expertise_areas TEXT[] NOT NULL DEFAULT '{}',
  learning_trajectory TEXT NOT NULL,
  communication_style TEXT NOT NULL,
  productivity_indicators TEXT[] NOT NULL DEFAULT '{}',
  collaboration_score INTEGER NOT NULL CHECK (collaboration_score >= 1 AND collaboration_score <= 10),
  problem_solving_patterns TEXT[] NOT NULL DEFAULT '{}',
  preferred_topics TEXT[] NOT NULL DEFAULT '{}',
  growth_areas TEXT[] NOT NULL DEFAULT '{}',
  mentoring_potential INTEGER NOT NULL CHECK (mentoring_potential >= 1 AND mentoring_potential <= 10),
  conversations_analyzed INTEGER NOT NULL DEFAULT 0,
  model_used TEXT NOT NULL DEFAULT 'gpt-4',
  processing_time_ms INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table for storing individual conversation insights
CREATE TABLE IF NOT EXISTS conversation_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id TEXT NOT NULL REFERENCES claude_chat_logs(id) ON DELETE CASCADE,
  user_query TEXT NOT NULL,
  claude_response TEXT,
  extracted_topics TEXT[] NOT NULL DEFAULT '{}',
  conversation_type TEXT NOT NULL CHECK (conversation_type IN ('learning', 'problem_solving', 'collaboration', 'exploration', 'debugging')),
  complexity_level TEXT NOT NULL CHECK (complexity_level IN ('beginner', 'intermediate', 'advanced')),
  emotional_tone TEXT NOT NULL CHECK (emotional_tone IN ('positive', 'neutral', 'frustrated', 'excited')),
  learning_indicators TEXT[] NOT NULL DEFAULT '{}',
  technical_concepts TEXT[] NOT NULL DEFAULT '{}',
  decision_points TEXT[] NOT NULL DEFAULT '{}',
  analysis_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  model_used TEXT NOT NULL DEFAULT 'gpt-4',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table for storing project health metrics
CREATE TABLE IF NOT EXISTS project_health_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  analysis_period_start TIMESTAMPTZ NOT NULL,
  analysis_period_end TIMESTAMPTZ NOT NULL,
  overall_health INTEGER NOT NULL CHECK (overall_health >= 1 AND overall_health <= 10),
  velocity_trend TEXT NOT NULL CHECK (velocity_trend IN ('increasing', 'stable', 'decreasing')),
  team_cohesion INTEGER NOT NULL CHECK (team_cohesion >= 1 AND team_cohesion <= 10),
  knowledge_distribution INTEGER NOT NULL CHECK (knowledge_distribution >= 1 AND knowledge_distribution <= 10),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  critical_issues TEXT[] NOT NULL DEFAULT '{}',
  strengths TEXT[] NOT NULL DEFAULT '{}',
  improvement_areas TEXT[] NOT NULL DEFAULT '{}',
  predicted_outcomes TEXT[] NOT NULL DEFAULT '{}',
  analysis_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table for storing risk assessments
CREATE TABLE IF NOT EXISTS risk_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id TEXT NOT NULL,
  risk_type TEXT NOT NULL CHECK (risk_type IN ('technical', 'communication', 'resource', 'timeline', 'knowledge')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  indicators TEXT[] NOT NULL DEFAULT '{}',
  potential_impact TEXT NOT NULL,
  recommended_actions TEXT[] NOT NULL DEFAULT '{}',
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  analysis_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table for analysis job tracking and caching
CREATE TABLE IF NOT EXISTS analysis_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_type TEXT NOT NULL CHECK (job_type IN ('team_health', 'developer_profile', 'conversation_insights', 'project_health', 'risk_assessment')),
  project_id TEXT,
  user_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  request_parameters JSONB NOT NULL DEFAULT '{}',
  result_data JSONB,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  conversations_analyzed INTEGER DEFAULT 0,
  processing_time_ms INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_team_insights_project_date ON team_insights(project_id, analysis_date DESC);
CREATE INDEX IF NOT EXISTS idx_developer_profiles_user_date ON developer_profiles(user_id, analysis_date DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_insights_conversation_id ON conversation_insights(conversation_id);
CREATE INDEX IF NOT EXISTS idx_project_health_metrics_project_date ON project_health_metrics(project_id, analysis_date DESC);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_project_severity ON risk_assessments(project_id, severity, resolved);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_type_status ON analysis_jobs(job_type, status);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_project_created ON analysis_jobs(project_id, created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all analysis tables
DROP TRIGGER IF EXISTS update_claude_chat_logs_updated_at ON claude_chat_logs;
CREATE TRIGGER update_claude_chat_logs_updated_at
    BEFORE UPDATE ON claude_chat_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_team_insights_updated_at ON team_insights;
CREATE TRIGGER update_team_insights_updated_at
    BEFORE UPDATE ON team_insights
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_developer_profiles_updated_at ON developer_profiles;
CREATE TRIGGER update_developer_profiles_updated_at
    BEFORE UPDATE ON developer_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversation_insights_updated_at ON conversation_insights;
CREATE TRIGGER update_conversation_insights_updated_at
    BEFORE UPDATE ON conversation_insights
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_health_metrics_updated_at ON project_health_metrics;
CREATE TRIGGER update_project_health_metrics_updated_at
    BEFORE UPDATE ON project_health_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_risk_assessments_updated_at ON risk_assessments;
CREATE TRIGGER update_risk_assessments_updated_at
    BEFORE UPDATE ON risk_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_analysis_jobs_updated_at ON analysis_jobs;
CREATE TRIGGER update_analysis_jobs_updated_at
    BEFORE UPDATE ON analysis_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE claude_chat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_jobs ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (adjust based on your auth requirements)
-- Allow authenticated users to read all analysis data
CREATE POLICY "Allow authenticated read access" ON claude_chat_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read access" ON team_insights FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read access" ON developer_profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read access" ON conversation_insights FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read access" ON project_health_metrics FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read access" ON risk_assessments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read access" ON analysis_jobs FOR SELECT USING (auth.role() = 'authenticated');

-- Allow service role (for server-side operations) to have full access
CREATE POLICY "Allow service role full access" ON claude_chat_logs FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Allow service role full access" ON team_insights FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Allow service role full access" ON developer_profiles FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Allow service role full access" ON conversation_insights FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Allow service role full access" ON project_health_metrics FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Allow service role full access" ON risk_assessments FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Allow service role full access" ON analysis_jobs FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create views for easier querying
CREATE OR REPLACE VIEW latest_team_insights AS
SELECT DISTINCT ON (project_id) *
FROM team_insights
ORDER BY project_id, analysis_date DESC;

CREATE OR REPLACE VIEW latest_developer_profiles AS
SELECT DISTINCT ON (user_id) *
FROM developer_profiles
ORDER BY user_id, analysis_date DESC;

CREATE OR REPLACE VIEW active_risks AS
SELECT *
FROM risk_assessments
WHERE resolved = FALSE
ORDER BY severity DESC, created_at DESC;

-- Grant appropriate permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;