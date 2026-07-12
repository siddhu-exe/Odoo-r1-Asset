import React, { useState, useEffect, useCallback } from 'react'
import MainLayout from '../../components/layout/MainLayout'
import { Plus, ArrowRight, AlertCircle } from 'lucide-react'
import { getStatusColor, formatDate, formatStatus } from '../../utils/helpers'
import { toast } from 'sonner'
import AllocationModal from './AllocationModal'
import api from '../../api'

export default function Allocation() {
  const [assets, setAssets] = useState([])
  const [employees, setEmployees] = useState({})
  const [allocations, setAllocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [assetsRes, employeesRes, allocationsRes] = await Promise.all([
        api.get('/assets?page_size=100'),
        api.get('/employees?page_size=100'),
        api.get('/allocations?page_size=100')
      ])
      setAssets(assetsRes.data.items)
      setEmployees(Object.fromEntries(employeesRes.data.items.map(e => [e.id, e])))
      setAllocations(allocationsRes.data.items)
    } catch (err) {
      toast.error('Failed to load allocation data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleTransfer = async (assetId, toEmployeeId, reason) => {
    try {
      await api.post('/allocations/transfers', {
        asset_id: assetId,
        to_employee_id: toEmployeeId,
        reason
      })
      toast.success('Transfer request submitted for approval')
      setShowModal(false)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit transfer request')
    }
  }

  const activeAllocationByAsset = Object.fromEntries(
    allocations.filter(a => a.status === 'active').map(a => [a.asset_id, a])
  )

  const allocatedAssets = assets.filter(a => a.status === 'allocated')
  const availableAssets = assets.filter(a => a.status === 'available')

  const sortedAllocations = [...allocations].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  )

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] sm:text-[38px] font-black text-foreground tracking-tight">Allocation & Transfer</h1>
          <p className="text-text-secondary mt-1">Manage asset allocation and transfers between employees</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          New Transfer
        </button>
      </div>

      {/* Alert for Double Allocation */}
      <div className="card bg-danger/5 border border-danger/30 mb-6 flex items-start gap-3">
        <AlertCircle size={20} className="text-danger flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-foreground">Double Allocation Check</p>
          <p className="text-sm text-danger/80 mt-1">
            System prevents reallocating already allocated assets. Submit a transfer request below.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="card">
          <p className="text-text-secondary text-sm mb-1">Currently Allocated</p>
          <p className="text-3xl font-bold text-primary">{allocatedAssets.length}</p>
          <p className="text-xs text-text-secondary mt-2">Assets in use</p>
        </div>
        <div className="card">
          <p className="text-text-secondary text-sm mb-1">Available for Transfer</p>
          <p className="text-3xl font-bold text-success">{availableAssets.length}</p>
          <p className="text-xs text-text-secondary mt-2">Ready to allocate</p>
        </div>
      </div>

      {/* Currently Allocated Assets */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Currently Allocated Assets</h2>
        <div className="space-y-3">
          {loading ? (
            <p className="text-text-secondary text-sm">Loading...</p>
          ) : allocatedAssets.length > 0 ? (
            allocatedAssets.map(asset => {
              const allocation = activeAllocationByAsset[asset.id]
              const employee = allocation?.employee_id ? employees[allocation.employee_id] : null
              return (
                <div key={asset.id} className="card flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{asset.name}</h3>
                    <p className="text-sm text-text-secondary">
                      {asset.asset_tag} • Allocated to {employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <ArrowRight size={16} />
                    Transfer
                  </button>
                </div>
              )
            })
          ) : (
            <p className="text-text-secondary text-sm">No assets currently allocated</p>
          )}
        </div>
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
              {sortedAllocations.map(record => {
                const asset = assets.find(a => a.id === record.asset_id)
                const employee = record.employee_id ? employees[record.employee_id] : null
                return (
                  <tr key={record.id} className="border-b border-border-color hover:bg-bg-tertiary/30 transition-colors">
                    <td className="py-3 text-foreground text-sm">{formatDate(record.created_at)}</td>
                    <td className="py-3 text-foreground font-semibold">{asset ? asset.name : record.asset_id}</td>
                    <td className="py-3 text-text-secondary text-sm">
                      {employee ? `${employee.first_name} ${employee.last_name}` : '-'}
                    </td>
                    <td className="py-3 text-text-secondary text-sm">
                      {record.expected_return_date ? formatDate(record.expected_return_date) : '-'}
                    </td>
                    <td className="py-3">
                      <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(record.status)}`}>
                        {formatStatus(record.status)}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {!loading && sortedAllocations.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-text-secondary text-sm">
                    No allocation history found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <AllocationModal
          onClose={() => setShowModal(false)}
          onSubmit={handleTransfer}
          assets={allocatedAssets}
          employees={Object.values(employees)}
        />
      )}
    </MainLayout>
  )
}
