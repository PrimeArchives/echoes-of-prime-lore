import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "../types"

import ArchiveCard from "./ArchiveCard"
import Map from "./navigation/map"
import { virex9Map } from "./navigation/maps/virex9"
import Messages from "./messages/messages"
import AudioArchive from "./audio/AudioArchive"
import audioStyle from "./audio/audio.scss"
import Objectives from "./objectives/objectives"
import objectivesStyle from "./objectives/objectives.scss"

const PrimeOS: QuartzComponent = (_props: QuartzComponentProps) => {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            /*
             * The boot sequence is hidden during normal PrimeOS use.
             * It is only activated when arriving at /archives#prime-boot.
             */
            .prime-boot {
              display: none !important;
            }

            .prime-boot:target {
              display: grid !important;
            }

            #messages-toggle:checked ~ .prime-app--messages {
              display: block;
            }

            #audio-toggle:checked ~ .prime-app--audio {
              display: block;
            }

            #objectives-toggle:checked ~ .prime-app--objectives {
              display: block;
            }
          `,
        }}
      />

      <input
        id="navigation-toggle"
        class="prime-app-toggle"
        type="checkbox"
        aria-hidden="true"
      />

      <input
        id="messages-toggle"
        class="prime-app-toggle"
        type="checkbox"
        aria-hidden="true"
      />

      <input
        id="audio-toggle"
        class="prime-app-toggle"
        type="checkbox"
        aria-hidden="true"
      />

      <input
        id="objectives-toggle"
        class="prime-app-toggle"
        type="checkbox"
        aria-hidden="true"
      />

      <div
        id="prime-boot"
        class="prime-boot"
        aria-hidden="true"
      >
        <div class="prime-boot__screen">
          <p class="prime-boot__device">
            PAT-03
          </p>

          <h1>
            Prime Archives Terminal
          </h1>

          <div class="prime-boot__log">
            <p>
              Initializing hardware...
            </p>

            <p>
              Loading local cache...
            </p>

            <p>
              Synchronizing archives...
            </p>

            <p class="prime-boot__online">
              Connection established.
            </p>
          </div>

          <div class="prime-boot__progress">
            <span></span>
          </div>
        </div>
      </div>

      <main class="archive-dashboard">
        <header class="archive-dashboard__header">
          <div>
            <p class="archive-dashboard__eyebrow">
              Prime Archives Terminal
            </p>

            <h1>
              Archive Index
            </h1>

            <p class="archive-dashboard__subtitle">
              Public records and field tools available to Echo Squad.
            </p>
          </div>

          <dl class="archive-dashboard__device">
            <div>
              <dt>
                Device
              </dt>

              <dd>
                PAT-03
              </dd>
            </div>

            <div>
              <dt>
                Clearance
              </dt>

              <dd>
                Public
              </dd>
            </div>

            <div>
              <dt>
                Firmware
              </dt>

              <dd>
                1.1
              </dd>
            </div>
          </dl>
        </header>

        <section class="archive-dashboard__section">
          <div class="archive-dashboard__section-heading">
            <p>
              Database modules
            </p>

            <h2>
              Public Archives
            </h2>
          </div>

          <div class="archive-dashboard__grid">
            <ArchiveCard
              title="Universe"
              description="History, worlds and cosmic knowledge."
              href="/01-universe/"
              icon="◉"
              status="Online"
            />

            <ArchiveCard
              title="Locations"
              description="Cities, stations, planets and known regions."
              href="/02-locations/"
              icon="⌖"
              status="Online"
            />

            <ArchiveCard
              title="Personnel"
              description="Known contacts, figures and hostile actors."
              href="/03-personnel/"
              icon="◇"
              status="Online"
            />

            <ArchiveCard
              title="Factions"
              description="Organizations, powers and political actors."
              href="/06-factions/"
              icon="△"
              status="Online"
            />

            <ArchiveCard
              title="Systems"
              description="Aether, technology and universal systems."
              href="/07-systems/"
              icon="⚙"
              status="Online"
            />


          </div>
        </section>

        <section class="archive-dashboard__section">
          <div class="archive-dashboard__section-heading">
            <p>
              Portable applications
            </p>

            <h2>
              Field Tools
            </h2>
          </div>

          <div class="archive-dashboard__grid archive-dashboard__grid--tools">
            <label
              for="navigation-toggle"
              class="archive-card tool prime-app-launcher"
            >
              <div class="archive-card-top">
                <span class="archive-label">
                  FIELD APPLICATION
                </span>

                <span
                  class="archive-led"
                  aria-hidden="true"
                ></span>
              </div>

              <div class="archive-card-header">
                <div class="archive-card-icon">
                  ⌁
                </div>

                <div>
                  <h3>
                    Navigation
                  </h3>

                  <p>
                    Maps and known destinations.
                  </p>
                </div>
              </div>

              <div class="archive-card-footer">
                <span>
                  AVAILABLE
                </span>

                <span class="archive-open">
                  OPEN →
                </span>
              </div>
            </label>

            <label
              for="messages-toggle"
              class="archive-card tool prime-app-launcher"
            >
              <div class="archive-card-top">
                <span class="archive-label">
                  FIELD APPLICATION
                </span>

                <span
                  class="archive-led"
                  aria-hidden="true"
                ></span>
              </div>

              <div class="archive-card-header">
                <div class="archive-card-icon">
                  ✉
                </div>

                <div>
                  <h3>
                    Messages
                  </h3>

                  <p>
                    Incoming and archived transmissions.
                  </p>
                </div>
              </div>

              <div class="archive-card-footer">
                <span>
                  AVAILABLE
                </span>

                <span class="archive-open">
                  OPEN →
                </span>
              </div>
            </label>

            <label
              for="audio-toggle"
              class="archive-card tool prime-app-launcher"
            >
              <div class="archive-card-top">
                <span class="archive-label">
                  FIELD APPLICATION
                </span>

                <span
                  class="archive-led"
                  aria-hidden="true"
                ></span>
              </div>

              <div class="archive-card-header">
                <div class="archive-card-icon">
                  ◫
                </div>

                <div>
                  <h3>
                    Audio Archive
                  </h3>

                  <p>
                    Recovered songs and echo fragments.
                  </p>
                </div>
              </div>

              <div class="archive-card-footer">
                <span>
                  AVAILABLE
                </span>

                <span class="archive-open">
                  OPEN →
                </span>
              </div>
            </label>

            <label
              for="objectives-toggle"
              class="archive-card tool prime-app-launcher"
            >
              <div class="archive-card-top">
                <span class="archive-label">
                  FIELD APPLICATION
                </span>

                <span
                  class="archive-led"
                  aria-hidden="true"
                ></span>
              </div>

              <div class="archive-card-header">
                <div class="archive-card-icon">
                  ◎
                </div>

                <div>
                  <h3>
                    Objectives
                  </h3>

                  <p>
                    Current tasks and recovered mission data.
                  </p>
                </div>
              </div>

              <div class="archive-card-footer">
                <span>
                  AVAILABLE
                </span>

                <span class="archive-open">
                  OPEN →
                </span>
              </div>
            </label>
          </div>
        </section>

        <footer class="archive-dashboard__status">
          <div>
            <span>
              Archive integrity
            </span>

            <strong>
              84%
            </strong>
          </div>

          <div>
            <span>
              Signal
            </span>

            <strong>
              Stable
            </strong>
          </div>

          <div>
            <span>
              Access Level
            </span>

            <strong>
              Public
            </strong>
          </div>

          <div>
            <span>
              Network
            </span>

            <strong>
              Online
            </strong>
          </div>
        </footer>
      </main>

      <section
        class="prime-app prime-app--navigation"
        aria-label="Navigation application"
      >
        <div class="prime-app__shell">
          <header class="prime-app__topbar">
            <div>
              <span class="prime-app__system">
                PAT-03 / FIELD APPLICATION
              </span>

              <strong>
                Navigation
              </strong>
            </div>

            <label
              for="navigation-toggle"
              class="prime-app__close"
              aria-label="Return to Archive Index"
              title="Return to Archive Index"
            >
              ×
            </label>
          </header>

          <Map map={virex9Map} />
        </div>
      </section>

      <section
        class="prime-app prime-app--messages"
        aria-label="Messages application"
      >
        <div class="prime-app__shell">
          <header class="prime-app__topbar">
            <div>
              <span class="prime-app__system">
                PAT-03 / FIELD APPLICATION
              </span>

              <strong>
                Messages
              </strong>
            </div>

            <label
              for="messages-toggle"
              class="prime-app__close"
              aria-label="Return to Archive Index"
              title="Return to Archive Index"
            >
              ×
            </label>
          </header>

          <Messages allFiles={_props.allFiles ?? []} />
        </div>
      </section>

      <section
        class="prime-app prime-app--audio"
        aria-label="Audio Archive application"
      >
        <div class="prime-app__shell">
          <header class="prime-app__topbar">
            <div>
              <span class="prime-app__system">
                PAT-04 / FIELD APPLICATION
              </span>

              <strong>
                Audio Archive
              </strong>
            </div>

            <label
              for="audio-toggle"
              class="prime-app__close"
              aria-label="Return to Archive Index"
              title="Return to Archive Index"
            >
              ×
            </label>
          </header>

          <AudioArchive allFiles={_props.allFiles ?? []} />
        </div>
      </section>

      <section
        class="prime-app prime-app--objectives"
        aria-label="Objectives application"
      >
        <div class="prime-app__shell">
          <header class="prime-app__topbar">
            <div>
              <span class="prime-app__system">
                PAT-05 / FIELD APPLICATION
              </span>

              <strong>
                Objectives
              </strong>
            </div>

            <label
              for="objectives-toggle"
              class="prime-app__close"
              aria-label="Return to Archive Index"
              title="Return to Archive Index"
            >
              ×
            </label>
          </header>

          <Objectives allFiles={_props.allFiles ?? []} />
        </div>
      </section>
    </>
  )
}


PrimeOS.css = audioStyle + objectivesStyle

PrimeOS.afterDOMLoaded = `
(() => {
  const applyNavigationHash = (attempt = 0) => {
    const match = window.location.hash.match(/^#navigation([a-z0-9-]+)$/i)
    if (!match) return

    const locationId = match[1].toLowerCase()

    const navigationToggle = document.getElementById("navigation-toggle")
    const locationToggle = document.getElementById(
      "navigation-location-virex-9-" + locationId,
    )

    if (
      !(navigationToggle instanceof HTMLInputElement) ||
      !(locationToggle instanceof HTMLInputElement)
    ) {
      if (attempt < 12) {
        window.setTimeout(() => applyNavigationHash(attempt + 1), 75)
      }
      return
    }

    navigationToggle.checked = true
    navigationToggle.dispatchEvent(new Event("change", { bubbles: true }))

    locationToggle.checked = true
    locationToggle.dispatchEvent(new Event("change", { bubbles: true }))
  }

  const run = () => {
    window.setTimeout(() => applyNavigationHash(), 0)
  }

  run()

  window.addEventListener("hashchange", run)
  document.addEventListener("nav", run)
  document.addEventListener("render", run)

  window.addCleanup?.(() => {
    window.removeEventListener("hashchange", run)
    document.removeEventListener("nav", run)
    document.removeEventListener("render", run)
  })

  const setupPrimeAudio = () => {
    const root = document.querySelector(".prime-audio")
    if (!(root instanceof HTMLElement)) return

    // Rebind safely after Quartz SPA renders.
    if (root.dataset.playerReady === "true") return

    const audio = root.querySelector("#prime-audio-element")
    const labels = Array.from(root.querySelectorAll("[data-audio-track-label]"))
    const playButton = root.querySelector("[data-audio-action='play']")
    const prevButton = root.querySelector("[data-audio-action='prev']")
    const nextButton = root.querySelector("[data-audio-action='next']")
    const seek = root.querySelector("[data-audio-seek]")
    const volume = root.querySelector("[data-audio-volume]")
    const currentTime = root.querySelector("[data-audio-current]")
    const duration = root.querySelector("[data-audio-duration]")
    const playerStatus = root.querySelector("[data-audio-player-status]")
    const appToggle = document.getElementById("audio-toggle")

    if (!(audio instanceof HTMLAudioElement) || labels.length === 0) return

    root.dataset.playerReady = "true"
    let activeIndex = 0

    const setStatus = (message) => {
      if (playerStatus) playerStatus.textContent = message
    }

    const formatTime = (seconds) => {
      if (!Number.isFinite(seconds) || seconds < 0) return "00:00"
      const minutes = Math.floor(seconds / 60)
      const remainder = Math.floor(seconds % 60)
      return String(minutes).padStart(2, "0") + ":" + String(remainder).padStart(2, "0")
    }

    const selectedIndex = () => {
      const checked = root.querySelector('input[name="prime-audio-selection"]:checked')
      if (!(checked instanceof HTMLInputElement)) return activeIndex
      const index = Number(checked.dataset.audioIndex)
      return Number.isFinite(index) ? index : activeIndex
    }

    const getTrack = (index) => {
      const normalized = (index + labels.length) % labels.length
      const label = labels[normalized]
      if (!(label instanceof HTMLElement)) return null
      return {
        index: normalized,
        src: label.dataset.audioSrc || "",
      }
    }

    const loadTrack = (index, autoplay = false) => {
      const track = getTrack(index)
      if (!track) return
      activeIndex = track.index

      const radio = root.querySelector("#prime-audio-select-" + track.index)
      if (radio instanceof HTMLInputElement) radio.checked = true

      if ((audio.getAttribute("src") || "") !== track.src) {
        audio.src = track.src
        audio.load()
      }

      setStatus("MEDIA LOADED")
      if (autoplay) {
        audio.play().catch(() => setStatus("PLAYBACK BLOCKED"))
      }
    }

    labels.forEach((label, index) => {
      label.addEventListener("click", () => {
        loadTrack(index, !audio.paused)
      })
    })

    playButton?.addEventListener("click", () => {
      const track = getTrack(selectedIndex())
      if (!track) return
      if ((audio.getAttribute("src") || "") !== track.src) loadTrack(track.index)

      if (audio.paused) {
        audio.play().catch(() => setStatus("FILE NOT AVAILABLE"))
      } else {
        audio.pause()
      }
    })

    prevButton?.addEventListener("click", () => loadTrack(selectedIndex() - 1, true))
    nextButton?.addEventListener("click", () => loadTrack(selectedIndex() + 1, true))

    audio.addEventListener("play", () => {
      root.classList.add("is-playing")
      setStatus("PLAYING")
      if (playButton) {
        playButton.textContent = "❚❚"
        playButton.setAttribute("aria-label", "Pause")
      }
    })

    audio.addEventListener("pause", () => {
      root.classList.remove("is-playing")
      if (!audio.ended) setStatus("PAUSED")
      if (playButton) {
        playButton.textContent = "▶"
        playButton.setAttribute("aria-label", "Play")
      }
    })

    audio.addEventListener("loadedmetadata", () => {
      if (duration) duration.textContent = formatTime(audio.duration)
      if (seek instanceof HTMLInputElement) {
        seek.max = String(Number.isFinite(audio.duration) ? audio.duration : 0)
      }
      setStatus("READY")
    })

    audio.addEventListener("timeupdate", () => {
      if (currentTime) currentTime.textContent = formatTime(audio.currentTime)
      if (seek instanceof HTMLInputElement) seek.value = String(audio.currentTime)
    })

    audio.addEventListener("ended", () => loadTrack(selectedIndex() + 1, true))
    audio.addEventListener("error", () => setStatus("FILE NOT FOUND"))

    if (seek instanceof HTMLInputElement) {
      seek.addEventListener("input", () => {
        const nextTime = Number(seek.value)
        if (Number.isFinite(nextTime)) audio.currentTime = nextTime
      })
    }

    if (volume instanceof HTMLInputElement) {
      audio.volume = Number(volume.value)
      volume.addEventListener("input", () => {
        audio.volume = Number(volume.value)
      })
    }

    if (appToggle instanceof HTMLInputElement) {
      appToggle.addEventListener("change", () => {
        if (!appToggle.checked) audio.pause()
      })
    }

    // The initial src already exists in the rendered <audio>.
    // Do not call load() here: metadata may already have loaded before listeners were bound.
    setStatus(audio.readyState >= 1 ? "READY" : "MEDIA LOADED")
  }

  const runAudio = () => window.setTimeout(setupPrimeAudio, 0)

  runAudio()
  document.addEventListener("nav", runAudio)
  document.addEventListener("render", runAudio)
})()
`

export default (() => PrimeOS) satisfies QuartzComponentConstructor