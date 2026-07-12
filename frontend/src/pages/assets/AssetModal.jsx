import { useState } from 'react'

import { X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import api from '../../api'

const CONDITIONS = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
]

const INITIAL_FORM = {
  name: '',
  serial_number: '',
  category_id: '',
  condition: 'good',
  location: '',
  is_bookable: false,
  acquisition_date: '',
  acquisition_cost: '',
  notes: '',
  photo_url: '',
  document_url: '',
}

function toFormValues(asset) {
  if (!asset) return INITIAL_FORM
  return {
    name: asset.name || '',
    serial_number: asset.serial_number || '',
    category_id: asset.category_id || '',
    condition: asset.condition || 'good',
    location: asset.location || '',
    is_bookable: asset.is_bookable || false,
    acquisition_date: asset.acquisition_date || '',
    acquisition_cost: asset.acquisition_cost !== null && asset.acquisition_cost !== undefined
      ? String(asset.acquisition_cost)
      : '',
    notes: asset.notes || '',
    photo_url: asset.photo_url || '',
    document_url: asset.document_url || '',
  }
}

export default function AssetModal({ categories, asset, onClose, onSuccess }) {
  const isEditing = Boolean(asset)
  const [values, setValues] = useState(toFormValues(asset))
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setValues(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const next = {}
    if (!values.name.trim()) next.name = 'Asset name is required'
    if (!values.category_id) next.category_id = 'Category is required'
    if (values.acquisition_cost && isNaN(Number(values.acquisition_cost))) {
      next.acquisition_cost = 'Must be a valid number'
    }
    if (values.acquisition_cost && Number(values.acquisition_cost) < 0) {
      next.acquisition_cost = 'Cost cannot be negative'
    }
    return next
  }

  const buildPayload = () => {
    const payload = {
      name: values.name.trim(),
      condition: values.condition,
      location: values.location.trim() || null,
      is_bookable: values.is_bookable,
      notes: values.notes.trim() || null,
      photo_url: values.photo_url.trim() || null,
      document_url: values.document_url.trim() || null,
    }
    if (!isEditing) {
      payload.category_id = values.category_id
      payload.serial_number = values.serial_number.trim() || null
      payload.acquisition_date = values.acquisition_date || null
      payload.acquisition_cost = values.acquisition_cost ? Number(values.acquisition_cost) : null
    }
    return payload
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validation = validate()
    if (Object.keys(validation).length > 0) {
      setErrors(validation)
      return
    }

    setSubmitting(true)
    try {
      if (isEditing) {
        await api.put(`/assets/${asset.id}`, buildPayload())
      } else {
        await api.post('/assets', buildPayload())
      }
      onSuccess()
    } catch (err) {
      const detail = err.response?.data?.detail
      if (typeof detail === 'string') {
        toast.error(detail)
      } else {
        toast.error(isEditing ? 'Failed to update asset' : 'Failed to register asset')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-bg-secondary border border-border-color rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border-color sticky top-0 bg-bg-secondary z-10">
          <h2 className="text-xl font-bold text-foreground">
            {isEditing ? `Edit ${asset.asset_tag}` : 'Register New Asset'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="label-base">Asset Name *</label>
            <input
              type="text"
              name="name"
              placeholder="e.g., Dell Laptop Pro 15"
              value={values.name}
              onChange={handleChange}
              className="input-base"
            />
            {errors.name && <p className="text-danger text-sm mt-1">{errors.name}</p>}
          </div>

          {!isEditing && (
            <div>
              <label className="label-base">Category *</label>
              <select
                name="category_id"
                value={values.category_id}
                onChange={handleChange}
                className="input-base"
              >
                <option value="">Select category…</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.category_id && <p className="text-danger text-sm mt-1">{errors.category_id}</p>}
            </div>
          )}

          {!isEditing && (
            <div>
              <label className="label-base">Serial Number</label>
              <input
                type="text"
                name="serial_number"
                placeholder="Manufacturer serial number"
                value={values.serial_number}
                onChange={handleChange}
                className="input-base"
              />
            </div>
          )}

          <div>
            <label className="label-base">Condition</label>
            <select
              name="condition"
              value={values.condition}
              onChange={handleChange}
              className="input-base"
            >
              {CONDITIONS.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-base">Location</label>
            <input
              type="text"
              name="location"
              placeholder="e.g., Warehouse A, Desk E12, Floor 3"
              value={values.location}
              onChange={handleChange}
              className="input-base"
            />
          </div>

          {!isEditing && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-base">Acquisition Date</label>
                <input
                  type="date"
                  name="acquisition_date"
                  value={values.acquisition_date}
                  onChange={handleChange}
                  className="input-base"
                />
              </div>
              <div>
                <label className="label-base">Acquisition Cost (₹)</label>
                <input
                  type="number"
                  name="acquisition_cost"
                  placeholder="0"
                  min="0"
                  value={values.acquisition_cost}
                  onChange={handleChange}
                  className="input-base"
                />
                {errors.acquisition_cost && (
                  <p className="text-danger text-sm mt-1">{errors.acquisition_cost}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_bookable"
              name="is_bookable"
              checked={values.is_bookable}
              onChange={handleChange}
              className="w-4 h-4 accent-primary"
            />
            <label htmlFor="is_bookable" className="text-sm text-foreground cursor-pointer">
              Mark as shared / bookable resource
            </label>
          </div>

          <div>
            <label className="label-base">Notes</label>
            <textarea
              name="notes"
              placeholder="Any additional notes about this asset…"
              value={values.notes}
              onChange={handleChange}
              rows={3}
              className="input-base resize-none"
            />
          </div>

          <div>
            <label className="label-base">Photo URL</label>
            <input
              type="url"
              name="photo_url"
              placeholder="https://…"
              value={values.photo_url}
              onChange={handleChange}
              className="input-base"
            />
          </div>

          <div>
            <label className="label-base">Document URL</label>
            <input
              type="url"
              name="document_url"
              placeholder="https://… (warranty, invoice, manual)"
              value={values.document_url}
              onChange={handleChange}
              className="input-base"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {isEditing ? 'Save Changes' : 'Register Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
