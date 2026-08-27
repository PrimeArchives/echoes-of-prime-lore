import { NavigationMap } from "./types"
import MapMarker from "./MapMarker"

interface MapProps {
  map: NavigationMap
}

function navigationKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

const MAP_DEBUG = false

export default function Map({ map }: MapProps) {
  const discoveredLocations = map.locations.filter(
    (location) => location.discovered,
  )

  const locationRadioGroup = `navigation-location-${map.id}`
  const destinationRadioGroup = `navigation-destination-${map.id}`
  const destinationNoneInputId =
    `navigation-destination-${map.id}-none`

  const generatedStyles = discoveredLocations
    .map((location) => {
      const locationKey = navigationKey(location.name)

      const locationInputId =
        `navigation-location-${map.id}-${location.id}`

      const destinationInputId =
        `navigation-destination-${map.id}-${location.id}`

      return `
        .navigation-map:has(#${locationInputId}:checked)
          .virex-map-marker[for="${locationInputId}"]
          .virex-map-marker__core {
          border-color: #64d7ff;
          background: rgba(10, 34, 48, 0.96);
          box-shadow:
            0 0 18px rgba(100, 215, 255, 0.82),
            0 0 42px rgba(100, 215, 255, 0.26),
            inset 0 0 16px rgba(100, 215, 255, 0.18);
          transform: scale(1.08);
        }

        .navigation-map:has(#${locationInputId}:checked)
          .virex-map-marker[for="${locationInputId}"]
          .virex-map-marker__label {
          border-color: #64d7ff;
          color: #ffffff;
          box-shadow:
            0 0 18px rgba(100, 215, 255, 0.22);
        }

        .navigation-map:has(#${destinationInputId}:checked)
          .virex-map-marker[for="${locationInputId}"]
          .virex-map-marker__core {
          border-color: #ffbf5c;
          background: rgba(45, 31, 12, 0.96);
          color: #ffbf5c;
          box-shadow:
            0 0 20px rgba(255, 191, 92, 0.9),
            0 0 52px rgba(255, 191, 92, 0.34),
            inset 0 0 16px rgba(255, 191, 92, 0.18);
          transform: scale(1.12);
        }

        .navigation-map:has(#${destinationInputId}:checked)
          .virex-map-marker[for="${locationInputId}"]
          .virex-map-marker__pulse {
          border-color: rgba(255, 191, 92, 0.95);
          animation-duration: 1.25s;
        }

        .navigation-map:has(#${destinationInputId}:checked)
          .virex-map-marker[for="${locationInputId}"]
          .virex-map-marker__label {
          border-color: #ffbf5c;
          color: #ffdf9d;
          background: rgba(35, 25, 12, 0.92);
          box-shadow:
            0 0 22px rgba(255, 191, 92, 0.24);
        }

        .navigation-map:has(#${destinationInputId}:checked)
          .navigation-destination-control[data-destination="${location.id}"]
          .navigation-destination-control__set {
          display: none;
        }

        .navigation-map:has(#${destinationInputId}:checked)
          .navigation-destination-control[data-destination="${location.id}"]
          .navigation-destination-control__active {
          display: inline;
        }

        .navigation-map:has(#${destinationInputId}:checked)
          .navigation-global-clear {
          display: inline-flex;
        }

        .navigation-map:has(#${destinationInputId}:checked)
          [data-navigation-active-destination]::after {
          content: "${location.name.replace('"', '\"')}";
        }
      `
    })
    .join("\n")

  const debugId = `map-debug-${map.id}`

  return (
    <section class="navigation-map" data-map-debug={MAP_DEBUG ? "true" : "false"}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .navigation-location-toggle,
            .navigation-destination-toggle {
              position: absolute;
              width: 1px;
              height: 1px;
              opacity: 0;
              pointer-events: none;
            }

            .navigation-location-panel__empty,
            .navigation-location-panel__content {
              display: none;
            }

            .navigation-location-toggle--none:checked
              + .navigation-location-panel__empty {
              display: flex;
            }

            .navigation-location-toggle:checked
              + .navigation-location-panel__content {
              display: block;
            }

            .navigation-destination-control__active {
              display: none;
            }

            .navigation-global-clear {
              display: none;
              align-items: center;
              justify-content: center;
              min-height: 34px;
              padding: 0.45rem 0.8rem;
              border: 1px solid rgba(255, 191, 92, 0.3);
              border-radius: 7px;
              background: rgba(255, 191, 92, 0.06);
              color: #ffcf7a;
              font-family: var(--codeFont);
              font-size: 0.62rem;
              font-weight: 700;
              letter-spacing: 0.08em;
              text-transform: uppercase;
              cursor: pointer;
            }

            [data-navigation-active-destination]::after {
              content: "NONE";
              margin-left: 0.35rem;
              color: #ffcf7a;
            }

            /* ============================================================
               PAT-03 LOCAL ARCHIVE RETRIEVAL
               Only affects the archive-summary area.
               ============================================================ */

            .navigation-location-retrieval {
              position: relative;
              min-height: 145px;
              margin-top: 1rem;
              overflow: hidden;
            }

            .navigation-location-retrieval__loading {
              position: absolute;
              z-index: 5;
              inset: 0;

              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;

              border: 1px solid rgba(100, 215, 255, 0.12);
              border-radius: 8px;

              background:
                linear-gradient(
                  rgba(100, 215, 255, 0.025) 1px,
                  transparent 1px
                ),
                linear-gradient(
                  90deg,
                  rgba(100, 215, 255, 0.025) 1px,
                  transparent 1px
                ),
                rgba(7, 13, 22, 0.97);

              background-size:
                24px 24px,
                24px 24px,
                auto;

              color: #64d7ff;

              font-family: var(--codeFont);
              font-size: 0.66rem;
              font-weight: 700;

              letter-spacing: 0.11em;
              text-transform: uppercase;

              pointer-events: none;

              animation:
                prime-location-retrieval-hide 1600ms ease forwards;
            }

            .navigation-location-retrieval__loading strong {
              color: #dff7ff;

              font-size: 0.72rem;
              font-weight: 700;
            }

            .navigation-location-retrieval__loading span {
              margin-top: 0.35rem;

              color: #64d7ff;

              opacity: 0.72;
            }

            .navigation-location-retrieval__scan {
              position: absolute;
              z-index: 6;

              top: 6%;
              left: 5%;

              width: 90%;
              height: 2px;

              opacity: 0;

              background:
                linear-gradient(
                  90deg,
                  transparent,
                  rgba(100, 215, 255, 0.9),
                  #e1fbff,
                  rgba(100, 215, 255, 0.9),
                  transparent
                );

              box-shadow:
                0 0 9px rgba(100, 215, 255, 0.9),
                0 0 20px rgba(100, 215, 255, 0.45);

              pointer-events: none;

              animation:
                prime-location-retrieval-scan 960ms ease-in-out forwards;
            }

            .navigation-location-retrieval__data {
              opacity: 0;
              transform: translateY(5px);

              animation:
                prime-location-retrieval-data 220ms ease forwards;

              animation-delay: 1260ms;
            }

            @keyframes prime-location-retrieval-hide {
              0%,
              76% {
                visibility: visible;
                opacity: 1;
              }

              100% {
                visibility: hidden;
                opacity: 0;
              }
            }

            @keyframes prime-location-retrieval-scan {
              0% {
                top: 6%;
                opacity: 0;
              }

              12% {
                opacity: 1;
              }

              88% {
                opacity: 1;
              }

              100% {
                top: calc(100% - 5px);
                opacity: 0;
              }
            }

            @keyframes prime-location-retrieval-data {
              from {
                opacity: 0;
                transform: translateY(5px);
              }

              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            @media (prefers-reduced-motion: reduce) {
              .navigation-location-retrieval__loading,
              .navigation-location-retrieval__scan {
                display: none;
                animation: none;
              }

              .navigation-location-retrieval__data {
                opacity: 1;
                transform: none;
                animation: none;
              }
            }

            ${generatedStyles}
          `,
        }}
      />

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
          <span>Map Data</span>

          <strong>
            {discoveredLocations.length}{" "}
            {discoveredLocations.length === 1
              ? "LOCATION"
              : "LOCATIONS"}{" "}
            SYNCHRONIZED
          </strong>
        </div>
      </header>

      <div class="navigation-map__workspace">
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
                inputId={`navigation-location-${map.id}-${location.id}`}
              />
            ))}
          </div>
        </div>

        <input
          id={destinationNoneInputId}
          class="navigation-destination-toggle navigation-destination-toggle--none"
          type="radio"
          name={destinationRadioGroup}
          data-destination-key=""
          checked
        />

        <aside class="navigation-location-panel">
          <input
            id={`navigation-location-${map.id}-none`}
            class="navigation-location-toggle navigation-location-toggle--none"
            type="radio"
            name={locationRadioGroup}
            checked
          />

          <div class="navigation-location-panel__empty">
            <span>Location Data</span>

            <strong>Select a map marker</strong>

            <p>
              Tap a discovered location to view available navigation data.
            </p>
          </div>

          {discoveredLocations.map((location) => {
            const locationInputId =
              `navigation-location-${map.id}-${location.id}`

            const destinationInputId =
              `navigation-destination-${map.id}-${location.id}`

            return (
              <>
                <input
                  id={locationInputId}
                  class="navigation-location-toggle"
                  type="radio"
                  name={locationRadioGroup}
                  data-location-key={navigationKey(location.name)}
                />

                <div class="navigation-location-panel__content">
                  <div class="navigation-location-panel__header">
                    <div>
                      <span class="navigation-location-panel__eyebrow">
                        Selected Location
                      </span>

                      <h2>{location.name}</h2>
                    </div>

                    <label
                      class="navigation-location-panel__close"
                      for={`navigation-location-${map.id}-none`}
                      aria-label="Close location information"
                      title="Close location information"
                    >
                      ×
                    </label>
                  </div>

                  <div class="navigation-location-panel__divider">
                    <span></span>
                  </div>

                  <div class="navigation-location-panel__status">
                    <span>Status</span>

                    <strong>
                      {(location.status ?? "available").toUpperCase()}
                    </strong>
                  </div>

                  <div class="navigation-location-retrieval">
                    <div class="navigation-location-retrieval__loading">
                      <strong>ACCESSING LOCAL ARCHIVE</strong>
                      <span>RETRIEVING LOCATION DATA...</span>

                      <div class="navigation-location-retrieval__scan"></div>
                    </div>

                    <div class="navigation-location-retrieval__data">
                      <div class="navigation-location-panel__data-label">
                        Archive Summary
                      </div>

                      <p class="navigation-location-panel__description">
                        {location.description}
                      </p>
                    </div>
                  </div>

                  <div class="navigation-location-panel__coordinates">
                    <span>Map Coordinates</span>

                    <strong>
                      X {Math.round(location.x)} / Y{" "}
                      {Math.round(location.y)}
                    </strong>
                  </div>

                  <input
                    id={destinationInputId}
                    class="navigation-destination-toggle"
                    type="radio"
                    name={destinationRadioGroup}
                    data-destination-key={navigationKey(location.name)}
                  />

                  <label
                    class="navigation-destination-control"
                    data-destination={location.id}
                    for={destinationInputId}
                  >
                    <span class="navigation-destination-control__set">
                      SET DESTINATION
                    </span>

                    <span class="navigation-destination-control__active">
                      ◆ GUIDANCE ACTIVE
                    </span>
                  </label>
                </div>
              </>
            )
          })}
        </aside>
      </div>


      <footer class="navigation-map__footer">
        <span>PAT-03 // LOCAL NAVIGATION CACHE</span>

        <span data-navigation-active-destination>
          DESTINATION
        </span>

        <label
          class="navigation-global-clear"
          for={destinationNoneInputId}
        >
          CLEAR DESTINATION
        </label>

        <span>SIGNAL STABLE</span>
      </footer>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            (() => {
              const root = document.currentScript?.closest(".navigation-map")
              if (!root) return

              const storageKey = "prime-navigation-destination-${map.id}"
              const hashParams = new URLSearchParams(
                window.location.hash.replace(/^#/, ""),
              )

              const requestedLocation = hashParams.get("navigation")
              const requestedDestination = hashParams.get("destination")

              const navigationToggle =
                document.getElementById("navigation-toggle")

              const selectLocation = (key) => {
                if (!key) return
                const input = root.querySelector(
                  '.navigation-location-toggle[data-location-key="' +
                  CSS.escape(key) +
                  '"]',
                )

                if (input instanceof HTMLInputElement) {
                  input.checked = true
                }
              }

              const selectDestination = (key, persist = true) => {
                const selector = key
                  ? '.navigation-destination-toggle[data-destination-key="' +
                    CSS.escape(key) +
                    '"]'
                  : '.navigation-destination-toggle--none'

                const input = root.querySelector(selector)

                if (input instanceof HTMLInputElement) {
                  input.checked = true

                  if (persist) {
                    if (key) {
                      localStorage.setItem(storageKey, key)
                    } else {
                      localStorage.removeItem(storageKey)
                    }
                  }
                }
              }

              if (requestedLocation) {
                if (navigationToggle instanceof HTMLInputElement) {
                  navigationToggle.checked = true
                }

                selectLocation(requestedLocation)
              }

              if (requestedDestination) {
                selectDestination(requestedDestination)
              } else {
                const storedDestination = localStorage.getItem(storageKey)
                if (storedDestination) {
                  selectDestination(storedDestination, false)
                }
              }

              root
                .querySelectorAll(
                  ".navigation-destination-toggle[data-destination-key]",
                )
                .forEach((input) => {
                  input.addEventListener("change", () => {
                    if (!(input instanceof HTMLInputElement) || !input.checked) {
                      return
                    }

                    const key = input.dataset.destinationKey ?? ""

                    if (key) {
                      localStorage.setItem(storageKey, key)
                    } else {
                      localStorage.removeItem(storageKey)
                    }
                  })
                })

              if (requestedLocation || requestedDestination) {
                window.history.replaceState(
                  {},
                  "",
                  window.location.pathname + window.location.search,
                )
              }
            })()
          `,
        }}
      />
      {MAP_DEBUG && (
        <>
          <style
            dangerouslySetInnerHTML={{
              __html: `
                [data-map-debug="true"] {
                  position: relative;
                }

                .map-debugger {
                  position: fixed;
                  z-index: 999999;
                  right: 1rem;
                  bottom: 1rem;
                  width: min(330px, calc(100vw - 2rem));
                  padding: 0.9rem;
                  border: 1px solid rgba(100, 215, 255, 0.38);
                  border-radius: 10px;
                  background: rgba(5, 10, 15, 0.96);
                  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.42);
                  color: #dce8ef;
                  font-family: var(--codeFont);
                }

                .map-debugger__title {
                  display: flex;
                  justify-content: space-between;
                  gap: 1rem;
                  margin-bottom: 0.65rem;
                  color: #64d7ff;
                  font-size: 0.58rem;
                  font-weight: 900;
                  letter-spacing: 0.1em;
                  text-transform: uppercase;
                }

                .map-debugger__coords {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 0.5rem;
                  margin-bottom: 0.65rem;
                }

                .map-debugger__coords div {
                  padding: 0.55rem 0.65rem;
                  border: 1px solid rgba(100, 215, 255, 0.13);
                  border-radius: 7px;
                  background: rgba(100, 215, 255, 0.03);
                }

                .map-debugger__coords span {
                  display: block;
                  margin-bottom: 0.15rem;
                  color: #6f8492;
                  font-size: 0.42rem;
                  letter-spacing: 0.08em;
                  text-transform: uppercase;
                }

                .map-debugger__coords strong {
                  color: #eefaff;
                  font-size: 0.8rem;
                }

                .map-debugger__yaml {
                  width: 100%;
                  min-height: 72px;
                  box-sizing: border-box;
                  padding: 0.65rem;
                  border: 1px solid rgba(100, 215, 255, 0.14);
                  border-radius: 7px;
                  resize: none;
                  background: #071018;
                  color: #bfeeff;
                  font: inherit;
                  font-size: 0.58rem;
                  line-height: 1.5;
                }

                .map-debugger__hint {
                  margin: 0.55rem 0 0 !important;
                  color: #7d909d;
                  font-size: 0.46rem;
                  line-height: 1.45;
                }

                [data-map-debug="true"] .navigation-map__markers {
                  pointer-events: none;
                }

                [data-map-debug="true"] .navigation-map__markers label,
                [data-map-debug="true"] .navigation-map__markers button,
                [data-map-debug="true"] .navigation-map__markers a {
                  pointer-events: auto;
                }

                .map-debug-crosshair {
                  position: absolute;
                  z-index: 50;
                  width: 18px;
                  height: 18px;
                  transform: translate(-50%, -50%);
                  pointer-events: none;
                }

                .map-debug-crosshair::before,
                .map-debug-crosshair::after {
                  position: absolute;
                  background: #ff5f7a;
                  box-shadow: 0 0 8px rgba(255, 95, 122, 0.55);
                  content: "";
                }

                .map-debug-crosshair::before {
                  left: 8px;
                  top: 0;
                  width: 2px;
                  height: 18px;
                }

                .map-debug-crosshair::after {
                  left: 0;
                  top: 8px;
                  width: 18px;
                  height: 2px;
                }
              `,
            }}
          />

          <div
            id={debugId}
            class="map-debugger"
            data-map-debugger
            data-map-id={map.id}
          >
            <div class="map-debugger__title">
              <span>MAP MARKER DEBUG</span>
              <strong>{map.name}</strong>
            </div>

            <div class="map-debugger__coords">
              <div>
                <span>X</span>
                <strong data-map-debug-x>--</strong>
              </div>

              <div>
                <span>Y</span>
                <strong data-map-debug-y>--</strong>
              </div>
            </div>

            <textarea
              class="map-debugger__yaml"
              data-map-debug-yaml
              readOnly
              value={"Click the map to sample coordinates."}
            />

            <p class="map-debugger__hint">
              Click anywhere on the map. Coordinates are percentages and can be pasted directly into NAV YAML.
            </p>
          </div>

          <script
            dangerouslySetInnerHTML={{
              __html: `
                (() => {
                  const debuggerPanel = document.getElementById('${debugId}')
                  if (!debuggerPanel) return

                  const mapRoot = debuggerPanel.closest('.prime-map, .navigation-map, [data-map-debug="true"]') || document
                  const candidates = Array.from(
                    mapRoot.querySelectorAll('img, .navigation-map__image, .prime-map__image, [data-map-image]')
                  )

                  const image =
                    candidates.find((node) => node instanceof HTMLImageElement) ||
                    candidates[0]

                  if (!(image instanceof HTMLElement)) return

                  const xEl = debuggerPanel.querySelector('[data-map-debug-x]')
                  const yEl = debuggerPanel.querySelector('[data-map-debug-y]')
                  const yamlEl = debuggerPanel.querySelector('[data-map-debug-yaml]')

                  let crosshair = mapRoot.querySelector('.map-debug-crosshair')

                  if (!crosshair) {
                    crosshair = document.createElement('div')
                    crosshair.className = 'map-debug-crosshair'
                    image.parentElement?.appendChild(crosshair)
                  }

                  const viewport =
                    image.closest('.navigation-map__viewport') ||
                    image.parentElement

                  if (!(viewport instanceof HTMLElement)) return

                  viewport.style.cursor = 'crosshair'

                  viewport.addEventListener('click', (event) => {
                    const rect = image.getBoundingClientRect()

                    if (
                      event.clientX < rect.left ||
                      event.clientX > rect.right ||
                      event.clientY < rect.top ||
                      event.clientY > rect.bottom
                    ) {
                      return
                    }

                    const x = ((event.clientX - rect.left) / rect.width) * 100
                    const y = ((event.clientY - rect.top) / rect.height) * 100

                    const xFixed = Math.max(0, Math.min(100, x)).toFixed(2)
                    const yFixed = Math.max(0, Math.min(100, y)).toFixed(2)

                    if (xEl) xEl.textContent = xFixed
                    if (yEl) yEl.textContent = yFixed

                    if (yamlEl instanceof HTMLTextAreaElement) {
                      yamlEl.value = 'x: ' + xFixed + '\\ny: ' + yFixed
                    }

                    if (crosshair instanceof HTMLElement) {
                      crosshair.style.left = xFixed + '%'
                      crosshair.style.top = yFixed + '%'
                    }
                  }, true)
                })()
              `,
            }}
          />
        </>
      )}

    </section>
  )
}