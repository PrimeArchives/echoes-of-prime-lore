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
   * client-side state or additional Quartz scripts.
   *
   * Every inbox item is a label pointing at one of these radios.
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

          <h2>
            Inbox
          </h2>
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

        <span>
          SYNCHRONIZED
        </span>
      </div>

      <div class="prime-mail__workspace">
        <aside class="prime-mail__inbox">
          <div class="prime-mail__inbox-heading">
            <span>INBOX</span>
            <strong>{messages.length}</strong>
          </div>

          <div class="prime-mail__list">
            {messages.map((message, index) => {
              const fm = message.frontmatter ?? {}

              const title =
                value(fm.title) ??
                "Untitled Transmission"

              const sender =
                value(fm.sender) ??
                "Unknown Sender"

              const id =
                value(fm.id) ??
                "MSG-???"

              const status =
                 value(fm.status)?.toLowerCase() ??
                (fm.unread === true ? "unread" : "read")

              const priority =
                value(fm.priority)?.toLowerCase() ??
                "normal"

              return (
                <label
                  for={`prime-message-select-${index}`}
                  class={[
                    "prime-mail-item",
                    `prime-mail-item--${status}`,
                    priority === "high"
                      ? "prime-mail-item--priority"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  data-message-index={index}
                >
                  <span class="prime-mail-item__indicator"></span>

                  <div class="prime-mail-item__content">
                    <div class="prime-mail-item__top">
                      <strong>
                        {sender}
                      </strong>

                      <span>
                        {id}
                      </span>
                    </div>

                    <p>
                      {title}
                    </p>

                    <div class="prime-mail-item__flags">
                      {status === "unread" && (
                        <span>
                          UNREAD
                        </span>
                      )}

                      {status === "corrupted" && (
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
            const fm = message.frontmatter ?? {}

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

            const status =
              value(fm.status)?.toLowerCase() ??
              "read"

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
                  status === "corrupted"
                    ? "prime-mail-reader--corrupted"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                data-message-index={index}
              >
                <header class="prime-mail-reader__header">
                  <div class="prime-mail-reader__classification">
                    <span>
                      TRANSMISSION RECORD
                    </span>

                    <strong>
                      {id}
                    </strong>
                  </div>

                  <h2>
                    {title}
                  </h2>

                  <div class="prime-mail-reader__flags">
                    {priority === "high" && (
                      <span class="prime-mail-reader__flag prime-mail-reader__flag--priority">
                        PRIORITY
                      </span>
                    )}

                    {status === "corrupted" && (
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
                      {status.toUpperCase()}
                    </dd>
                  </div>
                </dl>

                <div class="prime-mail-reader__divider">
                  <span></span>
                  <strong>
                    MESSAGE BODY
                  </strong>
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

                  <strong>
                    {id}
                  </strong>
                </footer>
              </article>
            )
          })}
        </main>
      </div>
    </section>
  )
}