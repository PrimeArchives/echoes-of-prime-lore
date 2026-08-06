import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"

const NotFound: QuartzComponent = ({ cfg, ctx }: QuartzComponentProps) => {
  const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
  const baseDir = ctx.argv.serve ? "/" : url.pathname

  const rootPath = baseDir.endsWith("/") ? baseDir : `${baseDir}/`
  const archivesPath = `${rootPath}archives`

  return (
    <main class="prime-404">
      <div class="prime-404__panel">
        <p class="prime-404__eyebrow">Prime Archives System</p>

        <p class="prime-404__code">Error PA-404</p>

        <h1>Archive record not found</h1>

        <p class="prime-404__message">
          The requested record could not be located in the public archive.
        </p>

        <div class="prime-404__divider" />

        <p class="prime-404__label">Possible cause</p>

        <ul class="prime-404__causes">
          <li>The record has not yet been recovered.</li>
          <li>Your clearance level is insufficient.</li>
          <li>The archive was damaged or destroyed.</li>
          <li>A timeline divergence has been detected.</li>
        </ul>

        <div class="prime-404__actions">
          <a class="prime-404__button" href={archivesPath} data-no-popover="true">
            Return to Archives
          </a>

          <a class="prime-404__secondary" href={rootPath} data-no-popover="true">
            Return to landing page
          </a>
        </div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            if (typeof fetchData !== "undefined") {
              fetchData.then(function(index) {
                var basePath = document.body.dataset.basepath || "";

                if (basePath.length > 1 && basePath.endsWith("/")) {
                  basePath = basePath.slice(0, -1);
                }

                var pathname = window.location.pathname;
                var hasBasePrefix =
                  basePath.length > 1 && pathname.startsWith(basePath);

                if (hasBasePrefix) {
                  pathname = pathname.slice(basePath.length);
                }

                if (pathname.startsWith("/")) {
                  pathname = pathname.slice(1);
                }

                if (pathname.endsWith("/")) {
                  pathname = pathname.slice(0, -1);
                }

                if (pathname.endsWith(".html")) {
                  pathname = pathname.slice(0, -5);
                }

                if (pathname.endsWith("/index")) {
                  pathname = pathname.slice(0, -6);
                }

                var lowered = pathname.toLowerCase();

                if (lowered !== pathname && index[lowered] != null) {
                  var prefix = hasBasePrefix ? basePath : "";
                  var target =
                    prefix +
                    (prefix.endsWith("/") ? "" : "/") +
                    lowered;

                  window.location.replace(target);
                }
              });
            }
          `,
        }}
      />
    </main>
  )
}

NotFound.css = `
.prime-404 {
  position: relative;
  display: grid;
  min-height: 100vh;
  place-items: center;
  overflow: hidden;
  padding: 2rem;
  background:
    radial-gradient(
      circle at 75% 25%,
      rgba(100, 215, 255, 0.1),
      transparent 34%
    ),
    radial-gradient(
      circle at 20% 80%,
      rgba(139, 108, 255, 0.09),
      transparent 34%
    ),
    #070a11;
}

.prime-404::before {
  position: absolute;
  inset: 0;
  content: "";
  pointer-events: none;
  opacity: 0.22;
  background-image:
    linear-gradient(
      rgba(255, 255, 255, 0.025) 1px,
      transparent 1px
    );
  background-size: 100% 4px;
}

.prime-404__panel {
  position: relative;
  z-index: 1;
  width: min(100%, 780px);
  padding: clamp(2rem, 6vw, 4.5rem);
  border: 1px solid rgba(100, 215, 255, 0.2);
  border-radius: 20px;
  background: rgba(13, 18, 28, 0.88);
  box-shadow:
    0 35px 100px rgba(0, 0, 0, 0.5),
    0 0 50px rgba(100, 215, 255, 0.06);
  backdrop-filter: blur(16px);
}

.prime-404__eyebrow,
.prime-404__label {
  margin: 0;
  color: #64d7ff;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.prime-404__code {
  margin: 1.5rem 0 0.5rem;
  color: #8b6cff;
  font-family: var(--codeFont);
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.prime-404 h1 {
  max-width: 680px;
  margin: 0;
  color: #fff;
  font-size: clamp(3rem, 8vw, 6rem);
  line-height: 0.93;
  letter-spacing: -0.055em;
}

.prime-404__message {
  max-width: 620px;
  margin: 1.5rem 0 0;
  color: #bdc9d5;
  font-size: clamp(1.05rem, 2vw, 1.25rem);
  line-height: 1.6;
}

.prime-404__divider {
  width: 100%;
  height: 1px;
  margin: 2.25rem 0;
  background: linear-gradient(
    90deg,
    rgba(100, 215, 255, 0.5),
    rgba(100, 215, 255, 0)
  );
}

.prime-404__causes {
  display: grid;
  gap: 0.65rem;
  padding: 0;
  margin: 1rem 0 0;
  color: #99a8b7;
  list-style: none;
}

.prime-404__causes li::before {
  margin-right: 0.75rem;
  color: #64d7ff;
  content: "//";
  font-family: var(--codeFont);
}

.prime-404__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem 1.5rem;
  margin-top: 2.5rem;
}

.prime-404__button {
  display: inline-flex;
  min-height: 52px;
  align-items: center;
  padding: 0.8rem 1.4rem;
  border: 1px solid #64d7ff;
  border-radius: 9px;
  background: rgba(100, 215, 255, 0.13);
  color: #fff;
  font-weight: 700;
  text-decoration: none;
  transition:
    background 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

.prime-404__button::after {
  margin-left: 0.75rem;
  content: "→";
}

.prime-404__button:hover {
  transform: translateY(-2px);
  background: rgba(100, 215, 255, 0.23);
  box-shadow: 0 0 32px rgba(100, 215, 255, 0.22);
  text-shadow: none;
}

.prime-404__secondary {
  color: #99a8b7;
  font-weight: 600;
  text-decoration: none;
}

.prime-404__secondary:hover {
  color: #64d7ff;
  text-shadow: none;
}

@media all and (max-width: 600px) {
  .prime-404 {
    padding: 1rem;
  }

  .prime-404__panel {
    padding: 2rem 1.5rem;
    border-radius: 14px;
  }

  .prime-404__actions {
    align-items: stretch;
    flex-direction: column;
  }

  .prime-404__button,
  .prime-404__secondary {
    justify-content: center;
    text-align: center;
  }
}
`

export default (() => NotFound) satisfies QuartzComponentConstructor