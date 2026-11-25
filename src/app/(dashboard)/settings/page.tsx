"use client";

import { useState } from "react";
import { Save, Database, Brain, Bell, Shield, Palette, RefreshCw, FileText, Check, AlertCircle, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { cn } from "@/lib/utils";

const sections = [
  { id: "general", label: "Général", icon: Palette },
  { id: "update", label: "Mise à jour", icon: RefreshCw },
  { id: "database", label: "Base de données", icon: Database },
  { id: "ai", label: "Analyse IA", icon: Brain },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Sécurité", icon: Shield },
] as const;
type SectionId = (typeof sections)[number]["id"];

interface IngestResult {
  status: string;
  fetched?: number;
  articles_inserted?: number;
  articles_skipped?: number;
  deals_detected?: number;
  deals_inserted?: number;
  deals_updated?: number;
  deal_details?: string[];
  message?: string;
}

interface BriefingResult {
  status: string;
  briefingId?: string;
  title?: string;
  articleCount?: number;
  dealCount?: number;
  highlightCount?: number;
  error?: string;
  message?: string;
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>("general");

  // Ingest state
  const [ingesting, setIngesting] = useState(false);
  const [ingestResult, setIngestResult] = useState<IngestResult | null>(null);
  const [ingestError, setIngestError] = useState<string | null>(null);

  // Briefing state
  const [generatingBriefing, setGeneratingBriefing] = useState(false);
  const [briefingResult, setBriefingResult] = useState<BriefingResult | null>(null);
  const [briefingError, setBriefingError] = useState<string | null>(null);

  async function handleIngest() {
    setIngesting(true);
    setIngestResult(null);
    setIngestError(null);
    try {
      const res = await fetch("/api/ingest", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setIngestResult(data);
      } else {
        setIngestError(data.message || "Erreur lors de l'ingestion");
      }
    } catch (err) {
      setIngestError(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setIngesting(false);
    }
  }

  async function handleGenerateBriefing(type: "daily" | "weekly") {
    setGeneratingBriefing(true);
    setBriefingResult(null);
    setBriefingError(null);
    try {
      const res = await fetch("/api/generate-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (res.ok) {
        setBriefingResult(data);
      } else {
        setBriefingError(data.error || "Erreur lors de la génération");
      }
    } catch (err) {
      setBriefingError(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setGeneratingBriefing(false);
    }
  }

  return (
    <div className="max-w-[1280px] mx-auto space-y-6">
      <PageHeader
        title="Paramètres"
        description="Configurez votre instance BDGS Client Radar"
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
                <h3 className="text-sm font-semibold mb-4">Préférences d&apos;affichage</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Vue par défaut</label>
                    <select className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                      <option>Vue d&apos;ensemble</option>
                      <option>Actualités</option>
                      <option>Deals</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Format de date</label>
                    <select className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                      <option>JJ/MM/AAAA (français)</option>
                      <option>MM/JJ/AAAA (US)</option>
                      <option>AAAA-MM-JJ (ISO)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Éléments par page</label>
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

          {activeSection === "update" && (
            <div className="space-y-6">
              {/* Manual ingestion */}
              <div className="rounded-lg border border-border p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold">Ingestion des flux RSS</h3>
                    <p className="text-xs text-foreground-muted mt-1">
                      Lancer manuellement l&apos;ingestion des 17 flux RSS configurés.
                      L&apos;ingestion automatique a lieu chaque jour à 8h (heure de Paris).
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleIngest}
                  disabled={ingesting}
                  className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {ingesting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  {ingesting ? "Ingestion en cours…" : "Lancer l'ingestion"}
                </button>

                {/* Ingest result */}
                {ingestResult && (
                  <div className="mt-4 rounded-md border border-success/30 bg-success/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="h-4 w-4 text-success" />
                      <span className="text-sm font-medium text-success">Ingestion terminée</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-foreground-muted">
                      <div>Articles récupérés : <span className="font-medium text-foreground">{ingestResult.fetched ?? 0}</span></div>
                      <div>Articles insérés : <span className="font-medium text-foreground">{ingestResult.articles_inserted ?? 0}</span></div>
                      <div>Deals détectés : <span className="font-medium text-foreground">{ingestResult.deals_detected ?? 0}</span></div>
                      <div>Deals insérés : <span className="font-medium text-foreground">{ingestResult.deals_inserted ?? 0}</span></div>
                      {(ingestResult.deals_updated ?? 0) > 0 && (
                        <div>Deals mis à jour : <span className="font-medium text-foreground">{ingestResult.deals_updated}</span></div>
                      )}
                    </div>
                    {ingestResult.deal_details && ingestResult.deal_details.length > 0 && (
                      <details className="mt-3">
                        <summary className="text-xs text-foreground-muted cursor-pointer hover:text-foreground">
                          Détails ({ingestResult.deal_details.length} opérations)
                        </summary>
                        <ul className="mt-2 space-y-1 text-xs text-foreground-muted max-h-40 overflow-y-auto">
                          {ingestResult.deal_details.map((d, i) => (
                            <li key={i} className="pl-2 border-l-2 border-border">{d}</li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                )}

                {ingestError && (
                  <div className="mt-4 rounded-md border border-danger/30 bg-danger/5 p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-danger" />
                      <span className="text-sm text-danger">{ingestError}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Briefing generation */}
              <div className="rounded-lg border border-border p-5">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold">Génération de briefing</h3>
                  <p className="text-xs text-foreground-muted mt-1">
                    Générer un briefing synthétisant les articles et deals récents.
                    Le briefing sera visible dans l&apos;onglet Briefings.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleGenerateBriefing("daily")}
                    disabled={generatingBriefing}
                    className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generatingBriefing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    Briefing quotidien
                  </button>
                  <button
                    onClick={() => handleGenerateBriefing("weekly")}
                    disabled={generatingBriefing}
                    className="flex items-center gap-2 rounded-md border border-primary text-primary px-4 py-2 text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generatingBriefing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    Briefing hebdomadaire
                  </button>
                </div>

                {/* Briefing result */}
                {briefingResult && briefingResult.status === "ok" && (
                  <div className="mt-4 rounded-md border border-success/30 bg-success/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="h-4 w-4 text-success" />
                      <span className="text-sm font-medium text-success">Briefing généré</span>
                    </div>
                    <p className="text-xs text-foreground-muted">
                      <strong>{briefingResult.title}</strong>
                    </p>
                    <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-foreground-muted">
                      <div>Articles : <span className="font-medium text-foreground">{briefingResult.articleCount}</span></div>
                      <div>Deals : <span className="font-medium text-foreground">{briefingResult.dealCount}</span></div>
                      <div>Points clés : <span className="font-medium text-foreground">{briefingResult.highlightCount}</span></div>
                    </div>
                    <a
                      href="/briefings"
                      className="inline-block mt-3 text-xs text-primary hover:underline"
                    >
                      Voir dans les briefings →
                    </a>
                  </div>
                )}

                {briefingResult && briefingResult.status === "empty" && (
                  <div className="mt-4 rounded-md border border-warning/30 bg-warning/5 p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-warning" />
                      <span className="text-sm text-warning">{briefingResult.message}</span>
                    </div>
                    <p className="text-xs text-foreground-muted mt-1">
                      Lancez d&apos;abord une ingestion pour récupérer des articles récents.
                    </p>
                  </div>
                )}

                {briefingError && (
                  <div className="mt-4 rounded-md border border-danger/30 bg-danger/5 p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-danger" />
                      <span className="text-sm text-danger">{briefingError}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Cron status */}
              <div className="rounded-lg border border-border p-5">
                <h3 className="text-sm font-semibold mb-2">Planification automatique</h3>
                <div className="space-y-2 text-xs text-foreground-muted">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-success" />
                    <span>Ingestion RSS : chaque jour à 8h00 (heure de Paris) via Vercel Cron</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-success" />
                    <span>Détection de deals : automatique après chaque ingestion</span>
                  </div>
                  <p className="mt-2 text-foreground-muted/60">
                    Les briefings peuvent être générés manuellement ci-dessus.
                    La génération automatique pourra être activée ultérieurement.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === "database" && (
            <div className="space-y-6">
              <div className="rounded-lg border border-border p-5">
                <h3 className="text-sm font-semibold mb-2">Connexion Supabase</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-xs text-success font-medium">Connecté</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">URL Supabase</label>
                    <input
                      type="text"
                      value="https://dicufyqrnohsghmeyjxt.supabase.co"
                      className="mt-1 block w-full rounded-md border border-border bg-background-subtle px-3 py-2 text-sm text-foreground-muted"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Service Role Key</label>
                    <input
                      type="password"
                      value="••••••••••••••••••••"
                      className="mt-1 block w-full rounded-md border border-border bg-background-subtle px-3 py-2 text-sm"
                      disabled
                    />
                    <p className="mt-1 text-xs text-foreground-muted">Les clés secrètes sont stockées dans les variables d&apos;environnement côté serveur.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "ai" && (
            <div className="space-y-6">
              <div className="rounded-lg border border-border p-5">
                <h3 className="text-sm font-semibold mb-2">Moteur de détection</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-xs text-success font-medium">Actif — moteur à règles (sans API payante)</span>
                </div>
                <p className="text-xs text-foreground-muted">
                  La détection de deals utilise un système de pattern-matching sur les titres et résumés d&apos;articles RSS.
                  11 types de deals sont reconnus : M&A, LBO, refinancement, émission obligataire, crédit syndiqué,
                  placement privé, project finance, augmentation de capital, cession d&apos;actifs, joint-venture, investissement infrastructure.
                </p>
              </div>

              <div className="rounded-lg border border-border p-5">
                <h3 className="text-sm font-semibold mb-2">Méthodologie de scoring</h3>
                <p className="text-sm text-foreground-muted">
                  Le système de scoring dual utilise deux scores indépendants (0–100) :
                </p>
                <ul className="mt-2 space-y-2 text-sm text-foreground-muted">
                  <li><strong>Score de pertinence :</strong> Pertinence d&apos;un article par rapport aux sociétés et secteurs suivis.</li>
                  <li><strong>Score d&apos;opportunité BDGS :</strong> Besoin de financement (0–30), Probabilité de transaction (0–25), Taille du deal (0–20), Pertinence pratique (0–15), Actionnabilité (0–10).</li>
                </ul>
                <p className="mt-2 text-xs text-foreground-muted italic">
                  Les scores sont indicatifs. Ils ne doivent pas être considérés comme des certitudes.
                  Les utilisateurs peuvent les modifier manuellement.
                </p>
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="rounded-lg border border-border p-5">
              <h3 className="text-sm font-semibold mb-4">Préférences de notification</h3>
              <div className="space-y-4">
                {[
                  { label: "Actualités haute pertinence", desc: "Articles avec un score de pertinence ≥ 75" },
                  { label: "Nouvelles opportunités détectées", desc: "Signaux de financement détectés automatiquement" },
                  { label: "Changement de statut d'un deal", desc: "Quand un deal suivi est mis à jour" },
                  { label: "Briefing quotidien prêt", desc: "Synthèse matinale disponible" },
                  { label: "Briefing hebdomadaire prêt", desc: "Revue hebdomadaire du marché" },
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
                <h3 className="text-sm font-semibold mb-2">Sources de données</h3>
                <p className="text-sm text-foreground-muted">
                  BDGS Client Radar surveille uniquement des informations publiquement accessibles.
                  Aucune information confidentielle, privilégiée ou non publique n&apos;est utilisée.
                  Toutes les sources sont traçables vers leurs articles d&apos;origine.
                </p>
              </div>
              <div className="rounded-lg border border-border p-5">
                <h3 className="text-sm font-semibold mb-2">Clés API</h3>
                <p className="text-sm text-foreground-muted">
                  Toutes les clés API et secrets sont stockés dans les variables d&apos;environnement côté serveur (.env.local).
                  Ils ne sont jamais exposés dans le code frontend ni commités dans le contrôle de version.
                </p>
              </div>
              <div className="rounded-lg border border-border p-5">
                <h3 className="text-sm font-semibold mb-2">Règles de sécurité IA</h3>
                <ul className="text-sm text-foreground-muted space-y-1">
                  <li>• L&apos;IA ne doit jamais inventer de faits, montants ou transactions</li>
                  <li>• L&apos;IA ne doit jamais inventer ou supposer l&apos;implication de conseillers</li>
                  <li>• L&apos;IA ne doit jamais déduire que BDGS est impliqué dans un deal</li>
                  <li>• L&apos;IA ne doit pas confondre opportunités potentielles et transactions confirmées</li>
                  <li>• Chaque assertion doit être traçable à l&apos;article source</li>
                  <li>• Les informations manquantes doivent utiliser « null » ou « non communiqué »</li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === "general" && (
            <div className="flex justify-end">
              <button className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
                <Save className="h-4 w-4" /> Enregistrer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
