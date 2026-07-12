import React from 'react'
import { X } from 'lucide-react'
import { useForm } from '../../hooks/useForm'

const resources = ['Conference Room B2', 'Projector AF-0062', 'Meeting Room A1', 'Training Hall']

export default function BookingModal({ onClose, onSubmit }) {
  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit, setFieldError } = useForm(
    {
      resource: 'Conference Room B2',
      date: '',
      startTime: '',
      endTime: ''
    },
    async (formValues) => {
      if (!formValues.date) {
        setFieldError('date', 'Date is required')
        return
      }
      if (!formValues.startTime) {
        setFieldError('startTime', 'Start time is required')
        return
      }
      if (!formValues.endTime) {
        setFieldError('endTime', 'End time is required')
        return
      }

      onSubmit({
        resource: formValues.resource,
        date: formValues.date,
        timeSlot: `${formValues.startTime} - ${formValues.endTime}`,
        bookedBy: 'Current User',
        status: 'Requested'
      })
    }
  )

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      handleSubmit(e)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-bg-secondary border border-border-color rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-color">
          <h2 className="text-2xl font-bold text-foreground">Book Resource</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Resource */}
          <div>
            <label className="label-base">Resource *</label>
            <select
              name="resource"
              value={values.resource}
              onChange={handleChange}
              onBlur={handleBlur}
              className="input-base"
            >
              {resources.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="label-base">Date *</label>
            <input
              type="date"
              name="date"
              value={values.date}
              onChange={handleChange}
              onBlur={handleBlur}
              className="input-base"
            />
            {touched.date && errors.date && (
              <p className="text-danger text-sm mt-1">{errors.date}</p>
            )}
          </div>

          {/* Start Time */}
          <div>
            <label className="label-base">Start Time *</label>
            <input
              type="time"
              name="startTime"
              value={values.startTime}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyPress={handleKeyPress}
              className="input-base"
            />
            {touched.startTime && errors.startTime && (
              <p className="text-danger text-sm mt-1">{errors.startTime}</p>
            )}
          </div>

          {/* End Time */}
          <div>
            <label className="label-base">End Time *</label>
            <input
              type="time"
              name="endTime"
              value={values.endTime}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyPress={handleKeyPress}
              className="input-base"
            />
            {touched.endTime && errors.endTime && (
              <p className="text-danger text-sm mt-1">{errors.endTime}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1"
            >
              {isSubmitting ? 'Booking...' : 'Book Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
