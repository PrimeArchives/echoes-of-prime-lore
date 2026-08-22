import { QuartzComponentProps } from "../../../types"
import {
  MapLocation,
  MapLocationIcon,
  MapLocationStatus,
  NavigationMap,
} from "../types"

type FrontmatterRecord = Record<string, unknown>

const MAP_ID = "virex-9"

const FALLBACK_MAP: NavigationMap = {
  id: MAP_ID,
  name: "Virex-9",
  description: "Known navigable locations within Virex-9.",
  background: "/static/maps/virex9.webp",
  locations: [],
}

const VALID_STATUSES = new Set<MapLocationStatus>([
  "available",
  "restricted",
  "offline",
])

const VALID_ICONS = new Set<MapLocationIcon>([
  "city",
  "market",
  "bridge",
  "reactor",
  "station",
  "dock",
  "default",
])

function text(value: unknown) {
  return typeof value === "string" ? value : undefined
}

function number(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined
}

function bool(value: unknown) {
  return typeof value === "boolean" ? value : undefined
}

function record(value: unknown) {
  return typeof value === "object" && value !== null
    ? value as FrontmatterRecord
    : undefined
}

function status(value: unknown): MapLocationStatus {
  const candidate =
    text(value)?.toLowerCase() as MapLocationStatus | undefined

  return candidate && VALID_STATUSES.has(candidate)
    ? candidate
    : "available"
}

function icon(value: unknown): MapLocationIcon {
  const candidate =
    text(value)?.toLowerCase() as MapLocationIcon | undefined

  return candidate && VALID_ICONS.has(candidate)
    ? candidate
    : "default"
}

function isPublished(frontmatter: FrontmatterRecord) {
  return frontmatter.published !== false && frontmatter.draft !== true
}

function mapLocation(value: unknown): MapLocation | undefined {
  const marker = record(value)
  if (!marker) return undefined

  const id = text(marker.id)
  const name = text(marker.name)
  const x = number(marker.x)
  const y = number(marker.y)

  if (!id || !name) return undefined
  if (x === undefined || y === undefined) return undefined
  if (x < 0 || x > 100 || y < 0 || y > 100) return undefined

  return {
    id,
    name,
    description:
      text(marker.description) ??
      `Navigation marker for ${name}.`,
    x,
    y,
    discovered:
      bool(marker.discovered) ?? false,
    status:
      status(marker.status),
    icon:
      icon(marker.icon),
  }
}

export function buildVirex9Map(
  allFiles: QuartzComponentProps["allFiles"],
): NavigationMap {
  const mapFile = allFiles.find((page) => {
    const fm = (page.frontmatter ?? {}) as FrontmatterRecord

    return (
      isPublished(fm) &&
      text(fm.type)?.toLowerCase() === "navigation-map" &&
      text(fm.mapId)?.toLowerCase() === MAP_ID
    )
  })

  if (!mapFile) {
    return FALLBACK_MAP
  }

  const fm = (mapFile.frontmatter ?? {}) as FrontmatterRecord

  const locations = Array.isArray(fm.locations)
    ? fm.locations
        .map(mapLocation)
        .filter((location): location is MapLocation => location !== undefined)
    : []

  return {
    id: MAP_ID,
    name:
      text(fm.mapName) ??
      text(fm.title) ??
      FALLBACK_MAP.name,
    description:
      text(fm.description) ??
      FALLBACK_MAP.description,
    background:
      text(fm.background) ??
      FALLBACK_MAP.background,
    locations,
  }
}