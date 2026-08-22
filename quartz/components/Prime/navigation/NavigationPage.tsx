mport {
  QuartzComponent,
  QuartzComponentProps,
} from "../../types"

import Map from "./Map"
import { buildVirex9Map } from "./maps/virex9"

const NavigationPage: QuartzComponent = (
  props: QuartzComponentProps,
) => {
  const virex9Map = buildVirex9Map(props.allFiles)

  return (
    <main class="navigation-page">
      <Map map={virex9Map} />
    </main>
  )
}

export default NavigationPage