export type MapLocationStatus =
  | "available"
  | "restricted"
  | "offline"

export type MapLocationIcon =
  | "city"
  | "market"
  | "bridge"
  | "reactor"
  | "station"
  | "dock"
  | "default"

export interface MapLocation {
  id: string
  name: string
  description: string

  // Position on the map in percentages (0–100)
  x: number
  y: number

  // Main DM-controlled visibility switch
  discovered: boolean

  status?: MapLocationStatus
  icon?: MapLocationIcon
}

export interface NavigationMap {
  id: string
  name: string
  description?: string

  // Added later when the final map artwork exists
  background?: string

  locations: MapLocation[]
}