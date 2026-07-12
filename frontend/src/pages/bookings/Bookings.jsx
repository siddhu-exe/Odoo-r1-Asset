import React, { useState, useEffect, useCallback, useRef } from 'react'
import MainLayout from '../../components/layout/MainLayout'
import { Calendar, Plus, ChevronLeft, ChevronRight, User, Loader2, X } from 'lucide-react'
import { formatStatus } from '../../utils/helpers'
import { toast } from 'sonner'
import BookingModal from './BookingModal'
import api from '../../api'

const PIXELS_PER_HOUR = 80
const HOUR_START = 7
const HOUR_END = 22
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => i + HOUR_START)

const STATUS_CFG = {
  upcoming:  { bg: 'bg-primary',      border: 'border-primary',  text: 'text-white',          dashed: false },
  ongoing:   { bg: 'bg-success',      border: 'border-success',  text: 'text-white',          dashed: false },
  completed: { bg: 'bg-bg-tertiary',  border: 'border-border-color', text: 'text-text-secondary', dashed: false },
  cancelled: { bg: 'bg-danger/10',    border: 'border-danger',   text: 'text-danger',         dashed: true  },
}

function toLocalDateStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function isSameLocalDay(isoStr, localDateStr) {
  const d = new Date(isoStr)
  return toLocalDateStr(d) === localDateStr
}

