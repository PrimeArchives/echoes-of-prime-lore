Prime Archives --- Project Handoff

Technical and workflow handoff for continued development of thePrime Archives website for the Echoes of Prime D&D campaign.

Last updated: 2026-08-12Project: Prime Archives / Echoes of PrimeWebsite: primearchives.nl

1. Purpose

Prime Archives is the public, in-universe website used by players in theEchoes of Prime campaign.

The site presents campaign information as if the players are accessing afuturistic archive operating system. It is both:

a practical campaign reference;

an in-universe interface and storytelling device.

New campaign information should be added primarily through Markdownrecords. Interface code should remain as data-driven as possible so thatadding a new NPC, audio record, objective, or future record type doesnot require manually editing TSX every time.

2. Technology

Current stack:

Quartz v5 / Quartz Community ecosystem

TypeScript / TSX

SCSS

Markdown

Git

Cloudflare deployment

Windows / PowerShell for local development

Important project-specific detail:

Configuration uses quartz.config.yaml

Do not assume this project uses quartz.config.ts

Typical local development command:

npx quartz build --serve --watch

If newly added Markdown exists as a direct page but does not appearinside a data-driven application, restart the Quartz watch process andperform a hard browser refresh before changing code. This has alreadyresolved stale allFiles state for Objectives.

3. Development Principles

These rules should be followed when modifying Prime Archives.

3.1 Inspect before modifying

Do not assume the internal structure of the current Quartz project.

When an existing component needs modification, use the current versionof the actual source file as the basis.

Do not reconstruct large files from memory or from an older version.

3.2 Preserve existing functionality

When adding a feature:

preserve working Audio functionality;

preserve existing Personnel behavior;

preserve dashboard behavior;

preserve existing CSS unless the change specifically requiresmodifying it.

Never silently replace a large existing file with a drasticallyshortened approximation.

3.3 Prefer complete replacement files

For substantial changes, complete replacement files are preferred over acollection of disconnected snippets.

This reduces uncertainty about:

placement;

imports;

duplicated code;

missing braces;

stale versions.

3.4 Diagnose before rewriting

When something does not work:

establish which layer is failing;

inspect the smallest relevant area;

use a targeted diagnostic if needed;

modify code only after the cause is reasonably understood.

Avoid recursively searching large parts of Quartz unless there isevidence the problem is there.

3.5 Data-driven content

Whenever practical, content should be controlled byMarkdown/frontmatter.

Preferred workflow:

Add Markdown record
        ↓
Quartz indexes it
        ↓
Field Application reads allFiles
        ↓
UI updates automatically

Avoid:

Add Markdown
        ↓
Edit TSX manually
        ↓
Add another hardcoded card
        ↓
Repeat forever

4. Visual Language

Prime Archives uses a dark science-fiction archive/terminal aesthetic.

Common characteristics:

near-black / dark blue backgrounds;

cyan system accents;

monospace labels;

subtle borders;

dossier-like panels;

status LEDs;

archive classification language;

restrained glow effects;

field-application terminology.

The site should feel like an operating system from the campaign universerather than a generic documentation website.

5. Content Structure

Important content areas currently include approximately:

content/
├── 02-locations/
├── 03-personnel/
├── 09-audio/
├── 10-objectives/
└── static/
    ├── images/
    │   ├── locations/
    │   └── npcs/
    └── audio/

Folder names may evolve as the project grows. Verify the currentrepository before assuming paths.

Static content under:

content/static/

is published by Quartz under:

/static/

Example:

content/static/images/npcs/rust bucket.webp

becomes:

/static/images/npcs/rust bucket.webp

6. Markdown / Canon Rules

Public Prime Archives records use YAML frontmatter.

Known canon IDs must be preserved.

NPC minimum frontmatter

---
title:
id:
type: npc
species:
role:
location:
---

If an NPC has a primary image:

image:
imageLayout:

Allowed imageLayout values:

portrait
wide
none

Do not guess imageLayout when it is unclear.

The Markdown body is flexible and should contain only useful sections.

Obsidian links should be preserved.

7. Prime Archives Dashboard

/archives functions as the main Prime Archivesoperating-system/dashboard.

Current or planned sections include:

Locations

Personnel

Messages

Audio Archive / Echo Deck

Objectives

Factions

future restricted / clearance content

Some entries are normal archive records; others are FieldApplications with their own interfaces.

8. Breadcrumbs

The Quartz Community breadcrumbs component has already been customized.

The root breadcrumb:

Archives

links to:

/archives

instead of returning to /.

This required significant debugging previously.

Do not modify the breadcrumb implementation unless explicitly required.

9. Personnel

Personnel is an existing data-driven NPC interface.

The Personnel index uses the NPC's primary frontmatter image:

image: /static/images/npcs/example.webp
imageLayout: portrait

9.1 Single-image NPC

Existing NPCs with one image continue to use the existing.personnel-hero implementation.

No migration is required.

9.2 Multi-image NPC gallery

