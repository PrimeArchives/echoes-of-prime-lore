# DM — Frostgale Relay 2.2

Bewaar buiten `content` en `public`. De spelersfrontend importeert dit bestand niet.

Raster: vijf kolommen en zes rijen, genummerd J-01 tot J-30. Bron: links van J-01. Uitgang: rechts van J-30. Een tik draait rechtsom; AAN vergrendelt de kolom, UIT maakt hem draaibaar.

## Sessie starten

Activeer versie 2.2 als Architect en laat fase 1 gesloten tot de sessie begint. Spelers kunnen inloggen, maar krijgen geen matrix. Kies GEEF FASE 1 VRIJ wanneer je de reparatie aan tafel start. Zie DM-TUSSENMOMENTEN.md voor de twee scènes.

## Oplossen en controleren

Werk kolom voor kolom. Schakel het bijbehorende circuit uit, draai de benodigde tegels volgens de tabel en schakel weer in. Er mogen hoogstens twee kolommen tegelijk uit staan. Tegelstanden blijven behouden en condities lopen door.

Fases 1 en 2: verbind de volledige route, herstel alle circuits en wacht zo nodig totdat elke conditie minimaal 60% is. Kies ROND FASE AF. De speler wacht daarna op externe interventie. Als alle vier klaar zijn, speel je de gezamenlijke scène en kies je als Architect GEEF FASE 2 VRIJ of GEEF FASE 3 VRIJ. Pas dan verschijnt de nieuwe matrix; condities worden niet gereset.

Fase 3: leg de laatste route, schakel daarna bijvoorbeeld 7-G (2 PU) en Voedselbewaring (1 PU) uit en vergrendel het subsystem. Alleen Architect initialiseert de hoofdrelay bij 4/4.

De tabellen tonen tikken vanaf de oorspronkelijke beginstand van elke fase. Wanneer je al hebt gedraaid, gebruik de connectorrichtingen. Controlepunten moeten op één route in de volgorde A → B → C liggen. Resterende onbeschadigde tegels mogen in hun beginstand blijven. Bron- en uitgangsporten zitten buiten het raster.

## Lumi — fase 1 — Aanvoer herstellen

Route: J-01 → J-06 → J-11 → J-16 → J-21 → J-22 → J-17 → J-18 → J-19 → J-14 → J-13 → J-12 → J-07 → J-02 → J-03 → J-04 → J-09 → J-10 → J-15 → J-20 → J-25 → J-30

Controlepunten: A = J-12.

Beschadigd: J-08, J-24, J-27.

| Knooppunt | Connectoren | Tikken vanaf beginstand | Kolom / circuit UIT |
|---|---|---:|---|
| J-01 | Zuid + West | 1 | 1 / WARMTE |
| J-06 | Noord + Zuid | 0 | 1 / WARMTE |
| J-11 | Noord + Zuid | 1 | 1 / WARMTE |
| J-16 | Noord + Zuid | 1 | 1 / WARMTE |
| J-21 | Noord + Oost | 0 | 1 / WARMTE |
| J-22 | West + Noord | 0 | 2 / VOEDSEL |
| J-17 | Oost + Zuid | 2 | 2 / VOEDSEL |
| J-18 | Oost + West | 1 | 3 / PERIMETER |
| J-19 | West + Noord | 1 | 4 / MEDISCH |
| J-14 | Zuid + West | 3 | 4 / MEDISCH |
| J-13 | Oost + West | 0 | 3 / PERIMETER |
| J-12 | Noord + Oost | 2 | 2 / VOEDSEL |
| J-07 | Noord + Zuid | 0 | 2 / VOEDSEL |
| J-02 | Oost + Zuid | 2 | 2 / VOEDSEL |
| J-03 | Oost + West | 0 | 3 / PERIMETER |
| J-04 | Zuid + West | 2 | 4 / MEDISCH |
| J-09 | Noord + Oost | 2 | 4 / MEDISCH |
| J-10 | Zuid + West | 3 | 5 / 7-G |
| J-15 | Noord + Zuid | 3 | 5 / 7-G |
| J-20 | Noord + Zuid | 1 | 5 / 7-G |
| J-25 | Noord + Zuid | 3 | 5 / 7-G |
| J-30 | Noord + Oost | 0 | 5 / 7-G |

