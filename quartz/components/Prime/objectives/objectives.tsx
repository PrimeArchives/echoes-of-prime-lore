import { h } from "preact"
import type { Node, Root } from "hast"

import type { QuartzComponent } from "../../types"
import { QuartzPluginData } from "../../../plugins/vfile"
import objectivesStyle from "./objectives.scss"

type ObjectivesProps = {
  allFiles?: QuartzPluginData[]
}

type ObjectiveStatus = "active" | "ongoing" | "passed" | "failed"

type ObjectiveFrontmatter = {
  title?: string
  id?: string
  type?: string
  status?: ObjectiveStatus | string
  priority?: string
  issuer?: string
  location?: string
  description?: string
  objectiveDate?: string
  outcome?: string
  published?: boolean
}

function text(value: unknown) {
  return typeof value === "string" ? value : undefined
}

/**
 * Render Quartz's already processed HTML AST.
 * This is the same approach used by the working Messages field application,
 * so Markdown formatting, links, lists, headings, etc. remain intact.
 */
function renderHast(node: Node): any {
  if (node.type === "root") {
    return (node as Root).children.map((child) => renderHast(child))
  }

  if (node.type === "text") {
    return node.value
  }

  if (node.type === "element") {
    const properties: Record<string, any> = {
      ...(node.properties ?? {}),
    }

    if (properties.className) {
      properties.class = Array.isArray(properties.className)
        ? properties.className.join(" ")
        : properties.className

      delete properties.className
    }

    return h(
      node.tagName,
      properties,
      node.children.map((child) => renderHast(child)),
    )
  }

  return null
}

function normalizeStatus(value: unknown): ObjectiveStatus {
  const status = text(value)?.toLowerCase()

  if (status === "ongoing") return "ongoing"
  if (status === "passed" || status === "completed" || status === "complete") return "passed"
  if (status === "failed" || status === "failure") return "failed"

  return "active"
}

function statusLabel(status: ObjectiveStatus) {
  switch (status) {
    case "ongoing":
      return "ONGOING"
    case "passed":
      return "PASSED"
    case "failed":
      return "FAILED"
    default:
      return "ACTIVE"
  }
}

const STATUS_ORDER: Record<ObjectiveStatus, number> = {
  active: 0,
  ongoing: 1,
  passed: 2,
  failed: 3,
}

