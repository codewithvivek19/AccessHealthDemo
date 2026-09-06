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
      customer_services: {
        Row: {
          created_at: string
          id: string
          location: string | null
          monthly_price: number | null
          plan: string | null
          service_name: string
          started_on: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          monthly_price?: number | null
          plan?: string | null
          service_name: string
          started_on?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          monthly_price?: number | null
          plan?: string | null
          service_name?: string
          started_on?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: string
          created_at: string
          file_url: string | null
          id: string
          issued_on: string
          size_label: string | null
          title: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          file_url?: string | null
          id?: string
          issued_on?: string
          size_label?: string | null
          title: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          file_url?: string | null
          id?: string
          issued_on?: string
          size_label?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      enquiries: {
        Row: {
          audience: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          organisation: string | null
          phone: string | null
          topic: string | null
        }
        Insert: {
          audience?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          organisation?: string | null
          phone?: string | null
          topic?: string | null
        }
        Update: {
          audience?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          organisation?: string | null
          phone?: string | null
          topic?: string | null
        }
        Relationships: []
      }
      organisation_members: {
        Row: {
          created_at: string
          id: string
          organisation_id: string
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organisation_id: string
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organisation_id?: string
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organisation_members_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      organisations: {
        Row: {
          contact_email: string | null
          created_at: string
          id: string
          kind: string
          name: string
          slug: string
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          id?: string
          kind?: string
          name: string
          slug: string
        }
        Update: {
          contact_email?: string | null
          created_at?: string
          id?: string
          kind?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          name: string
          slug: string
          specifications: Json
          tagline: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          name: string
          slug: string
          specifications?: Json
          tagline?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          name?: string
          slug?: string
          specifications?: Json
          tagline?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          community: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          notify_email: boolean
          notify_sms: boolean
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          community?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          notify_email?: boolean
          notify_sms?: boolean
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          community?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          notify_email?: boolean
          notify_sms?: boolean
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_milestones: {
        Row: {
          due_on: string | null
          id: string
          project_id: string
          sort_order: number
          status: string
          title: string
        }
        Insert: {
          due_on?: string | null
          id?: string
          project_id: string
          sort_order?: number
          status?: string
          title: string
        }
        Update: {
          due_on?: string | null
          id?: string
          project_id?: string
          sort_order?: number
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          id: string
          name: string
          organisation_id: string
          progress: number
          site_id: string | null
          stage: string
          status: string
          summary: string | null
          target_date: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          organisation_id: string
          progress?: number
          site_id?: string | null
          stage?: string
          status?: string
          summary?: string | null
          target_date?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          organisation_id?: string
          progress?: number
          site_id?: string | null
          stage?: string
          status?: string
          summary?: string | null
          target_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          body: string | null
          created_at: string
          excerpt: string | null
          external_url: string | null
          id: string
          image_url: string | null
          is_published: boolean
          kind: string
          published_at: string
          slug: string
          title: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          excerpt?: string | null
          external_url?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          kind?: string
          published_at?: string
          slug: string
          title: string
        }
        Update: {
          body?: string | null
          created_at?: string
          excerpt?: string | null
          external_url?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          kind?: string
          published_at?: string
          slug?: string
          title?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          body: string | null
          category: string
          created_at: string
          highlights: string[]
          icon: string
          id: string
          is_published: boolean
          name: string
          slug: string
          sort_order: number
          summary: string
        }
        Insert: {
          body?: string | null
          category?: string
          created_at?: string
          highlights?: string[]
          icon?: string
          id?: string
          is_published?: boolean
          name: string
          slug: string
          sort_order?: number
          summary: string
        }
        Update: {
          body?: string | null
          category?: string
          created_at?: string
          highlights?: string[]
          icon?: string
          id?: string
          is_published?: boolean
          name?: string
          slug?: string
          sort_order?: number
          summary?: string
        }
        Relationships: []
      }
      sites: {
        Row: {
          address: string | null
          created_at: string
          dwellings: number
          id: string
          name: string
          organisation_id: string
          services: string[]
          state: string | null
          status: string
          suburb: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          dwellings?: number
          id?: string
          name: string
          organisation_id: string
          services?: string[]
          state?: string | null
          status?: string
          suburb?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          dwellings?: number
          id?: string
          name?: string
          organisation_id?: string
          services?: string[]
          state?: string | null
          status?: string
          suburb?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sites_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          priority: string
          reference: string
          site_id: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          description: string
          id?: string
          priority?: string
          reference?: string
          site_id?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          priority?: string
          reference?: string
          site_id?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          author_name: string
          body: string
          created_at: string
          id: string
          is_from_acsess: boolean
          ticket_id: string
          user_id: string | null
        }
        Insert: {
          author_name?: string
          body: string
          created_at?: string
          id?: string
          is_from_acsess?: boolean
          ticket_id: string
          user_id?: string | null
        }
        Update: {
          author_name?: string
          body?: string
          created_at?: string
          id?: string
          is_from_acsess?: boolean
          ticket_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_acsess_staff: { Args: { _user_id: string }; Returns: boolean }
      is_org_member: {
        Args: { _organisation_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "customer" | "staff" | "operator" | "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["customer", "staff", "operator", "admin"],
    },
  },
} as const
