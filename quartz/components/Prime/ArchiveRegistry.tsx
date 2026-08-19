import {
  QuartzComponent,
  QuartzComponentProps,
} from "../types"

type RegistryKind = "locations" | "personnel" | "factions" | "systems"

type RegistryConfig = {
  kind: RegistryKind
  eyebrow: string
  title: string
  empty: string
  cardLabel: string
  openLabel: string
  classificationFallback: string
  metaField?: "location" | "scope"
  metaLabel?: string
}

const REGISTRIES: Record<string, RegistryConfig> = {
  "02-locations": {
    kind: "locations",
    eyebrow: "LOCATION DATABASE",
    title: "Locations",
    empty: "No published location records found.",
    cardLabel: "LOCATION RECORD",
    openLabel: "OPEN LOCATION →",
    classificationFallback: "Location",
    metaField: "location",
    metaLabel: "LOCATION",
  },
  "03-personnel": {
    kind: "personnel",
    eyebrow: "PERSONNEL DATABASE",
    title: "Personnel",
    empty: "No published personnel records found.",
    cardLabel: "PERSONNEL RECORD",
    openLabel: "OPEN RECORD →",
    classificationFallback: "Personnel",
    metaField: "location",
    metaLabel: "LOCATION",
  },
  "04-factions": {
    kind: "factions",
    eyebrow: "FACTION INTELLIGENCE",
    title: "Factions",
    empty: "No published faction records found.",
    cardLabel: "FACTION DOSSIER",
    openLabel: "OPEN DOSSIER →",
    classificationFallback: "Faction",
    metaField: "scope",
    metaLabel: "OPERATING AREA",
  },
  "07-systems": {
    kind: "systems",
    eyebrow: "SYSTEMS DATABASE",
    title: "Systems",
    empty: "No published system records found.",
    cardLabel: "SYSTEM RECORD",
    openLabel: "OPEN SYSTEM →",
    classificationFallback: "System",
    metaField: "scope",
    metaLabel: "SCOPE",
  },
}

function folderFromSlug(slug = "") {
  return slug.replace(/\/index$/, "")
}

function immediateChild(folder: string, slug = "") {
  if (!slug.startsWith(`${folder}/`)) return false
  const rest = slug.slice(folder.length + 1)
  return rest.length > 0 && !rest.includes("/") && rest !== "index"
}

function isPublished(frontmatter: Record<string, unknown> | undefined) {
  if (!frontmatter) return true
  return frontmatter.published !== false && frontmatter.draft !== true
}

function text(value: unknown) {
  return typeof value === "string" ? value : undefined
}

function record(value: unknown) {
  return typeof value === "object" && value !== null
    ? value as Record<string, unknown>
    : undefined
}

function cssToken(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-")
}

function regionToken(value: string) {
  return cssToken(value.toLowerCase())
}

