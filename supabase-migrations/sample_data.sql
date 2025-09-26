-- Sample data for claude_chat_logs table
-- Run this after the main migration to populate test data

-- Sample claude_chat_logs entries for testing
INSERT INTO claude_chat_logs (
  user_query,
  claude_response,
  user_id,
  project_id,
  project_name,
  installation_id,
  anonymous_user_id,
  status,
  interaction_timestamp,
  completed_at
) VALUES
(
  'How do I optimize React component rendering performance?',
  'There are several ways to optimize React component rendering: 1) Use React.memo for functional components to prevent unnecessary re-renders, 2) Implement proper key props in lists, 3) Use useMemo and useCallback hooks to memoize expensive calculations, 4) Consider code splitting with React.lazy for large components.',
  'user_123',
  'project_frontend_app',
  'Frontend React Application',
  'install_001',
  'anon_user_123',
  'completed',
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '2 hours'
),
(
  'What''s the best way to handle authentication in a Node.js API?',
  'For Node.js API authentication, I recommend: 1) Use JWT tokens for stateless authentication, 2) Implement proper password hashing with bcrypt, 3) Set up rate limiting to prevent brute force attacks, 4) Use HTTPS in production, 5) Consider using established libraries like Passport.js for complex authentication flows.',
  'user_456',
  'project_backend_api',
  'Backend API Service',
  'install_002',
  'anon_user_456',
  'completed',
  NOW() - INTERVAL '4 hours',
  NOW() - INTERVAL '4 hours'
),
(
  'Can you help me debug this database query performance issue?',
  'To debug database query performance: 1) Use EXPLAIN ANALYZE to understand the query execution plan, 2) Check if you have appropriate indexes on columns used in WHERE, JOIN, and ORDER BY clauses, 3) Consider query optimization by avoiding SELECT *, 4) Monitor slow query logs, 5) Use connection pooling to manage database connections efficiently.',
  'user_789',
  'project_backend_api',
  'Backend API Service',
  'install_002',
  'anon_user_789',
  'completed',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
),
(
  'How do I set up proper error handling in my Express.js application?',
  'For Express.js error handling: 1) Create a centralized error handling middleware as the last middleware in your app, 2) Use try-catch blocks in async route handlers, 3) Create custom error classes for different error types, 4) Log errors properly with appropriate log levels, 5) Return consistent error response formats to clients.',
  'user_123',
  'project_backend_api',
  'Backend API Service',
  'install_002',
  'anon_user_123',
  'completed',
  NOW() - INTERVAL '6 hours',
  NOW() - INTERVAL '6 hours'
),
(
  'What are the best practices for testing React components?',
  'React component testing best practices: 1) Use React Testing Library for user-centric testing, 2) Test component behavior rather than implementation details, 3) Use jest.mock() for mocking external dependencies, 4) Write integration tests for component interactions, 5) Use MSW (Mock Service Worker) for API mocking, 6) Focus on testing user scenarios and edge cases.',
  'user_456',
  'project_frontend_app',
  'Frontend React Application',
  'install_001',
  'anon_user_456',
  'completed',
  NOW() - INTERVAL '3 hours',
  NOW() - INTERVAL '3 hours'
),
(
  'How can I implement real-time features using WebSockets?',
  'WebSocket implementation for real-time features: 1) Use Socket.io for easier WebSocket management with fallbacks, 2) Implement proper connection handling and reconnection logic, 3) Create rooms/namespaces for organizing different types of real-time updates, 4) Handle authentication for WebSocket connections, 5) Implement rate limiting to prevent spam, 6) Consider using Redis for scaling across multiple servers.',
  'user_789',
  'project_realtime_app',
  'Real-time Chat Application',
  'install_003',
  'anon_user_789',
  'completed',
  NOW() - INTERVAL '5 hours',
  NOW() - INTERVAL '5 hours'
),
(
  'What''s the recommended folder structure for a large React application?',
  'For large React applications, consider this structure: 1) Feature-based organization (group by domain/feature rather than file type), 2) Shared components in a common components folder, 3) Separate hooks, utils, and services directories, 4) Use index.js files for cleaner imports, 5) Consider a pages/views folder for route components, 6) Keep assets organized by type or feature usage.',
  'user_123',
  'project_frontend_app',
  'Frontend React Application',
  'install_001',
  'anon_user_123',
  'completed',
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '1 hour'
),
(
  'How do I handle state management in a complex React application?',
  'Complex React state management options: 1) Start with built-in useState and useContext for simple global state, 2) Consider Redux Toolkit for predictable state management, 3) Use Zustand for simpler state management with less boilerplate, 4) Implement React Query/TanStack Query for server state management, 5) Consider Jotai or Valtio for atomic state management approaches.',
  'user_456',
  'project_frontend_app',
  'Frontend React Application',
  'install_001',
  'anon_user_456',
  'completed',
  NOW() - INTERVAL '30 minutes',
  NOW() - INTERVAL '30 minutes'
),
(
  'Can you explain Docker containerization best practices for Node.js apps?',
  'Docker best practices for Node.js: 1) Use official Node.js Alpine images for smaller size, 2) Create .dockerignore to exclude unnecessary files, 3) Use multi-stage builds to reduce final image size, 4) Run as non-root user for security, 5) Use specific version tags rather than latest, 6) Cache npm dependencies by copying package.json first, 7) Set NODE_ENV=production in production containers.',
  'user_789',
  'project_devops',
  'DevOps Infrastructure',
  'install_004',
  'anon_user_789',
  'completed',
  NOW() - INTERVAL '8 hours',
  NOW() - INTERVAL '8 hours'
),
(
  'What are the security considerations for a web API?',
  'Web API security considerations: 1) Use HTTPS everywhere, 2) Implement proper authentication and authorization, 3) Validate and sanitize all input data, 4) Use rate limiting and request throttling, 5) Implement CORS properly, 6) Use security headers like HSTS, CSP, 7) Keep dependencies updated, 8) Log security events, 9) Use parameterized queries to prevent SQL injection.',
  'user_123',
  'project_backend_api',
  'Backend API Service',
  'install_002',
  'anon_user_123',
  'completed',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
);

-- Update conversation completion status
UPDATE claude_chat_logs
SET status = 'completed', completed_at = interaction_timestamp + INTERVAL '30 seconds'
WHERE status = 'completed' AND completed_at IS NULL;