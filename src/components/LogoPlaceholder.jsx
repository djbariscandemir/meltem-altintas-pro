// src/components/LogoPlaceholder.jsx
// Fotoğrafı olmayan ilanlarda firma logosu gösterir

import { useState } from 'react'
import './LogoPlaceholder.css'

function LogoPlaceholder({ showText = false, className = '', style = {} }) {
  const [logoError, setLogoError] = useState(false)
  
  return (
    <div className={`logo-placeholder ${className}`} style={style}>
      {!logoError && (
        <img 
          src="/logo.png" 
          alt="Meltem Altıntaş Pro"
          className="logo-placeholder-image"
          onError={() => {
            setLogoError(true)
          }}
        />
      )}
      {logoError && (
        <p className="logo-placeholder-text">Fotoğraf bulunmamaktadır</p>
      )}
      {showText && !logoError && (
        <p className="logo-placeholder-text">Fotoğraf bulunmamaktadır</p>
      )}
    </div>
  )
}

export default LogoPlaceholder
