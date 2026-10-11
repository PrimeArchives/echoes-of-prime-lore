import { QuartzPageTypePlugin } from "../types"
import { PrimeOS } from "../../components"

export const ArchivesPageType: QuartzPageTypePlugin = () => ({
  name: "archives",
  priority: 100,

  match({ slug }) {
    return slug === "archives" || slug === "interface"
  },

  layout: "archives",
  frame: "default",
  body: PrimeOS,
})