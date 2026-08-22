import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "@quartz-community/types"

type NotesFrontmatter = {
  id?: string
  type?: string
}

const RecordNotes: QuartzComponent = ({
  fileData,
}: QuartzComponentProps) => {
  const frontmatter =
    (fileData.frontmatter ?? {}) as NotesFrontmatter

  const recordId =
    typeof frontmatter.id === "string"
      ? frontmatter.id
      : ""

  const recordType =
    typeof frontmatter.type === "string"
      ? frontmatter.type.toLowerCase()
      : ""

  // Eerste testfase:
  // alleen tonen op individuele NPC-records.
  if (recordType !== "npc" || !recordId) {
  return (
    <div
      style="padding: 1rem; border: 2px solid red; color: red;"
      data-record-notes-debug
    >
      RecordNotes mounted — type: {recordType || "(empty)"} — id: {recordId || "(empty)"}
    </div>
  )
}
  return (
    <section
      class="record-notes"
      data-record-id={recordId}
    >
      <header class="record-notes__header">
        <div>
          <span class="record-notes__eyebrow">
            SQUAD ANNOTATIONS
          </span>

          <h2>
            Field Notes
          </h2>
        </div>

        <span
          class="record-notes__count"
          data-notes-count
        >
          -- NOTES
        </span>
      </header>

      <div
        class="record-notes__list"
        data-notes-list
      >
        <p class="record-notes__loading">
          Synchronizing annotations...
        </p>
      </div>

      <form
        class="record-notes__form"
        data-notes-form
      >
        <label>
          Operative

          <input
            type="text"
            name="author"
            placeholder="Your name"
            required
          />
        </label>

        <label>
          Annotation

          <textarea
            name="content"
            placeholder="Add field intelligence..."
            rows={4}
            required
          ></textarea>
        </label>

        <button type="submit">
          ADD ANNOTATION
        </button>

        <p
          class="record-notes__message"
          data-notes-message
        ></p>
      </form>
    </section>
  )
}

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
`

export default (() =>
  RecordNotes) satisfies QuartzComponentConstructor