const ArchiveRegistry: QuartzComponent = ({
  fileData,
  allFiles,
}: QuartzComponentProps) => {
  const folder = folderFromSlug(fileData.slug)
  const config = REGISTRIES[folder]

  if (!config) return null

  const records = allFiles
    .filter((page) => immediateChild(folder, page.slug))
    .filter((page) =>
      isPublished(page.frontmatter as Record<string, unknown> | undefined),
    )
    .sort((a, b) => {
      const aId = text(a.frontmatter?.id) ?? ""
      const bId = text(b.frontmatter?.id) ?? ""

      return aId.localeCompare(bId, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    })

  const personnelRegions =
    config.kind === "personnel"
      ? Array.from(
          records.reduce((regions, page) => {
            const fm = page.frontmatter ?? {}
            const region = text(fm.archiveRegion) ?? "Unassigned"
            const current = regions.get(region) ?? []
            current.push(page)
            regions.set(region, current)
            return regions
          }, new Map<string, typeof records>()),
        ).sort(([a], [b]) =>
          a.localeCompare(b, undefined, {
            numeric: true,
            sensitivity: "base",
          }),
        )
      : []

  const personnelSelectionCss =
    config.kind === "personnel"
      ? personnelRegions
          .map(([region]) => {
            const token = regionToken(region)

            return `
              #personnel-region-${token}:checked
                ~ .prime-personnel-regions__selector {
                display: none;
              }

              #personnel-region-${token}:checked
                ~ .prime-personnel-regions__archives
                #region-${token} {
                display: block;
              }
            `
          })
          .join("\n")
      : ""

  const factionThemeCss =
    config.kind === "factions"
      ? records
          .map((page) => {
            const fm = page.frontmatter ?? {}
            const id = cssToken(text(fm.id) ?? page.slug ?? "unindexed")
            const theme = record(fm.theme)

            const primary = text(theme?.primary) ?? "#64717b"
            const secondary = text(theme?.secondary) ?? "#111821"
            const accent = text(theme?.accent) ?? "#64d7ff"

            return `
              .prime-registry-card--faction[data-faction-id="${id}"] {
                --faction-primary: ${primary};
                --faction-secondary: ${secondary};
                --faction-accent: ${accent};
              }
            `
          })
          .join("\n")
      : ""

  return (
    <main class={`prime-registry prime-registry--${config.kind}`}>
      {factionThemeCss && (
        <style dangerouslySetInnerHTML={{ __html: factionThemeCss }} />
      )}
      <div class="prime-registry__heading">
        <div>
          <span>{config.eyebrow}</span>
          <h2>{config.title}</h2>
        </div>

        <strong>
          {records.length} {records.length === 1 ? "RECORD" : "RECORDS"}
        </strong>
      </div>

      {config.kind === "personnel" && records.length > 0 ? (
        <div class="prime-personnel-regions">
          {personnelSelectionCss && (
            <style dangerouslySetInnerHTML={{ __html: personnelSelectionCss }} />
          )}

          <input
            id="personnel-region-all"
            class="prime-personnel-regions__radio"
            type="radio"
            name="personnel-region-selection"
            checked
            aria-hidden="true"
          />

          {personnelRegions.map(([region]) => {
            const token = regionToken(region)

            return (
              <input
                id={`personnel-region-${token}`}
                class="prime-personnel-regions__radio"
                type="radio"
                name="personnel-region-selection"
                aria-hidden="true"
              />
            )
          })}

          <div class="prime-personnel-regions__selector">
            <div class="prime-personnel-regions__intro">
              <span>REGIONAL INDEX</span>
              <p>
                Select an operational region to access its published personnel records.
              </p>
            </div>

            <div class="prime-personnel-regions__grid">
              {personnelRegions.map(([region, pages]) => {
                const token = regionToken(region)

                return (
                  <label
                    for={`personnel-region-${token}`}
                    class="prime-personnel-region-card"
                  >
                    <div class="prime-personnel-region-card__top">
                      <span>REGIONAL PERSONNEL ARCHIVE</span>
                      <strong>{pages.length.toString().padStart(2, "0")}</strong>
                    </div>

                    <div class="prime-personnel-region-card__body">
                      <span>OPERATIONAL REGION</span>
                      <h3>{region}</h3>
                      <p>
                        {pages.length} published {pages.length === 1 ? "record" : "records"} indexed in this archive.
                      </p>
                    </div>

                    <div class="prime-personnel-region-card__footer">
                      <span>OPEN REGIONAL ARCHIVE →</span>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          <div class="prime-personnel-regions__archives">
            {personnelRegions.map(([region, pages]) => {
              const token = regionToken(region)

              return (
                <section
                  id={`region-${token}`}
                  class="prime-personnel-region"
                >
                  <div class="prime-personnel-region__heading">
                    <div>
                      <span>REGIONAL PERSONNEL ARCHIVE</span>
                      <h2>{region}</h2>
                    </div>

                    <div class="prime-personnel-region__actions">
                      <strong>
                        {pages.length} {pages.length === 1 ? "RECORD" : "RECORDS"}
                      </strong>

                      <label
                        for="personnel-region-all"
                        class="prime-personnel-region__back"
                      >
                        ← ALL REGIONS
                      </label>
                    </div>
                  </div>

                  <div class="prime-registry__grid">
                    {pages.map((page) => {
                      const fm = page.frontmatter ?? {}
                      const title = text(fm.title) ?? page.slug ?? "Unknown Record"
                      const id = text(fm.id) ?? "UNINDEXED"
                      const description =
                        text(fm.description) ??
                        `Public archive record for ${title}.`
                      const classification =
                        text(fm.classification) ??
                        [text(fm.species), text(fm.role)]
                          .filter(Boolean)
                          .join(" · ")
                      const location = text(fm.location)
                      const href = `/${page.slug}`

                      return (
                        <article class="prime-registry-card">
                          <div class="prime-registry-card__top">
                            <span>{config.cardLabel}</span>
                            <strong>{id}</strong>
                          </div>

                          <div class="prime-registry-card__body">
                            <h3>{title}</h3>

                            {classification && (
                              <p class="prime-registry-card__classification">
                                {classification}
                              </p>
                            )}

                            <p class="prime-registry-card__description">
                              {description}
                            </p>

                            {location && (
                              <div class="prime-registry-card__location">
                                <span>LOCATION</span>
                                <strong>{location}</strong>
                              </div>
                            )}
                          </div>

                          <div class="prime-registry-card__footer">
                            <a
                              href={href}
                              class="internal"
                              data-no-popover="true"
                            >
                              {config.openLabel}
                            </a>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>
        </div>
      ) : records.length === 0 ? (
        <div class="prime-registry__empty">{config.empty}</div>
      ) : (
        <div class="prime-registry__grid">
          {records.map((page) => {
            const fm = page.frontmatter ?? {}

            const title =
              text(fm.title) ??
              page.slug ??
              "Unknown Record"

            const id =
              text(fm.id) ??
              "UNINDEXED"

            const description =
              text(fm.description) ??
              `Public archive record for ${title}.`

            const classification =
              text(fm.classification) ??
              (config.kind === "personnel"
                ? [text(fm.species), text(fm.role)]
                    .filter(Boolean)
                    .join(" · ")
                : text(fm.category) ?? config.classificationFallback)

            const metaValue =
              config.metaField === "scope"
                ? text(fm.scope)
                : config.metaField === "location"
                  ? text(fm.location)
                  : undefined

            const image =
              config.kind === "factions"
                ? text(fm.image)
                : undefined

            const factionId =
              config.kind === "factions"
                ? cssToken(id)
                : undefined

            const href = `/${page.slug}`

            if (config.kind === "factions") {
              return (
                <article
                  class="prime-registry-card prime-registry-card--faction"
                  data-faction-id={factionId}
                >
                  <div class="prime-registry-card__top">
                    <span>{config.cardLabel}</span>
                    <strong>{id}</strong>
                  </div>

                  <div class="prime-faction-card__main">
                    <div class="prime-faction-card__visual">
                      {image ? (
                        <img
                          src={image}
                          alt={`${title} insignia`}
                          loading="lazy"
                        />
                      ) : (
                        <div class="prime-faction-card__placeholder">
                          NO INSIGNIA
                        </div>
                      )}
                    </div>

                    <div class="prime-faction-card__content">
                      <div class="prime-faction-card__classification">
                        {classification}
                      </div>

                      <h3>{title}</h3>

                      <div class="prime-faction-card__rule"></div>

                      <p class="prime-registry-card__description">
                        {description}
                      </p>

                      {metaValue && (
                        <div class="prime-faction-card__scope">
                          <span>{config.metaLabel}</span>
                          <strong>{metaValue}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  <div class="prime-faction-card__bottom">
                    <div class="prime-faction-card__intel">
                      <span>ARCHIVE STATUS</span>
                      <strong>PUBLIC DOSSIER</strong>
                    </div>

                    <a
                      href={href}
                      class="internal prime-faction-card__open"
                      data-no-popover="true"
                    >
                      {config.openLabel}
                    </a>
                  </div>
                </article>
              )
            }

            return (
              <article class="prime-registry-card">
                <div class="prime-registry-card__top">
                  <span>{config.cardLabel}</span>
                  <strong>{id}</strong>
                </div>

                <div class="prime-registry-card__body">
                  <h3>{title}</h3>

                  {classification && (
                    <p class="prime-registry-card__classification">
                      {classification}
                    </p>
                  )}

                  <p class="prime-registry-card__description">
                    {description}
                  </p>

                  {metaValue && (
                    <div class="prime-registry-card__location">
                      <span>{config.metaLabel}</span>
                      <strong>{metaValue}</strong>
                    </div>
                  )}
                </div>

                <div class="prime-registry-card__footer">
                  <a
                    href={href}
                    class="internal"
                    data-no-popover="true"
                  >
                    {config.openLabel}
                  </a>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </main>
  )
}

ArchiveRegistry.css = `
.prime-registry {
  width: 100%;
  margin-top: 0.75rem;
}

.prime-registry__heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.prime-registry__heading > div {
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
}

.prime-registry__heading span,
.prime-registry__heading > strong,
.prime-registry-card__top,
.prime-registry-card__location span,
.prime-registry-card__footer a,
.prime-faction-card__classification,
.prime-faction-card__scope span,
.prime-faction-card__intel,
.prime-faction-card__open {
  font-family: var(--codeFont);
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.prime-registry__heading span {
  color: #64d7ff;
  font-size: 0.6rem;
}

.prime-registry__heading h2 {
  margin: 0;
  color: #f5f9fc;
  font-size: 1.35rem;
}

.prime-registry__heading > strong {
  color: var(--gray);
  font-size: 0.6rem;
}

.prime-registry__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  width: 100%;
}

.prime-registry-card {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 265px;
  flex-direction: column;
  padding: 1.15rem;
  overflow: hidden;
  border: 1px solid rgba(100, 215, 255, 0.2);
  border-radius: 14px;
  background:
    radial-gradient(
      circle at 100% 0%,
      color-mix(
        in srgb,
        var(--faction-primary) 13%,
        transparent
      ),
      transparent 45%
    ),
    linear-gradient(
      145deg,
      rgba(18, 29, 43, 0.97),
      rgba(9, 14, 22, 0.99)
    );
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
}

.prime-registry-card::after {
  position: absolute;
  top: 1.15rem;
  right: 1.15rem;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #64d7ff;
  box-shadow: 0 0 9px rgba(100, 215, 255, 0.8);
  content: "";
}

.prime-registry-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-right: 1rem;
  color: #64d7ff;
  font-size: 0.56rem;
}

.prime-registry-card__top strong {
  color: var(--gray);
  font-size: inherit;
}

.prime-registry-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  padding-top: 2.35rem;
}

.prime-registry-card__body h3 {
  margin: 0;
  color: #f5f9fc;
  font-size: clamp(1.45rem, 2vw, 1.9rem);
  line-height: 1.05;
  overflow-wrap: anywhere;
}

.prime-registry-card__classification {
  margin: 0.45rem 0 0 !important;
  color: #8ea7bb;
  font-size: 0.82rem;
}

.prime-registry-card__description {
  margin: 1rem 0 0 !important;
  color: #c9d6df;
  font-size: 0.84rem;
  line-height: 1.5;
}

.prime-registry-card__location {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding-top: 0.8rem;
  margin-top: auto;
}

.prime-registry-card__location span {
  color: var(--gray);
  font-size: 0.52rem;
}

.prime-registry-card__location strong {
  color: #d6e2ec;
  font-size: 0.78rem;
}

.prime-registry-card__footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 0.9rem;
  margin-top: 0.9rem;
  border-top: 1px solid rgba(100, 215, 255, 0.09);
}

.prime-registry-card__footer a {
  color: #64d7ff;
  font-size: 0.55rem;
  text-decoration: none;
}

.prime-registry-card__footer a:hover {
  color: #ffffff;
}

.prime-registry__empty {
  padding: 1.5rem;
  border: 1px dashed rgba(100, 215, 255, 0.18);
  border-radius: 10px;
  color: var(--gray);
  text-align: center;
}

/* =========================================================
   PERSONNEL REGISTRY — REGIONAL INDEX
   ========================================================= */

.prime-personnel-regions {
  width: 100%;
}

.prime-personnel-regions__intro {
  margin-bottom: 1.1rem;
}

.prime-personnel-regions__intro span,
.prime-personnel-region-card__top,
.prime-personnel-region-card__body > span,
.prime-personnel-region-card__footer,
.prime-personnel-region__heading span,
.prime-personnel-region__actions {
  font-family: var(--codeFont);
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.prime-personnel-regions__intro span {
  color: #64d7ff;
  font-size: 0.58rem;
}

.prime-personnel-regions__intro p {
  max-width: 720px;
  margin: 0.4rem 0 0 !important;
  color: #9fb0bd;
  font-size: 0.86rem;
  line-height: 1.55;
}

.prime-personnel-regions__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.prime-personnel-regions__radio {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.prime-personnel-region-card {
  position: relative;
  display: flex;
  min-height: 245px;
  flex-direction: column;
  padding: 1.25rem;
  overflow: hidden;
  border: 1px solid rgba(100, 215, 255, 0.24);
  border-radius: 14px;
  background:
    radial-gradient(
      circle at 100% 0%,
      rgba(100, 215, 255, 0.11),
      transparent 48%
    ),
    linear-gradient(
      145deg,
      rgba(18, 29, 43, 0.98),
      rgba(7, 12, 19, 0.995)
    );
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2);
  color: inherit;
  text-decoration: none;
  cursor: pointer;
}

.prime-personnel-region-card::after {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #64d7ff;
  box-shadow: 0 0 10px rgba(100, 215, 255, 0.85);
  content: "";
}

.prime-personnel-region-card:hover {
  border-color: rgba(100, 215, 255, 0.48);
  background:
    radial-gradient(
      circle at 100% 0%,
      rgba(100, 215, 255, 0.16),
      transparent 48%
    ),
    linear-gradient(
      145deg,
      rgba(20, 34, 49, 0.99),
      rgba(7, 12, 19, 0.995)
    );
}

.prime-personnel-region-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-right: 1.1rem;
  color: #64d7ff;
  font-size: 0.56rem;
}

.prime-personnel-region-card__top strong {
  color: #8ea7bb;
  font-size: 0.68rem;
}

.prime-personnel-region-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  padding: 2rem 0 1.5rem;
}

.prime-personnel-region-card__body > span {
  color: #6f8595;
  font-size: 0.52rem;
}

.prime-personnel-region-card__body h3 {
  margin: 0.45rem 0 0;
  color: #f5f9fc;
  font-size: clamp(1.8rem, 3vw, 2.8rem);
  line-height: 1;
  letter-spacing: -0.035em;
}

.prime-personnel-region-card__body p {
  margin: 0.8rem 0 0 !important;
  color: #aebdc8;
  font-size: 0.82rem;
}

.prime-personnel-region-card__footer {
  padding-top: 0.9rem;
  border-top: 1px solid rgba(100, 215, 255, 0.1);
  color: #64d7ff;
  font-size: 0.55rem;
  text-align: right;
}

.prime-personnel-regions__archives {
  margin-top: 1rem;
}

.prime-personnel-region {
  display: none;
  scroll-margin-top: 1rem;
}



.prime-personnel-region__heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem 0;
  border-top: 1px solid rgba(100, 215, 255, 0.12);
  border-bottom: 1px solid rgba(100, 215, 255, 0.12);
}

.prime-personnel-region__heading > div:first-child {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.prime-personnel-region__heading span {
  color: #64d7ff;
  font-size: 0.56rem;
}

.prime-personnel-region__heading h2 {
  margin: 0;
  color: #f5f9fc;
  font-size: 1.55rem;
}

.prime-personnel-region__actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.54rem;
}

.prime-personnel-region__actions strong {
  color: #7f94a4;
}

.prime-personnel-region__back {
  color: #64d7ff;
  cursor: pointer;
}

.prime-personnel-region__back:hover {
  color: #ffffff;
}

@media all and (max-width: 850px) {
  .prime-personnel-regions__grid {
    grid-template-columns: 1fr;
  }

  .prime-personnel-region__heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .prime-personnel-region__actions {
    width: 100%;
    justify-content: space-between;
  }
}

/* =========================================================
   FACTION REGISTRY — DOSSIER LAYOUT
   ========================================================= */

.prime-registry--factions .prime-registry__grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.prime-registry--factions .prime-registry-card {
  min-height: 520px;
}

.prime-registry-card--faction {
  display: flex;
  flex-direction: column;
  padding: clamp(1.2rem, 2vw, 1.8rem);
  border-color: color-mix(
    in srgb,
    var(--faction-accent) 48%,
    transparent
  );
  background:
    radial-gradient(
      circle at 88% 4%,
      color-mix(in srgb, var(--faction-accent) 15%, transparent),
      transparent 22rem
    ),
    radial-gradient(
      circle at 7% 88%,
      color-mix(in srgb, var(--faction-primary) 18%, transparent),
      transparent 25rem
    ),
    linear-gradient(
      color-mix(
        in srgb,
        var(--faction-accent) 2.5%,
        transparent
      ) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      color-mix(
        in srgb,
        var(--faction-primary) 2.5%,
        transparent
      ) 1px,
      transparent 1px
    ),
    linear-gradient(
      145deg,
      color-mix(
        in srgb,
        var(--faction-secondary) 48%,
        rgba(14, 25, 38, 0.99)
      ),
      color-mix(
        in srgb,
        var(--faction-secondary) 32%,
        rgba(6, 12, 20, 0.995)
      )
    );
  background-size: auto, auto, 32px 32px, 32px 32px, auto;
}

.prime-registry-card--faction::after {
  background: var(--faction-accent);
  box-shadow:
    0 0 11px color-mix(
      in srgb,
      var(--faction-accent) 82%,
      transparent
    );
}

.prime-registry-card--faction .prime-registry-card__top {
  color: var(--faction-accent);
  font-size: 0.62rem;
}

.prime-faction-card__main {
  display: grid;
  grid-template-columns: minmax(190px, 0.8fr) minmax(0, 1.45fr);
  gap: clamp(1.5rem, 3vw, 2.5rem);
  align-items: start;
  margin-top: 1.75rem;
  flex: 1;
}

.prime-faction-card__visual {
  position: relative;
  width: 100%;
  max-width: 300px;
  aspect-ratio: 1 / 1;
  display: grid;
  place-items: center;
  overflow: hidden;
  padding: 16px;
  box-sizing: border-box;
  border: 1px solid color-mix(
    in srgb,
    var(--faction-primary) 42%,
    transparent
  );
  border-radius: 12px;
  background:
    linear-gradient(
      145deg,
      rgba(12, 20, 30, 0.96),
      rgba(4, 8, 13, 0.98)
    );
  box-shadow:
    0 18px 38px rgba(0, 0, 0, 0.32),
    inset 0 0 0 3px color-mix(
      in srgb,
      var(--faction-primary) 5%,
      transparent
    );
}

.prime-faction-card__visual::before,
.prime-faction-card__visual::after {
  position: absolute;
  width: 28px;
  height: 28px;
  content: "";
  pointer-events: none;
}

.prime-faction-card__visual::before {
  top: 7px;
  left: 7px;
  border-top: 2px solid var(--faction-accent);
  border-left: 2px solid var(--faction-accent);
}

.prime-faction-card__visual::after {
  right: 7px;
  bottom: 7px;
  border-right: 2px solid var(--faction-primary);
  border-bottom: 2px solid var(--faction-primary);
}

.prime-faction-card__visual img {
  display: block;
  width: calc(100% - 8px);
  height: calc(100% - 8px);
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  object-position: center;
  border-radius: 6px;
}

.prime-faction-card__placeholder {
  color: var(--gray);
  font-family: var(--codeFont);
  font-size: 0.7rem;
  letter-spacing: 0.12em;
}

.prime-faction-card__content {
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
}

.prime-faction-card__classification {
  display: inline-flex;
  padding: 0.5rem 0.65rem;
  border: 1px solid color-mix(
    in srgb,
    var(--faction-accent) 40%,
    transparent
  );
  border-radius: 7px;
  color: var(--faction-accent);
  background: color-mix(
    in srgb,
    var(--faction-accent) 7%,
    transparent
  );
  font-size: 0.6rem;
}

.prime-faction-card__content h3 {
  margin: 0.9rem 0 0;
  color: #f7f9fb;
  font-size: clamp(2rem, 3.3vw, 3.4rem);
  font-weight: 800;
  line-height: 0.98;
  letter-spacing: -0.045em;
  overflow-wrap: normal;
  word-break: normal;
}

.prime-registry-card--faction .prime-faction-card__content h3 {
  text-shadow:
    0 0 28px color-mix(
      in srgb,
      var(--faction-primary) 15%,
      transparent
    );
}

.prime-registry-card--faction .prime-faction-card__scope strong,
.prime-registry-card--faction .prime-faction-card__intel strong {
  color: color-mix(
    in srgb,
    var(--faction-primary) 24%,
    #eef4f7
  );
}

.prime-faction-card__rule {
  width: min(440px, 70%);
  height: 2px;
  margin-top: 1.2rem;
  background:
    linear-gradient(
      90deg,
      var(--faction-accent),
      var(--faction-primary),

      transparent
    );
}

.prime-faction-card__content .prime-registry-card__description {
  max-width: 760px;
  margin-top: 1.4rem !important;
  color: #b9c8d2;
  font-size: 1rem;
  line-height: 1.7;
}

.prime-faction-card__scope {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-top: auto;
  padding-top: 1.6rem;
}

.prime-faction-card__scope span {
  color: color-mix(
    in srgb,
    var(--faction-primary) 72%,
    #587488
  );
  font-size: 0.52rem;
}

.prime-faction-card__scope strong {
  color: #eef4f7;
  font-size: 0.95rem;
}

.prime-faction-card__bottom {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
  margin-top: auto;
  padding-top: 1.2rem;
  border-top: 1px solid color-mix(
    in srgb,
    var(--faction-accent) 18%,
    transparent
  );
}

.prime-faction-card__intel {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  color: #587488;
  font-size: 0.5rem;
}

.prime-faction-card__intel strong {
  color: #9eb4c2;
  font-size: 0.65rem;
}

.prime-faction-card__open {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0.75rem 1rem;
  border: 1px solid color-mix(
    in srgb,
    var(--faction-accent) 48%,
    transparent
  );
  border-radius: 8px;
  color: var(--faction-accent);
  background: color-mix(
    in srgb,
    var(--faction-accent) 7%,
    transparent
  );
  font-size: 0.58rem;
  text-decoration: none;
}

.prime-faction-card__open:hover {
  border-color: color-mix(
    in srgb,
    var(--faction-accent) 78%,
    white
  );
  color: #ffffff;
  background: color-mix(
    in srgb,
    var(--faction-accent) 14%,
    transparent
  );
}

@media all and (max-width: 1150px) {
  .prime-registry--factions .prime-registry__grid {
    grid-template-columns: 1fr;
  }
}

@media all and (max-width: 1000px) {
  .prime-registry:not(.prime-registry--factions) .prime-registry__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media all and (max-width: 850px) {
  .prime-registry__heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .prime-faction-card__main {
    grid-template-columns: 1fr;
  }

  .prime-faction-card__visual {
    width: min(100%, 340px);
    max-width: 340px;
  }

  .prime-faction-card__content h3 {
    font-size: clamp(2.3rem, 8vw, 3.5rem);
  }
}

@media all and (max-width: 650px) {
  .prime-registry:not(.prime-registry--factions) .prime-registry__grid {
    grid-template-columns: 1fr;
  }

  .prime-registry-card--faction {
    padding: 1rem;
  }

  .prime-faction-card__main {
    margin-top: 1.35rem;
    gap: 1.35rem;
  }

  .prime-faction-card__visual {
    width: 100%;
    max-width: none;
  }

  .prime-faction-card__content h3 {
    font-size: clamp(2.15rem, 12vw, 3.2rem);
  }

  .prime-faction-card__content .prime-registry-card__description {
    font-size: 0.94rem;
  }

  .prime-faction-card__bottom {
    align-items: stretch;
    flex-direction: column;
  }

  .prime-faction-card__open {
    width: 100%;
  }
}
`

export default ArchiveRegistry