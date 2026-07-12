import React, { useEffect } from 'react'
import Navbar from './Navbar'

export default function MainLayout({ children }) {
  useEffect(() => {
    document.body.classList.add('dashboard-page')
    return () => document.body.classList.remove('dashboard-page')
  }, [])

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Immersive mesh gradient blobs */}
      <div className="absolute top-0 left-1/4 w-[450px] h-[450px] bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-accent/8 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '8s', animationDelay: '1s' }} />

      {/* Noise overlay for premium grain feel */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none -z-20" />

      <Navbar />
      <main className="pt-24 sm:pt-28 relative z-10 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
