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
      "Archive COA": {
        Row: {
          account_code: string
          bank_name: string | null
          category: string
          created_at: string | null
          description: string | null
          detail_desc: string | null
          detail_type: string | null
          entry_balance: number | null
          id: string
          lock_option: boolean | null
          name: string
          tax: string | null
          updated_at: string | null
          user_access: string | null
          user_id: string | null
        }
        Insert: {
          account_code: string
          bank_name?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          detail_desc?: string | null
          detail_type?: string | null
          entry_balance?: number | null
          id?: string
          lock_option?: boolean | null
          name: string
          tax?: string | null
          updated_at?: string | null
          user_access?: string | null
          user_id?: string | null
        }
        Update: {
          account_code?: string
          bank_name?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          detail_desc?: string | null
          detail_type?: string | null
          entry_balance?: number | null
          id?: string
          lock_option?: boolean | null
          name?: string
          tax?: string | null
          updated_at?: string | null
          user_access?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      assets: {
        Row: {
          asset_name: string
          asset_tag: number
          asset_type: string
          assigned_to: string
          created_at: string
          department: string
          id: string
          invoice_no: string | null
          manufacturer: string | null
          model: string | null
          notes: string | null
          purchase_date: string
          purchase_price: number
          reason_for_sale: string | null
          sale_date: string | null
          sale_price: number | null
          serial_number: string | null
          sold_to: string | null
          status: string
          updated_at: string | null
          user_id: string
          warranty_deadline: string | null
        }
        Insert: {
          asset_name: string
          asset_tag: number
          asset_type: string
          assigned_to: string
          created_at?: string
          department: string
          id?: string
          invoice_no?: string | null
          manufacturer?: string | null
          model?: string | null
          notes?: string | null
          purchase_date: string
          purchase_price: number
          reason_for_sale?: string | null
          sale_date?: string | null
          sale_price?: number | null
          serial_number?: string | null
          sold_to?: string | null
          status: string
          updated_at?: string | null
          user_id: string
          warranty_deadline?: string | null
        }
        Update: {
          asset_name?: string
          asset_tag?: number
          asset_type?: string
          assigned_to?: string
          created_at?: string
          department?: string
          id?: string
          invoice_no?: string | null
          manufacturer?: string | null
          model?: string | null
          notes?: string | null
          purchase_date?: string
          purchase_price?: number
          reason_for_sale?: string | null
          sale_date?: string | null
          sale_price?: number | null
          serial_number?: string | null
          sold_to?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
          warranty_deadline?: string | null
        }
        Relationships: []
      }
      bank_receive_transactions: {
        Row: {
          amount: number
          created_at: string
          date_received: string
          id: string
          notes: string | null
          number: number
          payer_name: string
          proof_url: string | null
          receiving_account: string
          reference: string | null
          target_balance_after: number
          target_balance_before: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          date_received: string
          id?: string
          notes?: string | null
          number: number
          payer_name: string
          proof_url?: string | null
          receiving_account: string
          reference?: string | null
          target_balance_after: number
          target_balance_before: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          date_received?: string
          id?: string
          notes?: string | null
          number?: number
          payer_name?: string
          proof_url?: string | null
          receiving_account?: string
          reference?: string | null
          target_balance_after?: number
          target_balance_before?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_receive_transactions_receiving_account_fkey"
            columns: ["receiving_account"]
            isOneToOne: false
            referencedRelation: "cashbank"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_transfer_transactions: {
        Row: {
          amount: number
          created_at: string
          from_account: string
          id: string
          notes: string | null
          number: number
          source_balance_after: number
          source_balance_before: number
          target_balance_after: number
          target_balance_before: number
          to_account: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          from_account: string
          id?: string
          notes?: string | null
          number: number
          source_balance_after: number
          source_balance_before: number
          target_balance_after: number
          target_balance_before: number
          to_account: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          from_account?: string
          id?: string
          notes?: string | null
          number?: number
          source_balance_after?: number
          source_balance_before?: number
          target_balance_after?: number
          target_balance_before?: number
          to_account?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_transfer_transactions_from_account_fkey"
            columns: ["from_account"]
            isOneToOne: false
            referencedRelation: "cashbank"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_transfer_transactions_to_account_fkey"
            columns: ["to_account"]
            isOneToOne: false
            referencedRelation: "cashbank"
            referencedColumns: ["id"]
          },
        ]
      }
      cashbank: {
        Row: {
          account_name: string
          account_type: string
          balance: number
          bank_name: string
          bank_number: string
          created_at: string
          id: string
          number: number
          status: string
          type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_name: string
          account_type: string
          balance?: number
          bank_name: string
          bank_number: string
          created_at?: string
          id?: string
          number: number
          status?: string
          type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_name?: string
          account_type?: string
          balance?: number
          bank_name?: string
          bank_number?: string
          created_at?: string
          id?: string
          number?: number
          status?: string
          type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chart_of_accounts: {
        Row: {
          account_code: string
          bank_name: string | null
          category: string
          created_at: string | null
          description: string | null
          detail_desc: string | null
          detail_type: string | null
          entry_balance: number | null
          id: string
          level: number
          lock_option: boolean | null
          name: string
          parent_code: string | null
          parent_id: string | null
          tax: string | null
          updated_at: string | null
          user_access: string | null
          user_id: string | null
        }
        Insert: {
          account_code: string
          bank_name?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          detail_desc?: string | null
          detail_type?: string | null
          entry_balance?: number | null
          id?: string
          level: number
          lock_option?: boolean | null
          name: string
          parent_code?: string | null
          parent_id?: string | null
          tax?: string | null
          updated_at?: string | null
          user_access?: string | null
          user_id?: string | null
        }
        Update: {
          account_code?: string
          bank_name?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          detail_desc?: string | null
          detail_type?: string | null
          entry_balance?: number | null
          id?: string
          level?: number
          lock_option?: boolean | null
          name?: string
          parent_code?: string | null
          parent_id?: string | null
          tax?: string | null
          updated_at?: string | null
          user_access?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chart_of_accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          address: string
          category: string
          created_at: string
          email: string
          id: string
          name: string
          number: number
          phone: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address: string
          category: string
          created_at?: string
          email: string
          id?: string
          name: string
          number: number
          phone: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string
          category?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          number?: number
          phone?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          beneficiary: string
          category: string
          created_at: string
          date: string
          grand_total: number
          id: string
          items: Json
          number: number
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          beneficiary: string
          category: string
          created_at?: string
          date: string
          grand_total: number
          id?: string
          items: Json
          number: number
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          beneficiary?: string
          category?: string
          created_at?: string
          date?: string
          grand_total?: number
          id?: string
          items?: Json
          number?: number
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          approver: string
          created_at: string
          date: string
          dpp: number | null
          due_date: string
          grand_total: number
          id: string
          items: Json
          number: number
          paid_amount: number | null
          payment_date: string | null
          payment_method: string | null
          payment_reference: string | null
          pph: number | null
          pph_percentage: number | null
          pph_type: string | null
          ppn: number | null
          ppn_percentage: number | null
          status: string
          tags: string[] | null
          tax_calculation_method: boolean
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approver: string
          created_at?: string
          date: string
          dpp?: number | null
          due_date: string
          grand_total: number
          id?: string
          items: Json
          number: number
          paid_amount?: number | null
          payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          pph?: number | null
          pph_percentage?: number | null
          pph_type?: string | null
          ppn?: number | null
          ppn_percentage?: number | null
          status: string
          tags?: string[] | null
          tax_calculation_method: boolean
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approver?: string
          created_at?: string
          date?: string
          dpp?: number | null
          due_date?: string
          grand_total?: number
          id?: string
          items?: Json
          number?: number
          paid_amount?: number | null
          payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          pph?: number | null
          pph_percentage?: number | null
          pph_type?: string | null
          ppn?: number | null
          ppn_percentage?: number | null
          status?: string
          tags?: string[] | null
          tax_calculation_method?: boolean
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      journal_of_COA: {
        Row: {
          attachment_url: string | null
          created_at: string | null
          date: string
          id: string
          journal_code: string
          journal_details: Json
          memo: string | null
          tag: string | null
          total_amount_credit: number
          total_amount_debit: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string | null
          date: string
          id?: string
          journal_code: string
          journal_details: Json
          memo?: string | null
          tag?: string | null
          total_amount_credit?: number
          total_amount_debit?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          attachment_url?: string | null
          created_at?: string | null
          date?: string
          id?: string
          journal_code?: string
          journal_details?: Json
          memo?: string | null
          tag?: string | null
          total_amount_credit?: number
          total_amount_debit?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      offers: {
        Row: {
          created_at: string
          date: string
          discount_terms: string | null
          due_date: string
          expiry_date: string | null
          grand_total: number
          id: string
          items: Json
          number: number
          status: string
          tags: string[] | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          discount_terms?: string | null
          due_date: string
          expiry_date?: string | null
          grand_total: number
          id?: string
          items: Json
          number: number
          status: string
          tags?: string[] | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          discount_terms?: string | null
          due_date?: string
          expiry_date?: string | null
          grand_total?: number
          id?: string
          items?: Json
          number?: number
          status?: string
          tags?: string[] | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      order_deliveries: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          delivery_date: string
          grand_total: number
          id: string
          items: Json
          notes: string | null
          number: number
          order_date: string
          payment_method: string
          shipping_address: string
          shipping_method: string
          status: string
          tax_details: Json | null
          tracking_number: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          delivery_date: string
          grand_total: number
          id?: string
          items: Json
          notes?: string | null
          number: number
          order_date: string
          payment_method: string
          shipping_address: string
          shipping_method: string
          status: string
          tax_details?: Json | null
          tracking_number: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          delivery_date?: string
          grand_total?: number
          id?: string
          items?: Json
          notes?: string | null
          number?: number
          order_date?: string
          payment_method?: string
          shipping_address?: string
          shipping_method?: string
          status?: string
          tax_details?: Json | null
          tracking_number?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          date: string
          due_date: string
          grand_total: number
          id: string
          items: Json
          number: number
          orders_date: string
          status: string
          tags: string[] | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          due_date: string
          grand_total: number
          id?: string
          items: Json
          number: number
          orders_date: string
          status: string
          tags?: string[] | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          due_date?: string
          grand_total?: number
          id?: string
          items?: Json
          number?: number
          orders_date?: string
          status?: string
          tags?: string[] | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          buy_price: number
          category: string
          created_at: string
          id: string
          min_stock: number
          name: string
          number: number
          sell_price: number | null
          status: string
          total_stock: number
          unit: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          buy_price: number
          category: string
          created_at?: string
          id?: string
          min_stock: number
          name: string
          number: number
          sell_price?: number | null
          status: string
          total_stock: number
          unit: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          buy_price?: number
          category?: string
          created_at?: string
          id?: string
          min_stock?: number
          name?: string
          number?: number
          sell_price?: number | null
          status?: string
          total_stock?: number
          unit?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_logo: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          company_logo?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          company_logo?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quotations: {
        Row: {
          created_at: string
          customer_name: string
          id: string
          items: Json
          number: number
          quotation_date: string
          status: string
          tax_details: Json | null
          terms: string | null
          total: number
          updated_at: string | null
          user_id: string
          valid_until: string
        }
        Insert: {
          created_at?: string
          customer_name: string
          id?: string
          items: Json
          number: number
          quotation_date: string
          status: string
          tax_details?: Json | null
          terms?: string | null
          total: number
          updated_at?: string | null
          user_id: string
          valid_until: string
        }
        Update: {
          created_at?: string
          customer_name?: string
          id?: string
          items?: Json
          number?: number
          quotation_date?: string
          status?: string
          tax_details?: Json | null
          terms?: string | null
          total?: number
          updated_at?: string | null
          user_id?: string
          valid_until?: string
        }
        Relationships: []
      }
      receive_payment_transactions: {
        Row: {
          coa_code: string
          created_at: string | null
          credit: number | null
          debit: number | null
          description: string
          id: string
          transaction_date: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          coa_code: string
          created_at?: string | null
          credit?: number | null
          debit?: number | null
          description: string
          id?: string
          transaction_date: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          coa_code?: string
          created_at?: string | null
          credit?: number | null
          debit?: number | null
          description?: string
          id?: string
          transaction_date?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      requests: {
        Row: {
          created_at: string
          date: string | null
          due_date: string
          grand_total: number
          id: string
          items: Json
          number: number
          requested_by: string
          status: string
          tags: string[] | null
          type: string
          updated_at: string | null
          urgency: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string | null
          due_date: string
          grand_total: number
          id?: string
          items: Json
          number: number
          requested_by: string
          status: string
          tags?: string[] | null
          type: string
          updated_at?: string | null
          urgency: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string | null
          due_date?: string
          grand_total?: number
          id?: string
          items?: Json
          number?: number
          requested_by?: string
          status?: string
          tags?: string[] | null
          type?: string
          updated_at?: string | null
          urgency?: string
          user_id?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          created_at: string
          customer_name: string
          due_date: string
          grand_total: number
          id: string
          invoice_date: string
          items: Json
          number: number
          status: string
          tax_details: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_name: string
          due_date: string
          grand_total: number
          id?: string
          invoice_date: string
          items: Json
          number: number
          status: string
          tax_details?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          customer_name?: string
          due_date?: string
          grand_total?: number
          id?: string
          invoice_date?: string
          items?: Json
          number?: number
          status?: string
          tax_details?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      shipments: {
        Row: {
          carrier: string
          created_at: string
          date: string
          due_date: string
          grand_total: number
          id: string
          items: Json
          number: number
          shipping_date: string
          status: string
          tags: string[] | null
          tracking_number: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          carrier: string
          created_at?: string
          date: string
          due_date: string
          grand_total: number
          id?: string
          items: Json
          number: number
          shipping_date: string
          status: string
          tags?: string[] | null
          tracking_number: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          carrier?: string
          created_at?: string
          date?: string
          due_date?: string
          grand_total?: number
          id?: string
          items?: Json
          number?: number
          shipping_date?: string
          status?: string
          tags?: string[] | null
          tracking_number?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      warehouses: {
        Row: {
          created_at: string
          id: string
          location: string
          name: string
          number: number
          total_stock: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location: string
          name: string
          number: number
          total_stock: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string
          name?: string
          number?: number
          total_stock?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_journal_reference: {
        Args: { search_text: string }
        Returns: {
          id: string
        }[]
      }
      find_journal_refs_by_account_code: {
        Args: { search_code: string }
        Returns: {
          id: string
        }[]
      }
      get_current_user_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          company_logo: string
          created_at: string
          email: string
          id: string
          name: string
          role: string
          updated_at: string
        }[]
      }
      update_offer: {
        Args: {
          p_date: string
          p_discount_terms: string
          p_due_date: string
          p_expiry_date: string
          p_grand_total: number
          p_id: string
          p_items: Json
          p_status: string
          p_tags: string[]
          p_type: string
          p_updated_at: string
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
