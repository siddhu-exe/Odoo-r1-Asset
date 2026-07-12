import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLocation, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Calendar,
  Wrench,
  Settings,
  LogOut,
  ChevronDown,
  BarChart3,
  FileText,
  Bell,
  ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Organization Setup', icon: Settings, path: '/organization' },
  { label: 'Assets', icon: Package, path: '/assets' },
  { label: 'Allocation & Transfer', icon: ChevronRight, path: '/allocation' },
  { label: 'Resource Booking', icon: Calendar, path: '/bookings' },
  { label: 'Maintenance', icon: Wrench, path: '/maintenance' },
  { label: 'Audit', icon: FileText, path: '/audit' },
  { label: 'Reports', icon: BarChart3, path: '/reports' },
  { label: 'Notifications', icon: Bell, path: '/notifications' }
]

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [hoveredItem, setHoveredItem] = useState(null)

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-bg-secondary border-r border-border-color transform transition-transform duration-300 z-40 overflow-y-auto ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-6 space-y-8">
          {/* User Profile */}
          <div className="flex items-center gap-3 pb-6 border-b border-border-color">
            <img 
              src={user?.avatar} 
              alt={user?.name}
              className="w-12 h-12 rounded-full border-2 border-primary/30"
            />
            <div>
              <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-text-secondary">{user?.department}</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-primary/20 text-primary border border-primary/40 shadow-lg shadow-primary/20'
                      : 'text-text-secondary hover:bg-bg-tertiary border border-transparent'
                  }`}
                  onMouseEnter={() => setHoveredItem(item.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                  {active && hoveredItem === item.path && (
                    <div className="ml-auto w-1 h-4 bg-primary rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Logout Button */}
          <div className="pt-6 border-t border-border-color">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-danger hover:bg-danger/10 rounded-lg transition-colors border border-transparent hover:border-danger/30"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
