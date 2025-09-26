import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = import.meta.env.VITE_GEMINI_API_KEY

if (!apiKey) {
  throw new Error('Missing Gemini API key')
}

const genAI = new GoogleGenerativeAI(apiKey)
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash',
})

export interface ProcessedConversation {
  userId: string
  name: string
  status: 'flow' | 'slow' | 'stuck'
  totalMessages: number
  totalCommits: number
  currentContext: string
  workItems: {
    id: string
    task: string
    file: string
    duration: string
    messages: number
    commits: number
    chatContext: string
    priority: 'high' | 'medium' | 'low'
  }[]
}

// Test function to verify API key and find working model
export async function testGeminiAPI(): Promise<boolean> {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`)
    if (response.ok) {
      const data = await response.json()
      console.log('Available models:', data.models?.map((m: any) => m.name))
      return true
    }
    return false
  } catch (error) {
    console.error('API test failed:', error)
    return false
  }
}

export async function processConversationWithGemini(
  userQuery: string,
  claudeResponse: string,
  userId: string
): Promise<ProcessedConversation | null> {
  try {
    const prompt = `
Analyze this Claude Code conversation and extract developer status information:

USER QUERY: ${userQuery}
CLAUDE RESPONSE: ${claudeResponse}

Extract the following information and return as JSON:
{
  "userId": "${userId}",
  "name": "Generate a realistic developer name based on the user ID",
  "status": "flow|slow|stuck (based on conversation complexity and success)",
  "totalMessages": "estimate based on conversation length",
  "totalCommits": "estimate commits made (0-5)",
  "currentContext": "brief summary of what they're working on",
  "workItems": [
    {
      "id": "unique-id",
      "task": "extracted task name",
      "file": "file path if mentioned or inferred",
      "duration": "estimated time (e.g., '30 min', '2 hrs')",
      "messages": "estimated messages for this task",
      "commits": "estimated commits for this task",
      "chatContext": "what they're specifically doing",
      "priority": "high|medium|low based on urgency/importance"
    }
  ]
}

Rules:
- Status "flow" = quick progress, solutions working
- Status "slow" = multiple iterations, debugging
- Status "stuck" = errors, blockers, long conversations
- If multiple tasks mentioned, create separate work items
- Generate realistic file paths if not explicitly mentioned
- Be consistent with naming and realistic with estimates
- Return only valid JSON, no additional text
`

    // Try different API endpoint formats
    const endpoints = [
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1/models/models/gemini-1.5-flash:generateContent?key=${apiKey}`
    ]

    let lastError = null
    
    for (let i = 0; i < endpoints.length; i++) {
      const endpoint = endpoints[i]
      console.log(`🔄 Trying endpoint ${i + 1}:`, endpoint)
      
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        })

        console.log(`📡 Response status for endpoint ${i + 1}:`, response.status)
        
        if (response.ok) {
          console.log('✅ Found working endpoint:', endpoint)
          const data = await response.json()
          console.log('📋 Response data structure:', Object.keys(data))
          
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text

          if (!text) {
            console.error('❌ No text found in Gemini response:', data)
            return null
          }

          console.log('📝 Generated text preview:', text.substring(0, 200) + '...')

          // Clean the response to extract JSON
          const jsonMatch = text.match(/\{[\s\S]*\}/)
          if (!jsonMatch) {
            console.error('❌ No JSON found in Gemini response. Full text:', text)
            return null
          }

          const parsed = JSON.parse(jsonMatch[0])
          console.log('✅ Successfully parsed conversation for user:', userId)
          return parsed as ProcessedConversation
        } else {
          const errorText = await response.text()
          console.error(`❌ Endpoint ${i + 1} failed:`, response.status, errorText)
          lastError = new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
        }
      } catch (error) {
        console.error(`❌ Exception on endpoint ${i + 1}:`, error)
        lastError = error
      }
    }

    throw lastError || new Error('All endpoints failed')
  } catch (error) {
    console.error('❌ Error processing conversation with Gemini:', error)
    return null
  }
}

