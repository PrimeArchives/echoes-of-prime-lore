import { h } from "preact"
import type { Element, Node, Root } from "hast"

import {
  QuartzComponent,
  QuartzComponentProps,
} from "../types"

import factionRecordStyle from "./factionRecord.scss"

type FactionTheme = {
  primary?: string
  secondary?: string
  accent?: string
}

type FactionFrontmatter = {
  title?: string
  id?: string
  type?: string
  classification?: string
  scope?: string
  description?: string
  image?: string
  reputationSystem?: boolean
  theme?: FactionTheme
  published?: boolean
}

function text(value: unknown) {
  return typeof value === "string" ? value : undefined
}

function nodeText(node: Node): string {
  if (node.type === "text") {
    return node.value
  }

  if (node.type === "element" || node.type === "root") {
    return node.children.map((child) => nodeText(child)).join("")
  }

  return ""
}

function renderHast(node: Node, title: string, isRootChild = false): any {
  if (node.type === "root") {
    return (node as Root).children.map((child) =>
      renderHast(child, title, true),
    )
  }

  if (node.type === "text") {
    return node.value
  }

  if (node.type === "element") {
    const element = node as Element

    // The custom dossier header already renders the page title.
    if (
      isRootChild &&
      element.tagName === "h1" &&
      nodeText(element).trim().toLocaleLowerCase() ===
        title.trim().toLocaleLowerCase()
    ) {
      return null
    }

    const properties: Record<string, any> = {
      ...(element.properties ?? {}),
    }

    if (properties.className) {
      properties.class = Array.isArray(properties.className)
        ? properties.className.join(" ")
        : properties.className

      delete properties.className
    }

    return h(
      element.tagName,
      properties,
      element.children.map((child) => renderHast(child, title)),
    )
  }

  return null
}

const FactionRecord: QuartzComponent = ({
  fileData,
  tree,
}: QuartzComponentProps) => {
  const fm = (fileData.frontmatter ?? {}) as FactionFrontmatter

  const title = text(fm.title) ?? "Unknown Faction"
  const id = text(fm.id) ?? "FAC-UNINDEXED"
  const classification = text(fm.classification) ?? "Faction"
  const scope = text(fm.scope) ?? "Unknown"
  const description =
    text(fm.description) ??
    "No public faction summary is currently available."
  const image = text(fm.image)

  const primary = text(fm.theme?.primary) ?? "#8f9699"
  const secondary = text(fm.theme?.secondary) ?? "#403b37"
  const accent = text(fm.theme?.accent) ?? "#b88752"

  const themeStyle = {
    "--faction-primary": primary,
    "--faction-secondary": secondary,
    "--faction-accent": accent,
  } as Record<string, string>

  return (
    <main class="faction-record" style={themeStyle}>
      <header class="faction-record__hero">
        <div class="faction-record__topline">
          <a
            href="/04-factions/"
            class="faction-record__back internal"
            data-no-popover="true"
          >
            ← FACTION INTELLIGENCE
          </a>

          <strong>{id}</strong>
        </div>

        <div class="faction-record__hero-grid">
          <div class="faction-record__insignia">
            {image ? (
              <img
                src={image}
                alt={`${title} insignia`}
              />
            ) : (
              <span>NO INSIGNIA</span>
            )}
          </div>

          <div class="faction-record__identity">
            <span class="faction-record__eyebrow">
              {classification}
            </span>

            <h1>{title}</h1>

            <div class="faction-record__rule"></div>

            <p>{description}</p>

            <div class="faction-record__facts">
              <div>
                <span>OPERATING AREA</span>
                <strong>{scope}</strong>
              </div>

              <div>
                <span>REPUTATION</span>
                <strong>
                  {fm.reputationSystem ? "TRACKED" : "NOT TRACKED"}
                </strong>
              </div>

              <div>
                <span>ARCHIVE STATUS</span>
                <strong>PUBLIC DOSSIER</strong>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section class="faction-record__document">
        <div class="faction-record__document-top">
          <span>INTELLIGENCE FILE</span>
          <strong>{id}</strong>
        </div>

        <div class="faction-record__content">
          {renderHast(tree as Root, title)}
        </div>
      </section>

      <footer class="faction-record__footer">
        <span>PRIME ARCHIVES // FACTION INTELLIGENCE</span>
        <strong>VERIFIED RECORD</strong>
      </footer>
    </main>
  )
}

FactionRecord.css = factionRecordStyle

export default FactionRecord