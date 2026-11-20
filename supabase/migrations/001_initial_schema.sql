-- BDGS Client Radar — Initial Database Schema
-- ==============================================
-- All tables store publicly sourced information only.
-- No confidential, privileged, or non-public client data.

-- ─── Companies ─────────────────────────────────────────────────────────────────

create table if not exists companies (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
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

create index idx_companies_monitoring on companies (monitoring_status);
create index idx_companies_sector on companies (sector);

-- ─── News Articles ─────────────────────────────────────────────────────────────

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

  -- Scoring (dual score system v1.0.0)
  relevance_score       integer check (relevance_score between 0 and 100),
  opportunity_score     integer check (opportunity_score between 0 and 100),
  relevance_breakdown   jsonb,  -- full ScoreBreakdown object
  opportunity_breakdown jsonb,  -- full ScoreBreakdown object
  scoring_version       text not null default '1.0.0',

  -- Manual overrides
  relevance_override    integer check (relevance_override between 0 and 100),
  opportunity_override  integer check (opportunity_override between 0 and 100),
  override_reason       text,
  flagged_incorrect     boolean not null default false,
  flag_reason           text,

  is_read       boolean not null default false,
  watchlisted   boolean not null default false,

  -- Ingestion metadata
  feed_source   text,         -- which RSS/API feed this came from
  external_id   text unique,  -- dedupe key (URL hash or feed GUID)

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_news_published on news_articles (published_at desc);
create index idx_news_category on news_articles (category);
create index idx_news_relevance on news_articles (relevance_score desc);
create index idx_news_opportunity on news_articles (opportunity_score desc);
create index idx_news_external on news_articles (external_id);

-- Junction table: articles ↔ companies (many-to-many)
create table if not exists article_companies (
  article_id  uuid not null references news_articles(id) on delete cascade,
  company_id  uuid not null references companies(id) on delete cascade,
  primary key (article_id, company_id)
);

-- ─── Deals ─────────────────────────────────────────────────────────────────────

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

create index idx_deals_company on deals (company_id);
create index idx_deals_status on deals (status);
create index idx_deals_date on deals (announcement_date desc);

-- ─── Opportunities ─────────────────────────────────────────────────────────────

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

create index idx_opps_company on opportunities (company_id);
create index idx_opps_status on opportunities (status);
create index idx_opps_score on opportunities (opportunity_score desc);

-- ─── Briefings ─────────────────────────────────────────────────────────────────

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

create index idx_briefings_date on briefings (generated_at desc);

-- ─── Watchlist ─────────────────────────────────────────────────────────────────

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

create index idx_watchlist_entity on watchlist_items (entity_type, entity_id);

-- ─── Scoring Methodology Log ───────────────────────────────────────────────────
-- Tracks scoring methodology versions for audit trail

create table if not exists scoring_methodology (
  version       text primary key,
  description   text not null,
  weights       jsonb not null,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- Seed v1.0.0 methodology
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
);

-- ─── Updated-at triggers ───────────────────────────────────────────────────────

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_companies_updated before update on companies
  for each row execute function update_updated_at();

create trigger trg_news_updated before update on news_articles
  for each row execute function update_updated_at();

create trigger trg_opportunities_updated before update on opportunities
  for each row execute function update_updated_at();

-- ─── Row Level Security ────────────────────────────────────────────────────────
-- Enable RLS on all tables. Policies will be added when auth is set up.

alter table companies enable row level security;
alter table news_articles enable row level security;
alter table article_companies enable row level security;
alter table deals enable row level security;
alter table opportunities enable row level security;
alter table briefings enable row level security;
alter table watchlist_items enable row level security;
alter table scoring_methodology enable row level security;

-- For now, allow all operations via service role (anon key gets read-only)
-- These policies will be tightened when user auth is implemented.

create policy "Allow read for anon" on companies for select using (true);
create policy "Allow read for anon" on news_articles for select using (true);
create policy "Allow read for anon" on article_companies for select using (true);
create policy "Allow read for anon" on deals for select using (true);
create policy "Allow read for anon" on opportunities for select using (true);
create policy "Allow read for anon" on briefings for select using (true);
create policy "Allow read for anon" on watchlist_items for select using (true);
create policy "Allow read for anon" on scoring_methodology for select using (true);

-- Allow all via service role (for API routes / server components)
create policy "Allow all for service" on companies for all using (true);
create policy "Allow all for service" on news_articles for all using (true);
create policy "Allow all for service" on article_companies for all using (true);
create policy "Allow all for service" on deals for all using (true);
create policy "Allow all for service" on opportunities for all using (true);
create policy "Allow all for service" on briefings for all using (true);
create policy "Allow all for service" on watchlist_items for all using (true);
create policy "Allow all for service" on scoring_methodology for all using (true);
