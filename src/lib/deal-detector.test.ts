/**
 * Deal Detector Tests
 * ===================
 * Tests the deal detection engine against 25+ varied examples
 * to ensure it correctly identifies deal types, extracts amounts,
 * and respects project constraints (no fabrication).
 */

import { detectDeals } from "./deal-detector";

// Mock companies (subset of real BDGS radar companies)
const COMPANIES = [
  { id: "c1", name: "TotalEnergies" },
  { id: "c2", name: "Carrefour" },
  { id: "c3", name: "Bouygues" },
  { id: "c4", name: "EDF" },
  { id: "c5", name: "Veolia" },
  { id: "c6", name: "Engie" },
  { id: "c7", name: "Orange" },
  { id: "c8", name: "Renault" },
  { id: "c9", name: "Société Générale" },
  { id: "c10", name: "LVMH" },
  { id: "c11", name: "Groupe ADP" },
  { id: "c12", name: "Vinci" },
  { id: "c13", name: "Sanofi" },
];

function article(headline: string, summary: string = "") {
  return {
    headline,
    summary,
    sourceUrl: "https://example.com/article",
    source: "Test Source",
    publishedAt: "2026-11-25T10:00:00Z",
  };
}

describe("Deal Detector", () => {
  // ── LBO Detection ──────────────────────────────────────────────────

  test("detects LBO with explicit keyword", () => {
    const deals = detectDeals(
      [article("LBO de Carrefour : le groupe cible d'une offre à 2,5 milliards d'euros")],
      COMPANIES,
    );
    expect(deals).toHaveLength(1);
    expect(deals[0].dealType).toBe("LBO");
    expect(deals[0].companyName).toBe("Carrefour");
    expect(deals[0].amount).toBe(2500); // 2.5 milliards = 2500M
    expect(deals[0].currency).toBe("EUR");
  });

  test("detects management buyout", () => {
    const deals = detectDeals(
      [article("Management buyout chez Bouygues Telecom : les cadres rachètent une filiale")],
      COMPANIES,
    );
    expect(deals).toHaveLength(1);
    expect(deals[0].dealType).toBe("LBO");
  });

  // ── Bond Issuance Detection ────────────────────────────────────────

  test("detects bond issuance in French", () => {
    const deals = detectDeals(
      [article("TotalEnergies réalise une émission obligataire de 750 millions d'euros")],
      COMPANIES,
    );
    expect(deals).toHaveLength(1);
    expect(deals[0].dealType).toBe("Bond issuance");
    expect(deals[0].amount).toBe(750);
  });

  test("detects green bond", () => {
    const deals = detectDeals(
      [article("EDF émet une obligation verte de 1,5 milliard d'euros pour financer la transition")],
      COMPANIES,
    );
    expect(deals).toHaveLength(1);
    expect(deals[0].dealType).toBe("Bond issuance");
    expect(deals[0].amount).toBe(1500);
  });

  // ── Refinancing Detection ──────────────────────────────────────────

  test("detects refinancing", () => {
    const deals = detectDeals(
      [article("Veolia boucle le refinancement de sa dette pour 3 milliards d'euros")],
      COMPANIES,
    );
    expect(deals).toHaveLength(1);
    expect(deals[0].dealType).toBe("Refinancing");
    expect(deals[0].amount).toBe(3000);
  });

  test("detects maturity extension", () => {
    const deals = detectDeals(
      [article("Engie obtient une extension de maturité de ses crédits syndiqués")],
      COMPANIES,
    );
    expect(deals).toHaveLength(1);
    expect(deals[0].dealType).toBe("Refinancing");
  });

  // ── Corporate Loan Detection ───────────────────────────────────────

  test("detects syndicated loan", () => {
    const deals = detectDeals(
      [article("Orange signe un crédit syndiqué de 500 millions d'euros avec 12 banques")],
      COMPANIES,
    );
    expect(deals).toHaveLength(1);
    expect(deals[0].dealType).toBe("Corporate loan");
    expect(deals[0].amount).toBe(500);
  });

  test("detects revolving credit facility", () => {
    const deals = detectDeals(
      [article("Renault renouvelle sa ligne de crédit revolving de 1,8 milliard d'euros")],
      COMPANIES,
    );
    expect(deals).toHaveLength(1);
    expect(deals[0].dealType).toBe("Corporate loan");
  });

  test("detects unitranche / direct lending", () => {
    const deals = detectDeals(
      [article("Bouygues obtient un financement unitranche de 200 millions d'euros")],
      COMPANIES,
    );
    expect(deals).toHaveLength(1);
    expect(deals[0].dealType).toBe("Corporate loan");
    expect(deals[0].amount).toBe(200);
  });

  // ── M&A Detection ──────────────────────────────────────────────────

  test("detects acquisition", () => {
    const deals = detectDeals(
      [article("LVMH acquiert la maison de luxe italienne Valentino pour $1.7 billion")],
      COMPANIES,
    );
    expect(deals).toHaveLength(1);
    expect(deals[0].dealType).toBe("M&A");
    expect(deals[0].amount).toBe(1700);
    expect(deals[0].currency).toBe("USD");
  });

  test("detects OPA (takeover bid)", () => {
    const deals = detectDeals(
      [article("Sanofi lance une offre publique d'achat sur un laboratoire américain")],
      COMPANIES,
    );
    expect(deals).toHaveLength(1);
    expect(deals[0].dealType).toBe("M&A");
  });

  test("detects merger/fusion", () => {
    const deals = detectDeals(
      [article("Veolia et Suez annoncent leur fusion définitive")],
      COMPANIES,
    );
    expect(deals).toHaveLength(1);
    expect(deals[0].dealType).toBe("M&A");
  });

  // ── Project Finance Detection ──────────────────────────────────────

  test("detects project finance", () => {
    const deals = detectDeals(
      [article("EDF met en place un financement de projet de 4 milliards d'euros pour Hinkley Point")],
      COMPANIES,
    );
    expect(deals).toHaveLength(1);
    expect(deals[0].dealType).toBe("Project finance");
    expect(deals[0].amount).toBe(4000);
  });

  // ── Capital Increase ───────────────────────────────────────────────

  test("detects augmentation de capital", () => {
    const deals = detectDeals(
      [article("Renault procède à une augmentation de capital de 600 millions d'euros")],
      COMPANIES,
    );
    expect(deals).toHaveLength(1);
    expect(deals[0].dealType).toBe("Capital increase");
    expect(deals[0].amount).toBe(600);
  });

  // ── Asset Disposal ─────────────────────────────────────────────────

  test("detects cession d'actifs", () => {
    const deals = detectDeals(
      [article("Engie finalise la cession d'actifs dans le charbon en Australie")],
      COMPANIES,
    );
    expect(deals).toHaveLength(1);
    expect(deals[0].dealType).toBe("Asset disposal");
  });

  // ── Private Placement ──────────────────────────────────────────────

  test("detects placement privé", () => {
    const deals = detectDeals(
      [article("Vinci réalise un placement privé de type Schuldschein de 300 millions d'euros")],
      COMPANIES,
    );
    expect(deals).toHaveLength(1);
    expect(deals[0].dealType).toBe("Private placement");
    expect(deals[0].amount).toBe(300);
  });

  // ── Joint Venture ──────────────────────────────────────────────────

  test("detects joint venture", () => {
    const deals = detectDeals(
      [article("TotalEnergies et Engie créent une co-entreprise dans l'hydrogène vert")],
      COMPANIES,
    );
    expect(deals.length).toBeGreaterThanOrEqual(1);
    expect(deals[0].dealType).toBe("Joint venture");
  });

  // ── Status Detection ───────────────────────────────────────────────

  test("detects closed/finalised status", () => {
    const deals = detectDeals(
      [article("Carrefour a finalisé l'acquisition de son concurrent brésilien")],
      COMPANIES,
    );
    expect(deals).toHaveLength(1);
    expect(deals[0].status).toBe("closed");
  });

  test("detects rumoured status", () => {
    const deals = detectDeals(
      [article("LVMH pourrait lancer un LBO sur un acteur du luxe italien")],
      COMPANIES,
    );
    expect(deals).toHaveLength(1);
    expect(deals[0].status).toBe("rumoured");
  });

  test("detects in_progress status", () => {
    const deals = detectDeals(
      [article("Orange en négociation exclusive pour l'acquisition d'un opérateur africain")],
      COMPANIES,
    );
    expect(deals).toHaveLength(1);
    expect(deals[0].status).toBe("in_progress");
  });

  // ── Constraint tests: No fabrication ───────────────────────────────

  test("extracts explicitly mentioned advisors but never invents them", () => {
    // When a known firm IS mentioned in advisory context → extract it
    const deals = detectDeals(
      [article("TotalEnergies réalise une émission obligataire de 500 millions d'euros, conseillé par Linklaters")],
      COMPANIES,
    );
    expect(deals).toHaveLength(1);
    expect(deals[0].advisors.length).toBeGreaterThanOrEqual(1);
    expect(deals[0].advisors.some((a: string) => a.includes("Linklaters"))).toBe(true);

    // When NO advisor is mentioned → empty list (never invent)
    const dealsNoAdvisor = detectDeals(
      [article("TotalEnergies réalise une émission obligataire de 500 millions d'euros")],
      COMPANIES,
    );
    expect(dealsNoAdvisor).toHaveLength(1);
    expect(dealsNoAdvisor[0].advisors).toEqual([]);
  });

  test("does not invent amounts when none stated", () => {
    const deals = detectDeals(
      [article("Bouygues acquiert une société de BTP en région parisienne")],
      COMPANIES,
    );
    expect(deals).toHaveLength(1);
    expect(deals[0].amount).toBeNull();
  });

  test("preserves source URL traceability", () => {
    const url = "https://lesechos.fr/article/12345";
    const deals = detectDeals(
      [{
        headline: "Carrefour boucle le refinancement de sa dette",
        summary: "",
        sourceUrl: url,
        source: "Les Échos",
        publishedAt: "2026-11-25T10:00:00Z",
      }],
      COMPANIES,
    );
    expect(deals).toHaveLength(1);
    expect(deals[0].sourceUrl).toBe(url);
    expect(deals[0].source).toBe("Les Échos");
  });

  // ── Edge cases ─────────────────────────────────────────────────────

  test("ignores articles about non-monitored companies", () => {
    const deals = detectDeals(
      [article("Apple acquiert une startup d'IA pour $3 billion")],
      COMPANIES,
    );
    expect(deals).toHaveLength(0);
  });

  test("ignores articles mentioning company but no deal signal", () => {
    const deals = detectDeals(
      [article("TotalEnergies publie ses résultats trimestriels en hausse de 15%")],
      COMPANIES,
    );
    expect(deals).toHaveLength(0);
  });

  test("handles Groupe ADP alias matching", () => {
    const deals = detectDeals(
      [article("ADP lance un financement de projet de 800 millions d'euros pour le terminal 4")],
      COMPANIES,
    );
    expect(deals).toHaveLength(1);
    expect(deals[0].companyName).toBe("Groupe ADP");
  });

  test("handles multiple companies in same article", () => {
    const deals = detectDeals(
      [article("TotalEnergies et Engie signent un crédit syndiqué conjoint de 2 milliards d'euros")],
      COMPANIES,
    );
    // Should create deal for first matched company
    expect(deals.length).toBeGreaterThanOrEqual(1);
  });

  // ── Amount extraction edge cases ───────────────────────────────────

  test("extracts EUR billions correctly", () => {
    const deals = detectDeals(
      [article("Société Générale émission obligataire de 1,2 milliards d'euros")],
      COMPANIES,
    );
    expect(deals).toHaveLength(1);
    expect(deals[0].amount).toBe(1200);
  });

  test("extracts USD billions correctly", () => {
    const deals = detectDeals(
      [article("TotalEnergies completes $4.5 billion bond issuance")],
      COMPANIES,
    );
    expect(deals).toHaveLength(1);
    expect(deals[0].amount).toBe(4500);
    expect(deals[0].currency).toBe("USD");
  });
});
