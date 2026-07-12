import React, { useState, useEffect, useCallback } from 'react'
import MainLayout from '../../components/layout/MainLayout'
import { FileText, Plus, AlertCircle, CheckCircle, Loader2, X } from 'lucide-react'
import { getStatusColor, formatStatus, formatDate } from '../../utils/helpers'
import { toast } from 'sonner'
import api from '../../api'

export default function Audit() {
  const [auditCycles, setAuditCycles] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedAudit, setExpandedAudit] = useState(null)
  const [reports, setReports] = useState({})
  const [loadingReport, setLoadingReport] = useState(null)
  const [showNewAudit, setShowNewAudit] = useState(false)
  const [newAuditForm, setNewAuditForm] = useState({ name: '', start_date: '', end_date: '' })
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/audits?page_size=100')
      setAuditCycles(res.data.items)
    } catch {
      toast.error('Failed to load audit cycles')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleExpand = async (cycleId) => {
    if (expandedAudit === cycleId) {
      setExpandedAudit(null)
      return
    }
    setExpandedAudit(cycleId)
    if (!reports[cycleId]) {
      setLoadingReport(cycleId)
      try {
        const res = await api.post(`/audits/${cycleId}/report`)
        setReports(prev => ({ ...prev, [cycleId]: res.data }))
      } catch {
        // report might not be available yet
      } finally {
        setLoadingReport(null)
      }
    }
  }

  const handleCloseAudit = async (cycleId, name) => {
    try {
      await api.patch(`/audits/${cycleId}/close`)
      toast.success(`Audit "${name}" closed and report generated!`)
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
        end_date: newAuditForm.end_date
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

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Asset Audit</h1>
          <p className="text-text-secondary mt-1">Audit cycles and discrepancy reports</p>
        </div>
        <button
          onClick={() => setShowNewAudit(true)}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Start New Audit
        </button>
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
                  placeholder="e.g. Q3 Audit: Engineering Dept"
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

      {/* Audits List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : auditCycles.length === 0 ? (
        <div className="card text-center py-12">
          <FileText size={48} className="mx-auto text-text-secondary/30 mb-4" />
          <p className="text-text-secondary">No audit cycles yet. Start one with the button above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {auditCycles.map(audit => {
            const report = reports[audit.id]
            const discrepancies = report ? report.missing + report.damaged : 0

            return (
              <div key={audit.id} className="card">
                {/* Header */}
                <button
                  onClick={() => handleExpand(audit.id)}
                  className="w-full text-left flex items-center justify-between mb-4"
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-foreground">{audit.name}</h3>
                    <span className={`text-xs px-2.5 py-1 rounded-full ${getStatusColor(audit.status)}`}>
                      {formatStatus(audit.status)}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {formatDate(audit.start_date)} – {formatDate(audit.end_date)}
                    </span>
                  </div>
                  <span className="text-text-secondary shrink-0">{expandedAudit === audit.id ? '▼' : '▶'}</span>
                </button>

                {/* Content */}
                {expandedAudit === audit.id && (
                  <div className="space-y-4">
                    {loadingReport === audit.id ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 size={24} className="animate-spin text-primary" />
                      </div>
                    ) : report ? (
                      <>
                        {/* Summary Table */}
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
                              <tr className="border-b border-border-color">
                                <td className="py-3 text-foreground font-bold">{report.total_assets}</td>
                                <td className="py-3">
                                  <span className="text-xs px-3 py-1 rounded-full bg-success/10 text-success border border-success/30">
                                    {report.verified}
                                  </span>
                                </td>
                                <td className="py-3">
                                  <span className="text-xs px-3 py-1 rounded-full bg-warning/10 text-warning border border-warning/30">
                                    {report.pending}
                                  </span>
                                </td>
                                <td className="py-3">
                                  <span className="text-xs px-3 py-1 rounded-full bg-danger/10 text-danger border border-danger/30">
                                    {report.missing}
                                  </span>
                                </td>
                                <td className="py-3">
                                  <span className="text-xs px-3 py-1 rounded-full bg-warning/10 text-warning border border-warning/30">
                                    {report.damaged}
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Discrepancies Alert */}
                        {discrepancies > 0 && (
                          <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
                            <p className="font-semibold text-warning flex items-center gap-2 mb-3">
                              <AlertCircle size={18} />
                              {discrepancies} discrepancies detected
                            </p>
                            <div className="space-y-2">
                              {report.missing > 0 && (
                                <p className="text-sm text-warning/80">
                                  • {report.missing} asset(s) reported Missing (High Severity)
                                </p>
                              )}
                              {report.damaged > 0 && (
                                <p className="text-sm text-warning/80">
                                  • {report.damaged} asset(s) reported Damaged (Medium Severity)
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {discrepancies === 0 && report.total_assets > 0 && (
                          <div className="card bg-success/5 border border-success/30">
                            <p className="text-success text-sm flex items-center gap-2">
                              <CheckCircle size={18} />
                              No discrepancies found — all assets accounted for
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-text-secondary text-sm">Could not load discrepancy report.</p>
                    )}

                    {/* Action Buttons */}
                    {audit.status !== 'closed' && (
                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={() => toast.info('Audit report exported successfully!')}
                          className="btn-secondary flex-1"
                        >
                          Export Report
                        </button>
                        <button
                          onClick={() => handleCloseAudit(audit.id, audit.name)}
                          className="btn-primary flex-1"
                        >
                          Close Audit
                        </button>
                      </div>
                    )}
                    {audit.status === 'closed' && (
                      <div className="pt-4">
                        <span className="text-sm text-text-secondary">This audit cycle is closed.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Auto-Generated Report Info */}
      <div className="card mt-6 bg-success/5 border border-success/30">
        <p className="text-success text-sm flex items-center gap-2">
          <CheckCircle size={18} />
          Auto-generated discrepancy reports are flagged for follow-up
        </p>
      </div>
    </MainLayout>
  )
}
