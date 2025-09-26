/**
 * Mock Dataset Generator for Claude Chat Logs
 * Generates hundreds of realistic user-Claude conversation pairs
 * for testing the analytics and insights features
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Claude Chat Log Types (copied from useSupabase to avoid import issues)
export interface ClaudeChatLog {
  id: string
  user_query: string
  claude_response: string | null
  user_id: string
  project_id: string
  interaction_timestamp: string
  created_at: string
  updated_at: string
  anonymous_user_id: string
  project_name: string
  installation_id: string
  status: 'pending' | 'completed'
  completed_at: string | null
}

// Supabase client (you'll need to set up environment variables)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'your-service-key'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Real team members with names and titles
const teamMembers = [
  {
    id: 'user_sarah_chen',
    anonymousId: 'anon_sarah_chen',
    name: 'Sarah Chen',
    title: 'Junior Frontend Developer',
    type: 'junior_frontend',
    projectFocus: ['react', 'vue', 'css', 'javascript'],
    style: 'curious_learner'
  },
  {
    id: 'user_marcus_rodriguez',
    anonymousId: 'anon_marcus_rodriguez',
    name: 'Marcus Rodriguez',
    title: 'Senior Backend Engineer',
    type: 'senior_backend',
    projectFocus: ['nodejs', 'python', 'databases', 'apis'],
    style: 'precise_technical'
  },
  {
    id: 'user_alex_kim',
    anonymousId: 'anon_alex_kim',
    name: 'Alex Kim',
    title: 'Engineering Team Lead',
    type: 'tech_lead',
    projectFocus: ['architecture', 'performance', 'team', 'devops'],
    style: 'strategic_thinking'
  },
  {
    id: 'user_priya_patel',
    anonymousId: 'anon_priya_patel',
    name: 'Priya Patel',
    title: 'Mobile Developer',
    type: 'mobile_developer',
    projectFocus: ['react_native', 'ios', 'android', 'flutter'],
    style: 'platform_focused'
  },
  {
    id: 'user_james_wright',
    anonymousId: 'anon_james_wright',
    name: 'James Wright',
    title: 'DevOps Engineer',
    type: 'devops_engineer',
    projectFocus: ['kubernetes', 'aws', 'docker', 'ci_cd'],
    style: 'infrastructure_minded'
  },
  {
    id: 'user_emily_zhang',
    anonymousId: 'anon_emily_zhang',
    name: 'Emily Zhang',
    title: 'Data Scientist',
    type: 'data_scientist',
    projectFocus: ['python', 'machine_learning', 'data_analysis', 'statistics'],
    style: 'analytical_approach'
  },
  {
    id: 'user_david_johnson',
    anonymousId: 'anon_david_johnson',
    name: 'David Johnson',
    title: 'Junior Backend Developer',
    type: 'junior_backend',
    projectFocus: ['python', 'django', 'databases', 'testing'],
    style: 'methodical_learner'
  },
  {
    id: 'user_lisa_thompson',
    anonymousId: 'anon_lisa_thompson',
    name: 'Lisa Thompson',
    title: 'Security Engineer',
    type: 'security_engineer',
    projectFocus: ['security', 'authentication', 'encryption', 'compliance'],
    style: 'security_first'
  },
  {
    id: 'user_ryan_murphy',
    anonymousId: 'anon_ryan_murphy',
    name: 'Ryan Murphy',
    title: 'Full Stack Developer',
    type: 'fullstack_developer',
    projectFocus: ['react', 'nodejs', 'databases', 'apis'],
    style: 'versatile_problem_solver'
  },
  {
    id: 'user_maria_gonzalez',
    anonymousId: 'anon_maria_gonzalez',
    name: 'Maria Gonzalez',
    title: 'Senior Frontend Engineer',
    type: 'senior_frontend',
    projectFocus: ['react', 'typescript', 'performance', 'accessibility'],
    style: 'detail_oriented'
  },
  {
    id: 'user_kevin_lee',
    anonymousId: 'anon_kevin_lee',
    name: 'Kevin Lee',
    title: 'Product Engineer',
    type: 'product_engineer',
    projectFocus: ['user_experience', 'analytics', 'a_b_testing', 'product_metrics'],
    style: 'user_focused'
  },
  {
    id: 'user_jordan_davis',
    anonymousId: 'anon_jordan_davis',
    name: 'Jordan Davis',
    title: 'Platform Engineer',
    type: 'platform_engineer',
    projectFocus: ['infrastructure', 'tooling', 'developer_experience', 'automation'],
    style: 'efficiency_focused'
  }
]

// Project templates with different characteristics
const projectTemplates = [
  {
    id: 'project_ecommerce_platform',
    name: 'E-commerce Platform',
    type: 'fullstack_web',
    tech_stack: ['React', 'Node.js', 'PostgreSQL', 'Redis'],
    complexity: 'high',
    team_size: 'medium'
  },
  {
    id: 'project_mobile_fitness_app',
    name: 'Fitness Tracking App',
    type: 'mobile',
    tech_stack: ['React Native', 'Firebase', 'GraphQL'],
    complexity: 'medium',
    team_size: 'small'
  },
  {
    id: 'project_analytics_dashboard',
    name: 'Business Analytics Dashboard',
    type: 'data_visualization',
    tech_stack: ['Vue.js', 'Python', 'Elasticsearch', 'D3.js'],
    complexity: 'high',
    team_size: 'large'
  },
  {
    id: 'project_api_gateway',
    name: 'Microservices API Gateway',
    type: 'backend_infrastructure',
    tech_stack: ['Go', 'Docker', 'Kubernetes', 'Consul'],
    complexity: 'high',
    team_size: 'medium'
  },
  {
    id: 'project_blog_cms',
    name: 'Content Management System',
    type: 'web_application',
    tech_stack: ['Next.js', 'Strapi', 'MongoDB'],
    complexity: 'medium',
    team_size: 'small'
  },
  {
    id: 'project_ml_recommendation',
    name: 'ML Recommendation Engine',
    type: 'machine_learning',
    tech_stack: ['Python', 'TensorFlow', 'Apache Kafka', 'PostgreSQL'],
    complexity: 'high',
    team_size: 'medium'
  },
  {
    id: 'project_chat_application',
    name: 'Real-time Chat Application',
    type: 'realtime_web',
    tech_stack: ['Socket.io', 'Express', 'React', 'MongoDB'],
    complexity: 'medium',
    team_size: 'small'
  },
  {
    id: 'project_iot_monitoring',
    name: 'IoT Device Monitoring System',
    type: 'iot_backend',
    tech_stack: ['Python', 'MQTT', 'InfluxDB', 'Grafana'],
    complexity: 'high',
    team_size: 'medium'
  }
]

// Installation IDs for different teams/organizations
const installations = [
  'install_tech_startup_alpha',
  'install_enterprise_beta',
  'install_agency_gamma',
  'install_freelance_delta',
  'install_university_epsilon'
]

// Conversation templates with realistic patterns
const conversationTemplates = {
  debugging: {
    user_queries: [
      "I'm getting a TypeError: Cannot read property 'map' of undefined in my React component. How do I fix this?",
      "My API is returning 500 errors but only in production. How should I debug this?",
      "Getting a CORS error when trying to fetch data from my backend. What's the best way to resolve this?",
      "My database queries are timing out intermittently. How can I troubleshoot this?",
      "Getting memory leaks in my Node.js application. How do I identify and fix them?",
      "My Redux state isn't updating properly after an async action. What could be wrong?",
      "CSS Grid layout is breaking on mobile devices. How do I make it responsive?",
      "Getting 'Cannot perform a React state update on an unmounted component' warning. How to fix?",
      "Python script throwing KeyError but the key exists in the dictionary. What's happening?",
      "Docker container keeps crashing with exit code 137. How do I diagnose this?"
    ],
    claude_responses: [
      "The 'Cannot read property map of undefined' error typically occurs when you're trying to call .map() on data that hasn't loaded yet. Here are the most common solutions:\n\n1. **Add a safety check**: Use optional chaining or a default empty array\n```javascript\n{data?.map(...) || []}\n// or\n{(data || []).map(...)}\n```\n\n2. **Add conditional rendering**: Only render when data exists\n```javascript\n{data && data.map(...)}\n```\n\n3. **Initialize state properly**: Make sure your initial state is an empty array\n```javascript\nconst [data, setData] = useState([]); // instead of useState(null)\n```\n\nThe root cause is usually that your component renders before async data fetching completes, so data is initially null/undefined.",

      "A 500 error only in production suggests environment-specific issues. Here's a systematic debugging approach:\n\n1. **Check server logs**: Look at your production server logs for the actual error details\n2. **Environment variables**: Verify all required env vars are set in production\n3. **Database connections**: Ensure production DB connection strings and permissions are correct\n4. **Dependencies**: Check if all dependencies are properly installed in production\n5. **Resource limits**: Monitor CPU, memory, and disk usage - production might be hitting limits\n6. **Error monitoring**: Add tools like Sentry or LogRocket to capture detailed error information\n7. **Staging environment**: Set up a staging environment that mirrors production for testing\n\nStart with the logs - they usually contain the actual error that's causing the 500 response.",

      "CORS errors occur when your frontend and backend are on different origins. Here are the solutions:\n\n**Backend fixes (recommended):**\n1. Configure CORS middleware:\n```javascript\n// Express.js example\nconst cors = require('cors');\napp.use(cors({\n  origin: ['http://localhost:3000', 'https://yourdomain.com'],\n  credentials: true\n}));\n```\n\n2. Set specific headers:\n```javascript\napp.use((req, res, next) => {\n  res.header('Access-Control-Allow-Origin', 'https://yourdomain.com');\n  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');\n  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');\n  next();\n});\n```\n\n**Frontend alternatives:**\n- Use a proxy in development (package.json: `\"proxy\": \"http://localhost:8000\"`)\n- Deploy both frontend and backend to the same domain\n- Use serverless functions as a proxy\n\nThe backend CORS configuration is the proper solution for production."
    ]
  },

  architecture: {
    user_queries: [
      "What's the best way to structure a large React application with multiple teams working on it?",
      "Should I use microservices or a monolith for my new web application?",
      "How do I design a scalable database schema for a multi-tenant application?",
      "What's the recommended authentication flow for a React Native app with a Node.js backend?",
      "How should I organize my API routes and business logic in an Express.js application?",
      "What's the best state management solution for a complex React application?",
      "How do I implement caching effectively in a high-traffic web application?",
      "What's the recommended folder structure for a Next.js project with multiple features?",
      "Should I use GraphQL or REST API for my mobile app backend?",
      "How do I design a real-time system that can handle thousands of concurrent users?"
    ],
    claude_responses: [
      "For large React applications with multiple teams, I recommend a **feature-based modular architecture**:\n\n**1. Micro-frontends approach:**\n```\nsrc/\n  apps/           # Main applications\n    dashboard/\n    admin/\n    mobile/\n  shared/         # Shared components and utilities\n    components/\n    hooks/\n    utils/\n  features/       # Business logic modules\n    user-management/\n    analytics/\n    payments/\n```\n\n**2. Team ownership strategy:**\n- Each team owns specific features/domains\n- Shared components are managed by a platform team\n- Clear APIs between modules\n- Independent deployment pipelines where possible\n\n**3. Technical considerations:**\n- Use module federation (Webpack 5) for runtime composition\n- Implement a design system for consistency\n- Standardize state management patterns\n- Use TypeScript for better collaboration\n- Set up strict linting and testing standards\n\n**4. Communication patterns:**\n- Event-driven architecture between modules\n- Shared state only for truly global concerns\n- Well-defined prop interfaces\n\nThis approach enables team independence while maintaining consistency.",

      "The microservices vs monolith decision depends on your specific context. Here's a framework to help decide:\n\n**Choose Monolith when:**\n- Small to medium team (< 15 developers)\n- Early stage product with evolving requirements\n- Simple deployment requirements\n- Limited operational expertise\n- Tight coupling between business domains\n\n**Choose Microservices when:**\n- Large team (> 20 developers)\n- Well-defined, stable business domains\n- Different scaling requirements per service\n- Strong DevOps/operational capabilities\n- Need for technology diversity\n- Independent team ownership of services\n\n**Recommended approach:**\n1. **Start with a modular monolith** - organize code by domains but deploy as one unit\n2. **Extract services gradually** when you hit specific pain points:\n   - Performance bottlenecks\n   - Team coordination issues\n   - Different technology needs\n   - Scaling requirements\n\n**Architecture pattern:**\n```\nModular Monolith → Extract high-value services → Gradual decomposition\n```\n\nThis gives you the benefits of both approaches and reduces risk.",

      "For multi-tenant applications, your database schema design is critical. Here are the main approaches:\n\n**1. Shared Database, Shared Schema (Row-Level Security)**\n```sql\n-- Add tenant_id to every table\nCREATE TABLE users (\n  id UUID PRIMARY KEY,\n  tenant_id UUID NOT NULL,\n  email VARCHAR(255),\n  -- other columns\n);\n\n-- RLS policy example\nCREATE POLICY tenant_isolation ON users\n  USING (tenant_id = current_tenant_id());\n```\n\n**2. Shared Database, Separate Schemas**\n- Each tenant gets their own schema\n- Connection pooling routes to correct schema\n- Better isolation, moderate complexity\n\n**3. Separate Databases**\n- Complete isolation per tenant\n- Highest security and compliance\n- More complex operations and maintenance\n\n**Recommendations:**\n- **B2B SaaS with < 1000 tenants**: Row-level security\n- **Enterprise customers**: Separate databases\n- **High compliance requirements**: Separate databases\n- **Rapid scaling needs**: Shared schema with good indexing\n\n**Key design principles:**\n- Always include tenant context in queries\n- Use database constraints to enforce isolation\n- Plan for data migration and tenant onboarding\n- Implement tenant-aware backup and restore\n- Monitor per-tenant resource usage"
    ]
  },

  learning: {
    user_queries: [
      "I'm new to React. What are the most important concepts I should learn first?",
      "How do I get started with TypeScript in an existing JavaScript project?",
      "What's the difference between SQL and NoSQL databases? When should I use each?",
      "I want to learn backend development. Should I start with Node.js or Python?",
      "How do I learn Kubernetes? It seems overwhelming with so many concepts.",
      "What's the best way to learn system design for large-scale applications?",
      "I'm a frontend developer wanting to learn DevOps. Where should I start?",
      "How do I transition from junior to senior developer? What skills should I focus on?",
      "What's the learning path for becoming a full-stack developer?",
      "How do I stay up-to-date with rapidly changing web technologies?"
    ],
    claude_responses: [
      "Welcome to React! Here's a focused learning path for the essential concepts:\n\n**Phase 1: Core Concepts (Week 1-2)**\n1. **JSX syntax** - How to write component markup\n2. **Components and Props** - Building blocks and data passing\n3. **State with useState** - Managing component data\n4. **Event handling** - User interactions\n5. **Conditional rendering** - Showing/hiding content\n\n**Phase 2: Essential Hooks (Week 3-4)**\n1. **useEffect** - Side effects and lifecycle\n2. **useContext** - Sharing data across components\n3. **Custom hooks** - Reusing stateful logic\n\n**Phase 3: Practical Skills (Week 5-6)**\n1. **Forms and controlled inputs**\n2. **API calls and data fetching**\n3. **Routing** (React Router)\n4. **Error boundaries**\n\n**Learning strategy:**\n- Build small projects after each concept\n- Start with Create React App for simplicity\n- Focus on functional components (avoid class components initially)\n- Practice with the React DevTools\n\n**First project ideas:**\n- Todo list app\n- Weather app with API\n- Simple blog with routing\n\nThe key is consistent practice - build something new every few days!",

      "Adding TypeScript to an existing JavaScript project is best done gradually. Here's a practical migration strategy:\n\n**Step 1: Setup (Day 1)**\n```bash\nnpm install -D typescript @types/node @types/react @types/react-dom\nnpx tsc --init  # Creates tsconfig.json\n```\n\n**Step 2: Configure tsconfig.json**\n```json\n{\n  \"compilerOptions\": {\n    \"allowJs\": true,           // Keep existing JS files\n    \"checkJs\": false,         // Don't type-check JS initially\n    \"strict\": false,          // Enable gradually\n    \"noEmit\": true,           // Let your bundler handle compilation\n    \"jsx\": \"react-jsx\"\n  },\n  \"include\": [\"src/**/*\"]\n}\n```\n\n**Step 3: Gradual Migration**\n1. **Rename files** .js → .ts/.tsx (start with utilities, then components)\n2. **Add basic types** to function parameters and returns\n3. **Define interfaces** for props and data structures\n4. **Enable strict mode** file by file\n\n**Migration priorities:**\n1. New files → always TypeScript\n2. Utility functions → easy wins\n3. Data models → high impact\n4. React components → moderate effort\n5. Complex legacy code → last\n\n**Pro tips:**\n- Use `any` temporarily to unblock migration\n- Leverage TypeScript's inference - don't over-annotate\n- Install @types packages for your dependencies\n- Use IDE features for automatic type generation\n\nMigrate one file per day - you'll have full TypeScript coverage in a few weeks!",

      "Great question! The choice between SQL and NoSQL depends on your specific use case. Here's a practical guide:\n\n**SQL Databases (PostgreSQL, MySQL, SQLite)**\n\n**Best for:**\n- Complex relationships between data\n- ACID transactions are critical\n- Reporting and analytics\n- Well-defined, stable schemas\n- Financial/banking applications\n\n**Strengths:**\n- Strong consistency guarantees\n- Mature ecosystem and tooling\n- Standardized query language\n- Excellent for joins and complex queries\n\n**NoSQL Databases (MongoDB, DynamoDB, Redis)**\n\n**Best for:**\n- Rapid development and iteration\n- Flexible, evolving schemas\n- Horizontal scaling requirements\n- Document-based data (JSON-like)\n- Real-time applications\n\n**Strengths:**\n- Schema flexibility\n- Better performance for simple queries\n- Easier horizontal scaling\n- Natural fit for modern app development\n\n**Decision Framework:**\n1. **Data relationships**: Complex → SQL, Simple → NoSQL\n2. **Consistency needs**: Critical → SQL, Eventual OK → NoSQL\n3. **Scale**: Vertical → SQL, Horizontal → NoSQL\n4. **Schema stability**: Fixed → SQL, Evolving → NoSQL\n5. **Team expertise**: SQL knowledge → SQL, New project → Either\n\n**Hybrid approach**: Many modern applications use both - SQL for core business data, NoSQL for caching, sessions, or flexible content.\n\n**Recommendation for beginners**: Start with PostgreSQL - it's SQL but has excellent JSON support, giving you the best of both worlds."
    ]
  },

  code_review: {
    user_queries: [
      "Can you review this React component and suggest improvements?",
      "Is this API endpoint implementation secure and following best practices?",
      "Can you help optimize this database query? It's running slowly.",
      "Review my error handling implementation - am I doing this correctly?",
      "Can you check if this authentication flow is implemented properly?",
      "Is this component properly optimized to prevent unnecessary re-renders?",
      "Review my test coverage - what am I missing?",
      "Can you help improve the performance of this algorithm?",
      "Is my state management approach in this Redux reducer correct?",
      "Review this Docker configuration - any security concerns?"
    ],
    claude_responses: [
      "I'd be happy to review your React component! Since I don't see the code in your message, let me share a comprehensive checklist of what I look for in React component reviews:\n\n**Structure & Organization:**\n- Clear component naming and single responsibility\n- Proper prop destructuring and TypeScript interfaces\n- Logical hook order (useState, useEffect, custom hooks)\n- Clean import/export statements\n\n**Performance Optimizations:**\n- Proper use of useMemo/useCallback for expensive operations\n- Avoiding object/array creation in JSX props\n- Conditional rendering patterns\n- Lazy loading for heavy components\n\n**Best Practices:**\n- Error boundaries and error handling\n- Accessibility (ARIA labels, semantic HTML)\n- Consistent styling approach\n- Proper key props in lists\n\n**Code Quality:**\n- No unused variables or imports\n- Consistent naming conventions\n- Proper TypeScript types\n- Clear component API design\n\nCould you paste the component code? I'll provide specific feedback on:\n- Performance improvements\n- Code organization suggestions\n- Best practice recommendations\n- Potential bugs or issues\n\nFeel free to share even if it's a work in progress!",

      "I'd love to review your API endpoint for security and best practices! While I wait for the code, here's my security review framework:\n\n**Authentication & Authorization:**\n- Proper JWT/session token validation\n- Role-based access control (RBAC)\n- Input validation and sanitization\n- Rate limiting implementation\n\n**Data Security:**\n- SQL injection prevention (parameterized queries)\n- XSS protection in responses\n- Sensitive data encryption\n- Proper error messages (no info leakage)\n\n**HTTP Security:**\n- HTTPS enforcement\n- CORS configuration\n- Security headers (HSTS, CSP, etc.)\n- Proper HTTP status codes\n\n**Code Structure:**\n- Error handling and logging\n- Input validation middleware\n- Business logic separation\n- Database transaction handling\n\n**Common Security Issues I Check:**\n```javascript\n// ❌ Bad: Direct parameter usage\napp.get('/users/:id', (req, res) => {\n  const query = `SELECT * FROM users WHERE id = ${req.params.id}`;\n});\n\n// ✅ Good: Parameterized query\napp.get('/users/:id', validateId, async (req, res) => {\n  const user = await db.query('SELECT * FROM users WHERE id = $1', [req.params.id]);\n});\n```\n\nPlease share your endpoint code - I'll provide specific security recommendations and best practice improvements!",

      "I'd be happy to help optimize your slow database query! Database performance issues are common and usually have clear solutions. Here's my systematic approach:\n\n**Performance Analysis Steps:**\n1. **Query execution plan** - Use EXPLAIN ANALYZE\n2. **Index analysis** - Check for missing or unused indexes\n3. **Query structure** - Look for inefficient patterns\n4. **Data volume** - Consider the dataset size\n\n**Common Slow Query Patterns:**\n\n**❌ Missing Indexes:**\n```sql\n-- Slow: Full table scan\nSELECT * FROM orders WHERE customer_id = 123;\n-- Solution: CREATE INDEX idx_orders_customer_id ON orders(customer_id);\n```\n\n**❌ N+1 Query Problem:**\n```sql\n-- Instead of multiple queries in a loop\n-- Use JOIN or IN clause\nSELECT o.*, c.name FROM orders o \nJOIN customers c ON o.customer_id = c.id;\n```\n\n**❌ Inefficient WHERE clauses:**\n```sql\n-- Slow: Function on indexed column\nWHERE YEAR(created_at) = 2024\n-- Fast: Range query\nWHERE created_at >= '2024-01-01' AND created_at < '2025-01-01'\n```\n\n**Optimization Toolkit:**\n- Proper indexing strategy\n- Query rewriting\n- Pagination for large result sets\n- Connection pooling\n- Read replicas for analytics\n\nCould you share the slow query? I'll analyze it and provide specific optimization recommendations with before/after performance comparisons!"
    ]
  }
}

