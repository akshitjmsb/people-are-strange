-- ─── Companies ────────────────────────────────────────────────────────────────
insert into companies (name, slug, industry, size_tier, description, website, linkedin_url, hq_address, tags, hiring_active, founded_year) values

-- Tech & AI
('Coveo',           'coveo',           'Tech & AI', 'scaleup',    'AI-powered search and recommendations platform for enterprises.', 'https://www.coveo.com', 'https://www.linkedin.com/company/coveo', '3175 Four Burlington, Montreal, QC', array['AI','Search','SaaS','Enterprise'], true, 2005),
('Element AI',      'element-ai',      'Tech & AI', 'scaleup',    'Applied AI solutions for complex enterprise challenges.', 'https://www.elementai.com', 'https://www.linkedin.com/company/element-ai', '6650 St-Urbain, Montreal, QC', array['AI','ML','Enterprise','Research'], false, 2016),
('Plusgrade',       'plusgrade',       'Tech & AI', 'smb',        'Ancillary revenue platform for the travel industry using AI.', 'https://www.plusgrade.com', 'https://www.linkedin.com/company/plusgrade', '1 Place Ville Marie, Montreal, QC', array['Travel','AI','SaaS','Revenue'], true, 2009),
('Dialogue',        'dialogue',        'Tech & AI', 'scaleup',    'Virtual care platform connecting employees to healthcare providers.', 'https://www.dialogue.co', 'https://www.linkedin.com/company/dialogue-health', '7 Place du Commerce, Montreal, QC', array['HealthTech','Telemedicine','SaaS','B2B'], true, 2016),
('Lightspeed',      'lightspeed',      'Tech & AI', 'enterprise', 'Cloud-based point-of-sale and e-commerce for SMBs worldwide.', 'https://www.lightspeedhq.com', 'https://www.linkedin.com/company/lightspeed-pos', '700 St-Antoine W, Montreal, QC', array['POS','Retail','E-Commerce','Cloud'], true, 2005),
('Breather',        'breather',        'Tech & AI', 'smb',        'On-demand workspace platform for flexible office bookings.', 'https://www.breather.com', 'https://www.linkedin.com/company/breather', '425 Viger W, Montreal, QC', array['PropTech','Workspace','SaaS','Marketplace'], false, 2012),
('Osedea',          'osedea',          'Tech & AI', 'smb',        'Digital product studio specializing in AI, IoT, and web applications.', 'https://www.osedea.com', 'https://www.linkedin.com/company/osedea', '4035 St-Ambroise, Montreal, QC', array['Agency','AI','IoT','Custom Dev'], true, 2013),
('Hopper',          'hopper',          'Tech & AI', 'scaleup',    'AI-powered travel app predicting flight and hotel prices.', 'https://www.hopper.com', 'https://www.linkedin.com/company/hopper', '265 Viger W, Montreal, QC', array['Travel','AI','Mobile','Consumer'], true, 2007),

-- Finance & Fintech
('Nuvei',           'nuvei',           'Finance & Fintech', 'enterprise', 'Global payment technology platform for high-growth businesses.', 'https://www.nuvei.com', 'https://www.linkedin.com/company/nuvei', '1100 René-Lévesque W, Montreal, QC', array['Payments','Fintech','Global','B2B'], true, 2003),
('Intact Financial','intact-financial', 'Finance & Fintech', 'enterprise', 'Largest provider of property and casualty insurance in Canada.', 'https://www.intactfc.com', 'https://www.linkedin.com/company/intact-financial-corporation', '700 University, Montreal, QC', array['Insurance','Fintech','Enterprise','Risk'], true, 1809),
('Propel Holdings', 'propel-holdings',  'Finance & Fintech', 'smb',        'Fintech platform offering consumer credit to underserved markets.', 'https://www.propelholdings.com', 'https://www.linkedin.com/company/propel-holdings', '1 Place Ville Marie, Montreal, QC', array['Credit','Lending','Fintech','Consumer'], true, 2011),
('National Bank',   'national-bank',    'Finance & Fintech', 'enterprise', 'Sixth largest Canadian bank with a strong fintech innovation arm.', 'https://www.nbc.ca', 'https://www.linkedin.com/company/national-bank-of-canada', '600 De La Gauchetière W, Montreal, QC', array['Banking','Fintech','Enterprise','Wealth'], true, 1859),
('Flinks',          'flinks',           'Finance & Fintech', 'smb',        'Open banking platform enabling financial data connectivity.', 'https://www.flinks.com', 'https://www.linkedin.com/company/flinks', '4388 St-Denis, Montreal, QC', array['Open Banking','API','Fintech','Data'], true, 2016),

