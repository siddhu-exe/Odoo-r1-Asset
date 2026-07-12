import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import MainLayout from '../../components/layout/MainLayout'
import { Bell, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { calculateDaysSince } from '../../utils/helpers'

const notificationTypes = {
  'allocation': { icon: AlertCircle, color: 'text-primary' },
  'booking': { icon: Clock, color: 'text-accent' },
  'approval': { icon: CheckCircle, color: 'text-success' },
  'alert': { icon: AlertCircle, color: 'text-warning' }
}

export default function Notifications() {
  const { notifications } = useData()
  const [filter, setFilter] = useState('All')

  const filteredNotifications = filter === 'All'
    ? notifications
    : filter === 'Unread'
    ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.read)

  const getIcon = (type) => {
    const config = notificationTypes[type] || notificationTypes['alert']
    const Icon = config.icon
    return <Icon size={20} className={config.color} />
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Notifications & Alerts</h1>
        <p className="text-text-secondary mt-1">Activity logs and system notifications</p>
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
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(notif => (
            <div
              key={notif.id}
              className={`card flex gap-4 items-start transition-all duration-200 ${
                notif.read ? 'opacity-75' : 'border-primary/50 bg-primary/5'
              }`}
            >
              {/* Icon */}
              <div className="mt-1">
                {getIcon(notif.type)}
              </div>

              {/* Content */}
              <div className="flex-1">
                <p className={`${notif.read ? 'text-text-secondary' : 'font-semibold text-foreground'}`}>
                  {notif.title}
                </p>
                <p className="text-xs text-text-secondary/70 mt-1">
                  {notif.timestamp}
                </p>
              </div>

              {/* Unread Indicator */}
              {!notif.read && (
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
    </MainLayout>
  )
}
