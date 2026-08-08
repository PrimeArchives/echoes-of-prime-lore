interface ArchiveCardProps {
  title: string
  description: string
  href: string
  icon: string
  status?: string
  category?: "archive" | "tool"
}

export default function ArchiveCard({
  title,
  description,
  href,
  icon,
  status = "ONLINE",
  category = "archive",
}: ArchiveCardProps) {
  const normalizedStatus = status.toLowerCase()

  return (
    <a
      class={`archive-card ${category}`}
      href={href}
      data-status={normalizedStatus}
      data-no-popover="true"
    >
      <div class="archive-card-top">
        <span class="archive-label">
          {category === "tool"
            ? "FIELD APPLICATION"
            : "DATABASE MODULE"}
        </span>

        <span
          class="archive-led"
          aria-hidden="true"
        ></span>
      </div>

      <div class="archive-card-header">
        <div class="archive-card-icon">
          {icon}
        </div>

        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>

      <div class="archive-card-footer">
        <span class="archive-card-status">
          <span
            class="archive-card-status__dot"
            aria-hidden="true"
          ></span>

          {status.toUpperCase()}
        </span>

        <span class="archive-open">
          {normalizedStatus === "online" ||
          normalizedStatus === "available"
            ? "OPEN →"
            : "MODULE LOCKED"}
        </span>
      </div>
    </a>
  )
}