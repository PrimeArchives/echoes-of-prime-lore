import { h } from "preact"
import type { Node, Root } from "hast"

import { QuartzPluginData } from "../../../plugins/vfile"

type MessagesProps = {
  allFiles?: QuartzPluginData[]
}

function value(input: unknown) {
  return typeof input === "string" ? input : undefined
}

/**
 * Render the already processed Quartz HAST as Preact elements.
 *
 * This deliberately uses page.htmlAst instead of parsing Markdown again.
 * Quartz has already processed links, formatting, lists, callouts, etc.
 */
function renderHast(node: Node): any {
  if (node.type === "root") {
    return (node as Root).children.map((child) => renderHast(child))
  }

  if (node.type === "text") {
    return node.value
  }

  if (node.type === "element") {
    const properties: Record<string, any> = {
      ...(node.properties ?? {}),
    }

    // HAST stores classes as className, often as an array.
    // Preact is happier receiving one normal class string.
    if (properties.className) {
      properties.class = Array.isArray(properties.className)
        ? properties.className.join(" ")
        : properties.className

      delete properties.className
    }

    return h(
      node.tagName,
      properties,
      node.children.map((child) => renderHast(child)),
    )
  }

  return null
}

/**
 * Client-side read-state bridge.
 *
 * Markdown remains the source of message content/metadata.
 * Per-user READ / UNREAD state comes from the Worker + D1.
 *
 * This script is deliberately idempotent. It can safely appear again after
 * Quartz navigation without registering duplicate global click handlers.
 */
const messageReadClientScript = String.raw`
(() => {
  const STATE_KEY = "__primeMessageReadState"

  if (!window[STATE_KEY]) {
    window[STATE_KEY] = {
      installed: false,
      authenticated: false,
      readIds: new Set(),
      loading: false,
    }
  }

  const state = window[STATE_KEY]

  const applyState = () => {
    document.querySelectorAll(".prime-mail").forEach((root) => {
      if (!(root instanceof HTMLElement)) return

      root
        .querySelectorAll(".prime-mail-item[data-message-id]")
        .forEach((item) => {
          if (!(item instanceof HTMLElement)) return

          const messageId = item.dataset.messageId
          if (!messageId) return

          const isRead =
            state.authenticated &&
            state.readIds.has(messageId)

          const isUnread =
            state.authenticated &&
            !isRead

          item.classList.toggle(
            "prime-mail-item--unread",
            isUnread,
          )

          const flag = item.querySelector(
            "[data-message-read-flag]",
          )

          if (flag instanceof HTMLElement) {
            flag.hidden = !isUnread
            flag.textContent = "UNREAD"
          }
        })

      root
        .querySelectorAll(
          ".prime-mail-reader[data-message-id]",
        )
        .forEach((reader) => {
          if (!(reader instanceof HTMLElement)) return

          const messageId = reader.dataset.messageId
          if (!messageId) return

          const status = reader.querySelector(
            "[data-message-read-status]",
          )

          if (!(status instanceof HTMLElement)) return

          if (!state.authenticated) {
            status.textContent = "UNTRACKED"
            return
          }

          status.textContent =
            state.readIds.has(messageId)
              ? "READ"
              : "UNREAD"
        })
    })
  }

  const refreshReadState = async () => {
    if (state.loading) return
    state.loading = true

    try {
      const response = await fetch(
        "/api/messages/read-state",
        {
          method: "GET",
          credentials: "same-origin",
        },
      )

      if (!response.ok) {
        throw new Error(
          "Unable to load message read state",
        )
      }

      const data = await response.json()

      state.authenticated =
        data?.authenticated === true

      state.readIds = new Set(
        Array.isArray(data?.read_message_ids)
          ? data.read_message_ids
          : [],
      )
    } catch (_) {
      state.authenticated = false
      state.readIds = new Set()
    } finally {
      state.loading = false
      applyState()

      document.dispatchEvent(
        new CustomEvent(
          "prime-message-read-state-changed",
        ),
      )
    }
  }

  const markRead = async (messageId) => {
    if (!messageId) return

    if (!state.authenticated) {
      applyState()
      return
    }

    if (state.readIds.has(messageId)) {
      applyState()
      return
    }

    try {
      const response = await fetch(
        "/api/messages/" +
          encodeURIComponent(messageId) +
          "/read",
        {
          method: "POST",
          credentials: "same-origin",
        },
      )

      if (response.status === 401) {
        state.authenticated = false
        state.readIds = new Set()
        applyState()
        return
      }

      if (!response.ok) {
        throw new Error(
          "Unable to mark transmission as read",
        )
      }

      state.readIds.add(messageId)
      applyState()

      document.dispatchEvent(
        new CustomEvent(
          "prime-message-read-state-changed",
        ),
      )
    } catch (_) {
      // Keep the message unread if synchronization failed.
    }
  }

  const selectedMessageId = () => {
    const checked = document.querySelector(
      ".prime-mail__radio:checked",
    )

    if (!(checked instanceof HTMLInputElement)) {
      return null
    }

    const item = document.querySelector(
      '.prime-mail-item[for="' +
        CSS.escape(checked.id) +
        '"]',
    )

    if (!(item instanceof HTMLElement)) {
      return null
    }

    return item.dataset.messageId ?? null
  }

  if (!state.installed) {
    state.installed = true

    document.addEventListener("click", (event) => {
      const target =
        event.target instanceof Element
          ? event.target
          : null

      if (!target) return

      const item = target.closest(
        ".prime-mail-item[data-message-id]",
      )

      if (item instanceof HTMLElement) {
        void markRead(
          item.dataset.messageId ?? "",
        )
        return
      }

      const launcher = target.closest(
        'label[for="messages-toggle"]',
      )

      if (launcher) {
        window.setTimeout(() => {
          const messageId =
            selectedMessageId()

          if (messageId) {
            void markRead(messageId)
          }
        }, 0)
      }
    })

    document.addEventListener(
      "nav",
      () => {
        window.setTimeout(
          refreshReadState,
          0,
        )
      },
    )

    document.addEventListener(
      "render",
      () => {
        window.setTimeout(
          refreshReadState,
          0,
        )
      },
    )

    // The upcoming PrimeOS login control can dispatch this event
    // after login/logout so Messages refreshes immediately.
    document.addEventListener(
      "prime-auth-changed",
      () => {
        void refreshReadState()
      },
    )
  }

  void refreshReadState()
})()
`

