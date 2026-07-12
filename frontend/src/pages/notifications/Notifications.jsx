import React, { useState, useEffect, useCallback } from 'react'
import MainLayout from '../../components/layout/MainLayout'
import { Bell, AlertCircle, CheckCircle, Clock, Loader2 } from 'lucide-react'
import { calculateDaysSince } from '../../utils/helpers'
import { toast } from 'sonner'
import api from '../../api'

const notificationMeta = {
  alert: { label: 'Alert', icon: AlertCircle, color: 'text-danger', tint: 'bg-danger/10', unreadBorder: 'border-danger/40', unreadBg: 'bg-danger/5', dot: 'bg-danger' },
  booking: { label: 'Booking', icon: Clock, color: 'text-chart-4', tint: 'bg-chart-4/10', unreadBorder: 'border-chart-4/40', unreadBg: 'bg-chart-4/5', dot: 'bg-chart-4' },
  approval: { label: 'Approval', icon: CheckCircle, color: 'text-success', tint: 'bg-success/10', unreadBorder: 'border-success/40', unreadBg: 'bg-success/5', dot: 'bg-success' },
  allocation: { label: 'Allocation', icon: Bell, color: 'text-chart-5', tint: 'bg-chart-5/10', unreadBorder: 'border-chart-5/40', unreadBg: 'bg-chart-5/5', dot: 'bg-chart-5' },
  system: { label: 'System', icon: Bell, color: 'text-text-secondary', tint: 'bg-text-secondary/10', unreadBorder: 'border-text-secondary/30', unreadBg: 'bg-text-secondary/5', dot: 'bg-text-secondary' },
}

const notificationCategoryMap = {
  booking_confirmed: 'booking',
  booking_cancelled: 'booking',
  booking_reminder: 'booking',
  transfer_approved: 'approval',
  transfer_rejected: 'approval',
  maintenance_approved: 'approval',
  maintenance_resolved: 'approval',
  audit_assigned: 'approval',
  overdue_return: 'alert',
  audit_discrepancy: 'alert',
  asset_assigned: 'alert',
  asset_returned: 'alert',
  transfer_requested: 'alert',
  maintenance_raised: 'alert',
  allocation: 'allocation',
}

function getCategory(type) {
  return notificationCategoryMap[type] || 'system'
}

function formatNotificationTime(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const now = new Date()
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return `Today at ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
  if (diffDays === 1) return `Yesterday at ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data)
    } catch {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleMarkRead = async (notifId) => {
    try {
      await api.patch(`/notifications/${notifId}/read`)
      setNotifications(prev =>
        prev.map(n => n.id === notifId ? { ...n, is_read: true } : n)
      )
    } catch {
      // silent fail
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      toast.success('All notifications marked as read')
    } catch {
      toast.error('Failed to mark all as read')
    }
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'All') return true
    const cat = getCategory(n.type)
    if (filter === 'Alerts') return cat === 'alert'
    if (filter === 'Approvals') return cat === 'approval'
    if (filter === 'Bookings') return cat === 'booking'
    return true
  })

  const getIcon = (type) => {
    const cat = getCategory(type)
    const config = notificationMeta[cat] || notificationMeta.system
    const Icon = config.icon
    return (
      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${config.tint}`}>
        <Icon size={18} className={config.color} />
      </div>
    )
  }

  const getRowConfig = (type) => {
    const cat = getCategory(type)
    return notificationMeta[cat] || notificationMeta.system
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] sm:text-[38px] font-black text-foreground tracking-tight">Notifications & Alerts</h1>
          <p className="text-text-secondary mt-1">Activity logs, approvals, and system updates in one place</p>
        </div>
        {notifications.some(n => !n.is_read) && (
          <button
            onClick={handleMarkAllRead}
            className="btn-secondary text-sm"
          >
            Mark All Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-3">
          {['All', 'Alerts', 'Approvals', 'Bookings'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                filter === tab
                  ? 'bg-primary text-background'
                  : 'bg-bg-tertiary text-text-secondary hover:bg-bg-tertiary/80'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map(notif => {
              const config = getRowConfig(notif.type)
              const category = getCategory(notif.type)
              const relativeTime = formatNotificationTime(notif.created_at)
              const hasMessage = notif.message && notif.message !== notif.title
              return (
                <div
                  key={notif.id}
                  onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                  className={`card flex gap-4 items-start transition-all duration-200 ${
                    !notif.is_read ? `${config.unreadBorder} ${config.unreadBg} cursor-pointer` : 'opacity-75'
                  }`}
                >
                  {/* Icon */}
                  {getIcon(notif.type)}

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${config.tint} ${config.color}`}>
                        {config.label}
                      </span>
                      {!notif.is_read && (
                        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                          New
                        </span>
                      )}
                    </div>
                    <p className={`${notif.is_read ? 'text-text-secondary' : 'font-semibold text-foreground'}`}>
                      {notif.title}
                    </p>
                    {hasMessage && (
                      <p className="text-xs text-text-secondary mt-0.5">{notif.message}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-text-secondary/70">
                      <span>{relativeTime || calculateDaysSince(notif.created_at)}</span>
                      {notif.entity_type && (
                        <span className="capitalize">{notif.entity_type.replace(/_/g, ' ')}</span>
                      )}
                      <span className="capitalize">{category}</span>
                    </div>
                  </div>

                  {/* Unread Indicator */}
                  {!notif.is_read && (
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${config.dot}`} />
                  )}
                </div>
              )
            })
          ) : (
            <div className="card text-center py-12">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-chart-4/10 flex items-center justify-center">
                <Bell size={24} className="text-chart-4" />
              </div>
              <p className="text-text-secondary">No notifications</p>
            </div>
          )}
        </div>
      )}
    </MainLayout>
  )
}
