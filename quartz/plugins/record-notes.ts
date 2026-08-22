import RecordNotes from "../components/Prime/notes/RecordNotes"
import { QuartzEmitterPlugin } from "./types"

export const RecordNotesPlugin: QuartzEmitterPlugin = () => ({
  name: "record-notes",

  getQuartzComponents() {
    return [RecordNotes]
  },

  async *emit() {
    // RecordNotes genereert zelf geen bestanden.
    // Het wordt alleen via de layout gerenderd.
  },
})