import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import MainLayout from '../../components/layout/MainLayout'
import { Plus, Edit2, Trash2, Users, Folder } from 'lucide-react'
import { getStatusColor } from '../../utils/helpers'
import { toast } from 'sonner'
import OrgModal from './OrgModal'

export default function Organization() {
  const { departments, employees, addDepartment, addEmployee } = useData()
  const [activeTab, setActiveTab] = useState('departments')
  const [showModal, setShowModal] = useState(false)

  const handleAddDepartment = (data) => {
    addDepartment(data)
    toast.success(`Department "${data.name}" created successfully!`)
    setShowModal(false)
  }

  const handleAddEmployee = (data) => {
    addEmployee(data)
    toast.success(`Employee "${data.name}" added successfully!`)
    setShowModal(false)
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Organization Setup</h1>
          <p className="text-text-secondary mt-1">Admin only: Manage departments and employees</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Add {activeTab === 'departments' ? 'Department' : 'Employee'}
        </button>
      </div>

      {/* Tabs */}
      <div className="card mb-6">
        <div className="flex gap-4 border-b border-border-color">
          <button
            onClick={() => setActiveTab('departments')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'departments'
                ? 'text-primary border-primary'
                : 'text-text-secondary border-transparent hover:text-foreground'
            }`}
          >
            <Folder size={18} />
            Departments
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'employees'
                ? 'text-primary border-primary'
                : 'text-text-secondary border-transparent hover:text-foreground'
            }`}
          >
            <Users size={18} />
            Employees
          </button>
        </div>
      </div>

      {/* Departments Tab */}
      {activeTab === 'departments' && (
        <div className="space-y-4">
          {departments.map(dept => (
            <div key={dept.id} className="card flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{dept.name}</h3>
                <p className="text-sm text-text-secondary mt-1">Head: {dept.head}</p>
                {dept.parentDept && (
                  <p className="text-sm text-text-secondary">Parent: {dept.parentDept}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(dept.status)}`}>
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

      {/* Employees Tab */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          {employees.map(emp => (
            <div key={emp.id} className="card flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{emp.name}</h3>
                <p className="text-sm text-text-secondary mt-1">{emp.email}</p>
                <p className="text-sm text-text-secondary">{emp.department} • {emp.role}</p>
              </div>
              <button className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors">
                <Edit2 size={18} className="text-primary" />
              </button>
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
          activeTab={activeTab}
        />
      )}
    </MainLayout>
  )
}