## Lumi — fase 2 — Verdeelnet herstellen

Route: J-01 → J-02 → J-07 → J-12 → J-13 → J-18 → J-17 → J-22 → J-21 → J-26 → J-27 → J-28 → J-29 → J-24 → J-19 → J-14 → J-09 → J-10 → J-15 → J-20 → J-25 → J-30

Controlepunten: A = J-22, B = J-19.

Beschadigd: J-08, J-11, J-23.

| Knooppunt | Connectoren | Tikken vanaf beginstand | Kolom / circuit UIT |
|---|---|---:|---|
| J-01 | Oost + West | 1 | 1 / WARMTE |
| J-02 | Zuid + West | 3 | 2 / VOEDSEL |
| J-07 | Noord + Zuid | 3 | 2 / VOEDSEL |
| J-12 | Noord + Oost | 1 | 2 / VOEDSEL |
| J-13 | Zuid + West | 3 | 3 / PERIMETER |
| J-18 | West + Noord | 1 | 3 / PERIMETER |
| J-17 | Oost + Zuid | 1 | 2 / VOEDSEL |
| J-22 | West + Noord | 0 | 2 / VOEDSEL |
| J-21 | Oost + Zuid | 0 | 1 / WARMTE |
| J-26 | Noord + Oost | 3 | 1 / WARMTE |
| J-27 | Oost + West | 1 | 2 / VOEDSEL |
| J-28 | Oost + West | 3 | 3 / PERIMETER |
| J-29 | West + Noord | 2 | 4 / MEDISCH |
| J-24 | Noord + Zuid | 0 | 4 / MEDISCH |
| J-19 | Noord + Zuid | 1 | 4 / MEDISCH |
| J-14 | Noord + Zuid | 0 | 4 / MEDISCH |
| J-09 | Oost + Zuid | 0 | 4 / MEDISCH |
| J-10 | Zuid + West | 0 | 5 / 7-G |
| J-15 | Noord + Zuid | 3 | 5 / 7-G |
| J-20 | Noord + Zuid | 2 | 5 / 7-G |
| J-25 | Noord + Zuid | 3 | 5 / 7-G |
| J-30 | Noord + Oost | 0 | 5 / 7-G |

## Lumi — fase 3 — Zender aansluiten

Route: J-01 → J-02 → J-03 → J-04 → J-09 → J-14 → J-13 → J-12 → J-17 → J-22 → J-21 → J-26 → J-27 → J-28 → J-23 → J-18 → J-19 → J-20 → J-25 → J-24 → J-29 → J-30

Controlepunten: A = J-14, B = J-26, C = J-19.

Beschadigd: J-07, J-15, J-16.

| Knooppunt | Connectoren | Tikken vanaf beginstand | Kolom / circuit UIT |
|---|---|---:|---|
| J-01 | Oost + West | 3 | 1 / WARMTE |
| J-02 | Oost + West | 2 | 2 / VOEDSEL |
| J-03 | Oost + West | 1 | 3 / PERIMETER |
| J-04 | Zuid + West | 2 | 4 / MEDISCH |
| J-09 | Noord + Zuid | 2 | 4 / MEDISCH |
| J-14 | West + Noord | 1 | 4 / MEDISCH |
| J-13 | Oost + West | 3 | 3 / PERIMETER |
| J-12 | Oost + Zuid | 3 | 2 / VOEDSEL |
| J-17 | Noord + Zuid | 3 | 2 / VOEDSEL |
| J-22 | West + Noord | 3 | 2 / VOEDSEL |
| J-21 | Oost + Zuid | 3 | 1 / WARMTE |
| J-26 | Noord + Oost | 1 | 1 / WARMTE |
| J-27 | Oost + West | 1 | 2 / VOEDSEL |
| J-28 | West + Noord | 3 | 3 / PERIMETER |
| J-23 | Noord + Zuid | 2 | 3 / PERIMETER |
| J-18 | Oost + Zuid | 2 | 3 / PERIMETER |
| J-19 | Oost + West | 2 | 4 / MEDISCH |
| J-20 | Zuid + West | 1 | 5 / 7-G |
| J-25 | West + Noord | 3 | 5 / 7-G |
| J-24 | Oost + Zuid | 3 | 4 / MEDISCH |
| J-29 | Noord + Oost | 2 | 4 / MEDISCH |
| J-30 | Oost + West | 1 | 5 / 7-G |

