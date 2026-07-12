import React from 'react'

/**
 * A wrapper component that adds a blueprint-style border and corner indicators.
 * Used to give components a technical, blockchain, or premium Web3 feel.
 */
export default function CornerBorders({ children, className = '' }) {
  return (
    <div className={`blueprint-border blueprint-corner ${className}`}>
      {/* Corner indicators */}
      <span className="blueprint-corner-tl" />
      <span className="blueprint-corner-tr" />
      <span className="blueprint-corner-bl" />
      <span className="blueprint-corner-br" />
      {children}
    </div>
  )
}
