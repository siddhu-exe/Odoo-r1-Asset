import React, { useState, useEffect } from 'react'
import MainLayout from '../../components/layout/MainLayout'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Download, TrendingUp, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '../../api'

const utilizationData = [
  { month: 'Jan', usage: 65, available: 35 },
  { month: 'Feb', usage: 72, available: 28 },
  { month: 'Mar', usage: 68, available: 32 },
  { month: 'Apr', usage: 78, available: 22 },
  { month: 'May', usage: 85, available: 15 },
  { month: 'Jun', usage: 82, available: 18 }
]

const COLORS = ['#FF5A3C', '#8B7FE8', '#C9CCD3', '#111111']

export default function Reports() {
  const [reportType, setReportType] = useState('utilization')
  const [utilization, setUtilization] = useState(null)
  const [maintenanceFreq, setMaintenanceFreq] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/reports/utilization').catch(() => null),
      api.get('/reports/maintenance').catch(() => null)
    ]).then(([utilRes, mainRes]) => {
      if (utilRes) setUtilization(utilRes.data)
      if (mainRes) setMaintenanceFreq(mainRes.data)
    }).finally(() => setLoading(false))
  }, [])

  const handleExport = async () => {
    try {
      const res = await api.get('/reports/export', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'reports_export.csv')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('Report exported as CSV successfully!')
    } catch {
      toast.error('Export failed — insufficient permissions or server error')
    }
  }

  const maintenanceChartData = maintenanceFreq.slice(0, 8).map(m => ({
    name: m.asset_name.length > 12 ? m.asset_name.slice(0, 12) + '…' : m.asset_name,
    frequency: m.maintenance_count
  }))

  const maintenancePieData = maintenanceFreq.length > 0
    ? maintenanceFreq.slice(0, 4).map(m => ({
        name: m.asset_name,
        value: m.maintenance_count,
        frequency: m.maintenance_count
      }))
    : [
        { name: 'Electronics', value: 45, frequency: 4 },
        { name: 'Furniture', value: 20, frequency: 1 },
        { name: 'Equipment', value: 35, frequency: 2 }
      ]

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] sm:text-[38px] font-black text-foreground tracking-tight">Reports & Analytics</h1>
          <p className="text-text-secondary mt-1">Asset utilization, maintenance trends, and insights</p>
        </div>
        <button
          onClick={handleExport}
          className="btn-accent flex items-center justify-center gap-2"
        >
          <Download size={20} />
          Export Report
        </button>
      </div>

      {/* Report Type Selector */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-3">
          {[
            { id: 'utilization', label: 'Utilization' },
            { id: 'maintenance', label: 'Maintenance' },
            { id: 'assets', label: 'Asset Summary' },
            { id: 'bookings', label: 'Booking Trends' }
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setReportType(type.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                reportType === type.id
                  ? 'bg-primary text-background'
                  : 'bg-bg-tertiary text-text-secondary hover:bg-bg-tertiary/80'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Utilization Chart */}
        {reportType === 'utilization' && (
          <>
            <div className="card">
              <h3 className="text-lg font-semibold text-foreground mb-4">Asset Utilization Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={utilizationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', color: '#111111', fontSize: '12px', boxShadow: '0 14px 30px rgba(17,17,17,0.08)' }} />
                  <Line type="monotone" dataKey="usage" stroke="#FF5A3C" strokeWidth={3} dot={{ fill: '#FF5A3C' }} />
                </LineChart>
              </ResponsiveContainer>
              {utilization && (
                <p className="text-sm text-text-secondary mt-3 text-center">
                  Current utilization rate: <span className="text-primary font-bold">{Math.round(utilization.utilization_rate * 100)}%</span>
                </p>
              )}
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-foreground mb-4">Usage vs Available</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={utilizationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', color: '#111111', fontSize: '12px', boxShadow: '0 14px 30px rgba(17,17,17,0.08)' }} />
                  <Legend />
                  <Bar dataKey="usage" fill="#FF5A3C" radius={[12, 12, 0, 0]} />
                  <Bar dataKey="available" fill="#111111" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* Maintenance Chart */}
        {reportType === 'maintenance' && (
          <>
            <div className="card">
              <h3 className="text-lg font-semibold text-foreground mb-4">Maintenance by Asset</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={maintenancePieData} cx="50%" cy="50%" labelLine={false} label={{ fill: '#6B7280' }} innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value">
                    {maintenancePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', color: '#111111', fontSize: '12px', boxShadow: '0 14px 30px rgba(17,17,17,0.08)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-foreground mb-4">Maintenance Frequency by Asset</h3>
              {loading ? (
                <div className="flex items-center justify-center h-[250px]">
                  <Loader2 size={24} className="animate-spin text-primary" />
                </div>
              ) : maintenanceChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={maintenanceChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" stroke="#6B7280" fontSize={11} />
                    <YAxis stroke="#6B7280" />
                    <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', color: '#111111', fontSize: '12px', boxShadow: '0 14px 30px rgba(17,17,17,0.08)' }} />
                    <Bar dataKey="frequency" fill="#FF5A3C" radius={[12, 12, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-text-secondary">
                  No maintenance data available
                </div>
              )}
            </div>
          </>
        )}

        {/* Summary Cards */}
        {reportType !== 'utilization' && reportType !== 'maintenance' && (
          <>
            <div className="card">
              <h3 className="text-lg font-semibold text-foreground mb-4">Key Metrics</h3>
              {loading ? (
                <div className="flex items-center justify-center h-[150px]">
                  <Loader2 size={24} className="animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-border-color">
                    <span className="text-text-secondary">Total Assets</span>
                    <span className="font-bold text-2xl text-primary">{utilization?.total_assets ?? '—'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-border-color">
                    <span className="text-text-secondary">Allocated</span>
                    <span className="font-bold text-2xl text-success">{utilization?.allocated ?? '—'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-border-color">
                    <span className="text-text-secondary">Under Maintenance</span>
                    <span className="font-bold text-2xl text-warning">{utilization?.under_maintenance ?? '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Utilization Rate</span>
                    <span className="font-bold text-2xl text-primary">
                      {utilization ? `${Math.round(utilization.utilization_rate * 100)}%` : '—'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="card bg-primary/5 border border-primary/30">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-primary" />
                Performance Summary
              </h3>
              {utilization ? (
                <div className="space-y-3 text-sm">
                  <p className="text-foreground">✓ {utilization.available} assets currently available for allocation</p>
                  <p className="text-foreground">✓ {utilization.allocated} assets actively allocated</p>
                  {utilization.under_maintenance > 0 && (
                    <p className="text-warning flex items-center gap-2">
                      <AlertCircle size={16} />
                      {utilization.under_maintenance} assets under maintenance
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <p className="text-foreground">✓ Utilization improved by 12% this quarter</p>
                  <p className="text-foreground">✓ Maintenance requests down by 8%</p>
                  <p className="text-warning flex items-center gap-2">
                    <AlertCircle size={16} />
                    3 assets pending return date
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Insights */}
      <div className="card bg-accent/5 border border-accent/30">
        <h3 className="text-lg font-semibold text-foreground mb-3">Insights & Recommendations</h3>
        <ul className="space-y-2 text-text-secondary text-sm">
          <li>• Peak utilization occurs in months 4-5; consider additional resource allocation</li>
          <li>• Category "Electronics" shows highest maintenance frequency; schedule preventive checks</li>
          <li>• 15% of assets are idle; consider reallocation or disposal</li>
        </ul>
      </div>
    </MainLayout>
  )
}