NPCs can now have multiple visual encounter records.

This is implemented with HTML + CSS using radio inputs. No JavaScript isrequired.

Example using Rust Bucket:

<div class="personnel-gallery">
  <input type="radio" name="rust-bucket-gallery" id="rust-bucket-image-1" checked>
  <input type="radio" name="rust-bucket-gallery" id="rust-bucket-image-2">

  <div class="personnel-gallery__stage">
    <img
      class="personnel-gallery__image"
      src="/static/images/npcs/rust bucket.webp"
      alt="Rust Bucket"
    >
    <img
      class="personnel-gallery__image"
      src="/static/images/npcs/rust bucket`s truck.webp"
      alt="Rust Bucket's truck"
    >
  </div>

  <div class="personnel-gallery__tabs">
    <label for="rust-bucket-image-1">RUST BUCKET</label>
    <label for="rust-bucket-image-2">TRUCK ENCOUNTER</label>
  </div>
</div>

Gallery styling is currently located in custom.scss.

The primary image: frontmatter remains useful for Personnel indexcards even when the detail record contains a gallery.

10. Audio Archive / Echo Deck

Audio Archive is a working Field Application.

Its purpose includes:

character theme songs;

small campaign sound fragments;

future Echo Crystal recordings.

Markdown records live under approximately:

content/09-audio/

Audio files live under:

content/static/audio/

and are served as:

/static/audio/

The application automatically reads audio records rather than requiringevery track to be hardcoded into TSX.

The audio player is functional and plays actual media files.

Use the Audio implementation as an architectural reference for futureMarkdown-driven Field Applications.

11. Objectives Field Application

Objectives is currently implemented as:

PAT-05 / FIELD APPLICATION

Objective Markdown records live under approximately:

content/10-objectives/

11.1 Example Objective

---
title: The "Lost" Cargo
id: OBJ-002
type: objective
status: passed
priority: side
issuer: Rust Bucket
location: Neon Alley
published: true
---

11.2 Statuses

Supported canonical status values:

active
ongoing
passed
failed

Visual mapping:

Status      Visual tone

active    amber / yellowongoing   cyan / bluepassed    greenfailed    red

11.3 Automatic counters

Status counters are calculated automatically from the Objective records.

For example:

OBJ-001 → passed
OBJ-002 → passed
OBJ-003 → active
OBJ-004 → failed

produces:

ACTIVE   01
ONGOING  00
PASSED   02
FAILED   01

No separate counter data should be maintained manually.

Changing:

status: active

to:

status: passed

automatically moves that Objective between counters on rebuild.

11.4 Publishing

published: false

hides an Objective from the Field Application.

11.5 Objective UI

The current Objectives interface contains:

Mission Queue on the left;

selected Objective dossier on the right;

status summary counters;

Objective ID;

issuer;

location;

priority;

status;

Mission Briefing;

optional outcome;

status-dependent colors.

11.6 Mission Briefing

The application has been modified to render the actual Markdown bodythrough Quartz's processed htmlAst.

Therefore the full Objective description does not need to beduplicated into frontmatter.

Recommended division:

description:

Optional short summary useful for Mission Queue display.

Markdown body:

## Opdracht

Full player-facing briefing...

Used as the actual MISSION BRIEFING.

Optional:

outcome:

Used for a separate mission outcome / failure / field update block.

11.7 Location

Objective location is metadata and therefore belongs in frontmatter:

location: Neon Alley

If absent, the application currently displays:

Unspecified

11.8 Known Objective behavior

A newly created Objective once existed at its direct Quartz URL but didnot appear inside the Objectives application.

The Objective, filter, and allFiles propagation were all correct.

Stopping and restarting:

npx quartz build --serve --watch

followed by a hard browser refresh fixed the issue.

Before rewriting Objective code for this symptom, test for stalewatch/build state.

11.9 Known visual imperfection

The Objective dossier text spacing has been adjusted multiple times.

A structural .objective-dossier__inner wrapper was introduced toreduce interference from global Quartz article styling.

The current result has been accepted as:

good enough for now

Do not continue tuning Objective spacing unless explicitly requested.

12. Static Asset / Deployment Lessons

Several deployment issues have already been diagnosed.

12.1 Asset exists locally but not online

An image can exist locally and even be copied into public, while stillnot exist in the Git repository used by Cloudflare.

Useful checks:

git ls-files content/static/images/locations/aetherium-prime.webp

and:

Test-Path .\public\static\images\locations\aetherium-prime.webp

If Test-Path returns True but git ls-files returns nothing, thesource asset is not tracked by Git.

Add, commit, and push it.

12.2 Case sensitivity

Windows localhost is more forgiving about filename case thanCloudflare/Linux.

Example class of bug:

AUD-001.mp3

versus:

aud-001.mp3

A path can therefore work locally and return 404 in production.

Always compare exact filename casing.

12.3 Zero-byte assets

A deployed asset may exist but contain no data.

Example discovered:

coil-market.webp
Length: 0

