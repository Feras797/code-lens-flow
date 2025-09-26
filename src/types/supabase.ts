export interface ConversationRecord {
  user_id: string
  user_query: string
  claude_response: string
  created_at?: string
  updated_at?: string
}

export interface SupabaseResponse<T> {
  data: T[] | null
  error: Error | null
}

export type ConversationsResponse = SupabaseResponse<ConversationRecord>