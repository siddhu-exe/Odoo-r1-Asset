import React from 'react'
import { X } from 'lucide-react'
import { useForm } from '../../hooks/useForm'

export default function OrgModal({ onClose, onSubmitDept, onSubmitEmp, activeTab }) {
  const deptForm = useForm(
    { name: '', head: '', parentDept: '', status: 'Active' },
    async (values) => {
      if (!values.name.trim()) {
        deptForm.setFieldError('name', 'Department name is required')
        return
      }
      if (!values.head.trim()) {
        deptForm.setFieldError('head', 'Head name is required')
        return
      }
      onSubmitDept(values)
    }
  )

  const empForm = useForm(
    { name: '', email: '', department: 'Engineering', role: 'Employee' },
    async (values) => {
      if (!values.name.trim()) {
        empForm.setFieldError('name', 'Employee name is required')
        return
      }
      if (!values.email.trim() || !values.email.includes('@')) {
        empForm.setFieldError('email', 'Valid email is required')
        return
      }
      onSubmitEmp(values)
    }
  )

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault()
      if (activeTab === 'departments') {
        deptForm.handleSubmit(e)
      } else {
        empForm.handleSubmit(e)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-bg-secondary border border-border-color rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-color">
          <h2 className="text-2xl font-bold text-foreground">
            Add {activeTab === 'departments' ? 'Department' : 'Employee'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={activeTab === 'departments' ? deptForm.handleSubmit : empForm.handleSubmit} className="p-6 space-y-5">
          {activeTab === 'departments' ? (
            <>
              {/* Department Name */}
              <div>
                <label className="label-base">Department Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Engineering, Finance, etc."
                  value={deptForm.values.name}
                  onChange={deptForm.handleChange}
                  onBlur={deptForm.handleBlur}
                  onKeyPress={handleKeyPress}
                  className="input-base"
                />
                {deptForm.touched.name && deptForm.errors.name && (
                  <p className="text-danger text-sm mt-1">{deptForm.errors.name}</p>
                )}
              </div>

              {/* Head */}
              <div>
                <label className="label-base">Department Head *</label>
                <input
                  type="text"
                  name="head"
                  placeholder="Head name"
                  value={deptForm.values.head}
                  onChange={deptForm.handleChange}
                  onBlur={deptForm.handleBlur}
                  onKeyPress={handleKeyPress}
                  className="input-base"
                />
                {deptForm.touched.head && deptForm.errors.head && (
                  <p className="text-danger text-sm mt-1">{deptForm.errors.head}</p>
                )}
              </div>

              {/* Parent Department */}
              <div>
                <label className="label-base">Parent Department</label>
                <input
                  type="text"
                  name="parentDept"
                  placeholder="Optional"
                  value={deptForm.values.parentDept}
                  onChange={deptForm.handleChange}
                  onBlur={deptForm.handleBlur}
                  onKeyPress={handleKeyPress}
                  className="input-base"
                />
              </div>

              {/* Status */}
              <div>
                <label className="label-base">Status</label>
                <select
                  name="status"
                  value={deptForm.values.status}
                  onChange={deptForm.handleChange}
                  className="input-base"
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
            </>
          ) : (
            <>
              {/* Employee Name */}
              <div>
                <label className="label-base">Employee Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={empForm.values.name}
                  onChange={empForm.handleChange}
                  onBlur={empForm.handleBlur}
                  onKeyPress={handleKeyPress}
                  className="input-base"
                />
                {empForm.touched.name && empForm.errors.name && (
                  <p className="text-danger text-sm mt-1">{empForm.errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="label-base">Email *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="john@company.com"
                  value={empForm.values.email}
                  onChange={empForm.handleChange}
                  onBlur={empForm.handleBlur}
                  onKeyPress={handleKeyPress}
                  className="input-base"
                />
                {empForm.touched.email && empForm.errors.email && (
                  <p className="text-danger text-sm mt-1">{empForm.errors.email}</p>
                )}
              </div>

              {/* Department */}
              <div>
                <label className="label-base">Department</label>
                <select
                  name="department"
                  value={empForm.values.department}
                  onChange={empForm.handleChange}
                  className="input-base"
                >
                  <option>Engineering</option>
                  <option>Facilities</option>
                  <option>Finance</option>
                  <option>HR</option>
                </select>
              </div>

              {/* Role */}
              <div>
                <label className="label-base">Role</label>
                <select
                  name="role"
                  value={empForm.values.role}
                  onChange={empForm.handleChange}
                  className="input-base"
                >
                  <option>Employee</option>
                  <option>Manager</option>
                  <option>Head</option>
                  <option>Admin</option>
                </select>
              </div>
            </>
          )}

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
              disabled={activeTab === 'departments' ? deptForm.isSubmitting : empForm.isSubmitting}
              className="btn-primary flex-1"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
