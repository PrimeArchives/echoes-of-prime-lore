Prime Archives – DM Cheatsheet

## Test de site lokaal

```bash
npx quartz build --serve
```

Open daarna:

http://localhost:8080

---

## Update Quartz

```bash
npx quartz sync
```

---

## Zichtbare locaties aanpassen

Bestand:

quartz/components/prime/navigation/locations.ts

Verander:

```ts
discovered: false
```

naar

```ts
discovered: true
```

en rebuild de site.

---

## Nieuwe map toevoegen

1. Plaats afbeelding in:

content/static/maps/

2. Maak nieuw databestand aan:

quartz/components/prime/navigation/maps/

3. Voeg de map toe aan PrimeOS.

---

## Nieuwe locaties toevoegen

Bestand:

quartz/components/prime/navigation/locations.ts

Voeg locatie toe met:

- id
- naam
- x / y
- description
- discovered
- status

---

## NPC's / Locaties / Lore toevoegen

Markdown-bestanden plaatsen in:

content/

De Quartz build indexeert deze automatisch.

---

## Berichten voorbereiden

Bestand:

quartz/components/prime/messages/messages.ts

Nieuwe berichten toevoegen of bestaande aanpassen.

---

## Build voor productie

```bash
npx quartz build
```

Deploy daarna via GitHub → Cloudflare Pages.

---

## Git

Status

```bash
git status
```

Commit

```bash
git add .
git commit -m "Beschrijving"
```

Push

```bash
git push
```