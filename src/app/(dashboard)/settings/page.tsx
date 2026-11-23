"use client";

import { useState } from "react";
import { Save, Database, Brain, Bell, Shield, Palette } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { cn } from "@/lib/utils";

const sections = [
  { id: "general", label: "General", icon: Palette },
  { id: "database", label: "Database", icon: Database },
  { id: "ai", label: "AI Analysis", icon: Brain },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
] as const;
type SectionId = (typeof sections)[number]["id"];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>("general");

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">
      <PageHeader
        title="Settings"
        description="Configure your BDGS Client Radar instance"
      />

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar nav */}
        <nav className="space-y-1">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  activeSection === section.id
                    ? "bg-primary text-white"
                    : "text-foreground-muted hover:bg-background-subtle hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {section.label}
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeSection === "general" && (
            <div className="space-y-6">
              <div className="rounded-lg border border-border p-5">
                <h3 className="text-sm font-semibold mb-4">Display Preferences</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Default dashboard view</label>
                    <select className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                      <option>Overview</option>
                      <option>News Feed</option>
                      <option>Deals</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date format</label>
                    <select className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                      <option>DD/MM/YYYY (French)</option>
                      <option>MM/DD/YYYY (US)</option>
                      <option>YYYY-MM-DD (ISO)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Items per page</label>
                    <select className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                      <option>25</option>
                      <option>50</option>
                      <option>100</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "database" && (
            <div className="space-y-6">
              <div className="rounded-lg border border-border p-5">
                <h3 className="text-sm font-semibold mb-2">Supabase Connection</h3>
                <p className="text-xs text-foreground-muted mb-4">
                  Database connection is not yet configured. This will be set up when the database layer is implemented.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Supabase URL</label>
                    <input
                      type="text"
                      placeholder="https://your-project.supabase.co"
                      className="mt-1 block w-full rounded-md border border-border bg-background-subtle px-3 py-2 text-sm placeholder:text-foreground-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Anon Key</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      className="mt-1 block w-full rounded-md border border-border bg-background-subtle px-3 py-2 text-sm placeholder:text-foreground-muted"
                      disabled
                    />
                    <p className="mt-1 text-xs text-foreground-muted">Secret keys are stored in environment variables, never in frontend code.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "ai" && (
            <div className="space-y-6">
              <div className="rounded-lg border border-border p-5">
                <h3 className="text-sm font-semibold mb-2">AI Provider Configuration</h3>
                <p className="text-xs text-foreground-muted mb-4">
                  AI-powered analysis is not yet enabled. The provider, cost implications, and security considerations
                  will be explained before enabling live processing.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Provider</label>
                    <select className="mt-1 block w-full rounded-md border border-border bg-background-subtle px-3 py-2 text-sm" disabled>
                      <option>Not configured</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Model</label>
                    <input type="text" placeholder="To be configured" className="mt-1 block w-full rounded-md border border-border bg-background-subtle px-3 py-2 text-sm" disabled />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border p-5">
                <h3 className="text-sm font-semibold mb-2">Scoring Methodology</h3>
                <p className="text-sm text-foreground-muted">
                  The dual scoring system uses two independent scores (0–100):
                </p>
                <ul className="mt-2 space-y-2 text-sm text-foreground-muted">
                  <li><strong>News Relevance Score:</strong> How relevant a news article is to monitored companies and sectors.</li>
                  <li><strong>BDGS Finance Opportunity Score:</strong> Composed of Financing Need (0–30), Transaction Likelihood (0–25), Deal Size (0–20), Relevance to Expertise (0–15), and Actionability (0–10).</li>
                </ul>
                <p className="mt-2 text-xs text-foreground-muted italic">
                  Scores are indicative and AI-generated. They should not be treated as certainties.
                  Users can override scores manually.
                </p>
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="rounded-lg border border-border p-5">
              <h3 className="text-sm font-semibold mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { label: "New high-relevance news", desc: "Articles with relevance score ≥ 75" },
                  { label: "New opportunities detected", desc: "AI-detected financing signals" },
                  { label: "Deal status changes", desc: "When tracked deals update" },
                  { label: "Daily briefing ready", desc: "Morning intelligence summary" },
                  { label: "Weekly briefing ready", desc: "Weekly market overview" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-foreground-muted">{item.desc}</p>
                    </div>
                    <button className="relative h-6 w-11 rounded-full bg-primary transition-colors">
                      <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white translate-x-5 transition-transform" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "security" && (
            <div className="space-y-6">
              <div className="rounded-lg border border-border p-5">
                <h3 className="text-sm font-semibold mb-2">Data Sources</h3>
                <p className="text-sm text-foreground-muted">
                  BDGS Client Radar monitors only publicly available information. No confidential, privileged, or non-public
                  client information is used. All data sources are traceable to their original public articles.
                </p>
              </div>
              <div className="rounded-lg border border-border p-5">
                <h3 className="text-sm font-semibold mb-2">API Keys</h3>
                <p className="text-sm text-foreground-muted">
                  All API keys and secrets are stored in server-side environment variables (.env.local).
                  They are never exposed in frontend code or committed to version control.
                </p>
              </div>
              <div className="rounded-lg border border-border p-5">
                <h3 className="text-sm font-semibold mb-2">AI Safety Rules</h3>
                <ul className="text-sm text-foreground-muted space-y-1">
                  <li>• The AI must never invent facts, amounts, or transactions</li>
                  <li>• The AI must never invent or assume adviser involvement</li>
                  <li>• The AI must never infer that BDGS is involved in a deal</li>
                  <li>• The AI must not confuse potential opportunities with confirmed transactions</li>
                  <li>• Every assertion must be traceable to the source article</li>
                  <li>• Missing information must use &quot;null&quot; or &quot;not disclosed&quot;</li>
                </ul>
              </div>
            </div>
          )}

          {/* Save button */}
          <div className="flex justify-end">
            <button className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
              <Save className="h-4 w-4" /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
