Prime Archives -- Chat Handoff / README

Handoff voor een nieuwe ChatGPT-conversatie. Doel: verder kunnen
werken zonder de huidige werkende architectuur opnieuw te
reconstrueren, regressies te veroorzaken of campaign-reveals
voortijdig te publiceren.

Last updated: 2026-08-25
Project: Prime Archives / Echoes of Prime
Current development firmware: 1.5
Important: lokale development state loopt momenteel vóór op
productie.

1. Current Known-Good State

Prime Archives is een Quartz v5-site voor de D&D-campaign Echoes of
Prime.

Projectroot:

C:\Echoes of Prime\QuartzSetup

Productie:

https://primearchives.nl

Stack:

Quartz v5

TypeScript / TSX

SCSS

Markdown / YAML frontmatter

Cloudflare Worker echoes-of-prime-lore

Cloudflare Assets

Cloudflare D1 prime-archives

Git

Windows / PowerShell

De website is zowel:

een praktisch spelersarchief;

een in-universe Prime Archives Terminal;

een storytelling device dat campaign-state kan weerspiegelen.

Huidige functionele baseline

Known-good functionaliteit omvat:

authenticated Squad Annotations op NPC-, Location- en
Faction-records;

accounts voor Lumi, Clav, Dakka, Venn en The Architect;

server-side note ownership en delete-permissions;

persoonlijke Messages READ/UNREAD-state per user in D1;

PrimeOS login/logout op het hoofdscherm;

dynamische user/clearance-weergave in PrimeOS;

Messages-tegel met persoonlijke unread-counter;

Messages houden CORRUPTED / PRIORITY los van persoonlijke
read-state;

Universe heeft een eigen Prime Archives-visuele presentatie;

Navigation ondersteunt lokaal meerdere cartographic datasets;

Frozen Lattice map is lokaal voorbereid;

tijdelijke Map Marker Debugger werkt voor het bepalen van
X/Y-coördinaten;

restricted faction access is lokaal werkend voor The Frequency;

Signal Lost campaign-state is lokaal voorbereid.

2. Zeer belangrijke production/development status

Productie is momenteel NIET gelijk aan alle lokale wijzigingen

Er zijn lokale wijzigingen die bewust nog niet naar productie gepusht
moeten worden omdat ze campaign-spoilers/reveals bevatten.

Met name:

Frozen Lattice navigation
Signal Lost campaign state

De Frozen Lattice wordt pas na de komende campaign-reveal ontdekt.

Niet automatisch git push uitvoeren na lokale commits.

Voor iedere push eerst controleren:

git status
git log --oneline -10

En expliciet bepalen of de commit campaign-content bevat die spelers nog
niet mogen zien.

Belangrijk deployment-principe

Een lokale commit is veilig als checkpoint.

git add .
git commit -m "Beschrijving"

Een git push kan productie beïnvloeden en moet daarom bewust gebeuren.

3. Belangrijkste werkregel

Behandel de actuele repository als de known-good source of truth.

Bij substantiële wijzigingen aan bestaande kernbestanden:

gebruik de actuele volledige source file;

reconstrueer grote bestanden niet uit geheugen of oude snippets;

behoud bestaande functionaliteit buiten de gevraagde wijziging;

geef bij voorkeur een complete replacement file terug;

diagnoseer eerst welke laag faalt voordat code wordt herschreven;

controleer bij grote bestanden dat een replacement logisch qua
omvang overeenkomt met de bron;

gebruik snapshots alleen om bestanden te vinden of historische
structuur te begrijpen, niet automatisch als actuele replacement.

Een groene Quartz-build bewijst niet automatisch dat Worker, browser-JS,
API, D1 of productie werken.

4. Lokale development stack

Voor de volledige lokale site zijn twee gelijktijdige processen
nodig.

Terminal 1 -- Quartz build/watch

cd "C:\Echoes of Prime\QuartzSetup"
npx quartz build --serve --watch

Quartz-preview:

http://localhost:8080

Gebruik 8080 alleen voor snelle:

contentcontrole;

layoutcontrole;

CSS;

Markdown;

statische componenten.

Belangrijk:

localhost:8080 = Quartz-only

Daar bestaan Worker-routes zoals:

