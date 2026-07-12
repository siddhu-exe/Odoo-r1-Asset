import React from 'react'
import { X } from 'lucide-react'
import { useForm } from '../../hooks/useForm'

export default function AssetModal({ onClose, onSubmit, categories }) {
  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit, setFieldError } = useForm(
    {
      name: '',
      category: 'Electronics',
      status: 'Available',
      location: '',
      allocatedTo: '',
      purchaseDate: '',
      value: ''
    },
    async (formValues) => {
      if (!formValues.name.trim()) {
        setFieldError('name', 'Asset name is required')
        return
      }
      if (!formValues.location.trim()) {
        setFieldError('location', 'Location is required')
        return
      }
      if (!formValues.value || formValues.value <= 0) {
        setFieldError('value', 'Value must be greater than 0')
        return
      }

      onSubmit({
        ...formValues,
        value: parseInt(formValues.value)
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
      <div className="bg-bg-secondary border border-border-color rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-color sticky top-0 bg-bg-secondary">
          <h2 className="text-2xl font-bold text-foreground">Register Asset</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="label-base">Asset Name *</label>
            <input
              type="text"
              name="name"
              placeholder="e.g., Dell Laptop"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyPress={handleKeyPress}
              className="input-base"
            />
            {touched.name && errors.name && (
              <p className="text-danger text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="label-base">Category *</label>
            <select
              name="category"
              value={values.category}
              onChange={handleChange}
              onBlur={handleBlur}
              className="input-base"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="label-base">Status *</label>
            <select
              name="status"
              value={values.status}
              onChange={handleChange}
              onBlur={handleBlur}
              className="input-base"
            >
              <option value="Available">Available</option>
              <option value="Allocated">Allocated</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Damaged">Damaged</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="label-base">Location *</label>
            <input
              type="text"
              name="location"
              placeholder="e.g., Warehouse, Desk E12"
              value={values.location}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyPress={handleKeyPress}
              className="input-base"
            />
            {touched.location && errors.location && (
              <p className="text-danger text-sm mt-1">{errors.location}</p>
            )}
          </div>

          {/* Allocated To */}
          <div>
            <label className="label-base">Allocated To</label>
            <input
              type="text"
              name="allocatedTo"
              placeholder="Employee name (optional)"
              value={values.allocatedTo}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyPress={handleKeyPress}
              className="input-base"
            />
          </div>

          {/* Purchase Date */}
          <div>
            <label className="label-base">Purchase Date</label>
            <input
              type="date"
              name="purchaseDate"
              value={values.purchaseDate}
              onChange={handleChange}
              onBlur={handleBlur}
              className="input-base"
            />
          </div>

          {/* Value */}
          <div>
            <label className="label-base">Value (₹) *</label>
            <input
              type="number"
              name="value"
              placeholder="Amount in INR"
              value={values.value}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyPress={handleKeyPress}
              className="input-base"
            />
            {touched.value && errors.value && (
              <p className="text-danger text-sm mt-1">{errors.value}</p>
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
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
