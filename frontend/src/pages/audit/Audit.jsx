import React, { useState, useEffect, useCallback } from 'react'
import MainLayout from '../../components/layout/MainLayout'
import { FileText, Plus, AlertCircle, CheckCircle, Loader2, X, UserPlus } from 'lucide-react'
import { getStatusColor, formatStatus, formatDate } from '../../utils/helpers'
import { toast } from 'sonner'
import api from '../../api'
import { useAuth } from '../../context/AuthContext'

const ITEM_ACTIONS = [
  { key: 'verified', label: 'Verified', cls: 'bg-success/10 hover:bg-success/20 text-success' },
  { key: 'missing', label: 'Missing', cls: 'bg-danger/10 hover:bg-danger/20 text-danger' },
  { key: 'damaged', label: 'Damaged', cls: 'bg-warning/10 hover:bg-warning/20 text-warning' },
]

export default function Audit() {
  const { user } = useAuth()
  const [auditCycles, setAuditCycles] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedAudit, setExpandedAudit] = useState(null)
  const [reports, setReports] = useState({})
  const [auditItems, setAuditItems] = useState({})
  const [loadingReport, setLoadingReport] = useState(null)
  const [itemLoading, setItemLoading] = useState({})
  const [showNewAudit, setShowNewAudit] = useState(false)
  const [newAuditForm, setNewAuditForm] = useState({ name: '', start_date: '', end_date: '' })
  const [creating, setCreating] = useState(false)
  const [assignModal, setAssignModal] = useState(null)
  const [auditorId, setAuditorId] = useState('')
  const [employees, setEmployees] = useState([])
  const [assigning, setAssigning] = useState(false)
  const [assets, setAssets] = useState({})

  const isAdmin = user?.role === 'admin'

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [cyclesRes, empRes, assetsRes] = await Promise.all([
        api.get('/audits?page_size=100'),
        api.get('/employees?page_size=100').catch(() => ({ data: { items: [] } })),
        api.get('/assets?page_size=100').catch(() => ({ data: { items: [] } })),
      ])
      setAuditCycles(cyclesRes.data.items)
      setEmployees(empRes.data.items || [])
      setAssets(Object.fromEntries((assetsRes.data.items || []).map(a => [a.id, a])))
    } catch {
      toast.error('Failed to load audit cycles')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleExpand = async (cycleId) => {
    if (expandedAudit === cycleId) {
      setExpandedAudit(null)
      return
    }
    setExpandedAudit(cycleId)
    // Fetch report and items in parallel if not already loaded
    if (!reports[cycleId] || !auditItems[cycleId]) {
      setLoadingReport(cycleId)
      try {
        const [reportRes, itemsRes] = await Promise.all([
          api.post(`/audits/${cycleId}/report`).catch(() => null),
          api.get(`/audits/${cycleId}/items`).catch(() => null),
        ])
        if (reportRes) setReports(prev => ({ ...prev, [cycleId]: reportRes.data }))
        if (itemsRes) setAuditItems(prev => ({ ...prev, [cycleId]: itemsRes.data }))
      } finally {
        setLoadingReport(null)
      }
    }
  }

  const handleUpdateItem = async (cycleId, itemId, status) => {
    setItemLoading(prev => ({ ...prev, [itemId]: true }))
    try {
      await api.patch(`/audits/${cycleId}/items/${itemId}`, { status })
      toast.success(`Item marked as ${formatStatus(status)}`)
      // Refresh items and report for this cycle
      const [reportRes, itemsRes] = await Promise.all([
        api.post(`/audits/${cycleId}/report`).catch(() => null),
        api.get(`/audits/${cycleId}/items`).catch(() => null),
      ])
      if (reportRes) setReports(prev => ({ ...prev, [cycleId]: reportRes.data }))
      if (itemsRes) setAuditItems(prev => ({ ...prev, [cycleId]: itemsRes.data }))
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update audit item')
    } finally {
      setItemLoading(prev => ({ ...prev, [itemId]: false }))
    }
  }

  const handleCloseAudit = async (cycleId, name) => {
    try {
      await api.patch(`/audits/${cycleId}/close`)
      toast.success(`Audit "${name}" closed — discrepancies locked in`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to close audit')
    }
  }

  const handleCreateAudit = async (e) => {
    e.preventDefault()
    if (!newAuditForm.name.trim() || !newAuditForm.start_date || !newAuditForm.end_date) {
      toast.error('Name, start date and end date are required')
      return
    }
    setCreating(true)
    try {
      await api.post('/audits', {
        name: newAuditForm.name.trim(),
        start_date: newAuditForm.start_date,
        end_date: newAuditForm.end_date,
      })
      toast.success(`Audit cycle "${newAuditForm.name}" started!`)
      setShowNewAudit(false)
      setNewAuditForm({ name: '', start_date: '', end_date: '' })
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to start audit')
    } finally {
      setCreating(false)
    }
  }

  const handleAssignAuditor = async () => {
    if (!auditorId) { toast.error('Select an auditor'); return }
    setAssigning(true)
    try {
      await api.post(`/audits/${assignModal}/auditors`, { auditor_id: auditorId })
      toast.success('Auditor assigned to cycle')
      setAssignModal(null)
      setAuditorId('')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to assign auditor')
    } finally {
      setAssigning(false)
    }
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] sm:text-[38px] font-black text-foreground tracking-tight">Asset Audit</h1>
          <p className="text-text-secondary mt-1">Audit cycles and discrepancy reports</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowNewAudit(true)} className="btn-primary flex items-center justify-center gap-2">
            <Plus size={20} />
            Start New Audit
          </button>
        )}
      </div>

      {/* New Audit Modal */}
      {showNewAudit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-bg-secondary border border-border-color rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border-color">
              <h2 className="text-xl font-bold text-foreground">Start New Audit Cycle</h2>
              <button onClick={() => setShowNewAudit(false)} className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateAudit} className="p-6 space-y-5">
              <div>
                <label className="label-base">Audit Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Q3 2026 — Engineering Department"
                  value={newAuditForm.name}
                  onChange={e => setNewAuditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="input-base"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-base">Start Date *</label>
                  <input
                    type="date"
                    value={newAuditForm.start_date}
                    onChange={e => setNewAuditForm(prev => ({ ...prev, start_date: e.target.value }))}
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="label-base">End Date *</label>
                  <input
                    type="date"
                    value={newAuditForm.end_date}
                    onChange={e => setNewAuditForm(prev => ({ ...prev, end_date: e.target.value }))}
                    className="input-base"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowNewAudit(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={creating} className="btn-primary flex-1">
                  {creating ? 'Creating...' : 'Start Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Auditor Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-bg-secondary border border-border-color rounded-2xl max-w-sm w-full shadow-2xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Assign Auditor</h3>
            <select
              className="input-base mb-4"
              value={auditorId}
              onChange={e => setAuditorId(e.target.value)}
            >
              <option value="">Select auditor...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({formatStatus(emp.role)})</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setAssignModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button disabled={assigning} onClick={handleAssignAuditor} className="btn-primary flex-1">
                {assigning ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audits List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : auditCycles.length === 0 ? (
        <div className="card text-center py-12">
          <FileText size={48} className="mx-auto text-text-secondary/30 mb-4" />
          <p className="text-text-secondary">No audit cycles yet. {isAdmin ? 'Start one with the button above.' : 'Contact your admin to start an audit.'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {auditCycles.map(audit => {
            const report = reports[audit.id]
            const items = auditItems[audit.id] || []
            const discrepancies = report ? report.missing + report.damaged : 0

            return (
              <div key={audit.id} className="card">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => handleExpand(audit.id)}
                    className="flex-1 text-left flex items-center gap-3 flex-wrap"
                  >
                    <h3 className="font-semibold text-foreground">{audit.name}</h3>
                    <span className={`text-xs px-2.5 py-1 rounded-full ${getStatusColor(audit.status)}`}>
                      {formatStatus(audit.status)}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {formatDate(audit.start_date)} – {formatDate(audit.end_date)}
                    </span>
                  </button>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {isAdmin && audit.status !== 'closed' && (
                      <button
                        onClick={() => { setAssignModal(audit.id); setAuditorId(employees[0]?.id || '') }}
                        className="p-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
                        title="Assign auditor"
                      >
                        <UserPlus size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleExpand(audit.id)}
                      className="text-text-secondary text-sm"
                    >
                      {expandedAudit === audit.id ? '▼' : '▶'}
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedAudit === audit.id && (
                  <div className="space-y-4 mt-4 border-t border-border-color pt-4">
                    {loadingReport === audit.id ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 size={24} className="animate-spin text-primary" />
                      </div>
                    ) : (
                      <>
                        {/* Summary */}
                        {report && (
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-border-color">
                                  <th className="text-left text-sm font-semibold text-text-secondary py-2">Total Assets</th>
                                  <th className="text-left text-sm font-semibold text-text-secondary py-2">Verified</th>
                                  <th className="text-left text-sm font-semibold text-text-secondary py-2">Pending</th>
                                  <th className="text-left text-sm font-semibold text-text-secondary py-2">Missing</th>
                                  <th className="text-left text-sm font-semibold text-text-secondary py-2">Damaged</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="py-2 font-bold text-foreground">{report.total_assets}</td>
                                  <td className="py-2">
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/30">{report.verified}</span>
                                  </td>
                                  <td className="py-2">
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/30">{report.pending}</span>
                                  </td>
                                  <td className="py-2">
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-danger/10 text-danger border border-danger/30">{report.missing}</span>
                                  </td>
                                  <td className="py-2">
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/30">{report.damaged}</span>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Discrepancy Alert */}
                        {discrepancies > 0 && (
                          <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
                            <p className="font-semibold text-warning flex items-center gap-2 text-sm">
                              <AlertCircle size={16} />
                              {discrepancies} discrepanc{discrepancies > 1 ? 'ies' : 'y'} detected
                            </p>
                            <div className="mt-1 space-y-0.5">
                              {report.missing > 0 && <p className="text-xs text-warning/80">• {report.missing} asset(s) missing (High)</p>}
                              {report.damaged > 0 && <p className="text-xs text-warning/80">• {report.damaged} asset(s) damaged (Medium)</p>}
                            </div>
                          </div>
                        )}
                        {report && discrepancies === 0 && report.total_assets > 0 && report.pending === 0 && (
                          <div className="card bg-success/5 border border-success/30">
                            <p className="text-success text-sm flex items-center gap-2">
                              <CheckCircle size={16} />
                              All assets accounted for — no discrepancies
                            </p>
                          </div>
                        )}

                        {/* Audit Items Table */}
                        {items.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-2">Asset Verification ({items.length} items)</h4>
                            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                              {items.map(item => {
                                const asset = assets[item.asset_id]
                                return (
                                  <div key={item.id} className="flex items-center justify-between gap-3 bg-bg-tertiary/50 rounded-lg p-3">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-foreground truncate">
                                        {asset?.name || item.asset_id}
                                      </p>
                                      {asset && <p className="text-xs text-text-secondary">{asset.asset_tag} • {asset.location || 'No location'}</p>}
                                      {item.notes && <p className="text-xs text-text-secondary/70 mt-0.5 truncate">{item.notes}</p>}
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
                                        {formatStatus(item.status)}
                                      </span>
                                      {audit.status !== 'closed' && (
                                        <div className="flex gap-1">
                                          {ITEM_ACTIONS.map(action => (
                                            <button
                                              key={action.key}
                                              disabled={itemLoading[item.id] || item.status === action.key}
                                              onClick={() => handleUpdateItem(audit.id, item.id, action.key)}
                                              className={`text-xs px-2 py-1 rounded transition-colors ${action.cls} ${item.status === action.key ? 'opacity-50 cursor-default' : ''}`}
                                              title={`Mark as ${action.label}`}
                                            >
                                              {itemLoading[item.id] ? <Loader2 size={10} className="animate-spin" /> : action.label}
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                        {items.length === 0 && !loadingReport && (
                          <p className="text-text-secondary text-sm text-center py-4">No audit items — assets will appear here once the audit scope is configured.</p>
                        )}

                        {/* Action Buttons */}
                        {audit.status !== 'closed' && isAdmin && (
                          <div className="flex gap-3 pt-2">
                            <button
                              onClick={() => handleCloseAudit(audit.id, audit.name)}
                              className="btn-primary flex-1"
                            >
                              Close Audit Cycle
                            </button>
                          </div>
                        )}
                        {audit.status === 'closed' && (
                          <p className="text-sm text-text-secondary pt-2">This audit cycle is closed — findings are locked.</p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="card mt-6 bg-success/5 border border-success/30">
        <p className="text-success text-sm flex items-center gap-2">
          <CheckCircle size={18} />
          Discrepancy reports are auto-generated when a cycle is expanded or closed
        </p>
      </div>
    </MainLayout>
  )
}
