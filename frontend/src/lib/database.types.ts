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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      about: {
        Row: {
          bio: string | null
          created_at: string | null
          details: Json | null
          heading: string | null
          id: string
          image_url: string | null
          imageurl: string | null
          is_active: boolean | null
          order_index: number | null
          paragraphs: Json | null
          portfolio_id: string | null
          stats: Json | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          details?: Json | null
          heading?: string | null
          id?: string
          image_url?: string | null
          imageurl?: string | null
          is_active?: boolean | null
          order_index?: number | null
          paragraphs?: Json | null
          portfolio_id?: string | null
          stats?: Json | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          details?: Json | null
          heading?: string | null
          id?: string
          image_url?: string | null
          imageurl?: string | null
          is_active?: boolean | null
          order_index?: number | null
          paragraphs?: Json | null
          portfolio_id?: string | null
          stats?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          id: string
          last_login: string | null
          password_hash: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_login?: string | null
          password_hash: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          last_login?: string | null
          password_hash?: string
          username?: string
        }
        Relationships: []
      }
      contact: {
        Row: {
          behance_url: string | null
          created_at: string | null
          description: string | null
          dribbble_url: string | null
          email: string | null
          facebook_url: string | null
          form_enabled: boolean | null
          form_success_message: string | null
          github_url: string | null
          heading: string | null
          id: string
          instagram_url: string | null
          is_active: boolean | null
          linkedin_url: string | null
          location: string | null
          phone: string | null
          portfolio_id: string | null
          reddit_url: string | null
          twitter_url: string | null
          updated_at: string | null
          whatsapp_message: string | null
          whatsapp_number: string | null
          youtube_url: string | null
        }
        Insert: {
          behance_url?: string | null
          created_at?: string | null
          description?: string | null
          dribbble_url?: string | null
          email?: string | null
          facebook_url?: string | null
          form_enabled?: boolean | null
          form_success_message?: string | null
          github_url?: string | null
          heading?: string | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean | null
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          portfolio_id?: string | null
          reddit_url?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          whatsapp_message?: string | null
          whatsapp_number?: string | null
          youtube_url?: string | null
        }
        Update: {
          behance_url?: string | null
          created_at?: string | null
          description?: string | null
          dribbble_url?: string | null
          email?: string | null
          facebook_url?: string | null
          form_enabled?: boolean | null
          form_success_message?: string | null
          github_url?: string | null
          heading?: string | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean | null
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          portfolio_id?: string | null
          reddit_url?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          whatsapp_message?: string | null
          whatsapp_number?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          portfolio_id: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          portfolio_id?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          portfolio_id?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      hero: {
        Row: {
          background_image: string | null
          buttons: Json | null
          greeting: string | null
          id: string
          is_active: boolean | null
          name: string | null
          portfolio_id: string | null
          subtitle: string | null
          updated_at: string | null
        }
        Insert: {
          background_image?: string | null
          buttons?: Json | null
          greeting?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          portfolio_id?: string | null
          subtitle?: string | null
          updated_at?: string | null
        }
        Update: {
          background_image?: string | null
          buttons?: Json | null
          greeting?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          portfolio_id?: string | null
          subtitle?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hero_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string | null
          expires_at: string | null
          id: string
          invited_by: string | null
          is_accepted: boolean | null
          portfolio_id: string | null
          token: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          is_accepted?: boolean | null
          portfolio_id?: string | null
          token?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          is_accepted?: boolean | null
          portfolio_id?: string | null
          token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_members: {
        Row: {
          email: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          portfolio_id: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          email?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          portfolio_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          email?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          portfolio_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_members_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolios: {
        Row: {
          created_at: string | null
          custom_domain: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_published: boolean | null
          owner_id: string | null
          slug: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_domain?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_published?: boolean | null
          owner_id?: string | null
          slug?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_domain?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_published?: boolean | null
          owner_id?: string | null
          slug?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          behance_url: string | null
          category: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          fb_url: string | null
          featured: boolean | null
          github_url: string | null
          id: string
          image_url: string | null
          images: string[] | null
          insta_url: string | null
          is_active: boolean | null
          linkedin_url: string | null
          live_url: string | null
          long_description: string | null
          portfolio_id: string | null
          reddit_url: string | null
          slug: string | null
          status: string | null
          tags: string[] | null
          technologies: string[] | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          behance_url?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          fb_url?: string | null
          featured?: boolean | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          insta_url?: string | null
          is_active?: boolean | null
          linkedin_url?: string | null
          live_url?: string | null
          long_description?: string | null
          portfolio_id?: string | null
          reddit_url?: string | null
          slug?: string | null
          status?: string | null
          tags?: string[] | null
          technologies?: string[] | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          behance_url?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          fb_url?: string | null
          featured?: boolean | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          insta_url?: string | null
          is_active?: boolean | null
          linkedin_url?: string | null
          live_url?: string | null
          long_description?: string | null
          portfolio_id?: string | null
          reddit_url?: string | null
          slug?: string | null
          status?: string | null
          tags?: string[] | null
          technologies?: string[] | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string | null
          custom_head_code: string | null
          favicon_url: string | null
          google_analytics_id: string | null
          id: string
          nav_order: Json | null
          og_image_url: string | null
          portfolio_id: string | null
          site_description: string | null
          site_title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_head_code?: string | null
          favicon_url?: string | null
          google_analytics_id?: string | null
          id?: string
          nav_order?: Json | null
          og_image_url?: string | null
          portfolio_id?: string | null
          site_description?: string | null
          site_title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_head_code?: string | null
          favicon_url?: string | null
          google_analytics_id?: string | null
          id?: string
          nav_order?: Json | null
          og_image_url?: string | null
          portfolio_id?: string | null
          site_description?: string | null
          site_title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      skills: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          level: string | null
          name: string | null
          portfolio_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          level?: string | null
          name?: string | null
          portfolio_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          level?: string | null
          name?: string | null
          portfolio_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      themes: {
        Row: {
          border_radius: number | null
          button_style: string | null
          card_style: string | null
          color_accent: string | null
          color_accent_bg: string | null
          color_accent_soft: string | null
          color_danger: string | null
          color_dark: string | null
          color_featured: string | null
          color_gray: string | null
          color_gray_warm: string | null
          color_light: string | null
          color_primary: string | null
          color_secondary: string | null
          color_success: string | null
          color_text: string | null
          color_text_muted: string | null
          color_warning: string | null
          created_at: string | null
          dark_mode: boolean | null
          enable_animations: boolean | null
          font_family: string | null
          gradient_direction: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          max_width: number | null
          name: string | null
          order_index: number | null
          portfolio_id: string | null
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          border_radius?: number | null
          button_style?: string | null
          card_style?: string | null
          color_accent?: string | null
          color_accent_bg?: string | null
          color_accent_soft?: string | null
          color_danger?: string | null
          color_dark?: string | null
          color_featured?: string | null
          color_gray?: string | null
          color_gray_warm?: string | null
          color_light?: string | null
          color_primary?: string | null
          color_secondary?: string | null
          color_success?: string | null
          color_text?: string | null
          color_text_muted?: string | null
          color_warning?: string | null
          created_at?: string | null
          dark_mode?: boolean | null
          enable_animations?: boolean | null
          font_family?: string | null
          gradient_direction?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          max_width?: number | null
          name?: string | null
          order_index?: number | null
          portfolio_id?: string | null
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          border_radius?: number | null
          button_style?: string | null
          card_style?: string | null
          color_accent?: string | null
          color_accent_bg?: string | null
          color_accent_soft?: string | null
          color_danger?: string | null
          color_dark?: string | null
          color_featured?: string | null
          color_gray?: string | null
          color_gray_warm?: string | null
          color_light?: string | null
          color_primary?: string | null
          color_secondary?: string | null
          color_success?: string | null
          color_text?: string | null
          color_text_muted?: string | null
          color_warning?: string | null
          created_at?: string | null
          dark_mode?: boolean | null
          enable_animations?: boolean | null
          font_family?: string | null
          gradient_direction?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          max_width?: number | null
          name?: string | null
          order_index?: number | null
          portfolio_id?: string | null
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      todos: {
        Row: {
          completed: boolean | null
          id: number
          task: string
        }
        Insert: {
          completed?: boolean | null
          id?: number
          task: string
        }
        Update: {
          completed?: boolean | null
          id?: number
          task?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: { Args: { invite_token: string }; Returns: boolean }
      current_user_portfolio_ids: {
        Args: never
        Returns: {
          portfolio_id: string
          role: string
        }[]
      }
      is_portfolio_member: {
        Args: { p_id: string; u_id: string }
        Returns: boolean
      }
      is_portfolio_owner: {
        Args: { p_id: string; u_id: string }
        Returns: boolean
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
