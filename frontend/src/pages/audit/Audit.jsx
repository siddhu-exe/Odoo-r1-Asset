import React, { useState, useEffect, useCallback } from 'react'
import MainLayout from '../../components/layout/MainLayout'
import { FileText, Plus, AlertCircle, CheckCircle, Loader2, X, UserPlus, Calendar, ChevronUp, ChevronDown } from 'lucide-react'
import { getStatusColor, formatStatus, formatDate } from '../../utils/helpers'
import { toast } from 'sonner'
import api from '../../api'
import { useAuth } from '../../context/AuthContext'

const ITEM_ACTIONS = [
  { key: 'verified', label: 'Verified', cls: 'bg-success/10 hover:bg-success/20 text-success' },
  { key: 'missing', label: 'Missing', cls: 'bg-danger/10 hover:bg-danger/20 text-danger' },
  { key: 'damaged', label: 'Damaged', cls: 'bg-chart-6/10 hover:bg-chart-6/20 text-chart-6' },
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
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-chart-4/10 flex items-center justify-center">
            <FileText size={24} className="text-chart-4" />
          </div>
          <p className="text-text-secondary">No audit cycles yet. {isAdmin ? 'Start one with the button above.' : 'Contact your admin to start an audit.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {auditCycles.map(audit => {
            const report = reports[audit.id]
            const items = auditItems[audit.id] || []
            const discrepancies = report ? report.missing + report.damaged : 0
            const isExpanded = expandedAudit === audit.id

            return (
              <div key={audit.id} className={`card flex flex-col transition-all duration-300 ${isExpanded ? 'lg:col-span-2' : ''}`}>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 cursor-pointer" onClick={() => handleExpand(audit.id)}>
                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                      <h3 className="font-semibold text-lg text-foreground">{audit.name}</h3>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${getStatusColor(audit.status).replace('bg-', 'bg-').replace('text-', 'text-').concat(' border-').concat(getStatusColor(audit.status).split(' ')[0].replace('bg-', ''))} bg-transparent`}>
                        {formatStatus(audit.status)}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary flex items-center gap-2">
                      <Calendar size={14} className="opacity-70" />
                      {formatDate(audit.start_date)} – {formatDate(audit.end_date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    {isAdmin && audit.status !== 'closed' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setAssignModal(audit.id); setAuditorId(employees[0]?.id || '') }}
                        className="p-2 bg-bg-tertiary hover:bg-bg-secondary text-text-secondary hover:text-foreground rounded-lg transition-colors border border-border-color"
                        title="Assign auditor"
                      >
                        <UserPlus size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleExpand(audit.id)}
                      className="p-2 bg-bg-tertiary hover:bg-bg-secondary text-text-secondary hover:text-foreground rounded-lg transition-colors border border-border-color"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedAudit === audit.id && (
                  <div className="space-y-4 mt-4 border-t border-border-color pt-6">
                    {loadingReport === audit.id ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 size={24} className="animate-spin text-primary" />
                      </div>
                    ) : (
                      <>
                        {/* 1. Header Box */}
                        <div className="bg-bg-secondary border border-border-color rounded-xl p-4">
                          <h3 className="font-semibold text-foreground">{audit.name} — {formatDate(audit.start_date)} to {formatDate(audit.end_date)}</h3>
                          <p className="text-sm text-text-secondary mt-1">Auditors: System Admin</p>
                        </div>

                        {/* 2. Audit Items Table */}
                        {items.length > 0 ? (
                          <div className="border border-border-color rounded-xl overflow-hidden">
                            <table className="w-full text-left border-collapse">
                              <thead className="bg-bg-secondary border-b border-border-color">
                                <tr>
                                  <th className="py-3 px-4 font-semibold text-text-secondary text-sm">Asset</th>
                                  <th className="py-3 px-4 font-semibold text-text-secondary text-sm text-center">Expected location</th>
                                  <th className="py-3 px-4 font-semibold text-text-secondary text-sm text-right">Verification</th>
                                </tr>
                              </thead>
                              <tbody>
                                {items.map(item => {
                                  const asset = assets[item.asset_id]
                                  let pillClass = 'border-border-color text-text-secondary bg-transparent'
                                  if (item.status === 'verified') pillClass = 'border-success text-success bg-transparent'
                                  if (item.status === 'missing') pillClass = 'border-danger text-danger bg-transparent'
                                  if (item.status === 'damaged') pillClass = 'border-text-secondary text-foreground bg-transparent'

                                  return (
                                    <tr key={item.id} className="border-b border-border-color last:border-0 hover:bg-bg-tertiary/30 transition-colors">
                                      <td className="py-4 px-4">
                                        <p className="font-medium text-foreground">{asset?.asset_tag || ''} {asset?.name || item.asset_id}</p>
                                      </td>
                                      <td className="py-4 px-4 text-center text-text-secondary text-sm">
                                        {asset?.location || 'Unknown'}
                                      </td>
                                      <td className="py-4 px-4 text-right flex justify-end">
                                        <div className="relative">
                                          <select
                                            value={item.status}
                                            onChange={(e) => handleUpdateItem(audit.id, item.id, e.target.value)}
                                            disabled={itemLoading[item.id] || audit.status === 'closed'}
                                            className={`appearance-none font-medium text-xs text-center cursor-pointer px-4 py-1.5 rounded-full border ${pillClass} focus:outline-none focus:ring-2 focus:ring-accent/50 ${audit.status === 'closed' ? 'opacity-70 cursor-not-allowed' : 'hover:bg-bg-secondary'}`}
                                            style={{ WebkitAppearance: 'none', MozAppearance: 'none', paddingRight: '1rem', paddingLeft: '1rem' }}
                                          >
                                            <option value="pending" className="text-foreground bg-bg-primary">Pending</option>
                                            <option value="verified" className="text-success bg-bg-primary">Verified</option>
                                            <option value="missing" className="text-danger bg-bg-primary">Missing</option>
                                            <option value="damaged" className="text-foreground bg-bg-primary">Damaged</option>
                                          </select>
                                          {itemLoading[item.id] && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/80 rounded-full">
                                              <Loader2 size={12} className="animate-spin text-text-secondary" />
                                            </div>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          !loadingReport && (
                            <p className="text-text-secondary text-sm text-center py-4 border border-border-color rounded-xl">No audit items — assets will appear here once the audit scope is configured.</p>
                          )
                        )}

                        {/* 3. Discrepancy Alert */}
                        {discrepancies > 0 ? (
                          <div className="bg-[#F4D35E]/10 border border-[#F4D35E]/30 rounded-xl p-3 flex items-center justify-start gap-3">
                            <p className="font-semibold text-[#B8860B] text-sm">
                              {discrepancies} asset{discrepancies > 1 ? 's' : ''} flagged - discrepancy report generated automatically
                            </p>
                          </div>
                        ) : (
                          report && report.total_assets > 0 && report.pending === 0 && (
                            <div className="bg-success/5 border border-success/30 rounded-xl p-3 flex items-center justify-start gap-3">
                              <p className="text-success text-sm font-semibold">
                                All assets accounted for — no discrepancies
                              </p>
                            </div>
                          )
                        )}

                        {/* 4. Action Buttons */}
                        {audit.status !== 'closed' && isAdmin && (
                          <div className="pt-2">
                            <button
                              onClick={() => handleCloseAudit(audit.id, audit.name)}
                              className="px-6 py-2 bg-transparent border-2 border-border-color hover:border-foreground rounded-full text-foreground font-semibold text-sm transition-colors"
                            >
                              Close audit cycle
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