-- Gaming & Creative
('Ubisoft Montreal','ubisoft-montreal', 'Gaming & Creative', 'enterprise', 'World-renowned game studio behind Assassin''s Creed and Far Cry.', 'https://www.ubisoft.com', 'https://www.linkedin.com/company/ubisoft', '5505 St-Laurent, Montreal, QC', array['AAA','Console','PC','IP'], true, 1997),
('Eidos Montreal',  'eidos-montreal',   'Gaming & Creative', 'scaleup',    'Square Enix studio known for Deus Ex and Marvel''s Guardians of the Galaxy.', 'https://eidosmontreal.com', 'https://www.linkedin.com/company/eidos-montreal', '1209 Av. Bernard, Montreal, QC', array['AAA','Console','Narrative','Action'], true, 2007),
('Behaviour Interactive', 'behaviour-interactive', 'Gaming & Creative', 'scaleup', 'Independent studio behind Dead by Daylight with 20M+ players.', 'https://www.bhvr.com', 'https://www.linkedin.com/company/behaviour-interactive', '888 De Maisonneuve E, Montreal, QC', array['Multiplayer','Horror','Live Service','Indie'], true, 1992),
('Framestore Montreal','framestore-montreal','Gaming & Creative', 'smb', 'VFX and immersive experience studio working on film and advertising.', 'https://www.framestore.com', 'https://www.linkedin.com/company/framestore', '3565 St-Laurent, Montreal, QC', array['VFX','Film','Immersive','Animation'], true, 2010),
('Ludia',           'ludia',            'Gaming & Creative', 'smb',        'Mobile game studio known for Jurassic World Alive and Dungeons & Dragons.', 'https://www.ludia.com', 'https://www.linkedin.com/company/ludia', '1000 De La Commune, Montreal, QC', array['Mobile','F2P','AR','IP'], false, 2007),

-- Health & Life Sciences
('Medicago',        'medicago',         'Health & Life Sciences', 'scaleup', 'Plant-based biologics company developing pandemic influenza vaccines.', 'https://www.medicago.com', 'https://www.linkedin.com/company/medicago', '1020 Route de l''Église, Quebec City, QC', array['Biotech','Vaccines','Plant-Based','R&D'], false, 2000),
('Miovision',       'miovision',        'Health & Life Sciences', 'smb',     'Smart traffic intelligence using computer vision and AI.', 'https://www.miovision.com', 'https://www.linkedin.com/company/miovision-technologies', '137 Glasgow, Waterloo, ON', array['SmartCity','CV','AI','Urban'], true, 2005),
('Aifred Health',   'aifred-health',    'Health & Life Sciences', 'startup', 'AI clinical decision support for depression treatment selection.', 'https://www.aifred.health', 'https://www.linkedin.com/company/aifred-health', '740 Notre-Dame W, Montreal, QC', array['MedTech','AI','Mental Health','Clinical'], true, 2017),
('Imagia',          'imagia',           'Health & Life Sciences', 'smb',     'AI-powered oncology platform for cancer detection and research.', 'https://www.imagia.com', 'https://www.linkedin.com/company/imagia', '5100 de Maisonneuve W, Montreal, QC', array['Oncology','AI','Medical Imaging','Research'], true, 2015),
('Otoaid',          'otoaid',           'Health & Life Sciences', 'startup', 'AI-assisted ear infection diagnosis tool for primary care.', 'https://www.otoaid.com', 'https://www.linkedin.com/company/otoaid', '740 Notre-Dame W, Montreal, QC', array['MedTech','AI','Diagnostics','Startup'], true, 2020),

