import { FullSlug, isFolderPath, resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { Date, getDate } from "./Date"
import { QuartzComponent, QuartzComponentProps } from "./types"

export type SortFn = (f1: QuartzPluginData, f2: QuartzPluginData) => number

export function byDateAndAlphabetical(): SortFn {
  return (f1, f2) => {
    if (f1.dates && f2.dates) {
      return getDate(f2)!.getTime() - getDate(f1)!.getTime()
    } else if (f1.dates && !f2.dates) {
      return -1
    } else if (!f1.dates && f2.dates) {
      return 1
    }

    const f1Title = f1.frontmatter?.title?.toLowerCase() ?? ""
    const f2Title = f2.frontmatter?.title?.toLowerCase() ?? ""

    return f1Title.localeCompare(f2Title)
  }
}

export function byDateAndAlphabeticalFolderFirst(): SortFn {
  return (f1, f2) => {
    const f1IsFolder = isFolderPath(f1.slug ?? "")
    const f2IsFolder = isFolderPath(f2.slug ?? "")

    if (f1IsFolder && !f2IsFolder) return -1
    if (!f1IsFolder && f2IsFolder) return 1

    if (f1.dates && f2.dates) {
      return getDate(f2)!.getTime() - getDate(f1)!.getTime()
    } else if (f1.dates && !f2.dates) {
      return -1
    } else if (!f1.dates && f2.dates) {
      return 1
    }

    const f1Title = f1.frontmatter?.title?.toLowerCase() ?? ""
    const f2Title = f2.frontmatter?.title?.toLowerCase() ?? ""

    return f1Title.localeCompare(f2Title)
  }
}

type Props = {
  limit?: number
  sort?: SortFn
} & QuartzComponentProps

type PersonnelFrontmatter = {
  title?: string
  id?: string
  type?: string
  species?: string
  role?: string
  location?: string
  image?: string
  imageLayout?: "portrait" | "wide" | "none"
  tags?: string[]
}

export const PageList: QuartzComponent = ({
  cfg,
  fileData,
  allFiles,
  limit,
  sort,
}: Props) => {
  const sorter = sort ?? byDateAndAlphabeticalFolderFirst()

  let list = [...allFiles].sort(sorter)

  if (limit) {
    list = list.slice(0, limit)
  }

  const currentSlug = fileData.slug ?? ""

  const isPersonnelPage =
    currentSlug === "03-personnel" ||
    currentSlug === "03-personnel/index"

  if (isPersonnelPage) {
    return (
      <ul class="section-ul personnel-grid">
        {list.map((page) => {
          const frontmatter =
            (page.frontmatter ?? {}) as PersonnelFrontmatter

          const title = frontmatter.title ?? "Unknown Record"
          const id = frontmatter.id
          const species = frontmatter.species
          const role = frontmatter.role
          const location = frontmatter.location
          const image = frontmatter.image

          return (
           <li class="section-li personnel-card">
             <a
              href={resolveRelative(fileData.slug!, page.slug!)}
              class="internal internal-link personnel-card__link"
              data-no-popover="true"
            >
                {image && (
                  <div class="personnel-card__image">
                    <img
                      src={image}
                      alt=""
                      loading="lazy"
                    />
                  </div>
                )}

                <div class="personnel-card__body">
                  <div class="personnel-card__top">
                    <span class="personnel-card__label">
                      PERSONNEL RECORD
                    </span>

                    {id && (
                      <span class="personnel-card__id">
                        {id}
                      </span>
                    )}
                  </div>

                  <h3>
                    {title}
                  </h3>

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
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <ul class="section-ul">
      {list.map((page) => {
        const title = page.frontmatter?.title
        const tags = page.frontmatter?.tags ?? []

        return (
          <li class="section-li">
            <div class="section">
              <p class="meta">
                {page.dates && (
                  <Date
                    date={getDate(page)!}
                    locale={cfg.locale}
                  />
                )}
              </p>

              <div class="desc">
                <h3>
                  <a
                    href={resolveRelative(fileData.slug!, page.slug!)}
                    class="internal internal-link"
                  >
                    {title}
                  </a>
                </h3>
              </div>

              <ul class="tags">
                {tags.map((tag) => (
                  <li>
                    <a
                      class="internal tag-link"
                      href={resolveRelative(
                        fileData.slug!,
                        `tags/${tag}` as FullSlug,
                      )}
                    >
                      {tag}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

PageList.css = `
.section h3 {
  margin: 0;
}

.section > .tags {
  margin: 0;
}

/* =========================================================
   PERSONNEL INDEX
   ========================================================= */

.personnel-grid {
  display: grid;
  grid-template-columns: repeat(3,