function formatDateDisplay(date) {
  return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

function formatHour(h) {
  if (h === 0) return '12 AM'
  if (h < 12) return `${h} AM`
  if (h === 12) return '12 PM'
  return `${h - 12} PM`
}

function formatTime(isoStr) {
  return new Date(isoStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Assign non-overlapping columns to bookings so they render side-by-side
function layoutBookings(bookings) {
  if (!bookings.length) return []
  const sorted = [...bookings].sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
  const colEnds = []
  const withCol = []

  for (const bk of sorted) {
    const startMs = new Date(bk.start_time).getTime()
    let col = 0
    for (; col < colEnds.length; col++) {
      if (colEnds[col] <= startMs) break
    }
    colEnds[col] = new Date(bk.end_time).getTime()
    withCol.push({ ...bk, _col: col })
  }

  // For each booking, calculate how many columns its overlap group needs
  return withCol.map(b => {
    const sMs = new Date(b.start_time).getTime()
    const eMs = new Date(b.end_time).getTime()
    const overlaps = withCol.filter(o => {
      const os = new Date(o.start_time).getTime()
      const oe = new Date(o.end_time).getTime()
      return os < eMs && oe > sMs
    })
    return { ...b, _colCount: Math.max(...overlaps.map(o => o._col)) + 1 }
  })
}

export default function Bookings() {
  const [bookings, setBookings]       = useState([])
  const [assets, setAssets]           = useState([])
  const [assetMap, setAssetMap]       = useState({})
  const [employeeMap, setEmployeeMap] = useState({})
  const [loading, setLoading]         = useState(true)
  const [showModal, setShowModal]     = useState(false)
  const [modalPrefill, setModalPrefill] = useState(null)
  const [selectedAssetId, setSelectedAssetId] = useState('')
  const [selectedDate, setSelectedDate]       = useState(toLocalDateStr(new Date()))
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [cancellingId, setCancellingId]       = useState(null)
  const gridRef = useRef(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [bookRes, assetsRes, empRes] = await Promise.all([
        api.get('/bookings?page_size=100'),
        api.get('/assets?page_size=100'),
        api.get('/employees?page_size=100').catch(() => ({ data: { items: [] } })),
      ])
      const aList = assetsRes.data.items
      setBookings(bookRes.data.items)
      setAssets(aList)
      setAssetMap(Object.fromEntries(aList.map(a => [a.id, a])))
      setEmployeeMap(Object.fromEntries(empRes.data.items.map(e => [e.id, e])))
      setSelectedAssetId(prev => prev || (aList[0]?.id ?? ''))
    } catch {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Scroll to 8 AM on first load
  useEffect(() => {
    if (!loading && gridRef.current) {
      gridRef.current.scrollTop = (8 - HOUR_START) * PIXELS_PER_HOUR - 32
    }
  }, [loading])

  const navigateDate = (delta) => {
    const d = new Date(selectedDate + 'T00:00:00')
    d.setDate(d.getDate() + delta)
    setSelectedDate(toLocalDateStr(d))
  }

  const isToday = selectedDate === toLocalDateStr(new Date())

  // Current time line
  const now = new Date()
  const nowMins = (now.getHours() - HOUR_START) * 60 + now.getMinutes()
  const nowTop  = nowMins * PIXELS_PER_HOUR / 60
  const showNow = isToday && nowMins >= 0 && nowMins <= (HOUR_END - HOUR_START) * 60

  const dayBookings = bookings.filter(b =>
    b.asset_id === selectedAssetId && isSameLocalDay(b.start_time, selectedDate)
  )
  const laid = layoutBookings(dayBookings)
  const totalHeight = (HOUR_END - HOUR_START) * PIXELS_PER_HOUR

  // Click on empty grid area → open create modal pre-filled at that time
  const handleGridClick = (e) => {
    if (e.target !== e.currentTarget) return
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const rawMin = Math.round((y / PIXELS_PER_HOUR) * 60 / 15) * 15
    const hour   = Math.min(Math.floor(rawMin / 60) + HOUR_START, HOUR_END - 1)
    const minute = rawMin % 60
    const endHour = Math.min(hour + 1, HOUR_END)
    setModalPrefill({
      assetId:   selectedAssetId,
      date:      selectedDate,
      startTime: `${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`,
      endTime:   `${String(endHour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`,
    })
    setShowModal(true)
  }

  const handleBookingClick = (e, booking) => {
    e.stopPropagation()
    setSelectedBooking(booking)
  }

  const handleCancel = async (id) => {
    setCancellingId(id)
    try {
      await api.patch(`/bookings/${id}/cancel`)
      toast.success('Booking cancelled')
      setSelectedBooking(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to cancel')
    } finally {
      setCancellingId(null)
    }
  }

  const handleAddBooking = async (data) => {
    try {
      await api.post('/bookings', data)
      toast.success('Booking created!')
      setShowModal(false)
      setModalPrefill(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create booking')
    }
  }

  return (
    <MainLayout>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[32px] sm:text-[38px] font-black text-foreground tracking-tight">Resource Booking</h1>
          <p className="text-text-secondary mt-1">Schedule and manage resource reservations</p>
        </div>
        <button
          onClick={() => {
            setModalPrefill({ assetId: selectedAssetId, date: selectedDate })
            setShowModal(true)
          }}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Book a Slot
        </button>
      </div>

      {/* ── Controls ── */}
      <div className="card mb-4 flex flex-col sm:flex-row gap-4 items-center justify-between py-3 px-4">
        {/* Resource selector */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-sm text-text-secondary font-medium whitespace-nowrap">Resource</span>
          <select
            className="input-base flex-1 max-w-xs py-1.5 text-sm"
            value={selectedAssetId}
            onChange={e => setSelectedAssetId(e.target.value)}
          >
            {assets.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        {/* Date navigator */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigateDate(-1)}
            className="p-1.5 rounded-lg bg-bg-tertiary hover:bg-bg-tertiary/60 text-text-secondary hover:text-foreground transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setSelectedDate(toLocalDateStr(new Date()))}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              isToday ? 'bg-primary text-white' : 'bg-bg-tertiary text-text-secondary hover:text-foreground'
            }`}
          >
            Today
          </button>
          <span className="px-3 py-1.5 text-sm font-semibold text-foreground min-w-[200px] text-center">
            {formatDateDisplay(new Date(selectedDate + 'T00:00:00'))}
          </span>
          <button
            onClick={() => navigateDate(1)}
            className="p-1.5 rounded-lg bg-bg-tertiary hover:bg-bg-tertiary/60 text-text-secondary hover:text-foreground transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Legend */}
        <div className="hidden xl:flex items-center gap-4 text-xs text-text-secondary">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-primary inline-block" />Upcoming
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-success inline-block" />Ongoing
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-bg-tertiary border border-border-color inline-block" />Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-danger/10 border border-dashed border-danger inline-block" />Cancelled
          </span>
        </div>
      </div>

      {/* ── Calendar grid ── */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : (
          <div ref={gridRef} className="overflow-y-auto" style={{ maxHeight: '72vh' }}>
            <div className="flex">

              {/* Time labels */}
              <div className="flex-shrink-0 w-16 border-r border-border-color/40 bg-bg-secondary relative" style={{ height: totalHeight }}>
                {HOURS.map((h, i) => (
                  <div
                    key={h}
                    className="absolute right-2 text-right"
                    style={{ top: i * PIXELS_PER_HOUR - 9 }}
                  >
                    <span className="text-[11px] text-text-secondary/50 font-medium leading-none">
                      {formatHour(h)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Grid body */}
              <div
                className="flex-1 relative select-none"
                style={{ height: totalHeight }}
                onClick={handleGridClick}
              >
                {/* Hour lines */}
                {HOURS.map((_, i) => (
                  <div
                    key={i}
                    className="absolute left-0 right-0 border-t border-border-color/25 pointer-events-none"
                    style={{ top: i * PIXELS_PER_HOUR }}
                  />
                ))}
                {/* Half-hour lines */}
                {HOURS.map((_, i) => (
                  <div
                    key={`hh-${i}`}
                    className="absolute left-0 right-0 border-t border-border-color/10 pointer-events-none"
                    style={{ top: i * PIXELS_PER_HOUR + PIXELS_PER_HOUR / 2 }}
                  />
                ))}

                {/* Current time indicator */}
                {showNow && (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                    style={{ top: nowTop }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-danger flex-shrink-0 -ml-1.5 shadow-sm shadow-danger/50" />
                    <div className="flex-1 border-t-2 border-danger opacity-70" />
                  </div>
                )}

                {/* Empty state */}
                {laid.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <Calendar size={40} className="text-text-secondary/15 mx-auto mb-3" />
                      <p className="text-text-secondary/40 text-sm">No bookings for this day</p>
                      <p className="text-text-secondary/25 text-xs mt-1">Click anywhere on the grid to book a slot</p>
                    </div>
                  </div>
                )}

                {/* Booking blocks */}
                {laid.map(booking => {
                  const startD   = new Date(booking.start_time)
                  const endD     = new Date(booking.end_time)
                  const startMin = (startD.getHours() - HOUR_START) * 60 + startD.getMinutes()
                  const endMin   = (endD.getHours() - HOUR_START) * 60 + endD.getMinutes()
                  const top      = Math.max(0, startMin * PIXELS_PER_HOUR / 60)
                  const height   = Math.max((endMin - startMin) * PIXELS_PER_HOUR / 60, 28)
                  const leftPct  = (booking._col / booking._colCount) * 100
                  const widthPct = (1 / booking._colCount) * 100
                  const cfg      = STATUS_CFG[booking.status] || STATUS_CFG.upcoming
                  const emp      = employeeMap[booking.booked_by]
                  const empName  = emp ? `${emp.first_name} ${emp.last_name}` : ''
                  const isSelected = selectedBooking?.id === booking.id

                  return (
                    <div
                      key={booking.id}
                      style={{
                        position: 'absolute',
                        top,
                        height,
                        left:  `calc(${leftPct}% + 4px)`,
                        width: `calc(${widthPct}% - 8px)`,
                      }}
                      className={[
                        'rounded-lg px-2 py-1 border overflow-hidden text-xs z-10 cursor-pointer',
                        'transition-all duration-150',
                        cfg.bg, cfg.border, cfg.text,
                        cfg.dashed ? 'border-dashed opacity-80' : '',
                        isSelected ? 'ring-2 ring-white/30 z-30 shadow-lg' : 'hover:brightness-110 hover:z-20 hover:shadow-md',
                      ].join(' ')}
                      onClick={e => handleBookingClick(e, booking)}
                    >
                      <p className="font-bold truncate leading-tight">
                        {booking.purpose || formatStatus(booking.status)}
                      </p>
                      {height >= 38 && (
                        <p className="opacity-75 mt-0.5 truncate leading-tight">
                          {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
                        </p>
                      )}
                      {height >= 54 && empName && (
                        <p className="opacity-60 mt-0.5 truncate leading-tight flex items-center gap-1">
                          <User size={9} className="flex-shrink-0" />
                          {empName}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Booking detail popup ── */}
      {selectedBooking && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-bg-secondary border border-border-color rounded-2xl max-w-sm w-full shadow-2xl p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-foreground">Booking Details</h3>
              <button onClick={() => setSelectedBooking(null)} className="p-1.5 hover:bg-bg-tertiary rounded-lg transition-colors">
                <X size={18} className="text-text-secondary" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <Row label="Resource"  value={assetMap[selectedBooking.asset_id]?.name || '—'} />
              <Row
                label="Date"
                value={new Date(selectedBooking.start_time).toLocaleDateString('en-US', {
                  weekday: 'short', month: 'short', day: 'numeric',
                })}
              />
              <Row
                label="Time"
                value={`${formatTime(selectedBooking.start_time)} – ${formatTime(selectedBooking.end_time)}`}
              />
              <Row
                label="Booked by"
                value={(() => {
                  const e = employeeMap[selectedBooking.booked_by]
                  return e ? `${e.first_name} ${e.last_name}` : '—'
                })()}
              />
              <Row label="Purpose" value={selectedBooking.purpose || '—'} />
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Status</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  selectedBooking.status === 'upcoming'  ? 'bg-primary/20 text-primary' :
                  selectedBooking.status === 'ongoing'   ? 'bg-success/20 text-success' :
                  selectedBooking.status === 'cancelled' ? 'bg-danger/20 text-danger' :
                  'bg-bg-tertiary text-text-secondary'
                }`}>
                  {formatStatus(selectedBooking.status)}
                </span>
              </div>
            </div>

            {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'completed' && (
              <button
                disabled={cancellingId === selectedBooking.id}
                onClick={() => handleCancel(selectedBooking.id)}
                className="mt-5 w-full py-2 rounded-lg bg-danger/10 hover:bg-danger/20 text-danger text-sm font-medium transition-colors disabled:opacity-50"
              >
                {cancellingId === selectedBooking.id ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Create booking modal ── */}
      {showModal && (
        <BookingModal
          defaultValues={modalPrefill}
          onClose={() => { setShowModal(false); setModalPrefill(null) }}
          onSubmit={handleAddBooking}
        />
      )}
    </MainLayout>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-secondary">{label}</span>
      <span className="font-medium text-foreground text-right max-w-[60%] truncate">{value}</span>
    </div>
  )
}