-- Aerospace & Engineering
('CAE',             'cae',              'Aerospace & Engineering', 'enterprise', 'Global leader in simulation technologies for aviation and defence.', 'https://www.cae.com', 'https://www.linkedin.com/company/cae', '8585 Côte-de-Liesse, Montreal, QC', array['Simulation','Defence','Aviation','Training'], true, 1947),
('Pratt & Whitney Canada', 'pratt-whitney-canada', 'Aerospace & Engineering', 'enterprise', 'World-leading manufacturer of aircraft engines for business aviation.', 'https://www.pwc.ca', 'https://www.linkedin.com/company/pratt-whitney-canada', '1000 Marie-Victorin, Longueuil, QC', array['Aerospace','Engines','Manufacturing','Defence'], true, 1928),
('Neptec Technologies','neptec-technologies','Aerospace & Engineering','smb','Space technology company supplying vision systems for the ISS and rovers.','https://www.neptec.com','https://www.linkedin.com/company/neptec-technologies','302 Legget Drive, Ottawa, ON',array['Space','Vision Systems','Robotics','R&D'],true,1990),
('MDA Space',       'mda-space',        'Aerospace & Engineering', 'enterprise', 'Canadian space technology leader behind the Canadarm programs.', 'https://www.mda.space', 'https://www.linkedin.com/company/mda-space', '21025 Trans-Canada, Sainte-Anne-de-Bellevue, QC', array['Space','Robotics','Satellite','Defence'], true, 1969),

-- Retail & Consumer
('Frank And Oak',   'frank-and-oak',    'Retail & Consumer', 'smb',        'Sustainable fashion brand blending style with environmental responsibility.', 'https://www.frankandoak.com', 'https://www.linkedin.com/company/frank-and-oak', '160 St-Viateur W, Montreal, QC', array['Fashion','Sustainability','DTC','B Corp'], false, 2012),
('Ssense',          'ssense',           'Retail & Consumer', 'scaleup',    'Global luxury fashion e-commerce platform with editorial content.', 'https://www.ssense.com', 'https://www.linkedin.com/company/ssense', '90 St-Paul W, Montreal, QC', array['Luxury','Fashion','E-Commerce','Tech'], true, 2003),
('Reitmans',        'reitmans',         'Retail & Consumer', 'enterprise', 'Canadian women''s fashion retailer with 400+ stores nationwide.', 'https://www.reitmans.com', 'https://www.linkedin.com/company/reitmans', '250 Sauvé W, Montreal, QC', array['Fashion','Retail','Women','Canada'], true, 1926),
('DAVIDsTEA',       'davidstea',        'Retail & Consumer', 'scaleup',    'Specialty tea retailer with strong e-commerce and B2B channels.', 'https://www.davidstea.com', 'https://www.linkedin.com/company/davidstea', '5430 Trans-Island, Montreal, QC', array['Consumer','Tea','Omnichannel','CPG'], true, 2008),

-- Telecom & Infrastructure
('Ericsson Montreal','ericsson-montreal','Telecom & Infrastructure','enterprise','Global telecom R&D hub focused on 5G and network slicing innovation.','https://www.ericsson.com','https://www.linkedin.com/company/ericsson','8400 Decarie, Montreal, QC',array['5G','Telecom','R&D','Networks'],true,1953),
('Ciena',           'ciena',            'Telecom & Infrastructure', 'enterprise', 'Networking systems company enabling high-capacity optical networks.', 'https://www.ciena.com', 'https://www.linkedin.com/company/ciena', '3500 Carling Ave, Ottawa, ON', array['Networking','Optical','Telecom','Infrastructure'], true, 1992),
('Aptum Technologies','aptum-technologies','Telecom & Infrastructure','smb','Hybrid cloud and managed services provider across North America.','https://www.aptum.com','https://www.linkedin.com/company/aptum-technologies','420 Guy, Montreal, QC',array['Cloud','Managed Services','Hybrid','B2B'],true,1996),
('Contactual',      'contactual',       'Telecom & Infrastructure', 'startup', 'Cloud contact centre platform with AI routing and analytics.', 'https://www.contactual.com', 'https://www.linkedin.com/company/contactual', '1080 Côte du Beaver Hall, Montreal, QC', array['CCaaS','Cloud','AI','CX'], true, 2018);


-- ─── People ───────────────────────────────────────────────────────────────────
insert into people (company_id, name, title, role_type, linkedin_url, avatar_initials, is_active_signal, last_active_note) values

-- Coveo
((select id from companies where slug='coveo'), 'Louis Têtu',        'CEO & Co-founder',         'founder',        'https://linkedin.com/in/louistetu',        'LT', true,  'Spoke at Web Summit 2024 on enterprise AI'),
((select id from companies where slug='coveo'), 'Laurent Simoneau',  'President & CTO',          'founder',        'https://linkedin.com/in/laurentsimoneau',  'LS', false, null),
((select id from companies where slug='coveo'), 'Marie-Claude Boivin','VP Talent Acquisition',   'recruiter',      'https://linkedin.com/in/marieclaudeboivin','MB', true,  'Actively sourcing ML engineers and AEs'),
((select id from companies where slug='coveo'), 'Jean-François Roy', 'Director of Engineering',   'hiring_manager', 'https://linkedin.com/in/jfrancoisroy',     'JR', true,  'Hiring for 3 senior backend roles'),

