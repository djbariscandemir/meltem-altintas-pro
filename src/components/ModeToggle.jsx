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
        🎮 Oyun Modu
      </button>
      <button
        className={`mode-btn ${mode === MODES.LIST ? 'active' : ''}`}
        onClick={() => onModeChange(MODES.LIST)}
      >
        📋 Liste Modu
      </button>
    </div>
  )
}

export default ModeToggle
