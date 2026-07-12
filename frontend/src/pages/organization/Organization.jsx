import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { toast } from 'sonner'
import { Plus, Edit2, Users, Folder, Tags, Loader2, ToggleLeft, ToggleRight } from 'lucide-react'

import MainLayout from '../../components/layout/MainLayout'
import OrgModal from './OrgModal'
import api from '../../api'
import { getStatusColor, formatStatus } from '../../utils/helpers'

const TABS = [
  { key: 'departments', label: 'Departments', Icon: Folder },
  { key: 'categories', label: 'Asset Categories', Icon: Tags },
  { key: 'employees', label: 'Employees', Icon: Users },
]

const ROLE_LABELS = {
  admin: 'Admin',
  asset_manager: 'Asset Manager',
  department_head: 'Dept. Head',
  employee: 'Employee',
}

export default function Organization() {
  const location = useLocation()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState(
    new URLSearchParams(location.search).get('tab') || 'departments'
  )
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dataVersion, setDataVersion] = useState(0)
  const [departments, setDepartments] = useState([])
  const [categories, setCategories] = useState([])
  const [employees, setEmployees] = useState([])

  useEffect(() => {
    setActiveTab(new URLSearchParams(location.search).get('tab') || 'departments')
  }, [location.search])

  useEffect(() => {
    if (dataVersion === 0) setLoading(true)
    Promise.all([
      api.get('/departments?page_size=100').then(r => setDepartments(r.data.items)).catch(() => {}),
      api.get('/categories?page_size=100').then(r => setCategories(r.data.items)).catch(() => {}),
      api.get('/employees?page_size=100').then(r => setEmployees(r.data.items)).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [dataVersion])

  const refresh = () => setDataVersion(v => v + 1)
  const switchTab = (tab) => navigate(`/organization?tab=${tab}`, { replace: true })
  const openCreate = () => { setEditTarget(null); setShowModal(true) }
  const openEdit = (item) => { setEditTarget(item); setShowModal(true) }
  const closeModal = () => { setShowModal(false); setEditTarget(null) }

  const handleDeptSubmit = async (data) => {
    try {
      if (editTarget) {
        await api.put(`/departments/${editTarget.id}`, {
          name: data.name,
          description: data.description || null,
          parent_id: data.parentId || null,
          head_id: data.headId || null,
        })
        toast.success('Department updated')
      } else {
        await api.post('/departments', {
          name: data.name,
          code: data.name.replace(/\s+/g, '').toUpperCase().slice(0, 10),
          description: data.description || null,
          parent_id: data.parentId || null,
          head_id: data.headId || null,
        })
        toast.success(`Department "${data.name}" created`)
      }
      refresh(); closeModal()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save department')
    }
  }

  const handleToggleDeptStatus = async (dept) => {
    const next = dept.status === 'active' ? 'inactive' : 'active'
    try {
      await api.patch(`/departments/${dept.id}/status`, { status: next })
      toast.success(`Department set to ${next}`)
      refresh()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update status')
    }
  }

  const handleCategorySubmit = async (data) => {
    try {
      const customFields = data.customFields.length > 0
        ? Object.fromEntries(data.customFields.filter(f => f.key.trim()).map(f => [f.key.trim(), f.value]))
        : null
      if (editTarget) {
        await api.put(`/categories/${editTarget.id}`, {
          name: data.name, description: data.description || null, custom_fields: customFields,
        })
        toast.success('Category updated')
      } else {
        await api.post('/categories', {
          name: data.name, description: data.description || null, custom_fields: customFields,
        })
        toast.success(`Category "${data.name}" created`)
      }
      refresh(); closeModal()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save category')
    }
  }

  const handleEmployeeSubmit = async (data) => {
    try {
      if (editTarget) {
        await api.put(`/employees/${editTarget.id}`, {
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone || null,
          department_id: data.departmentId || null,
        })
        if (data.role !== editTarget.role) {
          await api.patch(`/employees/${editTarget.id}/role`, { role: data.role })
        }
        toast.success('Employee updated')
      } else {
        await api.post('/employees', {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          password: data.password,
          phone: data.phone || null,
          department_id: data.departmentId || null,
        })
        toast.success(`Employee "${data.firstName} ${data.lastName}" added`)
      }
      refresh(); closeModal()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save employee')
    }
  }

  const handleToggleEmployeeStatus = async (emp) => {
    const next = emp.status === 'active' ? 'inactive' : 'active'
    try {
      await api.patch(`/employees/${emp.id}/status`, { status: next })
      toast.success(`Employee set to ${next}`)
      refresh()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update status')
    }
  }

  const tabLabel = activeTab === 'departments' ? 'Department' : activeTab === 'categories' ? 'Category' : 'Employee'

  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] sm:text-[38px] font-black text-foreground tracking-tight">Organization Setup</h1>
          <p className="text-text-secondary mt-1">Manage departments, categories &amp; employees</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center justify-center gap-2">
          <Plus size={20} /> Add {tabLabel}
        </button>
      </div>

      <div className="card mb-6">
        <div className="flex border-b border-border-color">
          {TABS.map(({ key, label, Icon }) => (
            <button key={key} onClick={() => switchTab(key)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                activeTab === key ? 'text-primary border-primary' : 'text-text-secondary border-transparent hover:text-foreground'
              }`}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      )}

      {!loading && activeTab === 'departments' && (
        <div className="space-y-3">
          {departments.length === 0 && (
            <div className="card text-center py-12 text-text-secondary">No departments yet. Click &quot;Add Department&quot; to get started.</div>
          )}
          {departments.map(dept => {
            const head = employees.find(e => e.id === dept.head_id)
            return (
              <div key={dept.id} className="card flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground">{dept.name}</h3>
                    <span className="text-xs text-text-secondary bg-bg-tertiary px-2 py-0.5 rounded">{dept.code}</span>
                  </div>
                  {dept.description && <p className="text-sm text-text-secondary mt-0.5 truncate">{dept.description}</p>}
                  {head && <p className="text-sm text-text-secondary">Head: {head.first_name} {head.last_name}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2.5 py-1 rounded-full ${getStatusColor(dept.status)}`}>{formatStatus(dept.status)}</span>
                  <button onClick={() => handleToggleDeptStatus(dept)} title={dept.status === 'active' ? 'Deactivate' : 'Activate'}
                    className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors">
                    {dept.status === 'active'
                      ? <ToggleRight size={18} className="text-success" />
                      : <ToggleLeft size={18} className="text-text-secondary" />}
                  </button>
                  <button onClick={() => openEdit(dept)} className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors">
                    <Edit2 size={16} className="text-primary" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!loading && activeTab === 'categories' && (
        <div className="space-y-3">
          {categories.length === 0 && (
            <div className="card text-center py-12 text-text-secondary">No categories yet. Click &quot;Add Category&quot; to get started.</div>
          )}
          {categories.map(cat => (
            <div key={cat.id} className="card flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{cat.name}</h3>
                {cat.description && <p className="text-sm text-text-secondary mt-0.5 truncate">{cat.description}</p>}
                {cat.custom_fields && Object.keys(cat.custom_fields).length > 0 && (
                  <p className="text-sm text-text-secondary mt-0.5">Fields: {Object.keys(cat.custom_fields).join(', ')}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-2.5 py-1 rounded-full ${getStatusColor(cat.status)}`}>{formatStatus(cat.status)}</span>
                <button onClick={() => openEdit(cat)} className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors">
                  <Edit2 size={16} className="text-primary" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && activeTab === 'employees' && (
        <div className="space-y-3">
          {employees.length === 0 && (
            <div className="card text-center py-12 text-text-secondary">No employees yet. Click &quot;Add Employee&quot; to get started.</div>
          )}
          {employees.map(emp => {
            const dept = departments.find(d => d.id === emp.department_id)
            return (
              <div key={emp.id} className="card flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">{emp.first_name} {emp.last_name}</h3>
                  <p className="text-sm text-text-secondary mt-0.5">{emp.email}</p>
                  {dept && <p className="text-sm text-text-secondary">{dept.name}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/30">
                    {ROLE_LABELS[emp.role] || emp.role}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${getStatusColor(emp.status)}`}>{formatStatus(emp.status)}</span>
                  <button onClick={() => handleToggleEmployeeStatus(emp)} title={emp.status === 'active' ? 'Deactivate' : 'Activate'}
                    className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors">
                    {emp.status === 'active'
                      ? <ToggleRight size={18} className="text-success" />
                      : <ToggleLeft size={18} className="text-text-secondary" />}
                  </button>
                  <button onClick={() => openEdit(emp)} className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors">
                    <Edit2 size={16} className="text-primary" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <OrgModal
          key={editTarget?.id ?? 'new'}
          activeTab={activeTab}
          editTarget={editTarget}
          departments={departments}
          employees={employees}
          onClose={closeModal}
          onSubmitDept={handleDeptSubmit}
          onSubmitCategory={handleCategorySubmit}
          onSubmitEmployee={handleEmployeeSubmit}
        />
      )}
    </MainLayout>
  )
}
