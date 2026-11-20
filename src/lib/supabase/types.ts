/**
 * Supabase Database type definitions
 * ===================================
 * Generated from supabase/migrations/001_initial_schema.sql
 * Keep in sync when the schema changes.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          sector: string;
          country: string;
          website: string | null;
          description: string | null;
          is_public: boolean;
          ticker: string | null;
          exchange: string | null;
          deal_count: number;
          latest_news_date: string | null;
          watchlisted: boolean;
          monitoring_status: "active" | "paused" | "archived";
          priority: "high" | "medium" | "low";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          sector: string;
          country?: string;
          website?: string | null;
          description?: string | null;
          is_public?: boolean;
          ticker?: string | null;
          exchange?: string | null;
          deal_count?: number;
          latest_news_date?: string | null;
          watchlisted?: boolean;
          monitoring_status?: "active" | "paused" | "archived";
          priority?: "high" | "medium" | "low";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["companies"]["Insert"]>;
      };

      news_articles: {
        Row: {
          id: string;
          headline: string;
          source: string;
          source_url: string;
          published_at: string;
          category:
            | "M&A"
            | "Financing"
            | "Regulatory"
            | "Earnings"
            | "Management"
            | "Restructuring"
            | "IPO"
            | "Infrastructure"
            | "Credit"
            | "Other";
          summary: string | null;
          full_text: string | null;
          relevance_score: number | null;
          opportunity_score: number | null;
          relevance_breakdown: Json | null;
          opportunity_breakdown: Json | null;
          scoring_version: string;
          relevance_override: number | null;
          opportunity_override: number | null;
          override_reason: string | null;
          flagged_incorrect: boolean;
          flag_reason: string | null;
          is_read: boolean;
          watchlisted: boolean;
          feed_source: string | null;
          external_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          headline: string;
          source: string;
          source_url: string;
          published_at: string;
          category?:
            | "M&A"
            | "Financing"
            | "Regulatory"
            | "Earnings"
            | "Management"
            | "Restructuring"
            | "IPO"
            | "Infrastructure"
            | "Credit"
            | "Other";
          summary?: string | null;
          full_text?: string | null;
          relevance_score?: number | null;
          opportunity_score?: number | null;
          relevance_breakdown?: Json | null;
          opportunity_breakdown?: Json | null;
          scoring_version?: string;
          relevance_override?: number | null;
          opportunity_override?: number | null;
          override_reason?: string | null;
          flagged_incorrect?: boolean;
          flag_reason?: string | null;
          is_read?: boolean;
          watchlisted?: boolean;
          feed_source?: string | null;
          external_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["news_articles"]["Insert"]>;
      };

      article_companies: {
        Row: {
          article_id: string;
          company_id: string;
        };
        Insert: {
          article_id: string;
          company_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["article_companies"]["Insert"]>;
      };

      deals: {
        Row: {
          id: string;
          name: string;
          company_id: string;
          deal_type:
            | "M&A"
            | "LBO"
            | "Refinancing"
            | "Corporate loan"
            | "Bond issuance"
            | "Private placement"
            | "Project finance"
            | "Infrastructure investment"
            | "Asset disposal"
            | "Capital increase"
            | "Joint venture";
          counterparty: string | null;
          amount: number | null;
          currency: string;
          status: "rumoured" | "announced" | "in_progress" | "closed" | "cancelled";
          announcement_date: string;
          closing_date: string | null;
          summary: string | null;
          source: string;
          source_url: string | null;
          buyers: string[];
          sellers: string[];
          advisors: string[];
          last_updated: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          company_id: string;
          deal_type:
            | "M&A"
            | "LBO"
            | "Refinancing"
            | "Corporate loan"
            | "Bond issuance"
            | "Private placement"
            | "Project finance"
            | "Infrastructure investment"
            | "Asset disposal"
            | "Capital increase"
            | "Joint venture";
          counterparty?: string | null;
          amount?: number | null;
          currency?: string;
          status?: "rumoured" | "announced" | "in_progress" | "closed" | "cancelled";
          announcement_date: string;
          closing_date?: string | null;
          summary?: string | null;
          source: string;
          source_url?: string | null;
          buyers?: string[];
          sellers?: string[];
          advisors?: string[];
          last_updated?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["deals"]["Insert"]>;
      };

      opportunities: {
        Row: {
          id: string;
          company_id: string;
          headline: string;
          hypothesis: string;
          signal_type: string;
          source_article_id: string | null;
          confidence: "high" | "medium" | "low";
          status: "new" | "under_review" | "qualified" | "dismissed";
          opportunity_score: number | null;
          practice_areas: string[];
          detected_at: string;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          headline: string;
          hypothesis: string;
          signal_type: string;
          source_article_id?: string | null;
          confidence?: "high" | "medium" | "low";
          status?: "new" | "under_review" | "qualified" | "dismissed";
          opportunity_score?: number | null;
          practice_areas?: string[];
          detected_at?: string;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["opportunities"]["Insert"]>;
      };

      briefings: {
        Row: {
          id: string;
          title: string;
          type: "daily" | "weekly" | "custom";
          summary: string;
          highlights: string[];
          article_ids: string[];
          article_count: number;
          generated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          type?: "daily" | "weekly" | "custom";
          summary: string;
          highlights?: string[];
          article_ids?: string[];
          article_count?: number;
          generated_at?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["briefings"]["Insert"]>;
      };

      watchlist_items: {
        Row: {
          id: string;
          entity_type: "company" | "deal" | "news" | "opportunity";
          entity_id: string;
          company_id: string | null;
          label: string;
          reason: string | null;
          added_at: string;
        };
        Insert: {
          id?: string;
          entity_type: "company" | "deal" | "news" | "opportunity";
          entity_id: string;
          company_id?: string | null;
          label: string;
          reason?: string | null;
          added_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["watchlist_items"]["Insert"]>;
      };

      scoring_methodology: {
        Row: {
          version: string;
          description: string;
          weights: Json;
          active: boolean;
          created_at: string;
        };
        Insert: {
          version: string;
          description: string;
          weights: Json;
          active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["scoring_methodology"]["Insert"]>;
      };
    };
  };
}
