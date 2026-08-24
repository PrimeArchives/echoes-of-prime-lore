import type { QuartzComponentProps } from "../../types"
import Map from "./map"
import { buildVirex9Map } from "./maps/virex9"
import { buildFrozenLatticeMap } from "./maps/frozenlattice"

type NavigationProps = {
  allFiles?: QuartzComponentProps["allFiles"]
}

export default function Navigation({ allFiles = [] }: NavigationProps = {}) {
  const virex9Map = buildVirex9Map(allFiles)
  const frozenLatticeMap = buildFrozenLatticeMap(allFiles)

  return (
    <section class="prime-navigation">
      <style dangerouslySetInnerHTML={{ __html: `
        .prime-navigation__map-toggle {
          position: absolute;
          width: 1px;
          height: 1px;
          opacity: 0;
          pointer-events: none;
        }

        .prime-navigation__selector {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          width: min(1320px, calc(100% - 2rem));
          margin: 1rem auto 0;
          padding: 0.72rem 0.8rem;
          box-sizing: border-box;
          border: 1px solid rgba(100, 215, 255, 0.14);
          border-radius: 10px;
          background: linear-gradient(180deg, rgba(15,24,32,.96), rgba(8,13,18,.98));
        }

        .prime-navigation__selector-label {
          color: #6f8290;
          font-family: var(--codeFont);
          font-size: .46rem;
          font-weight: 900;
          letter-spacing: .11em;
          text-transform: uppercase;
        }

        .prime-navigation__selector-options {
          display: flex;
          flex-wrap: wrap;
          gap: .5rem;
        }

        .prime-navigation__selector-option {
          display: inline-flex;
          align-items: center;
          gap: .48rem;
          min-height: 34px;
          padding: .48rem .75rem;
          border: 1px solid rgba(100,215,255,.16);
          border-radius: 7px;
          background: rgba(100,215,255,.025);
          color: #8395a2;
          font-family: var(--codeFont);
          font-size: .56rem;
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
          cursor: pointer;
        }

        .prime-navigation__selector-option::before {
          width: 7px;
          height: 7px;
          flex: 0 0 7px;
          border-radius: 50%;
          background: #4b5f6c;
          content: "";
        }

        #prime-navigation-map-virex-9:checked
          ~ .prime-navigation__selector
          label[for="prime-navigation-map-virex-9"],
        #prime-navigation-map-frozen-lattice:checked
          ~ .prime-navigation__selector
          label[for="prime-navigation-map-frozen-lattice"] {
          border-color: rgba(100,215,255,.46);
          background: rgba(100,215,255,.085);
          color: #dff8ff;
          box-shadow: inset 0 -2px 0 #64d7ff;
        }

        #prime-navigation-map-virex-9:checked
          ~ .prime-navigation__selector
          label[for="prime-navigation-map-virex-9"]::before,
        #prime-navigation-map-frozen-lattice:checked
          ~ .prime-navigation__selector
          label[for="prime-navigation-map-frozen-lattice"]::before {
          background: #64d7ff;
          box-shadow: 0 0 10px rgba(100,215,255,.75);
        }

        .prime-navigation__map { display: none; }

        #prime-navigation-map-virex-9:checked
          ~ .prime-navigation__maps
          .prime-navigation__map--virex-9,
        #prime-navigation-map-frozen-lattice:checked
          ~ .prime-navigation__maps
          .prime-navigation__map--frozen-lattice {
          display: block;
        }

        @media all and (max-width: 650px) {
          .prime-navigation__selector {
            align-items: flex-start;
            flex-direction: column;
          }
          .prime-navigation__selector-option {
            flex: 1 1 auto;
            justify-content: center;
          }
        }
      `}} />

      <input id="prime-navigation-map-virex-9" class="prime-navigation__map-toggle"
        type="radio" name="prime-navigation-map" checked aria-hidden="true" />
      <input id="prime-navigation-map-frozen-lattice" class="prime-navigation__map-toggle"
        type="radio" name="prime-navigation-map" aria-hidden="true" />

      <div class="prime-navigation__selector">
        <span class="prime-navigation__selector-label">CARTOGRAPHIC DATASET</span>
        <div class="prime-navigation__selector-options">
          <label for="prime-navigation-map-virex-9" class="prime-navigation__selector-option">VIREX-9</label>
          <label for="prime-navigation-map-frozen-lattice" class="prime-navigation__selector-option">FROZEN LATTICE</label>
        </div>
      </div>

      <div class="prime-navigation__maps">
        <div class="prime-navigation__map prime-navigation__map--virex-9">
          <Map map={virex9Map} />
        </div>
        <div class="prime-navigation__map prime-navigation__map--frozen-lattice">
          <Map map={frozenLatticeMap} />
        </div>
      </div>
    </section>
  )
}