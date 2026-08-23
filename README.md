Prime Archives -- Chat Handoff / README

Handoff voor een nieuwe ChatGPT-conversatie. Doel: verder kunnen
werken zonder de huidige werkende architectuur opnieuw te
reconstrueren.

Current Known-Good State

Prime Archives is een Quartz v5-site voor de D&D-campaign Echoes of
Prime.

Projectroot:

C:\Echoes of Prime\QuartzSetup

Productie:

https://primearchives.nl

Stack:

Quartz v5

Cloudflare Worker echoes-of-prime-lore

Cloudflare Assets

Cloudflare D1 prime-archives

Git voor versiebeheer

De huidige productie-baseline heeft authenticated Squad Annotations
op NPC-, Location- en Faction-records.

Werkregel voor toekomstige wijzigingen

Behandel de huidige staat als known-good baseline.

Geen lukrake patches verspreid over bestanden. Wanneer een kernbestand
substantieel wordt gewijzigd en de actuele inhoud bekend is, geef bij
voorkeur de volledige vervangende file terug en behoud bestaande
functionaliteit buiten de gevraagde wijziging.

Na infrastructuurwijzigingen: lokaal testen → concrete fout/log bekijken
→ één oorzaak wijzigen → opnieuw testen → stabiele mijlpaal committen.

Een groene build bewijst niet automatisch dat plugin-installatie,
Worker-runtime, API, D1 of productie correct functioneren.

Lokale stack

Quartz:

cd "C:\Echoes of Prime\QuartzSetup"
npx quartz build --serve --watch

http://localhost:8080

Worker/API/D1:

cd "C:\Echoes of Prime\QuartzSetup"
npx wrangler dev

http://127.0.0.1:8787

Gebruik 8787 voor auth, annotations, API en lokale D1.

Een derde terminal wordt gebruikt voor plugin-builds, Git, scripts en
D1-onderhoud.

Production deployment

cd "C:\Echoes of Prime\QuartzSetup"
npx quartz build
npx wrangler deploy

Workerbindings:

env.DB      -> D1 prime-archives
env.ASSETS  -> built Quartz assets

Bij runtimeproblemen:

npx wrangler tail echoes-of-prime-lore

Dit is de eerste debuggingstap voor live Worker/API-fouten.

Squad Annotations

Pluginbron:

C:\Echoes of Prime\QuartzSetup\quartz\plugins\record-notes-plugin

Component:

C:\Echoes of Prime\QuartzSetup\quartz\plugins\record-notes-plugin\src\components\RecordNotes.tsx

Ondersteunde recordtypes:

npc
location
faction

Record-ID is de notes-sleutel, bijvoorbeeld NPC-006, LOC-005,
FAC-001.

Na pluginwijziging:

cd "C:\Echoes of Prime\QuartzSetup\quartz\plugins\record-notes-plugin"
npm run build

cd "C:\Echoes of Prime\QuartzSetup"
npx quartz plugin install --latest record-notes-plugin

Daarna Quartz opnieuw bouwen.

Er was eerder dubbele rendering doordat record-notes-plugin tweemaal
in quartz.config.yaml stond. Dat is opgelost; bij herhaling eerst
config controleren.

Worker/API

Worker-entry:

C:\Echoes of Prime\QuartzSetup\worker\index.ts

De Worker behandelt API-routes en stuurt overige requests door naar
env.ASSETS.fetch(request).

Auth:

POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

Geen publieke /api/auth/register.

Notes:

GET    /api/notes
GET    /api/notes?record_id=<ID>
POST   /api/notes
DELETE /api/notes/<note-id>

POST gebruikt de authenticated session-user als auteur. Browserinput mag
ownership niet bepalen.

Users en permissions

lumi       -> Lumi          -> player
clav       -> Clav          -> player
dakka      -> Dakka         -> player
venn       -> Venn          -> player
architect  -> The Architect -> architect

Player:

notes lezen

authenticated note plaatsen

alleen eigen authenticated notes verwijderen

Architect:

notes lezen/plaatsen

