-- Sample Data for Testing CodeLens Analytics
-- Run this after creating the schema to test the system

-- Sample chat logs for testing
INSERT INTO claude_chat_logs (user_query, claude_response, user_id, project_id, interaction_timestamp) VALUES

-- Sarah's successful JWT implementation (flow state)
('I need to implement JWT authentication in auth.js', 
 'I''ll help you implement JWT authentication. Let''s start with token generation and validation...', 
 'sarah', 'ecommerce_app', NOW() - INTERVAL '45 minutes'),

('How do I handle token refresh in the middleware?', 
 'For token refresh, you''ll want to check expiration and generate new tokens. Here''s the approach...', 
 'sarah', 'ecommerce_app', NOW() - INTERVAL '30 minutes'),

('Perfect! The JWT authentication is working now. Thanks!', 
 'Excellent! I''m glad we got the JWT implementation working correctly.', 
 'sarah', 'ecommerce_app', NOW() - INTERVAL '15 minutes'),

-- John's webhook struggles (stuck state)
('My Stripe webhook in webhook.js is not working', 
 'Let me help you debug the Stripe webhook issue. Can you share the error message?', 
 'john', 'ecommerce_app', NOW() - INTERVAL '3 hours'),

('Still getting the same error after trying your suggestion', 
 'Let''s try a different approach. Can you check the webhook endpoint configuration...', 
 'john', 'ecommerce_app', NOW() - INTERVAL '2 hours 30 minutes'),

('Tried everything but the webhook still fails with the same error', 
 'Let''s debug this step by step. Can you share the exact error message and your webhook handler code?', 
 'john', 'ecommerce_app', NOW() - INTERVAL '2 hours'),

('Same issue persists. I''ve been stuck on this for hours.', 
 'I understand your frustration. Let''s try a completely different approach with webhook validation...', 
 'john', 'ecommerce_app', NOW() - INTERVAL '1 hour 30 minutes'),

('Now I need to integrate the webhook with the auth system in auth.js', 
 'To integrate the webhook with authentication, you''ll need to validate the JWT token...', 
 'john', 'ecommerce_app', NOW() - INTERVAL '10 minutes'),

-- Mike's database work (slow but steady)
('I need to refactor the user table schema in user.sql', 
 'I''ll help you refactor the user table schema safely. Let''s plan the migration strategy...', 
 'mike', 'ecommerce_app', NOW() - INTERVAL '1 hour 30 minutes'),

('How do I handle the migration without losing data?', 
 'For safe data migration, you''ll want to create a backup first and use transactions...', 
 'mike', 'ecommerce_app', NOW() - INTERVAL '1 hour'),

('The migration is taking longer than expected', 
 'Database migrations can take time. Let''s optimize the process and check progress...', 
 'mike', 'ecommerce_app', NOW() - INTERVAL '30 minutes'),

-- Emma's API development (flow state)
('I need to create CRUD endpoints for products in products.js', 
 'I''ll help you create the product CRUD endpoints. Let''s start with the data models...', 
 'emma', 'ecommerce_app', NOW() - INTERVAL '1 hour'),

('The POST endpoint is working great! Now I need the GET endpoint', 
 'Excellent! For the GET endpoint, we''ll implement filtering and pagination...', 
 'emma', 'ecommerce_app', NOW() - INTERVAL '45 minutes'),

('All endpoints are working perfectly. Thanks for the help!', 
 'Great job! Your product API is well-structured and follows REST conventions.', 
 'emma', 'ecommerce_app', NOW() - INTERVAL '20 minutes'),

-- Different project - Mobile Banking App
('I need to implement transaction history UI components', 
 'I''ll help you create the transaction history UI. Let''s start with the component structure...', 
 'alex', 'mobile_banking_app', NOW() - INTERVAL '2 hours'),

('The transaction list is rendering but pagination is slow', 
 'For better pagination performance, let''s implement virtual scrolling and optimize the queries...', 
 'alex', 'mobile_banking_app', NOW() - INTERVAL '1 hour 30 minutes'),

('Perfect! The virtual scrolling improved performance significantly', 
 'Excellent! Virtual scrolling is great for large datasets. Your implementation looks solid.', 
 'alex', 'mobile_banking_app', NOW() - INTERVAL '45 minutes'),

-- Lisa's security work
('I need to fix security vulnerabilities found in the audit', 
 'I''ll help you address the security issues. Let''s prioritize by severity and impact...', 
 'lisa', 'mobile_banking_app', NOW() - INTERVAL '4 hours'),

('The XSS vulnerability fix is complex, need more time to understand', 
 'XSS prevention requires careful input sanitization. Let''s break it down step by step...', 
 'lisa', 'mobile_banking_app', NOW() - INTERVAL '3 hours'),

('Still working on the CSRF protection implementation', 
 'CSRF tokens can be tricky. Let''s review the implementation and ensure proper validation...', 
 'lisa', 'mobile_banking_app', NOW() - INTERVAL '1 hour');

-- Verify the data was inserted
SELECT 
    project_id,
    user_id,
    COUNT(*) as interaction_count,
    MAX(interaction_timestamp) as last_activity,
    MIN(interaction_timestamp) as first_activity
FROM claude_chat_logs 
GROUP BY project_id, user_id 
ORDER BY project_id, last_activity DESC;
