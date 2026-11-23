-- BDGS Client Radar — Seed 92 monitored companies
-- =================================================
-- Run this in Supabase → SQL Editor → New Query → paste → Run
-- All information is publicly available. No confidential data.

-- First, clear existing sample data
DELETE FROM companies WHERE name IN (
  'Nexus Industries', 'Meridian Capital', 'Atlas Infrastructure',
  'Vortex Energy', 'Pinnacle Telecom', 'Quantum Dynamics',
  'Horizon Logistics', 'Sterling Financial', 'Nova Technologies',
  'Apex Construction'
);

-- Insert all BDGS-monitored companies
INSERT INTO companies (name, sector, country, website, description, is_public, ticker, exchange, deal_count, watchlisted, monitoring_status, priority)
VALUES
-- ══════════════════════════════════════════════════════════════
-- TELECOM & INFRASTRUCTURES NUMÉRIQUES
-- ══════════════════════════════════════════════════════════════
('Orange', 'Telecom', 'France', 'https://www.orange.com', 'Opérateur télécoms historique français, actif dans les infrastructures fibre et 5G', true, 'ORA', 'Euronext Paris', 0, false, 'active', 'high'),
('Iliad', 'Telecom', 'France', 'https://www.iliad.fr', 'Groupe télécoms (Free), opérateur mobile et fibre, datacenters', true, 'ILD', 'Euronext Paris', 0, false, 'active', 'high'),
('Bouygues Telecom', 'Telecom', 'France', 'https://www.bouyguestelecom.fr', 'Opérateur mobile et fibre, filiale du groupe Bouygues', false, NULL, NULL, 0, false, 'active', 'high'),
('TDF', 'Telecom', 'France', 'https://www.tdf.fr', 'Infrastructures de diffusion TV/radio et télécoms, tours et datacenters', false, NULL, NULL, 0, false, 'active', 'medium'),
('Altitude Infrastructures', 'Telecom', 'France', 'https://www.altitude-infra.fr', 'Opérateur d''infrastructures fibre optique (réseaux d''initiative publique)', false, NULL, NULL, 0, false, 'active', 'medium'),
('Axione', 'Telecom', 'France', 'https://www.axione.fr', 'Opérateur d''infrastructures numériques, filiale de Bouygues Energies & Services', false, NULL, NULL, 0, false, 'active', 'medium'),
('Data4', 'Telecom', 'France', 'https://www.data4group.com', 'Opérateur de datacenters en Europe', false, NULL, NULL, 0, false, 'active', 'medium'),
('Equinix', 'Telecom', 'États-Unis', 'https://www.equinix.com', 'Leader mondial des datacenters et de l''interconnexion', true, 'EQIX', 'NASDAQ', 0, false, 'active', 'medium'),
('OVHcloud', 'Telecom', 'France', 'https://www.ovhcloud.com', 'Fournisseur cloud et hébergeur européen', true, 'OVH', 'Euronext Paris', 0, false, 'active', 'medium'),

-- ══════════════════════════════════════════════════════════════
-- ÉNERGIE — GRANDS GROUPES
-- ══════════════════════════════════════════════════════════════
('EDF', 'Énergie', 'France', 'https://www.edf.fr', 'Électricien national, nucléaire, renouvelables et réseaux', false, NULL, NULL, 0, false, 'active', 'high'),
('Engie', 'Énergie', 'France', 'https://www.engie.com', 'Groupe énergétique — gaz, renouvelables, services énergétiques', true, 'ENGI', 'Euronext Paris', 0, false, 'active', 'high'),
('TotalEnergies', 'Énergie', 'France', 'https://www.totalenergies.com', 'Major pétrolier et gazier, transition vers les renouvelables', true, 'TTE', 'Euronext Paris', 0, false, 'active', 'high'),

