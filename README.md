Prime Archives -- Chat Handoff / README

Handoff voor een nieuwe ChatGPT-conversatie. Doel: verder kunnen werken zonder de huidige werkende architectuur opnieuw te reconstrueren.

Last updated: 2026-08-23
Project: Prime Archives / Echoes of Prime

Current Known-Good State

Prime Archives is een Quartz v5-site voor de D&D-campaign Echoes of Prime.

Projectroot:

C:\Echoes of Prime\QuartzSetup

Productie:

https://primearchives.nl

Stack:

Quartz v5

Cloudflare Worker echoes-of-prime-lore

Cloudflare Assets

Cloudflare D1 prime-archives

Git

Windows / PowerShell

Huidige baseline:

authenticated Squad Annotations op NPC-, Location- en Faction-records;

accounts voor Lumi, Clav, Dakka, Venn en The Architect;

server-side note ownership en delete-permissions;

persoonlijke Messages READ/UNREAD-state per user in D1;

PrimeOS login/logout op het hoofdscherm;

Messages-tegel toont per ingelogde user XX UNREAD of ALL READ;

Messages houden CORRUPTED / PRIORITY los van persoonlijke read-state.

Belangrijkste werkregel

Behandel de huidige repository als de known-good source of truth.

Bij substantiële wijzigingen aan bestaande kernbestanden:

gebruik de actuele volledige source file;

reconstrueer grote bestanden niet uit geheugen of oude snippets;

behoud bestaande functionaliteit buiten de gevraagde wijziging;

geef bij voorkeur een complete replacement file terug;

diagnoseer eerst welke laag faalt voordat code wordt herschreven.

Een groene Quartz-build bewijst niet automatisch dat Worker, browser-JS, API, D1 of productie werken.

Lokale development stack

Voor de volledige lokale site zijn twee gelijktijdige processen nodig.

Terminal 1 -- Quartz build/watch

cd "C:\Echoes of Prime\QuartzSetup"
npx quartz build --serve --watch

Quartz-preview:

http://localhost:8080

Gebruik 8080 alleen voor snelle content/layout-controle.

Belangrijk:

localhost:8080 = Quartz-only

