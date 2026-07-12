import React, { useState, useCallback, useEffect } from 'react'
import MainLayout from '../../components/layout/MainLayout'
import { Wrench, Plus, GripVertical, Loader2, Check, X, UserCog, Play, ClipboardCheck } from 'lucide-react'
import { formatStatus } from '../../utils/helpers'
import { toast } from 'sonner'
import MaintenanceModal from './MaintenanceModal'
import api from '../../api'
import { useAuth } from '../../context/AuthContext'

const COLUMNS = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'assigned', label: 'Technician Assigned' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'resolved', label: 'Resolved' },
]

export default function Maintenance() {
  const { user } = useAuth()
  const [maintenanceItems, setMaintenanceItems] = useState([])
  const [assetMap, setAssetMap] = useState({})
  const [assets, setAssets] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [actionLoading, setActionLoading] = useState({})
  const [assignModal, setAssignModal] = useState(null)
  const [selectedTech, setSelectedTech] = useState('')
  const [resolveModal, setResolveModal] = useState(null)
  const [resolveNotes, setResolveNotes] = useState('')

  const isManager = user?.role === 'admin' || user?.role === 'asset_manager'

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [mainRes, assetsRes, empRes] = await Promise.all([
        api.get('/maintenance?page_size=100'),
        api.get('/assets?page_size=100'),
        api.get('/employees?page_size=100').catch(() => ({ data: { items: [] } })),
      ])
      setMaintenanceItems(mainRes.data.items)
      setAssets(assetsRes.data.items)
      setAssetMap(Object.fromEntries(assetsRes.data.items.map(a => [a.id, a])))
      setEmployees(empRes.data.items || [])
    } catch {
      toast.error('Failed to load maintenance data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const setLoad = (key, val) => setActionLoading(prev => ({ ...prev, [key]: val }))

  const handleApprove = async (item) => {
    setLoad(item.id, true)
    try {
      await api.patch(`/maintenance/${item.id}/approve`)
      toast.success('Maintenance request approved')
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to approve')
    } finally {
      setLoad(item.id, false)
    }
  }

  const handleReject = async (item) => {
    setLoad(item.id + '_rej', true)
    try {
      await api.patch(`/maintenance/${item.id}/reject`)
      toast.success('Maintenance request rejected')
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to reject')
    } finally {
      setLoad(item.id + '_rej', false)
    }
  }

  const handleAssign = async () => {
    if (!selectedTech) { toast.error('Select a technician'); return }
    setLoad(assignModal.id + '_asgn', true)
    try {
      await api.patch(`/maintenance/${assignModal.id}/assign`, { technician_id: selectedTech })
      toast.success('Technician assigned')
      setAssignModal(null)
      setSelectedTech('')
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to assign technician')
    } finally {
      setLoad(assignModal.id + '_asgn', false)
    }
  }

  const handleStart = async (item) => {
    setLoad(item.id + '_start', true)
    try {
      await api.patch(`/maintenance/${item.id}/start`)
      toast.success('Maintenance started')
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to start')
    } finally {
      setLoad(item.id + '_start', false)
    }
  }

  const handleResolve = async () => {
    if (!resolveNotes.trim()) { toast.error('Resolution notes are required'); return }
    setLoad(resolveModal.id + '_res', true)
    try {
      await api.patch(`/maintenance/${resolveModal.id}/resolve`, { resolution_notes: resolveNotes })
      toast.success('Maintenance resolved — asset returned to Available')
      setResolveModal(null)
      setResolveNotes('')
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to resolve')
    } finally {
      setLoad(resolveModal.id + '_res', false)
    }
  }

  const handleAddMaintenance = async (data) => {
    try {
      await api.post('/maintenance', {
        asset_id: data.asset_id,
        description: data.description,
        priority: data.priority,
      })
      toast.success('Maintenance request created!')
      setShowModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create request')
    }
  }

  const getItemsByStatus = (key) => maintenanceItems.filter(i => i.status === key)

  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] sm:text-[38px] font-black text-foreground tracking-tight">Maintenance Management</h1>
          <p className="text-text-secondary mt-1">Kanban board for maintenance workflow</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center justify-center gap-2">
          <Plus size={20} />
          New Request
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 pb-8">
          {COLUMNS.map(col => (
            <div key={col.key} className="bg-bg-secondary/30 rounded-xl p-4 border border-border-color min-h-[400px]">
              <h3 className="font-semibold text-foreground mb-4 text-sm flex items-center gap-2">
                <span className="w-5 h-5 bg-primary/20 text-primary text-xs rounded flex items-center justify-center font-bold">
                  {getItemsByStatus(col.key).length}
                </span>
                {col.label}
              </h3>
              <div className="space-y-3">
                {getItemsByStatus(col.key).map(item => {
                  const assetName = assetMap[item.asset_id]?.name || 'Unknown Asset'
                  const shortId = `MF-${item.id.slice(-4).toUpperCase()}`
                  return (
                    <div key={item.id} className="bg-bg-tertiary border border-border-color rounded-lg p-3 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-200">
                      <div className="flex gap-2 mb-2">
                        <GripVertical size={14} className="text-text-secondary/30 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs text-foreground">{shortId}</p>
                          <p className="text-xs text-text-secondary mt-0.5 truncate">{assetName}</p>
                          {item.description && (
                            <p className="text-xs text-text-secondary/60 mt-1 line-clamp-2">{item.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          item.priority === 'critical' ? 'bg-danger/10 text-danger' :
                          item.priority === 'high' ? 'bg-warning/10 text-warning' :
                          'bg-primary/10 text-primary'
                        }`}>
                          {formatStatus(item.priority)}
                        </span>
                      </div>

                      {/* Workflow Actions for Managers */}
                      {isManager && item.status !== 'resolved' && item.status !== 'rejected' && (
                        <div className="pt-2 border-t border-border-color/50 space-y-1.5">
                          {item.status === 'pending' && (
                            <div className="flex gap-1">
                              <button
                                disabled={actionLoading[item.id]}
                                onClick={() => handleApprove(item)}
                                className="flex-1 flex items-center justify-center gap-1 py-1 text-xs bg-success/10 hover:bg-success/20 text-success rounded transition-colors"
                              >
                                {actionLoading[item.id] ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
                                Approve
                              </button>
                              <button
                                disabled={actionLoading[item.id + '_rej']}
                                onClick={() => handleReject(item)}
                                className="flex-1 flex items-center justify-center gap-1 py-1 text-xs bg-danger/10 hover:bg-danger/20 text-danger rounded transition-colors"
                              >
                                {actionLoading[item.id + '_rej'] ? <Loader2 size={10} className="animate-spin" /> : <X size={10} />}
                                Reject
                              </button>
                            </div>
                          )}
                          {item.status === 'approved' && (
                            <button
                              onClick={() => { setAssignModal(item); setSelectedTech(employees[0]?.id || '') }}
                              className="w-full flex items-center justify-center gap-1 py-1 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded transition-colors"
                            >
                              <UserCog size={10} />
                              Assign Technician
                            </button>
                          )}
                          {item.status === 'assigned' && (
                            <button
                              disabled={actionLoading[item.id + '_start']}
                              onClick={() => handleStart(item)}
                              className="w-full flex items-center justify-center gap-1 py-1 text-xs bg-warning/10 hover:bg-warning/20 text-warning rounded transition-colors"
                            >
                              {actionLoading[item.id + '_start'] ? <Loader2 size={10} className="animate-spin" /> : <Play size={10} />}
                              Start Work
                            </button>
                          )}
                          {item.status === 'in_progress' && (
                            <button
                              onClick={() => { setResolveModal(item); setResolveNotes('') }}
                              className="w-full flex items-center justify-center gap-1 py-1 text-xs bg-success/10 hover:bg-success/20 text-success rounded transition-colors"
                            >
                              <ClipboardCheck size={10} />
                              Mark Resolved
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
                {getItemsByStatus(col.key).length === 0 && (
                  <div className="text-center py-8 text-text-secondary/40">
                    <Wrench size={22} className="mx-auto mb-2" />
                    <p className="text-xs">No items</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Technician Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-bg-secondary border border-border-color rounded-2xl max-w-sm w-full shadow-2xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-1">Assign Technician</h3>
            <p className="text-sm text-text-secondary mb-4">
              For: <span className="font-semibold text-foreground">{assetMap[assignModal.asset_id]?.name}</span>
            </p>
            <select
              className="input-base mb-4"
              value={selectedTech}
              onChange={e => setSelectedTech(e.target.value)}
            >
              <option value="">Select technician...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name} ({formatStatus(emp.role)})
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setAssignModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button
                disabled={actionLoading[assignModal.id + '_asgn']}
                onClick={handleAssign}
                className="btn-primary flex-1"
              >
                {actionLoading[assignModal.id + '_asgn'] ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {resolveModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-bg-secondary border border-border-color rounded-2xl max-w-sm w-full shadow-2xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-1">Resolve Maintenance</h3>
            <p className="text-sm text-text-secondary mb-4">
              For: <span className="font-semibold text-foreground">{assetMap[resolveModal.asset_id]?.name}</span>
            </p>
            <textarea
              className="input-base resize-none mb-4"
              rows={4}
              placeholder="Describe the resolution — what was done to fix the issue..."
              value={resolveNotes}
              onChange={e => setResolveNotes(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={() => setResolveModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button
                disabled={actionLoading[resolveModal.id + '_res']}
                onClick={handleResolve}
                className="btn-primary flex-1"
              >
                {actionLoading[resolveModal.id + '_res'] ? 'Resolving...' : 'Mark Resolved'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <MaintenanceModal assets={assets} onClose={() => setShowModal(false)} onSubmit={handleAddMaintenance} />
      )}
    </MainLayout>
  )
}
