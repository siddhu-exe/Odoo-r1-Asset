import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  Bell, LogOut, Menu, X, Settings, Package,
  Calendar, Wrench, FileText, BarChart3, ChevronDown,
  GitCommit, Building2, Tags, Users
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import api from '../../api'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    api.get('/notifications')
      .then(res => setUnreadCount(res.data.filter(n => !n.is_read).length))
      .catch(() => {})
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
  }

  const isActive = (path) => {
    if (path.includes('?')) {
      const [pathname, search] = path.split('?')
      return location.pathname === pathname && location.search === `?${search}`
    }
    return location.pathname === path
  }

  const menuSections = {
    assets: {
      label: 'Assets & Logistics',
      links: [
        { label: 'Directory', path: '/assets', icon: Package },
        { label: 'Allocations & Transfers', path: '/allocation', icon: GitCommit },
        { label: 'Resource Bookings', path: '/bookings', icon: Calendar }
      ]
    },
    ops: {
      label: 'Operations',
      links: [
        { label: 'Maintenance Board', path: '/maintenance', icon: Wrench },
        { label: 'Compliance Audits', path: '/audit', icon: FileText }
      ]
    },
    orgSetup: {
      label: 'Organization Setup',
      links: [
        { label: 'Departments', path: '/organization?tab=departments', icon: Building2 },
        { label: 'Asset Categories', path: '/organization?tab=categories', icon: Tags },
        { label: 'Employees', path: '/organization?tab=employees', icon: Users }
      ]
    },
    admin: {
      label: 'Management',
      links: [
        { label: 'Reports & Stats', path: '/reports', icon: BarChart3 },
        { label: 'Organization Settings', path: '/organization', icon: Settings }
      ]
    }
  }

  return (
    <nav className="fixed top-4 sm:top-5 left-4 right-4 sm:left-6 sm:right-6 z-50 bg-background/80 backdrop-blur-xl border border-border-color rounded-full shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">

          {/* Left section: Logo & Links */}
          <div className="flex items-center gap-6 lg:gap-10">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <img
                src="/WhatsApp Image 2026-07-12 at 2.28.52 PM.jpeg"
                alt="AssetOps Logo"
                className="w-9 h-9 rounded-lg object-cover"
              />
              <span className="font-bold text-lg text-foreground group-hover:text-primary transition-colors hidden sm:block">AssetOps</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <Link
                to="/dashboard"
                className={`text-sm font-medium transition-colors ${isActive('/dashboard') ? 'text-primary' : 'text-text-secondary hover:text-primary'}`}
              >
                Dashboard
              </Link>

              {/* Dropdown triggers */}
              {Object.keys(menuSections).map((key) => {
                const section = menuSections[key]
                const isSectionActive = section.links.some(l => isActive(l.path))

                return (
                  <div
                    key={key}
                    className="relative h-16 flex items-center"
                    onMouseEnter={() => setActiveDropdown(key)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button className={`flex items-center gap-1 text-sm font-medium transition-colors py-4 ${isSectionActive ? 'text-primary' : 'text-text-secondary hover:text-primary'
                      }`}>
                      {section.label}
                      <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === key ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Desktop Dropdown Panel */}
                    {activeDropdown === key && (
                      <div className="absolute top-[64px] left-1/2 -translate-x-1/2 w-64 rounded-xl bg-bg-secondary border border-border-color p-3 shadow-2xl z-50">
                        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-primary to-accent" />
                        <div className="flex flex-col gap-1.5 mt-1">
                          {section.links.map((link) => {
                            const Icon = link.icon
                            const active = isActive(link.path)
                            return (
                              <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${active
                                  ? 'bg-primary/10 text-primary border border-primary/20'
                                  : 'text-text-secondary hover:bg-primary/10 hover:text-primary border border-transparent'
                                  }`}
                              >
                                <Icon size={14} className={active ? 'text-primary' : 'text-text-secondary'} />
                                <span>{link.label}</span>
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right section: Profile, Notifications & Logout */}
          <div className="flex items-center gap-4">

            {/* Notifications */}
            <Link to="/notifications" className="relative p-2 hover:bg-bg-tertiary rounded-lg transition-colors">
              <Bell size={18} className={`transition-colors ${isActive('/notifications') ? 'text-primary' : 'text-text-secondary hover:text-foreground'}`} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-danger rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Profile widget */}
            <div className="hidden sm:flex items-center gap-2.5 pl-4 border-l border-white/10">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-7 h-7 rounded-full border border-primary/30"
              />
              <div className="text-left leading-none">
                <p className="text-xs font-bold text-foreground">{user?.name}</p>
                <span className="text-[10px] text-text-secondary/60">{user?.role}</span>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors text-text-secondary hover:text-danger"
              title="Logout"
            >
              <LogOut size={18} />
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 hover:bg-bg-tertiary rounded-lg transition-colors text-text-secondary hover:text-foreground"
            >
              {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Panel */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-border-color bg-bg-secondary p-4 max-h-[85vh] overflow-y-auto">
          <div className="flex flex-col gap-4">
            <Link
              to="/dashboard"
              onClick={() => setShowMobileMenu(false)}
              className={`text-sm font-semibold p-2.5 rounded-lg ${isActive('/dashboard') ? 'bg-primary/10 text-primary' : 'text-text-secondary'}`}
            >
              Dashboard
            </Link>

            {Object.keys(menuSections).map((key) => {
              const section = menuSections[key]
              return (
                <div key={key} className="flex flex-col gap-1 border-t border-border-color pt-3">
                  <span className="text-[10px] text-text-secondary/50 font-bold uppercase tracking-wider px-2.5 mb-1.5">{section.label}</span>
                  {section.links.map((link) => {
                    const Icon = link.icon
                    const active = isActive(link.path)
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setShowMobileMenu(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold ${active ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-primary/10 hover:text-primary'
                          }`}
                      >
                        <Icon size={14} />
                        <span>{link.label}</span>
                      </Link>
                    )
                  })}
                </div>
              )
            })}

            <button
              onClick={() => { handleLogout(); setShowMobileMenu(false); }}
              className="w-full text-left p-2.5 rounded-lg text-danger hover:bg-danger/10 text-sm font-semibold border border-transparent hover:border-danger/20 mt-2"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
