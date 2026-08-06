import { QuartzPageTypePlugin } from "../types"
import { ArchiveDashboard } from "../../components"

export const ArchivesPageType: QuartzPageTypePlugin = () => ({
  name: "archives",
  priority: 100,

  match({ slug }) {
    return slug === "archives"
  },

  layout: "archives",
  frame: "default",
  body: ArchiveDashboard,
})