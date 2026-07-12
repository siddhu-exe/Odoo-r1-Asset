import React, { useState } from 'react'
import MainLayout from '../../components/layout/MainLayout'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Download, TrendingUp, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

const utilizationData = [
  { month: 'Jan', usage: 65, available: 35 },
  { month: 'Feb', usage: 72, available: 28 },
  { month: 'Mar', usage: 68, available: 32 },
  { month: 'Apr', usage: 78, available: 22 },
  { month: 'May', usage: 85, available: 15 },
  { month: 'Jun', usage: 82, available: 18 }
]

const maintenanceData = [
  { name: 'Electronics', value: 45, frequency: 4 },
  { name: 'Furniture', value: 20, frequency: 1 },
  { name: 'Equipment', value: 35, frequency: 2 }
]

const COLORS = ['#00d4ff', '#ff6b35', '#00d98e', '#ffa500']

export default function Reports() {
  const [reportType, setReportType] = useState('utilization')

  const handleExport = () => {
    toast.success('Report exported as PDF successfully!')
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" />
                  <Tooltip contentStyle={{ background: '#1a2847', border: '1px solid #1e293b' }} />
                  <Line type="monotone" dataKey="usage" stroke="#00d4ff" strokeWidth={3} dot={{ fill: '#00d4ff' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-foreground mb-4">Usage vs Available</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={utilizationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" />
                  <Tooltip contentStyle={{ background: '#1a2847', border: '1px solid #1e293b' }} />
                  <Legend />
                  <Bar dataKey="usage" fill="#00d4ff" />
                  <Bar dataKey="available" fill="#ff6b35" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* Maintenance Chart */}
        {reportType === 'maintenance' && (
          <>
            <div className="card">
              <h3 className="text-lg font-semibold text-foreground mb-4">Maintenance by Category</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={maintenanceData} cx="50%" cy="50%" labelLine={false} label={{ fill: '#cbd5e1' }} outerRadius={80} dataKey="value">
                    {maintenanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1a2847', border: '1px solid #1e293b' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-foreground mb-4">Maintenance Frequency</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={maintenanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" />
                  <Tooltip contentStyle={{ background: '#1a2847', border: '1px solid #1e293b' }} />
                  <Bar dataKey="frequency" fill="#ff6b35" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* Summary Cards */}
        {reportType !== 'utilization' && reportType !== 'maintenance' && (
          <>
            <div className="card">
              <h3 className="text-lg font-semibold text-foreground mb-4">Key Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-border-color">
                  <span className="text-text-secondary">Total Assets</span>
                  <span className="font-bold text-2xl text-primary">524</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border-color">
                  <span className="text-text-secondary">Allocated</span>
                  <span className="font-bold text-2xl text-success">312</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border-color">
                  <span className="text-text-secondary">Maintenance</span>
                  <span className="font-bold text-2xl text-warning">23</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Utilization Rate</span>
                  <span className="font-bold text-2xl text-primary">82%</span>
                </div>
              </div>
            </div>

            <div className="card bg-primary/5 border border-primary/30">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-primary" />
                Performance Summary
              </h3>
              <div className="space-y-3 text-sm">
                <p className="text-foreground">✓ Utilization improved by 12% this quarter</p>
                <p className="text-foreground">✓ Maintenance requests down by 8%</p>
                <p className="text-warning flex items-center gap-2">
                  <AlertCircle size={16} />
                  3 assets pending return date
                </p>
              </div>
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
