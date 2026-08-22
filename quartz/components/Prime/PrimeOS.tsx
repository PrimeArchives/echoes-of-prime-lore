import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "../types"

import ArchiveCard from "./ArchiveCard"
import Map from "./navigation/map"
import { buildVirex9Map } from "./navigation/maps/virex9"
import Messages from "./messages/messages"
import Objectives from "./objectives/objectives"
import AudioArchive, { audioArchiveAfterDOMLoaded } from "./audio/AudioArchive"

const PrimeOS: QuartzComponent = (props: QuartzComponentProps) => {
  const virex9Map = buildVirex9Map(props.allFiles)

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

            .prime-audio {
              width: min(1320px, calc(100% - 2rem));
              margin: 1.25rem auto 2rem;
              color: #d7e0e7;
            }

            .prime-audio__header {
              display: flex;
              align-items: flex-end;
              justify-content: space-between;
              gap: 1.5rem;
              padding: 1.25rem 1.4rem 1rem;
              border: 1px solid rgba(255, 191, 92, 0.18);
              border-bottom: 0;
              border-radius: 14px 14px 0 0;
              background:
                radial-gradient(circle at 15% 0%, rgba(255, 191, 92, 0.08), transparent 32rem),
                linear-gradient(180deg, rgba(28, 26, 22, 0.96), rgba(13, 16, 20, 0.98));
            }

            .prime-audio__eyebrow,
            .prime-audio__status span,
            .prime-audio-panel__label,
            .prime-audio-track__meta,
            .prime-audio-deck__stamp,
            .prime-audio-controls__time,
            .prime-audio-detail dt,
            .prime-audio-detail__footer {
              font-family: var(--codeFont);
              text-transform: uppercase;
              letter-spacing: 0.11em;
            }

            .prime-audio__eyebrow {
              margin: 0 0 0.3rem;
              color: #ffbf5c;
              font-size: 0.58rem;
              font-weight: 900;
            }

            .prime-audio__header h1 {
              margin: 0;
              color: #f4f1e8;
              font-size: clamp(2.5rem, 5vw, 4.6rem);
              line-height: 0.94;
            }

            .prime-audio__subtitle {
              max-width: 650px;
              margin: 0.75rem 0 0;
              color: #9eabb5;
              font-size: 0.9rem;
            }

            .prime-audio__status {
              display: flex;
              align-items: center;
              gap: 0.55rem;
              color: #b8c3cc;
              font-size: 0.56rem;
              font-weight: 800;
              white-space: nowrap;
            }

            .prime-audio__status::before {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: #ffbf5c;
              box-shadow: 0 0 12px rgba(255, 191, 92, 0.7);
              content: "";
            }

            .prime-audio__workspace {
              display: grid;
              grid-template-columns: minmax(255px, 0.72fr) minmax(430px, 1.35fr) minmax(260px, 0.78fr);
              min-height: 590px;
              overflow: hidden;
              border: 1px solid rgba(255, 191, 92, 0.18);
              border-radius: 0 0 14px 14px;
              background: #080b0f;
              box-shadow: 0 22px 65px rgba(0, 0, 0, 0.3);
            }

            .prime-audio__radio {
              position: absolute;
              width: 1px;
              height: 1px;
              opacity: 0;
              pointer-events: none;
            }

            .prime-audio-panel {
              min-width: 0;
            }

            .prime-audio-panel--library {
              border-right: 1px solid rgba(255, 191, 92, 0.12);
              background:
                linear-gradient(180deg, rgba(24, 25, 25, 0.96), rgba(10, 13, 16, 0.98));
            }

            .prime-audio-panel--detail {
              border-left: 1px solid rgba(255, 191, 92, 0.12);
              background:
                linear-gradient(180deg, rgba(21, 22, 22, 0.96), rgba(9, 12, 15, 0.98));
            }

            .prime-audio-panel__heading {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 1rem;
              padding: 0.85rem 1rem;
              border-bottom: 1px solid rgba(255, 191, 92, 0.1);
            }

            .prime-audio-panel__label {
              color: #ffbf5c;
              font-size: 0.5rem;
              font-weight: 900;
            }

            .prime-audio-panel__count {
              color: #667582;
              font-family: var(--codeFont);
              font-size: 0.5rem;
            }

            .prime-audio-library {
              display: flex;
              flex-direction: column;
            }

            .prime-audio-track {
              position: relative;
              display: block;
              padding: 1rem 1rem 0.95rem 1.15rem;
              border-bottom: 1px solid rgba(255, 191, 92, 0.075);
              cursor: pointer;
              transition: background 120ms ease, box-shadow 120ms ease;
            }

            .prime-audio-track:hover {
              background: rgba(255, 191, 92, 0.045);
            }

            .prime-audio-track__top {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 0.75rem;
            }

            .prime-audio-track strong {
              overflow: hidden;
              color: #d9e0e5;
              font-size: 0.78rem;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .prime-audio-track p {
              overflow: hidden;
              margin: 0.28rem 0 0 !important;
              color: #7f8c97;
              font-size: 0.72rem;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .prime-audio-track__meta {
              flex: 0 0 auto;
              color: #6a7884;
              font-size: 0.42rem;
            }

            .prime-audio-track__type {
              display: inline-block;
              margin-top: 0.55rem;
              padding: 0.2rem 0.38rem;
              border: 1px solid rgba(255, 191, 92, 0.2);
              border-radius: 3px;
              color: #c99d55;
              font-family: var(--codeFont);
              font-size: 0.4rem;
              font-weight: 800;
              letter-spacing: 0.09em;
              text-transform: uppercase;
            }

            #prime-audio-track-dakka:checked ~ .prime-audio__workspace
              label[for="prime-audio-track-dakka"],
            #prime-audio-track-echo:checked ~ .prime-audio__workspace
              label[for="prime-audio-track-echo"] {
              background:
                linear-gradient(90deg, rgba(255, 191, 92, 0.11), rgba(255, 191, 92, 0.02));
              box-shadow: inset 3px 0 0 #ffbf5c;
            }

            .prime-audio-stage {
              display: flex;
              min-width: 0;
              flex-direction: column;
              padding: clamp(1.25rem, 2.5vw, 2rem);
              background:
                radial-gradient(circle at 50% 40%, rgba(255, 191, 92, 0.055), transparent 28rem),
                linear-gradient(180deg, #0e1114, #07090c);
            }

            .prime-audio-deck__stamp {
              display: flex;
              justify-content: space-between;
              gap: 1rem;
              margin-bottom: 1rem;
              color: #6d7b84;
              font-size: 0.46rem;
              font-weight: 800;
            }

            .prime-audio-cassette {
              position: relative;
              width: min(620px, 100%);
              margin: auto;
              padding: clamp(1rem, 2.5vw, 1.6rem);
              border: 1px solid #4a4538;
              border-radius: 13px;
              background:
                linear-gradient(165deg, #302d26, #1c1b17 55%, #141410);
              box-shadow:
                0 26px 50px rgba(0, 0, 0, 0.4),
                inset 0 0 0 3px #161713,
                inset 0 0 35px rgba(0, 0, 0, 0.7);
            }

            .prime-audio-cassette::before,
            .prime-audio-cassette::after {
              position: absolute;
              top: 12px;
              width: 8px;
              height: 8px;
              border: 1px solid #77705c;
              border-radius: 50%;
              background: #0a0b09;
              content: "";
            }

            .prime-audio-cassette::before {
              left: 12px;
            }

            .prime-audio-cassette::after {
              right: 12px;
            }

            .prime-audio-cassette__label {
              padding: 0.85rem 1rem 0.72rem;
              border: 1px solid #b2a276;
              border-radius: 5px 5px 0 0;
              background:
                linear-gradient(rgba(76, 64, 43, 0.08), rgba(76, 64, 43, 0.08)),
                #d8c99f;
              color: #17150f;
              box-shadow: inset 0 -8px 0 rgba(116, 77, 34, 0.08);
            }

            .prime-audio-cassette__label-top {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 1rem;
              font-family: var(--codeFont);
              font-size: 0.52rem;
              font-weight: 900;
              letter-spacing: 0.11em;
            }

            .prime-audio-cassette__title {
              margin-top: 0.45rem;
              overflow: hidden;
              font-size: clamp(1rem, 2vw, 1.25rem);
              font-weight: 850;
              letter-spacing: 0.03em;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .prime-audio-cassette__window {
              display: grid;
              grid-template-columns: 88px minmax(70px, 1fr) 88px;
              align-items: center;
              gap: 1rem;
              min-height: 125px;
              padding: 1rem;
              border: 1px solid #706a58;
              border-top: 0;
              border-radius: 0 0 5px 5px;
              background: #090a08;
            }

            .prime-audio-cassette__reel {
              position: relative;
              width: 72px;
              height: 72px;
              justify-self: center;
              border: 9px double #8d8268;
              border-radius: 50%;
              background: #171815;
              box-shadow:
                inset 0 0 0 10px #080907,
                0 0 0 2px #2b2b24;
            }

            .prime-audio-cassette__reel::before {
              position: absolute;
              inset: 14px;
              border: 2px dashed #aca082;
              border-radius: 50%;
              content: "";
            }

            .prime-audio-cassette__tape {
              height: 38px;
              border: 1px solid #3a382f;
              border-radius: 18px;
              background:
                linear-gradient(180deg, #161713, #050604);
              box-shadow: inset 0 0 14px #000;
            }

            .prime-audio-cassette__footer {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 1rem;
              margin-top: 1rem;
              color: #787261;
              font-family: var(--codeFont);
              font-size: 0.44rem;
              font-weight: 800;
              letter-spacing: 0.1em;
            }

            .prime-audio-controls {
              width: min(620px, 100%);
              margin: 1.35rem auto 0;
            }

            .prime-audio-controls__progress {
              position: relative;
              height: 5px;
              overflow: hidden;
              border-radius: 999px;
              background: #22272b;
            }

            .prime-audio-controls__progress span {
              display: block;
              width: 34%;
              height: 100%;
              background: #ffbf5c;
              box-shadow: 0 0 12px rgba(255, 191, 92, 0.45);
            }

            .prime-audio-controls__time {
              display: flex;
              justify-content: space-between;
              margin-top: 0.42rem;
              color: #63717c;
              font-size: 0.42rem;
            }

            .prime-audio-controls__buttons {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 0.65rem;
              margin-top: 1rem;
            }

            .prime-audio-button {
              display: grid;
              width: 42px;
              height: 34px;
              place-items: center;
              border: 1px solid #494840;
              border-radius: 4px;
              background: linear-gradient(180deg, #252620, #11130f);
              color: #9c9785;
              font-family: var(--codeFont);
              font-size: 0.72rem;
              box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.5);
            }

            .prime-audio-button--primary {
              width: 54px;
              border-color: rgba(255, 191, 92, 0.45);
              color: #ffbf5c;
            }

            .prime-audio-detail {
              padding: 1.15rem;
            }

            .prime-audio-detail__record {
              display: none;
            }

            #prime-audio-track-dakka:checked ~ .prime-audio__workspace
              .prime-audio-detail__record[data-audio-record="dakka"],
            #prime-audio-track-echo:checked ~ .prime-audio__workspace
              .prime-audio-detail__record[data-audio-record="echo"] {
              display: block;
            }

            .prime-audio-detail h2 {
              margin: 0.35rem 0 0.5rem;
              color: #f1eee5;
              font-size: 1.35rem;
            }

            .prime-audio-detail__classification {
              margin: 0 0 1.15rem;
              color: #8e9ba5;
              font-size: 0.75rem;
            }

            .prime-audio-detail dl {
              display: grid;
              gap: 0.8rem;
              margin: 0;
            }

            .prime-audio-detail dl > div {
              padding-bottom: 0.65rem;
              border-bottom: 1px solid rgba(255, 191, 92, 0.075);
            }

            .prime-audio-detail dt {
              margin-bottom: 0.18rem;
              color: #6d7c87;
              font-size: 0.42rem;
              font-weight: 900;
            }

            .prime-audio-detail dd {
              margin: 0;
              color: #cbd4da;
              font-size: 0.72rem;
            }

            .prime-audio-detail__footer {
              margin-top: 1.5rem;
              padding: 0.7rem;
              border: 1px dashed rgba(255, 191, 92, 0.17);
              color: #9b7c4d;
              font-size: 0.43rem;
              line-height: 1.7;
            }

            .prime-audio-stage__dakka,
            .prime-audio-stage__echo {
              display: none;
            }

            #prime-audio-track-dakka:checked ~ .prime-audio__workspace
              .prime-audio-stage__dakka,
            #prime-audio-track-echo:checked ~ .prime-audio__workspace
              .prime-audio-stage__echo {
              display: contents;
            }

            @media all and (max-width: 1040px) {
              .prime-audio__workspace {
                grid-template-columns: 280px minmax(0, 1fr);
              }

              .prime-audio-panel--detail {
                display: none;
              }
            }

            @media all and (max-width: 700px) {
              .prime-audio {
                width: calc(100% - 1rem);
              }

              .prime-audio__header {
                align-items: flex-start;
                flex-direction: column;
              }

              .prime-audio__workspace {
                display: block;
                min-height: 0;
              }

              .prime-audio-panel--library {
                max-height: 230px;
                overflow-y: auto;
                border-right: 0;
                border-bottom: 1px solid rgba(255, 191, 92, 0.12);
              }

              .prime-audio-stage {
                padding: 1rem;
              }

              .prime-audio-cassette__window {
                grid-template-columns: 64px minmax(50px, 1fr) 64px;
              }

              .prime-audio-cassette__reel {
                width: 54px;
                height: 54px;
              }
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
                1.0
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
              href="/04-factions/"
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

          <Messages allFiles={props.allFiles ?? []} />
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

          <Objectives allFiles={props.allFiles ?? []} />
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

          <AudioArchive allFiles={props.allFiles ?? []} />
        </div>
      </section>
    </>
  )
}


PrimeOS.afterDOMLoaded = audioArchiveAfterDOMLoaded + String.raw`
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
})()
`

export default (() => PrimeOS) satisfies QuartzComponentConstructor