iedere note verwijderen

Ownership is notes.user_id, niet notes.author.

Legacy notes van vóór auth kunnen een auteursnaam hebben maar
user_id = NULL.

Sessions

Cookie:

prime_session

Eigenschappen:

HttpOnly
Path=/
SameSite=Lax

Server bewaart een hash van het token. Huidige sessieduur: 30 dagen.

Password hashing

Known production constraint: Cloudflare Worker WebCrypto weigerde PBKDF2
boven 100000 iterations.

Huidige werkende instellingen:

PBKDF2
SHA-256
100000 iterations
32-byte derived key
random salt

Deze instellingen moeten gelijk blijven in Worker en
user/password-scripts. Mismatch geeft
401 Invalid username or password.

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

Local versus remote D1

npx wrangler d1 execute prime-archives --local --command="..."

versus:

npx wrangler d1 execute prime-archives --remote --command="..."

Dit zijn verschillende databases. Controleer de vlag vóór iedere
mutatie.

Accountbeheer

Password reset:

C:\Echoes of Prime\QuartzSetup\scripts\reset-password.mjs

Voorbeeld:

node ".\scripts\reset-password.mjs" venn

De reset wijzigt hash + salt en invalideert bestaande sessions; user-ID
en note-ownership blijven bestaan.

Provisioning:

C:\Echoes of Prime\QuartzSetup\scripts\provision-users.mjs

Plaintext wachtwoorden horen niet in Git/permanente SQL terecht te
komen.

Security invariants

Geen publieke /api/auth/register.

Browser bepaalt niet de auteur/owner.

Delete-permission wordt server-side gecontroleerd.

Player verwijdert alleen eigen user_id.

Architect mag alle notes verwijderen.

Geen plaintext passwords in D1.

Geen raw session tokens in D1.

--remote alleen bewust gebruiken.

Geen wachtwoorden in chat, Git of logs.

Canonical Wikilinks

Er is een custom lokale canonical-wikilinks-plugin. Tijdens setup stond
de bron onder:

C:\Echoes of Prime\QuartzSetup\canonical-wikilinks-plugin\canonical-wikilinks

Bij problemen eerst het werkelijke pad en de Quartz plugin-installatie
controleren; niet aannemen dat de bron onder
quartz/plugins/canonical-wikilinks staat.

Contentstructuur

Publieke Markdown-content staat onder:

content/

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

Navigation / maps / messages

Locations:

quartz/components/prime/navigation/locations.ts

Maps:

content/static/maps/
quartz/components/prime/navigation/maps/

Messages:

quartz/components/prime/messages/messages.ts

Bekende housekeeping

Tijdens builds zijn waarschuwingen gezien:

found invalid date "false"

bij enkele faction/message-records. Niet blocker, wel opruimen zodat
echte toekomstige warnings zichtbaar blijven.

Verder op de lijst:

oude/lege Record Notes-resten controleren;

tijdelijke provisioningbestanden/.gitignore controleren;

canonical-wikilinks werking controleren;

reset-password.mjs eventueel expliciete --local/--remote optie
geven.

Mogelijke volgende features

Squad Annotations eventueel naar Systems.

Bewust beslissen over Objectives.

Annotation editing.

Centrale login/accountstatus in header/PrimeOS.

Klein Architect-adminpaneel.

Legacy annotations eventueel koppelen aan echte users.

Geen hiervan is nodig voor de huidige baseline.

Debuggingprocedure

1. Bepaal exact wat kapot is.
2. Bepaal de laag: Quartz / plugin / browser JS / Worker / D1 / routing.
3. Reproduceer klein.
4. Bekijk concrete output/log.
5. Wijzig één oorzaak.
6. Test opnieuw.

Voor production Worker-problemen:

npx wrangler tail echoes-of-prime-lore

Dit onthulde tijdens auth-ontwikkeling direct de PBKDF2-limit en is de
voorkeursroute boven gokken.

Known-good milestone

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

Als een toekomstige wijziging één van bovenstaande breekt, is dat een
regressie.