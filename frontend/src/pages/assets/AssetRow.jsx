import { getStatusColor, formatStatus, formatCurrency, formatDate, getAvatarColor } from '../../utils/helpers'

export default function AssetRow({ asset, index, onViewDetails, onEdit }) {
  const avatarColor = getAvatarColor(asset.name)

  return (
    <tr
      onClick={onViewDetails}
      className="border-b border-border-color last:border-0 cursor-pointer hover:bg-bg-tertiary transition-colors"
    >
      <td className="py-3 pl-5 pr-3 text-sm text-text-secondary align-middle">{index + 1}</td>

      <td className="py-3 px-3 align-middle">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-11 h-11 ${avatarColor.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
            <span className={`${avatarColor.text} font-bold text-sm`}>
              {asset.category_name ? asset.category_name[0].toUpperCase() : 'A'}
            </span>
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground truncate">{asset.name}</h3>
            <span className="text-xs text-text-secondary font-mono bg-bg-tertiary px-2 py-0.5 rounded inline-block mt-0.5">
              {asset.asset_tag}
            </span>
          </div>
        </div>
      </td>

      <td className="py-3 px-3 align-middle text-sm text-text-secondary whitespace-nowrap">
        {asset.category_name || '—'}
      </td>

      <td className="py-3 px-3 align-middle">
        <div className="flex flex-wrap gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(asset.status)}`}>
            {formatStatus(asset.status)}
          </span>
          <span className="text-xs px-2 py-1 rounded bg-bg-tertiary text-text-secondary capitalize">
            {asset.condition}
          </span>
          {asset.is_bookable && (
            <span className="text-xs px-2 py-1 rounded bg-chart-4/10 text-chart-4 border border-chart-4/30">
              Bookable
            </span>
          )}
        </div>
      </td>

      <td className="py-3 px-3 align-middle text-sm text-foreground font-medium text-right whitespace-nowrap">
        {asset.location || '—'}
      </td>

      <td className="py-3 px-3 align-middle text-sm text-foreground font-medium text-right whitespace-nowrap">
        {asset.acquisition_cost ? formatCurrency(asset.acquisition_cost) : '—'}
      </td>

      <td className="py-3 px-3 align-middle text-sm text-foreground font-medium text-right whitespace-nowrap">
        {formatDate(asset.created_at)}
      </td>

      <td className="py-3 pl-3 pr-5 align-middle text-right">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit() }}
          className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors"
          title="Edit asset"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary hover:text-primary">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
      </td>
    </tr>
  )
}
