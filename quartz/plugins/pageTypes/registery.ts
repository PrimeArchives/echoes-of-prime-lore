import {
  QuartzComponent,
  QuartzComponentProps,
} from "../../components/types"

import { QuartzPageTypePlugin } from "../types"
import ArchiveRegistry from "../../components/Prime/ArchiveRegistry"
import FactionRecord from "../../components/Prime/factions/FactionRecord"
import SystemRecord from "../../components/Prime/systems/SystemRecord"

const registrySlugs = new Set([
  "02-locations",
  "02-locations/index",
  "03-personnel",
  "03-personnel/index",
  "04-factions",
  "04-factions/index",
  "07-systems",
  "07-systems/index",
])

function RegistryRouter(props: QuartzComponentProps) {
  const slug = props.fileData.slug ?? ""
  const type =
    typeof props.fileData.frontmatter?.type === "string"
      ? props.fileData.frontmatter.type.toLowerCase()
      : ""

  if (
    slug.startsWith("04-factions/") &&
    slug !== "04-factions/index" &&
    type === "faction"
  ) {
    return FactionRecord(props)
  }

  if (
    slug.startsWith("07-systems/") &&
    slug !== "07-systems/index" &&
    type === "system"
  ) {
    return SystemRecord(props)
  }

  return ArchiveRegistry(props)
}

const RegistryRouterComponent = RegistryRouter as QuartzComponent

RegistryRouterComponent.css =
  (ArchiveRegistry.css ?? "") +
  (FactionRecord.css ?? "") +
  (SystemRecord.css ?? "")

export const RegistryPageType: QuartzPageTypePlugin = () => ({
  name: "registry",
  priority: 200,

  match({ slug, fileData }) {
    if (registrySlugs.has(slug)) {
      return true
    }

    const type =
      typeof fileData.frontmatter?.type === "string"
        ? fileData.frontmatter.type.toLowerCase()
        : ""

    if (
      slug.startsWith("04-factions/") &&
      slug !== "04-factions/index"
    ) {
      return type === "faction"
    }

    if (
      slug.startsWith("07-systems/") &&
      slug !== "07-systems/index"
    ) {
      return type === "system"
    }

    return false
  },

  layout: "content",
  frame: "default",

  // PageTypeDispatcher calls body(undefined) while collecting resources.
  // Return the component instead of invoking it.
  body: () => RegistryRouterComponent,
})