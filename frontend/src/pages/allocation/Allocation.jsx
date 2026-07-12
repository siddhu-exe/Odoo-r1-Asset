import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import MainLayout from '../../components/layout/MainLayout'
import { Send, Plus, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'
import { getStatusColor, formatDate } from '../../utils/helpers'
import { toast } from 'sonner'
import AllocationModal from './AllocationModal'

export default function Allocation() {
  const { assets, employees, transferAsset } = useData()
  const [showModal, setShowModal] = useState(false)
  const [allocationHistory] = useState([
    {
      date: '2024-01-10',
      assetId: 'AF-0014',
      assetName: 'Laptop',
      fromEmployee: 'Priya Shah',
      toEmployee: 'Arjun Patel',
      reason: 'Transfer Request',
      status: 'Approved'
    },
    {
      date: '2024-01-08',
      assetId: 'AF-0062',
      assetName: 'Projector',
      fromEmployee: 'Maintenance',
      toEmployee: 'Engineering Dept',
      reason: 'Return after Maintenance',
      status: 'Approved'
    }
  ])

  const handleTransfer = (assetId, toEmployee) => {
    transferAsset(assetId, toEmployee)
    toast.success(`Asset transferred to ${toEmployee}`)
    setShowModal(false)
  }

  const allocatedAssets = assets.filter(a => a.status === 'Allocated')
  const availableAssets = assets.filter(a => a.status === 'Available')

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Allocation & Transfer</h1>
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
          {allocatedAssets.map(asset => (
            <div key={asset.id} className="card flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{asset.name}</h3>
                <p className="text-sm text-text-secondary">{asset.id} • Allocated to {asset.allocatedTo}</p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <ArrowRight size={16} />
                Transfer
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Allocation History */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Transfer History</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-color">
                <th className="text-left text-sm font-semibold text-text-secondary py-3">Date</th>
                <th className="text-left text-sm font-semibold text-text-secondary py-3">Asset</th>
                <th className="text-left text-sm font-semibold text-text-secondary py-3">From</th>
                <th className="text-left text-sm font-semibold text-text-secondary py-3">To</th>
                <th className="text-left text-sm font-semibold text-text-secondary py-3">Reason</th>
                <th className="text-left text-sm font-semibold text-text-secondary py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {allocationHistory.map((record, idx) => (
                <tr key={idx} className="border-b border-border-color hover:bg-bg-tertiary/30 transition-colors">
                  <td className="py-3 text-foreground text-sm">{formatDate(record.date)}</td>
                  <td className="py-3 text-foreground font-semibold">{record.assetName} ({record.assetId})</td>
                  <td className="py-3 text-text-secondary text-sm">{record.fromEmployee}</td>
                  <td className="py-3 text-text-secondary text-sm">{record.toEmployee}</td>
                  <td className="py-3 text-text-secondary text-sm">{record.reason}</td>
                  <td className="py-3">
                    <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
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
          employees={employees}
        />
      )}
    </MainLayout>
  )
}