// Time distribution patterns (realistic working hours)
const timePatterns = {
  workday: [9, 10, 11, 14, 15, 16, 17], // Common working hours
  late_night: [20, 21, 22, 23], // Late night coding sessions
  weekend: [10, 14, 16, 19] // Weekend project work
}

/**
 * Generates a realistic timestamp based on user persona and time patterns
 */
function generateTimestamp(daysAgo: number, userType: string): Date {
  const baseDate = new Date()
  baseDate.setDate(baseDate.getDate() - daysAgo)

  // Different personas have different working patterns
  let hours: number[]
  if (userType.includes('junior')) {
    hours = timePatterns.workday // Junior devs tend to work normal hours
  } else if (userType.includes('senior') || userType.includes('lead')) {
    hours = [...timePatterns.workday, ...timePatterns.late_night] // More varied hours
  } else {
    hours = timePatterns.workday
  }

  const randomHour = hours[Math.floor(Math.random() * hours.length)]
  const randomMinute = Math.floor(Math.random() * 60)

  baseDate.setHours(randomHour, randomMinute, 0, 0)
  return baseDate
}

/**
 * Selects appropriate conversation template based on user persona
 */
function selectConversationTemplate(userType: string): string {
  const typeWeights = {
    junior_frontend: { learning: 0.4, debugging: 0.4, architecture: 0.1, code_review: 0.1 },
    junior_backend: { learning: 0.4, debugging: 0.35, architecture: 0.15, code_review: 0.1 },
    senior_backend: { architecture: 0.3, debugging: 0.25, code_review: 0.25, learning: 0.2 },
    senior_frontend: { architecture: 0.25, debugging: 0.3, code_review: 0.3, learning: 0.15 },
    tech_lead: { architecture: 0.4, code_review: 0.3, debugging: 0.2, learning: 0.1 },
    mobile_developer: { debugging: 0.35, learning: 0.25, architecture: 0.25, code_review: 0.15 },
    devops_engineer: { architecture: 0.35, debugging: 0.25, learning: 0.25, code_review: 0.15 },
    data_scientist: { learning: 0.35, debugging: 0.25, architecture: 0.25, code_review: 0.15 },
    security_engineer: { architecture: 0.3, code_review: 0.3, debugging: 0.25, learning: 0.15 },
    fullstack_developer: { debugging: 0.3, architecture: 0.25, learning: 0.25, code_review: 0.2 },
    product_engineer: { learning: 0.3, architecture: 0.25, debugging: 0.25, code_review: 0.2 },
    platform_engineer: { architecture: 0.35, debugging: 0.25, code_review: 0.25, learning: 0.15 }
  }

  const weights = typeWeights[userType as keyof typeof typeWeights] || typeWeights.junior_frontend
  const random = Math.random()
  let cumulative = 0

  for (const [template, weight] of Object.entries(weights)) {
    cumulative += weight
    if (random <= cumulative) {
      return template
    }
  }

  return 'debugging' // fallback
}

