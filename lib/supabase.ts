import { createClient } from '@supabase/supabase-js'

// Geçici olarak demo değerler - gerçek Supabase projeniz için değiştirin
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key'

// Gerçek Supabase projesi için bu kontrolü aktif edin:
// if (!supabaseUrl || !supabaseAnonKey) {
//   throw new Error('Supabase URL ve Anon Key environment variables olarak tanımlanmalıdır')
// }

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      gratitudes: {
        Row: {
          id: string
          user_id: string
          text: string
          created_at: string
          updated_at: string
          is_shared: boolean
          public_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          text: string
          created_at?: string
          updated_at?: string
          is_shared?: boolean
          public_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          text?: string
          created_at?: string
          updated_at?: string
          is_shared?: boolean
          public_id?: string | null
        }
      }
      public_gratitudes: {
        Row: {
          id: string
          original_author_id: string
          original_doc_id: string
          text: string
          created_at: string
          like_count: number
        }
        Insert: {
          id?: string
          original_author_id: string
          original_doc_id: string
          text: string
          created_at?: string
          like_count?: number
        }
        Update: {
          id?: string
          original_author_id?: string
          original_doc_id?: string
          text?: string
          created_at?: string
          like_count?: number
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          gratitude_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          gratitude_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          gratitude_id?: string
          created_at?: string
        }
      }
    }
  }
}
