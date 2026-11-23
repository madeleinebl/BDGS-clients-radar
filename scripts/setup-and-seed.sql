-- BDGS Client Radar — Full Setup: Schema + 92 Companies
-- ======================================================
-- Run this ONCE in Supabase → SQL Editor → New Query → paste all → Run
-- All information is publicly available. No confidential data.


-- ═══════════════════════════════════════════════════════════════
-- PART 1: CREATE ALL TABLES
-- ═══════════════════════════════════════════════════════════════

-- Companies
create table if not exists companies (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,
  sector        text not null,
  country       text not null default 'France',
  website       text,
  description   text,
  is_public     boolean not null default false,
  ticker        text,
  exchange      text,
  deal_count    integer not null default 0,
  latest_news_date timestamptz,
  watchlisted   boolean not null default false,
  monitoring_status text not null default 'active'
    check (monitoring_status in ('active', 'paused', 'archived')),
  priority      text not null default 'medium'
    check (priority in ('high', 'medium', 'low')),
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_companies_monitoring on companies (monitoring_status);
create index if not exists idx_companies_sector on companies (sector);

-- News Articles
create table if not exists news_articles (
  id            uuid primary key default gen_random_uuid(),
  headline      text not null,
  source        text not null,
  source_url    text not null,
  published_at  timestamptz not null,
  category      text not null default 'Other'
    check (category in (
      'M&A', 'Financing', 'Regulatory', 'Earnings', 'Management',
      'Restructuring', 'IPO', 'Infrastructure', 'Credit', 'Other'
    )),
  summary       text,
  full_text     text,
  relevance_score       integer check (relevance_score between 0 and 100),
  opportunity_score     integer check (opportunity_score between 0 and 100),
  relevance_breakdown   jsonb,
  opportunity_breakdown jsonb,
  scoring_version       text not null default '1.0.0',
  relevance_override    integer check (relevance_override between 0 and 100),
  opportunity_override  integer check (opportunity_override between 0 and 100),
  override_reason       text,
  flagged_incorrect     boolean not null default false,
  flag_reason           text,
  is_read       boolean not null default false,
  watchlisted   boolean not null default false,
  feed_source   text,
  external_id   text unique,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_news_published on news_articles (published_at desc);
create index if not exists idx_news_category on news_articles (category);
create index if not exists idx_news_relevance on news_articles (relevance_score desc);
create index if not exists idx_news_opportunity on news_articles (opportunity_score desc);
create index if not exists idx_news_external on news_articles (external_id);

-- Junction: articles ↔ companies
create table if not exists article_companies (
  article_id  uuid not null references news_articles(id) on delete cascade,
  company_id  uuid not null references companies(id) on delete cascade,
  primary key (article_id, company_id)
);

-- Deals
create table if not exists deals (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  company_id      uuid not null references companies(id) on delete cascade,
  deal_type       text not null
    check (deal_type in (
      'M&A', 'LBO', 'Refinancing', 'Corporate loan', 'Bond issuance',
      'Private placement', 'Project finance', 'Infrastructure investment',
      'Asset disposal', 'Capital increase', 'Joint venture'
    )),
  counterparty    text,
  amount          numeric,
  currency        text not null default 'EUR',
  status          text not null default 'announced'
    check (status in ('rumoured', 'announced', 'in_progress', 'closed', 'cancelled')),
  announcement_date date not null,
  closing_date    date,
  summary         text,
  source          text not null,
  source_url      text,
  buyers          text[] not null default '{}',
  sellers         text[] not null default '{}',
  advisors        text[] not null default '{}',
  last_updated    timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

create index if not exists idx_deals_company on deals (company_id);
create index if not exists idx_deals_status on deals (status);
create index if not exists idx_deals_date on deals (announcement_date desc);

-- Opportunities
create table if not exists opportunities (
  id                uuid primary key default gen_random_uuid(),
  company_id        uuid not null references companies(id) on delete cascade,
  headline          text not null,
  hypothesis        text not null,
  signal_type       text not null,
  source_article_id uuid references news_articles(id) on delete set null,
  confidence        text not null default 'medium'
    check (confidence in ('high', 'medium', 'low')),
  status            text not null default 'new'
    check (status in ('new', 'under_review', 'qualified', 'dismissed')),
  opportunity_score integer check (opportunity_score between 0 and 100),
  practice_areas    text[] not null default '{}',
  detected_at       timestamptz not null default now(),
  reviewed_at       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_opps_company on opportunities (company_id);
create index if not exists idx_opps_status on opportunities (status);
create index if not exists idx_opps_score on opportunities (opportunity_score desc);

-- Briefings
create table if not exists briefings (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  type          text not null default 'daily'
    check (type in ('daily', 'weekly', 'custom')),
  summary       text not null,
  highlights    text[] not null default '{}',
  article_ids   uuid[] not null default '{}',
  article_count integer not null default 0,
  generated_at  timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create index if not exists idx_briefings_date on briefings (generated_at desc);

-- Watchlist
create table if not exists watchlist_items (
  id          uuid primary key default gen_random_uuid(),
  entity_type text not null
    check (entity_type in ('company', 'deal', 'news', 'opportunity')),
  entity_id   uuid not null,
  company_id  uuid references companies(id) on delete set null,
  label       text not null,
  reason      text,
  added_at    timestamptz not null default now()
);

create index if not exists idx_watchlist_entity on watchlist_items (entity_type, entity_id);

-- Scoring methodology
create table if not exists scoring_methodology (
  version       text primary key,
  description   text not null,
  weights       jsonb not null,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- Seed scoring v1.0.0
insert into scoring_methodology (version, description, weights, active)
values (
  '1.0.0',
  'Initial dual-score system: News Relevance (0-100) and BDGS Finance Opportunity Score (0-100)',
  '{
    "relevance": {
      "keyword_match": 25,
      "company_mention": 25,
      "sector_relevance": 20,
      "source_quality": 15,
      "recency": 15
    },
    "opportunity": {
      "financing_need": 30,
      "transaction_likelihood": 25,
      "deal_size": 20,
      "relevance_to_expertise": 15,
      "actionability": 10
    }
  }'::jsonb,
  true
) on conflict (version) do nothing;

-- Triggers
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_companies_updated on companies;
create trigger trg_companies_updated before update on companies
  for each row execute function update_updated_at();

drop trigger if exists trg_news_updated on news_articles;
create trigger trg_news_updated before update on news_articles
  for each row execute function update_updated_at();

drop trigger if exists trg_opportunities_updated on opportunities;
create trigger trg_opportunities_updated before update on opportunities
  for each row execute function update_updated_at();

-- Row Level Security
alter table companies enable row level security;
alter table news_articles enable row level security;
alter table article_companies enable row level security;
alter table deals enable row level security;
alter table opportunities enable row level security;
alter table briefings enable row level security;
alter table watchlist_items enable row level security;
alter table scoring_methodology enable row level security;

-- RLS policies (drop first to avoid conflicts)
drop policy if exists "Allow read for anon" on companies;
drop policy if exists "Allow read for anon" on news_articles;
drop policy if exists "Allow read for anon" on article_companies;
drop policy if exists "Allow read for anon" on deals;
drop policy if exists "Allow read for anon" on opportunities;
drop policy if exists "Allow read for anon" on briefings;
drop policy if exists "Allow read for anon" on watchlist_items;
drop policy if exists "Allow read for anon" on scoring_methodology;

drop policy if exists "Allow all for service" on companies;
drop policy if exists "Allow all for service" on news_articles;
drop policy if exists "Allow all for service" on article_companies;
drop policy if exists "Allow all for service" on deals;
drop policy if exists "Allow all for service" on opportunities;
drop policy if exists "Allow all for service" on briefings;
drop policy if exists "Allow all for service" on watchlist_items;
drop policy if exists "Allow all for service" on scoring_methodology;

-- Read access for authenticated users
create policy "Allow read for authenticated" on companies for select to authenticated using (true);
create policy "Allow read for authenticated" on news_articles for select to authenticated using (true);
create policy "Allow read for authenticated" on article_companies for select to authenticated using (true);
create policy "Allow read for authenticated" on deals for select to authenticated using (true);
create policy "Allow read for authenticated" on opportunities for select to authenticated using (true);
create policy "Allow read for authenticated" on briefings for select to authenticated using (true);
create policy "Allow read for authenticated" on watchlist_items for select to authenticated using (true);
create policy "Allow read for authenticated" on scoring_methodology for select to authenticated using (true);

-- Full access for service role
create policy "Allow all for service" on companies for all using (true);
create policy "Allow all for service" on news_articles for all using (true);
create policy "Allow all for service" on article_companies for all using (true);
create policy "Allow all for service" on deals for all using (true);
create policy "Allow all for service" on opportunities for all using (true);
create policy "Allow all for service" on briefings for all using (true);
create policy "Allow all for service" on watchlist_items for all using (true);
create policy "Allow all for service" on scoring_methodology for all using (true);


-- ═══════════════════════════════════════════════════════════════
-- PART 2: INSERT 92 MONITORED COMPANIES
-- ═══════════════════════════════════════════════════════════════

INSERT INTO companies (name, sector, country, website, description, is_public, ticker, exchange, deal_count, watchlisted, monitoring_status, priority)
VALUES
-- TELECOM & INFRASTRUCTURES NUMÉRIQUES
('Orange', 'Telecom', 'France', 'https://www.orange.com', 'Opérateur télécoms historique français, actif dans les infrastructures fibre et 5G', true, 'ORA', 'Euronext Paris', 0, false, 'active', 'high'),
('Iliad', 'Telecom', 'France', 'https://www.iliad.fr', 'Groupe télécoms (Free), opérateur mobile et fibre, datacenters', true, 'ILD', 'Euronext Paris', 0, false, 'active', 'high'),
('Bouygues Telecom', 'Telecom', 'France', 'https://www.bouyguestelecom.fr', 'Opérateur mobile et fibre, filiale du groupe Bouygues', false, NULL, NULL, 0, false, 'active', 'high'),
('TDF', 'Telecom', 'France', 'https://www.tdf.fr', 'Infrastructures de diffusion TV/radio et télécoms, tours et datacenters', false, NULL, NULL, 0, false, 'active', 'medium'),
('Altitude Infrastructures', 'Telecom', 'France', 'https://www.altitude-infra.fr', 'Opérateur d''infrastructures fibre optique (réseaux d''initiative publique)', false, NULL, NULL, 0, false, 'active', 'medium'),
('Axione', 'Telecom', 'France', 'https://www.axione.fr', 'Opérateur d''infrastructures numériques, filiale de Bouygues Energies & Services', false, NULL, NULL, 0, false, 'active', 'medium'),
('Data4', 'Telecom', 'France', 'https://www.data4group.com', 'Opérateur de datacenters en Europe', false, NULL, NULL, 0, false, 'active', 'medium'),
('Equinix', 'Telecom', 'États-Unis', 'https://www.equinix.com', 'Leader mondial des datacenters et de l''interconnexion', true, 'EQIX', 'NASDAQ', 0, false, 'active', 'medium'),
('OVHcloud', 'Telecom', 'France', 'https://www.ovhcloud.com', 'Fournisseur cloud et hébergeur européen', true, 'OVH', 'Euronext Paris', 0, false, 'active', 'medium'),

-- ÉNERGIE — GRANDS GROUPES
('EDF', 'Énergie', 'France', 'https://www.edf.fr', 'Électricien national, nucléaire, renouvelables et réseaux', false, NULL, NULL, 0, false, 'active', 'high'),
('Engie', 'Énergie', 'France', 'https://www.engie.com', 'Groupe énergétique — gaz, renouvelables, services énergétiques', true, 'ENGI', 'Euronext Paris', 0, false, 'active', 'high'),
('TotalEnergies', 'Énergie', 'France', 'https://www.totalenergies.com', 'Major pétrolier et gazier, transition vers les renouvelables', true, 'TTE', 'Euronext Paris', 0, false, 'active', 'high'),

-- ÉNERGIE — RENOUVELABLES
('Neoen', 'Énergie — Renouvelables', 'France', 'https://www.neoen.com', 'Producteur indépendant d''énergie renouvelable (solaire, éolien, stockage)', false, NULL, NULL, 0, false, 'active', 'high'),
('Akuo Energy', 'Énergie — Renouvelables', 'France', 'https://www.akuoenergy.com', 'Producteur indépendant d''énergie renouvelable multi-technologies', false, NULL, NULL, 0, false, 'active', 'medium'),
('Voltalia', 'Énergie — Renouvelables', 'France', 'https://www.voltalia.com', 'Producteur d''énergies renouvelables et prestataire de services', true, 'VLTSA', 'Euronext Paris', 0, false, 'active', 'medium'),
('Corsica Sole', 'Énergie — Renouvelables', 'France', 'https://www.corsicasole.com', 'Producteur d''énergie solaire et stockage, spécialiste zones insulaires', false, NULL, NULL, 0, false, 'active', 'low'),
('GreenYellow', 'Énergie — Renouvelables', 'France', 'https://www.greenyellow.fr', 'Producteur solaire et efficacité énergétique (ex-filiale Casino)', false, NULL, NULL, 0, false, 'active', 'medium'),
('Q Energy', 'Énergie — Renouvelables', 'France', 'https://www.qenergy.com', 'Développeur de projets éoliens et solaires en Europe', false, NULL, NULL, 0, false, 'active', 'medium'),
('Tag Energy', 'Énergie — Renouvelables', 'France', NULL, 'Développeur de projets d''énergie renouvelable', false, NULL, NULL, 0, false, 'active', 'low'),
('Tenergie', 'Énergie — Renouvelables', 'France', 'https://www.tenergie.fr', 'Producteur d''énergie solaire en France', false, NULL, NULL, 0, false, 'active', 'low'),

-- ÉNERGIE — HYDROGÈNE & GAZ
('Air Liquide', 'Énergie — Gaz industriels', 'France', 'https://www.airliquide.com', 'Leader mondial des gaz industriels et services associés, hydrogène', true, 'AI', 'Euronext Paris', 0, false, 'active', 'high'),
('Vallourec', 'Énergie — Équipements', 'France', 'https://www.vallourec.com', 'Fabricant de tubes sans soudure pour l''industrie pétrolière et gazière', true, 'VK', 'Euronext Paris', 0, false, 'active', 'medium'),
('McPhy', 'Énergie — Hydrogène', 'France', 'https://www.mcphy.com', 'Équipements de production et distribution d''hydrogène vert', true, 'MCPHY', 'Euronext Paris', 0, false, 'active', 'medium'),
('Lhyfe', 'Énergie — Hydrogène', 'France', 'https://www.lhyfe.com', 'Producteur d''hydrogène vert renouvelable', true, 'LHYFE', 'Euronext Paris', 0, false, 'active', 'medium'),

-- ÉNERGIE — SERVICES & RÉSEAUX DE CHALEUR
('Engie Solutions', 'Énergie — Services', 'France', NULL, 'Services énergétiques et solutions de décarbonation (filiale Engie)', false, NULL, NULL, 0, false, 'active', 'medium'),
('Dalkia', 'Énergie — Réseaux de chaleur', 'France', 'https://www.dalkia.fr', 'Services énergétiques et réseaux de chaleur (filiale EDF)', false, NULL, NULL, 0, false, 'active', 'medium'),
('Coriance', 'Énergie — Réseaux de chaleur', 'France', 'https://www.coriance.fr', 'Opérateur de réseaux de chaleur et de froid urbains', false, NULL, NULL, 0, false, 'active', 'low'),
('Idex', 'Énergie — Services', 'France', 'https://www.idex.fr', 'Services énergétiques, réseaux de chaleur et efficacité énergétique', false, NULL, NULL, 0, false, 'active', 'low'),

-- TRANSPORTS & MOBILITÉ
('SNCF', 'Transports', 'France', 'https://www.sncf.com', 'Groupe ferroviaire national — transport de voyageurs et fret', false, NULL, NULL, 0, false, 'active', 'high'),
('Getlink', 'Transports', 'France', 'https://www.getlinkgroup.com', 'Opérateur du tunnel sous la Manche (Eurotunnel) et ElecLink', true, 'GET', 'Euronext Paris', 0, false, 'active', 'high'),
('LISEA', 'Transports — Concessions', 'France', 'https://www.lisea.fr', 'Concessionnaire de la LGV Sud Europe Atlantique (Tours-Bordeaux)', false, NULL, NULL, 0, false, 'active', 'medium'),
('Oc''Via', 'Transports — Concessions', 'France', NULL, 'Concessionnaire du contournement ferroviaire de Nîmes-Montpellier', false, NULL, NULL, 0, false, 'active', 'low'),
('Eiffage', 'BTP & Concessions', 'France', 'https://www.eiffage.com', 'Groupe de construction et concessions (APRR, Eiffage Énergie)', true, 'FGR', 'Euronext Paris', 0, false, 'active', 'high'),
('Vinci', 'BTP & Concessions', 'France', 'https://www.vinci.com', 'Leader mondial du BTP et des concessions (autoroutes, aéroports)', true, 'DG', 'Euronext Paris', 0, false, 'active', 'high'),
('Transdev', 'Transports', 'France', 'https://www.transdev.com', 'Opérateur de transport public (bus, tramway, ferroviaire)', false, NULL, NULL, 0, false, 'active', 'medium'),
('Keolis', 'Transports', 'France', 'https://www.keolis.com', 'Opérateur de transport public, filiale de la SNCF', false, NULL, NULL, 0, false, 'active', 'medium'),
('Abertis / SANEF', 'Transports — Autoroutes', 'France', 'https://www.sanef.com', 'Concessionnaire autoroutier (SANEF, SAPN) — filiale d''Abertis', false, NULL, NULL, 0, false, 'active', 'medium'),
('Akiem', 'Transports — Matériel roulant', 'France', 'https://www.akiem.com', 'Location de locomotives en Europe', false, NULL, NULL, 0, false, 'active', 'medium'),
('ERMEWA', 'Transports — Matériel roulant', 'France', 'https://www.ermewa.com', 'Location de wagons et conteneurs-citernes en Europe', false, NULL, NULL, 0, false, 'active', 'medium'),
('ADP', 'Transports — Aéroports', 'France', 'https://www.parisaeroport.fr', 'Aéroports de Paris — gestionnaire de CDG, Orly et Le Bourget', true, 'ADP', 'Euronext Paris', 0, false, 'active', 'high'),

-- BTP & CONSTRUCTION
('Bouygues', 'BTP & Concessions', 'France', 'https://www.bouygues.com', 'Groupe diversifié — BTP, immobilier, médias, télécoms', true, 'EN', 'Euronext Paris', 0, false, 'active', 'high'),
('NGE', 'BTP & Concessions', 'France', 'https://www.nge.fr', 'Groupe de BTP indépendant, travaux publics et génie civil', false, NULL, NULL, 0, false, 'active', 'medium'),
('FAYAT', 'BTP & Concessions', 'France', 'https://www.fayat.com', 'Groupe familial de BTP et industrie', false, NULL, NULL, 0, false, 'active', 'medium'),
('SPIE Batignolles', 'BTP & Concessions', 'France', 'https://www.spiebatignolles.fr', 'Groupe de construction — génie civil, bâtiment, fondations', false, NULL, NULL, 0, false, 'active', 'medium'),
('Legendre', 'BTP & Concessions', 'France', 'https://www.groupelegendre.com', 'Groupe breton de construction et promotion immobilière', false, NULL, NULL, 0, false, 'active', 'low'),
('Equans', 'BTP & Concessions — Services', 'France', 'https://www.equans.com', 'Services multi-techniques — énergie, digital, facilities (filiale Bouygues)', false, NULL, NULL, 0, false, 'active', 'medium'),

-- EAU & ENVIRONNEMENT
('Veolia', 'Eau & Environnement', 'France', 'https://www.veolia.com', 'Leader mondial de la gestion de l''eau, des déchets et de l''énergie', true, 'VIE', 'Euronext Paris', 0, false, 'active', 'high'),
('Suez', 'Eau & Environnement', 'France', 'https://www.suez.com', 'Gestion de l''eau et des déchets (restructuré après OPA Veolia)', false, NULL, NULL, 0, false, 'active', 'high'),
('Saur', 'Eau & Environnement', 'France', 'https://www.saur.com', 'Services de gestion de l''eau et de l''assainissement', false, NULL, NULL, 0, false, 'active', 'medium'),
('Paprec', 'Eau & Environnement — Déchets', 'France', 'https://www.paprec.com', 'Leader français du recyclage et de la valorisation des déchets', false, NULL, NULL, 0, false, 'active', 'medium'),
('Séché Environnement', 'Eau & Environnement — Déchets', 'France', 'https://www.seche-environnement.com', 'Traitement et valorisation des déchets, dépollution', true, 'SCHP', 'Euronext Paris', 0, false, 'active', 'medium'),
('Derichebourg', 'Eau & Environnement — Déchets', 'France', 'https://www.derichebourg.com', 'Recyclage de métaux et services aux entreprises', true, 'DBG', 'Euronext Paris', 0, false, 'active', 'medium'),
('Egis', 'Eau & Environnement — Ingénierie', 'France', 'https://www.egis-group.com', 'Groupe d''ingénierie, conseil et exploitation — transports, eau, bâtiment', false, NULL, NULL, 0, false, 'active', 'medium'),

-- PORTS & STOCKAGE
('Haropa Port', 'Ports & Stockage', 'France', 'https://www.haropaport.com', 'Grand port maritime de l''axe Seine (Le Havre, Rouen, Paris)', false, NULL, NULL, 0, false, 'active', 'medium'),
('Grand Port Maritime de Marseille', 'Ports & Stockage', 'France', 'https://www.marseille-port.fr', 'Premier port français en tonnage, hub méditerranéen', false, NULL, NULL, 0, false, 'active', 'medium'),
('Dunkerque LNG', 'Ports & Stockage — GNL', 'France', 'https://www.dunkerquelng.com', 'Terminal méthanier de Dunkerque', false, NULL, NULL, 0, false, 'active', 'medium'),
('Vopak', 'Ports & Stockage', 'Pays-Bas', 'https://www.vopak.com', 'Stockage indépendant de produits chimiques et pétroliers', true, 'VPK', 'Euronext Amsterdam', 0, false, 'active', 'medium'),
('Rubis Terminal', 'Ports & Stockage', 'France', 'https://www.rubis-terminal.com', 'Stockage de produits pétroliers et chimiques en Europe', false, NULL, NULL, 0, false, 'active', 'low'),
('Trapil', 'Ports & Stockage — Pipelines', 'France', 'https://www.trapil.fr', 'Transport de produits pétroliers par pipeline en France', false, NULL, NULL, 0, false, 'active', 'low'),
('SPMR', 'Ports & Stockage — Pipelines', 'France', NULL, 'Société du Pipeline Méditerranée-Rhône', false, NULL, NULL, 0, false, 'active', 'low'),
('Géosel', 'Ports & Stockage — Stockage souterrain', 'France', 'https://www.geosel.fr', 'Stockage souterrain d''hydrocarbures en cavités salines', false, NULL, NULL, 0, false, 'active', 'low'),

-- FONDS D'INVESTISSEMENT
('Ardian', 'Fonds d''investissement — Infrastructure', 'France', 'https://www.ardian.com', 'Société d''investissement privée, pôle infrastructure majeur', false, NULL, NULL, 0, false, 'active', 'high'),
('Meridiam', 'Fonds d''investissement — Infrastructure', 'France', 'https://www.meridiam.com', 'Gestionnaire de fonds spécialisé dans les infrastructures durables', false, NULL, NULL, 0, false, 'active', 'high'),
('Vauban Infrastructure Partners', 'Fonds d''investissement — Infrastructure', 'France', 'https://www.vauban-ip.com', 'Gestionnaire d''actifs infrastructure (affilié Natixis IM)', false, NULL, NULL, 0, false, 'active', 'high'),
('Antin Infrastructure Partners', 'Fonds d''investissement — Infrastructure', 'France', 'https://www.antin-ip.com', 'Fonds d''investissement en infrastructure coté en bourse', true, 'ANTIN', 'Euronext Paris', 0, false, 'active', 'high'),
('InfraVia', 'Fonds d''investissement — Infrastructure', 'France', 'https://www.infraviacapital.com', 'Fonds d''investissement en infrastructure et technologie', false, NULL, NULL, 0, false, 'active', 'high'),
('Infranity', 'Fonds d''investissement — Dette infra', 'France', 'https://www.infranity.com', 'Gestionnaire spécialisé en dette infrastructure (Generali)', false, NULL, NULL, 0, false, 'active', 'medium'),
('EDF Invest', 'Fonds d''investissement — Infrastructure', 'France', NULL, 'Branche investissement du groupe EDF', false, NULL, NULL, 0, false, 'active', 'medium'),
('Macquarie Asset Management', 'Fonds d''investissement — Infrastructure', 'Australie', 'https://www.macquarie.com', 'Gestionnaire d''actifs australien, leader mondial en infrastructure', false, NULL, NULL, 0, false, 'active', 'high'),
('Brookfield Asset Management', 'Fonds d''investissement — Infrastructure', 'Canada', 'https://www.brookfield.com', 'Gestionnaire d''actifs alternatifs — infrastructure, immobilier, renouvelables', true, 'BAM', 'NYSE', 0, false, 'active', 'high'),
('Mirova', 'Fonds d''investissement — Impact', 'France', 'https://www.mirova.com', 'Gestionnaire d''investissement responsable (affilié Natixis IM)', false, NULL, NULL, 0, false, 'active', 'medium'),
('Marguerite', 'Fonds d''investissement — Infrastructure', 'Luxembourg', 'https://www.marguerite.com', 'Fonds paneuropéen d''infrastructure (soutien BEI)', false, NULL, NULL, 0, false, 'active', 'medium'),
('Cube Infrastructure Managers', 'Fonds d''investissement — Infrastructure', 'Luxembourg', 'https://www.cube-infrastructure.com', 'Gestionnaire de fonds mid-market infrastructure', false, NULL, NULL, 0, false, 'active', 'medium'),
('Omnes Capital', 'Fonds d''investissement — Infrastructure', 'France', 'https://www.omnescapital.com', 'Société d''investissement — capital-risque, infrastructure, transition', false, NULL, NULL, 0, false, 'active', 'medium'),
('RGREEN INVEST', 'Fonds d''investissement — Énergie', 'France', 'https://www.rgreeninvest.com', 'Fonds spécialisé en financement d''infrastructures d''énergie renouvelable', false, NULL, NULL, 0, false, 'active', 'medium'),
('Quaero Capital', 'Fonds d''investissement — Infrastructure', 'Suisse', 'https://www.quaerocapital.com', 'Gestionnaire d''actifs indépendant, stratégies infrastructure', false, NULL, NULL, 0, false, 'active', 'low'),
('SWEN Capital Partners', 'Fonds d''investissement — Infrastructure', 'France', 'https://www.swen-cp.fr', 'Société de gestion — fonds de fonds, infrastructure, impact', false, NULL, NULL, 0, false, 'active', 'medium'),
('Atlante', 'Fonds d''investissement — Infrastructure', 'France', NULL, 'Fonds d''investissement en infrastructure', false, NULL, NULL, 0, false, 'active', 'low'),
('CVC / DIF Capital Partners', 'Fonds d''investissement — Infrastructure', 'Pays-Bas', 'https://www.dif.eu', 'Fonds mid-market infrastructure (acquis par CVC)', false, NULL, NULL, 0, false, 'active', 'medium'),
('KKR Infrastructure', 'Fonds d''investissement — Infrastructure', 'États-Unis', 'https://www.kkr.com', 'Pôle infrastructure du géant du private equity KKR', false, NULL, NULL, 0, false, 'active', 'high'),
('GIP / BlackRock', 'Fonds d''investissement — Infrastructure', 'États-Unis', 'https://www.global-infra.com', 'Global Infrastructure Partners, acquis par BlackRock', false, NULL, NULL, 0, false, 'active', 'high'),
('IFM Investors', 'Fonds d''investissement — Infrastructure', 'Australie', 'https://www.ifminvestors.com', 'Gestionnaire d''actifs australien, fonds de pension, infrastructure', false, NULL, NULL, 0, false, 'active', 'medium'),
('EQT Infrastructure', 'Fonds d''investissement — Infrastructure', 'Suède', 'https://www.eqtgroup.com', 'Pôle infrastructure du groupe suédois EQT', false, NULL, NULL, 0, false, 'active', 'medium'),
('I Squared Capital', 'Fonds d''investissement — Infrastructure', 'États-Unis', 'https://www.isquaredcapital.com', 'Fonds d''infrastructure indépendant, énergie et digital', false, NULL, NULL, 0, false, 'active', 'medium'),
('Rivage Investment', 'Fonds d''investissement — Dette infra', 'France', 'https://www.rivageinvestment.com', 'Gestionnaire spécialisé en dette infrastructure', false, NULL, NULL, 0, false, 'active', 'medium'),
('SCOR Investment Partners', 'Fonds d''investissement — Dette infra', 'France', 'https://www.scor-ip.com', 'Gestion d''actifs du réassureur SCOR, dette infrastructure', false, NULL, NULL, 0, false, 'active', 'low'),
('Eiffel Investment Group', 'Fonds d''investissement — Dette', 'France', 'https://www.eiffel-ig.com', 'Gestion d''actifs — dette privée, infrastructure, transition', false, NULL, NULL, 0, false, 'active', 'medium'),
('Raise', 'Fonds d''investissement — Infrastructure', 'France', 'https://www.raise.co', 'Groupe d''investissement entrepreneurial, infrastructure', false, NULL, NULL, 0, false, 'active', 'low'),
('Zencap Asset Management', 'Fonds d''investissement — Dette infra', 'France', NULL, 'Gestionnaire de dette infrastructure', false, NULL, NULL, 0, false, 'active', 'low'),
('Schroders Capital', 'Fonds d''investissement — Infrastructure', 'Royaume-Uni', 'https://www.schroderscapital.com', 'Pôle actifs privés de Schroders — infrastructure, immobilier', false, NULL, NULL, 0, false, 'active', 'medium'),
('AllianzGI', 'Fonds d''investissement — Infrastructure', 'Allemagne', 'https://www.allianzgi.com', 'Gestion d''actifs d''Allianz — dette et equity infrastructure', false, NULL, NULL, 0, false, 'active', 'medium'),
('Andera Partners', 'Fonds d''investissement — Infrastructure', 'France', 'https://www.anderapartners.com', 'Société d''investissement — mid-market, infrastructure, santé', false, NULL, NULL, 0, false, 'active', 'medium')

ON CONFLICT (name) DO UPDATE SET
  sector = EXCLUDED.sector,
  country = EXCLUDED.country,
  website = EXCLUDED.website,
  description = EXCLUDED.description,
  is_public = EXCLUDED.is_public,
  ticker = EXCLUDED.ticker,
  exchange = EXCLUDED.exchange,
  monitoring_status = EXCLUDED.monitoring_status,
  priority = EXCLUDED.priority,
  updated_at = now();
