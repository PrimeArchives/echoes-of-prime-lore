import { h } from "preact"
import type { Node, Root } from "hast"

import { QuartzPluginData } from "../../../plugins/vfile"

type UniverseProps = {
  allFiles?: QuartzPluginData[]
}

function value(input: unknown) {
  return typeof input === "string"
    ? input
    : undefined
}

function renderHast(node: Node): any {
  if (node.type === "root") {
    return (node as Root).children.map(
      (child) => renderHast(child),
    )
  }

  if (node.type === "text") {
    return node.value
  }

  if (node.type === "element") {
    const properties: Record<string, any> = {
      ...(node.properties ?? {}),
    }

    if (properties.className) {
      properties.class = Array.isArray(
        properties.className,
      )
        ? properties.className.join(" ")
        : properties.className

      delete properties.className
    }

    return h(
      node.tagName,
      properties,
      node.children.map(
        (child) => renderHast(child),
      ),
    )
  }

  return null
}

function classification(
  frontmatter: Record<string, unknown>,
) {
  return (
    value(frontmatter.category) ??
    value(frontmatter.recordType) ??
    value(frontmatter.classification) ??
    "Foundational Record"
  )
}

export default function Universe({
  allFiles = [],
}: UniverseProps = {}) {
  const records = allFiles
    .filter((file) => {
      const slug =
        (file.slug ?? "").toLowerCase()

      const fm =
        file.frontmatter ?? {}

      return (
        slug.startsWith("01-universe/") &&
        slug !== "01-universe/index" &&
        fm.published !== false
      )
    })
    .sort((a, b) => {
      const aId =
        value(a.frontmatter?.id) ?? ""

      const bId =
        value(b.frontmatter?.id) ?? ""

      return aId.localeCompare(
        bId,
        undefined,
        {
          numeric: true,
          sensitivity: "base",
        },
      )
    })

  const selectionCss = records
    .map(
      (_, index) => `
        #prime-universe-record-${index}:checked
          ~ .prime-universe__workspace
          .prime-universe-record[data-record-index="${index}"] {
          display: block;
        }

        #prime-universe-record-${index}:checked
          ~ .prime-universe__workspace
          label[data-record-index="${index}"] {
          border-color: rgba(100, 215, 255, 0.42);
          background:
            linear-gradient(
              90deg,
              rgba(100, 215, 255, 0.105),
              rgba(100, 215, 255, 0.025)
            );
          box-shadow:
            inset 3px 0 0 #64d7ff;
        }

        #prime-universe-record-${index}:checked
          ~ .prime-universe__workspace
          label[data-record-index="${index}"]
          .prime-universe-record-link__node {
          background: #64d7ff;
          box-shadow:
            0 0 8px #64d7ff,
            0 0 18px rgba(100, 215, 255, 0.45);
        }
      `,
    )
    .join("\n")

  return (
    <section class="prime-universe">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            ${selectionCss}

            .prime-universe {
              --universe-cyan: #64d7ff;
              --universe-soft: #8fe6ff;
              width: min(1480px, calc(100% - 2rem));
              margin: 1.2rem auto 2rem;
              color: #d8e2e9;
            }

            .prime-universe__radio {
              position: absolute;
              width: 1px;
              height: 1px;
              opacity: 0;
              pointer-events: none;
            }

            .prime-universe__hero {
              position: relative;
              display: grid;
              grid-template-columns: minmax(0, 1.2fr) minmax(310px, 0.8fr);
              gap: clamp(1.5rem, 4vw, 4rem);
              overflow: hidden;
              min-height: 310px;
              padding: clamp(1.4rem, 3vw, 2.35rem);
              border: 1px solid rgba(100, 215, 255, 0.2);
              border-radius: 16px 16px 0 0;
              background:
                radial-gradient(
                  circle at 78% 45%,
                  rgba(100, 215, 255, 0.08),
                  transparent 18rem
                ),
                linear-gradient(
                  135deg,
                  rgba(16, 29, 40, 0.98),
                  rgba(6, 11, 17, 0.99)
                );
            }

            .prime-universe__hero::before {
              position: absolute;
              inset: 0;
              pointer-events: none;
              background:
                linear-gradient(
                  rgba(100, 215, 255, 0.025) 1px,
                  transparent 1px
                ),
                linear-gradient(
                  90deg,
                  rgba(100, 215, 255, 0.02) 1px,
                  transparent 1px
                );
              background-size: 54px 54px;
              mask-image:
                linear-gradient(
                  90deg,
                  transparent,
                  black 30%,
                  black
                );
              content: "";
            }

            .prime-universe__hero-copy {
              position: relative;
              z-index: 1;
              align-self: center;
            }

            .prime-universe__eyebrow,
            .prime-universe__system,
            .prime-universe__metric span,
            .prime-universe-record-link__id,
            .prime-universe-record__classification,
            .prime-universe-record__meta dt,
            .prime-universe__catalog-label {
              font-family: var(--codeFont);
              text-transform: uppercase;
              letter-spacing: 0.12em;
            }

            .prime-universe__eyebrow {
              margin: 0 0 0.55rem;
              color: var(--universe-cyan);
              font-size: 0.56rem;
              font-weight: 900;
            }

            .prime-universe__hero h1 {
              margin: 0;
              color: #f5fbff;
              font-size: clamp(3rem, 7vw, 6rem);
              line-height: 0.92;
              letter-spacing: -0.045em;
            }

            .prime-universe__system {
              display: inline-flex;
              margin-top: 1rem;
              padding: 0.28rem 0.5rem;
              border: 1px solid rgba(100, 215, 255, 0.2);
              border-radius: 3px;
              color: #8599a8;
              font-size: 0.47rem;
              font-weight: 800;
            }

            .prime-universe__description {
              max-width: 690px;
              margin: 1.35rem 0 0;
              color: #a6b5c0;
              font-size: 0.92rem;
              line-height: 1.75;
            }

            .prime-universe-orbit {
              position: relative;
              z-index: 1;
              display: grid;
              min-height: 255px;
              place-items: center;
              align-self: center;
            }

            .prime-universe-orbit__ring {
              position: absolute;
              width: min(290px, 72%);
              aspect-ratio: 1;
              border: 1px solid rgba(100, 215, 255, 0.21);
              border-radius: 50%;
              transform: rotate(-16deg) scaleY(0.52);
            }

            .prime-universe-orbit__ring--two {
              width: min(220px, 58%);
              border-style: dashed;
              border-color: rgba(100, 215, 255, 0.14);
              transform: rotate(31deg) scaleY(0.68);
            }

            .prime-universe-orbit__ring--three {
              width: min(145px, 42%);
              border-color: rgba(100, 215, 255, 0.09);
              transform: rotate(68deg) scaleY(0.82);
            }

            .prime-universe-orbit__world {
              position: relative;
              display: grid;
              width: 88px;
              height: 88px;
              place-items: center;
              border: 1px solid rgba(143, 230, 255, 0.5);
              border-radius: 50%;
              background:
                radial-gradient(
                  circle at 35% 30%,
                  rgba(143, 230, 255, 0.24),
                  rgba(100, 215, 255, 0.06) 44%,
                  rgba(4, 10, 16, 0.95) 70%
                );
              box-shadow:
                0 0 34px rgba(100, 215, 255, 0.12),
                inset 0 0 28px rgba(100, 215, 255, 0.08);
            }

            .prime-universe-orbit__world::after {
              width: 7px;
              height: 7px;
              border-radius: 50%;
              background: #bdf2ff;
              box-shadow: 0 0 16px #64d7ff;
              content: "";
            }

            .prime-universe-orbit__label {
              position: absolute;
              right: 3%;
              bottom: 7%;
              color: #6f8391;
              font-family: var(--codeFont);
              font-size: 0.44rem;
              font-weight: 800;
              letter-spacing: 0.1em;
              text-align: right;
              text-transform: uppercase;
            }

            .prime-universe__metrics {
              display: grid;
              grid-template-columns: repeat(3, minmax(0, 1fr));
              border: 1px solid rgba(100, 215, 255, 0.15);
              border-top: 0;
              background: #081018;
            }

            .prime-universe__metric {
              min-width: 0;
              padding: 0.9rem 1.1rem;
              border-right: 1px solid rgba(100, 215, 255, 0.1);
            }

            .prime-universe__metric:last-child {
              border-right: 0;
            }

            .prime-universe__metric span {
              display: block;
              margin-bottom: 0.2rem;
              color: #667b8a;
              font-size: 0.42rem;
              font-weight: 900;
            }

            .prime-universe__metric strong {
              color: #dceaf2;
              font-family: var(--codeFont);
              font-size: 0.72rem;
              letter-spacing: 0.04em;
            }

            .prime-universe__workspace {
              display: grid;
              grid-template-columns: minmax(280px, 0.72fr) minmax(0, 1.6fr);
              min-height: 520px;
              border: 1px solid rgba(100, 215, 255, 0.16);
              border-top: 0;
              border-radius: 0 0 16px 16px;
              background: #070c12;
            }

            .prime-universe__catalog {
              border-right: 1px solid rgba(100, 215, 255, 0.12);
              background:
                linear-gradient(
                  180deg,
                  rgba(15, 27, 37, 0.97),
                  rgba(8, 13, 19, 0.99)
                );
            }

            .prime-universe__catalog-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 1rem;
              padding: 0.85rem 1rem;
              border-bottom: 1px solid rgba(100, 215, 255, 0.11);
            }

            .prime-universe__catalog-label {
              color: var(--universe-cyan);
              font-size: 0.48rem;
              font-weight: 900;
            }

            .prime-universe__catalog-count {
              color: #758895;
              font-family: var(--codeFont);
              font-size: 0.48rem;
            }

            .prime-universe-record-link {
              position: relative;
              display: grid;
              grid-template-columns: 12px minmax(0, 1fr);
              gap: 0.8rem;
              padding: 1rem 1rem 1rem 1.1rem;
              border-bottom: 1px solid rgba(100, 215, 255, 0.075);
              cursor: pointer;
              transition:
                background 140ms ease,
                border-color 140ms ease,
                box-shadow 140ms ease;
            }

            .prime-universe-record-link:hover {
              background: rgba(100, 215, 255, 0.045);
            }

            .prime-universe-record-link__node {
              width: 7px;
              height: 7px;
              margin-top: 0.27rem;
              border-radius: 50%;
              background: #4f6574;
              transition:
                background 140ms ease,
                box-shadow 140ms ease;
            }

            .prime-universe-record-link__id {
              color: #748895;
              font-size: 0.42rem;
              font-weight: 900;
            }

            .prime-universe-record-link strong {
              display: block;
              margin-top: 0.25rem;
              color: #dce6ec;
              font-size: 0.84rem;
            }

            .prime-universe-record-link p {
              margin: 0.32rem 0 0 !important;
              color: #7d8e9b;
              font-family: var(--codeFont);
              font-size: 0.45rem;
              letter-spacing: 0.08em;
              text-transform: uppercase;
            }

            .prime-universe__reader {
              min-width: 0;
              background:
                radial-gradient(
                  circle at 75% 5%,
                  rgba(100, 215, 255, 0.045),
                  transparent 24rem
                ),
                #080d13;
            }

            .prime-universe-record {
              display: none;
              box-sizing: border-box;
              padding:
                clamp(1.5rem, 3vw, 2.6rem)
                clamp(1.5rem, 3.5vw, 3rem) !important;
            }

            .prime-universe-record__classification {
              color: var(--universe-cyan);
              font-size: 0.48rem;
              font-weight: 900;
            }

            .prime-universe-record h2 {
              max-width: 900px;
              margin: 0.4rem 0 1.2rem;
              color: #f4f9fc;
              font-size: clamp(2rem, 4vw, 3.8rem);
              line-height: 1;
              letter-spacing: -0.035em;
            }

            .prime-universe-record__meta {
              display: grid;
              grid-template-columns: repeat(3, minmax(0, 1fr));
              gap: 0;
              margin: 0 0 1.5rem;
              border-top: 1px solid rgba(100, 215, 255, 0.12);
              border-bottom: 1px solid rgba(100, 215, 255, 0.12);
            }

            .prime-universe-record__meta > div {
              padding: 0.8rem 0.85rem 0.8rem 0;
            }

            .prime-universe-record__meta dt {
              margin-bottom: 0.18rem;
              color: #667b89;
              font-size: 0.4rem;
              font-weight: 900;
            }

            .prime-universe-record__meta dd {
              margin: 0;
              color: #c9d6de;
              font-family: var(--codeFont);
              font-size: 0.58rem;
            }

            .prime-universe-record__body {
              max-width: 980px;
              padding-top: 0.35rem;
              color: #c6d1d8;
              font-size: 0.9rem;
              line-height: 1.8;
            }

            .prime-universe-record__body > :first-child {
              margin-top: 0 !important;
            }

            .prime-universe-record__body h1 {
              display: none;
            }

            .prime-universe-record__body h2,
            .prime-universe-record__body h3 {
              margin-top: 1.8rem;
              color: #eef7fb;
            }

            .prime-universe-record__body a {
              color: var(--universe-soft);
            }

            .prime-universe-record__footer {
              display: flex;
              justify-content: space-between;
              gap: 1rem;
              margin-top: 2.4rem;
              padding-top: 0.8rem;
              border-top: 1px dashed rgba(100, 215, 255, 0.15);
              color: #667b89;
              font-family: var(--codeFont);
              font-size: 0.44rem;
              font-weight: 800;
              letter-spacing: 0.1em;
              text-transform: uppercase;
            }

            .prime-universe__empty {
              display: grid;
              min-height: 420px;
              place-items: center;
              padding: 2rem;
              color: #708391;
              font-family: var(--codeFont);
              font-size: 0.62rem;
              letter-spacing: 0.11em;
              text-align: center;
              text-transform: uppercase;
            }

            @media all and (max-width: 900px) {
              .prime-universe__hero {
                grid-template-columns: 1fr;
              }

              .prime-universe-orbit {
                min-height: 190px;
              }

              .prime-universe__workspace {
                grid-template-columns: 1fr;
              }

              .prime-universe__catalog {
                max-height: 250px;
                overflow-y: auto;
                border-right: 0;
                border-bottom: 1px solid rgba(100, 215, 255, 0.12);
              }
            }

            @media all and (max-width: 620px) {
              .prime-universe {
                width: calc(100% - 1rem);
              }

              .prime-universe__metrics,
              .prime-universe-record__meta {
                grid-template-columns: 1fr;
              }

              .prime-universe__metric {
                border-right: 0;
                border-bottom: 1px solid rgba(100, 215, 255, 0.1);
              }

              .prime-universe__metric:last-child {
                border-bottom: 0;
              }
            }
          `,
        }}
      />

      {records.map((_, index) => (
        <input
          id={`prime-universe-record-${index}`}
          class="prime-universe__radio"
          type="radio"
          name="prime-universe-selection"
          checked={index === 0}
          aria-hidden="true"
        />
      ))}

      <header class="prime-universe__hero">
        <div class="prime-universe__hero-copy">
          <p class="prime-universe__eyebrow">
            UNIVERSE DATABASE
          </p>

          <h1>
            Known Reality
          </h1>

          <span class="prime-universe__system">
            PRIME CONTINUUM // ACTIVE INDEX
          </span>

          <p class="prime-universe__description">
            Catalogued worlds, histories and phenomena
            within the boundaries of recorded existence.
            Records expand as Prime Archives acquires
            verified knowledge.
          </p>
        </div>

        <div
          class="prime-universe-orbit"
          aria-hidden="true"
        >
          <span class="prime-universe-orbit__ring"></span>
          <span class="prime-universe-orbit__ring prime-universe-orbit__ring--two"></span>
          <span class="prime-universe-orbit__ring prime-universe-orbit__ring--three"></span>

          <span class="prime-universe-orbit__world"></span>

          <span class="prime-universe-orbit__label">
            CARTOGRAPHIC MODEL
            <br />
            SCALE // UNRESOLVED
          </span>
        </div>
      </header>

      <div class="prime-universe__metrics">
        <div class="prime-universe__metric">
          <span>
            Catalogued Records
          </span>

          <strong>
            {String(records.length).padStart(2, "0")}
          </strong>
        </div>

        <div class="prime-universe__metric">
          <span>
            Reality Index
          </span>

          <strong>
            PRIME CONTINUUM
          </strong>
        </div>

        <div class="prime-universe__metric">
          <span>
            Database Link
          </span>

          <strong>
            STABLE
          </strong>
        </div>
      </div>

      {records.length === 0 ? (
        <div class="prime-universe__empty">
          No catalogued universe records available.
        </div>
      ) : (
        <div class="prime-universe__workspace">
          <aside class="prime-universe__catalog">
            <div class="prime-universe__catalog-header">
              <span class="prime-universe__catalog-label">
                CATALOGUED RECORDS
              </span>

              <span class="prime-universe__catalog-count">
                {String(records.length).padStart(2, "0")}
              </span>
            </div>

            {records.map((record, index) => {
              const fm =
                record.frontmatter ?? {}

              const id =
                value(fm.id) ??
                "UNI-???"

              const title =
                value(fm.title) ??
                "Untitled Record"

              return (
                <label
                  for={`prime-universe-record-${index}`}
                  class="prime-universe-record-link"
                  data-record-index={index}
                >
                  <span class="prime-universe-record-link__node"></span>

                  <span>
                    <span class="prime-universe-record-link__id">
                      {id}
                    </span>

                    <strong>
                      {title}
                    </strong>

                    <p>
                      {classification(fm)}
                    </p>
                  </span>
                </label>
              )
            })}
          </aside>

          <main class="prime-universe__reader">
            {records.map((record, index) => {
              const fm =
                record.frontmatter ?? {}

              const id =
                value(fm.id) ??
                "UNI-???"

              const title =
                value(fm.title) ??
                "Untitled Record"

              const status =
                value(fm.status) ??
                "Public"

              const recordClass =
                classification(fm)

              return (
                <article
                  class="prime-universe-record"
                  data-record-index={index}
                >
                  <span class="prime-universe-record__classification">
                    UNIVERSE DATABASE // {recordClass}
                  </span>

                  <h2>
                    {title}
                  </h2>

                  <dl class="prime-universe-record__meta">
                    <div>
                      <dt>
                        RECORD
                      </dt>

                      <dd>
                        {id}
                      </dd>
                    </div>

                    <div>
                      <dt>
                        ACCESS
                      </dt>

                      <dd>
                        {status.toUpperCase()}
                      </dd>
                    </div>

                    <div>
                      <dt>
                        INDEX
                      </dt>

                      <dd>
                        KNOWN REALITY
                      </dd>
                    </div>
                  </dl>

                  <div class="prime-universe-record__body">
                    {record.htmlAst ? (
                      renderHast(record.htmlAst)
                    ) : (
                      <p>
                        RECORD BODY UNAVAILABLE
                      </p>
                    )}
                  </div>

                  <footer class="prime-universe-record__footer">
                    <span>
                      PRIME ARCHIVES // KNOWN REALITY
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
      )}
    </section>
  )
}