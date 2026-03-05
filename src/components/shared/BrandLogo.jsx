import { useState } from 'react'

const SIZES = {
  sm: 'w-5 h-5 rounded text-[7px]',
  md: 'w-6 h-6 rounded text-[9px]',
  lg: 'w-14 h-14 rounded-xl text-xl',
}

export default function BrandLogo({ brand, size = 'md', className = '' }) {
  const [imgError, setImgError] = useState(false)
  const sizeClass = SIZES[size] || SIZES.md

  // Fallback: colored square with initials
  if (!brand.logoUrl || imgError) {
    return (
      <div
        className={`${sizeClass} flex items-center justify-center font-bold text-white flex-none ${className}`}
        style={{ backgroundColor: brand.logoColor }}
      >
        {brand.shortName}
      </div>
    )
  }

  return (
    <img
      src={brand.logoUrl}
      alt={brand.name}
      onError={() => setImgError(true)}
      className={`${sizeClass} object-contain flex-none ${className}`}
      style={{ backgroundColor: brand.logoColor }}
    />
  )
}
