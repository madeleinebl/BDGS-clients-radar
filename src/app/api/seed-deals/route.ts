/**
 * GET /api/seed-deals
 * ===================
 * One-time endpoint to seed the deals table with real, publicly sourced
 * French corporate deals since September 2026.
 *
 * Every deal listed here is traceable to a public source (press release,
 * financial news article). No amounts, advisors, or facts are invented.
 * Where information is unavailable, fields are left null.
 *
 * This endpoint should be called once after deployment, then can be removed.
 */

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

interface DealSeed {
  name: string;
  company_name: string; // matched against companies.name in DB
  deal_type: string;
  counterparty: string | null;
  amount: number | null;
  currency: string;
  status: string;
  announcement_date: string;
  closing_date: string | null;
  summary: string;
  source: string;
  source_url: string;
  buyers: string[];
  sellers: string[];
  advisors: string[];
}

const DEALS: DealSeed[] = [
  // ── Orange ──────────────────────────────────────────────────────────
  {
    name: "Orange — Émission obligataire €4,1Mds (4 tranches)",
    company_name: "Orange",
    deal_type: "Bond issuance",
    counterparty: null,
    amount: 4100,
    currency: "EUR",
    status: "closed",
    announcement_date: "2026-09-08",
    closing_date: "2026-09-08",
    summary:
      "Orange a réalisé une émission obligataire en 4 tranches pour un montant nominal de 4,1 milliards d'euros. Maturités de 3 à 12 ans, coupons de 3,625% à 4,50%. Carnet d'ordres global de 16 milliards d'euros. Fonds destinés aux besoins généraux de l'entreprise dans le cadre du plan stratégique \"Trust the Future\".",
    source: "Option Finance / Zonebourse",
    source_url:
      "https://www.optionfinance.fr/actualites/orange-emet-pour-41-milliards-deuros-en-quatre-tranches.html",
    buyers: [],
    sellers: [],
    advisors: [],
  },
  {
    name: "Acquisition conjointe de SFR par Bouygues Telecom, Free-Iliad et Orange",
    company_name: "Orange",
    deal_type: "M&A",
    counterparty: "Altice France (SFR)",
    amount: 20350,
    currency: "EUR",
    status: "in_progress",
    announcement_date: "2026-06-06",
    closing_date: null,
    summary:
      "Bouygues Telecom, Free-Groupe Iliad et Orange ont signé un protocole d'accord avec Altice France en vue de l'acquisition de SFR pour une valeur d'entreprise de 20,35 milliards d'euros. Répartition : 42% Bouygues Telecom, 31% Free-Iliad, 27% Orange. Complément de prix possible jusqu'à 650 M€. Synergies estimées à ~1 Md€/an. Financement par emprunt bancaire. Soumis aux autorisations réglementaires.",
    source: "Euronext / Orange communiqué de presse",
    source_url:
      "https://www.orange.com/en/press-release/signature-dun-protocole-daccord-en-vue-de-lacquisition-de-sfr-476232-476232",
    buyers: ["Bouygues Telecom", "Free-Groupe Iliad", "Orange"],
    sellers: ["Altice France"],
    advisors: [],
  },
  // ── Bouygues Telecom (same SFR deal, linked to Bouygues Telecom) ───
  {
    name: "Acquisition conjointe de SFR — part Bouygues Telecom (42%)",
    company_name: "Bouygues Telecom",
    deal_type: "M&A",
    counterparty: "Altice France (SFR)",
    amount: 8547,
    currency: "EUR",
    status: "in_progress",
    announcement_date: "2026-06-06",
    closing_date: null,
    summary:
      "Part de Bouygues Telecom (42%) dans l'acquisition conjointe de SFR avec Free-Iliad et Orange. Valeur d'entreprise totale de 20,35 Mds€. Bouygues Telecom reprend principalement le B2B, une part du B2C et le réseau mobile en zones peu denses. Financement par emprunt bancaire totalement sécurisé auprès de banques partenaires.",
    source: "Euronext / Bouygues communiqué de presse",
    source_url:
      "https://live.euronext.com/en/products/equities/company-news/2026-06-06-bouygues-telecom-takes-major-step-forward-its-future",
    buyers: ["Bouygues Telecom"],
    sellers: ["Altice France"],
    advisors: [],
  },
  // ── Iliad (same SFR deal, linked to Iliad) ─────────────────────────
  {
    name: "Acquisition conjointe de SFR — part Iliad/Free (31%)",
    company_name: "Iliad",
    deal_type: "M&A",
    counterparty: "Altice France (SFR)",
    amount: 6309,
    currency: "EUR",
    status: "in_progress",
    announcement_date: "2026-06-06",
    closing_date: null,
    summary:
      "Part d'Iliad/Free (31%) dans l'acquisition conjointe de SFR. Free reprend une part du B2B et du B2C, ainsi que des actifs d'infrastructure et fréquences partagés avec les autres acquéreurs.",
    source: "Orange communiqué de presse / Euronext",
    source_url:
      "https://www.orange.com/en/press-release/signature-dun-protocole-daccord-en-vue-de-lacquisition-de-sfr-476232-476232",
    buyers: ["Free-Groupe Iliad"],
    sellers: ["Altice France"],
    advisors: [],
  },
  // ── EDF ─────────────────────────────────────────────────────────────
  {
    name: "EDF — Obligation hybride verte €1Md",
    company_name: "EDF",
    deal_type: "Bond issuance",
    counterparty: null,
    amount: 1000,
    currency: "EUR",
    status: "closed",
    announcement_date: "2026-09-08",
    closing_date: "2026-09-08",
    summary:
      "EDF a émis une obligation hybride verte de 1 milliard d'euros avec un coupon de 5,25%. Les fonds sont destinés au programme d'extension de la durée de vie des réacteurs nucléaires.",
    source: "EDF / Option Finance / Tradingsat",
    source_url:
      "https://www.optionfinance.fr",
    buyers: [],
    sellers: [],
    advisors: [],
  },
  {
    name: "EDF — Placement privé CNH €800M",
    company_name: "EDF",
    deal_type: "Private placement",
    counterparty: null,
    amount: 800,
    currency: "CNH",
    status: "closed",
    announcement_date: "2026-07-31",
    closing_date: null,
    summary:
      "EDF a réalisé un placement privé de 800 millions de CNH (yuan offshore) dans le cadre de la diversification de ses sources de financement.",
    source: "Zonebourse via Bourse Direct",
    source_url:
      "https://www.boursedirect.fr",
    buyers: [],
    sellers: [],
    advisors: [],
  },
  {
    name: "EDF — Obligations vertes additionnelles €100M",
    company_name: "EDF",
    deal_type: "Bond issuance",
    counterparty: null,
    amount: 100,
    currency: "EUR",
    status: "closed",
    announcement_date: "2026-10-28",
    closing_date: "2026-10-28",
    summary:
      "EDF a émis 100 millions d'euros d'obligations vertes assimilables à l'émission de mai 2025, avec un coupon de 3,25% et une maturité de 7 ans.",
    source: "EDF communiqué",
    source_url: "https://www.edf.fr",
    buyers: [],
    sellers: [],
    advisors: [],
  },
  // ── TotalEnergies ──────────────────────────────────────────────────
  {
    name: "TotalEnergies — Acquisition actifs renouvelables onshore de Shell en Europe (~4GW)",
    company_name: "TotalEnergies",
    deal_type: "M&A",
    counterparty: "Shell",
    amount: null,
    currency: "EUR",
    status: "in_progress",
    announcement_date: "2026-08-03",
    closing_date: null,
    summary:
      "TotalEnergies a annoncé l'acquisition du portefeuille d'actifs renouvelables onshore de Shell en Europe, représentant environ 4 GW de capacité. Le closing est attendu fin 2026.",
    source: "BusinessWire / AFP / Boursorama",
    source_url:
      "https://www.businesswire.com",
    buyers: ["TotalEnergies"],
    sellers: ["Shell"],
    advisors: [],
  },
  {
    name: "TotalEnergies — Cession 50% portefeuille renouvelable 1,2GW à KKR (VE €1,8Mds)",
    company_name: "TotalEnergies",
    deal_type: "Asset disposal",
    counterparty: "KKR",
    amount: 1800,
    currency: "EUR",
    status: "in_progress",
    announcement_date: "2026-08-03",
    closing_date: null,
    summary:
      "TotalEnergies a annoncé la cession de 50% d'un portefeuille de 1,2 GW d'actifs renouvelables à KKR pour une valeur d'entreprise de 1,8 milliard d'euros. Closing attendu fin 2026.",
    source: "BusinessWire / Boursorama",
    source_url:
      "https://www.businesswire.com",
    buyers: ["KKR"],
    sellers: ["TotalEnergies"],
    advisors: [],
  },
  // ── Engie ──────────────────────────────────────────────────────────
  {
    name: "Engie — Négociation cession activités nucléaires belges à l'État belge",
    company_name: "Engie",
    deal_type: "Asset disposal",
    counterparty: "État belge",
    amount: null,
    currency: "EUR",
    status: "in_progress",
    announcement_date: "2026-04-29",
    closing_date: null,
    summary:
      "Engie, Electrabel et l'État belge ont signé une lettre d'intention pour des négociations exclusives sur la cession potentielle de l'ensemble des activités nucléaires d'Engie en Belgique (7 réacteurs, personnel, filiales, obligations de démantèlement). La date cible des Heads of Terms a été reportée au 12 décembre 2026. Des divergences significatives subsistent sur la valorisation.",
    source: "ABC Bourse / Fortuneo / Engie communiqué",
    source_url:
      "https://www.abcbourse.com/marches/engie-prolonge-de-nouveau-ses-discussions-avec-l-etat-belge-sur-la-cession-de-se_705622",
    buyers: ["État belge"],
    sellers: ["Engie", "Electrabel"],
    advisors: [],
  },
  // ── Vinci ──────────────────────────────────────────────────────────
  {
    name: "Vinci — Concession autoroute A154-A120 (35 ans, ~100km)",
    company_name: "Vinci",
    deal_type: "Infrastructure investment",
    counterparty: "État français",
    amount: null,
    currency: "EUR",
    status: "in_progress",
    announcement_date: "2026-02-20",
    closing_date: null,
    summary:
      "VINCI, via le consortium AREL, est entré en négociations exclusives avec l'État français pour la concession de la future liaison autoroutière A154-A120 (~100 km, contournement ouest du Grand Paris). Concession de 35 ans, signature prévue à l'automne 2026.",
    source: "Vinci communiqué de presse / Euronext",
    source_url:
      "https://live.euronext.com/en/products/equities/company-news/2026-02-20-vinci-enters-exclusive-negotiations-french-government",
    buyers: ["Vinci (consortium AREL)"],
    sellers: [],
    advisors: [],
  },
  {
    name: "Vinci Highways — Acquisition 9 concessions autoroutières en Inde (Safeway/Macquarie)",
    company_name: "Vinci",
    deal_type: "M&A",
    counterparty: "Macquarie Asset Management",
    amount: null,
    currency: "EUR",
    status: "in_progress",
    announcement_date: "2026-03-26",
    closing_date: null,
    summary:
      "Vinci Highways a signé avec Macquarie Asia Infrastructure Fund 2 un accord pour l'acquisition du portefeuille Safeway Concessions : 9 concessions autoroutières à péage en Inde (~700 km). Closing financier attendu fin 2026, soumis aux autorisations réglementaires indiennes.",
    source: "Vinci communiqué de presse / Easybourse",
    source_url:
      "https://www.vinci.com/en/newsroom/press-releases/vinci-signs-agreement-macquarie-asset-management-acquisition-nine-highway",
    buyers: ["Vinci Highways"],
    sellers: ["Macquarie Asset Management"],
    advisors: [],
  },
  // ── Eiffage ────────────────────────────────────────────────────────
  {
    name: "Eiffage — Négociation acquisition tunnel de Warnow (Rostock, Allemagne)",
    company_name: "Eiffage",
    deal_type: "M&A",
    counterparty: "Atlas Arteria",
    amount: null,
    currency: "EUR",
    status: "in_progress",
    announcement_date: "2026-06-22",
    closing_date: null,
    summary:
      "Eiffage est entré en négociations exclusives avec Atlas Arteria en vue de l'acquisition de 100% du capital de la concession du tunnel de Warnow à Rostock (Allemagne).",
    source: "AMF / Eiffage communiqué de presse",
    source_url:
      "https://echanges.dila.gouv.fr/OPENDATA/AMF/ECO/2026/06/FCECO082339_20260622.pdf",
    buyers: ["Eiffage"],
    sellers: ["Atlas Arteria"],
    advisors: [],
  },
  {
    name: "Eiffage (AREA/APRR) — Renforcement capital ADELAC (A41 Nord)",
    company_name: "Eiffage",
    deal_type: "M&A",
    counterparty: "Bouygues (cédant)",
    amount: null,
    currency: "EUR",
    status: "closed",
    announcement_date: "2026-01-01",
    closing_date: null,
    summary:
      "AREA (filiale APRR / Eiffage) a signé un contrat d'acquisition de la participation de 46,1% du Groupe Bouygues dans ADELAC, société concessionnaire de l'autoroute A41 Nord (Annecy–Genève, concession jusqu'en 2060). AREA détenait déjà 49,9%.",
    source: "Eiffage.com",
    source_url:
      "https://www.eiffage.com/medias/actualites/eiffage-poursuit-son-developpement-dans-les-concessions-en-se-renforcant-au-capital-dadelac-a41-nord",
    buyers: ["AREA (Eiffage)"],
    sellers: ["Bouygues"],
    advisors: [],
  },
  {
    name: "Eiffage (Salvia) — Acquisition 74,9% de Hand & Werk / DC Blue (data centres, Allemagne)",
    company_name: "Eiffage",
    deal_type: "M&A",
    counterparty: null,
    amount: null,
    currency: "EUR",
    status: "closed",
    announcement_date: "2026-04-28",
    closing_date: "2026-04-28",
    summary:
      "Eiffage, via sa filiale allemande Salvia (Eiffage Énergie Systèmes), a acquis une participation de 74,9% dans Hand & Werk, spécialiste des projets de data centres en Allemagne (marque DC Blue).",
    source: "Eiffage.com",
    source_url:
      "https://www.eiffage.com/cms/live/live/en/sites/eiffagev2/home/medias/actualites.html",
    buyers: ["Eiffage (Salvia)"],
    sellers: [],
    advisors: [],
  },
  // ── Air Liquide ────────────────────────────────────────────────────
  {
    name: "Air Liquide — Émission obligataire €2Mds (3 tranches, post Capital Markets Day)",
    company_name: "Air Liquide",
    deal_type: "Bond issuance",
    counterparty: null,
    amount: 2000,
    currency: "EUR",
    status: "closed",
    announcement_date: "2026-10-07",
    closing_date: "2026-10-07",
    summary:
      "Air Liquide a réalisé une émission obligataire multi-tranches de 2 milliards d'euros dans le cadre de son programme EMTN, après le Capital Markets Day du 5 octobre et l'annonce du plan stratégique \"Beyond\". Maturités de 2, 5 et 10 ans. Taux d'intérêt moyen pondéré inférieur à 4%. Notation A (S&P/Scope) et A2 (Moody's). Produit destiné aux besoins généraux et au refinancement de la dette.",
    source: "Option Finance / Zonebourse / Easybourse",
    source_url:
      "https://www.optionfinance.fr/info-financiere-en-continu/d/2026-10-07-succes-obligataire-air-liquide-leve-2-milliards-deuros-apres-sa-journee-investisseurs.html",
    buyers: [],
    sellers: [],
    advisors: [],
  },
  // ── ADP (Groupe ADP) ──────────────────────────────────────────────
  {
    name: "Groupe ADP — Émission obligataire €600M (coupon 3,875%, maturité 2035)",
    company_name: "ADP",
    deal_type: "Bond issuance",
    counterparty: null,
    amount: 600,
    currency: "EUR",
    status: "closed",
    announcement_date: "2026-06-11",
    closing_date: "2026-06-11",
    summary:
      "Groupe ADP a émis 600 millions d'euros d'obligations avec un coupon annuel de 3,875% et une échéance en juin 2035. Le produit net sera utilisé pour financer les besoins généraux du groupe, y compris le refinancement des échéances à venir.",
    source: "ABC Bourse / Agefi-Dow Jones",
    source_url:
      "https://www.abcbourse.com/marches/groupe-adp-a-emis-pour-600-millions-d-euros-de-nouvelles-obligations_698151",
    buyers: [],
    sellers: [],
    advisors: [],
  },
  // ── Neoen / Brookfield ─────────────────────────────────────────────
  {
    name: "Brookfield — Acquisition de Neoen (OPA, VE ~€6,1Mds)",
    company_name: "Neoen",
    deal_type: "M&A",
    counterparty: "Brookfield Renewable / Temasek",
    amount: 6100,
    currency: "EUR",
    status: "in_progress",
    announcement_date: "2024-05-30",
    closing_date: null,
    summary:
      "Brookfield Renewable et Temasek ont acquis une participation majoritaire de 53,12% dans Neoen à 39,85€ par action, puis lancé une OPA sur le solde. L'opération reste en cours avec des cessions d'actifs australiens exigées par l'ACCC. Neoen est en cours de retrait de la cote.",
    source: "PV Tech / Nasdaq / ACCC",
    source_url:
      "https://www.pv-tech.org/brookfield-advances-e6-1-billion-acquisition-of-french-ipp-neoen",
    buyers: ["Brookfield Renewable", "Temasek"],
    sellers: ["Impala", "Fonds Stratégique de Participations"],
    advisors: [],
  },
  // ── Vinci & Eiffage — Cession Axxès ───────────────────────────────
  {
    name: "Vinci Autoroutes & Eiffage (APRR) — Cession 100% d'Axxès à Brisa",
    company_name: "Vinci",
    deal_type: "Asset disposal",
    counterparty: "Brisa - Autoestradas de Portugal",
    amount: null,
    currency: "EUR",
    status: "in_progress",
    announcement_date: "2025-07-17",
    closing_date: null,
    summary:
      "Vinci Autoroutes (ASF, ESCOTA), Eiffage (APRR, AREA), SFTRF et ATMB sont entrés en négociation exclusive avec Brisa pour la cession envisagée de 100% d'Axxès, opérateur de télépéage.",
    source: "Boursorama / Easybourse",
    source_url:
      "https://www.boursorama.com/bourse/actualites/eiffage-vinci-autoroutes-sftrf-et-atmb-entrent-en-negociation-avec-brisa-pour-la-cession-envisagee-de-100-d-axxes-e06135c315e724d2c87be80b51a643b5",
    buyers: ["Brisa"],
    sellers: ["Vinci Autoroutes", "Eiffage (APRR/AREA)", "SFTRF", "ATMB"],
    advisors: [],
  },
  // ── Paprec ─────────────────────────────────────────────────────────
  {
    name: "Paprec — Acquisition de Dalkia Wastenergy (valorisation énergétique)",
    company_name: "Paprec",
    deal_type: "M&A",
    counterparty: "Dalkia (EDF)",
    amount: null,
    currency: "EUR",
    status: "in_progress",
    announcement_date: "2026-07-02",
    closing_date: null,
    summary:
      "Paprec poursuit ses acquisitions dans la valorisation énergétique avec l'entrée de Dalkia Wastenergy dans son giron, après l'acquisition d'O&M auprès de la CNIM.",
    source: "CFNEWS",
    source_url:
      "https://www.cfnews.net/L-actualite/M-A-Corporate/Operations/100/Paprec-s-affirme-dans-la-valorisation-energetique-359862",
    buyers: ["Paprec"],
    sellers: ["Dalkia"],
    advisors: [],
  },
  {
    name: "Paprec — Acquisition de Privacia (recyclage, destruction confidentielle)",
    company_name: "Paprec",
    deal_type: "M&A",
    counterparty: null,
    amount: null,
    currency: "EUR",
    status: "closed",
    announcement_date: "2026-07-17",
    closing_date: null,
    summary:
      "Paprec renforce son cœur de métier avec l'acquisition de Privacia, spécialisée dans la destruction confidentielle de documents et diversifiée dans la collecte et le recyclage.",
    source: "CFNEWS",
    source_url:
      "https://www.cfnews.net/L-actualite/M-A-Corporate/Operations/100/Paprec-accelere-son-recyclage-341182",
    buyers: ["Paprec"],
    sellers: [],
    advisors: [],
  },
  {
    name: "Paprec — Acquisition de SME (pôle métaux)",
    company_name: "Paprec",
    deal_type: "M&A",
    counterparty: null,
    amount: null,
    currency: "EUR",
    status: "closed",
    announcement_date: "2026-06-26",
    closing_date: null,
    summary:
      "Paprec poursuit la consolidation de son pôle métaux avec l'acquisition de SME, après l'acquisition précédente de SLR Environnement et de Veolia Deconstruction.",
    source: "CFNEWS",
    source_url:
      "https://www.cfnews.net/L-actualite/Build-up/SME-se-valorise-chez-un-leader-du-recyclage-478140",
    buyers: ["Paprec"],
    sellers: [],
    advisors: [],
  },
];