-- Lightspeed
((select id from companies where slug='lightspeed'), 'Dax Dasilva',      'Founder & Executive Chair','founder',     'https://linkedin.com/in/daxdasilva',       'DD', true,  'Returned as Executive Chair Jan 2024'),
((select id from companies where slug='lightspeed'), 'JP Chauvet',       'CEO',                      'founder',     'https://linkedin.com/in/jpchauvet',        'JC', false, null),
((select id from companies where slug='lightspeed'), 'Melissa Vaillancourt','Global Head of Talent', 'recruiter',   'https://linkedin.com/in/melissavaillancourt','MV',true, 'Hiring across product and engineering'),
((select id from companies where slug='lightspeed'), 'Camille Dupont',   'Engineering Manager',      'hiring_manager','https://linkedin.com/in/campilledupont',  'CD', true,  'Building out new Payments team'),

-- Hopper
((select id from companies where slug='hopper'), 'Fred Lalonde',       'CEO & Co-founder',         'founder',        'https://linkedin.com/in/fredlalonde',      'FL', true,  'Announced Series G expansion to hotels'),
((select id from companies where slug='hopper'), 'Joost Ouwerkerk',    'CTO',                      'founder',        'https://linkedin.com/in/joostouwerkerk',   'JO', false, null),
((select id from companies where slug='hopper'), 'Ariane Beauchamp',   'Senior Technical Recruiter','recruiter',     'https://linkedin.com/in/arianebeauchamp',  'AB', true,  'Sourcing iOS and Android engineers'),

-- Nuvei
((select id from companies where slug='nuvei'), 'Philip Fayer',        'Chair & CEO',              'founder',        'https://linkedin.com/in/philipfayer',      'PF', true,  'Led go-private deal with Advent International'),
((select id from companies where slug='nuvei'), 'David Schwartz',      'CFO',                      'hiring_manager', 'https://linkedin.com/in/davidschwartz',    'DS', false, null),
((select id from companies where slug='nuvei'), 'Sabrina Ouimet',      'Talent Partner',           'recruiter',      'https://linkedin.com/in/sabrinaouimet',    'SO', true,  'Hiring payment integration engineers'),

-- Ubisoft Montreal
((select id from companies where slug='ubisoft-montreal'), 'Yves Guillemot',  'CEO & Co-founder', 'founder',        'https://linkedin.com/in/yvesguillemot',    'YG', true,  'Defending against Vivendi acquisition'),
((select id from companies where slug='ubisoft-montreal'), 'Luc Poirier',     'Studio Director',  'hiring_manager', 'https://linkedin.com/in/lucpoirier',       'LP', true,  'Hiring for new open-world IP'),
((select id from companies where slug='ubisoft-montreal'), 'Marie-Eve Lapointe','Talent Acquisition Lead','recruiter','https://linkedin.com/in/marievevelapointe','ML',true,'Sourcing narrative designers and animators'),

-- Behaviour Interactive
((select id from companies where slug='behaviour-interactive'), 'Rémi Racine', 'President & CEO', 'founder',        'https://linkedin.com/in/remiracine',       'RR', true,  'Expanding into new IP beyond DbD'),
((select id from companies where slug='behaviour-interactive'), 'Alexis Doyon','Chief Creative Officer','founder',  'https://linkedin.com/in/alexisdoyon',      'AD', false, null),
((select id from companies where slug='behaviour-interactive'), 'Karine Hébert','HR & Talent Director','recruiter', 'https://linkedin.com/in/karinehebert',     'KH', true,  'Hiring 50+ for new game project'),

-- Dialogue
((select id from companies where slug='dialogue'), 'Cherif Habib',      'CEO & Co-founder',         'founder',        'https://linkedin.com/in/cherifhabib',      'CH', true,  'Expanding into US market'),
((select id from companies where slug='dialogue'), 'Alexa Greenberg',   'Head of Talent',           'recruiter',      'https://linkedin.com/in/alexagreenberg',   'AG', true,  'Hiring clinical and product roles'),
((select id from companies where slug='dialogue'), 'Marc-André Lacombe','VP Engineering',           'hiring_manager', 'https://linkedin.com/in/marcandrelacombe', 'ML', true,  'Building out data platform team'),

