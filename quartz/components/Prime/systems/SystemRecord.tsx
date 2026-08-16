import { h } from "preact"
import type { Element, Node, Root } from "hast"

import {
  QuartzComponent,
  QuartzComponentProps,
} from "../types"

import systemRecordStyle from "./systemRecord.scss"

type SystemFrontmatter = {
  title?: string
  id?: string
  type?: string
  category?: string
  scope?: string
  description?: string
  status?: string
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

const SystemRecord: QuartzComponent = ({
  fileData,
  tree,
}: QuartzComponentProps) => {
  const fm = (fileData.frontmatter ?? {}) as SystemFrontmatter

  const title = text(fm.title) ?? "Unknown System"
  const id = text(fm.id) ?? "SYS-UNINDEXED"
  const category = text(fm.category) ?? "System"
  const scope = text(fm.scope) ?? "Unspecified"
  const description =
    text(fm.description) ??
    "No public system summary is currently available."
  const status = text(fm.status) ?? "Operational"

  return (
    <main class="system-record">
      <header class="system-record__header">
        <div class="system-record__topline">
          <a
            href="/07-systems/"
            class="system-record__back internal"
            data-no-popover="true"
          >
            ← SYSTEMS DATABASE
          </a>

          <strong>{id}</strong>
        </div>

        <div class="system-record__classification">
          SYSTEM PROTOCOL // {category.toUpperCase()}
        </div>

        <h1>{title}</h1>

        <p class="system-record__summary">
          {description}
        </p>

        <div class="system-record__meta">
          <div>
            <span>STATUS</span>
            <strong class="system-record__status">
              <i aria-hidden="true"></i>
              {status}
            </strong>
          </div>

          <div>
            <span>CLASSIFICATION</span>
            <strong>{category}</strong>
          </div>

          <div>
            <span>SCOPE</span>
            <strong>{scope}</strong>
          </div>
        </div>
      </header>

      <section class="system-record__body">
        <div class="system-record__body-label">
          <span>OPERATIONAL DOCUMENT</span>
          <strong>{id}</strong>
        </div>

        <div class="system-record__content">
          {renderHast(tree as Root, title)}
        </div>
      </section>

      <footer class="system-record__footer">
        <span>PRIME ARCHIVES // SYSTEMS DATABASE</span>
        <strong>PUBLIC PROTOCOL AVAILABLE</strong>
      </footer>
    </main>
  )
}

SystemRecord.css = systemRecordStyle

export default SystemRecord