export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      docs: {
        Row: {
          created_at: string
          duem: boolean
          id: number
          is_hidden: boolean
          last_update: string
          maker: string | null
          name: string
          typez: Database["public"]["Enums"]["document_type"]
          views: number
        }
        Insert: {
          created_at?: string
          duem?: boolean
          id?: number
          is_hidden?: boolean
          last_update?: string
          maker?: string | null
          name: string
          typez: Database["public"]["Enums"]["document_type"]
          views?: number
        }
        Update: {
          created_at?: string
          duem?: boolean
          id?: number
          is_hidden?: boolean
          last_update?: string
          maker?: string | null
          name?: string
          typez?: Database["public"]["Enums"]["document_type"]
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "docs_maker_fkey"
            columns: ["maker"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      docs_logs: {
        Row: {
          add_by: string | null
          date: string
          docs_id: number
          id: number
          type: Database["public"]["Enums"]["request_type_enum"]
          word: string
        }
        Insert: {
          add_by?: string | null
          date?: string
          docs_id: number
          id?: number
          type?: Database["public"]["Enums"]["request_type_enum"]
          word: string
        }
        Update: {
          add_by?: string | null
          date?: string
          docs_id?: number
          id?: number
          type?: Database["public"]["Enums"]["request_type_enum"]
          word?: string
        }
        Relationships: [
          {
            foreignKeyName: "docs_logs_add_by_fkey"
            columns: ["add_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "docs_logs_docs_id_fkey"
            columns: ["docs_id"]
            isOneToOne: false
            referencedRelation: "docs"
            referencedColumns: ["id"]
          },
        ]
      }
      docs_wait: {
        Row: {
          docs_name: string
          id: number
          req_at: string
          req_by: string | null
        }
        Insert: {
          docs_name: string
          id?: number
          req_at?: string
          req_by?: string | null
        }
        Update: {
          docs_name?: string
          id?: number
          req_at?: string
          req_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "docs_wait_req_by_fkey"
            columns: ["req_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      last_update: {
        Row: {
          last_modified: string
          table_name: string
        }
        Insert: {
          last_modified?: string
          table_name: string
        }
        Update: {
          last_modified?: string
          table_name?: string
        }
        Relationships: []
      }
      logs: {
        Row: {
          created_at: string
          id: number
          make_by: string | null
          processed_by: string | null
          r_type: Database["public"]["Enums"]["request_type_enum"]
          state: Database["public"]["Enums"]["request_status_enum"]
          word: string
        }
        Insert: {
          created_at?: string
          id?: number
          make_by?: string | null
          processed_by?: string | null
          r_type: Database["public"]["Enums"]["request_type_enum"]
          state?: Database["public"]["Enums"]["request_status_enum"]
          word: string
        }
        Update: {
          created_at?: string
          id?: number
          make_by?: string | null
          processed_by?: string | null
          r_type?: Database["public"]["Enums"]["request_type_enum"]
          state?: Database["public"]["Enums"]["request_status_enum"]
          word?: string
        }
        Relationships: [
          {
            foreignKeyName: "logs_make_by_fkey"
            columns: ["make_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "logs_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification: {
        Row: {
          body: string
          created_at: string
          end_at: string
          id: number
          img: string | null
          title: string
        }
        Insert: {
          body: string
          created_at?: string
          end_at: string
          id?: number
          img?: string | null
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          end_at?: string
          id?: number
          img?: string | null
          title?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          category: Database["public"]["Enums"]["program_category"]
          created_at: string
          description: string
          github_repo: string
          id: number
          is_active: boolean
          name: string
          readme_path: string
          tags: string[]
        }
        Insert: {
          category: Database["public"]["Enums"]["program_category"]
          created_at?: string
          description: string
          github_repo: string
          id?: number
          is_active?: boolean
          name: string
          readme_path: string
          tags: string[]
        }
        Update: {
          category?: Database["public"]["Enums"]["program_category"]
          created_at?: string
          description?: string
          github_repo?: string
          id?: number
          is_active?: boolean
          name?: string
          readme_path?: string
          tags?: string[]
        }
        Relationships: []
      }
      release_note: {
        Row: {
          content: string
          created_at: string
          id: number
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: number
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
          title?: string
        }
        Relationships: []
      }
      themes: {
        Row: {
          code: string
          id: number
          name: string
        }
        Insert: {
          code: string
          id?: never
          name: string
        }
        Update: {
          code?: string
          id?: never
          name?: string
        }
        Relationships: []
      }
      user_month_contributions: {
        Row: {
          contribution: number
          id: number
          month: string
          user_id: string
        }
        Insert: {
          contribution?: number
          id?: number
          month: string
          user_id: string
        }
        Update: {
          contribution?: number
          id?: number
          month?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_month_contribution_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_star_docs: {
        Row: {
          created_at: string
          docs_id: number
          id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          docs_id: number
          id?: number
          user_id: string
        }
        Update: {
          created_at?: string
          docs_id?: number
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_start_docs_docs_id_fkey"
            columns: ["docs_id"]
            isOneToOne: false
            referencedRelation: "docs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_start_docs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          contribution: number
          id: string
          month_contribution: number
          nickname: string
          role: Database["public"]["Enums"]["role_level"]
        }
        Insert: {
          contribution?: number
          id: string
          month_contribution?: number
          nickname: string
          role?: Database["public"]["Enums"]["role_level"]
        }
        Update: {
          contribution?: number
          id?: string
          month_contribution?: number
          nickname?: string
          role?: Database["public"]["Enums"]["role_level"]
        }
        Relationships: []
      }
      wait_word_themes: {
        Row: {
          theme_id: number
          wait_word_id: number
        }
        Insert: {
          theme_id: number
          wait_word_id: number
        }
        Update: {
          theme_id?: number
          wait_word_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "wait_word_themes_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wait_word_themes_wait_word_id_fkey"
            columns: ["wait_word_id"]
            isOneToOne: false
            referencedRelation: "wait_words"
            referencedColumns: ["id"]
          },
        ]
      }
      wait_words: {
        Row: {
          id: number
          request_type: Database["public"]["Enums"]["request_type_enum"]
          requested_at: string
          requested_by: string | null
          status: Database["public"]["Enums"]["request_status_enum"]
          word: string
          word_id: number | null
        }
        Insert: {
          id?: never
          request_type: Database["public"]["Enums"]["request_type_enum"]
          requested_at?: string
          requested_by?: string | null
          status?: Database["public"]["Enums"]["request_status_enum"]
          word: string
          word_id?: number | null
        }
        Update: {
          id?: never
          request_type?: Database["public"]["Enums"]["request_type_enum"]
          requested_at?: string
          requested_by?: string | null
          status?: Database["public"]["Enums"]["request_status_enum"]
          word?: string
          word_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wait_words_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wait_words_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["id"]
          },
        ]
      }
      word_first_letter_counts: {
        Row: {
          count: number
          first_letter: string
        }
        Insert: {
          count?: number
          first_letter: string
        }
        Update: {
          count?: number
          first_letter?: string
        }
        Relationships: []
      }
      word_last_letter_counts: {
        Row: {
          count: number
          last_letter: string
        }
        Insert: {
          count?: number
          last_letter: string
        }
        Update: {
          count?: number
          last_letter?: string
        }
        Relationships: []
      }
      word_themes: {
        Row: {
          theme_id: number
          word_id: number
        }
        Insert: {
          theme_id: number
          word_id: number
        }
        Update: {
          theme_id?: number
          word_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "word_themes_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "word_themes_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["id"]
          },
        ]
      }
      word_themes_wait: {
        Row: {
          req_at: string
          req_by: string | null
          theme_id: number
          typez: Database["public"]["Enums"]["request_type_enum"]
          word_id: number
        }
        Insert: {
          req_at?: string
          req_by?: string | null
          theme_id: number
          typez: Database["public"]["Enums"]["request_type_enum"]
          word_id: number
        }
        Update: {
          req_at?: string
          req_by?: string | null
          theme_id?: number
          typez?: Database["public"]["Enums"]["request_type_enum"]
          word_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "word_themes_wait_req_by_fkey"
            columns: ["req_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "word_themes_wait_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "word_themes_wait_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["id"]
          },
        ]
      }
      words: {
        Row: {
          added_at: string
          added_by: string | null
          first_letter: string | null
          id: number
          k_canuse: boolean
          last_letter: string | null
          length: number | null
          noin_canuse: boolean
          word: string
        }
        Insert: {
          added_at?: string
          added_by?: string | null
          first_letter?: string | null
          id?: never
          k_canuse?: boolean
          last_letter?: string | null
          length?: number | null
          noin_canuse?: boolean
          word: string
        }
        Update: {
          added_at?: string
          added_by?: string | null
          first_letter?: string | null
          id?: never
          k_canuse?: boolean
          last_letter?: string | null
          length?: number | null
          noin_canuse?: boolean
          word?: string
        }
        Relationships: [
          {
            foreignKeyName: "words_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_word_themes_bulk: {
        Args: { pairs: Json }
        Returns: {
          theme_id: number
          theme_name: string
          word: string
          word_id: number
        }[]
      }
      delete_word_themes_wait_bulk: {
        Args: { pairs: Json }
        Returns: undefined
      }
      get_delete_requests_by_themeid: {
        Args: { input_theme_id: number }
        Returns: {
          request_type: Database["public"]["Enums"]["request_type_enum"]
          requested_by: string
          word: string
        }[]
      }
      get_doc_rank: {
        Args: { doc_id: number }
        Returns: number
      }
      get_user_monthly_rank: {
        Args: { uid: string }
        Returns: number
      }
      increment_contribution: {
        Args: { inc_amount: number; target_id: string }
        Returns: undefined
      }
      increment_doc_views: {
        Args: { doc_id: number }
        Returns: undefined
      }
      random_wait_word_ff: {
        Args: { prefixes: string[] }
        Returns: {
          word: string
        }[]
      }
      random_wait_word_ll: {
        Args: { prefixes: string[] }
        Returns: {
          word: string
        }[]
      }
      random_word_ff: {
        Args: { fir1: string[] }
        Returns: {
          word: string
        }[]
      }
      random_word_ll: {
        Args: { fir1: string[] }
        Returns: {
          word: string
        }[]
      }
      reset_monthly_contribution: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_last_update: {
        Args: { docs_id: number }
        Returns: undefined
      }
      update_last_updates: {
        Args: { docs_ids: number[] }
        Returns: undefined
      }
    }
    Enums: {
      document_type: "letter" | "theme" | "ect"
      program_category: "tool" | "util" | "other"
      request_status_enum: "pending" | "approved" | "rejected"
      request_type_enum: "add" | "delete"
      role_level: "r1" | "r2" | "r3" | "r4" | "admin"
      word_type: "ok" | "deprecated"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      document_type: ["letter", "theme", "ect"],
      program_category: ["tool", "util", "other"],
      request_status_enum: ["pending", "approved", "rejected"],
      request_type_enum: ["add", "delete"],
      role_level: ["r1", "r2", "r3", "r4", "admin"],
      word_type: ["ok", "deprecated"],
    },
  },
} as const