-- Ssense
((select id from companies where slug='ssense'), 'Rami Atallah',       'CEO',                      'founder',        'https://linkedin.com/in/ramiatallah',      'RA', true,  'Opened flagship Montreal museum store'),
((select id from companies where slug='ssense'), 'Bassel Atallah',     'President',                'founder',        'https://linkedin.com/in/basselatallah',    'BA', false, null),
((select id from companies where slug='ssense'), 'Julia Moreau',       'Engineering Manager',      'hiring_manager', 'https://linkedin.com/in/juliamoreau',      'JM', true,  'Hiring ML engineers for recommendation engine'),

-- CAE
((select id from companies where slug='cae'), 'Marc Parent',           'President & CEO',          'founder',        'https://linkedin.com/in/marcparent',       'MP', false, null),
((select id from companies where slug='cae'), 'Nathalie Gauthier',    'VP HR & Talent',           'recruiter',      'https://linkedin.com/in/nathaliegauthier', 'NG', true,  'Hiring 300+ engineers across defence and aviation'),
((select id from companies where slug='cae'), 'François Tanguay',     'Director Software Eng',    'hiring_manager', 'https://linkedin.com/in/francoistanguay',  'FT', true,  'Building simulation software team'),

-- Flinks
((select id from companies where slug='flinks'), 'Yves-Gabriel Leboeuf','CEO & Co-founder',        'founder',        'https://linkedin.com/in/yvesleboeuf',      'YL', true,  'Partnered with 2 of 5 major Canadian banks'),
((select id from companies where slug='flinks'), 'Thomas Hamel',        'CTO',                     'founder',        'https://linkedin.com/in/thomashamel',      'TH', false, null),
((select id from companies where slug='flinks'), 'Laurence Paquin',     'Talent Partner',          'recruiter',      'https://linkedin.com/in/laurencepaquin',   'LP', true,  'Hiring backend and API engineers'),

-- Aifred Health
((select id from companies where slug='aifred-health'), 'David Benrimoh', 'CEO & Co-founder',      'founder',        'https://linkedin.com/in/davidbenrimoh',    'DB', true,  'Closing Series A round'),
((select id from companies where slug='aifred-health'), 'Kelly Perlman',  'COO',                   'founder',        'https://linkedin.com/in/kellyperlman',     'KP', false, null),
((select id from companies where slug='aifred-health'), 'Éric Bouchard',  'Clinical AI Lead',      'hiring_manager', 'https://linkedin.com/in/ericbouchard',     'EB', true,  'Hiring ML researcher and data scientist');


-- ─── Job Postings ─────────────────────────────────────────────────────────────
insert into job_postings (company_id, title, department, location, remote_type, posted_at, source_url, is_active) values

-- Coveo
((select id from companies where slug='coveo'), 'Senior Software Engineer – ML Platform', 'Engineering', 'Montreal, QC', 'hybrid', now() - interval '3 days', 'https://jobs.coveo.com', true),
((select id from companies where slug='coveo'), 'Account Executive – Enterprise',         'Sales',       'Montreal, QC', 'hybrid', now() - interval '7 days', 'https://jobs.coveo.com', true),
((select id from companies where slug='coveo'), 'Staff Product Manager – Search',         'Product',     'Montreal, QC', 'hybrid', now() - interval '1 day',  'https://jobs.coveo.com', true),

-- Lightspeed
((select id from companies where slug='lightspeed'), 'Backend Engineer – Payments',         'Engineering', 'Montreal, QC', 'hybrid',  now() - interval '2 days',  'https://jobs.lightspeedhq.com', true),
((select id from companies where slug='lightspeed'), 'Senior Product Designer',             'Design',      'Montreal, QC', 'remote',  now() - interval '10 days', 'https://jobs.lightspeedhq.com', true),
((select id from companies where slug='lightspeed'), 'Data Engineer – Analytics Platform',  'Data',        'Montreal, QC', 'hybrid',  now() - interval '5 days',  'https://jobs.lightspeedhq.com', true),