## Clavator (account clav) — fase 1 — Aanvoer herstellen

Route: J-01 → J-02 → J-03 → J-08 → J-09 → J-10 → J-15 → J-14 → J-19 → J-18 → J-13 → J-12 → J-07 → J-06 → J-11 → J-16 → J-17 → J-22 → J-27 → J-28 → J-29 → J-30

Controlepunten: A = J-10.

Beschadigd: J-05, J-20, J-23.

| Knooppunt | Connectoren | Tikken vanaf beginstand | Kolom / circuit UIT |
|---|---|---:|---|
| J-01 | Oost + West | 1 | 1 / WARMTE |
| J-02 | Oost + West | 1 | 2 / VOEDSEL |
| J-03 | Zuid + West | 1 | 3 / PERIMETER |
| J-08 | Noord + Oost | 2 | 3 / PERIMETER |
| J-09 | Oost + West | 1 | 4 / MEDISCH |
| J-10 | Zuid + West | 3 | 5 / 7-G |
| J-15 | West + Noord | 3 | 5 / 7-G |
| J-14 | Oost + Zuid | 3 | 4 / MEDISCH |
| J-19 | West + Noord | 0 | 4 / MEDISCH |
| J-18 | Noord + Oost | 0 | 3 / PERIMETER |
| J-13 | Zuid + West | 0 | 3 / PERIMETER |
| J-12 | Noord + Oost | 2 | 2 / VOEDSEL |
| J-07 | Zuid + West | 0 | 2 / VOEDSEL |
| J-06 | Oost + Zuid | 3 | 1 / WARMTE |
| J-11 | Noord + Zuid | 0 | 1 / WARMTE |
| J-16 | Noord + Oost | 0 | 1 / WARMTE |
| J-17 | Zuid + West | 2 | 2 / VOEDSEL |
| J-22 | Noord + Zuid | 0 | 2 / VOEDSEL |
| J-27 | Noord + Oost | 2 | 2 / VOEDSEL |
| J-28 | Oost + West | 1 | 3 / PERIMETER |
| J-29 | Oost + West | 1 | 4 / MEDISCH |
| J-30 | Oost + West | 2 | 5 / 7-G |

## Clavator (account clav) — fase 2 — Verdeelnet herstellen

Route: J-01 → J-02 → J-07 → J-06 → J-11 → J-12 → J-13 → J-18 → J-17 → J-16 → J-21 → J-22 → J-23 → J-28 → J-29 → J-24 → J-19 → J-14 → J-15 → J-20 → J-25 → J-30

Controlepunten: A = J-18, B = J-29.

Beschadigd: J-08, J-10, J-27.

| Knooppunt | Connectoren | Tikken vanaf beginstand | Kolom / circuit UIT |
|---|---|---:|---|
| J-01 | Oost + West | 1 | 1 / WARMTE |
| J-02 | Zuid + West | 0 | 2 / VOEDSEL |
| J-07 | West + Noord | 3 | 2 / VOEDSEL |
| J-06 | Oost + Zuid | 2 | 1 / WARMTE |
| J-11 | Noord + Oost | 0 | 1 / WARMTE |
| J-12 | Oost + West | 3 | 2 / VOEDSEL |
| J-13 | Zuid + West | 2 | 3 / PERIMETER |
| J-18 | West + Noord | 2 | 3 / PERIMETER |
| J-17 | Oost + West | 3 | 2 / VOEDSEL |
| J-16 | Oost + Zuid | 0 | 1 / WARMTE |
| J-21 | Noord + Oost | 1 | 1 / WARMTE |
| J-22 | Oost + West | 3 | 2 / VOEDSEL |
| J-23 | Zuid + West | 3 | 3 / PERIMETER |
| J-28 | Noord + Oost | 1 | 3 / PERIMETER |
| J-29 | West + Noord | 0 | 4 / MEDISCH |
| J-24 | Noord + Zuid | 2 | 4 / MEDISCH |
| J-19 | Noord + Zuid | 0 | 4 / MEDISCH |
| J-14 | Oost + Zuid | 1 | 4 / MEDISCH |
| J-15 | Zuid + West | 2 | 5 / 7-G |
| J-20 | Noord + Zuid | 2 | 5 / 7-G |
| J-25 | Noord + Zuid | 0 | 5 / 7-G |
| J-30 | Noord + Oost | 3 | 5 / 7-G |