Daar bestaan Worker-routes zoals /api/auth/*, /api/notes en /api/messages/* niet. Auth, annotations, persoonlijke Messages-state en andere D1-functionaliteit hoeven daar dus niet te werken.

Terminal 2 -- Worker + lokale D1/API

cd "C:\Echoes of Prime\QuartzSetup"
npx wrangler dev

Volledige lokale Prime Archives:

http://127.0.0.1:8787

Gebruik altijd 8787 voor tests met:

login/logout;

sessions;

Squad Annotations;

Messages READ/UNREAD;

dashboard unread-counter;

Worker API;

lokale D1.

Als iemand zegt "test lokaal" en de feature gebruikt backend/D1/auth, bedoelen we dus 127.0.0.1:8787, en daarvoor moeten zowel Quartz watch als Wrangler dev draaien.

Terminal 3 -- onderhoud

Gebruik voor:

Git;

plugin-build/install;

D1-commando's;

scripts;

accountbeheer.

Productie deployment

Vanuit:

cd "C:\Echoes of Prime\QuartzSetup"

Gebruik:

git status
git add .
git commit -m "Beschrijving"
git push

npx quartz build
npx wrangler deploy

Workerbindings horen te tonen:

env.DB      -> D1 prime-archives
env.ASSETS  -> built Quartz assets

Bij live Worker/API-problemen:

npx wrangler tail echoes-of-prime-lore

Dit is de voorkeurs-debuggingstap voor productie-runtimefouten.

PrimeOS

Belangrijk kernbestand:

C:\Echoes of Prime\QuartzSetup\quartz\components\prime\PrimeOS.tsx

PrimeOS bevat/integreert onder andere:

Navigation;

Messages;

Audio Archive;

Objectives;

PrimeAuth;

dashboard tiles.

PrimeOS is groot en actief gewijzigd. Altijd de actuele volledige file gebruiken voordat deze substantieel wordt aangepast.

PrimeAuth

Component:

C:\Echoes of Prime\QuartzSetup\quartz\components\prime\PrimeAuth.tsx

De login/accountstatus staat op het Archive Index-hoofdscherm in de rechter system-panel boven de device-info.

Uitgelogd:

OPERATIVE SESSION
NOT AUTHENTICATED
[ LOGIN ]

Ingelogde speler:

OPERATIVE AUTHENTICATED
Lumi
[ LOGOUT ]

Architect:

ARCHITECT CLEARANCE
The Architect
[ LOGOUT ]

De loginprompt is een gecentreerde modal boven de interface, niet een dropdown binnen de header.

PrimeAuth gebruikt de bestaande Worker-auth; er is geen tweede auth-systeem.

Na login/logout dispatcht de frontend:

prime-auth-changed

Andere client-features kunnen daarop hun user-state opnieuw ophalen.

Authentication

Worker-entry:

C:\Echoes of Prime\QuartzSetup\worker\index.ts

Auth endpoints:

POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

Er hoort geen publieke /api/auth/register te bestaan.

Accounts:

lumi       -> Lumi          -> player
clav       -> Clav          -> player
dakka      -> Dakka         -> player
venn       -> Venn          -> player
architect  -> The Architect -> architect

Session-cookie:

prime_session

Eigenschappen:

HttpOnly
Path=/
SameSite=Lax

Huidige sessieduur: 30 dagen.

Server bewaart alleen een hash van het session token.

Password hashing

Cloudflare Worker WebCrypto accepteerde in deze setup geen PBKDF2 iteration count boven 100000.

Known-good instellingen:

PBKDF2
SHA-256
100000 iterations
32-byte derived key
random salt

Worker en account/password-scripts moeten exact compatibel blijven.

Een mismatch kan leiden tot:

401 Invalid username or password

Accountbeheer

Password reset:

C:\Echoes of Prime\QuartzSetup\scripts\reset-password.mjs

Voorbeeld:

cd "C:\Echoes of Prime\QuartzSetup"
node ".\scripts\reset-password.mjs" venn

Reset wijzigt hash + salt en invalideert bestaande sessions. User-ID en note-ownership blijven bestaan.

Provisioning:

C:\Echoes of Prime\QuartzSetup\scripts\provision-users.mjs

Accounts worden vanaf nu in principe remote beheerd; lokale accounts zijn niet de operationele bron.

Nooit plaintext wachtwoorden in Git, permanente SQL, logs of documentatie zetten.

Squad Annotations

Pluginbron:

C:\Echoes of Prime\QuartzSetup\quartz\plugins\record-notes-plugin

Component:

C:\Echoes of Prime\QuartzSetup\quartz\plugins\record-notes-plugin\src\components\RecordNotes.tsx

Actief op:

npc
location
faction

De frontmatter-ID is de notes-sleutel:

NPC-006
LOC-005
FAC-001

Na pluginwijziging:

cd "C:\Echoes of Prime\QuartzSetup\quartz\plugins\record-notes-plugin"
npm run build

cd "C:\Echoes of Prime\QuartzSetup"
npx quartz plugin install --latest record-notes-plugin

Daarna Quartz opnieuw bouwen.

Er was eerder dubbele rendering doordat record-notes-plugin tweemaal in quartz.config.yaml stond. Dat is opgelost; bij herhaling eerst config controleren.

Notes API

GET    /api/notes
GET    /api/notes?record_id=<ID>
POST   /api/notes
DELETE /api/notes/<note-id>

POST gebruikt de authenticated session-user als auteur.

Ownership:

notes.user_id

Niet:

notes.author

Player:

notes lezen;

authenticated notes plaatsen;

alleen eigen authenticated notes verwijderen.

Architect:

notes lezen/plaatsen;

iedere note verwijderen.

Er zijn momenteel geen legacy annotations die nog gemigreerd hoeven te worden; de eerdere testnotitie is verwijderd.

Messages

Component:

C:\Echoes of Prime\QuartzSetup\quartz\components\prime\messages\messages.tsx

Messages blijven Markdown-driven voor inhoud en metadata.

Persoonlijke READ/UNREAD-state komt niet meer uit Markdown maar uit D1.

Oude unread: frontmatter mag nog in bestaande Markdown staan, maar de dynamische read-state hoort die niet te gebruiken. Dit kan later worden opgeschoond.

Content-statussen blijven onafhankelijk:

status: corrupted
priority: high

Een message kan dus bijvoorbeeld tegelijk:

UNREAD + CORRUPTED + PRIORITY

zijn.

Messages API

GET  /api/messages/read-state
POST /api/messages/MSG-xxx/read

GET /api/messages/read-state geeft voor de authenticated user de gelezen message IDs terug.

Een bericht is:

UNREAD = geen message_reads-row voor user + message
READ   = wel message_reads-row

Openen van een bericht markeert het als READ.

Read-state is persoonlijk per account.

D1 message_reads

Schema bevat conceptueel:

id
user_id
message_id
read_at

met unieke combinatie:

(user_id, message_id)

De schema/migration-file die hiervoor is gebruikt:

C:\Echoes of Prime\QuartzSetup\worker\message-reads-schema.sql

Alle production read receipts zijn bij introductie bewust leeggemaakt zodat alle spelers met een verse UNREAD-inbox begonnen.

Messages UI

Unread berichten zijn vóór openen visueel duidelijker door:

cyan accent/glow;

lichtere rij;

sterkere sender/subject;

UNREAD badge.

Na openen verdwijnt de unread-styling direct.

De reader toont daarnaast persoonlijke:

READ STATE

CORRUPTED en PRIORITY blijven aparte labels.

Na verandering van read-state dispatcht Messages:

prime-message-read-state-changed

Messages dashboard counter

De Messages-tegel op PrimeOS toont dynamisch:

Uitgelogd:

SIGN IN FOR STATUS

Ingelogd met unread messages:

03 UNREAD

of het werkelijke aantal.

Alles gelezen:

ALL READ

Wanneer de Worker/API niet beschikbaar is, bijvoorbeeld op de Quartz-only localhost:8080 preview:

STATUS OFFLINE

De teller wordt opnieuw berekend na:

login/logout;

message read-state wijziging;

Quartz navigation/render.

De known-good implementatie gebruikt een zelfstandige inline client-scriptlaag in PrimeOS. Een eerdere poging via alleen PrimeOS.afterDOMLoaded bleef op CHECKING... hangen en is vervangen.

D1 schema

notes bevat minimaal:

id
record_id
author
content
created_at
user_id

users bevat minimaal:

id
username
display_name
password_hash
password_salt
role
created_at

sessions bevat minimaal:

id
user_id
token_hash
expires_at
created_at

message_reads bevat minimaal:

id
user_id
message_id
read_at

Local versus remote D1

Lokaal:

npx wrangler d1 execute prime-archives --local --command="..."

Productie:

npx wrangler d1 execute prime-archives --remote --command="..."

Dit zijn verschillende databases.

Controleer altijd bewust --local versus --remote voordat een mutatie wordt uitgevoerd.

Op Windows/PowerShell kunnen multiline --command strings verkeerd aan Wrangler worden doorgegeven. Gebruik bij problemen één regel of een tijdelijke .sql file met --file.

Security invariants

Geen publieke /api/auth/register.

Browser bepaalt niet de note-auteur/owner.

Delete-permission wordt server-side gecontroleerd.

Player verwijdert alleen eigen notes.

Architect mag alle notes verwijderen.

Geen plaintext passwords in D1.

Geen raw session tokens in D1.

--remote alleen bewust gebruiken.

Geen wachtwoorden in chat, Git of logs.

Messages read-state is gekoppeld aan authenticated user_id, niet aan browserinput.

Contentstructuur

Publieke Markdown-content:

C:\Echoes of Prime\QuartzSetup\content

Belangrijke recordtypes:

NPC
Location
Faction
System
Message
Objective

Canonregels:

YAML-frontmatter;

bestaand canon-ID behouden;

geen DM-only geheimen/spoilers publiceren;

ontbrekende lore niet verzinnen;

Obsidian-wikilinks behouden;

imageLayout niet gokken als onduidelijk.

Canonical Wikilinks

Er is een custom canonical-wikilinks-plugin.

Tijdens setup stond de bron onder:

C:\Echoes of Prime\QuartzSetup\canonical-wikilinks-plugin\canonical-wikilinks

Bij problemen eerst het werkelijke pad en de actuele Quartz plugin-installatie controleren.

Bekende buildwarning

Er zijn bewust corrupted/placeholder Messages met ongeldige/placeholder datumwaarden, bijvoorbeeld ????.

De formatter kan daardoor invalid date warnings geven.

Dit is momenteel bewust en geen blocker. Niet automatisch "repareren" zonder eerst te controleren of het om zo'n corrupted message gaat.

Debuggingprocedure

1. Bepaal exact wat kapot is.
2. Bepaal de laag:
   Quartz / browser JS / plugin / Worker / API / D1 / routing.
3. Reproduceer klein.
4. Bekijk concrete output/log.
5. Wijzig één oorzaak.
6. Test opnieuw.

Als nieuwe Markdown wel als directe pagina bestaat maar niet in een data-driven app verschijnt:

stop Quartz;

start npx quartz build --serve --watch opnieuw;

hard refresh.

Voor live Worker/API-fouten:

npx wrangler tail echoes-of-prime-lore

Known-Good Milestone -- 2026-08-23

Prime Archives live                         ✓
Quartz build                                ✓
Cloudflare Worker                           ✓
D1 remote                                   ✓

Squad Annotations NPC                       ✓
Squad Annotations Locations                 ✓
Squad Annotations Factions                  ✓

Lumi / Clav / Dakka / Venn                  ✓
The Architect                               ✓
Server-side identity                        ✓
Player ownership/delete                     ✓
Architect delete-any                        ✓
Login/logout/session                        ✓
Production password reset                   ✓

Messages per-user READ/UNREAD               ✓
message_reads D1                            ✓
Unread visual state                         ✓
PrimeOS login/account panel                 ✓
PrimeOS Messages unread counter             ✓
Auth/read-state event synchronization       ✓

Als een toekomstige wijziging één van bovenstaande breekt, behandel dat als een regressie.

Volgende ideeën / parked

Niet automatisch uitvoeren; eerst met de gebruiker bepalen wat prioriteit heeft.

Objectives: nog bewust onbeslist wat dynamische/user-state daar precies moet betekenen.

Squad Annotations eventueel later naar Systems.

Annotation editing.

Klein Architect-adminpaneel.

Verdere accountbeheer-UX alleen indien nodig.

AUTH API UNAVAILABLE polish voor Quartz-only preview kan later; functioneel is 8080 bewust geen backendomgeving.

Guidance voor volgende ChatGPT-conversatie

Gebruik deze handoff als oriëntatie, maar de actuele repository files zijn source of truth voor code.

Vraag/gebruik bij grote wijzigingen de meest recente volledige file.

PrimeOS niet reconstrueren uit oude snippets.

Geef bij terminalcommando's altijd het volledige relevante cd-pad; de gebruiker werkt vaak met drie terminals tegelijk.

Zeg expliciet in welke terminal een commando hoort wanneer dat relevant is.

Verwar localhost:8080 niet met de volledige lokale omgeving.

Voor backendfeatures: beide processen draaien en testen op 127.0.0.1:8787.

Prefer complete replacement files voor substantiële codewijzigingen.

Houd wijzigingen klein en behoud working features.

Campaign Markdown blijft data-driven waar mogelijk.

Objectives niet zomaar herontwerpen zonder eerst de gewenste UX te bespreken.

Source of Truth

Campaign canon:

De campaign vault / actuele Markdown-records.

Application code:

De actuele repository files.

Handoff:

Dit document beschrijft de known-good architectuur en geleerde lessen, maar kan opnieuw verouderen.

Wanneer code en handoff verschillen, inspecteer de actuele code voordat het project wordt aangepast.