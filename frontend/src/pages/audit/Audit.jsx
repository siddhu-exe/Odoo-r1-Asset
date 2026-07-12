import React, { useState } from 'react'
import MainLayout from '../../components/layout/MainLayout'
import { FileText, Plus, AlertCircle, CheckCircle } from 'lucide-react'
import { getStatusColor } from '../../utils/helpers'
import { toast } from 'sonner'

const mockAudits = [
  {
    id: 'Q3 audit: Engineering dept - 1-15 Jul',
    assets: [
      { id: 'AF-003', name: 'Bell Laptop', expected: 'Desk E12', status: 'Verified' },
      { id: 'AF-3321', name: 'Office chair', expected: 'Desk E14', status: 'Missing' },
      { id: 'AF-1838', name: 'Monitor', expected: 'Desk E15', status: 'Damaged' }
    ]
  }
]

export default function Audit() {
  const [expandedAudit, setExpandedAudit] = useState(null)
  const [discrepancies] = useState([
    { assetId: 'AF-3321', issue: 'Missing', severity: 'High' },
    { assetId: 'AF-1838', issue: 'Damaged', severity: 'Medium' }
  ])

  const handleCloseAudit = (auditId) => {
    toast.success(`Audit "${auditId}" closed and report generated!`)
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Asset Audit</h1>
          <p className="text-text-secondary mt-1">Audit cycles and discrepancy reports</p>
        </div>
        <button className="btn-primary flex items-center justify-center gap-2">
          <Plus size={20} />
          Start New Audit
        </button>
      </div>

      {/* Audits List */}
      <div className="space-y-4">
        {mockAudits.map(audit => (
          <div key={audit.id} className="card">
            {/* Header */}
            <button
              onClick={() => setExpandedAudit(expandedAudit === audit.id ? null : audit.id)}
              className="w-full text-left flex items-center justify-between mb-4"
            >
              <h3 className="font-semibold text-foreground">{audit.id}</h3>
              <span className="text-text-secondary">{expandedAudit === audit.id ? '▼' : '▶'}</span>
            </button>

            {/* Content */}
            {expandedAudit === audit.id && (
              <div className="space-y-4">
                {/* Assets Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border-color">
                        <th className="text-left text-sm font-semibold text-text-secondary py-2">Asset ID</th>
                        <th className="text-left text-sm font-semibold text-text-secondary py-2">Expected Location</th>
                        <th className="text-left text-sm font-semibold text-text-secondary py-2">Verification</th>
                      </tr>
                    </thead>
                    <tbody>
                      {audit.assets.map(asset => (
                        <tr key={asset.id} className="border-b border-border-color hover:bg-bg-tertiary/30 transition-colors">
                          <td className="py-3 text-foreground">{asset.name} ({asset.id})</td>
                          <td className="py-3 text-text-secondary">{asset.expected}</td>
                          <td className="py-3">
                            <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(asset.status)}`}>
                              {asset.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Discrepancies Alert */}
                {discrepancies.length > 0 && (
                  <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
                    <p className="font-semibold text-warning flex items-center gap-2 mb-3">
                      <AlertCircle size={18} />
                      {discrepancies.length} discrepancies detected
                    </p>
                    <div className="space-y-2">
                      {discrepancies.map((disc, idx) => (
                        <p key={idx} className="text-sm text-warning/80">
                          • Asset {disc.assetId}: {disc.issue} ({disc.severity} Severity)
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => toast.info('Audit report exported successfully!')}
                    className="btn-secondary flex-1"
                  >
                    Export Report
                  </button>
                  <button
                    onClick={() => handleCloseAudit(audit.id)}
                    className="btn-primary flex-1"
                  >
                    Close Audit
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

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
