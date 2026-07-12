import React, { useState, useEffect, useCallback } from 'react'
import MainLayout from '../../components/layout/MainLayout'
import { Bell, AlertCircle, CheckCircle, Clock, Loader2 } from 'lucide-react'
import { calculateDaysSince } from '../../utils/helpers'
import { toast } from 'sonner'
import api from '../../api'

const BOOKING_TYPES = ['booking_confirmed', 'booking_cancelled', 'booking_reminder']
const APPROVAL_TYPES = ['transfer_approved', 'transfer_rejected', 'maintenance_approved', 'maintenance_resolved', 'audit_assigned']
const ALERT_TYPES = ['overdue_return', 'audit_discrepancy', 'asset_assigned', 'asset_returned', 'transfer_requested', 'maintenance_raised']

function getCategory(type) {
  if (BOOKING_TYPES.includes(type)) return 'booking'
  if (APPROVAL_TYPES.includes(type)) return 'approval'
  if (ALERT_TYPES.includes(type)) return 'alert'
  return 'alert'
}

const notificationTypes = {
  'alert': { icon: AlertCircle, color: 'text-primary' },
  'booking': { icon: Clock, color: 'text-accent' },
  'approval': { icon: CheckCircle, color: 'text-success' },
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
    const config = notificationTypes[cat] || notificationTypes['alert']
    const Icon = config.icon
    return <Icon size={20} className={config.color} />
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications & Alerts</h1>
          <p className="text-text-secondary mt-1">Activity logs and system notifications</p>
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
            filteredNotifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                className={`card flex gap-4 items-start transition-all duration-200 ${
                  !notif.is_read ? 'border-primary/50 bg-primary/5 cursor-pointer' : 'opacity-75'
                }`}
              >
                {/* Icon */}
                <div className="mt-1">
                  {getIcon(notif.type)}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <p className={`${notif.is_read ? 'text-text-secondary' : 'font-semibold text-foreground'}`}>
                    {notif.title}
                  </p>
                  {notif.message && notif.message !== notif.title && (
                    <p className="text-xs text-text-secondary mt-0.5">{notif.message}</p>
                  )}
                  <p className="text-xs text-text-secondary/70 mt-1">
                    {calculateDaysSince(notif.created_at)}
                  </p>
                </div>

                {/* Unread Indicator */}
                {!notif.is_read && (
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                )}
              </div>
            ))
          ) : (
            <div className="card text-center py-12">
              <Bell size={48} className="text-text-secondary/30 mx-auto mb-4" />
              <p className="text-text-secondary">No notifications</p>
            </div>
          )}
        </div>
      )}
    </MainLayout>
  )
}
