import {
  QuartzComponent,
  QuartzComponentProps,
} from "../types"

type RegistryKind = "locations" | "personnel"

type RegistryConfig = {
  kind: RegistryKind
  eyebrow: string
  title: string
  empty: string
  cardLabel: string
  openLabel: string
}

const REGISTRIES: Record<string, RegistryConfig> = {
  "02-locations": {
    kind: "locations",
    eyebrow: "LOCATION DATABASE",
    title: "Locations",
    empty: "No published location records found.",
    cardLabel: "LOCATION RECORD",
    openLabel: "OPEN LOCATION →",
  },
  "05-npcs": {
    kind: "personnel",
    eyebrow: "PERSONNEL DATABASE",
    title: "Personnel",
    empty: "No published personnel records found.",
    cardLabel: "PERSONNEL RECORD",
    openLabel: "OPEN RECORD →",
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

  return (
    <main class={`prime-registry prime-registry--${config.kind}`}>
      <div class="prime-registry__heading">
        <div>
          <span>{config.eyebrow}</span>
          <h2>{config.title}</h2>
        </div>

        <strong>
          {records.length} {records.length === 1 ? "RECORD" : "RECORDS"}
        </strong>
      </div>

      {records.length === 0 ? (
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
                : text(fm.category) ?? "Location")

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
.prime-registry-card__footer a {
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
      rgba(100, 215, 255, 0.08),
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
  border-radius: 12px;
  color: var(--gray);
  text-align: center;
}

@media all and (max-width: 1000px) {
  .prime-registry__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media all and (max-width: 650px) {
  .prime-registry__heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .prime-registry__grid {
    grid-template-columns: 1fr;
  }
}
`

export default ArchiveRegistry
