Prime Archives -- DM Cheatsheet

Operationele cheatsheet voor dagelijks beheer van Prime Archives.

Projectpad

C:\Echoes of Prime\QuartzSetup

Gebruik bij twijfel eerst:

cd "C:\Echoes of Prime\QuartzSetup"

Lokale development stack

Terminal 1 --- Quartz

cd "C:\Echoes of Prime\QuartzSetup"
npx quartz build --serve --watch

Quartz direct:

http://localhost:8080

Gebruik dit vooral voor pure content/layout-controle.

Terminal 2 --- Worker + lokale D1/API

cd "C:\Echoes of Prime\QuartzSetup"
npx wrangler dev

Volledige lokale site:

http://127.0.0.1:8787

Gebruik 8787 voor Squad Annotations, login, sessions, API en
D1-tests.

Terminal 3 --- onderhoud

Gebruik voor plugin-build/install, Git, D1-commando's en scripts.

Normale workflow

Pas content/component/data aan.

Controleer lokaal.

Gebruik 8787 als Worker/API-functionaliteit meespeelt.

git status.

Commit + push.

npx quartz build.

npx wrangler deploy.

Controleer primearchives.nl.

Productie

cd "C:\Echoes of Prime\QuartzSetup"
npx quartz build
npx wrangler deploy

Succesvolle deploy hoort te tonen:

env.DB      D1 Database: prime-archives
env.ASSETS  Assets

Worker:

echoes-of-prime-lore

Productie:

https://primearchives.nl

Git

git status
git add .
git commit -m "Beschrijving"
git push

Maak na grote werkende wijzigingen bewust een checkpoint.

Squad Annotations

Momenteel actief op:

NPC records

Location records

Faction records

De frontmatter-ID (NPC-*, LOC-*, FAC-*) bepaalt de notes-feed.

Accounts:

lumi
clav
dakka
venn
architect → The Architect

Spelers kunnen notes lezen, authenticated notes plaatsen en alleen hun
eigen authenticated notes verwijderen. The Architect kan alle notes
verwijderen.

Ownership wordt bepaald door user_id, niet door de zichtbare
author-tekst. Legacy notes kunnen daarom wel een auteursnaam hebben
maar geen speler-owner.

Auth-endpoints:

POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

Er hoort geen publieke /api/auth/register te bestaan.

Notes-endpoints:

GET    /api/notes?record_id=<ID>
POST   /api/notes
DELETE /api/notes/<id>

Sessions gebruiken een HttpOnly-cookie.

Password hashing

Worker en beheerscripts moeten gelijk staan op:

PBKDF2
SHA-256
100000 iterations
32-byte derived key

Cloudflare accepteerde in deze Workeromgeving geen 210000
PBKDF2-iteraties. Verander hashing nooit aan één kant zonder
provisioning/reset mee te wijzigen.

Password reset

C:\Echoes of Prime\QuartzSetup\scripts\reset-password.mjs

Voorbeeld:

cd "C:\Echoes of Prime\QuartzSetup"
node ".\scripts\reset-password.mjs" venn

Controleer vóór gebruik of het script --local of --remote gebruikt.

D1: local versus remote

Lokaal:

npx wrangler d1 execute prime-archives --local --command="SELECT id, username, display_name, role FROM users ORDER BY id;"

Productie:

npx wrangler d1 execute prime-archives --remote --command="SELECT id, username, display_name, role FROM users ORDER BY id;"

Local en remote zijn verschillende databases.

Record Notes plugin

Bron:

C:\Echoes of Prime\QuartzSetup\quartz\plugins\record-notes-plugin

Component:

C:\Echoes of Prime\QuartzSetup\quartz\plugins\record-notes-plugin\src\components\RecordNotes.tsx

Na wijziging:

cd "C:\Echoes of Prime\QuartzSetup\quartz\plugins\record-notes-plugin"
npm run build

cd "C:\Echoes of Prime\QuartzSetup"
npx quartz plugin install --latest record-notes-plugin

Daarna Quartz opnieuw bouwen/starten.

Een groene algemene Quartz-build bewijst niet automatisch dat de lokale
pluginbron opnieuw gebouwd/geïnstalleerd is.

Troubleshooting

Live Worker/API-fout:

cd "C:\Echoes of Prime\QuartzSetup"
npx wrangler tail echoes-of-prime-lore

Gebruik eerst de concrete exception uit wrangler tail voordat code
wordt aangepast.

401 Invalid username or password betekent dat de Worker normaal
antwoordt, maar credentials/hash niet overeenkomen.

Als annotations/API lokaal niet werken, controleer dat je via
http://127.0.0.1:8787 test en niet alleen via http://localhost:8080.

Bij pluginwijziging die niet zichtbaar wordt: bron opslaan → plugin
npm run build → plugin install --latest → Quartz rebuild → juiste
URL.

Bij dubbele componenten: controleer quartz.config.yaml op dubbele
pluginregistratie/layout-configuratie.

Zichtbare locaties

quartz/components/prime/navigation/locations.ts

discovered: false

naar:

discovered: true

en rebuild.

Nieuwe locatie-entry bevat o.a. id, naam, x/y, description, discovered
en status.

Nieuwe map

Afbeelding:

content/static/maps/

Data:

quartz/components/prime/navigation/maps/

Daarna toevoegen aan PrimeOS en rebuilden.

Content

Publieke Markdown-records staan onder:

content/

Quartz indexeert deze tijdens de build. Prime Archives
canon/frontmatter-regels blijven leidend; publiceer geen DM-only
spoilers.

Berichten

quartz/components/prime/messages/messages.ts

Objective statuses

status: active

→ amber/geel

status: ongoing

→ cyaan/blauw

status: passed

→ groen

status: failed

→ failed-status styling

Niet vergeten

localhost:8080 = Quartz rechtstreeks.

127.0.0.1:8787 = Worker + API + lokale D1.

--local en --remote nooit door elkaar halen.

Custom plugin gewijzigd? Plugin build + install.

Productiefout? Eerst wrangler tail.

Geen publieke /api/auth/register.

Wachtwoorden nooit in Git, SQL-bestanden of chat/logs bewaren.

Na een stabiele mijlpaal committen.