function Objectives({
  allFiles = [],
}: ObjectivesProps = {}) {
  const records = allFiles
    .filter((file) => {
      const fm = (file.frontmatter ?? {}) as ObjectiveFrontmatter
      const id = text(fm.id) ?? ""
      const type = text(fm.type)?.toLowerCase()

      return (
        fm.published !== false &&
        (type === "objective" || /^OBJ-\d+$/i.test(id))
      )
    })
    .map((file) => {
      const fm = (file.frontmatter ?? {}) as ObjectiveFrontmatter

      return {
        file,
        fm,
        id: text(fm.id) ?? "OBJ-UNINDEXED",
        title: text(fm.title) ?? "Unknown Objective",
        status: normalizeStatus(fm.status),
      }
    })
    .sort((a, b) => {
      const statusDifference =
        STATUS_ORDER[a.status] - STATUS_ORDER[b.status]

      if (statusDifference !== 0) return statusDifference

      return a.id.localeCompare(b.id, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    })

  const counts: Record<ObjectiveStatus, number> = {
    active: 0,
    ongoing: 0,
    passed: 0,
    failed: 0,
  }

  for (const record of records) {
    counts[record.status] += 1
  }

  if (records.length === 0) {
    return (
      <section class="objectives-os objectives-os--empty">
        <div class="objectives-empty">
          <span>NO OBJECTIVES REGISTERED</span>
          <h1>Mission queue clear.</h1>
          <p>
            Add published OBJ records to the content vault to synchronize this field application.
          </p>
        </div>
      </section>
    )
  }

  const selectionCss = records
    .map(
      (_, index) => `
        #objective-select-${index}:checked
          ~ .objectives-os__workspace
          .objective-entry[data-objective-index="${index}"] {
          border-color: var(--objective-accent);
          background:
            linear-gradient(
              90deg,
              color-mix(in srgb, var(--objective-accent) 13%, transparent),
              transparent 82%
            ),
            rgba(8, 12, 18, 0.94);
          box-shadow:
            inset 3px 0 0 var(--objective-accent),
            0 0 22px color-mix(in srgb, var(--objective-accent) 8%, transparent);
        }

        #objective-select-${index}:checked
          ~ .objectives-os__workspace
          .objective-dossier[data-objective-index="${index}"] {
          display: flex;
        }
      `,
    )
    .join("\n")

  return (
    <section class="objectives-os">
      <style dangerouslySetInnerHTML={{ __html: selectionCss }} />

      {records.map((_, index) => (
        <input
          id={`objective-select-${index}`}
          class="objectives-os__radio"
          type="radio"
          name="objective-selection"
          checked={index === 0}
          aria-hidden="true"
        />
      ))}

      <header class="objectives-os__header">
        <div>
          <p class="objectives-os__eyebrow">
            Mission Control // Synchronized
          </p>

          <h1>Objectives</h1>

          <p class="objectives-os__subtitle">
            Active directives, persistent operations and completed mission records assigned to Echo Squad.
          </p>
        </div>

        <div class="objectives-os__sync">
          <span>MISSION FEED</span>
          <strong>{records.length.toString().padStart(2, "0")} RECORDS</strong>
        </div>
      </header>

      <div class="objectives-status-board" aria-label="Objective status summary">
        <div class="objectives-status-board__item objectives-status-board__item--active">
          <span>ACTIVE</span>
          <strong>{counts.active.toString().padStart(2, "0")}</strong>
        </div>

        <div class="objectives-status-board__item objectives-status-board__item--ongoing">
          <span>ONGOING</span>
          <strong>{counts.ongoing.toString().padStart(2, "0")}</strong>
        </div>

        <div class="objectives-status-board__item objectives-status-board__item--passed">
          <span>PASSED</span>
          <strong>{counts.passed.toString().padStart(2, "0")}</strong>
        </div>

        <div class="objectives-status-board__item objectives-status-board__item--failed">
          <span>FAILED</span>
          <strong>{counts.failed.toString().padStart(2, "0")}</strong>
        </div>
      </div>

      <div class="objectives-os__workspace">
        <aside class="objectives-list-panel">
          <div class="objectives-panel-heading">
            <span>MISSION QUEUE</span>
            <strong>SELECT RECORD</strong>
          </div>

          <div class="objectives-list">
            {records.map((record, index) => {
              const fm = record.fm
              const priority = text(fm.priority) ?? "STANDARD"
              const location = text(fm.location)
              const description =
                text(fm.description) ??
                "No additional objective briefing available."

              return (
                <label
                  for={`objective-select-${index}`}
                  class={`objective-entry objective-entry--${record.status}`}
                  data-objective-index={index}
                >
                  <div class="objective-entry__top">
                    <span class="objective-entry__id">{record.id}</span>

                    <span
                      class={`objective-status objective-status--${record.status}`}
                    >
                      {statusLabel(record.status)}
                    </span>
                  </div>

                  <h2>{record.title}</h2>

                  <p>{description}</p>

                  <div class="objective-entry__meta">
                    <span>{priority.toUpperCase()}</span>
                    {location && <strong>{location}</strong>}
                  </div>
                </label>
              )
            })}
          </div>
        </aside>

        <main class="objectives-detail-panel">
          {records.map((record, index) => {
            const fm = record.fm
            const priority = text(fm.priority) ?? "Standard"
            const issuer = text(fm.issuer) ?? "Archive System"
            const location = text(fm.location) ?? "Unspecified"
            const description =
              text(fm.description) ??
              "No additional objective briefing available."
            const objectiveDate = text(fm.objectiveDate)
            const outcome = text(fm.outcome)

            return (
              <article
                class={`objective-dossier objective-dossier--${record.status}`}
                data-objective-index={index}
              >
                <div class="objective-dossier__inner">
                  <div class="objective-dossier__classification">
                  <span>OBJECTIVE DOSSIER</span>
                  <strong>{record.id}</strong>
                </div>

                <div class="objective-dossier__title-row">
                  <div>
                    <span
                      class={`objective-status objective-status--${record.status}`}
                    >
                      {statusLabel(record.status)}
                    </span>

                    <h2>{record.title}</h2>
                  </div>

                  <div class="objective-dossier__priority">
                    <span>PRIORITY</span>
                    <strong>{priority.toUpperCase()}</strong>
                  </div>
                </div>

                <div class="objective-dossier__divider"></div>

                <dl class="objective-dossier__metadata">
                  <div>
                    <dt>ISSUED BY</dt>
                    <dd>{issuer}</dd>
                  </div>

                  <div>
                    <dt>LOCATION</dt>
                    <dd>{location}</dd>
                  </div>

                  <div>
                    <dt>STATUS</dt>
                    <dd>{statusLabel(record.status)}</dd>
                  </div>

                  {objectiveDate && (
                    <div>
                      <dt>UPDATED</dt>
                      <dd>{objectiveDate}</dd>
                    </div>
                  )}
                </dl>

                <section class="objective-dossier__briefing">
                  <span>MISSION BRIEFING</span>

                  <div class="objective-dossier__briefing-body">
                    {record.file.htmlAst ? (
                      renderHast(record.file.htmlAst)
                    ) : (
                      <p>{description}</p>
                    )}
                  </div>
                </section>

                {outcome && (
                  <section class="objective-dossier__outcome">
                    <span>
                      {record.status === "failed"
                        ? "FAILURE REPORT"
                        : record.status === "passed"
                          ? "MISSION OUTCOME"
                          : "FIELD UPDATE"}
                    </span>

                    <p>{outcome}</p>
                  </section>
                )}

                  <footer class="objective-dossier__footer">
                    <span>
                      PAT-05 // OBJECTIVE TRACKING SYSTEM
                    </span>

                    <strong>
                      {record.status === "passed"
                        ? "RECORD CLOSED"
                        : record.status === "failed"
                          ? "RECORD TERMINATED"
                          : "TRACKING ACTIVE"}
                    </strong>
                  </footer>
                </div>
              </article>
            )
          })}
        </main>
      </div>
    </section>
  )
}

(Objectives as QuartzComponent).css = objectivesStyle

export default Objectives