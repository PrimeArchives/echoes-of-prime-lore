import fs from "node:fs"
import path from "node:path"

type BuildContext = {
  argv: {
    directory: string
  }
}

type ResolverIndex = Map<string, string>

let cachedIndex: ResolverIndex | null = null
let cachedContentDir = ""
let cacheBuiltAt = 0
const CACHE_TTL_MS = 500

function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase()
}

function stripOuterQuotes(value: string): string {
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim()
  }
  return trimmed
}

function stripYamlComment(value: string): string {
  let quote: '"' | "'" | null = null

  for (let i = 0; i < value.length; i += 1) {
    const char = value[i]

    if ((char === '"' || char === "'") && value[i - 1] !== "\\") {
      quote = quote === char ? null : quote === null ? char : quote
      continue
    }

    if (char === "#" && quote === null) {
      return value.slice(0, i).trimEnd()
    }
  }

  return value.trimEnd()
}

function parseInlineList(value: string): string[] {
  const trimmed = value.trim()
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) return []

  const inner = trimmed.slice(1, -1)
  const values: string[] = []
  let current = ""
  let quote: '"' | "'" | null = null

  for (let i = 0; i < inner.length; i += 1) {
    const char = inner[i]

    if ((char === '"' || char === "'") && inner[i - 1] !== "\\") {
      quote = quote === char ? null : quote === null ? char : quote
      current += char
      continue
    }

    if (char === "," && quote === null) {
      const parsed = stripOuterQuotes(stripYamlComment(current))
      if (parsed) values.push(parsed)
      current = ""
      continue
    }

    current += char
  }

  const parsed = stripOuterQuotes(stripYamlComment(current))
  if (parsed) values.push(parsed)

  return values
}

function extractFrontmatter(source: string): string | null {
  const lines = source.replace(/^\uFEFF/, "").split(/\r?\n/)
  if (lines[0]?.trim() !== "---") return null

  const endIndex = lines.findIndex(
    (line, index) => index > 0 && line.trim() === "---",
  )
  if (endIndex < 0) return null

  return lines.slice(1, endIndex).join("\n")
}

function parseFrontmatterNames(frontmatter: string): {
  title?: string
  aliases: string[]
} {
  const lines = frontmatter.split(/\r?\n/)
  let title: string | undefined
  const aliases: string[] = []

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]

    const titleMatch = line.match(/^\s*title\s*:\s*(.*?)\s*$/i)
    if (titleMatch) {
      const parsed = stripOuterQuotes(stripYamlComment(titleMatch[1]))
      if (parsed) title = parsed
      continue
    }

    const aliasesMatch = line.match(/^\s*(aliases|alias)\s*:\s*(.*?)\s*$/i)
    if (!aliasesMatch) continue

    const rawValue = stripYamlComment(aliasesMatch[2])

    if (rawValue) {
      const inline = parseInlineList(rawValue)
      if (inline.length > 0) {
        aliases.push(...inline)
      } else {
        const parsed = stripOuterQuotes(rawValue)
        if (parsed) aliases.push(parsed)
      }
      continue
    }

    const baseIndent = line.match(/^\s*/)?.[0].length ?? 0

    for (let j = i + 1; j < lines.length; j += 1) {
      const aliasLine = lines[j]
      if (!aliasLine.trim()) continue

      const indent = aliasLine.match(/^\s*/)?.[0].length ?? 0
      if (indent <= baseIndent) break

      const listMatch = aliasLine.match(/^\s*-\s*(.*?)\s*$/)
      if (!listMatch) continue

      const parsed = stripOuterQuotes(stripYamlComment(listMatch[1]))
      if (parsed) aliases.push(parsed)
    }
  }

  return { title, aliases }
}

function walkMarkdownFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) return []

  const output: string[] = []
  const stack = [directory]

  while (stack.length > 0) {
    const current = stack.pop()!

    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (
        entry.name === ".obsidian" ||
        entry.name === "node_modules" ||
        entry.name.startsWith(".")
      ) {
        continue
      }

      const fullPath = path.join(current, entry.name)

      if (entry.isDirectory()) {
        stack.push(fullPath)
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
        output.push(fullPath)
      }
    }
  }

  return output
}

function canonicalPathForFile(filePath: string, contentDir: string): string {
  return path
    .relative(contentDir, filePath)
    .replace(/\\/g, "/")
    .replace(/\.md$/i, "")
}

