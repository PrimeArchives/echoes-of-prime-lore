# Architect-testconsole — uitbreiding op je werkende versie 2.2

## Installeren

Kopieer deze drie vervangende bestanden naar dezelfde paden in je project:

- `worker/index.ts`
- `worker/frostgale.ts`
- `quartz/components/Prime/interactive/Interactive.tsx`

De overige Worker- en Quartz-bestanden in dit pakket zijn identiek aan je upload of alleen verificatietests. Er is geen nieuwe puzzelversie om te activeren en geen reset van de echte sessie nodig.

Bouw en publiceer vanuit de projectmap zoals gebruikelijk:

```sh
npx quartz build
npx wrangler deploy
```

De aparte testtabel wordt automatisch aangemaakt wanneer Architect de testconsole voor het eerst opent. Geen SQL-migratie nodig; de bestaande echte relaytabel blijft bestaan.

## Testen op je mobiel

1. Open je online website op je telefoon en kies Interface.
2. Log in met je Architect-account.
3. Druk op **OPEN TESTCONSOLE**.
4. De gele **TESTMODUS // ALLEEN ARCHITECT**-balk bevestigt dat je test.
5. Kies Lumi, Clavator, Dakka of Venn. Elke speler heeft eigen testvoortgang.
6. Kies een fase en druk op **START / RESET GEKOZEN TESTFASE**. Dit begint die fase opnieuw met 100% condities en alle circuits aan, alleen voor deze testspeler.
7. Test het raster en de schakelaars. De normale regels gelden: eerst een kolom uitzetten, maximaal twee kolommen tegelijk uit, herstelcondities voor kalibreren en de vermogensreserve voor de eindfase.
8. Gebruik **PAUZEER TESTTIMERS** tijdens het bekijken van de mobiele weergave. Deze pauze geldt voor alle vier jouw testpuzzels.
9. **TERUG NAAR RELAYBEHEER** opent de echte Architect-bediening.

Alle drie testfases zijn beschikbaar zonder de echte fase 1 vrij te geven. Een normaal opgeloste en gekalibreerde testfase opent de volgende testfase automatisch; de gezamenlijke encounterpoorten worden in testmodus overgeslagen. Via de fasekeuze kun je direct één bepaalde fase testen.

Testvoortgang blijft op de server bewaard na refresh en wisselen van apparaat. Testtimers lopen door zolang je deze niet pauzeert. Lokale en online databases blijven afzonderlijk. Iedere Architect heeft een eigen testomgeving.

## Echte sessie

Houd de echte fase 1 gesloten in relaybeheer totdat de sessie begint. Publiceren van deze uitbreiding geeft geen fases vrij. Spelers zien geen testbediening en krijgen bij rechtstreekse toegang tot de test-API een weigering. Testacties veranderen geen echte spelersvoortgang, Archives-signaalstatus of hoofdrelay.

## Verificatie

35 automatische controles geslaagd: twaalf layouts, puzzelregels, authenticatie, testisolatie, fasekeuze, aparte Architect-opslag, terugkeer naar echt beheer en bestaande spelersbediening. De Worker-puzzelmodules zijn strikt met TypeScript gecontroleerd; de component en browserscript zijn op syntax en via gesimuleerde UI-interactie getest.

Een volledige Quartz-build en visuele test in een echte mobiele browser zijn hier niet uitgevoerd. De mobiele controle doe je nu via je eigen online website.

Optioneel kun je de meegeleverde tests in je eigen project draaien:

```sh
npx tsx --test tests/frostgale.test.mjs tests/frostgale-api.test.mjs tests/frostgale-ui.test.mjs tests/architect-test.test.mjs tests/architect-ui.test.mjs
```
