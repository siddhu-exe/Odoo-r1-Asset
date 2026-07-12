import { useState, useEffect } from 'react'

import { X, Edit2, Loader2, Package, Clock, Wrench } from 'lucide-react'

import api from '../../api'
import { getStatusColor, formatStatus, formatCurrency, formatDate } from '../../utils/helpers'

export default function AssetDetailDrawer({ asset, onClose, onEdit }) {
  const [history, setHistory] = useState(null)
  const [loadingHistory, setLoadingHistory] = useState(true)

  useEffect(() => {
    setLoadingHistory(true)
    api.get(`/assets/${asset.id}/history`)
      .then(res => setHistory(res.data))
      .catch(() => setHistory({ allocations: [], maintenance_requests: [] }))
      .finally(() => setLoadingHistory(false))
  }, [asset.id])

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50" onClick={onClose} />
      <div className="w-full max-w-md bg-bg-secondary border-l border-border-color flex flex-col h-full overflow-hidden">

        <div className="flex items-center justify-between p-5 border-b border-border-color shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Package size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-foreground leading-tight">{asset.name}</h2>
              <span className="text-xs font-mono text-text-secondary">{asset.asset_tag}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors" title="Edit">
              <Edit2 size={18} className="text-primary" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-bg-tertiary rounded-lg p-3">
                <p className="text-xs text-text-secondary mb-1">Status</p>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(asset.status)}`}>
                  {formatStatus(asset.status)}
                </span>
              </div>
              <div className="bg-bg-tertiary rounded-lg p-3">
                <p className="text-xs text-text-secondary mb-1">Condition</p>
                <span className="text-sm text-foreground capitalize">{asset.condition}</span>
              </div>
              <div className="bg-bg-tertiary rounded-lg p-3">
                <p className="text-xs text-text-secondary mb-1">Category</p>
                <span className="text-sm text-foreground">{asset.category_name || '—'}</span>
              </div>
              <div className="bg-bg-tertiary rounded-lg p-3">
                <p className="text-xs text-text-secondary mb-1">Location</p>
                <span className="text-sm text-foreground">{asset.location || '—'}</span>
              </div>
              <div className="bg-bg-tertiary rounded-lg p-3">
                <p className="text-xs text-text-secondary mb-1">Serial Number</p>
                <span className="text-sm text-foreground font-mono">{asset.serial_number || '—'}</span>
              </div>
              <div className="bg-bg-tertiary rounded-lg p-3">
                <p className="text-xs text-text-secondary mb-1">Bookable</p>
                <span className={`text-sm ${asset.is_bookable ? 'text-blue-400' : 'text-text-secondary'}`}>
                  {asset.is_bookable ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="bg-bg-tertiary rounded-lg p-3">
                <p className="text-xs text-text-secondary mb-1">Acquired</p>
                <span className="text-sm text-foreground">
                  {asset.acquisition_date ? formatDate(asset.acquisition_date) : '—'}
                </span>
              </div>
              <div className="bg-bg-tertiary rounded-lg p-3">
                <p className="text-xs text-text-secondary mb-1">Value</p>
                <span className="text-sm text-foreground">
                  {asset.acquisition_cost ? formatCurrency(asset.acquisition_cost) : '—'}
                </span>
              </div>
            </div>
            {asset.notes && (
              <div className="mt-3 p-3 bg-bg-tertiary rounded-lg">
                <p className="text-xs text-text-secondary mb-1">Notes</p>
                <p className="text-sm text-foreground">{asset.notes}</p>
              </div>
            )}
          </div>

          {loadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={16} className="text-text-secondary" />
                  <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Allocation History
                  </h3>
                  <span className="ml-auto text-xs text-text-secondary bg-bg-tertiary px-2 py-0.5 rounded-full">
                    {history?.allocations?.length || 0}
                  </span>
                </div>
                {!history?.allocations?.length ? (
                  <p className="text-text-secondary text-sm">No allocations yet</p>
                ) : (
                  <div className="space-y-1">
                    {history.allocations.map(entry => (
                      <div key={entry.id} className="flex items-center justify-between py-2 border-b border-border-color last:border-0">
                        <div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(entry.status)}`}>
                            {formatStatus(entry.status)}
                          </span>
                          <p className="text-xs text-text-secondary mt-1">{formatDate(entry.allocated_at)}</p>
                        </div>
                        {entry.returned_at && (
                          <p className="text-xs text-text-secondary">Returned {formatDate(entry.returned_at)}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Wrench size={16} className="text-text-secondary" />
                  <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Maintenance History
                  </h3>
                  <span className="ml-auto text-xs text-text-secondary bg-bg-tertiary px-2 py-0.5 rounded-full">
                    {history?.maintenance_requests?.length || 0}
                  </span>
                </div>
                {!history?.maintenance_requests?.length ? (
                  <p className="text-text-secondary text-sm">No maintenance requests</p>
                ) : (
                  <div className="space-y-1">
                    {history.maintenance_requests.map(entry => (
                      <div key={entry.id} className="flex items-center justify-between py-2 border-b border-border-color last:border-0">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(entry.status)}`}>
                              {formatStatus(entry.status)}
                            </span>
                            <span className="text-xs text-text-secondary capitalize">{entry.priority}</span>
                          </div>
                          {entry.description && (
                            <p className="text-xs text-text-secondary mt-1 truncate">{entry.description}</p>
                          )}
                        </div>
                        <p className="text-xs text-text-secondary shrink-0 ml-2">{formatDate(entry.raised_at)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
