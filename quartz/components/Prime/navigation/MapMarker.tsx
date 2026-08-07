import { MapLocation } from "./types"

interface MapMarkerProps {
  location: MapLocation
  active?: boolean
}

export default function MapMarker({
  location,
  active = false,
}: MapMarkerProps) {
  if (!location.discovered) {
    return null
  }

  return (
    <button
      type="button"
      class={`virex-map-marker ${
        active ? "virex-map-marker--active" : ""
      }`}
      style={{
        left: `${location.x}%`,
        top: `${location.y}%`,
      }}
      data-location-id={location.id}
      aria-label={location.name}
      title={location.name}
    >
      <span
        class="virex-map-marker__pulse"
        aria-hidden="true"
      ></span>

      <span
        class="virex-map-marker__core"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 32 32"
          role="presentation"
          focusable="false"
        >
          <circle
            cx="16"
            cy="16"
            r="8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />

          <circle
            cx="16"
            cy="16"
            r="2.5"
            fill="currentColor"
          />

          <path
            d="M16 2v6M16 24v6M2 16h6M24 16h6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </span>

      <span class="virex-map-marker__label">
        {location.name}
      </span>
    </button>
  )
}