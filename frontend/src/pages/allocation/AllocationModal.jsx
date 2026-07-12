import React from 'react'
import { X } from 'lucide-react'
import { useForm } from '../../hooks/useForm'

export default function AllocationModal({ onClose, onSubmit, assets, employees }) {
  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit, setFieldError } = useForm(
    {
      assetId: assets[0]?.id || '',
      toEmployeeId: employees[0]?.id || '',
      reason: 'Transfer Request'
    },
    async (formValues) => {
      if (!formValues.assetId) {
        setFieldError('assetId', 'Please select an asset')
        return
      }
      if (!formValues.toEmployeeId) {
        setFieldError('toEmployeeId', 'Please select an employee')
        return
      }

      await onSubmit(formValues.assetId, formValues.toEmployeeId, formValues.reason)
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
          <h2 className="text-2xl font-bold text-foreground">Transfer Asset</h2>
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
            <label className="label-base">Select Asset *</label>
            <select
              name="assetId"
              value={values.assetId}
              onChange={handleChange}
              onBlur={handleBlur}
              className="input-base"
            >
              {assets.map(asset => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} ({asset.asset_tag || asset.id})
                </option>
              ))}
            </select>
            {touched.assetId && errors.assetId && (
              <p className="text-danger text-sm mt-1">{errors.assetId}</p>
            )}
          </div>

          {/* Transfer To */}
          <div>
            <label className="label-base">Transfer To *</label>
            <select
              name="toEmployeeId"
              value={values.toEmployeeId}
              onChange={handleChange}
              onBlur={handleBlur}
              className="input-base"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name}
                </option>
              ))}
            </select>
            {touched.toEmployeeId && errors.toEmployeeId && (
              <p className="text-danger text-sm mt-1">{errors.toEmployeeId}</p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="label-base">Reason *</label>
            <select
              name="reason"
              value={values.reason}
              onChange={handleChange}
              className="input-base"
            >
              <option>Transfer Request</option>
              <option>Department Change</option>
              <option>Project Assignment</option>
              <option>Return from Maintenance</option>
              <option>Other</option>
            </select>
          </div>

          {/* Info Box */}
          <div className="bg-primary/5 border border-primary/30 rounded-lg p-3">
            <p className="text-sm text-foreground">
              Double allocation check enabled: Asset will be transferred only after approval.
            </p>
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
              {isSubmitting ? 'Processing...' : 'Submit Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
