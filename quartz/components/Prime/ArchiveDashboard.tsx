import {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "../types"
import ArchiveCard from "./ArchiveCard"

const ArchiveDashboard: QuartzComponent = (_props: QuartzComponentProps) => {
  return (
    <>
      <div class="prime-boot" aria-hidden="true">
        <div class="prime-boot__screen">
          <p class="prime-boot__device">PAT-03</p>

          <h1>Prime Archives Terminal</h1>

          <div class="prime-boot__log">
            <p>Initializing hardware...</p>
            <p>Loading local cache...</p>
            <p>Synchronizing archives...</p>
            <p class="prime-boot__online">Connection established.</p>
          </div>

          <div class="prime-boot__progress">
            <span></span>
          </div>
        </div>
      </div>

      <main class="archive-dashboard">
        <header class="archive-dashboard__header">
          <div>
            <p class="archive-dashboard__eyebrow">Prime Archives Terminal</p>

            <h1>Archive Index</h1>

            <p class="archive-dashboard__subtitle">
              Public records and field tools available to Echo Squad.
            </p>
          </div>

          <dl class="archive-dashboard__device">
            <div>
              <dt>Device</dt>
              <dd>PAT-03</dd>
            </div>

            <div>
              <dt>Clearance</dt>
              <dd>Public</dd>
            </div>

            <div>
              <dt>Firmware</dt>
              <dd>1.0</dd>
            </div>
          </dl>
        </header>

        <section class="archive-dashboard__section">
          <div class="archive-dashboard__section-heading">
            <p>Database modules</p>
            <h2>Public Archives</h2>
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

            <ArchiveCard
              title="Timeline"
              description="Recovered events in chronological order."
              href="/02-timeline/"
              icon="⌛"
              status="Online"
            />
          </div>
        </section>

        <section class="archive-dashboard__section">
          <div class="archive-dashboard__section-heading">
            <p>Portable applications</p>
            <h2>Field Tools</h2>
          </div>

          <div class="archive-dashboard__grid archive-dashboard__grid--tools">
            <ArchiveCard
              title="Navigation"
              description="Maps, routes and known destinations."
              href="/navigation/"
              icon="⌁"
              category="tool"
              status="Available"
            />

            <ArchiveCard
              title="Messages"
              description="Incoming and archived transmissions."
              href="/messages/"
              icon="✉"
              category="tool"
              status="No unread messages"
            />

            <ArchiveCard
              title="Objectives"
              description="Current tasks and recovered mission data."
              href="/objectives/"
              icon="◎"
              category="tool"
              status="Available"
            />
          </div>
        </section>

        <footer class="archive-dashboard__status">
          <div>
            <span>Archive integrity</span>
            <strong>84%</strong>
          </div>

          <div>
            <span>Signal</span>
            <strong>Stable</strong>
          </div>

          <div>
            <span>Registered user</span>
            <strong>Echo Squad</strong>
          </div>

          <div>
            <span>Network</span>
            <strong>Online</strong>
          </div>
        </footer>
      </main>
    </>
  )
}

export default (() => ArchiveDashboard) satisfies QuartzComponentConstructor