## Clavator (account clav) — fase 3 — Zender aansluiten

Route: J-01 → J-06 → J-11 → J-12 → J-07 → J-02 → J-03 → J-08 → J-13 → J-14 → J-19 → J-24 → J-23 → J-22 → J-17 → J-16 → J-21 → J-26 → J-27 → J-28 → J-29 → J-30

Controlepunten: A = J-2, B = J-24, C = J-21.

Beschadigd: J-09, J-18, J-25.

| Knooppunt | Connectoren | Tikken vanaf beginstand | Kolom / circuit UIT |
|---|---|---:|---|
| J-01 | Zuid + West | 2 | 1 / WARMTE |
| J-06 | Noord + Zuid | 3 | 1 / WARMTE |
| J-11 | Noord + Oost | 1 | 1 / WARMTE |
| J-12 | West + Noord | 3 | 2 / VOEDSEL |
| J-07 | Noord + Zuid | 0 | 2 / VOEDSEL |
| J-02 | Oost + Zuid | 3 | 2 / VOEDSEL |
| J-03 | Zuid + West | 0 | 3 / PERIMETER |
| J-08 | Noord + Zuid | 1 | 3 / PERIMETER |
| J-13 | Noord + Oost | 2 | 3 / PERIMETER |
| J-14 | Zuid + West | 0 | 4 / MEDISCH |
| J-19 | Noord + Zuid | 3 | 4 / MEDISCH |
| J-24 | West + Noord | 1 | 4 / MEDISCH |
| J-23 | Oost + West | 2 | 3 / PERIMETER |
| J-22 | Noord + Oost | 0 | 2 / VOEDSEL |
| J-17 | Zuid + West | 1 | 2 / VOEDSEL |
| J-16 | Oost + Zuid | 0 | 1 / WARMTE |
| J-21 | Noord + Zuid | 3 | 1 / WARMTE |
| J-26 | Noord + Oost | 1 | 1 / WARMTE |
| J-27 | Oost + West | 3 | 2 / VOEDSEL |
| J-28 | Oost + West | 3 | 3 / PERIMETER |
| J-29 | Oost + West | 0 | 4 / MEDISCH |
| J-30 | Oost + West | 0 | 5 / 7-G |

## Dakka — fase 1 — Aanvoer herstellen

Route: J-01 → J-06 → J-07 → J-08 → J-13 → J-18 → J-17 → J-12 → J-11 → J-16 → J-21 → J-22 → J-27 → J-28 → J-29 → J-24 → J-19 → J-14 → J-15 → J-20 → J-25 → J-30

Controlepunten: A = J-22.

Beschadigd: J-03, J-10, J-26.

| Knooppunt | Connectoren | Tikken vanaf beginstand | Kolom / circuit UIT |
|---|---|---:|---|
| J-01 | Zuid + West | 2 | 1 / WARMTE |
| J-06 | Noord + Oost | 2 | 1 / WARMTE |
| J-07 | Oost + West | 1 | 2 / VOEDSEL |
| J-08 | Zuid + West | 3 | 3 / PERIMETER |
| J-13 | Noord + Zuid | 3 | 3 / PERIMETER |
| J-18 | West + Noord | 1 | 3 / PERIMETER |
| J-17 | Noord + Oost | 0 | 2 / VOEDSEL |
| J-12 | Zuid + West | 1 | 2 / VOEDSEL |
| J-11 | Oost + Zuid | 3 | 1 / WARMTE |
| J-16 | Noord + Zuid | 2 | 1 / WARMTE |
| J-21 | Noord + Oost | 3 | 1 / WARMTE |
| J-22 | Zuid + West | 2 | 2 / VOEDSEL |
| J-27 | Noord + Oost | 1 | 2 / VOEDSEL |
| J-28 | Oost + West | 0 | 3 / PERIMETER |
| J-29 | West + Noord | 3 | 4 / MEDISCH |
| J-24 | Noord + Zuid | 3 | 4 / MEDISCH |
| J-19 | Noord + Zuid | 2 | 4 / MEDISCH |
| J-14 | Oost + Zuid | 0 | 4 / MEDISCH |
| J-15 | Zuid + West | 1 | 5 / 7-G |
| J-20 | Noord + Zuid | 1 | 5 / 7-G |
| J-25 | Noord + Zuid | 3 | 5 / 7-G |
| J-30 | Noord + Oost | 1 | 5 / 7-G |

