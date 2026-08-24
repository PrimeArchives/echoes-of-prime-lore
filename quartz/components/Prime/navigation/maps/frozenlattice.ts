import { QuartzComponentProps } from "../../../types"
import {
  MapLocation,
  MapLocationIcon,
  MapLocationStatus,
  NavigationMap,
} from "../types"

type FrontmatterRecord = Record<string, unknown>
const MAP_ID = "frozen-lattice"

const FALLBACK_MAP: NavigationMap = {
  id: MAP_ID,
  name: "Frozen Lattice",
  description: "Local navigation data recovered from an unknown frozen region.",
  background: "/static/maps/frozenlattice.webp",
  locations: [],
}

const VALID_STATUSES = new Set<MapLocationStatus>(["available","restricted","offline"])
const VALID_ICONS = new Set<MapLocationIcon>(["city","market","bridge","reactor","station","dock","default"])

function text(v: unknown) { return typeof v === "string" ? v : undefined }
function number(v: unknown) { return typeof v === "number" && Number.isFinite(v) ? v : undefined }
function bool(v: unknown) { return typeof v === "boolean" ? v : undefined }
function record(v: unknown) { return typeof v === "object" && v !== null ? v as FrontmatterRecord : undefined }
function status(v: unknown): MapLocationStatus {
  const c = text(v)?.toLowerCase() as MapLocationStatus | undefined
  return c && VALID_STATUSES.has(c) ? c : "available"
}
function icon(v: unknown): MapLocationIcon {
  const c = text(v)?.toLowerCase() as MapLocationIcon | undefined
  return c && VALID_ICONS.has(c) ? c : "default"
}
function isPublished(fm: FrontmatterRecord) { return fm.published !== false && fm.draft !== true }

function mapLocation(v: unknown): MapLocation | undefined {
  const m = record(v)
  if (!m) return undefined
  const id = text(m.id), name = text(m.name), x = number(m.x), y = number(m.y)
  if (!id || !name || x === undefined || y === undefined) return undefined
  if (x < 0 || x > 100 || y < 0 || y > 100) return undefined
  return {
    id, name,
    description: text(m.description) ?? `Navigation marker for ${name}.`,
    x, y,
    discovered: bool(m.discovered) ?? false,
    status: status(m.status),
    icon: icon(m.icon),
  }
}

export function buildFrozenLatticeMap(
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

  if (!mapFile) return FALLBACK_MAP

  const fm = (mapFile.frontmatter ?? {}) as FrontmatterRecord
  const locations = Array.isArray(fm.locations)
    ? fm.locations.map(mapLocation).filter((x): x is MapLocation => x !== undefined)
    : []

  return {
    id: MAP_ID,
    name: text(fm.mapName) ?? text(fm.title) ?? FALLBACK_MAP.name,
    description: text(fm.description) ?? FALLBACK_MAP.description,
    background: text(fm.background) ?? FALLBACK_MAP.background,
    locations,
  }
}