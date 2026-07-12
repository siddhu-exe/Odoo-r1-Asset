import React, { useState, useCallback, useEffect } from 'react'
import MainLayout from '../../components/layout/MainLayout'
import { Wrench, Plus, GripVertical, Loader2 } from 'lucide-react'
import { getStatusColor, formatStatus } from '../../utils/helpers'
import { toast } from 'sonner'
import MaintenanceModal from './MaintenanceModal'
import api from '../../api'

const COLUMNS = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'assigned', label: 'Technician Assigned' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'resolved', label: 'Resolved' },
]

export default function Maintenance() {
  const [maintenanceItems, setMaintenanceItems] = useState([])
  const [assets, setAssets] = useState([])
  const [assetMap, setAssetMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [draggedItem, setDraggedItem] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [mainRes, assetsRes] = await Promise.all([
        api.get('/maintenance?page_size=100'),
        api.get('/assets?page_size=100')
      ])
      setMaintenanceItems(mainRes.data.items)
      const aMap = Object.fromEntries(assetsRes.data.items.map(a => [a.id, a]))
      setAssetMap(aMap)
      setAssets(assetsRes.data.items)
    } catch {
      toast.error('Failed to load maintenance data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleAddMaintenance = async (data) => {
    try {
      await api.post('/maintenance', {
        asset_id: data.asset_id,
        description: data.description,
        priority: data.priority
      })
      toast.success('Maintenance request created successfully!')
      setShowModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create maintenance request')
    }
  }

  const getItemsByStatus = (statusKey) => {
    return maintenanceItems.filter(item => item.status === statusKey)
  }

  const handleDragStart = (e, item) => {
    setDraggedItem(item)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e, statusKey) => {
    e.preventDefault()
    if (draggedItem) {
      const assetName = assetMap[draggedItem.asset_id]?.name || draggedItem.asset_id
      toast.info(`Status update via drag is managed by approvals workflow`)
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

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : (
        /* Kanban Board */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 pb-8">
          {COLUMNS.map(col => (
            <div
              key={col.key}
              className="bg-bg-secondary/30 rounded-xl p-4 border border-border-color min-h-[400px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.key)}
            >
              {/* Column Header */}
              <h3 className="font-semibold text-foreground mb-4 text-sm flex items-center gap-2">
                <span className="w-5 h-5 bg-primary/20 text-primary text-xs rounded flex items-center justify-center font-bold">
                  {getItemsByStatus(col.key).length}
                </span>
                {col.label}
              </h3>

              {/* Cards */}
              <div className="space-y-3">
                {getItemsByStatus(col.key).map(item => {
                  const assetName = assetMap[item.asset_id]?.name || 'Unknown Asset'
                  const shortId = `MF-${item.id.slice(-4).toUpperCase()}`
                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      className="bg-bg-tertiary border border-border-color rounded-lg p-4 cursor-move hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 group"
                    >
                      <div className="flex gap-2 mb-2">
                        <GripVertical size={16} className="text-text-secondary/40 group-hover:text-primary/50 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-foreground">{shortId}</p>
                          <p className="text-xs text-text-secondary mt-1">{assetName}</p>
                          {item.description && (
                            <p className="text-xs text-text-secondary/70 mt-1 truncate">{item.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className={`text-xs px-2 py-1 rounded ${
                          item.priority === 'critical' ? 'bg-danger/10 text-danger' :
                          item.priority === 'high' ? 'bg-warning/10 text-warning' :
                          'bg-primary/10 text-primary'
                        }`}>
                          {formatStatus(item.priority)}
                        </span>
                      </div>
                    </div>
                  )
                })}
                {getItemsByStatus(col.key).length === 0 && (
                  <div className="text-center py-8 text-text-secondary/50">
                    <Wrench size={24} className="mx-auto mb-2" />
                    <p className="text-xs">No items</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <MaintenanceModal
          assets={assets}
          onClose={() => setShowModal(false)}
          onSubmit={handleAddMaintenance}
        />
      )}
    </MainLayout>
  )
}
