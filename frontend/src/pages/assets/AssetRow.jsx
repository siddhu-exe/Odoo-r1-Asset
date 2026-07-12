import { getStatusColor, formatStatus, formatCurrency, formatDate } from '../../utils/helpers'

export default function AssetRow({ asset, onViewDetails, onEdit }) {
  return (
    <div
      onClick={onViewDetails}
      className="card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-pointer hover:border-primary/50 transition-colors"
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-11 h-11 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-primary font-bold text-sm">
            {asset.category_name ? asset.category_name[0].toUpperCase() : 'A'}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground truncate">{asset.name}</h3>
            <span className="text-xs text-text-secondary font-mono bg-bg-tertiary px-2 py-0.5 rounded">
              {asset.asset_tag}
            </span>
          </div>
          <p className="text-sm text-text-secondary mt-0.5">{asset.category_name || '—'}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(asset.status)}`}>
              {formatStatus(asset.status)}
            </span>
            <span className="text-xs px-2 py-1 rounded bg-bg-tertiary text-text-secondary capitalize">
              {asset.condition}
            </span>
            {asset.is_bookable && (
              <span className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                Bookable
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:flex sm:gap-6 text-sm shrink-0">
        <div>
          <p className="text-text-secondary text-xs">Location</p>
          <p className="text-foreground font-medium truncate max-w-[100px]">{asset.location || '—'}</p>
        </div>
        <div>
          <p className="text-text-secondary text-xs">Value</p>
          <p className="text-foreground font-medium">
            {asset.acquisition_cost ? formatCurrency(asset.acquisition_cost) : '—'}
          </p>
        </div>
        <div>
          <p className="text-text-secondary text-xs">Added</p>
          <p className="text-foreground font-medium">{formatDate(asset.created_at)}</p>
        </div>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onEdit() }}
        className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors shrink-0"
        title="Edit asset"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary hover:text-primary">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>
    </div>
  )
}
