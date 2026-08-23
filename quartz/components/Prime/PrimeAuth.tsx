import { h } from "preact"

const authClientScript = String.raw`
(() => {
  const STATE_KEY = "__primeAuthPanelState"

  if (!window[STATE_KEY]) {
    window[STATE_KEY] = {
      installed: false,
      user: null,
      loading: false,
    }
  }

  const state = window[STATE_KEY]

  const roots = () =>
    Array.from(
      document.querySelectorAll(
        "[data-prime-auth]",
      ),
    ).filter(
      (root) => root instanceof HTMLElement,
    )

  const setMessage = (root, text, kind = "") => {
    const message = root.querySelector(
      "[data-prime-auth-message]",
    )

    if (!(message instanceof HTMLElement)) {
      return
    }

    message.textContent = text
    message.dataset.kind = kind
  }

  const applyState = () => {
    roots().forEach((root) => {
      const guest = root.querySelector(
        "[data-prime-auth-guest]",
      )
      const account = root.querySelector(
        "[data-prime-auth-account]",
      )
      const name = root.querySelector(
        "[data-prime-auth-name]",
      )
      const role = root.querySelector(
        "[data-prime-auth-role]",
      )

      const authenticated =
        Boolean(state.user)

      const operative =
        authenticated
          ? String(
              state.user.display_name ??
                state.user.username ??
                "OPERATIVE",
            ).toUpperCase()
          : "UNAUTHENTICATED"

      const clearance =
        authenticated
          ? state.user.role === "architect"
            ? "ARCHITECT"
            : "FIELD OPERATIVE"
          : "PUBLIC"

      document
        .querySelectorAll(
          "[data-prime-operative]",
        )
        .forEach((element) => {
          if (
            element instanceof
            HTMLElement
          ) {
            element.textContent =
              operative
          }
        })

      document
        .querySelectorAll(
          "[data-prime-clearance]",
        )
        .forEach((element) => {
          if (
            element instanceof
            HTMLElement
          ) {
            element.textContent =
              clearance
          }
        })

      if (guest instanceof HTMLElement) {
        guest.hidden = authenticated
      }

      if (account instanceof HTMLElement) {
        account.hidden = !authenticated
      }

      if (
        name instanceof HTMLElement &&
        state.user
      ) {
        name.textContent =
          state.user.display_name ??
          state.user.username ??
          "Authenticated Operative"
      }

      if (
        role instanceof HTMLElement &&
        state.user
      ) {
        role.textContent =
          state.user.role === "architect"
            ? "ARCHITECT CLEARANCE"
            : "OPERATIVE AUTHENTICATED"
      }
    })
  }

  const refreshAuth = async () => {
    if (state.loading) return
    state.loading = true

    try {
      const response = await fetch(
        "/api/auth/me",
        {
          method: "GET",
          credentials: "same-origin",
        },
      )

      if (!response.ok) {
        throw new Error(
          "Unable to verify session",
        )
      }

      const data = await response.json()

      state.user =
        data?.authenticated === true
          ? data.user ?? null
          : null
    } catch (_) {
      state.user = null
    } finally {
      state.loading = false
      applyState()
    }
  }

  const closePanel = (root) => {
    const panel = root.querySelector(
      "[data-prime-auth-panel]",
    )

    if (panel instanceof HTMLElement) {
      panel.hidden = true
    }

    setMessage(root, "")
  }

  const openPanel = (root) => {
    const panel = root.querySelector(
      "[data-prime-auth-panel]",
    )

    if (!(panel instanceof HTMLElement)) {
      return
    }

    panel.hidden = false

    const username = panel.querySelector(
      'input[name="username"]',
    )

    if (username instanceof HTMLInputElement) {
      window.setTimeout(
        () => username.focus(),
        0,
      )
    }
  }

  if (!state.installed) {
    state.installed = true

    document.addEventListener(
      "click",
      async (event) => {
        const target =
          event.target instanceof Element
            ? event.target
            : null

        if (!target) return

        const root = target.closest(
          "[data-prime-auth]",
        )

        if (!(root instanceof HTMLElement)) {
          return
        }

        if (
          target.closest(
            "[data-prime-auth-open]",
          )
        ) {
          openPanel(root)
          return
        }

        if (
          target.closest(
            "[data-prime-auth-close]",
          )
        ) {
          closePanel(root)
          return
        }

        if (
          target.closest(
            "[data-prime-auth-logout]",
          )
        ) {
          setMessage(
            root,
            "TERMINATING SESSION...",
          )

          try {
            const response = await fetch(
              "/api/auth/logout",
              {
                method: "POST",
                credentials: "same-origin",
              },
            )

            if (!response.ok) {
              throw new Error(
                "Logout failed",
              )
            }

            state.user = null
            applyState()
            closePanel(root)

            document.dispatchEvent(
              new CustomEvent(
                "prime-auth-changed",
              ),
            )
          } catch (_) {
            setMessage(
              root,
              "SESSION TERMINATION FAILED",
              "error",
            )
          }
        }
      },
    )

    document.addEventListener(
      "submit",
      async (event) => {
        const form =
          event.target instanceof HTMLFormElement
            ? event.target
            : null

        if (
          !form ||
          !form.matches(
            "[data-prime-auth-form]",
          )
        ) {
          return
        }

        event.preventDefault()

        const root = form.closest(
          "[data-prime-auth]",
        )

        if (!(root instanceof HTMLElement)) {
          return
        }

        const formData =
          new FormData(form)

        const username =
          String(
            formData.get("username") ?? "",
          )
            .trim()
            .toLowerCase()

        const password =
          String(
            formData.get("password") ?? "",
          )

        if (!username || !password) {
          setMessage(
            root,
            "CREDENTIALS REQUIRED",
            "error",
          )
          return
        }

        const submit = form.querySelector(
          'button[type="submit"]',
        )

        if (submit instanceof HTMLButtonElement) {
          submit.disabled = true
        }

        setMessage(
          root,
          "AUTHENTICATING...",
        )

        try {
          const response = await fetch(
            "/api/auth/login",
            {
              method: "POST",
              credentials: "same-origin",
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

          const data = await response.json()

          if (!response.ok) {
            throw new Error(
              data?.error ??
                "Authentication failed",
            )
          }

          state.user =
            data?.user ?? null

          form.reset()
          applyState()
          closePanel(root)

          document.dispatchEvent(
            new CustomEvent(
              "prime-auth-changed",
            ),
          )
        } catch (error) {
          setMessage(
            root,
            error instanceof Error
              ? error.message.toUpperCase()
              : "AUTHENTICATION FAILED",
            "error",
          )
        } finally {
          if (
            submit instanceof
            HTMLButtonElement
          ) {
            submit.disabled = false
          }
        }
      },
    )

    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key !== "Escape") return

        roots().forEach((root) => {
          closePanel(root)
        })
      },
    )

    document.addEventListener(
      "nav",
      () => {
        window.setTimeout(
          refreshAuth,
          0,
        )
      },
    )

    document.addEventListener(
      "render",
      () => {
        window.setTimeout(
          refreshAuth,
          0,
        )
      },
    )
  }

  void refreshAuth()
})()
`