## Dakka — fase 2 — Verdeelnet herstellen

Route: J-01 → J-06 → J-07 → J-08 → J-13 → J-14 → J-09 → J-10 → J-15 → J-20 → J-25 → J-24 → J-19 → J-18 → J-17 → J-12 → J-11 → J-16 → J-21 → J-22 → J-23 → J-28 → J-29 → J-30

Controlepunten: A = J-15, B = J-11.

Beschadigd: J-03, J-05, J-27.

| Knooppunt | Connectoren | Tikken vanaf beginstand | Kolom / circuit UIT |
|---|---|---:|---|
| J-01 | Zuid + West | 2 | 1 / WARMTE |
| J-06 | Noord + Oost | 1 | 1 / WARMTE |
| J-07 | Oost + West | 3 | 2 / VOEDSEL |
| J-08 | Zuid + West | 3 | 3 / PERIMETER |
| J-13 | Noord + Oost | 2 | 3 / PERIMETER |
| J-14 | West + Noord | 1 | 4 / MEDISCH |
| J-09 | Oost + Zuid | 3 | 4 / MEDISCH |
| J-10 | Zuid + West | 0 | 5 / 7-G |
| J-15 | Noord + Zuid | 3 | 5 / 7-G |
| J-20 | Noord + Zuid | 2 | 5 / 7-G |
| J-25 | West + Noord | 1 | 5 / 7-G |
| J-24 | Noord + Oost | 0 | 4 / MEDISCH |
| J-19 | Zuid + West | 0 | 4 / MEDISCH |
| J-18 | Oost + West | 3 | 3 / PERIMETER |
| J-17 | Noord + Oost | 0 | 2 / VOEDSEL |
| J-12 | Zuid + West | 0 | 2 / VOEDSEL |
| J-11 | Oost + Zuid | 1 | 1 / WARMTE |
| J-16 | Noord + Zuid | 1 | 1 / WARMTE |
| J-21 | Noord + Oost | 1 | 1 / WARMTE |
| J-22 | Oost + West | 2 | 2 / VOEDSEL |
| J-23 | Zuid + West | 2 | 3 / PERIMETER |
| J-28 | Noord + Oost | 2 | 3 / PERIMETER |
| J-29 | Oost + West | 3 | 4 / MEDISCH |
| J-30 | Oost + West | 2 | 5 / 7-G |

## Dakka — fase 3 — Zender aansluiten

Route: J-01 → J-06 → J-07 → J-08 → J-03 → J-04 → J-09 → J-10 → J-15 → J-14 → J-13 → J-12 → J-11 → J-16 → J-17 → J-22 → J-23 → J-18 → J-19 → J-20 → J-25 → J-24 → J-29 → J-30

Controlepunten: A = J-9, B = J-11, C = J-19.

Beschadigd: J-02, J-05, J-21.