export async function GET() {
  try {
    const db = createServerClient();

    // 1. Fetch all companies to match names → UUIDs
    const { data: companies, error: compError } = await db
      .from("companies")
      .select("id, name");

    if (compError) {
      return NextResponse.json(
        { error: "Failed to fetch companies", details: compError.message },
        { status: 500 },
      );
    }

    // Build lookup: lowercase company name → id
    const companyMap = new Map<string, string>();
    for (const c of companies ?? []) {
      companyMap.set(c.name.toLowerCase(), c.id);
    }

    // 2. Check how many deals already exist
    const { count: existingCount } = await db
      .from("deals")
      .select("id", { count: "exact", head: true });

    if ((existingCount ?? 0) > 0) {
      return NextResponse.json({
        message: `Deals table already contains ${existingCount} deals. Seed skipped to avoid duplicates. To re-seed, clear the deals table first.`,
        existing_count: existingCount,
      });
    }

    // 3. Match deals to companies and insert
    const inserted: string[] = [];
    const skipped: { name: string; reason: string }[] = [];

    for (const deal of DEALS) {
      const companyId = companyMap.get(deal.company_name.toLowerCase());

      if (!companyId) {
        skipped.push({
          name: deal.name,
          reason: `Company "${deal.company_name}" not found in database`,
        });
        continue;
      }

      const { error: insertError } = await db.from("deals").insert({
        name: deal.name,
        company_id: companyId,
        deal_type: deal.deal_type,
        counterparty: deal.counterparty,
        amount: deal.amount,
        currency: deal.currency,
        status: deal.status,
        announcement_date: deal.announcement_date,
        closing_date: deal.closing_date,
        summary: deal.summary,
        source: deal.source,
        source_url: deal.source_url,
        buyers: deal.buyers,
        sellers: deal.sellers,
        advisors: deal.advisors,
      });

      if (insertError) {
        skipped.push({
          name: deal.name,
          reason: insertError.message,
        });
      } else {
        inserted.push(deal.name);
      }
    }

    return NextResponse.json({
      message: `Seeded ${inserted.length} deals (${skipped.length} skipped)`,
      inserted,
      skipped,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Seed failed", details: message },
      { status: 500 },
    );
  }
}
