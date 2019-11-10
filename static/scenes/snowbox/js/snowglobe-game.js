import SoundManager from './managers/SoundManager.js'
import SceneManager from './components/SceneManager/index.js'

// ui components
import Toolbar from './ui-components/Toolbar.js'
import CameraControls from './ui-components/CameraControls.js'
import ObjectEditTool from './ui-components/ObjectEditTool.js'
import { isTouchDevice } from './helpers.js'

const { Scene, PerspectiveCamera } = self.THREE

class SnowglobeGame {
  static get is() {
    return 'snowglobe-game'
  }

  constructor(el) {
    this.ui = {
      canvas: el.querySelector('#canvas'),
      toolbar: el.querySelector('[toolbar]'),
      cameraControls: el.querySelector('[camera-controls]'),
      objectEditTool: el.querySelector('[object-edit-tool]')
    }

    this.isTouchDevice = isTouchDevice()

    // init scene
    SceneManager.init(this.ui.canvas)

    // init ui components
    new Toolbar(this.ui.toolbar)
    new CameraControls(this.ui.cameraControls)
    new ObjectEditTool(this.ui.objectEditTool)

    this.stats = new self.Stats()
    this.stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(this.stats.dom)

    this.render()
  }

  render(now) {
    this.stats.begin()
    SceneManager.update(now)
    this.stats.end()

    requestAnimationFrame(this.render.bind(this))
  }

  setup() {}

  update() {}

  teardown() {}

  start() {}
  resume() {}
}

customElements.define(SnowglobeGame.is, SnowglobeGame)

export default SnowglobeGame