| Knooppunt | Connectoren | Tikken vanaf beginstand | Kolom / circuit UIT |
|---|---|---:|---|
| J-01 | Zuid + West | 2 | 1 / WARMTE |
| J-06 | Noord + Oost | 3 | 1 / WARMTE |
| J-07 | Oost + West | 2 | 2 / VOEDSEL |
| J-08 | West + Noord | 0 | 3 / PERIMETER |
| J-03 | Oost + Zuid | 1 | 3 / PERIMETER |
| J-04 | Zuid + West | 1 | 4 / MEDISCH |
| J-09 | Noord + Oost | 1 | 4 / MEDISCH |
| J-10 | Zuid + West | 3 | 5 / 7-G |
| J-15 | West + Noord | 2 | 5 / 7-G |
| J-14 | Oost + West | 1 | 4 / MEDISCH |
| J-13 | Oost + West | 3 | 3 / PERIMETER |
| J-12 | Oost + West | 1 | 2 / VOEDSEL |
| J-11 | Oost + Zuid | 2 | 1 / WARMTE |
| J-16 | Noord + Oost | 1 | 1 / WARMTE |
| J-17 | Zuid + West | 0 | 2 / VOEDSEL |
| J-22 | Noord + Oost | 2 | 2 / VOEDSEL |
| J-23 | West + Noord | 3 | 3 / PERIMETER |
| J-18 | Oost + Zuid | 2 | 3 / PERIMETER |
| J-19 | Oost + West | 2 | 4 / MEDISCH |
| J-20 | Zuid + West | 3 | 5 / 7-G |
| J-25 | West + Noord | 1 | 5 / 7-G |
| J-24 | Oost + Zuid | 2 | 4 / MEDISCH |
| J-29 | Noord + Oost | 1 | 4 / MEDISCH |
| J-30 | Oost + West | 2 | 5 / 7-G |

## Venn — fase 1 — Aanvoer herstellen

Route: J-01 → J-06 → J-11 → J-16 → J-17 → J-22 → J-27 → J-28 → J-23 → J-18 → J-19 → J-14 → J-13 → J-12 → J-07 → J-02 → J-03 → J-08 → J-09 → J-10 → J-15 → J-20 → J-25 → J-30

Controlepunten: A = J-13.

Beschadigd: J-05, J-24, J-26.

| Knooppunt | Connectoren | Tikken vanaf beginstand | Kolom / circuit UIT |
|---|---|---:|---|
| J-01 | Zuid + West | 2 | 1 / WARMTE |
| J-06 | Noord + Zuid | 2 | 1 / WARMTE |
| J-11 | Noord + Zuid | 1 | 1 / WARMTE |
| J-16 | Noord + Oost | 0 | 1 / WARMTE |
| J-17 | Zuid + West | 0 | 2 / VOEDSEL |
| J-22 | Noord + Zuid | 3 | 2 / VOEDSEL |
| J-27 | Noord + Oost | 1 | 2 / VOEDSEL |
| J-28 | West + Noord | 3 | 3 / PERIMETER |
| J-23 | Noord + Zuid | 3 | 3 / PERIMETER |
| J-18 | Oost + Zuid | 3 | 3 / PERIMETER |
| J-19 | West + Noord | 3 | 4 / MEDISCH |
| J-14 | Zuid + West | 2 | 4 / MEDISCH |
| J-13 | Oost + West | 2 | 3 / PERIMETER |
| J-12 | Noord + Oost | 2 | 2 / VOEDSEL |
| J-07 | Noord + Zuid | 3 | 2 / VOEDSEL |
| J-02 | Oost + Zuid | 1 | 2 / VOEDSEL |
| J-03 | Zuid + West | 3 | 3 / PERIMETER |
| J-08 | Noord + Oost | 1 | 3 / PERIMETER |
| J-09 | Oost + West | 0 | 4 / MEDISCH |
| J-10 | Zuid + West | 1 | 5 / 7-G |
| J-15 | Noord + Zuid | 0 | 5 / 7-G |
| J-20 | Noord + Zuid | 0 | 5 / 7-G |
| J-25 | Noord + Zuid | 3 | 5 / 7-G |
| J-30 | Noord + Oost | 2 | 5 / 7-G |

## Venn — fase 2 — Verdeelnet herstellen

Route: J-01 → J-02 → J-03 → J-08 → J-07 → J-12 → J-11 → J-16 → J-21 → J-22 → J-27 → J-28 → J-29 → J-24 → J-23 → J-18 → J-13 → J-14 → J-19 → J-20 → J-25 → J-30

Controlepunten: A = J-16, B = J-23.

Beschadigd: J-06, J-09, J-17.