function buildIndex(contentDir: string): ResolverIndex {
  const index: ResolverIndex = new Map()
  const duplicates = new Set<string>()

  for (const filePath of walkMarkdownFiles(contentDir)) {
    let source: string
    try {
      source = fs.readFileSync(filePath, "utf8")
    } catch {
      continue
    }

    const frontmatter = extractFrontmatter(source)
    if (!frontmatter) continue

    const metadata = parseFrontmatterNames(frontmatter)
    const names = [metadata.title, ...metadata.aliases].filter(
      (value): value is string => Boolean(value?.trim()),
    )

    const canonicalPath = canonicalPathForFile(filePath, contentDir)

    for (const name of names) {
      const key = normalizeName(name)
      if (!key) continue

      const existing = index.get(key)
      if (existing && existing !== canonicalPath) {
        duplicates.add(key)
      } else {
        index.set(key, canonicalPath)
      }
    }
  }

  for (const duplicate of duplicates) {
    index.delete(duplicate)
  }

  if (duplicates.size > 0) {
    console.warn(
      `[CanonicalWikiLinks] Duplicate title/alias values ignored: ${[
        ...duplicates,
      ].join(", ")}`,
    )
  }

  return index
}

function getIndex(ctx: BuildContext): ResolverIndex {
  const contentDir = path.resolve(
    process.cwd(),
    ctx.argv.directory || "content",
  )

  const now = Date.now()

  if (
    cachedIndex === null ||
    cachedContentDir !== contentDir ||
    now - cacheBuiltAt > CACHE_TTL_MS
  ) {
    cachedIndex = buildIndex(contentDir)
    cachedContentDir = contentDir
    cacheBuiltAt = now
  }

  return cachedIndex
}

function splitTargetAndFragment(target: string) {
  const headingIndex = target.indexOf("#")
  const blockIndex = target.indexOf("^")
  const indexes = [headingIndex, blockIndex].filter((index) => index >= 0)

  if (indexes.length === 0) {
    return { baseTarget: target, fragment: "" }
  }

  const firstIndex = Math.min(...indexes)

  return {
    baseTarget: target.slice(0, firstIndex),
    fragment: target.slice(firstIndex),
  }
}

function resolveWikiLink(rawInner: string, index: ResolverIndex): string | null {
  const pipeIndex = rawInner.indexOf("|")
  const rawTarget =
    pipeIndex >= 0 ? rawInner.slice(0, pipeIndex) : rawInner
  const explicitDisplay =
    pipeIndex >= 0 ? rawInner.slice(pipeIndex + 1) : undefined

  const target = rawTarget.trim()
  if (!target) return null

  const { baseTarget, fragment } = splitTargetAndFragment(target)
  const cleanBaseTarget = baseTarget.trim()

  // Existing explicit paths are left untouched.
  if (cleanBaseTarget.includes("/") || cleanBaseTarget.includes("\\")) {
    return null
  }

  const canonicalPath = index.get(normalizeName(cleanBaseTarget))
  if (!canonicalPath) return null

  const display =
    explicitDisplay !== undefined ? explicitDisplay : cleanBaseTarget

  return `[[${canonicalPath}${fragment}|${display}]]`
}

function transformLine(line: string, index: ResolverIndex): string {
  // Intentionally ignore ![[embeds]] for now.
  return line.replace(
    /(?<!!)\[\[([^\]\n]+)\]\]/g,
    (fullMatch, inner: string) => {
      return resolveWikiLink(inner, index) ?? fullMatch
    },
  )
}

function transformMarkdown(source: string, index: ResolverIndex): string {
  const lines = source.split(/\r?\n/)
  const output: string[] = []

  let inFrontmatter = false
  let inFence = false
  let fenceMarker = ""

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]

    if (i === 0 && line.trim() === "---") {
      inFrontmatter = true
      output.push(line)
      continue
    }

    if (inFrontmatter) {
      output.push(line)
      if (line.trim() === "---") inFrontmatter = false
      continue
    }

    const fenceMatch = line.match(/^\s*(```+|~~~+)/)

    if (fenceMatch) {
      const marker = fenceMatch[1][0]

      if (!inFence) {
        inFence = true
        fenceMarker = marker
      } else if (marker === fenceMarker) {
        inFence = false
        fenceMarker = ""
      }

      output.push(line)
      continue
    }

    if (inFence) {
      output.push(line)
      continue
    }

    output.push(transformLine(line, index))
  }

  return output.join("\n")
}

export default function CanonicalWikiLinks() {
  return {
    name: "CanonicalWikiLinks",

    textTransform(ctx: BuildContext, src: string) {
      const index = getIndex(ctx)
      return transformMarkdown(src, index)
    },
  }
}
