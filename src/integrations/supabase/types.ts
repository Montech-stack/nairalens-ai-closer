export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      campaigns: {
        Row: {
          budget: number | null;
          cpl: number | null;
          created_at: string | null;
          date_end: string | null;
          date_start: string | null;
          id: string;
          leads_count: number | null;
          name: string;
          platform: string | null;
          status: string | null;
          user_id: string;
        };
        Insert: {
          budget?: number | null;
          cpl?: number | null;
          created_at?: string | null;
          date_end?: string | null;
          date_start?: string | null;
          id?: string;
          leads_count?: number | null;
          name: string;
          platform?: string | null;
          status?: string | null;
          user_id: string;
        };
        Update: {
          budget?: number | null;
          cpl?: number | null;
          created_at?: string | null;
          date_end?: string | null;
          date_start?: string | null;
          id?: string;
          leads_count?: number | null;
          name?: string;
          platform?: string | null;
          status?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          annotation: string | null;
          created_at: string | null;
          id: string;
          lead_id: string;
          message_text: string;
          role: string;
          user_id: string;
          wa_message_id: string | null;
        };
        Insert: {
          annotation?: string | null;
          created_at?: string | null;
          id?: string;
          lead_id: string;
          message_text: string;
          role: string;
          user_id: string;
          wa_message_id?: string | null;
        };
        Update: {
          annotation?: string | null;
          created_at?: string | null;
          id?: string;
          lead_id?: string;
          message_text?: string;
          role?: string;
          user_id?: string;
          wa_message_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      leads: {
        Row: {
          ai_paused: boolean | null;
          budget_max: number | null;
          budget_min: number | null;
          created_at: string | null;
          current_objective: string | null;
          current_strategy: string | null;
          followup_count: number;
          id: string;
          intent_score: number | null;
          last_touch_at: string | null;
          location_preference: string | null;
          name: string;
          next_move: string | null;
          notes: string | null;
          occupation: string | null;
          phone: string | null;
          psych_profile: string | null;
          risk_signals: string | null;
          source: string | null;
          stage: string | null;
          user_id: string;
        };
        Insert: {
          ai_paused?: boolean | null;
          budget_max?: number | null;
          budget_min?: number | null;
          created_at?: string | null;
          current_objective?: string | null;
          current_strategy?: string | null;
          followup_count?: number;
          id?: string;
          intent_score?: number | null;
          last_touch_at?: string | null;
          location_preference?: string | null;
          name: string;
          next_move?: string | null;
          notes?: string | null;
          occupation?: string | null;
          phone?: string | null;
          psych_profile?: string | null;
          risk_signals?: string | null;
          source?: string | null;
          stage?: string | null;
          user_id: string;
        };
        Update: {
          ai_paused?: boolean | null;
          budget_max?: number | null;
          budget_min?: number | null;
          created_at?: string | null;
          current_objective?: string | null;
          current_strategy?: string | null;
          followup_count?: number;
          id?: string;
          intent_score?: number | null;
          last_touch_at?: string | null;
          location_preference?: string | null;
          name?: string;
          next_move?: string | null;
          notes?: string | null;
          occupation?: string | null;
          phone?: string | null;
          psych_profile?: string | null;
          risk_signals?: string | null;
          source?: string | null;
          stage?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      market_tags: {
        Row: {
          created_at: string | null;
          id: string;
          tag_text: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          tag_text: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          tag_text?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      objection_rules: {
        Row: {
          created_at: string | null;
          id: string;
          is_active: boolean | null;
          response_script: string;
          trigger_phrase: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          response_script: string;
          trigger_phrase: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          response_script?: string;
          trigger_phrase?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          agents_count: number | null;
          ai_model: string | null;
          avg_deal_size: number | null;
          biggest_challenge: string | null;
          city: string | null;
          closing_triggers: string | null;
          company_name: string | null;
          created_at: string | null;
          deals_last_quarter: number | null;
          full_name: string | null;
          id: string;
          language: string | null;
          logo_url: string | null;
          max_followups: number | null;
          monthly_lead_volume: string | null;
          monthly_revenue_target: number | null;
          onboarding_complete: boolean | null;
          persona: string | null;
          price_objection_response: string | null;
          primary_property_type: string | null;
          response_delay: number | null;
          site_visit_cta: string | null;
          updated_at: string | null;
          user_id: string;
          whatsapp_number: string | null;
          years_experience: number | null;
        };
        Insert: {
          agents_count?: number | null;
          ai_model?: string | null;
          avg_deal_size?: number | null;
          biggest_challenge?: string | null;
          city?: string | null;
          closing_triggers?: string | null;
          company_name?: string | null;
          created_at?: string | null;
          deals_last_quarter?: number | null;
          full_name?: string | null;
          id?: string;
          language?: string | null;
          logo_url?: string | null;
          max_followups?: number | null;
          monthly_lead_volume?: string | null;
          monthly_revenue_target?: number | null;
          onboarding_complete?: boolean | null;
          persona?: string | null;
          price_objection_response?: string | null;
          primary_property_type?: string | null;
          response_delay?: number | null;
          site_visit_cta?: string | null;
          updated_at?: string | null;
          user_id: string;
          whatsapp_number?: string | null;
          years_experience?: number | null;
        };
        Update: {
          agents_count?: number | null;
          ai_model?: string | null;
          avg_deal_size?: number | null;
          biggest_challenge?: string | null;
          city?: string | null;
          closing_triggers?: string | null;
          company_name?: string | null;
          created_at?: string | null;
          deals_last_quarter?: number | null;
          full_name?: string | null;
          id?: string;
          language?: string | null;
          logo_url?: string | null;
          max_followups?: number | null;
          monthly_lead_volume?: string | null;
          monthly_revenue_target?: number | null;
          onboarding_complete?: boolean | null;
          persona?: string | null;
          price_objection_response?: string | null;
          primary_property_type?: string | null;
          response_delay?: number | null;
          site_visit_cta?: string | null;
          updated_at?: string | null;
          user_id?: string;
          whatsapp_number?: string | null;
          years_experience?: number | null;
        };
        Relationships: [];
      };
      properties: {
        Row: {
          created_at: string | null;
          document_url: string | null;
          id: string;
          location: string | null;
          name: string | null;
          plot_id: string | null;
          price: number | null;
          size_sqm: number | null;
          status: string | null;
          title_type: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          document_url?: string | null;
          id?: string;
          location?: string | null;
          name?: string | null;
          plot_id?: string | null;
          price?: number | null;
          size_sqm?: number | null;
          status?: string | null;
          title_type?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          document_url?: string | null;
          id?: string;
          location?: string | null;
          name?: string | null;
          plot_id?: string | null;
          price?: number | null;
          size_sqm?: number | null;
          status?: string | null;
          title_type?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      whatsapp_integrations: {
        Row: {
          access_token: string | null;
          business_phone: string | null;
          created_at: string;
          id: string;
          last_event_at: string | null;
          phone_number_id: string | null;
          status: string;
          updated_at: string;
          user_id: string;
          verify_token: string | null;
        };
        Insert: {
          access_token?: string | null;
          business_phone?: string | null;
          created_at?: string;
          id?: string;
          last_event_at?: string | null;
          phone_number_id?: string | null;
          status?: string;
          updated_at?: string;
          user_id: string;
          verify_token?: string | null;
        };
        Update: {
          access_token?: string | null;
          business_phone?: string | null;
          created_at?: string;
          id?: string;
          last_event_at?: string | null;
          phone_number_id?: string | null;
          status?: string;
          updated_at?: string;
          user_id?: string;
          verify_token?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