/api/auth/*
/api/notes
/api/messages/*

niet als volledige backendomgeving.

Auth, annotations, persoonlijke Messages-state en andere
D1-functionaliteit hoeven daar dus niet te werken.

Terminal 2 -- Worker + lokale D1/API

cd "C:\Echoes of Prime\QuartzSetup"
npx wrangler dev

Volledige lokale Prime Archives:

http://127.0.0.1:8787

Gebruik altijd 8787 voor tests met:

login/logout;

sessions;

restricted records;

Squad Annotations;

Messages READ/UNREAD;

dashboard unread-counter;

Worker API;

lokale D1.

Als een feature backend/D1/auth gebruikt, moeten zowel Quartz watch als
Wrangler dev draaien.

Terminal 3 -- onderhoud

Gebruik voor:

Git;

plugin-build/install;

D1-commando's;

scripts;

accountbeheer;

debugging utilities.

5. Productie deployment

Vanuit:

cd "C:\Echoes of Prime\QuartzSetup"

Normale Git-flow:

git status
git add .
git commit -m "Beschrijving"
git push

Worker/build-flow waar nodig:

npx quartz build
npx wrangler deploy

Workerbindings horen te tonen:

env.DB      -> D1 prime-archives
env.ASSETS  -> built Quartz assets

Bij live Worker/API-problemen:

npx wrangler tail echoes-of-prime-lore

Dit is de voorkeurs-debuggingstap voor productie-runtimefouten.

Campaign reveal waarschuwing

Voor de eerstvolgende relevante deployment expliciet controleren of
Frozen Lattice zichtbaar mag worden.

Niet aannemen dat alle lokaal werkende features meteen live mogen.

6. PrimeOS

Belangrijk kernbestand:

C:\Echoes of Prime\QuartzSetup\quartz\components\Prime\PrimeOS.tsx

Let op: mapnaam/casing kan lokaal Prime zijn. Gebruik het werkelijke
repositorypad.

PrimeOS bevat/integreert onder andere:

Navigation;

Messages;

Audio Archive;

Objectives;

Universe;

PrimeAuth;

dashboard tiles;

campaign-state UI.

PrimeOS is groot en actief gewijzigd. Altijd de actuele volledige file
gebruiken voordat deze substantieel wordt aangepast.

De actuele multi-map/Signal Lost developmentversie was ongeveer 1720
regels. Een klein regelverschil ten opzichte van een vorige versie kan
verklaarbaar zijn door imports/refactors; controleer inhoud, niet alleen
regelcount.

Firmware

Firmware wordt bewust gebruikt als:

in-universe knipoog voor spelers;

eenvoudige zichtbare versie-indicator voor ontwikkeling.

Huidige development firmware:

1.5

Bij zichtbare/structurele site-updates mag firmware worden verhoogd.

Niet willekeurig terugzetten naar 1.0 bij het vervangen van PrimeOS.

7. PrimeAuth

Component:

C:\Echoes of Prime\QuartzSetup\quartz\components\Prime\PrimeAuth.tsx

De login/accountstatus staat op het Archive Index-hoofdscherm in de
rechter system-panel boven de device-info.

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

De loginprompt is een gecentreerde modal boven de interface, niet een
dropdown binnen de header.

PrimeAuth gebruikt de bestaande Worker-auth; er is geen tweede
auth-systeem.

Na login/logout dispatcht de frontend:

prime-auth-changed

Andere client-features kunnen daarop hun user-state opnieuw ophalen.

8. Authentication

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

9. Password hashing

Cloudflare Worker WebCrypto accepteerde in deze setup geen PBKDF2
iteration count boven 100000.

Known-good instellingen:

PBKDF2
SHA-256
100000 iterations
32-byte derived key
random salt

Worker en account/password-scripts moeten exact compatibel blijven.

De eerdere fout was:

NotSupportedError: Pbkdf2 failed: iteration counts above 100000 are not supported

Een hash mismatch kan leiden tot:

401 Invalid username or password

Niet teruggaan naar 210000 zonder de Cloudflare-runtimecompatibiliteit
opnieuw te controleren.

10. Accountbeheer

Password reset:

C:\Echoes of Prime\QuartzSetup\scripts\reset-password.mjs

Voorbeeld:

cd "C:\Echoes of Prime\QuartzSetup"
node ".\scripts\reset-password.mjs" venn

Reset wijzigt hash + salt en invalideert bestaande sessions. User-ID en
note-ownership blijven bestaan.

Provisioning:

C:\Echoes of Prime\QuartzSetup\scripts\provision-users.mjs

Accounts worden operationeel remote beheerd; lokale accounts zijn niet
de bron voor productie.

Nooit plaintext wachtwoorden in Git, permanente SQL, logs of
documentatie zetten.

11. Squad Annotations

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

Zeer belangrijk: type moet exact kloppen

Een concreet opgelost probleem:

Dr. Orren had:

type: npc vendor

Daardoor verscheen Squad Annotations niet.

Correct:

type: npc

Als extra categorisatie nodig is, gebruik liever een apart veld zoals:

subtype: vendor

in plaats van meerdere betekenissen in type te stoppen.

Plugin rebuild

Na pluginwijziging:

cd "C:\Echoes of Prime\QuartzSetup\quartz\plugins\record-notes-plugin"
npm run build

cd "C:\Echoes of Prime\QuartzSetup"
npx quartz plugin install --latest record-notes-plugin

Daarna Quartz opnieuw bouwen.

Er was eerder dubbele rendering doordat record-notes-plugin tweemaal
in quartz.config.yaml stond. Dat is opgelost; bij herhaling eerst
config controleren.

Notes API

GET    /api/notes
GET    /api/notes?record_id=<ID>
POST   /api/notes
DELETE /api/notes/<note-id>

POST gebruikt de authenticated session-user als auteur.

Ownership:

notes.user_id

Niet vertrouwen op client-side notes.author voor permissions.

Player:

notes lezen;

authenticated notes plaatsen;

alleen eigen authenticated notes verwijderen.

Architect:

notes lezen/plaatsen;

iedere note verwijderen.

Er zijn momenteel geen legacy annotations die nog gemigreerd hoeven te
worden.

12. Messages

Component:

C:\Echoes of Prime\QuartzSetup\quartz\components\Prime\messages\messages.tsx

Messages blijven Markdown-driven voor inhoud en metadata.

Persoonlijke READ/UNREAD-state komt niet meer uit Markdown maar uit
D1.

Oude unread: frontmatter kan nog in bestaande Markdown staan, maar
hoort niet de persoonlijke dynamische state te bepalen.

Content-statussen blijven onafhankelijk:

status: corrupted
priority: high

Een message kan tegelijk zijn:

UNREAD + CORRUPTED + PRIORITY

Messages API

GET  /api/messages/read-state
POST /api/messages/MSG-xxx/read

GET /api/messages/read-state geeft voor de authenticated user de
gelezen message IDs terug.

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

Schema/migration-file:

C:\Echoes of Prime\QuartzSetup\worker\message-reads-schema.sql

Alle production read receipts zijn bij introductie bewust leeggemaakt
zodat alle spelers met een verse UNREAD-inbox begonnen.

Messages UI

Unread berichten zijn vóór openen visueel duidelijker door:

cyan accent/glow;

lichtere rij;

sterkere sender/subject;

UNREAD badge.

Na openen verdwijnt unread-styling direct.

De reader toont daarnaast persoonlijke:

READ STATE

CORRUPTED en PRIORITY blijven aparte labels.

Na verandering van read-state dispatcht Messages:

prime-message-read-state-changed

13. Messages dashboard counter

De Messages-tegel op PrimeOS toont dynamisch:

Uitgelogd:

SIGN IN FOR STATUS

Ingelogd met unread messages:

03 UNREAD

of het werkelijke aantal.

Alles gelezen:

ALL READ

Wanneer Worker/API niet beschikbaar is, bijvoorbeeld op Quartz-only
localhost:8080:

STATUS OFFLINE

De teller wordt opnieuw berekend na:

login/logout;

message read-state wijziging;

Quartz navigation/render.

Known-good implementatie gebruikt een zelfstandige inline
client-scriptlaag in PrimeOS. Een eerdere poging via alleen
PrimeOS.afterDOMLoaded bleef op CHECKING... hangen en is vervangen.

14. Universe

Universe is inmiddels visueel uitgebreid en niet langer alleen een
generieke lege folderpagina.

Belangrijk conceptueel onderscheid:

Aetherium Prime is een planeet;

Aetherium Prime is niet de naam van de volledige reality/plane of
existence;

de plane of existence heeft nog geen definitieve canonieke naam;

spelers kunnen later andere planes/universes tegenkomen.

Gebruik daarom Known Reality niet alsof dit synoniem is met
Aetherium Prime.

Universe zal waarschijnlijk relatief weinig content hebben, maar mag
visueel als hoog-niveau archiefmodule functioneren.

15. Objectives

Objectives zijn Markdown-driven.

Bestaande states:

active
ongoing
passed
failed

De huidige Objective UI kan onder andere werken met:

title: ...
id: OBJ-###
type: objective
status: active
priority: main
location: ...
issuer: ...
description: ...
objectiveDate: ...
published: true

Optioneel na afronding:

outcome: ...

Belangrijk:

objective records worden door de gebruiker zelf aangemaakt;

niet automatisch het Objective-systeem herontwerpen;

dynamic/user-specific objective-state is nog bewust onbeslist;

published: false kan gebruikt worden voor content die nog niet
player-facing hoort te zijn.

16. Navigation -- multi-map architecture

Navigation is uitgebreid van één Virex-9 map naar een multi-map
structuur.

Belangrijke bestanden:

C:\Echoes of Prime\QuartzSetup\quartz\components\Prime\navigation\navigation.tsx
C:\Echoes of Prime\QuartzSetup\quartz\components\Prime\navigation\map.tsx
C:\Echoes of Prime\QuartzSetup\quartz\components\Prime\navigation\maps\virex9.ts
C:\Echoes of Prime\QuartzSetup\quartz\components\Prime\navigation\maps\frozenlattice.ts

Navigation gebruikt Markdown navigation-map records als data.

Virex-9

Bestaande map blijft map 1.

Conceptueel record:

type: navigation-map
mapId: virex-9
mapName: Virex-9
background: ...
locations: ...

Frozen Lattice

Map 2 heet:

Frozen Lattice

Afbeelding:

C:\Echoes of Prime\QuartzSetup\content\static\maps\frozenlattice.webp

Website path:

/static/maps/frozenlattice.webp

Navigation record:

NAV-002 Frozen Lattice.md

Preferred basis:

---
title: Frozen Lattice Navigation
id: NAV-002
type: navigation-map
mapId: frozen-lattice
mapName: Frozen Lattice
description: Local navigation data recovered from an unknown frozen region.
background: /static/maps/frozenlattice.webp
published: true
unlisted: true

locations: []
---

Map selector

De developmentversie heeft conceptueel:

CARTOGRAPHIC DATASET

[ VIREX-9 ] [ FROZEN LATTICE ]

Per-map destination storage

De navigation destination moet per map opgeslagen worden.

Gebruik conceptueel:

prime-navigation-destination-${map.id}

Niet één globale key voor alle maps.

Anders kunnen destinations van Virex-9 en Frozen Lattice botsen.

17. Frozen Lattice reveal status

Frozen Lattice is campaign-sensitive content.

De spelers horen deze map pas na de komende reveal/teleport te
ontdekken.

Daarom:

lokaal mag de map bestaan;

lokaal mag de selector bestaan;

niet automatisch naar productie pushen;

vóór live deployment eerst beslissen hoe PrimeOS zich tijdens de
Signal Lost-state moet gedragen.

Er is nog geen definitieve UX-beslissing genomen over de combinatie:

PrimeOS SIGNAL LOST
+
Frozen Lattice beschikbaar

Een eerder besproken idee met OPEN OFFLINE NAVIGATION is niet
definitief gekozen.

Niet automatisch implementeren zonder dit opnieuw met de gebruiker af te
stemmen.

18. Map Marker Debugger

Omdat handmatig X/Y-coördinaten gokken onpraktisch was, is een
tijdelijke debugger toegevoegd aan map.tsx.

Switch:

const MAP_DEBUG = true

Wanneer actief:

klik op de kaart;

debugger berekent percentage-coördinaten ten opzichte van de
daadwerkelijke kaartafbeelding;

X/Y verschijnen in een debugpanel;

YAML wordt direct getoond;

een crosshair markeert de aangeklikte positie.

Voorbeeld:

x: 63.42
y: 27.18

De eerste debugger-versie luisterde op de <img> en werkte niet goed
omdat een overlay clicks onderschepte.

De fixed known-good versie luistert op de map viewport in capture-mode
en berekent alsnog relatief aan de afbeelding.

Als markerplaatsing klaar is:

const MAP_DEBUG = false

De debugcode mag blijven zitten voor toekomstige maps zolang hij
uitgeschakeld is in player-facing builds.

19. Signal Lost campaign state

Er is een werkende full-screen Signal Lost mode voorbereid in PrimeOS.

Campaign switch:

const PRIME_SIGNAL_LOST = true

Bij true wordt de normale PrimeOS UI vervangen door een in-universe
foutscherm.

Belangrijke tekst/state:

SIGNAL LOST
ARCHIVE NETWORK UNREACHABLE

LAST KNOWN RELAY     VIREX-9
ARCHIVE UPLINK       LOST
POSITIONAL DATA      UNKNOWN
LOCAL CACHE          DEGRADED
TIME SYNC             FAILED
ENVIRONMENTAL FEED   NO CARRIER

ATTEMPTING RECONNECTION

Doel:

gebruiken rond de teleport naar Frozen Lattice;

website als storytelling device laten reageren op campaign-state.

Belangrijk:

deze state verandert geen D1/auth/messages data;

normale PrimeOS-code blijft aanwezig onder de early return;

false herstelt normale rendering;

directe record-URLs zijn hiermee niet automatisch geblokkeerd;

definitieve combinatie met Frozen Lattice Navigation is nog niet
gekozen.

Niet live zetten vóór het juiste campaignmoment.

20. Archive Registry

Belangrijk bestand:

C:\Echoes of Prime\QuartzSetup\quartz\components\Prime\ArchiveRegistry.tsx

Deze component beheert onder andere registry/list-weergaven voor:

Personnel;

Locations;

Factions.

De actuele versie bevat regionale Personnel/Locations-logica én faction
dossier-cards.

Bij wijzigingen altijd de actuele file gebruiken; oudere snapshots
missen latere registry-functionaliteit.

21. Restricted faction access

Er is lokaal een eerste user-restricted lore-systeem gebouwd voor:

The Frequency

Gewenste toegang:

architect  -> zichtbaar/toegankelijk
lumi       -> zichtbaar/toegankelijk
clav       -> verborgen
venn       -> verborgen
dakka      -> verborgen
logged out -> verborgen

Preferred YAML

Voor restricted faction records:

---
title: The Frequency
id: FAC-???
type: faction
classification: Unknown Collective
scope: Unknown
description: <korte player-facing omschrijving>
image: /static/factions/the-frequency.webp
imageLayout: wide
visibility: restricted
allowedUsers:
  - architect
  - lumi
reputationSystem: false
published: true
---

Optioneel:

theme:
  primary: "#HEXCODE"
  secondary: "#HEXCODE"
  accent: "#HEXCODE"

aliases:
  - The Frequency

Gebruik een werkelijk vrij faction-ID; FAC-??? is alleen placeholder.

Bestandsnaam / route

De Worker-policy is momenteel gekoppeld aan:

/04-factions/the-frequency

Daarom moet de slug daarmee overeenkomen.

Praktische bestandsnaam:

The Frequency.md

onder:

content\04-factions\

Registry behavior

Restricted faction cards:

starten hidden;

/api/auth/me bepaalt de ingelogde username;

card wordt alleen zichtbaar wanneer username in allowedUsers
staat;

zichtbare record-counter wordt opnieuw berekend.

Belangrijke CSS-fix

De eerste implementatie zette HTML hidden, maar faction card CSS had
expliciet display: flex.

Daardoor kon de kaart alsnog zichtbaar zijn.

Known-good fix:

.prime-registry-card[data-archive-visibility="restricted"][hidden] {
  display: none !important;
}

Belangrijke JS syntax-fix

Binnen een bestaande dangerouslySetInnerHTML template literal mag niet
zonder escaping opnieuw een nested JS template literal worden gebruikt.

De fout was conceptueel:

count.textContent = `${visibleCards.length} ...`

binnen een andere backtick-string.

Known-good variant gebruikt gewone concatenatie:

count.textContent =
  visibleCards.length +
  ' ' +
  (visibleCards.length === 1 ? 'RECORD' : 'RECORDS')

FactionRecord

Belangrijk bestand:

C:\Echoes of Prime\QuartzSetup\quartz\components\Prime\FactionRecord.tsx

ARCHIVE STATUS hoort dynamisch te tonen:

PUBLIC DOSSIER

of:

RESTRICTED DOSSIER

op basis van:

visibility: restricted

Worker protection

De Worker gebruikt de bestaande prime_session en getSessionUser().

Directe toegang tot de restricted route wordt server-side gecontroleerd.

Niet-geautoriseerde users krijgen bewust:

404 Not Found

in plaats van een opvallende melding dat er een geheim record bestaat.

Security nuance / open controle

De normale UI en directe pagina-route zijn beschermd, maar Quartz
verwerkt Markdown statisch tijdens build.

Nog te controleren:

Kan restricted faction content via Quartz search/index of gegenereerde
index-data lekken?

Behandel The Frequency pas als volledig lekvrij nadat dit gecontroleerd
is.

22. Faction record preferred frontmatter

Voor normale publieke faction records:

---
title: <Faction Name>
id: FAC-###
type: faction
classification: <classification>
scope: <scope>
description: <korte player-facing omschrijving>
image: <image path>
imageLayout: wide
reputationSystem: false
published: true
---

Restricted variant voegt toe:

visibility: restricted
allowedUsers:
  - <username>

Niet proberen restriction te simuleren met alleen CSS.

23. Personnel frontmatter

Publieke NPC-records gebruiken minimaal conceptueel:

---
title: <NPC Name>
id: NPC-###
type: npc
species: <species>
role: <role>
location: <location>
archiveRegion: <region>
aliases:
  - <name variant>
---

Voor Virex-9 NPCs:

archiveRegion: Virex-9

aliases is een YAML-lijst.

Gebruik archiveRegion voor registry/navigation grouping.

Gebruik type: npc exact als Squad Annotations beschikbaar moeten zijn.

24. Locations / regional registry

Personnel en Locations gebruiken regionale grouping in de actuele
ArchiveRegistry.

Daarom niet terugvallen op oudere ArchiveRegistry snapshots die alleen
generieke cards bevatten.

archiveRegion is een belangrijk grouping-veld.

Wanneer een nieuwe regio zoals Frozen Lattice player-facing wordt, kan
dezelfde regionale aanpak worden hergebruikt waar passend.

25. D1 schema

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

26. Local versus remote D1

Lokaal:

npx wrangler d1 execute prime-archives --local --command="..."

Productie:

npx wrangler d1 execute prime-archives --remote --command="..."

Dit zijn verschillende databases.

Controleer altijd bewust --local versus --remote voordat een mutatie
wordt uitgevoerd.

Op Windows/PowerShell kunnen multiline --command strings verkeerd aan
Wrangler worden doorgegeven.

Bij problemen:

gebruik één regel;

of maak een tijdelijke .sql file en gebruik --file.

27. Security invariants

Geen publieke /api/auth/register.

Browser bepaalt niet de note-auteur/owner.

Delete-permission wordt server-side gecontroleerd.

Player verwijdert alleen eigen notes.

Architect mag alle notes verwijderen.

Geen plaintext passwords in D1.

Geen raw session tokens in D1.

--remote alleen bewust gebruiken.

Geen wachtwoorden in chat, Git of logs.

Messages read-state is gekoppeld aan authenticated user_id, niet
aan browserinput.

Restricted content niet beveiligen met alleen CSS.

Directe restricted routes server-side controleren.

Search/index leakage voor restricted Markdown apart controleren.

Campaign-spoilers niet automatisch deployen omdat de lokale build
groen is.

28. Contentstructuur

Publieke Markdown-content:

C:\Echoes of Prime\QuartzSetup\content

Belangrijke recordtypes:

NPC
Location
Faction
System
Message
Objective
Navigation Map
Universe

Canonregels:

YAML-frontmatter;

bestaand canon-ID behouden;

geen DM-only geheimen/spoilers publiceren;

ontbrekende lore niet verzinnen;

Obsidian-wikilinks behouden;

imageLayout niet gokken als onduidelijk;

record type exact houden;

campaign-state en deployment-state uit elkaar houden.

29. Canonical Wikilinks

Er is een custom canonical-wikilinks-plugin.

Tijdens setup stond de bron onder:

C:\Echoes of Prime\QuartzSetup\canonical-wikilinks-plugin\canonical-wikilinks

Bij problemen eerst het werkelijke pad en de actuele Quartz
plugin-installatie controleren.

30. Bekende buildwarning

Er zijn bewust corrupted/placeholder Messages met ongeldige/placeholder
datumwaarden, bijvoorbeeld:

????

De formatter kan daardoor invalid date warnings geven.

Dit is momenteel bewust en geen blocker.

Niet automatisch "repareren" zonder eerst te controleren of het om zo'n
corrupted message gaat.

31. Debuggingprocedure

1. Bepaal exact wat kapot is.
2. Bepaal de laag:
   Quartz / browser JS / plugin / Worker / API / D1 / routing.
3. Reproduceer klein.
4. Bekijk concrete output/log.
5. Wijzig één oorzaak.
6. Test opnieuw.
7. Controleer regressies in bestaande features.

Nieuwe Markdown verschijnt niet in data-driven UI

Als een nieuwe Markdown-file wel als directe pagina bestaat maar niet in
een data-driven app verschijnt:

stop Quartz;

start npx quartz build --serve --watch opnieuw;

hard refresh.

Live Worker/API-fouten

npx wrangler tail echoes-of-prime-lore

Auth/backend lokaal testen

Niet op:

localhost:8080

maar op:

127.0.0.1:8787

met beide dev-processen actief.

32. Bekende regressielessen

Grote replacement files

Er is eerder regressie ontstaan doordat grote bestanden werden
overschreven met een oudere of onvolledige variant.

Daarom:

altijd actuele volledige file gebruiken;

relevante imports en bestaande modules vergelijken;

firmware als extra sanity check gebruiken;

bij onverwacht groot regelverschil eerst diffen.

ArchiveRegistry

De snapshot bevat oudere ArchiveRegistry-iteraties.

Gebruik voor wijzigingen altijd de actuele lokale versie met:

regionale Personnel/Locations;

huidige faction cards;

restricted faction additions.

PrimeOS

PrimeOS niet reconstrueren uit oudere screenshots/snippets.

Inline scripts

Let op nested backticks/template literals binnen
dangerouslySetInnerHTML.

HTML hidden

Een CSS-regel zoals display: flex kan browser [hidden] effectief
overrulen.

Gebruik bij security-sensitive visibility expliciete CSS zoals:

[hidden] {
  display: none !important;
}

op de specifieke restricted selector.

33. Known-Good Milestone -- 2026-08-25 local development

Prime Archives production baseline            ✓
Quartz build                                  ✓
Cloudflare Worker                             ✓
D1 remote                                     ✓

Squad Annotations NPC                         ✓
Squad Annotations Locations                   ✓
Squad Annotations Factions                    ✓

Lumi / Clav / Dakka / Venn                    ✓
The Architect                                 ✓
Server-side identity                          ✓
Player ownership/delete                       ✓
Architect delete-any                          ✓
Login/logout/session                          ✓
Production password reset                     ✓

Messages per-user READ/UNREAD                 ✓
message_reads D1                              ✓
Unread visual state                           ✓
PrimeOS login/account panel                   ✓
PrimeOS Messages unread counter               ✓
Auth/read-state event synchronization         ✓

Universe presentation                         ✓
Firmware development state 1.5                ✓

Navigation Virex-9                            ✓
Navigation multi-map architecture             ✓ local
Frozen Lattice map                            ✓ local / NOT YET REVEALED
Map Marker Debugger                           ✓ local

Signal Lost screen                            ✓ local / campaign gated

Restricted faction registry visibility        ✓ local
Restricted faction direct-route Worker guard  ✓ local
The Frequency Architect/Lumi access            ✓ local
The Frequency hidden for others               ✓ local
Search/index leakage audit                    OPEN

Als een toekomstige wijziging één van de bestaande ✓ features breekt,
behandel dat als een regressie.

34. Current open work / next decisions

Niet automatisch uitvoeren; eerst met de gebruiker bepalen wat
prioriteit heeft.

Hoogste prioriteit / actief

Frozen Lattice map markers/content verder invullen.

Map Debugger na markerwerk weer op MAP_DEBUG = false zetten.

Beslissen hoe Frozen Lattice Navigation en Signal Lost in-world
samen moeten werken.

Beslissen exact wanneer Frozen Lattice naar productie mag.

Restricted faction search/index leakage controleren.

The Frequency inhoudelijk als faction record vullen indien nog niet
afgerond.

Parked / later

Objectives: nog bewust onbeslist wat dynamische/user-state precies
moet betekenen.

Squad Annotations eventueel later naar Systems.

Annotation editing.

Klein Architect-adminpaneel.

Verdere accountbeheer-UX alleen indien nodig.

AUTH API UNAVAILABLE polish voor Quartz-only preview.

Generiek restricted-record systeem uitbreiden naar andere
recordtypes wanneer daar concrete behoefte aan is.

35. Campaign-sensitive technical state

Voor Frozen Lattice reveal

Productie hoort Frozen Lattice nog niet te verraden.

Rond teleport/reveal

Signal Lost is bedoeld als theatrale campaign-state, maar de precieze UX
is nog niet definitief.

Niet automatisch kiezen tussen:

alles offline

of:

Signal Lost + lokale/offline Frozen Lattice navigation

De gebruiker vond de eerste voorgestelde combinatie nog niet mooi genoeg
en wil hier later op terugkomen.

Na herstel verbinding

Waarschijnlijk wordt Frozen Lattice uiteindelijk een permanente tweede
cartographic dataset naast Virex-9, maar de exacte reveal-flow blijft
campaign design.

36. Guidance voor volgende ChatGPT-conversatie

Gebruik deze handoff als oriëntatie, maar de actuele repository
files zijn source of truth voor code.

Vraag/gebruik bij grote wijzigingen de meest recente volledige file.

Gebruik Files/Library of de build snapshot om onbekende bestanden te
vinden wanneer nodig.

Gebruik een snapshot niet automatisch als replacement wanneer er
sindsdien lokaal wijzigingen zijn gedaan.

PrimeOS niet reconstrueren uit oude snippets.

ArchiveRegistry niet reconstrueren uit oudere snapshotversies.

Geef bij terminalcommando's altijd het volledige relevante cd-pad.

Zeg expliciet in welke terminal een commando hoort wanneer dat
relevant is.

Verwar localhost:8080 niet met de volledige lokale omgeving.

Voor backendfeatures: beide processen draaien en testen op
127.0.0.1:8787.

Prefer complete replacement files voor substantiële codewijzigingen.

Houd wijzigingen klein en behoud working features.

Campaign Markdown blijft data-driven waar mogelijk.

Objectives niet zomaar herontwerpen zonder eerst de gewenste UX te
bespreken.

Restricted content moet server-side worden beschermd waar directe
toegang mogelijk is.

Controleer search/index leakage voordat restricted Markdown als
volledig geheim wordt beschouwd.

Vraag vóór git push of lokale campaign-sensitive content al live
mag.

Frozen Lattice is momenteel campaign-sensitive.

Signal Lost is campaign-sensitive.

Firmware is een bewuste version/checkpoint-indicator.

type frontmatter moet exact zijn; voeg extra categorisatie via
aparte velden toe.

Map Marker Debugger is tijdelijke development tooling en hoort uit
te staan voor spelers.

37. Source of Truth

Campaign canon:

De campaign vault / actuele Markdown-records.

Application code:

De actuele repository files.

Production state:

De daadwerkelijk gedeployde Cloudflare/Prime Archives-versie.

Local development state:

Kan bewust vóórlopen op productie en campaign-spoilers bevatten.

Handoff:

Dit document beschrijft de known-good architectuur, development state
en geleerde lessen, maar kan opnieuw verouderen.

Wanneer code en handoff verschillen, inspecteer de actuele code voordat
het project wordt aangepast.

38. Quick start voor een nieuwe chat

Als een nieuwe ChatGPT-conversatie dit document krijgt, begin dan met
deze aannames:

1. Repository is source of truth.
2. PrimeOS is groot: nooit uit geheugen reconstrueren.
3. localhost:8080 = Quartz-only.
4. 127.0.0.1:8787 = Worker/auth/D1 testomgeving.
5. Production en local development lopen momenteel niet volledig gelijk.
6. Frozen Lattice mag niet automatisch gepusht worden.
7. Firmware development state = 1.5.
8. The Frequency gebruikt restricted access voor architect + lumi.
9. Restricted search/index leakage moet nog worden gecontroleerd.
10. MAP_DEBUG moet uiteindelijk weer false.
11. Signal Lost reveal-flow is nog niet definitief ontworpen.
12. Vraag bij twijfel om de actuele volledige source file.

Dit is de huidige technische handoff voor Prime Archives.