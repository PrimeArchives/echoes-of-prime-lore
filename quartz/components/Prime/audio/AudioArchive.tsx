import { QuartzPluginData } from "../../../plugins/vfile"

type AudioArchiveProps = {
  allFiles?: QuartzPluginData[]
}

type AudioFrontmatter = {
  title?: string
  id?: string
  type?: string
  audioType?: string
  description?: string
  associatedRecord?: string
  source?: string
  signalIntegrity?: string | number
  published?: boolean
}

function text(value: unknown) {
  return typeof value === "string" ? value : undefined
}

function audioTypeLabel(frontmatter: AudioFrontmatter, id: string) {
  const explicit = text(frontmatter.audioType)
  if (explicit) return explicit

  return id.toUpperCase().startsWith("ECHO-")
    ? "Echo Crystal"
    : "Music"
}

export const audioArchiveAfterDOMLoaded = String.raw`
(() => {
  const setupPrimeAudio = () => {
    const root = document.querySelector(".prime-audio")
    if (!(root instanceof HTMLElement) || root.dataset.playerReady === "true") return

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
        title: label.dataset.audioTitle || "Unknown Audio",
      }
    }

    const setStatus = (message) => {
      if (playerStatus) playerStatus.textContent = message
    }

    const loadTrack = (index, autoplay = false) => {
      const track = getTrack(index)
      if (!track) return

      activeIndex = track.index

      const radio = root.querySelector(
        '#prime-audio-select-' + track.index
      )

      if (radio instanceof HTMLInputElement) {
        radio.checked = true
      }

      const currentSrc = audio.getAttribute("src") || ""
      if (currentSrc !== track.src) {
        audio.src = track.src
        audio.load()
        if (seek instanceof HTMLInputElement) seek.value = "0"
        if (currentTime) currentTime.textContent = "00:00"
        if (duration) duration.textContent = "00:00"
      }

      setStatus("MEDIA LOADED")

      if (autoplay) {
        audio.play().catch(() => {
          setStatus("PLAYBACK BLOCKED")
        })
      }
    }

    labels.forEach((label, index) => {
      label.addEventListener("click", () => {
        const shouldContinue = !audio.paused
        loadTrack(index, shouldContinue)
      })
    })

    playButton?.addEventListener("click", () => {
      const index = selectedIndex()
      const track = getTrack(index)
      if (!track) return

      if ((audio.getAttribute("src") || "") !== track.src) {
        loadTrack(index, false)
      }

      if (audio.paused) {
        audio.play().catch(() => {
          setStatus("FILE NOT AVAILABLE")
        })
      } else {
        audio.pause()
      }
    })

    prevButton?.addEventListener("click", () => {
      loadTrack(selectedIndex() - 1, true)
    })

    nextButton?.addEventListener("click", () => {
      loadTrack(selectedIndex() + 1, true)
    })

    audio.addEventListener("play", () => {
      root.classList.add("is-playing")
      setStatus("PLAYING")

      if (playButton) {
        playButton.textContent = "❚❚"
        playButton.setAttribute("title", "Pause")
        playButton.setAttribute("aria-label", "Pause")
      }
    })

    audio.addEventListener("pause", () => {
      root.classList.remove("is-playing")

      if (!audio.ended) {
        setStatus("PAUSED")
      }

      if (playButton) {
        playButton.textContent = "▶"
        playButton.setAttribute("title", "Play")
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

      if (seek instanceof HTMLInputElement) {
        seek.value = String(audio.currentTime)
      }
    })

    audio.addEventListener("ended", () => {
      setStatus("END OF RECORD")
      loadTrack(selectedIndex() + 1, true)
    })

    audio.addEventListener("error", () => {
      root.classList.remove("is-playing")
      setStatus("FILE NOT FOUND")

      if (playButton) {
        playButton.textContent = "▶"
        playButton.setAttribute("title", "Play")
        playButton.setAttribute("aria-label", "Play")
      }
    })

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

    const initial = getTrack(0)
    if (initial) {
      activeIndex = 0
      audio.src = initial.src
      audio.load()
      setStatus("LOADING MEDIA")
    }
  }

  setupPrimeAudio()
  document.addEventListener("nav", () => window.setTimeout(setupPrimeAudio, 0))
  document.addEventListener("render", () => window.setTimeout(setupPrimeAudio, 0))
})()
`

