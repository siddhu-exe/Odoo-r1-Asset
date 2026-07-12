import React from 'react'
import { X } from 'lucide-react'
import { useForm } from '../../hooks/useForm'

export default function MaintenanceModal({ onClose, onSubmit, assets }) {
  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit, setFieldError } = useForm(
    {
      asset_id: assets[0]?.id || '',
      description: '',
      priority: 'medium'
    },
    async (formValues) => {
      if (!formValues.asset_id) {
        setFieldError('asset_id', 'Please select an asset')
        return
      }
      if (!formValues.description.trim()) {
        setFieldError('description', 'Description is required')
        return
      }

      await onSubmit({
        asset_id: formValues.asset_id,
        description: formValues.description,
        priority: formValues.priority
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
          <h2 className="text-2xl font-bold text-foreground">New Maintenance Request</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Asset Selection */}
          <div>
            <label className="label-base">Asset *</label>
            <select
              name="asset_id"
              value={values.asset_id}
              onChange={handleChange}
              onBlur={handleBlur}
              className="input-base"
            >
              <option value="">Select an asset</option>
              {assets.map(asset => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} ({asset.asset_tag})
                </option>
              ))}
            </select>
            {touched.asset_id && errors.asset_id && (
              <p className="text-danger text-sm mt-1">{errors.asset_id}</p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="label-base">Priority *</label>
            <select
              name="priority"
              value={values.priority}
              onChange={handleChange}
              onBlur={handleBlur}
              className="input-base"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="label-base">Description *</label>
            <textarea
              name="description"
              placeholder="Describe the maintenance issue..."
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyPress={handleKeyPress}
              rows="4"
              className="input-base resize-none"
            />
            {touched.description && errors.description && (
              <p className="text-danger text-sm mt-1">{errors.description}</p>
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
              {isSubmitting ? 'Creating...' : 'Create Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
