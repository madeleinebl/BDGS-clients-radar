/**
 * BDGS Client Radar — Seed real client list
 * ==========================================
 * Loads ~120 publicly known BDGS-monitored entities into Supabase.
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=xxx npx tsx scripts/seed-clients.ts
 *
 * All information here is publicly available. No confidential data is included.
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "Missing env vars. Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.",
  );
  process.exit(1);
}

const supabase = createClient(url.trim(), key.trim());

// ─── Client list ────────────────────────────────────────────────────────────

interface ClientEntry {
  name: string;
  sector: string;
  sub_sector?: string;
  is_public: boolean;
  ticker?: string;
  exchange?: string;
  website?: string;
  description?: string;
  country: string;
  priority: "high" | "medium" | "low";
}

const clients: ClientEntry[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // TELECOM & INFRASTRUCTURES NUMÉRIQUES
  // ═══════════════════════════════════════════════════════════════════════════
  { name: "Orange", sector: "Telecom", is_public: true, ticker: "ORA", exchange: "Euronext Paris", website: "https://www.orange.com", description: "Opérateur télécoms historique français, actif dans les infrastructures fibre et 5G", country: "France", priority: "high" },
  { name: "Iliad", sector: "Telecom", is_public: true, ticker: "ILD", exchange: "Euronext Paris", website: "https://www.iliad.fr", description: "Groupe télécoms (Free), opérateur mobile et fibre, datacenters", country: "France", priority: "high" },
  { name: "Bouygues Telecom", sector: "Telecom", is_public: false, website: "https://www.bouyguestelecom.fr", description: "Opérateur mobile et fibre, filiale du groupe Bouygues", country: "France", priority: "high" },
  { name: "TDF", sector: "Telecom", is_public: false, website: "https://www.tdf.fr", description: "Infrastructures de diffusion TV/radio et télécoms, tours et datacenters", country: "France", priority: "medium" },
  { name: "Altitude Infrastructures", sector: "Telecom", is_public: false, website: "https://www.altitude-infra.fr", description: "Opérateur d'infrastructures fibre optique (réseaux d'initiative publique)", country: "France", priority: "medium" },
  { name: "Axione", sector: "Telecom", is_public: false, website: "https://www.axione.fr", description: "Opérateur d'infrastructures numériques, filiale de Bouygues Energies & Services", country: "France", priority: "medium" },
  { name: "Data4", sector: "Telecom", is_public: false, website: "https://www.data4group.com", description: "Opérateur de datacenters en Europe", country: "France", priority: "medium" },
  { name: "Equinix", sector: "Telecom", is_public: true, ticker: "EQIX", exchange: "NASDAQ", website: "https://www.equinix.com", description: "Leader mondial des datacenters et de l'interconnexion", country: "États-Unis", priority: "medium" },
  { name: "OVHcloud", sector: "Telecom", is_public: true, ticker: "OVH", exchange: "Euronext Paris", website: "https://www.ovhcloud.com", description: "Fournisseur cloud et hébergeur européen", country: "France", priority: "medium" },

  // ═══════════════════════════════════════════════════════════════════════════
  // ÉNERGIE — GRANDS GROUPES
  // ═══════════════════════════════════════════════════════════════════════════
  { name: "EDF", sector: "Énergie", is_public: false, website: "https://www.edf.fr", description: "Électricien national, nucléaire, renouvelables et réseaux", country: "France", priority: "high" },
  { name: "Engie", sector: "Énergie", is_public: true, ticker: "ENGI", exchange: "Euronext Paris", website: "https://www.engie.com", description: "Groupe énergétique — gaz, renouvelables, services énergétiques", country: "France", priority: "high" },
  { name: "TotalEnergies", sector: "Énergie", is_public: true, ticker: "TTE", exchange: "Euronext Paris", website: "https://www.totalenergies.com", description: "Major pétrolier et gazier, transition vers les renouvelables", country: "France", priority: "high" },

  // ═══════════════════════════════════════════════════════════════════════════
  // ÉNERGIE — RENOUVELABLES & IPP
  // ═══════════════════════════════════════════════════════════════════════════
  { name: "Neoen", sector: "Énergie", sub_sector: "Renouvelables", is_public: false, website: "https://www.neoen.com", description: "Producteur indépendant d'énergie renouvelable (solaire, éolien, stockage)", country: "France", priority: "high" },
  { name: "Akuo Energy", sector: "Énergie", sub_sector: "Renouvelables", is_public: false, website: "https://www.akuoenergy.com", description: "Producteur indépendant d'énergie renouvelable multi-technologies", country: "France", priority: "medium" },
  { name: "Voltalia", sector: "Énergie", sub_sector: "Renouvelables", is_public: true, ticker: "VLTSA", exchange: "Euronext Paris", website: "https://www.voltalia.com", description: "Producteur d'énergies renouvelables et prestataire de services", country: "France", priority: "medium" },
  { name: "Corsica Sole", sector: "Énergie", sub_sector: "Renouvelables", is_public: false, website: "https://www.corsicasole.com", description: "Producteur d'énergie solaire et stockage, spécialiste zones insulaires", country: "France", priority: "low" },
  { name: "GreenYellow", sector: "Énergie", sub_sector: "Renouvelables", is_public: false, website: "https://www.greenyellow.fr", description: "Producteur solaire et efficacité énergétique (ex-filiale Casino)", country: "France", priority: "medium" },
  { name: "Q Energy", sector: "Énergie", sub_sector: "Renouvelables", is_public: false, website: "https://www.qenergy.com", description: "Développeur de projets éoliens et solaires en Europe", country: "France", priority: "medium" },
  { name: "Tag Energy", sector: "Énergie", sub_sector: "Renouvelables", is_public: false, description: "Développeur de projets d'énergie renouvelable", country: "France", priority: "low" },
  { name: "Tenergie", sector: "Énergie", sub_sector: "Renouvelables", is_public: false, website: "https://www.tenergie.fr", description: "Producteur d'énergie solaire en France", country: "France", priority: "low" },

  // ═══════════════════════════════════════════════════════════════════════════
  // ÉNERGIE — HYDROGÈNE & GAZ INDUSTRIELS
  // ═══════════════════════════════════════════════════════════════════════════
  { name: "Air Liquide", sector: "Énergie", sub_sector: "Gaz industriels", is_public: true, ticker: "AI", exchange: "Euronext Paris", website: "https://www.airliquide.com", description: "Leader mondial des gaz industriels et services associés, hydrogène", country: "France", priority: "high" },
  { name: "Vallourec", sector: "Énergie", sub_sector: "Équipements", is_public: true, ticker: "VK", exchange: "Euronext Paris", website: "https://www.vallourec.com", description: "Fabricant de tubes sans soudure pour l'industrie pétrolière et gazière", country: "France", priority: "medium" },
  { name: "McPhy", sector: "Énergie", sub_sector: "Hydrogène", is_public: true, ticker: "MCPHY", exchange: "Euronext Paris", website: "https://www.mcphy.com", description: "Équipements de production et distribution d'hydrogène vert", country: "France", priority: "medium" },
  { name: "Lhyfe", sector: "Énergie", sub_sector: "Hydrogène", is_public: true, ticker: "LHYFE", exchange: "Euronext Paris", website: "https://www.lhyfe.com", description: "Producteur d'hydrogène vert renouvelable", country: "France", priority: "medium" },

  // ═══════════════════════════════════════════════════════════════════════════
  // ÉNERGIE — SERVICES & RÉSEAUX DE CHALEUR
  // ═══════════════════════════════════════════════════════════════════════════
  { name: "Engie Solutions", sector: "Énergie", sub_sector: "Services", is_public: false, description: "Services énergétiques et solutions de décarbonation (filiale Engie)", country: "France", priority: "medium" },
  { name: "Dalkia", sector: "Énergie", sub_sector: "Réseaux de chaleur", is_public: false, website: "https://www.dalkia.fr", description: "Services énergétiques et réseaux de chaleur (filiale EDF)", country: "France", priority: "medium" },
  { name: "Coriance", sector: "Énergie", sub_sector: "Réseaux de chaleur", is_public: false, website: "https://www.coriance.fr", description: "Opérateur de réseaux de chaleur et de froid urbains", country: "France", priority: "low" },
  { name: "Idex", sector: "Énergie", sub_sector: "Services", is_public: false, website: "https://www.idex.fr", description: "Services énergétiques, réseaux de chaleur et efficacité énergétique", country: "France", priority: "low" },

  // ═══════════════════════════════════════════════════════════════════════════
  // TRANSPORTS & MOBILITÉ
  // ═══════════════════════════════════════════════════════════════════════════
  { name: "SNCF", sector: "Transports", is_public: false, website: "https://www.sncf.com", description: "Groupe ferroviaire national — transport de voyageurs et fret", country: "France", priority: "high" },
  { name: "Getlink", sector: "Transports", is_public: true, ticker: "GET", exchange: "Euronext Paris", website: "https://www.getlinkgroup.com", description: "Opérateur du tunnel sous la Manche (Eurotunnel) et ElecLink", country: "France", priority: "high" },
  { name: "LISEA", sector: "Transports", sub_sector: "Concessions", is_public: false, website: "https://www.lisea.fr", description: "Concessionnaire de la LGV Sud Europe Atlantique (Tours-Bordeaux)", country: "France", priority: "medium" },
  { name: "Oc'Via", sector: "Transports", sub_sector: "Concessions", is_public: false, description: "Concessionnaire du contournement ferroviaire de Nîmes-Montpellier", country: "France", priority: "low" },
  { name: "Eiffage", sector: "BTP & Concessions", is_public: true, ticker: "FGR", exchange: "Euronext Paris", website: "https://www.eiffage.com", description: "Groupe de construction et concessions (APRR, Eiffage Énergie)", country: "France", priority: "high" },
  { name: "Vinci", sector: "BTP & Concessions", is_public: true, ticker: "DG", exchange: "Euronext Paris", website: "https://www.vinci.com", description: "Leader mondial du BTP et des concessions (autoroutes, aéroports)", country: "France", priority: "high" },
  { name: "Transdev", sector: "Transports", is_public: false, website: "https://www.transdev.com", description: "Opérateur de transport public (bus, tramway, ferroviaire)", country: "France", priority: "medium" },
  { name: "Keolis", sector: "Transports", is_public: false, website: "https://www.keolis.com", description: "Opérateur de transport public, filiale de la SNCF", country: "France", priority: "medium" },
  { name: "Abertis / SANEF", sector: "Transports", sub_sector: "Autoroutes", is_public: false, website: "https://www.sanef.com", description: "Concessionnaire autoroutier (SANEF, SAPN) — filiale d'Abertis", country: "France", priority: "medium" },
  { name: "Akiem", sector: "Transports", sub_sector: "Matériel roulant", is_public: false, website: "https://www.akiem.com", description: "Location de locomotives en Europe", country: "France", priority: "medium" },
  { name: "ERMEWA", sector: "Transports", sub_sector: "Matériel roulant", is_public: false, website: "https://www.ermewa.com", description: "Location de wagons et conteneurs-citernes en Europe", country: "France", priority: "medium" },
  { name: "ADP", sector: "Transports", sub_sector: "Aéroports", is_public: true, ticker: "ADP", exchange: "Euronext Paris", website: "https://www.parisaeroport.fr", description: "Aéroports de Paris — gestionnaire de CDG, Orly et Le Bourget", country: "France", priority: "high" },

  // ═══════════════════════════════════════════════════════════════════════════
  // BTP & CONSTRUCTION
  // ═══════════════════════════════════════════════════════════════════════════
  { name: "Bouygues", sector: "BTP & Concessions", is_public: true, ticker: "EN", exchange: "Euronext Paris", website: "https://www.bouygues.com", description: "Groupe diversifié — BTP, immobilier, médias, télécoms", country: "France", priority: "high" },
  { name: "NGE", sector: "BTP & Concessions", is_public: false, website: "https://www.nge.fr", description: "Groupe de BTP indépendant, travaux publics et génie civil", country: "France", priority: "medium" },
  { name: "FAYAT", sector: "BTP & Concessions", is_public: false, website: "https://www.fayat.com", description: "Groupe familial de BTP et industrie", country: "France", priority: "medium" },
  { name: "SPIE Batignolles", sector: "BTP & Concessions", is_public: false, website: "https://www.spiebatignolles.fr", description: "Groupe de construction — génie civil, bâtiment, fondations", country: "France", priority: "medium" },
  { name: "Legendre", sector: "BTP & Concessions", is_public: false, website: "https://www.groupelegendre.com", description: "Groupe breton de construction et promotion immobilière", country: "France", priority: "low" },
  { name: "Equans", sector: "BTP & Concessions", sub_sector: "Services", is_public: false, website: "https://www.equans.com", description: "Services multi-techniques — énergie, digital, facilities (filiale Bouygues)", country: "France", priority: "medium" },

  // ═══════════════════════════════════════════════════════════════════════════
  // EAU & ENVIRONNEMENT
  // ═══════════════════════════════════════════════════════════════════════════
  { name: "Veolia", sector: "Eau & Environnement", is_public: true, ticker: "VIE", exchange: "Euronext Paris", website: "https://www.veolia.com", description: "Leader mondial de la gestion de l'eau, des déchets et de l'énergie", country: "France", priority: "high" },
  { name: "Suez", sector: "Eau & Environnement", is_public: false, website: "https://www.suez.com", description: "Gestion de l'eau et des déchets (restructuré après OPA Veolia)", country: "France", priority: "high" },
  { name: "Saur", sector: "Eau & Environnement", is_public: false, website: "https://www.saur.com", description: "Services de gestion de l'eau et de l'assainissement", country: "France", priority: "medium" },
  { name: "Paprec", sector: "Eau & Environnement", sub_sector: "Déchets", is_public: false, website: "https://www.paprec.com", description: "Leader français du recyclage et de la valorisation des déchets", country: "France", priority: "medium" },
  { name: "Séché Environnement", sector: "Eau & Environnement", sub_sector: "Déchets", is_public: true, ticker: "SCHP", exchange: "Euronext Paris", website: "https://www.seche-environnement.com", description: "Traitement et valorisation des déchets, dépollution", country: "France", priority: "medium" },
  { name: "Derichebourg", sector: "Eau & Environnement", sub_sector: "Déchets", is_public: true, ticker: "DBG", exchange: "Euronext Paris", website: "https://www.derichebourg.com", description: "Recyclage de métaux et services aux entreprises", country: "France", priority: "medium" },
  { name: "Egis", sector: "Eau & Environnement", sub_sector: "Ingénierie", is_public: false, website: "https://www.egis-group.com", description: "Groupe d'ingénierie, conseil et exploitation — transports, eau, bâtiment", country: "France", priority: "medium" },

  // ═══════════════════════════════════════════════════════════════════════════
  // PORTS & STOCKAGE
  // ═══════════════════════════════════════════════════════════════════════════
  { name: "Haropa Port", sector: "Ports & Stockage", is_public: false, website: "https://www.haropaport.com", description: "Grand port maritime de l'axe Seine (Le Havre, Rouen, Paris)", country: "France", priority: "medium" },
  { name: "Grand Port Maritime de Marseille", sector: "Ports & Stockage", is_public: false, website: "https://www.marseille-port.fr", description: "Premier port français en tonnage, hub méditerranéen", country: "France", priority: "medium" },
  { name: "Dunkerque LNG", sector: "Ports & Stockage", sub_sector: "GNL", is_public: false, website: "https://www.dunkerquelng.com", description: "Terminal méthanier de Dunkerque", country: "France", priority: "medium" },
  { name: "Vopak", sector: "Ports & Stockage", is_public: true, ticker: "VPK", exchange: "Euronext Amsterdam", website: "https://www.vopak.com", description: "Stockage indépendant de produits chimiques et pétroliers", country: "Pays-Bas", priority: "medium" },
  { name: "Rubis Terminal", sector: "Ports & Stockage", is_public: false, website: "https://www.rubis-terminal.com", description: "Stockage de produits pétroliers et chimiques en Europe", country: "France", priority: "low" },
  { name: "Trapil", sector: "Ports & Stockage", sub_sector: "Pipelines", is_public: false, website: "https://www.trapil.fr", description: "Transport de produits pétroliers par pipeline en France", country: "France", priority: "low" },
  { name: "SPMR", sector: "Ports & Stockage", sub_sector: "Pipelines", is_public: false, description: "Société du Pipeline Méditerranée-Rhône", country: "France", priority: "low" },
  { name: "Géosel", sector: "Ports & Stockage", sub_sector: "Stockage souterrain", is_public: false, website: "https://www.geosel.fr", description: "Stockage souterrain d'hydrocarbures en cavités salines", country: "France", priority: "low" },

  // ═══════════════════════════════════════════════════════════════════════════
  // FONDS D'INVESTISSEMENT — INFRA SPÉCIALISÉS
  // ═══════════════════════════════════════════════════════════════════════════
  { name: "Ardian", sector: "Fonds d'investissement", sub_sector: "Infrastructure", is_public: false, website: "https://www.ardian.com", description: "Société d'investissement privée, pôle infrastructure majeur", country: "France", priority: "high" },
  { name: "Meridiam", sector: "Fonds d'investissement", sub_sector: "Infrastructure", is_public: false, website: "https://www.meridiam.com", description: "Gestionnaire de fonds spécialisé dans les infrastructures durables", country: "France", priority: "high" },
  { name: "Vauban Infrastructure Partners", sector: "Fonds d'investissement", sub_sector: "Infrastructure", is_public: false, website: "https://www.vauban-ip.com", description: "Gestionnaire d'actifs infrastructure (affilié Natixis IM)", country: "France", priority: "high" },
  { name: "Antin Infrastructure Partners", sector: "Fonds d'investissement", sub_sector: "Infrastructure", is_public: true, ticker: "ANTIN", exchange: "Euronext Paris", website: "https://www.antin-ip.com", description: "Fonds d'investissement en infrastructure coté en bourse", country: "France", priority: "high" },
  { name: "InfraVia", sector: "Fonds d'investissement", sub_sector: "Infrastructure", is_public: false, website: "https://www.infraviacapital.com", description: "Fonds d'investissement en infrastructure et technologie", country: "France", priority: "high" },
  { name: "Infranity", sector: "Fonds d'investissement", sub_sector: "Dette infra", is_public: false, website: "https://www.infranity.com", description: "Gestionnaire spécialisé en dette infrastructure (Generali)", country: "France", priority: "medium" },
  { name: "EDF Invest", sector: "Fonds d'investissement", sub_sector: "Infrastructure", is_public: false, description: "Branche investissement du groupe EDF", country: "France", priority: "medium" },
  { name: "Macquarie Asset Management", sector: "Fonds d'investissement", sub_sector: "Infrastructure", is_public: false, website: "https://www.macquarie.com", description: "Gestionnaire d'actifs australien, leader mondial en infrastructure", country: "Australie", priority: "high" },
  { name: "Brookfield Asset Management", sector: "Fonds d'investissement", sub_sector: "Infrastructure", is_public: true, ticker: "BAM", exchange: "NYSE", website: "https://www.brookfield.com", description: "Gestionnaire d'actifs alternatifs — infrastructure, immobilier, renouvelables", country: "Canada", priority: "high" },
  { name: "Mirova", sector: "Fonds d'investissement", sub_sector: "Impact", is_public: false, website: "https://www.mirova.com", description: "Gestionnaire d'investissement responsable (affilié Natixis IM)", country: "France", priority: "medium" },
  { name: "Marguerite", sector: "Fonds d'investissement", sub_sector: "Infrastructure", is_public: false, website: "https://www.marguerite.com", description: "Fonds paneuropéen d'infrastructure (soutien BEI)", country: "Luxembourg", priority: "medium" },
  { name: "Cube Infrastructure Managers", sector: "Fonds d'investissement", sub_sector: "Infrastructure", is_public: false, website: "https://www.cube-infrastructure.com", description: "Gestionnaire de fonds mid-market infrastructure", country: "Luxembourg", priority: "medium" },
  { name: "Omnes Capital", sector: "Fonds d'investissement", sub_sector: "Infrastructure", is_public: false, website: "https://www.omnescapital.com", description: "Société d'investissement — capital-risque, infrastructure, transition", country: "France", priority: "medium" },
  { name: "RGREEN INVEST", sector: "Fonds d'investissement", sub_sector: "Énergie", is_public: false, website: "https://www.rgreeninvest.com", description: "Fonds spécialisé en financement d'infrastructures d'énergie renouvelable", country: "France", priority: "medium" },
  { name: "Quaero Capital", sector: "Fonds d'investissement", sub_sector: "Infrastructure", is_public: false, website: "https://www.quaerocapital.com", description: "Gestionnaire d'actifs indépendant, stratégies infrastructure", country: "Suisse", priority: "low" },
  { name: "SWEN Capital Partners", sector: "Fonds d'investissement", sub_sector: "Infrastructure", is_public: false, website: "https://www.swen-cp.fr", description: "Société de gestion — fonds de fonds, infrastructure, impact", country: "France", priority: "medium" },
  { name: "Atlante", sector: "Fonds d'investissement", sub_sector: "Infrastructure", is_public: false, description: "Fonds d'investissement en infrastructure", country: "France", priority: "low" },
  { name: "CVC / DIF Capital Partners", sector: "Fonds d'investissement", sub_sector: "Infrastructure", is_public: false, website: "https://www.dif.eu", description: "Fonds mid-market infrastructure (acquis par CVC)", country: "Pays-Bas", priority: "medium" },
  { name: "KKR Infrastructure", sector: "Fonds d'investissement", sub_sector: "Infrastructure", is_public: false, website: "https://www.kkr.com", description: "Pôle infrastructure du géant du private equity KKR", country: "États-Unis", priority: "high" },
  { name: "GIP / BlackRock", sector: "Fonds d'investissement", sub_sector: "Infrastructure", is_public: false, website: "https://www.global-infra.com", description: "Global Infrastructure Partners, acquis par BlackRock", country: "États-Unis", priority: "high" },
  { name: "IFM Investors", sector: "Fonds d'investissement", sub_sector: "Infrastructure", is_public: false, website: "https://www.ifminvestors.com", description: "Gestionnaire d'actifs australien, fonds de pension, infrastructure", country: "Australie", priority: "medium" },
  { name: "EQT Infrastructure", sector: "Fonds d'investissement", sub_sector: "Infrastructure", is_public: false, website: "https://www.eqtgroup.com", description: "Pôle infrastructure du groupe suédois EQT", country: "Suède", priority: "medium" },
  { name: "I Squared Capital", sector: "Fonds d'investissement", sub_sector: "Infrastructure", is_public: false, website: "https://www.isquaredcapital.com", description: "Fonds d'infrastructure indépendant, énergie et digital", country: "États-Unis", priority: "medium" },
  { name: "Rivage Investment", sector: "Fonds d'investissement", sub_sector: "Dette infra", is_public: false, website: "https://www.rivageinvestment.com", description: "Gestionnaire spécialisé en dette infrastructure", country: "France", priority: "medium" },
  { name: "SCOR Investment Partners", sector: "Fonds d'investissement", sub_sector: "Dette infra", is_public: false, website: "https://www.scor-ip.com", description: "Gestion d'actifs du réassureur SCOR, dette infrastructure", country: "France", priority: "low" },
  { name: "Eiffel Investment Group", sector: "Fonds d'investissement", sub_sector: "Dette", is_public: false, website: "https://www.eiffel-ig.com", description: "Gestion d'actifs — dette privée, infrastructure, transition", country: "France", priority: "medium" },
  { name: "Raise", sector: "Fonds d'investissement", sub_sector: "Infrastructure", is_public: false, website: "https://www.raise.co", description: "Groupe d'investissement entrepreneurial, infrastructure", country: "France", priority: "low" },
  { name: "Zencap Asset Management", sector: "Fonds d'investissement", sub_sector: "Dette infra", is_public: false, description: "Gestionnaire de dette infrastructure", country: "France", priority: "low" },
  { name: "Schroders Capital", sector: "Fonds d'investissement", sub_sector: "Infrastructure", is_public: false, website: "https://www.schroderscapital.com", description: "Pôle actifs privés de Schroders — infrastructure, immobilier", country: "Royaume-Uni", priority: "medium" },
  { name: "AllianzGI", sector: "Fonds d'investissement", sub_sector: "Infrastructure", is_public: false, website: "https://www.allianzgi.com", description: "Gestion d'actifs d'Allianz — dette et equity infrastructure", country: "Allemagne", priority: "medium" },
  { name: "Andera Partners", sector: "Fonds d'investissement", sub_sector: "Infrastructure", is_public: false, website: "https://www.anderapartners.com", description: "Société d'investissement — mid-market, infrastructure, santé", country: "France", priority: "medium" },
];

// ─── Insert logic ───────────────────────────────────────────────────────────

async function seed() {
  console.log(`Seeding ${clients.length} companies...`);

  // Build rows for Supabase
  const rows = clients.map((c) => ({
    name: c.name,
    sector: c.sub_sector ? `${c.sector} — ${c.sub_sector}` : c.sector,
    country: c.country,
    website: c.website ?? null,
    description: c.description ?? null,
    is_public: c.is_public,
    ticker: c.ticker ?? null,
    exchange: c.exchange ?? null,
    deal_count: 0,
    latest_news_date: null,
    watchlisted: false,
    monitoring_status: "active" as const,
    priority: c.priority,
    notes: null,
  }));

  // Upsert in batches of 50 (on name conflict, update)
  const batchSize = 50;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from("companies")
      .upsert(batch, { onConflict: "name", ignoreDuplicates: false })
      .select("id");

    if (error) {
      console.error(`Error at batch ${i / batchSize + 1}:`, error.message);
      // Try inserting one by one to identify the problem row
      for (const row of batch) {
        const { error: singleError } = await supabase
          .from("companies")
          .upsert(row, { onConflict: "name", ignoreDuplicates: false });
        if (singleError) {
          console.error(`  ✗ ${row.name}: ${singleError.message}`);
        } else {
          inserted++;
          console.log(`  ✓ ${row.name}`);
        }
      }
    } else {
      inserted += data?.length ?? batch.length;
      console.log(
        `  ✓ Batch ${Math.floor(i / batchSize) + 1}: ${batch.map((r) => r.name).join(", ")}`,
      );
    }
  }

  console.log(`\nDone! ${inserted} companies seeded.`);
}

seed().catch(console.error);
