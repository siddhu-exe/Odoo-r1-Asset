import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  ArrowRight, ChevronDown, Cpu, Network, ShieldCheck, 
  Database, Zap, BookOpen, HelpCircle, Users, 
  ExternalLink, X, FileText, Settings, Key 
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function LandingNavbar() {
  const { isAuthenticated } = useAuth()
  const [activeMenu, setActiveMenu] = useState(null)
  const [showBanner, setShowBanner] = useState(true)

  const menuItems = {
    Platform: [
      { name: 'Asset Directory', desc: 'Real-time visibility and status tracking', icon: Database, color: 'text-primary' },
      { name: 'Smart Allocation', desc: 'Conflict-free asset lifecycle assignments', icon: Network, color: 'text-chart-5' },
      { name: 'Audit Hub', desc: 'Automated compliance and discrepancy reporting', icon: ShieldCheck, color: 'text-accent' },
      { name: 'Maintenance Kanban', desc: 'Drag-and-drop hardware repair pipelines', icon: Cpu, color: 'text-chart-4' },
    ],
    Solutions: [
      { name: 'IT Infrastructure', desc: 'For enterprise hardware and cloud assets', icon: Zap, color: 'text-warning' },
      { name: 'Finance & Audit', desc: 'Depreciation models and cost centers', icon: FileText, color: 'text-success' },
      { name: 'Operations', desc: 'Track departments, roles, and custodians', icon: Settings, color: 'text-danger' },
    ],
    Developers: [
      { name: 'API Reference', desc: 'Restful endpoints for legacy integrations', icon: Key, color: 'text-primary' },
      { name: 'Developer Portal', desc: 'Webhooks, keys, and SDK documentation', icon: BookOpen, color: 'text-accent' },
    ],
    Community: [
      { name: 'Enterprise blog', desc: 'Industry insights and asset strategy guides', icon: HelpCircle, color: 'text-chart-5' },
      { name: 'User Forums', desc: 'Join the global network of IT asset leaders', icon: Users, color: 'text-chart-4' },
    ]
  }

  return (
    <>
      {/* Announcement Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '36px' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-accent via-chart-4 to-primary text-white text-xs font-semibold flex items-center justify-center px-4 overflow-hidden border-b border-white/10"
          >
            <span>✨ Introducing AssetFlow 2.0: Now with interactive 3D graphs & hardware tracking!</span>
            <button 
              onClick={() => setShowBanner(false)}
              className="absolute right-4 hover:scale-110 transition-transform p-1 rounded-full hover:bg-white/10"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glass Navigation Bar */}
      <motion.nav 
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: showBanner ? 36 : 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="fixed left-0 right-0 z-40 bg-background/75 backdrop-blur-xl border-b border-border-color"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-accent/20 group-hover:shadow-primary/40 transition-all duration-300">
                AF
              </div>
              <span className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">AssetFlow</span>
            </Link>

            {/* Navigation links (Mega menu triggers) */}
            <div className="hidden md:flex items-center gap-8 h-full">
              {Object.keys(menuItems).map((key) => (
                <div 
                  key={key} 
                  className="relative h-full flex items-center"
                  onMouseEnter={() => setActiveMenu(key)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <button className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-foreground transition-colors py-5 font-medium">
                    {key}
                    <ChevronDown size={14} className={`transition-transform duration-300 ${activeMenu === key ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Mega Menu Dropdown */}
                  <AnimatePresence>
                    {activeMenu === key && (
                      <motion.div 
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-[64px] left-1/2 -translate-x-1/2 w-80 sm:w-96 rounded-xl glass-lux p-4 shadow-2xl z-50 overflow-hidden"
                      >
                        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-accent to-primary" />
                        <div className="grid gap-3 relative z-10">
                          {menuItems[key].map((item, idx) => {
                            const IconComponent = item.icon
                            return (
                              <a
                                key={idx}
                                href="#features"
                                className="flex items-start gap-4 p-2.5 rounded-lg hover:bg-bg-tertiary transition-colors group"
                              >
                                <div className={`p-2 rounded-md bg-bg-tertiary ${item.color} group-hover:scale-105 transition-transform`}>
                                  <IconComponent size={18} />
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                                    {item.name}
                                    <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </h4>
                                  <p className="text-xs text-text-secondary/80 mt-0.5">{item.desc}</p>
                                </div>
                              </a>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              <a href="#about" className="text-sm text-text-secondary hover:text-foreground transition-colors font-medium">About</a>
              <a href="#metrics" className="text-sm text-text-secondary hover:text-foreground transition-colors font-medium">Metrics</a>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Link
                to={isAuthenticated ? '/dashboard' : '/login'}
                className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-bold text-white rounded-lg group bg-gradient-to-br from-accent to-primary group-hover:from-accent group-hover:to-primary hover:text-white focus:ring-2 focus:outline-none focus:ring-accent/30"
              >
                <span className="relative px-5 py-2 transition-all ease-in duration-75 bg-background rounded-md group-hover:bg-opacity-0 flex items-center gap-1.5">
                  {isAuthenticated ? 'Enter Dashboard' : 'Launch App'}
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>

          </div>
        </div>
      </motion.nav>
    </>
  )
}
