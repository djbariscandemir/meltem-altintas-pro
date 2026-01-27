// Ortak logo + fallback bileşeni. Header, Dashboard, Login, EmptyState’te kullanılır.

import { useState } from 'react'

const FALLBACK_TEXT = 'Meltem Altıntaş Pro'

function AppLogo({ imgClassName = '', fallbackClassName = '', alt = FALLBACK_TEXT }) {
  const [logoLoaded, setLogoLoaded] = useState(false)
  const [logoError, setLogoError] = useState(false)

  const handleLoad = () => {
    setLogoLoaded(true)
    setLogoError(false)
  }

  const handleError = () => {
    setLogoError(true)
    setLogoLoaded(false)
  }

  if (logoError) {
    return <span className={fallbackClassName}>{FALLBACK_TEXT}</span>
  }

  return (
    <img
      src="/logo.png"
      alt={alt}
      className={`${imgClassName} ${logoLoaded ? 'logo-loaded' : ''}`.trim()}
      onLoad={handleLoad}
      onError={handleError}
    />
  )
}

export default AppLogo