// Helper function to add delay between requests
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function processMultipleConversations(
  conversations: Array<{ user_id: string; user_query: string; claude_response: string }>
): Promise<ProcessedConversation[]> {
  console.log(`🚀 Starting to process ${conversations.length} conversations`)
  const processedConversations: ProcessedConversation[] = []
  
  // Limit to first 10 conversations to avoid rate limiting
  const limitedConversations = conversations.slice(0, 10)
  console.log(`📝 Limited to ${limitedConversations.length} conversations to avoid rate limits`)
  
  for (let i = 0; i < limitedConversations.length; i++) {
    const conv = limitedConversations[i]
    console.log(`\n🔄 Processing conversation ${i + 1}/${limitedConversations.length}`)
    console.log(`👤 User ID: ${conv.user_id}`)
    console.log(`❓ Query preview: ${conv.user_query ? conv.user_query.substring(0, 100) + '...' : 'NULL'}`)
    console.log(`🤖 Response preview: ${conv.claude_response ? conv.claude_response.substring(0, 100) + '...' : 'NULL'}`)
    
    // Skip conversations with missing essential data
    if (!conv.user_query || !conv.user_id) {
      console.log(`⚠️ Skipping conversation ${i + 1} - missing user_query or user_id`)
      continue
    }
    
    // If no claude_response, create a simple fallback entry
    if (!conv.claude_response) {
      console.log(`⚠️ No Claude response for conversation ${i + 1} - creating fallback entry`)
      const fallbackResult: ProcessedConversation = {
        userId: conv.user_id,
        name: `Developer ${conv.user_id}`,
        status: 'stuck',
        totalMessages: 1,
        totalCommits: 0,
        currentContext: conv.user_query.length > 100 ? conv.user_query.substring(0, 100) + '...' : conv.user_query,
        workItems: [{
          id: `${conv.user_id}-fallback-${i}`,
          task: conv.user_query.length > 50 ? conv.user_query.substring(0, 50) + '...' : conv.user_query,
          file: 'unknown',
          duration: 'unknown',
          messages: 1,
          commits: 0,
          chatContext: conv.user_query,
          priority: 'medium' as const
        }]
      }
      processedConversations.push(fallbackResult)
      continue
    }
    
    // Add delay between requests (1 second) to avoid rate limiting
    if (i > 0) {
      console.log(`⏰ Waiting 1 second before next request...`)
      await delay(1000)
    }
    
    try {
      const result = await processConversationWithGemini(
        conv.user_query,
        conv.claude_response,
        conv.user_id
      )
      if (result) {
        console.log(`✅ Successfully processed conversation ${i + 1}`)
        processedConversations.push(result)
      } else {
        console.log(`❌ Failed to process conversation ${i + 1} - creating fallback entry`)
        // Create fallback entry when AI processing fails
        const fallbackResult: ProcessedConversation = {
          userId: conv.user_id,
          name: `Developer ${conv.user_id}`,
          status: 'slow',
          totalMessages: 1,
          totalCommits: 0,
          currentContext: conv.user_query.length > 100 ? conv.user_query.substring(0, 100) + '...' : conv.user_query,
          workItems: [{
            id: `${conv.user_id}-fallback-${i}`,
            task: conv.user_query.length > 50 ? conv.user_query.substring(0, 50) + '...' : conv.user_query,
            file: 'processing failed',
            duration: 'unknown',
            messages: 1,
            commits: 0,
            chatContext: conv.user_query,
            priority: 'medium' as const
          }]
        }
        processedConversations.push(fallbackResult)
      }
    } catch (error) {
      console.error(`❌ Error processing conversation ${i + 1}:`, error)
      // Continue with next conversation even if one fails
    }
  }

  // Group conversations by user_id and merge their work items
  console.log(`🔄 Grouping ${processedConversations.length} conversations by user...`)
  const groupedByUser = new Map<string, ProcessedConversation>()
  
  for (const conversation of processedConversations) {
    const userId = conversation.userId
    
    if (groupedByUser.has(userId)) {
      // Merge with existing user
      const existing = groupedByUser.get(userId)!
      existing.workItems.push(...conversation.workItems)
      existing.totalMessages += conversation.totalMessages
      existing.totalCommits += conversation.totalCommits
      
      // Update status to worst case (stuck > slow > flow)
      if (conversation.status === 'stuck' || existing.status === 'stuck') {
        existing.status = 'stuck'
      } else if (conversation.status === 'slow' || existing.status === 'slow') {
        existing.status = 'slow'
      }
      
      // Combine contexts
      if (existing.currentContext !== conversation.currentContext) {
        existing.currentContext = `${existing.currentContext}; ${conversation.currentContext}`
      }
    } else {
      // Add new user
      groupedByUser.set(userId, { ...conversation })
    }
  }

  const grouped = Array.from(groupedByUser.values())
  console.log(`🎉 Completed processing. Grouped into ${grouped.length} unique developers with ${processedConversations.length} total conversations`)
  
  return grouped
}