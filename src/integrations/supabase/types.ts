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
      app_config: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "app_config_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_addresses: {
        Row: {
          address_name: string
          building_name: string | null
          created_at: string | null
          delivery_instructions: string | null
          full_address: string
          id: string
          is_default: boolean | null
          room_number: string | null
          user_id: string | null
        }
        Insert: {
          address_name: string
          building_name?: string | null
          created_at?: string | null
          delivery_instructions?: string | null
          full_address: string
          id?: string
          is_default?: boolean | null
          room_number?: string | null
          user_id?: string | null
        }
        Update: {
          address_name?: string
          building_name?: string | null
          created_at?: string | null
          delivery_instructions?: string | null
          full_address?: string
          id?: string
          is_default?: boolean | null
          room_number?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      email_notifications: {
        Row: {
          body_html: string | null
          body_text: string | null
          error_message: string | null
          id: string
          notification_type: string
          order_id: string | null
          recipient_email: string
          sent_at: string | null
          status: string | null
          subject: string
        }
        Insert: {
          body_html?: string | null
          body_text?: string | null
          error_message?: string | null
          id?: string
          notification_type: string
          order_id?: string | null
          recipient_email: string
          sent_at?: string | null
          status?: string | null
          subject: string
        }
        Update: {
          body_html?: string | null
          body_text?: string | null
          error_message?: string | null
          id?: string
          notification_type?: string
          order_id?: string | null
          recipient_email?: string
          sent_at?: string | null
          status?: string | null
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      homepage_banners: {
        Row: {
          banner_type: string
          button_text: string | null
          button_url: string | null
          created_at: string
          description: string | null
          display_order: number
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean
          start_date: string | null
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          banner_type?: string
          button_text?: string | null
          button_url?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          start_date?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          banner_type?: string
          button_text?: string | null
          button_url?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          start_date?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      item_options: {
        Row: {
          created_at: string | null
          id: string
          menu_item_id: string | null
          name: string
          required: boolean | null
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          menu_item_id?: string | null
          name: string
          required?: boolean | null
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          menu_item_id?: string | null
          name?: string
          required?: boolean | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_options_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          merchant_id: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          merchant_id?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          merchant_id?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          ingredients: string[] | null
          is_available: boolean | null
          item_size: string | null
          item_sizePrice: number | null
          merchant_id: string | null
          name: string | null
          preparation_time_minutes: number | null
          price: number
          staff_only: boolean | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          is_available?: boolean | null
          item_size?: string | null
          item_sizePrice?: number | null
          merchant_id?: string | null
          name?: string | null
          preparation_time_minutes?: number | null
          price: number
          staff_only?: boolean | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          is_available?: boolean | null
          item_size?: string | null
          item_sizePrice?: number | null
          merchant_id?: string | null
          name?: string | null
          preparation_time_minutes?: number | null
          price?: number
          staff_only?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_order_updates: {
        Row: {
          created_at: string | null
          id: string
          merchant_id: string | null
          new_status: string
          notes: string | null
          old_status: string
          order_id: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          merchant_id?: string | null
          new_status: string
          notes?: string | null
          old_status: string
          order_id?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          merchant_id?: string | null
          new_status?: string
          notes?: string | null
          old_status?: string
          order_id?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merchant_order_updates_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merchant_order_updates_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      merchants: {
        Row: {
          can_manage_orders: boolean | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          delivery_fee: number | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          location: string
          minimum_order: number | null
          name: string
          opening_hours: Json | null
          preparation_time_minutes: number | null
          updated_at: string | null
        }
        Insert: {
          can_manage_orders?: boolean | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          delivery_fee?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location: string
          minimum_order?: number | null
          name: string
          opening_hours?: Json | null
          preparation_time_minutes?: number | null
          updated_at?: string | null
        }
        Update: {
          can_manage_orders?: boolean | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          delivery_fee?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location?: string
          minimum_order?: number | null
          name?: string
          opening_hours?: Json | null
          preparation_time_minutes?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      option_choices: {
        Row: {
          created_at: string | null
          id: string
          is_available: boolean | null
          name: string
          option_id: string | null
          price_modifier: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          name: string
          option_id?: string | null
          price_modifier?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          name?: string
          option_id?: string | null
          price_modifier?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "option_choices_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "item_options"
            referencedColumns: ["id"]
          },
        ]
      }
      order_item_customizations: {
        Row: {
          additional_cost: number | null
          choice_id: string | null
          created_at: string | null
          id: string
          option_id: string | null
          order_item_id: string | null
        }
        Insert: {
          additional_cost?: number | null
          choice_id?: string | null
          created_at?: string | null
          id?: string
          option_id?: string | null
          order_item_id?: string | null
        }
        Update: {
          additional_cost?: number | null
          choice_id?: string | null
          created_at?: string | null
          id?: string
          option_id?: string | null
          order_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_item_customizations_choice_id_fkey"
            columns: ["choice_id"]
            isOneToOne: false
            referencedRelation: "option_choices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_item_customizations_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "item_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_item_customizations_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          item_price: number
          menu_item_id: string | null
          order_id: string | null
          quantity: number
          special_requests: string | null
          total_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_price: number
          menu_item_id?: string | null
          order_id?: string | null
          quantity: number
          special_requests?: string | null
          total_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          item_price?: number
          menu_item_id?: string | null
          order_id?: string | null
          quantity?: number
          special_requests?: string | null
          total_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_reviews: {
        Row: {
          created_at: string | null
          customer_comment: string | null
          customer_id: string | null
          customer_rating: number | null
          food_comment: string | null
          food_rating: number | null
          id: string
          is_anonymous: boolean | null
          order_id: string | null
          runner_comment: string | null
          runner_id: string | null
          runner_rating: number | null
        }
        Insert: {
          created_at?: string | null
          customer_comment?: string | null
          customer_id?: string | null
          customer_rating?: number | null
          food_comment?: string | null
          food_rating?: number | null
          id?: string
          is_anonymous?: boolean | null
          order_id?: string | null
          runner_comment?: string | null
          runner_id?: string | null
          runner_rating?: number | null
        }
        Update: {
          created_at?: string | null
          customer_comment?: string | null
          customer_id?: string | null
          customer_rating?: number | null
          food_comment?: string | null
          food_rating?: number | null
          id?: string
          is_anonymous?: boolean | null
          order_id?: string | null
          runner_comment?: string | null
          runner_id?: string | null
          runner_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_reviews_runner_id_fkey"
            columns: ["runner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string | null
          id: string
          notes: string | null
          order_id: string | null
          status: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          status: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          collection_fee: number | null
          collection_pin: string | null
          created_at: string | null
          customer_id: string | null
          delivered_at: string | null
          delivery_address_id: string | null
          delivery_fee: number
          delivery_pin: string | null
          delivery_type: string | null
          estimated_delivery_time: string | null
          id: string
          merchant_id: string | null
          order_number: string
          payment_method: string | null
          payment_status: string | null
          priority_level: number | null
          runner_id: string | null
          special_instructions: string | null
          status: string | null
          subtotal: number
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          collection_fee?: number | null
          collection_pin?: string | null
          created_at?: string | null
          customer_id?: string | null
          delivered_at?: string | null
          delivery_address_id?: string | null
          delivery_fee: number
          delivery_pin?: string | null
          delivery_type?: string | null
          estimated_delivery_time?: string | null
          id?: string
          merchant_id?: string | null
          order_number: string
          payment_method?: string | null
          payment_status?: string | null
          priority_level?: number | null
          runner_id?: string | null
          special_instructions?: string | null
          status?: string | null
          subtotal: number
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          collection_fee?: number | null
          collection_pin?: string | null
          created_at?: string | null
          customer_id?: string | null
          delivered_at?: string | null
          delivery_address_id?: string | null
          delivery_fee?: number
          delivery_pin?: string | null
          delivery_type?: string | null
          estimated_delivery_time?: string | null
          id?: string
          merchant_id?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string | null
          priority_level?: number | null
          runner_id?: string | null
          special_instructions?: string | null
          status?: string | null
          subtotal?: number
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_delivery_address_id_fkey"
            columns: ["delivery_address_id"]
            isOneToOne: false
            referencedRelation: "customer_addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_runner_id_fkey"
            columns: ["runner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promotional_campaigns: {
        Row: {
          created_at: string | null
          description: string | null
          discount_amount: number
          end_date: string | null
          id: string
          is_active: boolean | null
          max_orders: number
          name: string
          start_date: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discount_amount: number
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          max_orders: number
          name: string
          start_date?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discount_amount?: number
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          max_orders?: number
          name?: string
          start_date?: string | null
        }
        Relationships: []
      }
      push_notification_preferences: {
        Row: {
          created_at: string
          delivery_alerts: boolean
          feedback_requests: boolean
          id: string
          order_updates: boolean
          promotions: boolean
          quiet_hours_enabled: boolean
          quiet_hours_end: string
          quiet_hours_start: string
          sound_enabled: boolean
          updated_at: string
          user_id: string
          vibration_enabled: boolean
        }
        Insert: {
          created_at?: string
          delivery_alerts?: boolean
          feedback_requests?: boolean
          id?: string
          order_updates?: boolean
          promotions?: boolean
          quiet_hours_enabled?: boolean
          quiet_hours_end?: string
          quiet_hours_start?: string
          sound_enabled?: boolean
          updated_at?: string
          user_id: string
          vibration_enabled?: boolean
        }
        Update: {
          created_at?: string
          delivery_alerts?: boolean
          feedback_requests?: boolean
          id?: string
          order_updates?: boolean
          promotions?: boolean
          quiet_hours_enabled?: boolean
          quiet_hours_end?: string
          quiet_hours_start?: string
          sound_enabled?: boolean
          updated_at?: string
          user_id?: string
          vibration_enabled?: boolean
        }
        Relationships: []
      }
      push_notification_tokens: {
        Row: {
          created_at: string
          id: string
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_notifications: {
        Row: {
          body: string
          created_at: string | null
          data: Json | null
          id: string
          read_at: string | null
          sent_at: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          data?: Json | null
          id?: string
          read_at?: string | null
          sent_at?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          data?: Json | null
          id?: string
          read_at?: string | null
          sent_at?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      runner_earnings: {
        Row: {
          base_fee: number
          bonus_amount: number | null
          created_at: string | null
          id: string
          order_id: string | null
          paid_at: string | null
          payout_reference: string | null
          payout_status: string | null
          runner_id: string | null
          tip_amount: number | null
          total_earned: number
        }
        Insert: {
          base_fee: number
          bonus_amount?: number | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          paid_at?: string | null
          payout_reference?: string | null
          payout_status?: string | null
          runner_id?: string | null
          tip_amount?: number | null
          total_earned: number
        }
        Update: {
          base_fee?: number
          bonus_amount?: number | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          paid_at?: string | null
          payout_reference?: string | null
          payout_status?: string | null
          runner_id?: string | null
          tip_amount?: number | null
          total_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "runner_earnings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runner_earnings_runner_id_fkey"
            columns: ["runner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      runner_profiles: {
        Row: {
          application_status: string | null
          banking_details: Json | null
          created_at: string | null
          id: string
          rating: number | null
          registration_proof_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          student_id_url: string | null
          total_deliveries: number | null
          total_earnings: number | null
          user_id: string | null
        }
        Insert: {
          application_status?: string | null
          banking_details?: Json | null
          created_at?: string | null
          id?: string
          rating?: number | null
          registration_proof_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          student_id_url?: string | null
          total_deliveries?: number | null
          total_earnings?: number | null
          user_id?: string | null
        }
        Update: {
          application_status?: string | null
          banking_details?: Json | null
          created_at?: string | null
          id?: string
          rating?: number | null
          registration_proof_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          student_id_url?: string | null
          total_deliveries?: number | null
          total_earnings?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "runner_profiles_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runner_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      system_logs: {
        Row: {
          context: Json | null
          created_at: string | null
          id: string
          ip_address: unknown | null
          level: string
          message: string
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          level: string
          message: string
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          level?: string
          message?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string | null
          currency: string | null
          gateway_response: Json | null
          id: string
          order_id: string | null
          payment_method: string
          status: string
          transaction_reference: string | null
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          gateway_response?: Json | null
          id?: string
          order_id?: string | null
          payment_method: string
          status: string
          transaction_reference?: string | null
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          gateway_response?: Json | null
          id?: string
          order_id?: string | null
          payment_method?: string
          status?: string
          transaction_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string
          id: string
          menu_item_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          menu_item_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          menu_item_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_menu_item"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          first_order_discount_used: boolean | null
          free_delivery_used: boolean | null
          full_name: string
          id: string
          phone_number: string | null
          promotional_discounts_used: number | null
          role: string
          student_number: string | null
          updated_at: string | null
          verification_status: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_order_discount_used?: boolean | null
          free_delivery_used?: boolean | null
          full_name: string
          id?: string
          phone_number?: string | null
          promotional_discounts_used?: number | null
          role: string
          student_number?: string | null
          updated_at?: string | null
          verification_status?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_order_discount_used?: boolean | null
          free_delivery_used?: boolean | null
          full_name?: string
          id?: string
          phone_number?: string | null
          promotional_discounts_used?: number | null
          role?: string
          student_number?: string | null
          updated_at?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          transaction_type: string
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          transaction_type: string
          user_id: string
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          transaction_type?: string
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_order_as_runner: {
        Args: { order_id: string; runner_user_id: string }
        Returns: boolean
      }
      add_wallet_credits: {
        Args: {
          p_amount: number
          p_description?: string
          p_reference_id?: string
          p_reference_type?: string
          p_user_id: string
        }
        Returns: boolean
      }
      assign_user_role: {
        Args: { new_role: string; target_user_id: string }
        Returns: boolean
      }
      cancel_unaccepted_orders: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      deduct_wallet_credits: {
        Args: {
          p_amount: number
          p_description?: string
          p_reference_id?: string
          p_reference_type?: string
          p_user_id: string
        }
        Returns: boolean
      }
      generate_delivery_pin: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_admin_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_auth_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_merchant_admin_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          account_name: string
          account_number: string
          bank_code: string
          bank_name: string
          bank_verification_status: string
          contact_email: string
          contact_phone: string
          created_at: string
          delivery_fee: number
          description: string
          id: string
          image_url: string
          is_active: boolean
          location: string
          minimum_order: number
          name: string
          opening_hours: Json
          paystack_subaccount_code: string
          preparation_time_minutes: number
          updated_at: string
        }[]
      }
      get_or_create_wallet: {
        Args: { p_user_id: string }
        Returns: string
      }
      get_public_merchant_info: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          delivery_fee: number
          description: string
          id: string
          image_url: string
          is_active: boolean
          location: string
          minimum_order: number
          name: string
          opening_hours: Json
          preparation_time_minutes: number
          updated_at: string
        }[]
      }
      get_public_merchants: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          delivery_fee: number
          description: string
          id: string
          image_url: string
          is_active: boolean
          location: string
          minimum_order: number
          name: string
          opening_hours: Json
          preparation_time_minutes: number
          updated_at: string
        }[]
      }
      get_safe_merchant_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          delivery_fee: number
          description: string
          id: string
          image_url: string
          is_active: boolean
          location: string
          minimum_order: number
          name: string
          opening_hours: Json
          preparation_time_minutes: number
          updated_at: string
        }[]
      }
      get_user_profile: {
        Args: { user_id: string }
        Returns: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone_number: string
          role: string
          student_number: string
          updated_at: string
          verification_status: string
        }[]
      }
      increment_promotional_discounts: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_eligible_for_promotional_discount: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_first_order: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_first_order_with_discount: {
        Args: { user_id: string }
        Returns: boolean
      }
      log_security_event: {
        Args: { details?: Json; event_type: string }
        Returns: undefined
      }
      refund_wallet_credits: {
        Args: {
          p_amount: number
          p_description?: string
          p_reference_id?: string
          p_user_id: string
        }
        Returns: boolean
      }
      send_promotional_notifications: {
        Args: {
          campaign_message: string
          campaign_title: string
          target_role?: string
        }
        Returns: number
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
