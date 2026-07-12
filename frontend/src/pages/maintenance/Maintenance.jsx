import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import MainLayout from '../../components/layout/MainLayout'
import { Wrench, Plus, GripVertical } from 'lucide-react'
import { getStatusColor } from '../../utils/helpers'
import { toast } from 'sonner'
import MaintenanceModal from './MaintenanceModal'

const columns = ['Pending', 'Approved', 'Technician assigned', 'In progress', 'Resolved']

export default function Maintenance() {
  const { maintenanceItems, addMaintenanceItem } = useData()
  const [showModal, setShowModal] = useState(false)
  const [draggedItem, setDraggedItem] = useState(null)

  const handleAddMaintenance = (data) => {
    addMaintenanceItem(data)
    toast.success('Maintenance request created successfully!')
    setShowModal(false)
  }

  const getItemsByStatus = (status) => {
    return maintenanceItems.filter(item => item.status === status)
  }

  const handleDragStart = (e, item) => {
    setDraggedItem(item)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e, status) => {
    e.preventDefault()
    if (draggedItem) {
      toast.success(`Moved "${draggedItem.asset}" to ${status}`)
      setDraggedItem(null)
    }
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Maintenance Management</h1>
          <p className="text-text-secondary mt-1">Kanban board for maintenance workflow</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          New Request
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 pb-8">
        {columns.map(status => (
          <div
            key={status}
            className="bg-bg-secondary/30 rounded-xl p-4 border border-border-color min-h-[400px]"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            {/* Column Header */}
            <h3 className="font-semibold text-foreground mb-4 text-sm flex items-center gap-2">
              <span className="w-5 h-5 bg-primary/20 text-primary text-xs rounded flex items-center justify-center font-bold">
                {getItemsByStatus(status).length}
              </span>
              {status}
            </h3>

            {/* Cards */}
            <div className="space-y-3">
              {getItemsByStatus(status).map(item => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  className="bg-bg-tertiary border border-border-color rounded-lg p-4 cursor-move hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 group"
                >
                  <div className="flex gap-2 mb-2">
                    <GripVertical size={16} className="text-text-secondary/40 group-hover:text-primary/50 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-foreground">{item.id}</p>
                      <p className="text-xs text-text-secondary mt-1">{item.asset}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                      {item.priority}
                    </span>
                    {item.assignedTo && (
                      <span className="text-xs text-text-secondary">{item.assignedTo}</span>
                    )}
                  </div>
                </div>
              ))}
              {getItemsByStatus(status).length === 0 && (
                <div className="text-center py-8 text-text-secondary/50">
                  <Wrench size={24} className="mx-auto mb-2" />
                  <p className="text-xs">No items</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <MaintenanceModal
          onClose={() => setShowModal(false)}
          onSubmit={handleAddMaintenance}
        />
      )}
    </MainLayout>
  )
}