export default function Messages({
  allFiles = [],
}: MessagesProps = {}) {
  const messages = allFiles
    .filter((file) => {
      const slug = (file.slug ?? "").toLowerCase()
      const fm = file.frontmatter ?? {}

      return (
        slug.startsWith("08-messages/") &&
        slug !== "08-messages/index" &&
        fm.published !== false
      )
    })
    .sort((a, b) => {
      const aId = value(a.frontmatter?.id) ?? ""
      const bId = value(b.frontmatter?.id) ?? ""

      return bId.localeCompare(aId, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    })

  if (messages.length === 0) {
    return (
      <section class="prime-mail">
        <div class="prime-mail__empty">
          NO ARCHIVED TRANSMISSIONS FOUND
        </div>
      </section>
    )
  }

  /**
   * Radio buttons let us make the mailbox interactive without
   * a hydrated Preact application.
   *
   * Every inbox item is a label pointing at one of these radios.
   * Per-user read state is layered on top by the small client bridge above.
   */
  const selectionCss = messages
    .map(
      (_, index) => `
        #prime-message-select-${index}:checked
          ~ .prime-mail__workspace
          .prime-mail-item[data-message-index="${index}"] {
          background:
            linear-gradient(
              90deg,
              rgba(100, 215, 255, 0.11),
              rgba(100, 215, 255, 0.025)
            );
          box-shadow: inset 3px 0 0 #64d7ff;
        }

        #prime-message-select-${index}:checked
          ~ .prime-mail__workspace
          .prime-mail-item[data-message-index="${index}"]
          .prime-mail-item__indicator {
          background: #64d7ff;
          box-shadow:
            0 0 8px #64d7ff,
            0 0 18px rgba(100, 215, 255, 0.5);
        }

        #prime-message-select-${index}:checked
          ~ .prime-mail__workspace
          .prime-mail-reader[data-message-index="${index}"] {
          display: flex;
        }
      `,
    )
    .join("\n")

  return (
    <section class="prime-mail">
      <style
        dangerouslySetInnerHTML={{
          __html: selectionCss,
        }}
      />

      <script
        dangerouslySetInnerHTML={{
          __html: messageReadClientScript,
        }}
      />

      {messages.map((_, index) => (
        <input
          id={`prime-message-select-${index}`}
          class="prime-mail__radio"
          type="radio"
          name="prime-message-selection"
          checked={index === 0}
          aria-hidden="true"
        />
      ))}

      <div class="prime-mail__header">
        <div>
          <span class="prime-mail__eyebrow">
            COMMUNICATION ARCHIVE
          </span>

          <h2>Inbox</h2>
        </div>

        <div class="prime-mail__count">
          <strong>{messages.length}</strong>
          <span>
            {messages.length === 1
              ? "TRANSMISSION"
              : "TRANSMISSIONS"}
          </span>
        </div>
      </div>

      <div class="prime-mail__statusbar">
        <span>
          PAT-03 // SECURE MESSAGE CACHE
        </span>

        <span>SYNCHRONIZED</span>
      </div>

      <div class="prime-mail__workspace">
        <aside class="prime-mail__inbox">
          <div class="prime-mail__inbox-heading">
            <span>INBOX</span>
            <strong>{messages.length}</strong>
          </div>

          <div class="prime-mail__list">
            {messages.map((message, index) => {
              const fm =
                message.frontmatter ?? {}

              const title =
                value(fm.title) ??
                "Untitled Transmission"

              const sender =
                value(fm.sender) ??
                "Unknown Sender"

              const id =
                value(fm.id) ??
                "MSG-???"

              const contentStatus =
                value(fm.status)?.toLowerCase() ??
                "nominal"

              const priority =
                value(fm.priority)?.toLowerCase() ??
                "normal"

              return (
                <label
                  for={`prime-message-select-${index}`}
                  class={[
                    "prime-mail-item",
                    contentStatus === "corrupted"
                      ? "prime-mail-item--corrupted"
                      : "",
                    priority === "high"
                      ? "prime-mail-item--priority"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  data-message-index={index}
                  data-message-id={id}
                >
                  <span class="prime-mail-item__indicator"></span>

                  <div class="prime-mail-item__content">
                    <div class="prime-mail-item__top">
                      <strong>{sender}</strong>
                      <span>{id}</span>
                    </div>

                    <p>{title}</p>

                    <div class="prime-mail-item__flags">
                      <span
                        data-message-read-flag
                        hidden
                      >
                        UNREAD
                      </span>

                      {contentStatus === "corrupted" && (
                        <span class="prime-mail-item__flag prime-mail-item__flag--danger">
                          CORRUPTED
                        </span>
                      )}

                      {priority === "high" && (
                        <span class="prime-mail-item__flag prime-mail-item__flag--priority">
                          PRIORITY
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              )
            })}
          </div>
        </aside>

        <main class="prime-mail__reader">
          {messages.map((message, index) => {
            const fm =
              message.frontmatter ?? {}

            const title =
              value(fm.title) ??
              "Untitled Transmission"

            const sender =
              value(fm.sender) ??
              "Unknown Sender"

            const recipient =
              value(fm.recipient) ??
              "Echo Squad"

            const id =
              value(fm.id) ??
              "MSG-???"

            const contentStatus =
              value(fm.status)?.toLowerCase() ??
              "nominal"

            const priority =
              value(fm.priority)?.toLowerCase() ??
              "normal"

            const received =
              value(fm.received) ??
              value(fm.messageDate) ??
              value(fm.date) ??
              "ARCHIVED"

            return (
              <article
                class={[
                  "prime-mail-reader",
                  contentStatus === "corrupted"
                    ? "prime-mail-reader--corrupted"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                data-message-index={index}
                data-message-id={id}
              >
                <header class="prime-mail-reader__header">
                  <div class="prime-mail-reader__classification">
                    <span>
                      TRANSMISSION RECORD
                    </span>

                    <strong>{id}</strong>
                  </div>

                  <h2>{title}</h2>

                  <div class="prime-mail-reader__flags">
                    {priority === "high" && (
                      <span class="prime-mail-reader__flag prime-mail-reader__flag--priority">
                        PRIORITY
                      </span>
                    )}

                    {contentStatus === "corrupted" && (
                      <span class="prime-mail-reader__flag prime-mail-reader__flag--danger">
                        CORRUPTED SIGNAL
                      </span>
                    )}
                  </div>
                </header>

                <dl class="prime-mail-reader__metadata">
                  <div>
                    <dt>FROM</dt>
                    <dd>{sender}</dd>
                  </div>

                  <div>
                    <dt>TO</dt>
                    <dd>{recipient}</dd>
                  </div>

                  <div>
                    <dt>RECEIVED</dt>
                    <dd>{received}</dd>
                  </div>

                  <div>
                    <dt>STATUS</dt>
                    <dd>
                      {contentStatus.toUpperCase()}
                    </dd>
                  </div>

                  <div>
                    <dt>READ STATE</dt>
                    <dd data-message-read-status>
                      SYNCING
                    </dd>
                  </div>
                </dl>

                <div class="prime-mail-reader__divider">
                  <span></span>
                  <strong>MESSAGE BODY</strong>
                  <span></span>
                </div>

                <div class="prime-mail-reader__body">
                  {message.htmlAst ? (
                    renderHast(message.htmlAst)
                  ) : (
                    <p class="prime-mail-reader__missing">
                      MESSAGE BODY UNAVAILABLE
                    </p>
                  )}
                </div>

                <footer class="prime-mail-reader__footer">
                  <span>
                    END OF TRANSMISSION
                  </span>

                  <strong>{id}</strong>
                </footer>
              </article>
            )
          })}
        </main>
      </div>
    </section>
  )
}