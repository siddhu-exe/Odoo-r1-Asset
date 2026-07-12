import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import MainLayout from '../../components/layout/MainLayout'
import { Search, Filter, Plus, ChevronRight, Edit2 } from 'lucide-react'
import { getStatusColor, formatCurrency, formatDate } from '../../utils/helpers'
import { toast } from 'sonner'
import AssetModal from './AssetModal'

export default function Assets() {
  const { assets, addAsset, mockCategories } = useData()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterCategory, setFilterCategory] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState(null)

  const filteredAssets = assets.filter(asset => {
    const matchSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = filterStatus === 'All' || asset.status === filterStatus
    const matchCategory = filterCategory === 'All' || asset.category === filterCategory
    return matchSearch && matchStatus && matchCategory
  })

  const handleAddAsset = (assetData) => {
    addAsset(assetData)
    toast.success(`Asset "${assetData.name}" registered successfully!`)
    setShowModal(false)
  }

  const statuses = ['All', 'Available', 'Allocated', 'Maintenance', 'Damaged']

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assets Directory</h1>
          <p className="text-text-secondary mt-1">Manage and track all organizational assets</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Register Asset
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 text-text-secondary" size={20} />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-base pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-base"
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input-base"
            >
              <option value="All">All Categories</option>
              {mockCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Counter */}
      <div className="text-sm text-text-secondary mb-4">
        Showing <span className="text-foreground font-semibold">{filteredAssets.length}</span> of {assets.length} assets
      </div>

      {/* Assets Grid */}
      <div className="grid gap-4">
        {filteredAssets.length > 0 ? (
          filteredAssets.map(asset => (
            <div
              key={asset.id}
              className="card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-pointer hover:border-primary/50"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold text-sm">
                      {asset.category[0]}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground truncate">{asset.name}</h3>
                    <p className="text-sm text-text-secondary">ID: {asset.id}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs bg-bg-tertiary px-2 py-1 rounded">{asset.category}</span>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(asset.status)}`}>
                        {asset.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:flex sm:gap-6 text-sm">
                <div>
                  <p className="text-text-secondary text-xs">Location</p>
                  <p className="text-foreground font-semibold">{asset.location}</p>
                </div>
                <div>
                  <p className="text-text-secondary text-xs">Allocated To</p>
                  <p className="text-foreground font-semibold">{asset.allocatedTo || '-'}</p>
                </div>
                <div>
                  <p className="text-text-secondary text-xs">Value</p>
                  <p className="text-foreground font-semibold">{formatCurrency(asset.value)}</p>
                </div>
              </div>

              <button className="p-2 hover:bg-bg-tertiary rounded-lg transition-colors">
                <ChevronRight size={20} className="text-text-secondary hover:text-primary" />
              </button>
            </div>
          ))
        ) : (
          <div className="card text-center py-12">
            <p className="text-text-secondary">No assets found matching your filters</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <AssetModal
          onClose={() => setShowModal(false)}
          onSubmit={handleAddAsset}
          categories={mockCategories}
        />
      )}
    </MainLayout>
  )
}