-- Hopper
((select id from companies where slug='hopper'), 'iOS Engineer',                           'Engineering', 'Montreal, QC', 'hybrid',  now() - interval '4 days',  'https://jobs.hopper.com', true),
((select id from companies where slug='hopper'), 'Android Engineer',                       'Engineering', 'Montreal, QC', 'hybrid',  now() - interval '4 days',  'https://jobs.hopper.com', true),
((select id from companies where slug='hopper'), 'ML Engineer – Price Prediction',         'Data & ML',   'Montreal, QC', 'onsite',  now() - interval '6 days',  'https://jobs.hopper.com', true),

-- Nuvei
((select id from companies where slug='nuvei'), 'Integration Engineer',                    'Engineering', 'Montreal, QC', 'hybrid',  now() - interval '8 days',  'https://careers.nuvei.com', true),
((select id from companies where slug='nuvei'), 'Senior DevOps Engineer',                  'Infra',       'Montreal, QC', 'hybrid',  now() - interval '12 days', 'https://careers.nuvei.com', true),

-- Ubisoft Montreal
((select id from companies where slug='ubisoft-montreal'), 'Gameplay Programmer',           'Engineering', 'Montreal, QC', 'onsite',  now() - interval '2 days',  'https://www.ubisoft.com/careers', true),
((select id from companies where slug='ubisoft-montreal'), 'Narrative Designer',            'Creative',    'Montreal, QC', 'onsite',  now() - interval '5 days',  'https://www.ubisoft.com/careers', true),
((select id from companies where slug='ubisoft-montreal'), 'Technical Artist',              'Art',         'Montreal, QC', 'hybrid',  now() - interval '9 days',  'https://www.ubisoft.com/careers', true),

-- Behaviour Interactive
((select id from companies where slug='behaviour-interactive'), 'Senior Game Designer',     'Design',      'Montreal, QC', 'hybrid',  now() - interval '1 day',   'https://www.bhvr.com/careers', true),
((select id from companies where slug='behaviour-interactive'), 'Backend Engineer – LiveOps','Engineering', 'Montreal, QC', 'hybrid',  now() - interval '3 days',  'https://www.bhvr.com/careers', true),
((select id from companies where slug='behaviour-interactive'), 'Community Manager',        'Marketing',   'Montreal, QC', 'remote',  now() - interval '6 days',  'https://www.bhvr.com/careers', true),

-- Dialogue
((select id from companies where slug='dialogue'), 'Full Stack Engineer',                   'Engineering', 'Montreal, QC', 'hybrid',  now() - interval '4 days',  'https://dialogue.co/careers', true),
((select id from companies where slug='dialogue'), 'Data Scientist – Health Outcomes',      'Data',        'Montreal, QC', 'remote',  now() - interval '7 days',  'https://dialogue.co/careers', true),

-- Ssense
((select id from companies where slug='ssense'), 'Machine Learning Engineer',              'Engineering', 'Montreal, QC', 'onsite',  now() - interval '2 days',  'https://www.ssense.com/careers', true),
((select id from companies where slug='ssense'), 'Senior Software Engineer – Platform',    'Engineering', 'Montreal, QC', 'hybrid',  now() - interval '11 days', 'https://www.ssense.com/careers', true),

-- CAE
((select id from companies where slug='cae'), 'Embedded Software Engineer',               'Engineering', 'Montreal, QC', 'onsite',  now() - interval '6 days',  'https://www.cae.com/careers', true),
((select id from companies where slug='cae'), 'Systems Engineer – Simulation',            'Engineering', 'Montreal, QC', 'hybrid',  now() - interval '9 days',  'https://www.cae.com/careers', true),

-- Flinks
((select id from companies where slug='flinks'), 'API Engineer – Open Banking',            'Engineering', 'Montreal, QC', 'hybrid',  now() - interval '3 days',  'https://flinks.com/careers', true),
((select id from companies where slug='flinks'), 'Senior Product Manager',                 'Product',     'Montreal, QC', 'hybrid',  now() - interval '8 days',  'https://flinks.com/careers', true),

-- Aifred Health
((select id from companies where slug='aifred-health'), 'ML Research Scientist',           'Research',    'Montreal, QC', 'hybrid',  now() - interval '5 days',  'https://aifred.health/careers', true),
((select id from companies where slug='aifred-health'), 'Full Stack Developer',             'Engineering', 'Montreal, QC', 'hybrid',  now() - interval '2 days',  'https://aifred.health/careers', true);