-- ══════════════════════════════════════════════════════════════
-- ÉNERGIE — RENOUVELABLES & IPP
-- ══════════════════════════════════════════════════════════════
('Neoen', 'Énergie — Renouvelables', 'France', 'https://www.neoen.com', 'Producteur indépendant d''énergie renouvelable (solaire, éolien, stockage)', false, NULL, NULL, 0, false, 'active', 'high'),
('Akuo Energy', 'Énergie — Renouvelables', 'France', 'https://www.akuoenergy.com', 'Producteur indépendant d''énergie renouvelable multi-technologies', false, NULL, NULL, 0, false, 'active', 'medium'),
('Voltalia', 'Énergie — Renouvelables', 'France', 'https://www.voltalia.com', 'Producteur d''énergies renouvelables et prestataire de services', true, 'VLTSA', 'Euronext Paris', 0, false, 'active', 'medium'),
('Corsica Sole', 'Énergie — Renouvelables', 'France', 'https://www.corsicasole.com', 'Producteur d''énergie solaire et stockage, spécialiste zones insulaires', false, NULL, NULL, 0, false, 'active', 'low'),
('GreenYellow', 'Énergie — Renouvelables', 'France', 'https://www.greenyellow.fr', 'Producteur solaire et efficacité énergétique (ex-filiale Casino)', false, NULL, NULL, 0, false, 'active', 'medium'),
('Q Energy', 'Énergie — Renouvelables', 'France', 'https://www.qenergy.com', 'Développeur de projets éoliens et solaires en Europe', false, NULL, NULL, 0, false, 'active', 'medium'),
('Tag Energy', 'Énergie — Renouvelables', 'France', NULL, 'Développeur de projets d''énergie renouvelable', false, NULL, NULL, 0, false, 'active', 'low'),
('Tenergie', 'Énergie — Renouvelables', 'France', 'https://www.tenergie.fr', 'Producteur d''énergie solaire en France', false, NULL, NULL, 0, false, 'active', 'low'),

-- ══════════════════════════════════════════════════════════════
-- ÉNERGIE — HYDROGÈNE & GAZ INDUSTRIELS
-- ══════════════════════════════════════════════════════════════
('Air Liquide', 'Énergie — Gaz industriels', 'France', 'https://www.airliquide.com', 'Leader mondial des gaz industriels et services associés, hydrogène', true, 'AI', 'Euronext Paris', 0, false, 'active', 'high'),
('Vallourec', 'Énergie — Équipements', 'France', 'https://www.vallourec.com', 'Fabricant de tubes sans soudure pour l''industrie pétrolière et gazière', true, 'VK', 'Euronext Paris', 0, false, 'active', 'medium'),
('McPhy', 'Énergie — Hydrogène', 'France', 'https://www.mcphy.com', 'Équipements de production et distribution d''hydrogène vert', true, 'MCPHY', 'Euronext Paris', 0, false, 'active', 'medium'),
('Lhyfe', 'Énergie — Hydrogène', 'France', 'https://www.lhyfe.com', 'Producteur d''hydrogène vert renouvelable', true, 'LHYFE', 'Euronext Paris', 0, false, 'active', 'medium'),

-- ══════════════════════════════════════════════════════════════
-- ÉNERGIE — SERVICES & RÉSEAUX DE CHALEUR
-- ══════════════════════════════════════════════════════════════
('Engie Solutions', 'Énergie — Services', 'France', NULL, 'Services énergétiques et solutions de décarbonation (filiale Engie)', false, NULL, NULL, 0, false, 'active', 'medium'),
('Dalkia', 'Énergie — Réseaux de chaleur', 'France', 'https://www.dalkia.fr', 'Services énergétiques et réseaux de chaleur (filiale EDF)', false, NULL, NULL, 0, false, 'active', 'medium'),
('Coriance', 'Énergie — Réseaux de chaleur', 'France', 'https://www.coriance.fr', 'Opérateur de réseaux de chaleur et de froid urbains', false, NULL, NULL, 0, false, 'active', 'low'),
('Idex', 'Énergie — Services', 'France', 'https://www.idex.fr', 'Services énergétiques, réseaux de chaleur et efficacité énergétique', false, NULL, NULL, 0, false, 'active', 'low'),

-- ══════════════════════════════════════════════════════════════
-- TRANSPORTS & MOBILITÉ
-- ══════════════════════════════════════════════════════════════
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

-- ══════════════════════════════════════════════════════════════
-- BTP & CONSTRUCTION
-- ══════════════════════════════════════════════════════════════
('Bouygues', 'BTP & Concessions', 'France', 'https://www.bouygues.com', 'Groupe diversifié — BTP, immobilier, médias, télécoms', true, 'EN', 'Euronext Paris', 0, false, 'active', 'high'),
('NGE', 'BTP & Concessions', 'France', 'https://www.nge.fr', 'Groupe de BTP indépendant, travaux publics et génie civil', false, NULL, NULL, 0, false, 'active', 'medium'),
('FAYAT', 'BTP & Concessions', 'France', 'https://www.fayat.com', 'Groupe familial de BTP et industrie', false, NULL, NULL, 0, false, 'active', 'medium'),
('SPIE Batignolles', 'BTP & Concessions', 'France', 'https://www.spiebatignolles.fr', 'Groupe de construction — génie civil, bâtiment, fondations', false, NULL, NULL, 0, false, 'active', 'medium'),
('Legendre', 'BTP & Concessions', 'France', 'https://www.groupelegendre.com', 'Groupe breton de construction et promotion immobilière', false, NULL, NULL, 0, false, 'active', 'low'),
('Equans', 'BTP & Concessions — Services', 'France', 'https://www.equans.com', 'Services multi-techniques — énergie, digital, facilities (filiale Bouygues)', false, NULL, NULL, 0, false, 'active', 'medium'),

