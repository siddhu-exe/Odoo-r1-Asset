import React, { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import MainLayout from '../../components/layout/MainLayout'
import { Plus, Edit2, Users, Folder, Tags, Loader2 } from 'lucide-react'
import { getStatusColor } from '../../utils/helpers'
import { toast } from 'sonner'
import OrgModal from './OrgModal'
import api from '../../api'

export default function Organization() {
  const location = useLocation()
  const navigate = useNavigate()

  // Read tab from URL query param
  const searchParams = new URLSearchParams(location.search)
  const tabFromUrl = searchParams.get('tab') || 'departments'

  const [activeTab, setActiveTab] = useState(tabFromUrl)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  // Data from backend
  const [departments, setDepartments] = useState([])
  const [categories, setCategories] = useState([])
  const [employees, setEmployees] = useState([])

  // Sync tab state when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tab = params.get('tab') || 'departments'
    setActiveTab(tab)
  }, [location.search])

  const switchTab = (tab) => {
    navigate(`/organization?tab=${tab}`, { replace: true })
  }

  // Fetch data from backend
  const fetchDepartments = useCallback(async () => {
    try {
      const res = await api.get('/departments?page_size=100')
      setDepartments(res.data.items)
    } catch (err) {
      console.error('Failed to fetch departments:', err)
    }
  }, [])

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/categories?page_size=100')
      setCategories(res.data.items)
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }, [])

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await api.get('/employees?page_size=100')
      setEmployees(res.data.items)
    } catch (err) {
      console.error('Failed to fetch employees:', err)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchDepartments(), fetchCategories(), fetchEmployees()])
      .finally(() => setLoading(false))
  }, [fetchDepartments, fetchCategories, fetchEmployees])

  // Create handlers
  const handleAddDepartment = async (data) => {
    try {
      const code = data.name.replace(/\s+/g, '_').toUpperCase().slice(0, 10)
      await api.post('/departments', {
        name: data.name,
        code,
        description: data.parentDept || null,
        parent_id: null,
        head_id: null
      })
      toast.success(`Department "${data.name}" created!`)
      setShowModal(false)
      fetchDepartments()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create department')
    }
  }

  const handleAddCategory = async (data) => {
    try {
      await api.post('/categories', {
        name: data.name,
        description: data.description || null,
        custom_fields: data.fields ? { fields: data.fields } : null
      })
      toast.success(`Category "${data.name}" created!`)
      setShowModal(false)
      fetchCategories()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create category')
    }
  }

  const handleAddEmployee = async (data) => {
    try {
      const [first_name, ...rest] = data.name.split(' ')
      const last_name = rest.join(' ') || first_name
      // Find department UUID by name
      const dept = departments.find(d => d.name === data.department)
      await api.post('/employees', {
        email: data.email,
        password: 'Password@1234',
        first_name,
        last_name,
        department_id: dept?.id || null
      })
      toast.success(`Employee "${data.name}" added!`)
      setShowModal(false)
      fetchEmployees()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add employee')
    }
  }

  const tabLabel = activeTab === 'departments' ? 'Department' : activeTab === 'categories' ? 'Category' : 'Employee'

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Organization Setup</h1>
          <p className="text-text-secondary mt-1">Manage departments, categories & employees</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Add {tabLabel}
        </button>
      </div>

      {/* Tabs */}
      <div className="card mb-6">
        <div className="flex gap-4 border-b border-border-color">
          <button
            onClick={() => switchTab('departments')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${activeTab === 'departments'
                ? 'text-primary border-primary'
                : 'text-text-secondary border-transparent hover:text-foreground'
              }`}
          >
            <Folder size={18} />
            Departments
          </button>
          <button
            onClick={() => switchTab('categories')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${activeTab === 'categories'
                ? 'text-primary border-primary'
                : 'text-text-secondary border-transparent hover:text-foreground'
              }`}
          >
            <Tags size={18} />
            Asset Categories
          </button>
          <button
            onClick={() => switchTab('employees')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${activeTab === 'employees'
                ? 'text-primary border-primary'
                : 'text-text-secondary border-transparent hover:text-foreground'
              }`}
          >
            <Users size={18} />
            Employees
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      )}

      {/* Departments Tab */}
      {!loading && activeTab === 'departments' && (
        <div className="space-y-4">
          {departments.length === 0 && (
            <div className="card text-center py-12 text-text-secondary">No departments yet. Click "Add Department" to create one.</div>
          )}
          {departments.map(dept => (
            <div key={dept.id} className="card flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{dept.name}</h3>
                <p className="text-sm text-text-secondary mt-1">Code: {dept.code}</p>
                {dept.description && (
                  <p className="text-sm text-text-secondary">Description: {dept.description}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(dept.status === 'active' ? 'Active' : 'Inactive')}`}>
                  {dept.status}
                </span>
                <button className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors">
                  <Edit2 size={18} className="text-primary" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Categories Tab */}
      {!loading && activeTab === 'categories' && (
        <div className="space-y-4">
          {categories.length === 0 && (
            <div className="card text-center py-12 text-text-secondary">No categories yet. Click "Add Category" to create one.</div>
          )}
          {categories.map(cat => (
            <div key={cat.id} className="card flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{cat.name}</h3>
                {cat.description && (
                  <p className="text-sm text-text-secondary mt-1">{cat.description}</p>
                )}
                {cat.custom_fields && (
                  <p className="text-sm text-text-secondary mt-1">
                    Fields: {typeof cat.custom_fields === 'object' ? JSON.stringify(cat.custom_fields) : cat.custom_fields}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(cat.status === 'active' ? 'Active' : 'Inactive')}`}>
                  {cat.status}
                </span>
                <button className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors">
                  <Edit2 size={18} className="text-primary" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Employees Tab */}
      {!loading && activeTab === 'employees' && (
        <div className="space-y-4">
          {employees.length === 0 && (
            <div className="card text-center py-12 text-text-secondary">No employees yet. Click "Add Employee" to create one.</div>
          )}
          {employees.map(emp => (
            <div key={emp.id} className="card flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{emp.first_name} {emp.last_name}</h3>
                <p className="text-sm text-text-secondary mt-1">{emp.email}</p>
                <p className="text-sm text-text-secondary">Role: {emp.role}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(emp.status === 'active' ? 'Active' : 'Inactive')}`}>
                  {emp.status}
                </span>
                <button className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors">
                  <Edit2 size={18} className="text-primary" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <OrgModal
          onClose={() => setShowModal(false)}
          onSubmitDept={handleAddDepartment}
          onSubmitEmp={handleAddEmployee}
          onSubmitCategory={handleAddCategory}
          activeTab={activeTab}
          departments={departments}
        />
      )}
    </MainLayout>
  )
}
