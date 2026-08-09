import { resolveRelative } from "../../../util/path"
import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "../../types"

type PersonnelFrontmatter = {
  title?: string
  id?: string
  type?: string
  species?: string
  role?: string
  location?: string
  image?: string
  imageLayout?: "portrait" | "wide" | "none"
}

const PersonnelOS: QuartzComponent = ({
  fileData,
  allFiles,
}: QuartzComponentProps) => {
  const personnel = allFiles
    .filter((page) => {
      const slug = page.slug ?? ""
      const frontmatter = (page.frontmatter ?? {}) as PersonnelFrontmatter

      return (
        slug.startsWith("03-personnel/") &&
        slug !== "03-personnel/index" &&
        frontmatter.type === "npc"
      )
    })
    .sort((a, b) => {
      const aTitle =
        ((a.frontmatter ?? {}) as PersonnelFrontmatter).title ?? ""

      const bTitle =
        ((b.frontmatter ?? {}) as PersonnelFrontmatter).title ?? ""

      return aTitle.localeCompare(bTitle)
    })

  return (
    <main class="personnel-os">
      <header class="personnel-os__header">
        <div>
          <p class="personnel-os__eyebrow">
            Prime Archives Terminal
          </p>

          <h1>
            Personnel
          </h1>

          <p class="personnel-os__subtitle">
            Known contacts, figures and hostile actors recorded in the public archives.
          </p>
        </div>

        <div class="personnel-os__registry">
          <span>
            PERSONNEL REGISTRY
          </span>

          <strong>
            {personnel.length.toString().padStart(2, "0")} RECORDS
          </strong>
        </div>
      </header>

      {personnel.length > 0 ? (
        <section
          class="personnel-grid"
          aria-label="Personnel records"
        >
          {personnel.map((page) => {
            const frontmatter =
              (page.frontmatter ?? {}) as PersonnelFrontmatter

            const title = frontmatter.title ?? "Unknown Record"
            const id = frontmatter.id ?? "UNREGISTERED"
            const species = frontmatter.species
            const role = frontmatter.role
            const location = frontmatter.location
            const image = frontmatter.image

            return (
              <article class="personnel-card">
                <a
                  href={resolveRelative(fileData.slug!, page.slug!)}
                  class="personnel-card__link"
                  data-no-popover="true"
                >
                  {image && (
                    <div class="personnel-card__image">
                      <img
                        src={image}
                        alt={title}
                        loading="lazy"
                      />

                      <div
                        class="personnel-card__scanline"
                        aria-hidden="true"
                      ></div>
                    </div>
                  )}

                  <div class="personnel-card__body">
                    <div class="personnel-card__top">
                      <span class="personnel-card__label">
                        PERSONNEL RECORD
                      </span>

                      <span class="personnel-card__id">
                        {id}
                      </span>
                    </div>

                    <h2>
                      {title}
                    </h2>

                    {(species || role) && (
                      <p class="personnel-card__classification">
                        {[species, role]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}

                    {location && (
                      <div class="personnel-card__location">
                        <span>
                          LAST KNOWN LOCATION
                        </span>

                        <strong>
                          {location}
                        </strong>
                      </div>
                    )}

                    <div class="personnel-card__footer">
                      <span class="personnel-card__status">
                        <i aria-hidden="true"></i>
                        ARCHIVE ONLINE
                      </span>

                      <span class="personnel-card__open">
                        OPEN RECORD →
                      </span>
                    </div>
                  </div>
                </a>
              </article>
            )
          })}
        </section>
      ) : (
        <section class="personnel-os__empty">
          <span>
            NO PUBLIC RECORDS
          </span>

          <p>
            Personnel registry awaiting synchronization.
          </p>
        </section>
      )}
    </main>
  )
}

PersonnelOS.css = `
.personnel-os {
  width: min(100%, 1400px);
  min-height: 100vh;
  padding: clamp(1.5rem, 3vw, 3rem);
  margin: 0 auto;
}

.personnel-os__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(100, 215, 255, 0.16);
}

.personnel-os__eyebrow {
  margin: 0 0 0.6rem;
  color: #64d7ff;
  font-family: var(--codeFont);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.personnel-os__header h1 {
  margin: 0;
  color: #fff;
  font-size: clamp(3rem, 6vw, 5rem);
  line-height: 0.95;
  letter-spacing: -0.055em;
}

.personnel-os__subtitle {
  max-width: 650px;
  margin: 0.8rem 0 0;
  color: var(--darkgray);
  font-size: 1.05rem;
}

.personnel-os__registry {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.3rem;
  font-family: var(--codeFont);
}

.personnel-os__registry span {
  color: var(--gray);
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.15em;
}

.personnel-os__registry strong {
  color: #64d7ff;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
}

.personnel-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;
  width: 100%;
}

.personnel-card {
  min-width: 0;
  margin: 0;
}

.personnel-card__link {
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 360px;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(100, 215, 255, 0.16);
  border-radius: 17px;
  background:
    radial-gradient(
      circle at 100% 0%,
      rgba(139, 108, 255, 0.09),
      transparent 45%
    ),
    linear-gradient(
      145deg,
      rgba(18, 29, 43, 0.96),
      rgba(9, 14, 22, 0.98)
    );
  color: inherit;
  text-decoration: none;
  box-shadow:
    0 18px 45px rgba(0, 0, 0, 0.2),
    inset 0 0 30px rgba(100, 215, 255, 0.015);
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.personnel-card__link:hover {
  transform: translateY(-5px);
  border-color: rgba(100, 215, 255, 0.48);
  box-shadow:
    0 24px 55px rgba(0, 0, 0, 0.3),
    0 0 30px rgba(100, 215, 255, 0.08);
  text-shadow: none;
}

.personnel-card__image {
  position: relative;
  width: 100%;
  height: 230px;
  overflow: hidden;
  border-bottom: 1px solid rgba(100, 215, 255, 0.12);
  background: #070b11;
}

.personnel-card__image::after {
  position: absolute;
  inset: 0;
  content: "";
  pointer-events: none;
  background:
    linear-gradient(
      0deg,
      rgba(9, 14, 22, 0.88) 0%,
      rgba(9, 14, 22, 0.18) 42%,
      transparent 70%
    );
}

.personnel-card__image img {
  display: block;
  width: 100%;
  height: 100%;
  margin: 0;
  object-fit: cover;
  object-position: center;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  transition: transform 260ms ease;
}

.personnel-card__link:hover .personnel-card__image img {
  transform: scale(1.025);
}

.personnel-card__scanline {
  position: absolute;
  z-index: 2;
  inset: 0;
  pointer-events: none;
  opacity: 0.12;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 3px,
    rgba(100, 215, 255, 0.08) 4px
  );
}

.personnel-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 1.2rem 1.3rem;
}

.personnel-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.8rem;
}

.personnel-card__label,
.personnel-card__id {
  font-family: var(--codeFont);
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.15em;
}

.personnel-card__label {
  color: #64d7ff;
}

.personnel-card__id {
  color: var(--gray);
}

.personnel-card h2 {
  margin: 0;
  color: #f5f9fc;
  font-size: 1.6rem;
  line-height: 1.05;
  letter-spacing: -0.04em;
}

.personnel-card__classification {
  margin: 0.45rem 0 0;
  color: var(--darkgray);
  font-size: 0.9rem;
}

.personnel-card__location {
  display: flex;
  flex-direction: column;
  gap: 0.22rem;
  padding-top: 0.9rem;
  margin-top: 1rem;
  border-top: 1px solid rgba(100, 215, 255, 0.1);
}

.personnel-card__location span {
  color: var(--gray);
  font-family: var(--codeFont);
  font-size: 0.55rem;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.personnel-card__location strong {
  color: #c9d6df;
  font-size: 0.86rem;
  font-weight: 600;
}

.personnel-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1rem;
  margin-top: auto;
}

.personnel-card__status,
.personnel-card__open {
  font-family: var(--codeFont);
  font-size: 0.56rem;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.personnel-card__status {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #7fffc1;
}

.personnel-card__status i {
  display: block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
}

.personnel-card__open {
  color: #64d7ff;
}

.personnel-os__empty {
  padding: 4rem 2rem;
  border: 1px dashed rgba(100, 215, 255, 0.2);
  border-radius: 16px;
  color: var(--gray);
  text-align: center;
}

.personnel-os__empty span {
  color: #64d7ff;
  font-family: var(--codeFont);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.18em;
}

@media all and (max-width: 1050px) {
  .personnel-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media all and (max-width: 700px) {
  .personnel-os {
    padding: 1rem;
  }

  .personnel-os__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .personnel-os__registry {
    align-items: flex-start;
  }

  .personnel-grid {
    grid-template-columns: 1fr;
  }

  .personnel-card__image {
    height: 240px;
  }
}
`

export default (() => PersonnelOS) satisfies QuartzComponentConstructor
