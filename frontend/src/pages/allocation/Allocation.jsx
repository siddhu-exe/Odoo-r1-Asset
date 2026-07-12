import React, { useState, useEffect, useCallback } from 'react'
import MainLayout from '../../components/layout/MainLayout'
import { Plus, ArrowRight, AlertCircle, Check, X, Loader2, RotateCcw, Clock } from 'lucide-react'
import { getStatusColor, formatDate, formatStatus } from '../../utils/helpers'
import { toast } from 'sonner'
import AllocationModal from './AllocationModal'
import api from '../../api'
import { useAuth } from '../../context/AuthContext'

export default function Allocation() {
  const { user } = useAuth()
  const [assets, setAssets] = useState([])
  const [employees, setEmployees] = useState({})
  const [employeeList, setEmployeeList] = useState([])
  const [allocations, setAllocations] = useState([])
  const [transfers, setTransfers] = useState([])
  const [overdue, setOverdue] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState({})
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showAllocateModal, setShowAllocateModal] = useState(false)
  const [allocateForm, setAllocateForm] = useState({ asset_id: '', employee_id: '', expected_return_date: '' })
  const [allocating, setAllocating] = useState(false)
  const [returnModal, setReturnModal] = useState(null)
  const [returnForm, setReturnForm] = useState({ condition_on_return: 'good', return_notes: '' })
  const [returning, setReturning] = useState(false)

  const isManager = user?.role === 'admin' || user?.role === 'asset_manager' || user?.role === 'department_head'
  const isAllocator = user?.role === 'admin' || user?.role === 'asset_manager'

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [assetsRes, employeesRes, allocationsRes, transfersRes, overdueRes] = await Promise.all([
        api.get('/assets?page_size=100'),
        api.get('/employees?page_size=100').catch(() => ({ data: { items: [] } })),
        api.get('/allocations?page_size=100'),
        api.get('/allocations/transfers').catch(() => ({ data: [] })),
        api.get('/allocations/overdue').catch(() => ({ data: [] })),
      ])
      setAssets(assetsRes.data.items)
      const empMap = Object.fromEntries(employeesRes.data.items.map(e => [e.id, e]))
      setEmployees(empMap)
      setEmployeeList(employeesRes.data.items)
      setAllocations(allocationsRes.data.items)
      setTransfers(Array.isArray(transfersRes.data) ? transfersRes.data : [])
      setOverdue(Array.isArray(overdueRes.data) ? overdueRes.data : [])
    } catch {
      toast.error('Failed to load allocation data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const setLoad = (key, val) => setActionLoading(prev => ({ ...prev, [key]: val }))

  const handleTransfer = async (assetId, toEmployeeId, reason) => {
    try {
      await api.post('/allocations/transfers', { asset_id: assetId, to_employee_id: toEmployeeId, reason })
      toast.success('Transfer request submitted for approval')
      setShowTransferModal(false)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit transfer request')
    }
  }

  const handleAllocate = async (e) => {
    e.preventDefault()
    if (!allocateForm.asset_id || !allocateForm.employee_id) {
      toast.error('Asset and employee are required')
      return
    }
    setAllocating(true)
    try {
      const payload = { asset_id: allocateForm.asset_id, employee_id: allocateForm.employee_id }
      if (allocateForm.expected_return_date) payload.expected_return_date = allocateForm.expected_return_date
      await api.post('/allocations', payload)
      toast.success('Asset allocated successfully!')
      setShowAllocateModal(false)
      setAllocateForm({ asset_id: '', employee_id: '', expected_return_date: '' })
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to allocate asset')
    } finally {
      setAllocating(false)
    }
  }

  const handleApproveTransfer = async (transfer) => {
    setLoad(transfer.id + '_ap', true)
    try {
      await api.patch(`/allocations/transfers/${transfer.id}/approve`)
      toast.success('Transfer approved — asset reallocated')
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to approve transfer')
    } finally {
      setLoad(transfer.id + '_ap', false)
    }
  }

  const handleRejectTransfer = async (transfer) => {
    setLoad(transfer.id + '_rej', true)
    try {
      await api.patch(`/allocations/transfers/${transfer.id}/reject`, { rejection_notes: 'Rejected by manager' })
      toast.success('Transfer request rejected')
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to reject transfer')
    } finally {
      setLoad(transfer.id + '_rej', false)
    }
  }

  const handleReturn = async () => {
    if (!returnForm.condition_on_return) { toast.error('Condition is required'); return }
    setReturning(true)
    try {
      await api.post(`/allocations/${returnModal.id}/return`, {
        condition_on_return: returnForm.condition_on_return,
        return_notes: returnForm.return_notes || undefined,
      })
      toast.success('Asset returned — status set to Available')
      setReturnModal(null)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to process return')
    } finally {
      setReturning(false)
    }
  }

  const activeAllocationByAsset = Object.fromEntries(
    allocations.filter(a => a.status === 'active').map(a => [a.asset_id, a])
  )
  const allocatedAssets = assets.filter(a => a.status === 'allocated')
  const availableAssets = assets.filter(a => a.status === 'available')
  const pendingTransfers = transfers.filter(t => t.status === 'pending')

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] sm:text-[38px] font-black text-foreground tracking-tight">Allocation & Transfer</h1>
          <p className="text-text-secondary mt-1">Manage asset allocation and transfers between employees</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {isAllocator && (
            <button
              onClick={() => {
                setAllocateForm({ asset_id: availableAssets[0]?.id || '', employee_id: employeeList[0]?.id || '', expected_return_date: '' })
                setShowAllocateModal(true)
              }}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Allocate Asset
            </button>
          )}
          <button onClick={() => setShowTransferModal(true)} className="btn-primary flex items-center justify-center gap-2">
            <ArrowRight size={18} />
            Request Transfer
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <p className="text-text-secondary text-sm mb-1">Allocated</p>
          <p className="text-3xl font-bold text-primary">{allocatedAssets.length}</p>
          <p className="text-xs text-text-secondary mt-1">Assets in use</p>
        </div>
        <div className="card">
          <p className="text-text-secondary text-sm mb-1">Available</p>
          <p className="text-3xl font-bold text-success">{availableAssets.length}</p>
          <p className="text-xs text-text-secondary mt-1">Ready to allocate</p>
        </div>
        <div className="card">
          <p className="text-text-secondary text-sm mb-1">Pending Transfers</p>
          <p className="text-3xl font-bold text-warning">{pendingTransfers.length}</p>
          <p className="text-xs text-text-secondary mt-1">Awaiting approval</p>
        </div>
        <div className="card">
          <p className="text-text-secondary text-sm mb-1">Overdue Returns</p>
          <p className="text-3xl font-bold text-danger">{overdue.length}</p>
          <p className="text-xs text-text-secondary mt-1">Past return date</p>
        </div>
      </div>

      {/* Overdue Alert */}
      {overdue.length > 0 && (
        <div className="card bg-danger/5 border border-danger/30 mb-6 flex items-start gap-3">
          <Clock size={20} className="text-danger flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground">{overdue.length} overdue return{overdue.length > 1 ? 's' : ''} detected</p>
            <p className="text-sm text-danger/80 mt-1">
              These allocations have passed their expected return date. Follow up with the asset holders.
            </p>
          </div>
        </div>
      )}

      {/* Double Allocation Info */}
      <div className="card bg-primary/5 border border-primary/30 mb-6 flex items-start gap-3">
        <AlertCircle size={20} className="text-primary flex-shrink-0 mt-0.5" />
        <p className="text-sm text-foreground">
          Double allocation is blocked — if an asset is already allocated, use <strong>Request Transfer</strong> instead.
          {isAllocator && ' Use '}
          {isAllocator && <strong>Allocate Asset</strong>}
          {isAllocator && ' to assign available assets directly.'}
        </p>
      </div>

      {/* Currently Allocated */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Currently Allocated Assets</h2>
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          ) : allocatedAssets.length === 0 ? (
            <p className="text-text-secondary text-sm py-4">No assets currently allocated</p>
          ) : (
            allocatedAssets.map(asset => {
              const allocation = activeAllocationByAsset[asset.id]
              const employee = allocation?.employee_id ? employees[allocation.employee_id] : null
              const isOverdue = overdue.some(o => o.asset_id === asset.id)
              return (
                <div key={asset.id} className={`card flex items-center justify-between gap-4 ${isOverdue ? 'border-danger/40 bg-danger/5' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{asset.name}</h3>
                      {isOverdue && (
                        <span className="text-xs bg-danger/10 text-danger px-2 py-0.5 rounded-full">Overdue</span>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary mt-0.5">
                      {asset.asset_tag}
                      {employee && ` • ${employee.first_name} ${employee.last_name}`}
                      {allocation?.expected_return_date && ` • Return: ${formatDate(allocation.expected_return_date)}`}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {isAllocator && allocation && (
                      <button
                        onClick={() => {
                          setReturnModal(allocation)
                          setReturnForm({ condition_on_return: 'good', return_notes: '' })
                        }}
                        className="px-3 py-1.5 bg-success/10 hover:bg-success/20 text-success border border-success/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                      >
                        <RotateCcw size={14} />
                        Return
                      </button>
                    )}
                    <button
                      onClick={() => setShowTransferModal(true)}
                      className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                    >
                      <ArrowRight size={14} />
                      Transfer
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Transfer Requests */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Transfer Requests</h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        ) : transfers.length === 0 ? (
          <p className="text-text-secondary text-sm py-4">No transfer requests</p>
        ) : (
          <div className="space-y-3">
            {[...transfers].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(transfer => {
              const asset = assets.find(a => a.id === transfer.asset_id)
              const fromEmp = employees[transfer.from_employee_id]
              const toEmp = employees[transfer.to_employee_id]
              return (
                <div key={transfer.id} className="card flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{asset?.name || '—'}</h3>
                    <p className="text-sm text-text-secondary mt-0.5">
                      {fromEmp ? `${fromEmp.first_name} ${fromEmp.last_name}` : '—'}
                      {' → '}
                      {toEmp ? `${toEmp.first_name} ${toEmp.last_name}` : '—'}
                      {transfer.reason && ` • ${transfer.reason}`}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">{formatDate(transfer.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${getStatusColor(transfer.status)}`}>
                      {formatStatus(transfer.status)}
                    </span>
                    {isManager && transfer.status === 'pending' && (
                      <>
                        <button
                          disabled={actionLoading[transfer.id + '_ap']}
                          onClick={() => handleApproveTransfer(transfer)}
                          className="p-1.5 bg-success/10 hover:bg-success/20 text-success border border-success/30 rounded-lg transition-colors"
                          title="Approve transfer"
                        >
                          {actionLoading[transfer.id + '_ap'] ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        </button>
                        <button
                          disabled={actionLoading[transfer.id + '_rej']}
                          onClick={() => handleRejectTransfer(transfer)}
                          className="p-1.5 bg-danger/10 hover:bg-danger/20 text-danger border border-danger/30 rounded-lg transition-colors"
                          title="Reject transfer"
                        >
                          {actionLoading[transfer.id + '_rej'] ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                        </button>
                      </>
                    )}
                    {transfer.rejection_notes && (
                      <span className="text-xs text-text-secondary hidden lg:block max-w-[120px] truncate" title={transfer.rejection_notes}>
                        {transfer.rejection_notes}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Allocation History */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Allocation History</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-color">
                <th className="text-left text-sm font-semibold text-text-secondary py-3">Date</th>
                <th className="text-left text-sm font-semibold text-text-secondary py-3">Asset</th>
                <th className="text-left text-sm font-semibold text-text-secondary py-3">Employee</th>
                <th className="text-left text-sm font-semibold text-text-secondary py-3">Expected Return</th>
                <th className="text-left text-sm font-semibold text-text-secondary py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {[...allocations]
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .map(record => {
                  const asset = assets.find(a => a.id === record.asset_id)
                  const employee = record.employee_id ? employees[record.employee_id] : null
                  return (
                    <tr key={record.id} className="border-b border-border-color hover:bg-bg-tertiary/30 transition-colors">
                      <td className="py-3 text-sm text-foreground">{formatDate(record.created_at)}</td>
                      <td className="py-3 font-semibold text-foreground">{asset?.name || record.asset_id}</td>
                      <td className="py-3 text-sm text-text-secondary">
                        {employee ? `${employee.first_name} ${employee.last_name}` : '—'}
                      </td>
                      <td className="py-3 text-sm text-text-secondary">
                        {record.expected_return_date ? formatDate(record.expected_return_date) : '—'}
                      </td>
                      <td className="py-3">
                        <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(record.status)}`}>
                          {formatStatus(record.status)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              {!loading && allocations.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-text-secondary text-sm">No allocation history found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer Request Modal */}
      {showTransferModal && (
        <AllocationModal
          onClose={() => setShowTransferModal(false)}
          onSubmit={handleTransfer}
          assets={allocatedAssets}
          employees={Object.values(employees)}
        />
      )}

      {/* Direct Allocate Modal */}
      {showAllocateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-bg-secondary border border-border-color rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border-color">
              <h2 className="text-xl font-bold text-foreground">Allocate Asset</h2>
              <button onClick={() => setShowAllocateModal(false)} className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAllocate} className="p-6 space-y-4">
              <div>
                <label className="label-base">Asset (Available) *</label>
                {availableAssets.length === 0 ? (
                  <p className="text-sm text-danger mt-1">No available assets to allocate.</p>
                ) : (
                  <select
                    className="input-base"
                    value={allocateForm.asset_id}
                    onChange={e => setAllocateForm(p => ({ ...p, asset_id: e.target.value }))}
                  >
                    <option value="">Select asset...</option>
                    {availableAssets.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.asset_tag})</option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="label-base">Employee *</label>
                <select
                  className="input-base"
                  value={allocateForm.employee_id}
                  onChange={e => setAllocateForm(p => ({ ...p, employee_id: e.target.value }))}
                >
                  <option value="">Select employee...</option>
                  {employeeList.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-base">Expected Return Date</label>
                <input
                  type="date"
                  className="input-base"
                  value={allocateForm.expected_return_date}
                  onChange={e => setAllocateForm(p => ({ ...p, expected_return_date: e.target.value }))}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAllocateModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={allocating || availableAssets.length === 0} className="btn-primary flex-1">
                  {allocating ? 'Allocating...' : 'Allocate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {returnModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-bg-secondary border border-border-color rounded-2xl max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border-color">
              <h2 className="text-xl font-bold text-foreground">Return Asset</h2>
              <button onClick={() => setReturnModal(null)} className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label-base">Condition on Return *</label>
                <select
                  className="input-base"
                  value={returnForm.condition_on_return}
                  onChange={e => setReturnForm(p => ({ ...p, condition_on_return: e.target.value }))}
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
              <div>
                <label className="label-base">Return Notes</label>
                <textarea
                  className="input-base resize-none"
                  rows={3}
                  placeholder="Any notes about the returned asset condition..."
                  value={returnForm.return_notes}
                  onChange={e => setReturnForm(p => ({ ...p, return_notes: e.target.value }))}
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setReturnModal(null)} className="btn-secondary flex-1">Cancel</button>
                <button disabled={returning} onClick={handleReturn} className="btn-primary flex-1">
                  {returning ? 'Processing...' : 'Confirm Return'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}