/**
 * Generates a single conversation pair
 */
function generateConversation(
  user: typeof userPersonas[0],
  project: typeof projectTemplates[0],
  installation: string,
  timestamp: Date
): Omit<ClaudeChatLog, 'id' | 'created_at' | 'updated_at'> {
  const templateType = selectConversationTemplate(user.type)
  const template = conversationTemplates[templateType as keyof typeof conversationTemplates]

  const queryIndex = Math.floor(Math.random() * template.user_queries.length)
  const responseIndex = Math.floor(Math.random() * template.claude_responses.length)

  // Add some variation to responses to make them feel more natural
  const isCompleted = Math.random() > 0.05 // 95% completion rate
  const completedAt = isCompleted
    ? new Date(timestamp.getTime() + Math.random() * 300000) // 0-5 minutes later
    : null

  return {
    user_query: template.user_queries[queryIndex],
    claude_response: template.claude_responses[responseIndex],
    user_id: user.id,
    project_id: project.id,
    interaction_timestamp: timestamp.toISOString(),
    anonymous_user_id: user.anonymousId,
    project_name: project.name,
    installation_id: installation,
    status: isCompleted ? 'completed' : 'pending',
    completed_at: completedAt?.toISOString() || null
  }
}

/**
 * Generates the complete dataset
 */
