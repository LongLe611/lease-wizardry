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
      discount_rate_tables: {
        Row: {
          created_at: string | null
          effective_date: string
          id: string
          is_current: boolean | null
        }
        Insert: {
          created_at?: string | null
          effective_date: string
          id?: string
          is_current?: boolean | null
        }
        Update: {
          created_at?: string | null
          effective_date?: string
          id?: string
          is_current?: boolean | null
        }
        Relationships: []
      }
      discount_rates: {
        Row: {
          id: string
          lease_term_bucket: string
          table_id: string | null
          yearly_rate: number
        }
        Insert: {
          id?: string
          lease_term_bucket: string
          table_id?: string | null
          yearly_rate: number
        }
        Update: {
          id?: string
          lease_term_bucket?: string
          table_id?: string | null
          yearly_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "discount_rates_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "discount_rate_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      leases: {
        Row: {
          asset_description: string | null
          asset_type: string | null
          base_payment: number
          base_year: number | null
          commencement_date: string
          contract_number: string
          cpi_index_rate: number | null
          created_at: string | null
          deposit_amount: number | null
          discount_rate: number
          expiration_date: string
          id: string
          interest_rate: number
          is_low_value: boolean | null
          lease_term: number
          lessor_entity: string
          payment_interval: Database["public"]["Enums"]["payment_interval"]
          payment_timing: string | null
          payment_type: Database["public"]["Enums"]["payment_type"]
          rate_table_id: string | null
          residual_value: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          asset_description?: string | null
          asset_type?: string | null
          base_payment: number
          base_year?: number | null
          commencement_date: string
          contract_number: string
          cpi_index_rate?: number | null
          created_at?: string | null
          deposit_amount?: number | null
          discount_rate: number
          expiration_date: string
          id?: string
          interest_rate?: number
          is_low_value?: boolean | null
          lease_term: number
          lessor_entity: string
          payment_interval: Database["public"]["Enums"]["payment_interval"]
          payment_timing?: string | null
          payment_type: Database["public"]["Enums"]["payment_type"]
          rate_table_id?: string | null
          residual_value?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          asset_description?: string | null
          asset_type?: string | null
          base_payment?: number
          base_year?: number | null
          commencement_date?: string
          contract_number?: string
          cpi_index_rate?: number | null
          created_at?: string | null
          deposit_amount?: number | null
          discount_rate?: number
          expiration_date?: string
          id?: string
          interest_rate?: number
          is_low_value?: boolean | null
          lease_term?: number
          lessor_entity?: string
          payment_interval?: Database["public"]["Enums"]["payment_interval"]
          payment_timing?: string | null
          payment_type?: Database["public"]["Enums"]["payment_type"]
          rate_table_id?: string | null
          residual_value?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leases_rate_table_id_fkey"
            columns: ["rate_table_id"]
            isOneToOne: false
            referencedRelation: "discount_rate_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: {
          user_id: string
        }
        Returns: Database["public"]["Enums"]["app_role"]
      }
    }
    Enums: {
      app_role: "accountant" | "auditor" | "admin"
      payment_interval: "monthly" | "quarterly" | "annual"
      payment_type: "fixed" | "variable"
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
