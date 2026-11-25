import { extractAdvisors, formatAdvisorForDisplay, LAW_FIRMS } from "./advisor-extractor";

describe("advisor-extractor", () => {
  // ─── French advisory patterns ──────────────────────────────────────────────

  it("extracts 'conseillé par [firm]'", () => {
    const result = extractAdvisors(
      "TotalEnergies finalise son acquisition",
      "TotalEnergies a été conseillé par Clifford Chance dans le cadre de cette opération.",
      "Les Échos",
      "https://lesechos.fr/article/123",
    );
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.some((a) => a.firmName === "Clifford Chance")).toBe(true);
  });

  it("extracts 'avec le concours de [firm]'", () => {
    const result = extractAdvisors(
      "Carrefour signe un refinancement",
      "Le groupe a réalisé l'opération avec le concours de Linklaters et Rothschild & Co.",
      "BFM Business",
      "https://bfm.fr/article/456",
    );
    expect(result.some((a) => a.firmName === "Linklaters")).toBe(true);
    expect(result.some((a) => a.firmName === "Rothschild & Co")).toBe(true);
  });

  it("extracts '[firm] a conseillé [company]'", () => {
    const result = extractAdvisors(
      "Gide a conseillé Engie dans son émission obligataire",
      "Le cabinet Gide Loyrette Nouel a accompagné Engie sur une émission obligataire de 500 millions d'euros.",
      "Capital.fr",
      "https://capital.fr/article/789",
    );
    expect(result.some((a) => a.firmName === "Gide Loyrette Nouel")).toBe(true);
  });

  it("extracts 'assisté par [firm]'", () => {
    const result = extractAdvisors(
      "Bouygues réussit son LBO",
      "L'emprunteur a été assisté par Latham & Watkins et le vendeur par Bredin Prat.",
      "Les Échos",
      "https://lesechos.fr/article/abc",
    );
    expect(result.some((a) => a.firmName === "Latham & Watkins")).toBe(true);
    expect(result.some((a) => a.firmName === "Bredin Prat")).toBe(true);
  });

  it("extracts 'accompagné par [firm]'", () => {
    const result = extractAdvisors(
      "Renault cède ses actifs",
      "L'entreprise a été accompagnée par Darrois Villey pour cette cession d'actifs.",
      "Le Figaro",
      "https://lefigaro.fr/article/def",
    );
    expect(result.some((a) => a.firmName === "Darrois Villey Maillot Brochier")).toBe(true);
  });

  // ─── English advisory patterns ─────────────────────────────────────────────

  it("extracts 'advised by [firm]'", () => {
    const result = extractAdvisors(
      "Sanofi completes $2bn bond issuance",
      "Sanofi was advised by Davis Polk & Wardwell on the transaction.",
      "Reuters",
      "https://reuters.com/article/sanofi",
    );
    expect(result.some((a) => a.firmName === "Davis Polk & Wardwell")).toBe(true);
  });

  it("extracts '[firm] advised [company]'", () => {
    const result = extractAdvisors(
      "White & Case advised Accor on €800m refinancing",
      "White & Case acted as legal counsel to Accor on its €800 million senior secured credit facility refinancing.",
      "Clifford Chance",
      "https://whitecase.com/news/accor",
    );
    expect(result.some((a) => a.firmName === "White & Case")).toBe(true);
  });

  it("extracts 'legal advisor: [firm]'", () => {
    const result = extractAdvisors(
      "EDF Project Finance Deal",
      "The project finance for the new nuclear plant was structured with legal advisor: Freshfields Bruckhaus Deringer.",
      "FT",
      "https://ft.com/article/edf",
    );
    expect(result.some((a) => a.firmName === "Freshfields Bruckhaus Deringer")).toBe(true);
  });

  // ─── Law firm website source detection ──────────────────────────────────────

  it("detects source firm from cliffordchance.com URL", () => {
    const result = extractAdvisors(
      "Clifford Chance advises TotalEnergies on major acquisition",
      "The firm advised TotalEnergies on the €3 billion acquisition of renewable assets.",
      "Clifford Chance",
      "https://www.cliffordchance.com/news/2026/totalenergies.html",
    );
    expect(result.some((a) => a.firmName === "Clifford Chance")).toBe(true);
    expect(result[0].role).toBe("legal_counsel");
  });

  it("detects source firm from gide.com URL", () => {
    const result = extractAdvisors(
      "Gide advises on Project Financing",
      "Our team advised the sponsor on the project financing.",
      "Gide",
      "https://www.gide.com/en/news/project-financing",
    );
    expect(result.some((a) => a.firmName === "Gide Loyrette Nouel")).toBe(true);
  });

  // ─── Co-occurrence detection ────────────────────────────────────────────────

  it("detects firm near advisory keywords via co-occurrence", () => {
    const result = extractAdvisors(
      "Orange finalise son LBO",
      "Orange a bouclé l'opération. Kirkland & Ellis représentait l'acquéreur dans cette transaction.",
      "Les Échos",
      "https://lesechos.fr/article/xyz",
    );
    expect(result.some((a) => a.firmName === "Kirkland & Ellis")).toBe(true);
  });

  // ─── Role classification ───────────────────────────────────────────────────

  it("classifies Big 4 as tax_advisor", () => {
    const result = extractAdvisors(
      "Alstom restructuring",
      "Alstom a été conseillé par EY Société d'Avocats sur les aspects fiscaux.",
      "Capital.fr",
      "https://capital.fr/article/alstom",
    );
    const ey = result.find((a) => a.firmName === "EY Société d'Avocats");
    expect(ey).toBeDefined();
    expect(ey!.role).toBe("tax_advisor");
  });

  it("classifies investment banks as financial_advisor", () => {
    const result = extractAdvisors(
      "Lazard conseille Vivendi",
      "Vivendi a été accompagnée par Lazard en tant que conseil financier.",
      "BFM Business",
      "https://bfm.fr/article/vivendi",
    );
    const lazard = result.find((a) => a.firmName === "Lazard");
    expect(lazard).toBeDefined();
    expect(lazard!.role).toBe("financial_advisor");
  });

  // ─── Side detection ────────────────────────────────────────────────────────

  it("detects buyer side", () => {
    const result = extractAdvisors(
      "LBO sur XYZ Corp",
      "L'acquéreur a été conseillé par Simpson Thacher dans le cadre du LBO.",
      "Les Échos",
      "https://lesechos.fr/article/lbo",
    );
    const st = result.find((a) => a.firmName === "Simpson Thacher & Bartlett");
    expect(st).toBeDefined();
    expect(st!.side).toBe("buyer");
  });

  it("detects lender side", () => {
    const result = extractAdvisors(
      "Syndicated loan for Airbus",
      "Les prêteurs ont été assistés par Milbank sur cette ligne de crédit syndiqué.",
      "Reuters",
      "https://reuters.com/article/airbus",
    );
    const milbank = result.find((a) => a.firmName === "Milbank");
    expect(milbank).toBeDefined();
    expect(milbank!.side).toBe("lender");
  });

  // ─── Edge cases ────────────────────────────────────────────────────────────

  it("does NOT extract firms mentioned in non-advisory context", () => {
    const result = extractAdvisors(
      "CMS recrute un associé",
      "CMS Francis Lefebvre a annoncé le recrutement d'un nouvel associé en droit social.",
      "Le Figaro",
      "https://lefigaro.fr/cms-recrutement",
    );
    // CMS appears but no advisory keyword nearby — should NOT be extracted
    expect(result.length).toBe(0);
  });

  it("does NOT invent advisors when none are mentioned", () => {
    const result = extractAdvisors(
      "Renault annonce une augmentation de capital de 500 millions d'euros",
      "Le constructeur automobile prévoit de lever des fonds pour financer sa transition électrique.",
      "BFM Business",
      "https://bfm.fr/renault",
    );
    expect(result.length).toBe(0);
  });

  it("handles multiple advisors in one sentence", () => {
    const result = extractAdvisors(
      "BNP Paribas acquisition",
      "L'opération a été conseillée par Cleary Gottlieb côté acquéreur et Allen & Overy côté vendeur.",
      "Capital.fr",
      "https://capital.fr/bnp",
    );
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result.some((a) => a.firmName === "Cleary Gottlieb Steen & Hamilton")).toBe(true);
    expect(result.some((a) => a.firmName.includes("Allen & Overy"))).toBe(true);
  });

  it("deduplicates same firm mentioned multiple times", () => {
    const result = extractAdvisors(
      "Latham & Watkins advises on deal",
      "Latham & Watkins a conseillé l'emprunteur. Le cabinet Latham était présent sur cette transaction.",
      "Reuters",
      "https://reuters.com/article/latham",
    );
    const lathamCount = result.filter((a) => a.firmName === "Latham & Watkins").length;
    expect(lathamCount).toBe(1);
  });

  // ─── formatAdvisorForDisplay ───────────────────────────────────────────────

  it("formats advisor for display with role and side", () => {
    const display = formatAdvisorForDisplay({
      firmName: "Clifford Chance",
      role: "legal_counsel",
      side: "buyer",
      source: "Les Échos",
      sourceUrl: "https://lesechos.fr",
    });
    expect(display).toBe("Clifford Chance (Conseil juridique — côté acquéreur)");
  });

  it("formats advisor without side", () => {
    const display = formatAdvisorForDisplay({
      firmName: "Lazard",
      role: "financial_advisor",
      side: "unknown",
      source: "Reuters",
      sourceUrl: "https://reuters.com",
    });
    expect(display).toBe("Lazard (Conseil financier)");
  });

  // ─── Law firm dictionary coverage ──────────────────────────────────────────

  it("has at least 60 firms in the dictionary", () => {
    expect(LAW_FIRMS.length).toBeGreaterThanOrEqual(60);
  });

  it("includes all major Paris finance firms", () => {
    const names = LAW_FIRMS.map((f) => f.name);
    const expectedFirms = [
      "Clifford Chance", "Linklaters", "Latham & Watkins", "White & Case",
      "Gide Loyrette Nouel", "Bredin Prat", "Darrois Villey Maillot Brochier",
      "BDGS Associés", "De Pardieu Brocas Maffei",
    ];
    for (const firm of expectedFirms) {
      expect(names).toContain(firm);
    }
  });
});
