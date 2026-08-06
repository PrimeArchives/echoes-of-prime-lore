import { JSX } from "preact"

export interface ArchiveCardProps {
  title: string
  description: string
  href: string
  icon?: string
  category?: "archive" | "tool"
  status?: string
  recordCount?: number
  locked?: boolean
}

export default function ArchiveCard({
  title,
  description,
  href,
  icon = "◈",
  category = "archive",
  status,
  recordCount,
  locked = false,
}: ArchiveCardProps): JSX.Element {
  return (
    <a
      class={`archive-card ${category} ${locked ? "locked" : ""}`}
      href={href}
      data-no-popover="true"
    >
      <div class="archive-card-top">
        <span class="archive-label">
          {category === "tool" ? "FIELD APPLICATION" : "DATABASE MODULE"}
        </span>

        <span class="archive-led" aria-hidden="true"></span>
      </div>

      <div class="archive-card-header">
        <div class="archive-card-icon">{icon}</div>

        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>

      <div class="archive-card-footer">
        <span>
          {locked
            ? "LOCKED"
            : recordCount !== undefined
              ? `${recordCount} RECORDS`
              : status ?? "ONLINE"}
        </span>

        <span class="archive-open">
          {locked ? "RESTRICTED" : "OPEN →"}
        </span>
      </div>
    </a>
  )
}