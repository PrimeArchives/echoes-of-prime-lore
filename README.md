Prime Archives

Prime Archives is de publieke, in-universe tabletomgeving voor de D&D-campagne Echoes of Prime.

De website draait op Quartz 5 en wordt gebouwd vanuit Markdown-content. Spelers gebruiken de site als de software van hun tablet: PAT-03.

Snel starten

Open PowerShell in de projectmap:

cd C:\DnD\Development\echoes-of-prime-lore

Haal eerst de nieuwste versie op:

git pull origin v5

Start daarna de lokale website:

npx quartz build --serve --watch

Open vervolgens:

http://localhost:8080

Stop de server met:

Ctrl+C

Werken op laptop en desktop

De actieve projectbranch is momenteel:

v5

Voor je begint

git checkout v5
git pull origin v5

Aan het einde van je werksessie

git add .
git commit -m "korte beschrijving van de wijzigingen"
git push origin v5

Controleer de status

git status

Een schone werkomgeving toont ongeveer:

On branch v5
Your branch is up to date with 'origin/v5'.

nothing to commit, working tree clean

Eenmalige installatie op een nieuwe computer

Benodigd:

Visual Studio Code

Git

Node.js

npm

Clone de repository:

cd C:\DnD\Development
git clone https://github.com/PrimeArchives/echoes-of-prime-lore.git
cd echoes-of-prime-lore
git checkout v5
npm install

Start daarna Quartz:

npx quartz build --serve --watch

npm install hoeft normaal alleen bij de eerste installatie of nadat package.json is gewijzigd.

Content toevoegen

Alle publieke spelerscontent hoort in:

content/

Wijzig nooit handmatig bestanden in:

public/

De map public/ wordt automatisch opnieuw opgebouwd door Quartz.

Belangrijkste contentmappen

De huidige structuur gebruikt onder andere:

content/
├── index.md
├── archives.md
├── static/
├── 01 Universe/
├── 02 Timeline/
├── 04 Locations/
├── 05 NPCs/
├── 06 Factions/
└── 07 Systems/

Nieuwe content plaats je in de passende map.

Voorbeelden:

content/04 Locations/LOC-001 Virex-9.md
content/05 NPCs/NPC-001 Captain Vynn Correll.md
content/06 Factions/FAC-001 Aether Syndicate.md
content/07 Systems/SYS-001 Aether.md

Gebruik alleen informatie die spelers daadwerkelijk hebben ontdekt of die publiek beschikbaar mag zijn.

Nieuwe Markdown-pagina

Een eenvoudige pagina ziet er zo uit:

---
title: Virex-9
description: Een zwevende vrijhaven en handelsstad.
tags:
  - location
  - virex-9
---

# Virex-9

Schrijf hier de publieke spelersinformatie.

Na opslaan bouwt Quartz de pagina automatisch opnieuw wanneer de server met --watch draait.

Afbeeldingen

Publieke afbeeldingen staan in:

content/static/images/

Voorbeeld:

content/static/images/prime-archives-banner.webp

Gebruik een afbeelding in Markdown of HTML met:

<img
  src="/static/images/prime-archives-banner.webp"
  alt="Prime Archives"
/>

De assets-plugin in quartz.config.yaml zorgt ervoor dat bestanden uit content/static/ worden meegenomen in de build.

Belangrijke pagina's

/             Landingpage
/archives     PAT-03 Archive Dashboard
/404          Eigen Prime Archives foutpagina

De dashboardtegels verwijzen momenteel onder andere naar:

/01-universe/
/02-timeline/
/04-locations/
/05-npcs/
/06-factions/
/07-systems/

Belangrijke codebestanden

Dashboardcomponenten

quartz/components/prime/
├── ArchiveCard.tsx
└── ArchiveDashboard.tsx

ArchiveCard.tsx bepaalt de opbouw van iedere dashboardtegel.

ArchiveDashboard.tsx bepaalt welke tegels, teksten en statussen op /archives staan.

Dashboardstyling

quartz/styles/
├── custom.scss
├── archive-dashboard.scss
└── boot-sequence.scss

custom.scss laadt de eigen stylesheets en bevat algemene site-aanpassingen.

archive-dashboard.scss bevat de volledige PAT-03-dashboardstijl.

boot-sequence.scss bevat het opstartscherm.

Bovenaan custom.scss moeten deze imports aanwezig zijn:

@use "./variables.scss" as *;
@use "./archive-dashboard";
@use "./boot-sequence";

Eigen paginatype

quartz/plugins/pageTypes/archives.ts

Dit bestand zorgt ervoor dat /archives door ArchiveDashboard wordt gerenderd.

Het paginatype wordt geëxporteerd via:

quartz/plugins/pageTypes/index.ts

en toegevoegd aan de ingebouwde paginatypes in:

quartz/plugins/loader/config-loader.ts

Dashboardinhoud aanpassen

Open:

quartz/components/prime/ArchiveDashboard.tsx

Een kaart ziet er bijvoorbeeld zo uit:

<ArchiveCard
  title="Universe"
  description="History, worlds and cosmic knowledge."
  href="/01-universe/"
  icon="◉"
  status="Online"
/>

Een Field Tool gebruikt:

<ArchiveCard
  title="Navigation"
  description="Maps, routes and known destinations."
  href="/navigation/"
  icon="⌁"
  category="tool"
  status="Available"
/>

Nieuwe tegels kunnen later op dezelfde manier worden toegevoegd.

Reader Mode

Quartz bewaart Reader Mode als attribuut op het HTML-element:

<html reader-mode="on">

De speciale Reader Mode-layout voor /archives staat onderaan:

quartz/styles/archive-dashboard.scss

De daadwerkelijke knopclass is:

.readermode

Niet:

.reader-mode

Dit verschil is belangrijk wanneer de styling later wordt aangepast.

Huidige functies

Eigen landingpage

Archive Dashboard voor PAT-03

Herbruikbare archive cards

Public Archives en Field Tools

Pulserende statuslampjes

Bewegende scan-glare en scanlines

Full-width dashboard

Reader Mode-ondersteuning

Boot sequence

Eigen 404-pagina

GitHub-workflow voor laptop en desktop

Eerstvolgende ontwikkeling

De eerstvolgende geplande feature is:

Virex-9 Navigation Map

Eerste ontdekte locaties:

Iron Halo

Coil Market

Skybridge

Docking Spires

De kaart krijgt een generieke cyberstad-achtergrond. Locatiemarkers worden als losse elementen boven de kaart geplaatst, zodat ontdekte locaties later aan- en uitgezet kunnen worden zonder de kaartafbeelding opnieuw te bewerken.

Handige commando's

Lokale server

npx quartz build --serve --watch

Alleen bouwen

npx quartz build

Git-status

git status

Laatste wijzigingen ophalen

git pull origin v5

Alles opslaan in Git

git add .
git commit -m "beschrijving"
git push origin v5

Huidige branch bekijken

git branch --show-current

Node en npm controleren

node -v
npm -v

Belangrijke afspraken

v5 is voorlopig de actieve hoofdbranch.

Voeg alleen player-safe content toe aan content/.

Bewerk nooit handmatig public/.

Grote componentbestanden en stylesheets bij voorkeur volledig vervangen in plaats van veel losse patches stapelen.

Maak voor iedere werkende mijlpaal een commit en push.