| Knooppunt | Connectoren | Tikken vanaf beginstand | Kolom / circuit UIT |
|---|---|---:|---|
| J-01 | Oost + West | 1 | 1 / WARMTE |
| J-02 | Oost + West | 1 | 2 / VOEDSEL |
| J-03 | Zuid + West | 0 | 3 / PERIMETER |
| J-08 | West + Noord | 1 | 3 / PERIMETER |
| J-07 | Oost + Zuid | 3 | 2 / VOEDSEL |
| J-12 | West + Noord | 3 | 2 / VOEDSEL |
| J-11 | Oost + Zuid | 0 | 1 / WARMTE |
| J-16 | Noord + Zuid | 2 | 1 / WARMTE |
| J-21 | Noord + Oost | 2 | 1 / WARMTE |
| J-22 | Zuid + West | 3 | 2 / VOEDSEL |
| J-27 | Noord + Oost | 1 | 2 / VOEDSEL |
| J-28 | Oost + West | 0 | 3 / PERIMETER |
| J-29 | West + Noord | 0 | 4 / MEDISCH |
| J-24 | Zuid + West | 0 | 4 / MEDISCH |
| J-23 | Noord + Oost | 3 | 3 / PERIMETER |
| J-18 | Noord + Zuid | 3 | 3 / PERIMETER |
| J-13 | Oost + Zuid | 1 | 3 / PERIMETER |
| J-14 | Zuid + West | 2 | 4 / MEDISCH |
| J-19 | Noord + Oost | 0 | 4 / MEDISCH |
| J-20 | Zuid + West | 2 | 5 / 7-G |
| J-25 | Noord + Zuid | 0 | 5 / 7-G |
| J-30 | Noord + Oost | 1 | 5 / 7-G |

## Venn — fase 3 — Zender aansluiten

Route: J-01 → J-06 → J-07 → J-02 → J-03 → J-08 → J-09 → J-04 → J-05 → J-10 → J-15 → J-14 → J-13 → J-18 → J-19 → J-20 → J-25 → J-24 → J-23 → J-28 → J-29 → J-30

Controlepunten: A = J-8, B = J-14, C = J-25.

Beschadigd: J-12, J-17, J-27.

| Knooppunt | Connectoren | Tikken vanaf beginstand | Kolom / circuit UIT |
|---|---|---:|---|
| J-01 | Zuid + West | 2 | 1 / WARMTE |
| J-06 | Noord + Oost | 0 | 1 / WARMTE |
| J-07 | West + Noord | 2 | 2 / VOEDSEL |
| J-02 | Oost + Zuid | 1 | 2 / VOEDSEL |
| J-03 | Zuid + West | 2 | 3 / PERIMETER |
| J-08 | Noord + Oost | 0 | 3 / PERIMETER |
| J-09 | West + Noord | 2 | 4 / MEDISCH |
| J-04 | Oost + Zuid | 1 | 4 / MEDISCH |
| J-05 | Zuid + West | 1 | 5 / 7-G |
| J-10 | Noord + Zuid | 3 | 5 / 7-G |
| J-15 | West + Noord | 2 | 5 / 7-G |
| J-14 | Oost + West | 1 | 4 / MEDISCH |
| J-13 | Oost + Zuid | 3 | 3 / PERIMETER |
| J-18 | Noord + Oost | 2 | 3 / PERIMETER |
| J-19 | Oost + West | 0 | 4 / MEDISCH |
| J-20 | Zuid + West | 1 | 5 / 7-G |
| J-25 | West + Noord | 0 | 5 / 7-G |
| J-24 | Oost + West | 3 | 4 / MEDISCH |
| J-23 | Oost + Zuid | 1 | 3 / PERIMETER |
| J-28 | Noord + Oost | 3 | 3 / PERIMETER |
| J-29 | Oost + West | 3 | 4 / MEDISCH |
| J-30 | Oost + West | 1 | 5 / 7-G |

## Testen aan tafel

Speeltijd is nog niet met spelers gemeten. Noteer per fase de duur, incidenten en momenten waarop bediening onduidelijk is. Het doel is 25–30 minuten per speler; snelheid verschilt per speler. Er zijn geen kunstmatige wachttimers toegevoegd: wachten komt uitsluitend voort uit werkelijk conditieherstel.
