import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import MainLayout from '../../components/layout/MainLayout'
import { Calendar, Plus, Clock, User, AlertCircle } from 'lucide-react'
import { getStatusColor, formatDate } from '../../utils/helpers'
import { toast } from 'sonner'
import BookingModal from './BookingModal'

export default function Bookings() {
  const { bookings, addBooking } = useData()
  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState('All')

  const filteredBookings = bookings.filter(b =>
    filterStatus === 'All' || b.status === filterStatus
  )

  const handleAddBooking = (bookingData) => {
    addBooking(bookingData)
    toast.success('Booking created successfully!')
    setShowModal(false)
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Resource Booking</h1>
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
          {['All', 'Booked', 'Requested', 'Cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                filterStatus === status
                  ? 'bg-primary text-background'
                  : 'bg-bg-tertiary text-text-secondary hover:bg-bg-tertiary/80'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Calendar View */}
      <div className="grid gap-4">
        {filteredBookings.length > 0 ? (
          filteredBookings.map(booking => (
            <div
              key={booking.id}
              className="card hover:border-primary/50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Date/Time */}
                <div className="bg-primary/10 rounded-lg p-4 min-w-fit">
                  <p className="text-sm text-text-secondary mb-1">Date</p>
                  <p className="text-lg font-bold text-primary">{booking.date}</p>
                  <p className="text-sm text-text-secondary mt-2">{booking.timeSlot}</p>
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">{booking.resource}</h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <div className="flex items-center gap-1 text-sm text-text-secondary">
                          <User size={16} />
                          {booking.bookedBy}
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      {booking.conflict && (
                        <div className="flex items-center gap-2 text-warning text-sm">
                          <AlertCircle size={16} />
                          Time slot conflict detected
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-medium transition-colors">
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))
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
