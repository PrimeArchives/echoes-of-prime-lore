import Map from "./Map"
import { virex9Map } from "./maps/virex9"

export default function NavigationPage() {
  return (
    <main class="navigation-page">
      <Map map={virex9Map} />
    </main>
  )
}