Its SHA256 was:

E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855

which is the hash of an empty file.

This produced a blank/white direct response instead of a 404.

When an asset exists but renders blank, check:

Get-Item <path> | Select-Object FullName, Length

and, where useful:

Get-FileHash <source>
Get-FileHash <public-copy>

13. Factions

Faction development is intentionally postponed.

The party is currently returning to the quest hub and is expected toencounter faction options at the start of an upcoming session.

Faction behavior/content should be designed after the relevant campaignevents occur rather than prematurely locking everything into the publicarchive.

Likely future direction:

Markdown-driven faction records;

automatic Faction interface;

only reveal information actually unlocked by the party.

Do not build Factions automatically just because this handoff mentionsthem.

14. Features Currently Parked

These are known ideas but not current priorities:

perfecting Objectives spacing;

Factions;

clearance / restricted records;

Items and equipment database;

navigation expansion for future zones.

Items/equipment were deliberately postponed because maintaining themwould currently create too much content overhead.

15. Campaign Context

Echoes of Prime

Echoes of Prime is a future/high-tech D&D campaign.

Core setting concepts include:

magic integrated with advanced technology;

Aether as harvested divine energy;

physically manifested gods;

Divine Cores;

civilizations consuming/harvesting divine power;

freeports, smugglers, bounty hunters and factions;

archive and information control as part of the setting.

Important locations

Known important locations include:

Aetherium Prime

Virex-9

Coil Market

Iron Halo

Verdant Scar

Important factions

Known factions include:

Aether Syndicate

Archivists

Rustfront

Known NPC examples

Examples include:

Captain Vynn Correll

Mr Jel

Dr. Orren

Tiq the Wiremonger

Rust Bucket

Rust Bucket

Rust Bucket is:

a large Dragonborn trucker;

heavy-set with a beer belly;

cigar smoker;

wearer of a Nether Hauling Co. cap;

speaks with a Tukker accent;

associated with his truck;

now represented by multiple encounter images in Personnel.

16. Current Project Status

Recently completed:

Prime Archives dashboard

Personnel interface

Personnel multi-image gallery

Locations

Messages

Audio Archive / Echo Deck

functional MP3 playback

Markdown-driven audio records

Objectives Field Application

automatic Objective status colors

automatic Objective counters

Markdown body rendered as Objective Mission Briefing

Objective metadata support

Archives breadcrumb linking to /archives

multiple static asset / Cloudflare deployment issues diagnosed

Parked:

Objective spacing perfection

Factions

clearance / restricted content

Items/equipment

future navigation zones

17. Recommended Workflow for Future Features

When adding a new feature:

Step 1 --- Define the content model

Determine what belongs in Markdown/frontmatter.

Example:

id:
type:
status:
published:

Step 2 --- Reuse existing architecture

Check whether the feature resembles:

Personnel;

Audio;

Objectives;

Messages.

Do not create a new architecture unnecessarily.

Step 3 --- Inspect current files

Before modifying existing components, obtain/read the current versions.

Particularly important for large files such as PrimeOS.

Step 4 --- Build data-driven behavior

The ideal result is that adding:

NEW-001 Example.md

automatically causes the interface to recognize it.

Step 5 --- Test locally

Run:

npx quartz build --serve --watch

Test direct content URL and application UI.

Step 6 --- If application data looks stale

Before changing code:

stop Quartz;

restart the build/watch process;

hard refresh the browser.

Step 7 --- Verify Git assets

Before deployment, confirm new static assets are tracked:

git status
git ls-files <asset-path>

Step 8 --- Verify production casing

If localhost works but production fails, compare exact capitalizationof:

filenames;

Markdown references;

generated URLs.

18. Guidance for AI-assisted Development

When an AI assistant continues work on this repository:

treat this document as orientation, not as a substitute for currentsource files;

inspect the actual current file before performing majormodifications;

do not assume a standard Quartz v4/v5 directory layout;

remember this project uses quartz.config.yaml;

preserve working functionality;

avoid hardcoding campaign records into TSX;

prefer Markdown-driven systems;

return complete replacement files for substantial edits whenrequested;

explain exactly where a new file belongs;

do not ask for massive terminal output when a narrow diagnostic issufficient;

distinguish a content problem, Quartz build problem, browser-cacheproblem, Git problem and Cloudflare deployment problem beforerewriting code.

19. Source of Truth

For campaign canon:

The campaign vault / current Markdown records are the source of truth.

For application code:

The current repository files are the source of truth.

For this handoff:

This document records architectural decisions and known lessons, butmay become outdated as development continues.

When code and this handoff disagree, inspect the current code ratherthan forcing the project back to match this document.

20. Next Development Context

At the time this handoff was created:

Objectives had just reached a usable state;

Objective spacing was intentionally parked;

Factions were intentionally postponed until after the party reachesthe quest hub;

another future Prime Archives feature idea was about to bediscussed.

Continue development from the user's current priority rather thanautomatically starting one of the parked items.