export function generateMockDataset(count: number = 500): Omit<ClaudeChatLog, 'id' | 'created_at' | 'updated_at'>[] {
  const dataset: Omit<ClaudeChatLog, 'id' | 'created_at' | 'updated_at'>[] = []

  // Generate conversations over the past 90 days
  const maxDaysAgo = 90

  for (let i = 0; i < count; i++) {
    // Select random team member and project
    const user = teamMembers[Math.floor(Math.random() * teamMembers.length)]
    const project = projectTemplates[Math.floor(Math.random() * projectTemplates.length)]
    const installation = installations[Math.floor(Math.random() * installations.length)]

    // Generate realistic timestamp (more recent conversations are more likely)
    const daysAgo = Math.floor(Math.random() * Math.random() * maxDaysAgo)
    const timestamp = generateTimestamp(daysAgo, user.type)

    const conversation = generateConversation(user, project, installation, timestamp)
    dataset.push(conversation)
  }

  // Sort by timestamp for more realistic data
  return dataset.sort((a, b) =>
    new Date(a.interaction_timestamp).getTime() - new Date(b.interaction_timestamp).getTime()
  )
}

/**
 * Uploads dataset to Supabase in batches
 */
export async function uploadToSupabase(
  dataset: Omit<ClaudeChatLog, 'id' | 'created_at' | 'updated_at'>[],
  batchSize: number = 50
): Promise<void> {
  console.log(`Starting upload of ${dataset.length} conversations to Supabase...`)

  let uploaded = 0
  const totalBatches = Math.ceil(dataset.length / batchSize)

  for (let i = 0; i < totalBatches; i++) {
    const batch = dataset.slice(i * batchSize, (i + 1) * batchSize)

    try {
      const { error } = await supabase
        .from('claude_chat_logs')
        .insert(batch)

      if (error) {
        console.error(`Error uploading batch ${i + 1}:`, error)
        throw error
      }

      uploaded += batch.length
      console.log(`Uploaded batch ${i + 1}/${totalBatches} (${uploaded}/${dataset.length} conversations)`)

      // Small delay between batches to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      console.error(`Failed to upload batch ${i + 1}:`, error)
      throw error
    }
  }

  console.log(`Successfully uploaded ${uploaded} conversations to Supabase!`)
}

/**
 * Main execution function
 */
export async function main() {
  try {
    console.log('🚀 Generating mock dataset...')
    const dataset = generateMockDataset(500)

    console.log(`✅ Generated ${dataset.length} conversations`)
    console.log(`📊 Dataset statistics:`)
    console.log(`   - Users: ${new Set(dataset.map(d => d.user_id)).size}`)
    console.log(`   - Projects: ${new Set(dataset.map(d => d.project_id)).size}`)
    console.log(`   - Installations: ${new Set(dataset.map(d => d.installation_id)).size}`)
    console.log(`   - Date range: ${dataset[0].interaction_timestamp} to ${dataset[dataset.length - 1].interaction_timestamp}`)

    console.log('\n📤 Uploading to Supabase...')
    await uploadToSupabase(dataset)

    console.log('\n🎉 Dataset generation and upload complete!')
    console.log('You can now test your analytics features with rich, realistic data.')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// Run if called directly (Node.js check for ES modules)
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}