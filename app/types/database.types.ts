export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      docs: {
        Row: {
          created_at: string
          id: number
          last_update: string
          maker: string | null
          name: string
          typez: Database["public"]["Enums"]["document_type"]
        }
        Insert: {
          created_at?: string
          id?: number
          last_update?: string
          maker?: string | null
          name: string
          typez: Database["public"]["Enums"]["document_type"]
        }
        Update: {
          created_at?: string
          id?: number
          last_update?: string
          maker?: string | null
          name?: string
          typez?: Database["public"]["Enums"]["document_type"]
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
          type: Database["public"]["Enums"]["request_type_enum"]
          word: string
        }
        Insert: {
          add_by?: string | null
          date?: string
          docs_id: number
          type?: Database["public"]["Enums"]["request_type_enum"]
          word: string
        }
        Update: {
          add_by?: string | null
          date?: string
          docs_id?: number
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
      docs_wait_words: {
        Row: {
          docs_id: number
          wait_word_id: number
        }
        Insert: {
          docs_id: number
          wait_word_id: number
        }
        Update: {
          docs_id?: number
          wait_word_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "docs_wait_words_docs_id_fkey"
            columns: ["docs_id"]
            isOneToOne: false
            referencedRelation: "docs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "docs_wait_words_wait_word_id_fkey"
            columns: ["wait_word_id"]
            isOneToOne: false
            referencedRelation: "wait_words"
            referencedColumns: ["id"]
          },
        ]
      }
      docs_words: {
        Row: {
          docs_id: number
          word_id: number
        }
        Insert: {
          docs_id: number
          word_id: number
        }
        Update: {
          docs_id?: number
          word_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "docs_words_docs_id_fkey"
            columns: ["docs_id"]
            isOneToOne: false
            referencedRelation: "docs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "docs_words_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["id"]
          },
        ]
      }
      docs_words_wait: {
        Row: {
          docs_id: number
          requested_by: string | null
          typez: Database["public"]["Enums"]["request_type_enum"]
          word_id: number
        }
        Insert: {
          docs_id: number
          requested_by?: string | null
          typez: Database["public"]["Enums"]["request_type_enum"]
          word_id: number
        }
        Update: {
          docs_id?: number
          requested_by?: string | null
          typez?: Database["public"]["Enums"]["request_type_enum"]
          word_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "docs_words_wait_docs_id_fkey"
            columns: ["docs_id"]
            isOneToOne: false
            referencedRelation: "docs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "docs_words_wait_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "docs_words_wait_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "words"
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
      len5_word: {
        Row: {
          id: number
          word: string
        }
        Insert: {
          id?: number
          word: string
        }
        Update: {
          id?: number
          word?: string
        }
        Relationships: []
      }
      len6_word: {
        Row: {
          id: number
          word: string
        }
        Insert: {
          id?: number
          word: string
        }
        Update: {
          id?: number
          word?: string
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
      users: {
        Row: {
          contribution: number
          id: string
          nickname: string
          role: Database["public"]["Enums"]["role_level"]
        }
        Insert: {
          contribution?: number
          id: string
          nickname: string
          role?: Database["public"]["Enums"]["role_level"]
        }
        Update: {
          contribution?: number
          id?: string
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
          requested_at: string | null
          requested_by: string | null
          status: Database["public"]["Enums"]["request_status_enum"]
          word: string
          word_id: number | null
        }
        Insert: {
          id?: never
          request_type: Database["public"]["Enums"]["request_type_enum"]
          requested_at?: string | null
          requested_by?: string | null
          status?: Database["public"]["Enums"]["request_status_enum"]
          word: string
          word_id?: number | null
        }
        Update: {
          id?: never
          request_type?: Database["public"]["Enums"]["request_type_enum"]
          requested_at?: string | null
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
          theme_id: number
          typez: Database["public"]["Enums"]["request_type_enum"]
          word_id: number
        }
        Insert: {
          theme_id: number
          typez: Database["public"]["Enums"]["request_type_enum"]
          word_id: number
        }
        Update: {
          theme_id?: number
          typez?: Database["public"]["Enums"]["request_type_enum"]
          word_id?: number
        }
        Relationships: [
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
          first_letter: string | null
          id: number
          k_canuse: boolean
          last_letter: string | null
          length: number | null
          noin_canuse: boolean
          word: string
          word_type: Database["public"]["Enums"]["word_type"]
        }
        Insert: {
          first_letter?: string | null
          id?: never
          k_canuse?: boolean
          last_letter?: string | null
          length?: number | null
          noin_canuse?: boolean
          word: string
          word_type?: Database["public"]["Enums"]["word_type"]
        }
        Update: {
          first_letter?: string | null
          id?: never
          k_canuse?: boolean
          last_letter?: string | null
          length?: number | null
          noin_canuse?: boolean
          word?: string
          word_type?: Database["public"]["Enums"]["word_type"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      document_type: "letter" | "theme" | "ect"
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
