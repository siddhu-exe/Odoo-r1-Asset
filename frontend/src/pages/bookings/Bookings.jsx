import React, { useState, useEffect, useCallback } from 'react'
import MainLayout from '../../components/layout/MainLayout'
import { Calendar, Plus, User } from 'lucide-react'
import { getStatusColor, formatStatus } from '../../utils/helpers'
import { toast } from 'sonner'
import BookingModal from './BookingModal'
import api from '../../api'

const STATUS_FILTERS = ['All', 'upcoming', 'ongoing', 'completed', 'cancelled']

export default function Bookings() {
  const [bookings, setBookings] = useState([])
  const [assets, setAssets] = useState({})
  const [employees, setEmployees] = useState({})
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState('All')

  const loadBookings = useCallback(async () => {
    setLoading(true)
    try {
      const [bookingsRes, assetsRes, employeesRes] = await Promise.all([
        api.get('/bookings?page_size=100'),
        api.get('/assets?page_size=100'),
        api.get('/employees?page_size=100')
      ])
      setBookings(bookingsRes.data.items)
      setAssets(Object.fromEntries(assetsRes.data.items.map(a => [a.id, a])))
      setEmployees(Object.fromEntries(employeesRes.data.items.map(e => [e.id, e])))
    } catch (err) {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  const filteredBookings = bookings.filter(b =>
    filterStatus === 'All' || b.status === filterStatus
  )

  const handleAddBooking = async (bookingData) => {
    try {
      await api.post('/bookings', bookingData)
      toast.success('Booking created successfully!')
      setShowModal(false)
      loadBookings()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create booking')
    }
  }

  const handleCancelBooking = async (bookingId) => {
    try {
      await api.patch(`/bookings/${bookingId}/cancel`)
      toast.success('Booking cancelled')
      loadBookings()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to cancel booking')
    }
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] sm:text-[38px] font-black text-foreground tracking-tight">Resource Booking</h1>
          <p className="text-text-secondary mt-1">Schedule and manage resource reservations</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Book Resource
        </button>
      </div>

      {/* Filter */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-3">
          {STATUS_FILTERS.map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${filterStatus === status
                  ? 'bg-primary text-background'
                  : 'bg-bg-tertiary text-text-secondary hover:bg-bg-tertiary/80'
                }`}
            >
              {status === 'All' ? 'All' : formatStatus(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Calendar View */}
      <div className="grid gap-4">
        {loading ? (
          <div className="card text-center py-12">
            <p className="text-text-secondary">Loading bookings...</p>
          </div>
        ) : filteredBookings.length > 0 ? (
          filteredBookings.map(booking => {
            const asset = assets[booking.asset_id]
            const employee = employees[booking.booked_by]
            const start = new Date(booking.start_time)
            const end = new Date(booking.end_time)
            return (
              <div
                key={booking.id}
                className="card hover:border-primary/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Date/Time */}
                  <div className="bg-primary/10 rounded-lg p-4 min-w-fit">
                    <p className="text-sm text-text-secondary mb-1">Date</p>
                    <p className="text-lg font-bold text-primary">
                      {start.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-sm text-text-secondary mt-2">
                      {start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">{asset ? asset.name : booking.asset_id}</h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <div className="flex items-center gap-1 text-sm text-text-secondary">
                            <User size={16} />
                            {employee ? `${employee.first_name} ${employee.last_name}` : booking.booked_by}
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                            {formatStatus(booking.status)}
                          </span>
                        </div>
                        {booking.purpose && (
                          <p className="text-sm text-text-secondary">{booking.purpose}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex gap-2">
                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="px-4 py-2 bg-danger/10 hover:bg-danger/20 text-danger rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="card text-center py-12">
            <Calendar size={48} className="text-text-secondary/30 mx-auto mb-4" />
            <p className="text-text-secondary">No bookings found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <BookingModal
          onClose={() => setShowModal(false)}
          onSubmit={handleAddBooking}
        />
      )}
    </MainLayout>
  )
}