-- ══════════════════════════════════════════════════════════════
-- EAU & ENVIRONNEMENT
-- ══════════════════════════════════════════════════════════════
('Veolia', 'Eau & Environnement', 'France', 'https://www.veolia.com', 'Leader mondial de la gestion de l''eau, des déchets et de l''énergie', true, 'VIE', 'Euronext Paris', 0, false, 'active', 'high'),
('Suez', 'Eau & Environnement', 'France', 'https://www.suez.com', 'Gestion de l''eau et des déchets (restructuré après OPA Veolia)', false, NULL, NULL, 0, false, 'active', 'high'),
('Saur', 'Eau & Environnement', 'France', 'https://www.saur.com', 'Services de gestion de l''eau et de l''assainissement', false, NULL, NULL, 0, false, 'active', 'medium'),
('Paprec', 'Eau & Environnement — Déchets', 'France', 'https://www.paprec.com', 'Leader français du recyclage et de la valorisation des déchets', false, NULL, NULL, 0, false, 'active', 'medium'),
('Séché Environnement', 'Eau & Environnement — Déchets', 'France', 'https://www.seche-environnement.com', 'Traitement et valorisation des déchets, dépollution', true, 'SCHP', 'Euronext Paris', 0, false, 'active', 'medium'),
('Derichebourg', 'Eau & Environnement — Déchets', 'France', 'https://www.derichebourg.com', 'Recyclage de métaux et services aux entreprises', true, 'DBG', 'Euronext Paris', 0, false, 'active', 'medium'),
('Egis', 'Eau & Environnement — Ingénierie', 'France', 'https://www.egis-group.com', 'Groupe d''ingénierie, conseil et exploitation — transports, eau, bâtiment', false, NULL, NULL, 0, false, 'active', 'medium'),

-- ══════════════════════════════════════════════════════════════
-- PORTS & STOCKAGE
-- ══════════════════════════════════════════════════════════════
('Haropa Port', 'Ports & Stockage', 'France', 'https://www.haropaport.com', 'Grand port maritime de l''axe Seine (Le Havre, Rouen, Paris)', false, NULL, NULL, 0, false, 'active', 'medium'),
('Grand Port Maritime de Marseille', 'Ports & Stockage', 'France', 'https://www.marseille-port.fr', 'Premier port français en tonnage, hub méditerranéen', false, NULL, NULL, 0, false, 'active', 'medium'),
('Dunkerque LNG', 'Ports & Stockage — GNL', 'France', 'https://www.dunkerquelng.com', 'Terminal méthanier de Dunkerque', false, NULL, NULL, 0, false, 'active', 'medium'),
('Vopak', 'Ports & Stockage', 'Pays-Bas', 'https://www.vopak.com', 'Stockage indépendant de produits chimiques et pétroliers', true, 'VPK', 'Euronext Amsterdam', 0, false, 'active', 'medium'),
('Rubis Terminal', 'Ports & Stockage', 'France', 'https://www.rubis-terminal.com', 'Stockage de produits pétroliers et chimiques en Europe', false, NULL, NULL, 0, false, 'active', 'low'),
('Trapil', 'Ports & Stockage — Pipelines', 'France', 'https://www.trapil.fr', 'Transport de produits pétroliers par pipeline en France', false, NULL, NULL, 0, false, 'active', 'low'),
('SPMR', 'Ports & Stockage — Pipelines', 'France', NULL, 'Société du Pipeline Méditerranée-Rhône', false, NULL, NULL, 0, false, 'active', 'low'),
('Géosel', 'Ports & Stockage — Stockage souterrain', 'France', 'https://www.geosel.fr', 'Stockage souterrain d''hydrocarbures en cavités salines', false, NULL, NULL, 0, false, 'active', 'low'),

-- ══════════════════════════════════════════════════════════════
-- FONDS D'INVESTISSEMENT — INFRA SPÉCIALISÉS
-- ══════════════════════════════════════════════════════════════
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
