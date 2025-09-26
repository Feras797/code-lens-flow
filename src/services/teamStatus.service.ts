import { supabase } from '@/lib/supabase'
import { processMultipleConversations, ProcessedConversation, testGeminiAPI } from '@/lib/gemini'
import { ConversationRecord } from '@/types/supabase'

export async function fetchConversationsFromSupabase(): Promise<ConversationRecord[]> {
  try {
    const { data, error } = await supabase
      .from('claude_chat_logs')
      .select('user_id, user_query, claude_response, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching conversations:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in fetchConversationsFromSupabase:', error)
    return []
  }
}

export async function getProcessedTeamStatus(): Promise<ProcessedConversation[]> {
  try {
    // Test API connection first
    const apiWorks = await testGeminiAPI()
    if (!apiWorks) {
      console.error('Gemini API test failed - check your API key and permissions')
      return []
    }

    const conversations = await fetchConversationsFromSupabase()
    
    if (conversations.length === 0) {
      console.log('No conversations found in Supabase')
      return []
    }

    const processed = await processMultipleConversations(conversations)
    return processed
  } catch (error) {
    console.error('Error in getProcessedTeamStatus:', error)
    return []
  }
}

// Helper function to transform ProcessedConversation to TeamStatus format
export function transformToTeamStatusFormat(processed: ProcessedConversation[]): any[] {
  return processed.map((dev, index) => ({
    id: index + 1,
    name: dev.name,
    avatar: dev.name.split(' ').map(n => n[0]).join('').toUpperCase(),
    status: dev.status,
    workItems: dev.workItems.map(item => ({
      id: item.id,
      task: item.task,
      file: item.file,
      duration: item.duration,
      messages: item.messages,
      commits: item.commits,
      chatContext: item.chatContext,
      priority: item.priority
    })),
    totalMessages: dev.totalMessages,
    totalCommits: dev.totalCommits,
    currentContext: dev.currentContext
  }))
}