-- ─── Signals ──────────────────────────────────────────────────────────────────
insert into signals (company_id, signal_type, summary, source_url, detected_at) values

-- Today
((select id from companies where slug='coveo'),             'hiring',    'Posted 3 new roles in ML Platform and Enterprise Sales.', 'https://jobs.coveo.com', now() - interval '2 hours'),
((select id from companies where slug='hopper'),            'funding',   'Confirmed $96M Series G to expand hotel and car verticals.', 'https://techcrunch.com/hopper-series-g', now() - interval '4 hours'),
((select id from companies where slug='behaviour-interactive'),'hiring', 'Opened 50+ positions for an unannounced new title.', 'https://www.bhvr.com/careers', now() - interval '6 hours'),
((select id from companies where slug='aifred-health'),     'funding',   'Closing Series A — term sheet signed with BDC Capital.', 'https://aifred.health/news', now() - interval '3 hours'),

-- Yesterday
((select id from companies where slug='lightspeed'),        'expansion', 'Launched new Payments product in 12 European markets.', 'https://lightspeedhq.com/news', now() - interval '1 day'),
((select id from companies where slug='ssense'),            'news',      'Opened new flagship store doubling as a contemporary art museum.', 'https://ssense.com/editorial', now() - interval '1 day' + interval '2 hours'),
((select id from companies where slug='nuvei'),             'news',      'Completed go-private transaction with Advent International at $6.3B.', 'https://nuvei.com/investors', now() - interval '22 hours'),
((select id from companies where slug='dialogue'),          'expansion', 'Announced US market entry starting with Texas employers.', 'https://dialogue.co/news', now() - interval '20 hours'),

-- This week
((select id from companies where slug='ubisoft-montreal'),  'hiring',    'Ramping up hiring for new open-world IP — 30+ roles live.', 'https://ubisoft.com/careers', now() - interval '3 days'),
((select id from companies where slug='flinks'),            'news',      'Signed open banking data agreement with two of the Big Five banks.', 'https://flinks.com/blog', now() - interval '3 days'),
((select id from companies where slug='cae'),               'hiring',    'Defence division hiring 300+ engineers following new NATO contracts.', 'https://cae.com/careers', now() - interval '4 days'),
((select id from companies where slug='hopper'),            'hiring',    'Scaled ML team — 20 new roles across NLP and pricing models.', 'https://jobs.hopper.com', now() - interval '4 days'),
((select id from companies where slug='eidos-montreal'),    'news',      'Confirmed next project is an original IP, not a licensed title.', 'https://eidosmontreal.com/news', now() - interval '5 days'),
((select id from companies where slug='intact-financial'),  'hiring',    'Technology division hiring 200+ to accelerate AI underwriting tools.', 'https://careers.intact.ca', now() - interval '5 days'),
((select id from companies where slug='imagia'),            'funding',   'Raised $25M Series B to expand oncology AI platform to EU hospitals.', 'https://imagia.com/news', now() - interval '6 days'),

-- Older
((select id from companies where slug='coveo'),             'news',      'Coveo named a Leader in Gartner Magic Quadrant for Search and Product Discovery.', 'https://coveo.com/news', now() - interval '10 days'),
((select id from companies where slug='ludia'),             'quiet',     'No new job postings in 90 days — hiring appears frozen.', null, now() - interval '14 days'),
((select id from companies where slug='frank-and-oak'),     'quiet',     'Closed 12 retail locations; e-commerce pivot ongoing.', 'https://frankandoak.com/blog', now() - interval '18 days'),
((select id from companies where slug='element-ai'),        'quiet',     'Reduced headcount following acquisition integration — minimal external hiring.', null, now() - interval '21 days'),
((select id from companies where slug='mda-space'),         'funding',   'Awarded $1.2B CSA contract for Canadarm3 on the Lunar Gateway.', 'https://mda.space/news', now() - interval '25 days'),
((select id from companies where slug='breather'),          'quiet',     'Shut down consumer workspace app — pivoting to enterprise only.', 'https://breather.com/blog', now() - interval '30 days'),
((select id from companies where slug='plusgrade'),         'expansion', 'Expanded into cruise and rail verticals with two new airline partners.', 'https://plusgrade.com/news', now() - interval '12 days'),
((select id from companies where slug='national-bank'),     'hiring',    'Tech division growing by 500 roles this year under digital transformation plan.', 'https://nbc.ca/careers', now() - interval '8 days');
