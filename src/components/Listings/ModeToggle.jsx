import { Gamepad2, List } from 'lucide-react'
import './ModeToggle.css'

const MODES = {
  GAME: 'game',
  LIST: 'list'
}

function ModeToggle({ mode, onModeChange }) {
  return (
    <div className="mode-toggle">
      <button
        className={`mode-btn ${mode === MODES.GAME ? 'active' : ''}`}
        onClick={() => onModeChange(MODES.GAME)}
      >
        <Gamepad2 size={18} strokeWidth={2} style={{ marginRight: '8px' }} />
        Oyun Modu
      </button>
      <button
        className={`mode-btn ${mode === MODES.LIST ? 'active' : ''}`}
        onClick={() => onModeChange(MODES.LIST)}
      >
        <List size={18} strokeWidth={2} style={{ marginRight: '8px' }} />
        Liste Modu
      </button>
    </div>
  )
}

export default ModeToggle
