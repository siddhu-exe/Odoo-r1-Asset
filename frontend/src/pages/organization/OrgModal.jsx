import { useState } from 'react'

import { X, Plus, Trash2, Loader2 } from 'lucide-react'

import { useForm } from '../../hooks/useForm'
import { validateEmail } from '../../utils/helpers'

function deptInitials(t) {
  return t
    ? { name: t.name, description: t.description || '', parentId: t.parent_id || '', headId: t.head_id || '' }
    : { name: '', description: '', parentId: '', headId: '' }
}

function catInitials(t) {
  return t ? { name: t.name, description: t.description || '' } : { name: '', description: '' }
}

function empInitials(t) {
  return t
    ? { firstName: t.first_name, lastName: t.last_name, phone: t.phone || '', departmentId: t.department_id || '', role: t.role }
    : { firstName: '', lastName: '', email: '', password: '', phone: '', departmentId: '', role: 'employee' }
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="label-base">{label}</label>
      {children}
      {error && <p className="text-danger text-sm mt-1">{error}</p>}
    </div>
  )
}

export default function OrgModal({
  activeTab, editTarget, departments, employees,
  onClose, onSubmitDept, onSubmitCategory, onSubmitEmployee,
}) {
  const isEdit = !!editTarget

  const [customFields, setCustomFields] = useState(() => {
    if (!editTarget?.custom_fields) return []
    return Object.entries(editTarget.custom_fields).map(([key, value]) => ({ key, value: String(value) }))
  })

  const deptForm = useForm(deptInitials(editTarget), async (values) => {
    if (!values.name.trim()) { deptForm.setFieldError('name', 'Name is required'); return }
    await onSubmitDept({ ...values, parentId: values.parentId || null, headId: values.headId || null })
  })

  const catForm = useForm(catInitials(editTarget), async (values) => {
    if (!values.name.trim()) { catForm.setFieldError('name', 'Name is required'); return }
    await onSubmitCategory({ ...values, customFields })
  })

  const empForm = useForm(empInitials(editTarget), async (values) => {
    if (!values.firstName.trim()) { empForm.setFieldError('firstName', 'First name is required'); return }
    if (!values.lastName.trim()) { empForm.setFieldError('lastName', 'Last name is required'); return }
    if (!isEdit && !validateEmail(values.email)) { empForm.setFieldError('email', 'Valid email required'); return }
    if (!isEdit && values.password.length < 8) { empForm.setFieldError('password', 'Min. 8 characters'); return }
    await onSubmitEmployee(values)
  })

  const addField = () => setCustomFields(p => [...p, { key: '', value: '' }])
  const removeField = (i) => setCustomFields(p => p.filter((_, idx) => idx !== i))
  const updateField = (i, k, v) => setCustomFields(p => p.map((f, idx) => idx === i ? { ...f, [k]: v } : f))

  const activeForm = activeTab === 'departments' ? deptForm : activeTab === 'categories' ? catForm : empForm
  const title = `${isEdit ? 'Edit' : 'Add'} ${
    activeTab === 'departments' ? 'Department' : activeTab === 'categories' ? 'Category' : 'Employee'
  }`

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-bg-secondary border border-border-color rounded-2xl max-w-md w-full shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border-color">
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={activeForm.handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {activeTab === 'departments' && (
            <>
              <Field label="Department Name *" error={deptForm.touched.name && deptForm.errors.name}>
                <input type="text" name="name" placeholder="Engineering" value={deptForm.values.name}
                  onChange={deptForm.handleChange} onBlur={deptForm.handleBlur} className="input-base" />
              </Field>
              <Field label="Description">
                <textarea name="description" placeholder="Optional description" rows={2}
                  value={deptForm.values.description} onChange={deptForm.handleChange} className="input-base resize-none" />
              </Field>
              <Field label="Parent Department">
                <select name="parentId" value={deptForm.values.parentId} onChange={deptForm.handleChange} className="input-base">
                  <option value="">— None —</option>
                  {departments.filter(d => d.id !== editTarget?.id).map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Department Head">
                <select name="headId" value={deptForm.values.headId} onChange={deptForm.handleChange} className="input-base">
                  <option value="">— Unassigned —</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
                  ))}
                </select>
              </Field>
            </>
          )}

          {activeTab === 'categories' && (
            <>
              <Field label="Category Name *" error={catForm.touched.name && catForm.errors.name}>
                <input type="text" name="name" placeholder="Electronics, Furniture…" value={catForm.values.name}
                  onChange={catForm.handleChange} onBlur={catForm.handleBlur} className="input-base" />
              </Field>
              <Field label="Description">
                <textarea name="description" placeholder="Optional description" rows={2}
                  value={catForm.values.description} onChange={catForm.handleChange} className="input-base resize-none" />
              </Field>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="label-base">Custom Fields</span>
                  <button type="button" onClick={addField} className="text-xs text-primary flex items-center gap-1 hover:underline">
                    <Plus size={13} /> Add field
                  </button>
                </div>
                {customFields.map((f, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input type="text" placeholder="Field name" value={f.key}
                      onChange={e => updateField(i, 'key', e.target.value)} className="input-base flex-1 text-sm" />
                    <input type="text" placeholder="Type hint" value={f.value}
                      onChange={e => updateField(i, 'value', e.target.value)} className="input-base flex-1 text-sm" />
                    <button type="button" onClick={() => removeField(i)}
                      className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors text-danger">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'employees' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="First Name *" error={empForm.touched.firstName && empForm.errors.firstName}>
                  <input type="text" name="firstName" placeholder="Priya" value={empForm.values.firstName}
                    onChange={empForm.handleChange} onBlur={empForm.handleBlur} className="input-base" />
                </Field>
                <Field label="Last Name *" error={empForm.touched.lastName && empForm.errors.lastName}>
                  <input type="text" name="lastName" placeholder="Sharma" value={empForm.values.lastName}
                    onChange={empForm.handleChange} onBlur={empForm.handleBlur} className="input-base" />
                </Field>
              </div>
              {!isEdit ? (
                <>
                  <Field label="Email *" error={empForm.touched.email && empForm.errors.email}>
                    <input type="email" name="email" placeholder="priya@company.com" value={empForm.values.email}
                      onChange={empForm.handleChange} onBlur={empForm.handleBlur} className="input-base" />
                  </Field>
                  <Field label="Password *" error={empForm.touched.password && empForm.errors.password}>
                    <input type="password" name="password" placeholder="Min. 8 characters" value={empForm.values.password}
                      onChange={empForm.handleChange} onBlur={empForm.handleBlur} className="input-base" />
                  </Field>
                </>
              ) : (
                <div className="px-3 py-2 bg-bg-tertiary rounded-lg">
                  <p className="text-sm text-text-secondary">Email: <span className="text-foreground">{editTarget.email}</span></p>
                </div>
              )}
              <Field label="Phone (optional)">
                <input type="tel" name="phone" placeholder="+91-9876543210" value={empForm.values.phone}
                  onChange={empForm.handleChange} className="input-base" />
              </Field>
              <Field label="Department">
                <select name="departmentId" value={empForm.values.departmentId} onChange={empForm.handleChange} className="input-base">
                  <option value="">— Unassigned —</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </Field>
              {isEdit && (
                <Field label="Role">
                  <select name="role" value={empForm.values.role} onChange={empForm.handleChange} className="input-base">
                    <option value="employee">Employee</option>
                    <option value="asset_manager">Asset Manager</option>
                    <option value="department_head">Department Head</option>
                  </select>
                </Field>
              )}
            </>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={activeForm.isSubmitting}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              {activeForm.isSubmitting
                ? <><Loader2 size={16} className="animate-spin" /> Saving...</>
                : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
