import { QuartzPageTypePlugin } from "../types"
import ArchiveRegistry from "../../components/Prime/ArchiveRegistry"

const registrySlugs = new Set([
  "02-locations",
  "02-locations/index",
  "03-personnel",
  "03-personnel/index",
])

export const RegistryPageType: QuartzPageTypePlugin = () => ({
  name: "registry",
  priority: 200,

  match({ slug }) {
    return registrySlugs.has(slug)
  },

  layout: "content",
  frame: "default",

  // PageTypeDispatcher calls body(undefined) while collecting resources.
  // Return the component instead of invoking it.
  body: () => ArchiveRegistry,
})
