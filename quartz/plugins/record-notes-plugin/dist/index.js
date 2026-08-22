// src/components/RecordNotes.tsx
import { jsx, jsxs } from "preact/jsx-runtime";
var RecordNotes = ({
  fileData
}) => {
  const frontmatter = fileData.frontmatter ?? {};
  const recordId = typeof frontmatter.id === "string" ? frontmatter.id : "";
  const recordType = typeof frontmatter.type === "string" ? frontmatter.type.toLowerCase() : "";
  if (recordType !== "npc" || !recordId) {
    return null;
  }
  return /* @__PURE__ */ jsxs(
    "section",
    {
      class: "record-notes",
      "data-record-id": recordId,
      children: [
        /* @__PURE__ */ jsxs("header", { class: "record-notes__header", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { class: "record-notes__eyebrow", children: "SQUAD ANNOTATIONS" }),
            /* @__PURE__ */ jsx("h2", { children: "Field Notes" })
          ] }),
          /* @__PURE__ */ jsx(
            "span",
            {
              class: "record-notes__count",
              "data-notes-count": true,
              children: "-- NOTES"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "div",
          {
            class: "record-notes__list",
            "data-notes-list": true,
            children: /* @__PURE__ */ jsx("p", { class: "record-notes__loading", children: "Synchronizing annotations..." })
          }
        ),
        /* @__PURE__ */ jsxs(
          "form",
          {
            class: "record-notes__form",
            "data-notes-form": true,
            children: [
              /* @__PURE__ */ jsxs("label", { children: [
                "Operative",
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    name: "author",
                    placeholder: "Your name",
                    required: true
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("label", { children: [
                "Annotation",
                /* @__PURE__ */ jsx(
                  "textarea",
                  {
                    name: "content",
                    placeholder: "Add field intelligence...",
                    rows: 4,
                    required: true
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("button", { type: "submit", children: "ADD ANNOTATION" }),
              /* @__PURE__ */ jsx(
                "p",
                {
                  class: "record-notes__message",
                  "data-notes-message": true
                }
              )
            ]
          }
        )
      ]
    }
  );
};
RecordNotes.afterDOMLoaded = `
(() => {
  const setupRecordNotes = () => {
    document.querySelectorAll(".record-notes").forEach((root) => {
      if (!(root instanceof HTMLElement)) return

      if (root.dataset.notesReady === "true") return

      const recordId = root.dataset.recordId
      const list = root.querySelector("[data-notes-list]")
      const count = root.querySelector("[data-notes-count]")
      const form = root.querySelector("[data-notes-form]")
      const message = root.querySelector("[data-notes-message]")

      if (
        !recordId ||
        !(list instanceof HTMLElement) ||
        !(count instanceof HTMLElement) ||
        !(form instanceof HTMLFormElement)
      ) {
        return
      }

      root.dataset.notesReady = "true"

      const loadNotes = async () => {
        try {
          const response = await fetch(
            "/api/notes?record_id=" +
              encodeURIComponent(recordId),
          )

          if (!response.ok) {
            throw new Error("Unable to load annotations")
          }

          const notes = await response.json()

          if (!Array.isArray(notes)) {
            throw new Error("Invalid notes response")
          }

          count.textContent =
            String(notes.length).padStart(2, "0") +
            (notes.length === 1 ? " NOTE" : " NOTES")

          if (notes.length === 0) {
            list.innerHTML =
              '<p class="record-notes__empty">No squad annotations recorded.</p>'

            return
          }

          list.innerHTML = ""

          notes.forEach((note) => {
            const article =
              document.createElement("article")

            article.className = "record-note"

            const meta =
              document.createElement("div")

            meta.className = "record-note__meta"

            const author =
              document.createElement("strong")

            author.textContent =
              typeof note.author === "string"
                ? note.author
                : "Unknown"

            const date =
              document.createElement("time")

            date.textContent =
              typeof note.created_at === "string"
                ? note.created_at
                : ""

            const content =
              document.createElement("p")

            content.textContent =
              typeof note.content === "string"
                ? note.content
                : ""

            meta.append(author, date)
            article.append(meta, content)
            list.append(article)
          })
        } catch (error) {
          list.innerHTML =
            '<p class="record-notes__error">Annotation sync unavailable.</p>'
        }
      }

      form.addEventListener("submit", async (event) => {
        event.preventDefault()

        const formData = new FormData(form)

        const author =
          String(
            formData.get("author") ?? "",
          ).trim()

        const content =
          String(
            formData.get("content") ?? "",
          ).trim()

        if (!author || !content) {
          return
        }

        if (message instanceof HTMLElement) {
          message.textContent =
            "Transmitting annotation..."
        }

        try {
          const response = await fetch("/api/notes", {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              record_id: recordId,
              author,
              content,
            }),
          })

          if (!response.ok) {
            throw new Error("Unable to save annotation")
          }

          form.reset()

          if (message instanceof HTMLElement) {
            message.textContent =
              "Annotation recorded."
          }

          await loadNotes()
        } catch (error) {
          if (message instanceof HTMLElement) {
            message.textContent =
              "Transmission failed."
          }
        }
      })

      loadNotes()
    })
  }

  setupRecordNotes()

  document.addEventListener(
    "nav",
    () => window.setTimeout(setupRecordNotes, 0),
  )

  document.addEventListener(
    "render",
    () => window.setTimeout(setupRecordNotes, 0),
  )
})()
`;
RecordNotes.css = String.raw`
.record-notes {
  margin: 3rem 0 1.5rem;
  padding: 1.25rem;
  border: 1px solid rgba(100, 215, 255, 0.28);
  border-radius: 8px;
  background:
    linear-gradient(
      135deg,
      rgba(100, 215, 255, 0.035),
      transparent 45%
    ),
    rgba(8, 14, 18, 0.5);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.025),
    0 8px 24px rgba(0, 0, 0, 0.12);
}

.record-notes__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid rgba(100, 215, 255, 0.16);
}

.record-notes__header h2 {
  margin: 0.15rem 0 0;
  font-size: 1.3rem;
  line-height: 1.2;
  letter-spacing: 0.02em;
}

.record-notes__eyebrow {
  display: block;
  color: var(--secondary);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  opacity: 0.9;
  text-transform: uppercase;
}

.record-notes__count {
  flex: 0 0 auto;
  padding: 0.28rem 0.48rem;
  border: 1px solid rgba(100, 215, 255, 0.2);
  border-radius: 4px;
  background: rgba(100, 215, 255, 0.045);
  color: var(--secondary);
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.record-notes__list {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  margin-bottom: 1.2rem;
}

.record-note {
  position: relative;
  margin: 0;
  padding: 0.85rem 0.95rem 0.85rem 1rem;
  border: 1px solid var(--lightgray);
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.018);
}

.record-note::before {
  position: absolute;
  top: 0.65rem;
  bottom: 0.65rem;
  left: 0;
  width: 2px;
  border-radius: 2px;
  background: var(--secondary);
  content: "";
  opacity: 0.65;
}

.record-note p {
  margin: 0.5rem 0 0;
  line-height: 1.55;
}

.record-note__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.72rem;
}

.record-note__meta strong {
  color: var(--secondary);
  letter-spacing: 0.04em;
}

.record-note__meta time {
  color: var(--gray);
  font-size: 0.68rem;
  white-space: nowrap;
}

.record-notes__empty,
.record-notes__loading,
.record-notes__error {
  margin: 0;
  padding: 0.75rem 0;
  color: var(--gray);
  font-size: 0.82rem;
  font-style: italic;
}

.record-notes__error {
  color: var(--tertiary);
}

.record-notes__form {
  display: grid;
  grid-template-columns: minmax(130px, 0.32fr) minmax(220px, 1fr);
  gap: 0.8rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(100, 215, 255, 0.14);
}

.record-notes__form label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  color: var(--gray);
  font-size: 0.67rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.record-notes__form input,
.record-notes__form textarea {
  box-sizing: border-box;
  width: 100%;
  margin: 0;
  padding: 0.65rem 0.7rem;
  border: 1px solid var(--lightgray);
  border-radius: 4px;
  outline: none;
  background: var(--light);
  color: var(--dark);
  font: inherit;
  font-size: 0.85rem;
  line-height: 1.45;
  transition:
    border-color 120ms ease,
    box-shadow 120ms ease;
}

.record-notes__form input:focus,
.record-notes__form textarea:focus {
  border-color: var(--secondary);
  box-shadow: 0 0 0 2px rgba(100, 215, 255, 0.1);
}

.record-notes__form textarea {
  min-height: 90px;
  resize: vertical;
}

.record-notes__form button {
  grid-column: 2;
  justify-self: end;
  margin: 0;
  padding: 0.55rem 0.8rem;
  border: 1px solid rgba(100, 215, 255, 0.45);
  border-radius: 4px;
  background: rgba(100, 215, 255, 0.07);
  color: var(--secondary);
  cursor: pointer;
  font: inherit;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  transition:
    background 120ms ease,
    border-color 120ms ease;
}

.record-notes__form button:hover {
  border-color: var(--secondary);
  background: rgba(100, 215, 255, 0.13);
}

.record-notes__message {
  grid-column: 1 / -1;
  min-height: 1em;
  margin: 0;
  color: var(--gray);
  font-size: 0.72rem;
}

@media (max-width: 700px) {
  .record-notes {
    padding: 1rem;
  }

  .record-notes__header {
    align-items: flex-start;
  }

  .record-notes__form {
    grid-template-columns: 1fr;
  }

  .record-notes__form button {
    grid-column: 1;
    justify-self: stretch;
  }

  .record-note__meta {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.2rem;
  }
}
`;
var RecordNotes_default = (() => RecordNotes);
export {
  RecordNotes_default as RecordNotes
};
