# Compacte Frostgale-console + kortere timers

Deze update bouwt voort op de Architect-testconsole en je werkende versie 2.2.

## Installatie

Kopieer de bestanden uit `worker/` en `quartz/` naar dezelfde paden in je project. Het gewijzigde puzzelbestand `worker/frostgale-engine.ts` moet ook mee: daarin staan de kortere timers.

```sh
npx quartz build
npx wrangler deploy
```

Geen nieuwe versie activeren of echte voortgang resetten. De aparte Architect-testconsole blijft beschikbaar. De testtabel wordt automatisch aangemaakt bij eerste gebruik. De echte fasevrijgave en Archives-bediening blijven behouden.

## Weergave

- Eén breed raster, met de afsluitknop eronder; geen tekstkolom naast de puzzel.
- De vijf schakelaars boven het raster tonen stand, conditie, vermogen en seconden tot uitval of herstel.
- Herhaalde uitleg en standaardmeldingen over spanning/voorzieningen zijn verwijderd.
- Bron en uitgang staan op hun eigen tegel, controlepunten op het raster.
- Alleen korte context bij een geselecteerde tegel en meldingen voor een verbonden route of leidingbreuk.
- De globale relaystatus en groepsvoortgang zijn tijdens puzzelen verborgen; Architect ziet deze in het echte beheer.
- Testbediening is compacter. Reset een testfase om de nieuwe timers vanaf 100% te beoordelen.

## Nieuwe timers

Tijden in seconden: van 100% naar 0% bij uitgeschakeld circuit, of van 0% naar 100% na herstel.

| Circuit | Uitval | Volledig herstel |
|---|---:|---:|
| Warmte | 45 | 30 |
| Voedsel | 60 | 35 |
| Perimeter | 35 | 25 |
| Medisch | 40 | 25 |
| 7-G | 50 | 35 |

Deze tijden gelden voor de echte puzzels en de testmodus. De bestaande 60%-kalibratiegrens en limiet van twee uitgeschakelde kolommen blijven gelden. Korter herstel voorkomt dat de extra druk vooral wachttijd wordt.

De nieuwe snelheid geldt direct na deployment, ook voor opgeslagen actieve puzzels: verstreken tijd sinds de laatste serverupdate wordt met de nieuwe snelheden berekend. Start voor een zuivere vergelijking een nieuwe testfase. Voltooide puzzels blijven voltooid.

## Verificatie

35 automatische controles geslaagd, inclusief alle twaalf puzzels, timers, kalibratie, echte spelersbediening, testisolatie en Architect-bediening. TypeScript en componentsyntax gecontroleerd. Geen volledige Quartz-build of echte mobiele browserrender hier uitgevoerd.
