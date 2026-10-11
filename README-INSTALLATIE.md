# Frostgale Relay 2.2 — startslot en gezamenlijke tussenmomenten

Complete vervangende bestanden op basis van versie 2.1, met behoud van de kolompuzzels, timers, zelfstandige `/interface`-pagina en bestaande login. Nieuwe regels:

- Voor de sessie kan uitsluitend Architect fase 1 vrijgeven. Spelers kunnen inloggen, maar krijgen geen matrix uit de API en mogen geen puzzelactie uitvoeren.
- Na kalibratie van fase 1 of fase 2 wacht de speler op externe interventie. Er verschijnt nog geen volgende matrix en draaien/schakelen is vergrendeld.
- De vijf voorzieningen staan bij deze wachtstand AAN en herstellen geleidelijk. Condities springen niet naar 100%; incidenten blijven bestaan. Een globale DM-pauze onderbreekt ook herstel.
- Alle vier spelers moeten de betreffende fase hebben afgerond voordat de Architect de volgende kan vrijgeven. De server controleert de opgeslagen routes, kalibraties en identiteit.
- Na de derde fase blijft de bestaande regel gelden: 3 PU reserveren, subsystem vergrendelen en bij 4/4 door Architect de hoofdrelay initialiseren.

De timers zijn niet verder ingekort; de extra speeltijd komt uit de gezamenlijke scènes. Zie de aparte DM-TUSSENMOMENTEN.md. De twaalf matrices en oplossingen zijn dezelfde als 2.1.

## Installeren

Kopieer `quartz`, `content`, `worker` en `tests` naar `C:\Echoes of Prime\QuartzSetup`. Behoud de mappenstructuur en vervang de bestanden. De DM-documenten horen buiten `content` en `public`.

```powershell
cd 'C:\Echoes of Prime\QuartzSetup'
npx quartz build
```

Stop je lokale Worker met Ctrl+C en start opnieuw:

```powershell
npx wrangler dev
```

Open http://127.0.0.1:8787/interface en vernieuw met Ctrl+F5. Er is geen nieuwe D1-migratie of wachtwoordreset nodig. Het bestaande `frostgale_relay`-record wordt hergebruikt. Het schema is alleen meegeleverd voor een lege installatie.

### Overstappen vanaf 2.1

Log in als Architect en klik **ACTIVEER PUZZELVERSIE 2.2**. Dit begint een nieuwe reparatieprocedure met alle spelers bij fase 1, nog vergrendeld. De oude toestand wordt als serverarchief bewaard; accountkoppelingen blijven behouden. Zonder deze expliciete actie wordt oude voortgang niet gewist.

Daarna verschijnt **GEEF FASE 1 VRIJ**. Laat die knop tot de sessiestart met rust. Het activeren van de versie geeft fase 1 dus nog niet vrij.

## Bediening tijdens de sessie

1. Architect kiest **GEEF FASE 1 VRIJ**; alle spelers krijgen hun eigen eerste matrix.
2. Spelers leggen de route, herstellen alle circuits tot minimaal 60% en kiezen **ROND FASE 1 AF**.
3. De hoofdconsole toont hoeveel spelers klaar zijn. Wachtende consoles tonen het externe probleem en blijven vergrendeld.
4. Bij 4/4 speel je de scène rond verdeelstation F-02. Vervolgens kiest Architect **GEEF FASE 2 VRIJ**.
5. Herhaal dit na fase 2 voor de externe antennekoppeling; kies daarna **GEEF FASE 3 VRIJ**.
6. Na vier volledige subsystemen kies je **INITIALISEER HOOFDRELAY**. Pas dan is het tabletsignaal hersteld.

Er zijn geen automatische wachttijden: je kunt een korter of langer event spelen en bepaalt zelf wanneer het afgerond is.

### Resets

- Een volledige reset zet ook de startblokkade terug: fase 1 moet opnieuw door Architect worden vrijgegeven.
- Een afzonderlijke reset start die speler opnieuw bij fase 1. Als eerdere groepsfases al zijn vrijgegeven, kan die speler na geldige kalibratie inhalen zonder eerdere events opnieuw te openen. Voor de volgende nog gesloten groepsfase blijft 4/4 vereist.
- Een reset zet de hoofdrelay offline. Accounts en bestaande login blijven hetzelfde.

## Controleren

30 tests slagen: de eerdere twaalf matrices en serverregels, plus startslot, wachten/herstel, gezamenlijke fasevrijgave, persistentie, reset/inhaalgedrag en het ontbreken van een spelersmatrix vóór de sessiestart. Nieuwe servermodules slagen voor strikte TypeScript-controle. TSX en gecombineerde scripts zijn syntactisch gecontroleerd.

```powershell
node --test tests/frostgale.test.mjs
npx tsx --test tests/frostgale-api.test.mjs tests/frostgale-ui.test.mjs
npx tsc --noEmit
npx quartz build
```

Node 24 aanbevolen voor de SQLite-testadapter. De bedieningstest gebruikt een gesimuleerde DOM met de echte API; dit is geen visuele browsertest. De volledige Quartz-build, visuele telefoontest en live Cloudflare-deploy zijn hier niet uitgevoerd.

Praktische controle: activeer 2.2, log in als een speler en controleer dat er geen matrix verschijnt. Geef fase 1 vrij als Architect. Rond de eerste matrix af en controleer dat refresh geen fase 2 opent. Rond de overige drie af en controleer dat uitsluitend Architect fase 2 kan vrijgeven.

## Online deploy na lokaal testen

```powershell
npx quartz build
npx wrangler deploy
```

Activeer vervolgens als Architect versie 2.2 op je online website. Laat fase 1 gesloten tot de sessie. Lokaal activeren of vrijgeven verandert de online D1-database niet.

## Archives herstellen vanuit Architect

Na **INITIALISEER HOOFDRELAY** wordt **HERSTEL ARCHIVES-VERBINDING** beschikbaar. Deze knop bewaart `signalLost = false` in D1. Bezoekers op `/archives` zien daarna de bestaande Archives-interface; de signaalstatus wordt ook zonder login gecontroleerd en ongeveer iedere drie seconden ververst.

Je kunt als Architect ook **ZET ARCHIVES OP SIGNAL LOST** kiezen. Alleen de Architect mag dit wijzigen; herstellen kan pas als de hoofdrelay echt online is. Een puzzelreset blokkeert Archives opnieuw.

`PRIME_SIGNAL_LOST = true` in de TSX is nu de fallback wanneer nog geen serverkeuze is opgeslagen of de status-API onbereikbaar is. De gekozen serverstatus heeft voorrang. Er wordt geen bronbestand op Cloudflare aangepast en er is geen extra build nodig om de verbinding aan tafel te herstellen.

De publieke status-API `/api/frostgale/signal` levert uitsluitend de signaalvlag, geen accounts, puzzels of DM-gegevens. De daadwerkelijke Archives-inhoud is dezelfde bestaande publieke site; dit is de campagnepresentatie, niet een nieuw toegangssysteem voor geheim materiaal.
