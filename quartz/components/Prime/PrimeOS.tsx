import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "../types"

import ArchiveCard from "./ArchiveCard"
import Map from "./navigation/map"
import { virex9Map } from "./navigation/maps/virex9"
import Messages from "./messages/messages"

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
              href="/04-locations/"
              icon="⌖"
              status="Online"
            />

            <ArchiveCard
              title="Personnel"
              description="Known contacts, figures and hostile actors."
              href="/05-npcs/"
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

            <ArchiveCard
              title="Objectives"
              description="Current tasks and recovered mission data."
              href="#"
              icon="◎"
              category="tool"
              status="Standby"
            />
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

          <Messages />
        </div>
      </section>
    </>
  )
}

export default (() => PrimeOS) satisfies QuartzComponentConstructor