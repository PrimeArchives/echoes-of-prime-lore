// src/index.ts
import fs from "fs";
import path from "path";
var cachedIndex = null;
var cachedContentDir = "";
var cacheBuiltAt = 0;
var CACHE_TTL_MS = 500;
function normalizeName(value) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}
function stripOuterQuotes(value) {
  const trimmed = value.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"') || trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}
function stripYamlComment(value) {
  let quote = null;
  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];
    if ((char === '"' || char === "'") && value[i - 1] !== "\\") {
      quote = quote === char ? null : quote === null ? char : quote;
      continue;
    }
    if (char === "#" && quote === null) {
      return value.slice(0, i).trimEnd();
    }
  }
  return value.trimEnd();
}
function parseInlineList(value) {
  const trimmed = value.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) return [];
  const inner = trimmed.slice(1, -1);
  const values = [];
  let current = "";
  let quote = null;
  for (let i = 0; i < inner.length; i += 1) {
    const char = inner[i];
    if ((char === '"' || char === "'") && inner[i - 1] !== "\\") {
      quote = quote === char ? null : quote === null ? char : quote;
      current += char;
      continue;
    }
    if (char === "," && quote === null) {
      const parsed2 = stripOuterQuotes(stripYamlComment(current));
      if (parsed2) values.push(parsed2);
      current = "";
      continue;
    }
    current += char;
  }
  const parsed = stripOuterQuotes(stripYamlComment(current));
  if (parsed) values.push(parsed);
  return values;
}
function extractFrontmatter(source) {
  const lines = source.replace(/^\uFEFF/, "").split(/\r?\n/);
  if (lines[0]?.trim() !== "---") return null;
  const endIndex = lines.findIndex(
    (line, index) => index > 0 && line.trim() === "---"
  );
  if (endIndex < 0) return null;
  return lines.slice(1, endIndex).join("\n");
}
function parseFrontmatterNames(frontmatter) {
  const lines = frontmatter.split(/\r?\n/);
  let title;
  const aliases = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const titleMatch = line.match(/^\s*title\s*:\s*(.*?)\s*$/i);
    if (titleMatch) {
      const parsed = stripOuterQuotes(stripYamlComment(titleMatch[1]));
      if (parsed) title = parsed;
      continue;
    }
    const aliasesMatch = line.match(/^\s*(aliases|alias)\s*:\s*(.*?)\s*$/i);
    if (!aliasesMatch) continue;
    const rawValue = stripYamlComment(aliasesMatch[2]);
    if (rawValue) {
      const inline = parseInlineList(rawValue);
      if (inline.length > 0) {
        aliases.push(...inline);
      } else {
        const parsed = stripOuterQuotes(rawValue);
        if (parsed) aliases.push(parsed);
      }
      continue;
    }
    const baseIndent = line.match(/^\s*/)?.[0].length ?? 0;
    for (let j = i + 1; j < lines.length; j += 1) {
      const aliasLine = lines[j];
      if (!aliasLine.trim()) continue;
      const indent = aliasLine.match(/^\s*/)?.[0].length ?? 0;
      if (indent <= baseIndent) break;
      const listMatch = aliasLine.match(/^\s*-\s*(.*?)\s*$/);
      if (!listMatch) continue;
      const parsed = stripOuterQuotes(stripYamlComment(listMatch[1]));
      if (parsed) aliases.push(parsed);
    }
  }
  return { title, aliases };
}
function walkMarkdownFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const output = [];
  const stack = [directory];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name === ".obsidian" || entry.name === "node_modules" || entry.name.startsWith(".")) {
        continue;
      }
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
        output.push(fullPath);
      }
    }
  }
  return output;
}
function canonicalPathForFile(filePath, contentDir) {
  return path.relative(contentDir, filePath).replace(/\\/g, "/").replace(/\.md$/i, "");
}
function buildIndex(contentDir) {
  const index = /* @__PURE__ */ new Map();
  const duplicates = /* @__PURE__ */ new Set();
  for (const filePath of walkMarkdownFiles(contentDir)) {
    let source;
    try {
      source = fs.readFileSync(filePath, "utf8");
    } catch {
      continue;
    }
    const frontmatter = extractFrontmatter(source);
    if (!frontmatter) continue;
    const metadata = parseFrontmatterNames(frontmatter);
    const names = [metadata.title, ...metadata.aliases].filter(
      (value) => Boolean(value?.trim())
    );
    const canonicalPath = canonicalPathForFile(filePath, contentDir);
    for (const name of names) {
      const key = normalizeName(name);
      if (!key) continue;
      const existing = index.get(key);
      if (existing && existing !== canonicalPath) {
        duplicates.add(key);
      } else {
        index.set(key, canonicalPath);
      }
    }
  }
  for (const duplicate of duplicates) {
    index.delete(duplicate);
  }
  if (duplicates.size > 0) {
    console.warn(
      `[CanonicalWikiLinks] Duplicate title/alias values ignored: ${[
        ...duplicates
      ].join(", ")}`
    );
  }
  return index;
}
function getIndex(ctx) {
  const contentDir = path.resolve(
    process.cwd(),
    ctx.argv.directory || "content"
  );
  const now = Date.now();
  if (cachedIndex === null || cachedContentDir !== contentDir || now - cacheBuiltAt > CACHE_TTL_MS) {
    cachedIndex = buildIndex(contentDir);
    cachedContentDir = contentDir;
    cacheBuiltAt = now;
  }
  return cachedIndex;
}
function splitTargetAndFragment(target) {
  const headingIndex = target.indexOf("#");
  const blockIndex = target.indexOf("^");
  const indexes = [headingIndex, blockIndex].filter((index) => index >= 0);
  if (indexes.length === 0) {
    return { baseTarget: target, fragment: "" };
  }
  const firstIndex = Math.min(...indexes);
  return {
    baseTarget: target.slice(0, firstIndex),
    fragment: target.slice(firstIndex)
  };
}
function resolveWikiLink(rawInner, index) {
  const pipeIndex = rawInner.indexOf("|");
  const rawTarget = pipeIndex >= 0 ? rawInner.slice(0, pipeIndex) : rawInner;
  const explicitDisplay = pipeIndex >= 0 ? rawInner.slice(pipeIndex + 1) : void 0;
  const target = rawTarget.trim();
  if (!target) return null;
  const { baseTarget, fragment } = splitTargetAndFragment(target);
  const cleanBaseTarget = baseTarget.trim();
  if (cleanBaseTarget.includes("/") || cleanBaseTarget.includes("\\")) {
    return null;
  }
  const canonicalPath = index.get(normalizeName(cleanBaseTarget));
  if (!canonicalPath) return null;
  const display = explicitDisplay !== void 0 ? explicitDisplay : cleanBaseTarget;
  return `[[${canonicalPath}${fragment}|${display}]]`;
}
function transformLine(line, index) {
  return line.replace(
    /(?<!!)\[\[([^\]\n]+)\]\]/g,
    (fullMatch, inner) => {
      return resolveWikiLink(inner, index) ?? fullMatch;
    }
  );
}
function transformMarkdown(source, index) {
  const lines = source.split(/\r?\n/);
  const output = [];
  let inFrontmatter = false;
  let inFence = false;
  let fenceMarker = "";
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (i === 0 && line.trim() === "---") {
      inFrontmatter = true;
      output.push(line);
      continue;
    }
    if (inFrontmatter) {
      output.push(line);
      if (line.trim() === "---") inFrontmatter = false;
      continue;
    }
    const fenceMatch = line.match(/^\s*(```+|~~~+)/);
    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      if (!inFence) {
        inFence = true;
        fenceMarker = marker;
      } else if (marker === fenceMarker) {
        inFence = false;
        fenceMarker = "";
      }
      output.push(line);
      continue;
    }
    if (inFence) {
      output.push(line);
      continue;
    }
    output.push(transformLine(line, index));
  }
  return output.join("\n");
}
function CanonicalWikiLinks() {
  return {
    name: "CanonicalWikiLinks",
    textTransform(ctx, src) {
      const index = getIndex(ctx);
      return transformMarkdown(src, index);
    }
  };
}
export {
  CanonicalWikiLinks as default
};
