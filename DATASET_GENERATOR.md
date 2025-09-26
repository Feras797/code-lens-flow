# Mock Dataset Generator

This tool generates hundreds of realistic user-Claude conversation pairs to populate your Supabase database for testing analytics and insights features.

## 🎯 What it generates

- **500+ realistic conversations** between developers and Claude
- **8 different user personas** (junior/senior developers, tech leads, etc.)
- **8 diverse project types** (e-commerce, mobile apps, APIs, etc.)
- **4 conversation categories** (debugging, architecture, learning, code review)
- **Realistic timestamps** spread over the past 90 days
- **Varied interaction patterns** based on user personas

## 🚀 Quick Start

### 1. Set up environment variables

Create a `.env` file in the project root:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

**Where to find these:**
- Go to your Supabase project dashboard
- Navigate to Settings > API
- Copy the URL and the `service_role` key (not the `anon` key)

### 2. Install dependencies

```bash
npm install
```

### 3. Run the generator

```bash
# Generate 500 conversations (default)
npm run generate-dataset

# Generate 100 conversations (smaller dataset for testing)
npm run generate-dataset:small

# Generate 1000 conversations (larger dataset)
npm run generate-dataset:large
```

## 📊 Generated Data Structure

Each conversation includes:

```typescript
{
  user_query: string           // Realistic developer question
  claude_response: string      // Detailed, helpful response
  user_id: string             // Persona identifier
  project_id: string          // Project identifier
  project_name: string        // Human-readable project name
  anonymous_user_id: string   // Anonymous tracking ID
  installation_id: string     // Organization/team identifier
  interaction_timestamp: string // Realistic timestamp
  status: 'completed' | 'pending' // 95% completed
  completed_at: string | null  // Completion timestamp
}
```

## 👤 User Personas

The generator creates conversations for 8 different developer personas:

1. **Junior Frontend Developer** - Learning React, asking beginner questions
2. **Senior Backend Developer** - Complex architecture and optimization queries
3. **Tech Lead** - Strategic decisions, team coordination, architecture
4. **Mobile Developer** - React Native, iOS/Android specific questions
5. **DevOps Engineer** - Infrastructure, deployment, monitoring
6. **Data Scientist** - Python, ML, data analysis questions
7. **Junior Backend Developer** - Learning backend concepts, APIs
8. **Security Engineer** - Authentication, encryption, compliance

## 🏗️ Project Types

Conversations span 8 different project types:

- E-commerce Platform (React, Node.js, PostgreSQL)
- Mobile Fitness App (React Native, Firebase)
- Analytics Dashboard (Vue.js, Python, D3.js)
- API Gateway (Go, Docker, Kubernetes)
- Blog CMS (Next.js, Strapi, MongoDB)
- ML Recommendation Engine (Python, TensorFlow)
- Real-time Chat App (Socket.io, Express, React)
- IoT Monitoring System (Python, MQTT, InfluxDB)

## 💬 Conversation Categories

### Debugging (35% of conversations)
- Error troubleshooting
- Performance issues
- Configuration problems
- Runtime errors

### Architecture (25% of conversations)
- System design decisions
- Technology choices
- Scalability planning
- Best practices

### Learning (25% of conversations)
- New technology introduction
- Concept explanations
- Skill development
- Career guidance

### Code Review (15% of conversations)
- Code quality feedback
- Security review
- Performance optimization
- Best practice suggestions

## 🔧 Technical Details

### Time Distribution
- **Workday hours**: 9 AM - 5 PM (primary)
- **Late night**: 8 PM - 11 PM (senior developers)
- **Weekend coding**: 10 AM, 2 PM, 4 PM, 7 PM

### Upload Strategy
- Batched uploads (50 conversations per batch)
- Rate limiting protection (100ms delay between batches)
- Error handling and retry logic
- Progress reporting

### Data Quality
- Conversations match user persona characteristics
- Realistic question/answer pairs
- Proper temporal distribution
- Varied project and technology focus

## 🧪 Testing Your Analytics

After running the generator, test these features:

1. **Team Insights Dashboard** - Should show activity across multiple projects
2. **Developer Profiles** - Each persona should have distinct patterns
3. **Project Health Metrics** - Different projects should show varied activity
4. **Conversation Analytics** - Topic distribution, response times, etc.
5. **Time-based Analysis** - Activity patterns over the 90-day period

## 🛠️ Troubleshooting

### Environment Issues
```bash
# Check if environment variables are loaded
node -e "console.log(process.env.VITE_SUPABASE_URL)"
```

### Database Connection
- Verify your Supabase URL is correct
- Ensure the service role key has proper permissions
- Check if the `claude_chat_logs` table exists

### TypeScript Compilation
```bash
# If you get TypeScript errors
npx tsc scripts/generate-mock-dataset.ts --noEmit
```

### Upload Failures
- Check Supabase dashboard for error logs
- Verify table schema matches the data structure
- Ensure rate limits aren't being exceeded

## 📈 Performance

- **Generation time**: ~2-3 seconds for 500 conversations
- **Upload time**: ~30-60 seconds for 500 conversations
- **Memory usage**: ~50MB peak during generation
- **Database impact**: Minimal (uses efficient batch inserts)

## 🔒 Security Notes

- The service role key has elevated permissions - keep it secure
- Generated data is realistic but fictional
- No real user data or sensitive information is included
- Safe to use in development and staging environments

## 🤝 Contributing

To extend the generator:

1. **Add new personas** in the `userPersonas` array
2. **Create new project types** in `projectTemplates`
3. **Expand conversation templates** with new categories
4. **Adjust time patterns** for different scenarios

The generator is designed to be easily extensible for different use cases and data requirements.