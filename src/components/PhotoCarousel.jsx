import { useState, useRef } from 'react'
import LogoPlaceholder from './LogoPlaceholder'
import './PhotoCarousel.css'

function normalizePhotos(photos) {
  if (!Array.isArray(photos)) return []
  return photos.filter(
    (url) => url && typeof url === 'string' && url.startsWith('http')
  )
}

function PhotoCarousel({ photos, className = '', variant = 'card', title = 'İlan fotoğrafı' }) {
  const validPhotos = normalizePhotos(photos)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [imageError, setImageError] = useState(false)
  const touchStartXRef = useRef(null)
  const touchEndXRef = useRef(null)

  const hasPhotos = validPhotos.length > 0 && !imageError

  const goNext = () => {
    if (!hasPhotos) return
    setCurrentIndex((prev) => (prev + 1) % validPhotos.length)
  }

  const goPrev = () => {
    if (!hasPhotos) return
    setCurrentIndex((prev) =>
      prev === 0 ? validPhotos.length - 1 : prev - 1
    )
  }

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX
  }

  const handleTouchMove = (e) => {
    touchEndXRef.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (touchStartXRef.current == null || touchEndXRef.current == null) return
    const deltaX = touchEndXRef.current - touchStartXRef.current
    const threshold = 30
    if (Math.abs(deltaX) < threshold) return
    if (deltaX < 0) {
      goNext()
    } else {
      goPrev()
    }
    touchStartXRef.current = null
    touchEndXRef.current = null
  }

  const showArrows = hasPhotos && validPhotos.length > 1

  return (
    <div
      className={`photo-carousel photo-carousel-${variant} ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {hasPhotos ? (
        <>
          <img
            src={validPhotos[currentIndex]}
            alt={title}
            className="photo-carousel-image"
            onError={() => setImageError(true)}
          />
          {showArrows && (
            <>
              <button
                type="button"
                className="photo-carousel-arrow photo-carousel-arrow-left"
                onClick={(e) => {
                  e.stopPropagation()
                  goPrev()
                }}
              >
                ‹
              </button>
              <button
                type="button"
                className="photo-carousel-arrow photo-carousel-arrow-right"
                onClick={(e) => {
                  e.stopPropagation()
                  goNext()
                }}
              >
                ›
              </button>
            </>
          )}
          {validPhotos.length > 1 && (
            <div className="photo-carousel-dots">
              {validPhotos.map((_, idx) => (
                <span
                  key={idx}
                  className={
                    idx === currentIndex
                      ? 'photo-carousel-dot photo-carousel-dot-active'
                      : 'photo-carousel-dot'
                  }
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <LogoPlaceholder showText={variant === 'detail'} />
      )}
    </div>
  )
}

export default PhotoCarousel

