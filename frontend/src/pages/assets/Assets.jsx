import { useState, useEffect, useCallback, useRef } from 'react'

import { toast } from 'sonner'
import { Search, Plus, Loader2, Package } from 'lucide-react'

import api from '../../api'
import MainLayout from '../../components/layout/MainLayout'
import AssetModal from './AssetModal'
import AssetDetailDrawer from './AssetDetailDrawer'
import AssetRow from './AssetRow'

const ASSET_STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'available', label: 'Available' },
  { value: 'allocated', label: 'Allocated' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'under_maintenance', label: 'Under Maintenance' },
  { value: 'lost', label: 'Lost' },
  { value: 'retired', label: 'Retired' },
  { value: 'disposed', label: 'Disposed' },
]

export default function Assets() {
  const [assets, setAssets] = useState([])
  const [categories, setCategories] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const [searchInput, setSearchInput] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCategoryId, setFilterCategoryId] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [editingAsset, setEditingAsset] = useState(null)

  const searchTimeout = useRef(null)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/categories?page_size=100')
      setCategories(res.data.items)
    } catch {
      // categories are optional for filtering
    }
  }, [])

  const fetchAssets = useCallback(async (currentPage, search, status, categoryId) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: currentPage, page_size: 20 })
      if (search) params.append('search', search)
      if (status) params.append('status', status)
      if (categoryId) params.append('category_id', categoryId)

      const res = await api.get(`/assets?${params}`)
      setAssets(res.data.items)
      setTotal(res.data.total)
      setTotalPages(res.data.total_pages)
    } catch (err) {
      toast.error('Failed to load assets')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchAssets(page, debouncedSearch, filterStatus, filterCategoryId)
  }, [fetchAssets, page, debouncedSearch, filterStatus, filterCategoryId])

  const handleSearchChange = (value) => {
    setSearchInput(value)
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(value)
      setPage(1)
    }, 400)
  }

  const handleStatusChange = (value) => {
    setFilterStatus(value)
    setPage(1)
  }

  const handleCategoryChange = (value) => {
    setFilterCategoryId(value)
    setPage(1)
  }

  const handleAssetCreated = () => {
    setShowModal(false)
    setPage(1)
    fetchAssets(1, debouncedSearch, filterStatus, filterCategoryId)
    toast.success('Asset registered successfully')
  }

  const handleAssetUpdated = () => {
    setEditingAsset(null)
    fetchAssets(page, debouncedSearch, filterStatus, filterCategoryId)
    toast.success('Asset updated successfully')
  }

  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] sm:text-[38px] font-black text-foreground tracking-tight">Assets Directory</h1>
          <p className="text-text-secondary mt-1">Register and track all organizational assets</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Register Asset
        </button>
      </div>

      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 text-text-secondary" size={18} />
            <input
              type="text"
              placeholder="Search by name, tag, serial, location…"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="input-base pl-10"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="input-base"
          >
            {ASSET_STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <select
            value={filterCategoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="input-base"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="text-sm text-text-secondary mb-4">
        Showing <span className="text-foreground font-semibold">{assets.length}</span> of{' '}
        <span className="text-foreground font-semibold">{total}</span> assets
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : assets.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Package size={24} className="text-primary" />
          </div>
          <p className="text-text-secondary text-lg">No assets found</p>
          <p className="text-text-secondary text-sm mt-1">Try adjusting your filters or register a new asset</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border-color">
                  <th className="py-3 pl-5 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">#</th>
                  <th className="py-3 px-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Asset Name</th>
                  <th className="py-3 px-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Category</th>
                  <th className="py-3 px-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Status / Condition</th>
                  <th className="py-3 px-3 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">Location</th>
                  <th className="py-3 px-3 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">Value</th>
                  <th className="py-3 px-3 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">Added</th>
                  <th className="py-3 pl-3 pr-5 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset, index) => (
                  <AssetRow
                    key={asset.id}
                    asset={asset}
                    index={index}
                    onViewDetails={() => setSelectedAsset(asset)}
                    onEdit={() => setEditingAsset(asset)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-text-secondary text-sm">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {showModal && (
        <AssetModal
          categories={categories}
          onClose={() => setShowModal(false)}
          onSuccess={handleAssetCreated}
        />
      )}

      {editingAsset && (
        <AssetModal
          categories={categories}
          asset={editingAsset}
          onClose={() => setEditingAsset(null)}
          onSuccess={handleAssetUpdated}
        />
      )}

      {selectedAsset && (
        <AssetDetailDrawer
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onEdit={() => {
            setEditingAsset(selectedAsset)
            setSelectedAsset(null)
          }}
        />
      )}
    </MainLayout>
  )
}