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
            class: "record-notes__identity",
            "data-notes-identity": true,
            children: "Checking operative credentials..."
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            class: "record-notes__list",
            "data-notes-list": true,
            children: /* @__PURE__ */ jsx("p", { class: "record-notes__loading", children: "Synchronizing annotations..." })
          }
        ),
        /* @__PURE__ */ jsxs(
          "div",
          {
            class: "record-notes__auth",
            "data-notes-auth": true,
            hidden: true,
            children: [
              /* @__PURE__ */ jsxs(
                "form",
                {
                  class: "record-notes__login",
                  "data-notes-login": true,
                  children: [
                    /* @__PURE__ */ jsxs("label", { children: [
                      "Operative ID",
                      /* @__PURE__ */ jsx(
                        "input",
                        {
                          type: "text",
                          name: "username",
                          placeholder: "Username",
                          autocomplete: "username",
                          required: true
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxs("label", { children: [
                      "Access Key",
                      /* @__PURE__ */ jsx(
                        "input",
                        {
                          type: "password",
                          name: "password",
                          placeholder: "Password",
                          autocomplete: "current-password",
                          required: true
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsx("button", { type: "submit", children: "AUTHENTICATE" })
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                "p",
                {
                  class: "record-notes__message",
                  "data-login-message": true
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "form",
          {
            class: "record-notes__form",
            "data-notes-form": true,
            hidden: true,
            children: [
              /* @__PURE__ */ jsxs("label", { class: "record-notes__annotation-label", children: [
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
RecordNotes.afterDOMLoaded = String.raw`
(() => {
  const setupRecordNotes = () => {
    document.querySelectorAll(".record-notes").forEach((root) => {
      if (!(root instanceof HTMLElement)) return
      if (root.dataset.notesReady === "true") return

      const recordId = root.dataset.recordId

      const list =
        root.querySelector("[data-notes-list]")

      const count =
        root.querySelector("[data-notes-count]")

      const identity =
        root.querySelector("[data-notes-identity]")

      const authBox =
        root.querySelector("[data-notes-auth]")

      const loginForm =
        root.querySelector("[data-notes-login]")

      const loginMessage =
        root.querySelector("[data-login-message]")

      const noteForm =
        root.querySelector("[data-notes-form]")

      const noteMessage =
        root.querySelector("[data-notes-message]")

      if (
        !recordId ||
        !(list instanceof HTMLElement) ||
        !(count instanceof HTMLElement) ||
        !(identity instanceof HTMLElement) ||
        !(authBox instanceof HTMLElement) ||
        !(loginForm instanceof HTMLFormElement) ||
        !(noteForm instanceof HTMLFormElement)
      ) {
        return
      }

      root.dataset.notesReady = "true"

      let currentUser = null

      const setMessage = (element, text) => {
        if (element instanceof HTMLElement) {
          element.textContent = text
        }
      }

      const renderIdentity = () => {
        identity.innerHTML = ""

        if (!currentUser) {
          const status = document.createElement("span")
          status.textContent = "UNAUTHENTICATED"

          identity.append(status)

          authBox.hidden = false
          noteForm.hidden = true
          return
        }

        const operative = document.createElement("div")
        operative.className =
          "record-notes__operative"

        const status = document.createElement("span")
        status.textContent =
          currentUser.role === "architect"
            ? "ARCHITECT ACCESS"
            : "OPERATIVE AUTHENTICATED"

        const name = document.createElement("strong")
        name.textContent = currentUser.display_name

        operative.append(status, name)

        const logout = document.createElement("button")
        logout.type = "button"
        logout.className =
          "record-notes__logout"
        logout.textContent = "LOG OUT"

        logout.addEventListener(
          "click",
          async () => {
            try {
              await fetch("/api/auth/logout", {
                method: "POST",
              })
            } catch (_) {}

            currentUser = null

            setMessage(noteMessage, "")
            setMessage(loginMessage, "")

            renderIdentity()
            await loadNotes()
          },
        )

        identity.append(operative, logout)

        authBox.hidden = true
        noteForm.hidden = false
      }

      const checkSession = async () => {
        try {
          const response =
            await fetch("/api/auth/me")

          if (!response.ok) {
            throw new Error(
              "Unable to check session",
            )
          }

          const data = await response.json()

          currentUser =
            data &&
            data.authenticated === true &&
            data.user
              ? data.user
              : null
        } catch (_) {
          currentUser = null
        }

        renderIdentity()
      }

      const loadNotes = async () => {
        try {
          const response = await fetch(
            "/api/notes?record_id=" +
              encodeURIComponent(recordId),
          )

          if (!response.ok) {
            throw new Error(
              "Unable to load annotations",
            )
          }

          const notes = await response.json()

          if (!Array.isArray(notes)) {
            throw new Error(
              "Invalid notes response",
            )
          }

          count.textContent =
            String(notes.length).padStart(2, "0") +
            (
              notes.length === 1
                ? " NOTE"
                : " NOTES"
            )

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

            meta.className =
              "record-note__meta"

            const metaLeft =
              document.createElement("div")

            metaLeft.className =
              "record-note__author"

            const author =
              document.createElement("strong")

            author.textContent =
              typeof note.author === "string"
                ? note.author
                : "Unknown"

            metaLeft.append(author)

            if (
              note.author_role === "architect"
            ) {
              const badge =
                document.createElement("span")

              badge.className =
                "record-note__role"

              badge.textContent = "ARCHITECT"

              metaLeft.append(badge)
            }

            const metaRight =
              document.createElement("div")

            metaRight.className =
              "record-note__actions"

            const date =
              document.createElement("time")

            if (
              typeof note.created_at ===
              "string"
            ) {
              const rawDate =
                note.created_at.includes("T")
                  ? note.created_at
                  : note.created_at.replace(
                      " ",
                      "T",
                    ) + "Z"

              const parsed =
                new Date(rawDate)

              date.textContent =
                Number.isNaN(
                  parsed.getTime(),
                )
                  ? note.created_at
                  : parsed.toLocaleString()
            }

            metaRight.append(date)

            if (note.can_delete === true) {
              const deleteButton =
                document.createElement("button")

              deleteButton.type = "button"
              deleteButton.className =
                "record-note__delete"

              deleteButton.textContent =
                "DELETE"

              deleteButton.addEventListener(
                "click",
                async () => {
                  const confirmed =
                    window.confirm(
                      "Delete this annotation?",
                    )

                  if (!confirmed) return

                  deleteButton.disabled = true

                  try {
                    const response =
                      await fetch(
                        "/api/notes/" +
                          encodeURIComponent(
                            String(note.id),
                          ),
                        {
                          method: "DELETE",
                        },
                      )

                    if (!response.ok) {
                      throw new Error(
                        "Delete failed",
                      )
                    }

                    await loadNotes()
                  } catch (_) {
                    deleteButton.disabled =
                      false

                    setMessage(
                      noteMessage,
                      "Unable to delete annotation.",
                    )
                  }
                },
              )

              metaRight.append(
                deleteButton,
              )
            }

            const content =
              document.createElement("p")

            content.textContent =
              typeof note.content === "string"
                ? note.content
                : ""

            meta.append(
              metaLeft,
              metaRight,
            )

            article.append(
              meta,
              content,
            )

            list.append(article)
          })
        } catch (_) {
          list.innerHTML =
            '<p class="record-notes__error">Annotation sync unavailable.</p>'
        }
      }

      loginForm.addEventListener(
        "submit",
        async (event) => {
          event.preventDefault()

          const formData =
            new FormData(loginForm)

          const username =
            String(
              formData.get("username") ??
                "",
            ).trim()

          const password =
            String(
              formData.get("password") ??
                "",
            )

          if (!username || !password) {
            return
          }

          setMessage(
            loginMessage,
            "Authenticating...",
          )

          try {
            const response =
              await fetch(
                "/api/auth/login",
                {
                  method: "POST",
                  headers: {
                    "Content-Type":
                      "application/json",
                  },
                  body: JSON.stringify({
                    username,
                    password,
                  }),
                },
              )

            const data =
              await response.json()

            if (
              !response.ok ||
              !data.user
            ) {
              throw new Error(
                data.error ||
                  "Authentication failed",
              )
            }

            currentUser = data.user

            loginForm.reset()

            setMessage(
              loginMessage,
              "",
            )

            renderIdentity()
            await loadNotes()
          } catch (_) {
            setMessage(
              loginMessage,
              "Invalid operative ID or access key.",
            )
          }
        },
      )

      noteForm.addEventListener(
        "submit",
        async (event) => {
          event.preventDefault()

          if (!currentUser) {
            renderIdentity()
            return
          }

          const formData =
            new FormData(noteForm)

          const content =
            String(
              formData.get("content") ??
                "",
            ).trim()

          if (!content) return

          setMessage(
            noteMessage,
            "Transmitting annotation...",
          )

          try {
            const response =
              await fetch(
                "/api/notes",
                {
                  method: "POST",
                  headers: {
                    "Content-Type":
                      "application/json",
                  },
                  body: JSON.stringify({
                    record_id: recordId,
                    content,
                  }),
                },
              )

            if (response.status === 401) {
              currentUser = null
              renderIdentity()

              throw new Error(
                "Session expired",
              )
            }

            if (!response.ok) {
              throw new Error(
                "Unable to save annotation",
              )
            }

            noteForm.reset()

            setMessage(
              noteMessage,
              "Annotation recorded.",
            )

            await loadNotes()
          } catch (_) {
            setMessage(
              noteMessage,
              currentUser
                ? "Transmission failed."
                : "Session expired. Authenticate again.",
            )
          }
        },
      )

      const initialize = async () => {
        await checkSession()
        await loadNotes()
      }

      initialize()
    })
  }

  setupRecordNotes()

  document.addEventListener(
    "nav",
    () =>
      window.setTimeout(
        setupRecordNotes,
        0,
      ),
  )

  document.addEventListener(
    "render",
    () =>
      window.setTimeout(
        setupRecordNotes,
        0,
      ),
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
}

.record-notes__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid rgba(100, 215, 255, 0.16);
}

.record-notes__header h2 {
  margin: 0.15rem 0 0;
  font-size: 1.3rem;
}

.record-notes__eyebrow {
  display: block;
  color: var(--secondary);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.18em;
}

.record-notes__count {
  padding: 0.28rem 0.48rem;
  border: 1px solid rgba(100, 215, 255, 0.2);
  border-radius: 4px;
  color: var(--secondary);
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.record-notes__identity {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid rgba(100, 215, 255, 0.12);
  border-radius: 4px;
  background: rgba(100, 215, 255, 0.035);
  color: var(--gray);
  font-size: 0.7rem;
  letter-spacing: 0.08em;
}

.record-notes__operative {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.record-notes__operative strong {
  color: var(--secondary);
  font-size: 0.9rem;
  letter-spacing: 0.03em;
}

.record-notes__logout,
.record-note__delete {
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--lightgray);
  border-radius: 3px;
  background: transparent;
  color: var(--gray);
  cursor: pointer;
  font: inherit;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.record-note__delete:hover {
  border-color: var(--tertiary);
  color: var(--tertiary);
}

.record-notes__logout:hover {
  border-color: var(--secondary);
  color: var(--secondary);
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

.record-note__author,
.record-note__actions {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.record-note__author strong {
  color: var(--secondary);
}

.record-note__role {
  padding: 0.15rem 0.3rem;
  border: 1px solid rgba(100, 215, 255, 0.25);
  border-radius: 3px;
  color: var(--secondary);
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.record-note__actions time {
  color: var(--gray);
  font-size: 0.68rem;
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

.record-notes__auth,
.record-notes__form {
  padding-top: 1rem;
  border-top: 1px solid rgba(100, 215, 255, 0.14);
}

.record-notes__login {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  align-items: end;
  gap: 0.8rem;
}

.record-notes__form {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  gap: 0.8rem;
}

.record-notes__annotation-label {
  min-width: 0;
}

.record-notes__login label,
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

.record-notes__login input,
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
}

.record-notes__form textarea {
  min-height: 90px;
  resize: vertical;
}

.record-notes__login input:focus,
.record-notes__form textarea:focus {
  border-color: var(--secondary);
}

.record-notes__login button,
.record-notes__form > button {
  margin: 0;
  padding: 0.6rem 0.75rem;
  border: 1px solid rgba(100, 215, 255, 0.45);
  border-radius: 4px;
  background: rgba(100, 215, 255, 0.07);
  color: var(--secondary);
  cursor: pointer;
  font: inherit;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.record-notes__message {
  grid-column: 1 / -1;
  min-height: 1em;
  margin: 0.4rem 0 0;
  color: var(--gray);
  font-size: 0.72rem;
}

.record-notes [hidden] {
  display: none !important;
}

@media (max-width: 700px) {
  .record-notes__login,
  .record-notes__form {
    grid-template-columns: 1fr;
  }

  .record-note__meta {
    align-items: flex-start;
    flex-direction: column;
  }

  .record-note__actions {
    width: 100%;
    justify-content: space-between;
  }
}
`;
var RecordNotes_default = (() => RecordNotes);
export {
  RecordNotes_default as RecordNotes
};
