import { NavigationMap } from "./types"
import MapMarker from "./MapMarker"

interface MapProps {
  map: NavigationMap
}

export default function Map({ map }: MapProps) {
  const discoveredLocations = map.locations.filter(
    (location) => location.discovered,
  )

  return (
    <section class="navigation-map">
      <header class="navigation-map__header">
        <div>
          <p class="navigation-map__eyebrow">
            Navigation System
          </p>

          <h1>{map.name}</h1>

          {map.description && (
            <p class="navigation-map__description">
              {map.description}
            </p>
          )}
        </div>

        <div class="navigation-map__status">
          <span>Map Status</span>
          <strong>Online</strong>
        </div>
      </header>

      <div class="navigation-map__viewport">
        {map.background && (
          <img
            class="navigation-map__background"
            src={map.background}
            alt=""
            aria-hidden="true"
          />
        )}

        {!map.background && (
          <div
            class="navigation-map__placeholder"
            aria-hidden="true"
          >
            <div class="navigation-map__grid"></div>

            <span>
              MAP DATA // {map.name.toUpperCase()}
            </span>
          </div>
        )}

        <div class="navigation-map__markers">
          {discoveredLocations.map((location) => (
            <MapMarker
              key={location.id}
              location={location}
            />
          ))}
        </div>
      </div>

      <footer class="navigation-map__footer">
        <span>
          Visible locations: {discoveredLocations.length}
        </span>

        <span>
          PAT-03 NAVIGATION
        </span>
      </footer>
    </section>
  )
}