export default function AudioArchive({
  allFiles = [],
}: AudioArchiveProps = {}) {
  const records = allFiles
  .filter((file) => {
    const frontmatter = (file.frontmatter ?? {}) as AudioFrontmatter
    const id = text(frontmatter.id) ?? ""
    const type = text(frontmatter.type)?.toLowerCase()

    return (
      frontmatter.published !== false &&
      (
        type === "audio" ||
        /^(AUD|ECHO)-\d+$/i.test(id)
      )
    )
  })
    .sort((a, b) => {
      const aId = text(a.frontmatter?.id) ?? ""
      const bId = text(b.frontmatter?.id) ?? ""

      return aId.localeCompare(bId, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    })

  if (records.length === 0) {
    return (
      <section class="prime-audio prime-audio--empty">
        <div class="prime-audio__empty">
          <span>NO AUDIO MEDIA DETECTED</span>
          <p>
            Add published records to content/09-audio and matching MP3 files to
            content/static/audio.
          </p>
        </div>
      </section>
    )
  }

  const selectionCss = records
    .map(
      (_, index) => `
        #prime-audio-select-${index}:checked
          ~ .prime-audio__workspace
          .prime-audio-track[data-audio-index="${index}"] {
          background:
            linear-gradient(
              90deg,
              rgba(255, 191, 92, 0.11),
              rgba(255, 191, 92, 0.02)
            );
          box-shadow: inset 3px 0 0 #ffbf5c;
        }

        #prime-audio-select-${index}:checked
          ~ .prime-audio__workspace
          .prime-audio-record[data-audio-index="${index}"] {
          display: contents;
        }

        #prime-audio-select-${index}:checked
          ~ .prime-audio__workspace
          .prime-audio-detail__record[data-audio-index="${index}"] {
          display: block;
        }
      `,
    )
    .join("\n")

  const firstId = text(records[0].frontmatter?.id) ?? "AUD-000"

  return (
    <section class="prime-audio">
      <style dangerouslySetInnerHTML={{ __html: selectionCss }} />

      {records.map((_, index) => (
        <input
          id={`prime-audio-select-${index}`}
          class="prime-audio__radio"
          type="radio"
          name="prime-audio-selection"
          data-audio-index={index}
          checked={index === 0}
          aria-hidden="true"
        />
      ))}

      <audio
        id="prime-audio-element"
        src={`/static/audio/${firstId.toLowerCase()}.mp3`}
        preload="metadata"
      />

      <header class="prime-audio__header">
        <div>
          <p class="prime-audio__eyebrow">Recovered Audio Media</p>

          <h1>Echo Deck</h1>

          <p class="prime-audio__subtitle">
            Songs, recordings and recovered Echo Crystal fragments recognized by this terminal.
          </p>
        </div>

        <div class="prime-audio__status">
          <span data-audio-player-status>LOADING MEDIA</span>
        </div>
      </header>

      <div class="prime-audio__workspace">
        <aside class="prime-audio-panel prime-audio-panel--library">
          <div class="prime-audio-panel__heading">
            <span class="prime-audio-panel__label">Audio Library</span>

            <span class="prime-audio-panel__count">
              {records.length.toString().padStart(2, "0")} RECORDS
            </span>
          </div>

          <div class="prime-audio-library">
            {records.map((record, index) => {
              const fm = (record.frontmatter ?? {}) as AudioFrontmatter
              const id = text(fm.id) ?? `AUD-${index + 1}`
              const title = text(fm.title) ?? "Untitled Audio"
              const typeLabel = audioTypeLabel(fm, id)
              const description =
                text(fm.description) ??
                (id.toUpperCase().startsWith("ECHO-")
                  ? "Recovered Echo Crystal fragment"
                  : "Archived audio recording")

              return (
                <label
                  for={`prime-audio-select-${index}`}
                  class="prime-audio-track"
                  data-audio-track-label
                  data-audio-index={index}
                  data-audio-src={`/static/audio/${id.toLowerCase()}.mp3`}
                  data-audio-title={title}
                >
                  <div class="prime-audio-track__top">
                    <strong>{title}</strong>
                    <span class="prime-audio-track__meta">{id}</span>
                  </div>

                  <p>{description}</p>

                  <span class="prime-audio-track__type">{typeLabel}</span>
                </label>
              )
            })}
          </div>
        </aside>

        <main class="prime-audio-stage">
          <div class="prime-audio-deck__stamp">
            <span>PAT-04 // MAGNETIC ECHO INTERFACE</span>
            <span>CHANNEL A</span>
          </div>

          <div class="prime-audio-cassette">
            {records.map((record, index) => {
              const fm = (record.frontmatter ?? {}) as AudioFrontmatter
              const id = text(fm.id) ?? `AUD-${index + 1}`
              const title = text(fm.title) ?? "Untitled Audio"
              const sourceLabel =
                id.toUpperCase().startsWith("ECHO-")
                  ? "ECHO CRYSTAL"
                  : "PRIME ARCHIVES"

              return (
                <div
                  class="prime-audio-record"
                  data-audio-index={index}
                >
                  <div class="prime-audio-cassette__label">
                    <div class="prime-audio-cassette__label-top">
                      <span>{sourceLabel}</span>
                      <span>{id}</span>
                    </div>

                    <div class="prime-audio-cassette__title">
                      {title.toUpperCase()}
                    </div>
                  </div>
                </div>
              )
            })}

            <div class="prime-audio-cassette__window">
              <span class="prime-audio-cassette__reel"></span>
              <span class="prime-audio-cassette__tape"></span>
              <span class="prime-audio-cassette__reel"></span>
            </div>

            <div class="prime-audio-cassette__footer">
              <span>AUTO REVERSE // TYPE IV</span>
              <span>ECHO DECK</span>
            </div>
          </div>

          <div class="prime-audio-controls">
            <input
              class="prime-audio-controls__seek"
              data-audio-seek
              type="range"
              min="0"
              max="0"
              step="0.1"
              value="0"
              aria-label="Playback position"
            />

            <div class="prime-audio-controls__time">
              <span data-audio-current>00:00</span>
              <span data-audio-duration>00:00</span>
            </div>

            <div class="prime-audio-controls__buttons">
              <button
                type="button"
                class="prime-audio-button"
                data-audio-action="prev"
                title="Previous"
                aria-label="Previous track"
              >
                ◀◀
              </button>

              <button
                type="button"
                class="prime-audio-button prime-audio-button--primary"
                data-audio-action="play"
                title="Play"
                aria-label="Play"
              >
                ▶
              </button>

              <button
                type="button"
                class="prime-audio-button"
                data-audio-action="next"
                title="Next"
                aria-label="Next track"
              >
                ▶▶
              </button>

              <label class="prime-audio-volume">
                <span>VOL</span>

                <input
                  data-audio-volume
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value="0.8"
                  aria-label="Volume"
                />
              </label>
            </div>
          </div>
        </main>

        <aside class="prime-audio-panel prime-audio-panel--detail">
          <div class="prime-audio-panel__heading">
            <span class="prime-audio-panel__label">Media Record</span>
          </div>

          <div class="prime-audio-detail">
            {records.map((record, index) => {
              const fm = (record.frontmatter ?? {}) as AudioFrontmatter
              const id = text(fm.id) ?? `AUD-${index + 1}`
              const title = text(fm.title) ?? "Untitled Audio"
              const typeLabel = audioTypeLabel(fm, id)
              const isEcho = id.toUpperCase().startsWith("ECHO-")
              const associatedRecord = text(fm.associatedRecord)
              const source = text(fm.source)
              const signalIntegrity =
                fm.signalIntegrity !== undefined
                  ? String(fm.signalIntegrity)
                  : undefined

              return (
                <div
                  class="prime-audio-detail__record"
                  data-audio-index={index}
                >
                  <span class="prime-audio-panel__label">{id}</span>

                  <h2>{title}</h2>

                  <p class="prime-audio-detail__classification">
                    {isEcho
                      ? "Recovered Echo Crystal fragment"
                      : "Archived audio recording"}
                  </p>

                  <dl>
                    <div>
                      <dt>MEDIA TYPE</dt>
                      <dd>{typeLabel}</dd>
                    </div>

                    {associatedRecord && (
                      <div>
                        <dt>ASSOCIATED RECORD</dt>
                        <dd>{associatedRecord}</dd>
                      </div>
                    )}

                    {source && (
                      <div>
                        <dt>SOURCE</dt>
                        <dd>{source}</dd>
                      </div>
                    )}

                    {signalIntegrity && (
                      <div>
                        <dt>SIGNAL INTEGRITY</dt>
                        <dd>{signalIntegrity}</dd>
                      </div>
                    )}

                    {!source && !signalIntegrity && (
                      <div>
                        <dt>ARCHIVE STATUS</dt>
                        <dd>Available</dd>
                      </div>
                    )}
                  </dl>

                  <div class="prime-audio-detail__footer">
                    <span>
                      {isEcho ? "ECHO SIGNAL MOUNTED" : "AUDIO RECORD READY"}
                    </span>
                    <br />
                    <span>
                      Playback source: /static/audio/{id.toLowerCase()}.mp3
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </aside>
      </div>
    </section>
  )
}