export default function PrimeAuth() {
  return (
    <div
      class="prime-auth"
      data-prime-auth
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .prime-auth {
              position: relative;
              display: flex;
              align-items: center;
              justify-content: flex-end;
              width: 100%;
              font-family: var(--codeFont);
            }

            .prime-auth [hidden] {
              display: none !important;
            }

            .prime-auth__guest,
            .prime-auth__account {
              display: flex;
              align-items: center;
              justify-content: flex-end;
              gap: 0.7rem;
            }

            .prime-auth__status {
              display: flex;
              min-width: 0;
              flex-direction: column;
              align-items: flex-end;
              gap: 0.12rem;
            }

            .prime-auth__eyebrow {
              color: #667784;
              font-size: 0.46rem;
              font-weight: 900;
              letter-spacing: 0.13em;
              text-transform: uppercase;
            }

            .prime-auth__status strong {
              overflow: hidden;
              max-width: 190px;
              color: #dceaf1;
              font-size: 0.66rem;
              letter-spacing: 0.06em;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .prime-auth__account
              .prime-auth__status strong {
              color: #8fe6ff;
            }

            .prime-auth__button {
              min-height: 34px;
              padding: 0.5rem 0.72rem;
              border: 1px solid rgba(100, 215, 255, 0.3);
              border-radius: 4px;
              background:
                linear-gradient(
                  180deg,
                  rgba(100, 215, 255, 0.09),
                  rgba(100, 215, 255, 0.025)
                );
              color: #a9eaff;
              font: inherit;
              font-size: 0.5rem;
              font-weight: 900;
              letter-spacing: 0.11em;
              text-transform: uppercase;
              cursor: pointer;
              transition:
                border-color 130ms ease,
                background 130ms ease,
                box-shadow 130ms ease;
            }

            .prime-auth__button:hover {
              border-color: rgba(100, 215, 255, 0.62);
              background: rgba(100, 215, 255, 0.12);
              box-shadow: 0 0 18px rgba(100, 215, 255, 0.08);
            }

            .prime-auth__button--logout {
              border-color: rgba(255, 255, 255, 0.12);
              background: rgba(255, 255, 255, 0.025);
              color: #80909c;
            }

            .prime-auth__panel {
              position: fixed;
              z-index: 10000;
              top: 50%;
              left: 50%;
              width: min(380px, calc(100vw - 2rem));
              max-height: calc(100vh - 2rem);
              overflow-y: auto;
              padding: 1.15rem;
              border: 1px solid rgba(100, 215, 255, 0.34);
              border-radius: 10px;
              background:
                radial-gradient(
                  circle at 20% 0%,
                  rgba(100, 215, 255, 0.09),
                  transparent 18rem
                ),
                rgba(5, 10, 16, 0.995);
              box-shadow:
                0 0 0 100vmax rgba(0, 4, 9, 0.74),
                0 30px 100px rgba(0, 0, 0, 0.72),
                0 0 40px rgba(100, 215, 255, 0.08),
                inset 0 0 30px rgba(100, 215, 255, 0.02);
              transform: translate(-50%, -50%);
            }

            .prime-auth__panel-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 1rem;
              padding-bottom: 0.75rem;
              border-bottom: 1px solid rgba(100, 215, 255, 0.12);
            }

            .prime-auth__panel-header div {
              display: flex;
              flex-direction: column;
              gap: 0.15rem;
            }

            .prime-auth__panel-header span {
              color: #64d7ff;
              font-size: 0.45rem;
              font-weight: 900;
              letter-spacing: 0.14em;
              text-transform: uppercase;
            }

            .prime-auth__panel-header strong {
              color: #eefaff;
              font-size: 0.8rem;
            }

            .prime-auth__close {
              border: 0;
              background: transparent;
              color: #758895;
              font: inherit;
              font-size: 1rem;
              cursor: pointer;
            }

            .prime-auth__form {
              display: grid;
              gap: 0.8rem;
              margin-top: 0.9rem;
            }

            .prime-auth__form label {
              display: grid;
              gap: 0.3rem;
              color: #758895;
              font-size: 0.45rem;
              font-weight: 900;
              letter-spacing: 0.12em;
              text-transform: uppercase;
            }

            .prime-auth__form input {
              width: 100%;
              min-height: 38px;
              box-sizing: border-box;
              padding: 0.55rem 0.65rem;
              border: 1px solid rgba(100, 215, 255, 0.18);
              border-radius: 4px;
              outline: none;
              background: rgba(0, 0, 0, 0.28);
              color: #e8f7ff;
              font: inherit;
              font-size: 0.68rem;
            }

            .prime-auth__form input:focus {
              border-color: rgba(100, 215, 255, 0.55);
              box-shadow: 0 0 0 2px rgba(100, 215, 255, 0.07);
            }

            .prime-auth__form
              .prime-auth__button {
              width: 100%;
              margin-top: 0.15rem;
            }

            .prime-auth__message {
              min-height: 1.1rem;
              margin: 0.65rem 0 0;
              color: #6f818d;
              font-size: 0.46rem;
              font-weight: 800;
              letter-spacing: 0.08em;
              text-transform: uppercase;
            }

            .prime-auth__message[data-kind="error"] {
              color: #ff7f91;
            }

            @media all and (max-width: 800px) {
              .prime-auth {
                width: 100%;
                justify-content: flex-start;
              }

              .prime-auth__guest,
              .prime-auth__account {
                width: 100%;
                justify-content: space-between;
              }

              .prime-auth__status {
                align-items: flex-start;
              }

              .prime-auth__panel {
                top: 50%;
                left: 50%;
                width: min(380px, calc(100vw - 1rem));
                transform: translate(-50%, -50%);
              }
            }
          `,
        }}
      />

      <script
        dangerouslySetInnerHTML={{
          __html: authClientScript,
        }}
      />

      <div
        class="prime-auth__guest"
        data-prime-auth-guest
      >
        <div class="prime-auth__status">
          <span class="prime-auth__eyebrow">
            OPERATIVE SESSION
          </span>
          <strong>
            NOT AUTHENTICATED
          </strong>
        </div>

        <button
          type="button"
          class="prime-auth__button"
          data-prime-auth-open
        >
          LOGIN
        </button>
      </div>

      <div
        class="prime-auth__account"
        data-prime-auth-account
        hidden
      >
        <div class="prime-auth__status">
          <span
            class="prime-auth__eyebrow"
            data-prime-auth-role
          >
            OPERATIVE AUTHENTICATED
          </span>

          <strong data-prime-auth-name>
            AUTHENTICATED OPERATIVE
          </strong>
        </div>

        <button
          type="button"
          class="prime-auth__button prime-auth__button--logout"
          data-prime-auth-logout
        >
          LOGOUT
        </button>
      </div>

      <div
        class="prime-auth__panel"
        data-prime-auth-panel
        hidden
      >
        <div class="prime-auth__panel-header">
          <div>
            <span>
              PRIME ACCESS CONTROL
            </span>
            <strong>
              Operative Authentication
            </strong>
          </div>

          <button
            type="button"
            class="prime-auth__close"
            data-prime-auth-close
            aria-label="Close login"
          >
            ×
          </button>
        </div>

        <form
          class="prime-auth__form"
          data-prime-auth-form
        >
          <label>
            Operative ID

            <input
              type="text"
              name="username"
              autocomplete="username"
              required
            />
          </label>

          <label>
            Access Key

            <input
              type="password"
              name="password"
              autocomplete="current-password"
              required
            />
          </label>

          <button
            type="submit"
            class="prime-auth__button"
          >
            AUTHENTICATE
          </button>
        </form>

        <p
          class="prime-auth__message"
          data-prime-auth-message
        ></p>
      </div>
    </div>
  )
}