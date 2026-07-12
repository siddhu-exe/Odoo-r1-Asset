import React, { useState, useEffect } from 'react'
import MainLayout from '../../components/layout/MainLayout'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { Download, TrendingUp, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '../../api'

const COLORS = ['#00d4ff', '#ff6b35', '#00d98e', '#ffa500', '#a855f7', '#ec4899']
const CHART_STYLE = { background: '#1a2847', border: '1px solid #1e293b' }
const AXIS_STYLE = { stroke: '#cbd5e1', fontSize: 11 }

const TABS = [
  { id: 'utilization', label: 'Utilization' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'assets', label: 'Asset Summary' },
  { id: 'departments', label: 'Departments' },
  { id: 'bookings', label: 'Booking Trends' },
]

export default function Reports() {
  const [reportType, setReportType] = useState('utilization')
  const [utilization, setUtilization] = useState(null)
  const [maintenanceFreq, setMaintenanceFreq] = useState([])
  const [departments, setDepartments] = useState([])
  const [bookingHeatmap, setBookingHeatmap] = useState([])
  const [mostUsed, setMostUsed] = useState([])
  const [idleAssets, setIdleAssets] = useState([])
  const [maintenanceRetirement, setMaintenanceRetirement] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/reports/utilization').catch(() => null),
      api.get('/reports/maintenance').catch(() => null),
      api.get('/reports/departments').catch(() => null),
      api.get('/reports/booking-heatmap').catch(() => null),
      api.get('/reports/most-used').catch(() => null),
      api.get('/reports/idle').catch(() => null),
      api.get('/reports/maintenance-retirement').catch(() => null),
    ]).then(([utilRes, mainRes, deptRes, heatmapRes, mostUsedRes, idleRes, maintRetRes]) => {
      if (utilRes) setUtilization(utilRes.data)
      if (mainRes) setMaintenanceFreq(mainRes.data || [])
      if (deptRes) setDepartments(deptRes.data || [])
      if (heatmapRes) setBookingHeatmap(heatmapRes.data || [])
      if (mostUsedRes) setMostUsed(mostUsedRes.data || [])
      if (idleRes) setIdleAssets(idleRes.data || [])
      if (maintRetRes) setMaintenanceRetirement(maintRetRes.data)
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
      toast.success('Report exported as CSV!')
    } catch {
      toast.error('Export failed — check your permissions')
    }
  }

  const maintenanceChartData = maintenanceFreq.slice(0, 8).map(m => ({
    name: m.asset_name.length > 12 ? m.asset_name.slice(0, 12) + '…' : m.asset_name,
    frequency: m.maintenance_count,
  }))

  const maintenancePieData = maintenanceFreq.slice(0, 5).map(m => ({
    name: m.asset_name,
    value: m.maintenance_count,
  }))

  const deptChartData = departments.slice(0, 8).map(d => ({
    name: d.department_name.length > 12 ? d.department_name.slice(0, 12) + '…' : d.department_name,
    allocations: d.total_allocations,
  }))

  const heatmapChartData = bookingHeatmap.map(h => ({
    hour: `${h.hour}:00`,
    bookings: h.booking_count,
  }))

  const mostUsedChartData = mostUsed.slice(0, 8).map(a => ({
    name: a.name.length > 12 ? a.name.slice(0, 12) + '…' : a.name,
    uses: a.usage_count,
  }))

  const idleChartData = idleAssets.slice(0, 8).map(a => ({
    name: a.name.length > 12 ? a.name.slice(0, 12) + '…' : a.name,
    days: a.days_idle,
  }))

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[32px] sm:text-[38px] font-black text-foreground tracking-tight">Reports & Analytics</h1>
          <p className="text-text-secondary mt-1">Asset utilization, maintenance trends, and insights</p>
        </div>
        <button onClick={handleExport} className="btn-accent flex items-center justify-center gap-2">
          <Download size={20} />
          Export CSV
        </button>
      </div>

      {/* Report Type Tabs */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-3">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                reportType === tab.id
                  ? 'bg-primary text-background'
                  : 'bg-bg-tertiary text-text-secondary hover:bg-bg-tertiary/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Utilization Tab */}
          {reportType === 'utilization' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="card">
                <h3 className="text-lg font-semibold text-foreground mb-4">Asset Status Breakdown</h3>
                {utilization ? (
                  <>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Allocated', value: utilization.allocated },
                            { name: 'Available', value: utilization.available },
                            { name: 'Maintenance', value: utilization.under_maintenance },
                          ]}
                          cx="50%" cy="50%" outerRadius={80} dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {[0, 1, 2].map(i => <Cell key={i} fill={COLORS[i]} />)}
                        </Pie>
                        <Tooltip contentStyle={CHART_STYLE} />
                      </PieChart>
                    </ResponsiveContainer>
                    <p className="text-sm text-text-secondary mt-3 text-center">
                      Utilization rate:{' '}
                      <span className="text-primary font-bold">{Math.round(utilization.utilization_rate * 100)}%</span>
                    </p>
                  </>
                ) : (
                  <p className="text-text-secondary text-sm text-center py-8">No utilization data available</p>
                )}
              </div>
              <div className="card">
                <h3 className="text-lg font-semibold text-foreground mb-4">Most Used Assets</h3>
                {mostUsedChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={mostUsedChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" {...AXIS_STYLE} />
                      <YAxis {...AXIS_STYLE} />
                      <Tooltip contentStyle={CHART_STYLE} />
                      <Bar dataKey="uses" fill="#00d4ff" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-text-secondary text-sm">
                    No booking data yet
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Maintenance Tab */}
          {reportType === 'maintenance' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="card">
                <h3 className="text-lg font-semibold text-foreground mb-4">Maintenance by Asset</h3>
                {maintenancePieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={maintenancePieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" labelLine={false}>
                        {maintenancePieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={CHART_STYLE} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-text-secondary text-sm">No maintenance data</div>
                )}
              </div>
              <div className="card">
                <h3 className="text-lg font-semibold text-foreground mb-4">Maintenance Frequency by Asset</h3>
                {maintenanceChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={maintenanceChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" {...AXIS_STYLE} />
                      <YAxis {...AXIS_STYLE} />
                      <Tooltip contentStyle={CHART_STYLE} />
                      <Bar dataKey="frequency" fill="#ff6b35" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-text-secondary text-sm">No maintenance data</div>
                )}
              </div>
              {/* Maintenance Due & Retirement */}
              {maintenanceRetirement && (
                <div className="card lg:col-span-2">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Maintenance Due & Nearing Retirement</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-warning mb-2">Due for Maintenance ({maintenanceRetirement.due_for_maintenance.length})</h4>
                      <div className="space-y-2">
                        {maintenanceRetirement.due_for_maintenance.length === 0 ? (
                          <p className="text-text-secondary text-sm">None</p>
                        ) : maintenanceRetirement.due_for_maintenance.slice(0, 5).map(item => (
                          <div key={item.asset_id} className="flex justify-between items-center text-sm">
                            <span className="text-foreground">{item.name}</span>
                            <span className={`text-xs ${item.days_remaining < 0 ? 'text-danger' : 'text-warning'}`}>
                              {item.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-danger mb-2">Nearing Retirement ({maintenanceRetirement.nearing_retirement.length})</h4>
                      <div className="space-y-2">
                        {maintenanceRetirement.nearing_retirement.length === 0 ? (
                          <p className="text-text-secondary text-sm">None</p>
                        ) : maintenanceRetirement.nearing_retirement.slice(0, 5).map(item => (
                          <div key={item.asset_id} className="flex justify-between items-center text-sm">
                            <span className="text-foreground">{item.name}</span>
                            <span className="text-xs text-danger">{item.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Asset Summary Tab */}
          {reportType === 'assets' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="card">
                <h3 className="text-lg font-semibold text-foreground mb-4">Key Metrics</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Total Assets', value: utilization?.total_assets, color: 'text-primary' },
                    { label: 'Allocated', value: utilization?.allocated, color: 'text-success' },
                    { label: 'Available', value: utilization?.available, color: 'text-foreground' },
                    { label: 'Under Maintenance', value: utilization?.under_maintenance, color: 'text-warning' },
                    { label: 'Utilization Rate', value: utilization ? `${Math.round(utilization.utilization_rate * 100)}%` : '—', color: 'text-primary' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex justify-between items-center pb-3 border-b border-border-color last:border-0">
                      <span className="text-text-secondary">{label}</span>
                      <span className={`font-bold text-2xl ${color}`}>{value ?? '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <h3 className="text-lg font-semibold text-foreground mb-4">Idle Assets</h3>
                {idleChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={idleChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" {...AXIS_STYLE} />
                      <YAxis {...AXIS_STYLE} unit="d" />
                      <Tooltip contentStyle={CHART_STYLE} />
                      <Bar dataKey="days" fill="#a855f7" name="Days Idle" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-text-secondary text-sm">
                    No idle assets — all assets are in use
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Departments Tab */}
          {reportType === 'departments' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="card">
                <h3 className="text-lg font-semibold text-foreground mb-4">Allocations by Department</h3>
                {deptChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={deptChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis type="number" {...AXIS_STYLE} />
                      <YAxis type="category" dataKey="name" {...AXIS_STYLE} width={90} />
                      <Tooltip contentStyle={CHART_STYLE} />
                      <Bar dataKey="allocations" fill="#00d98e" name="Active Allocations" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-text-secondary text-sm">
                    No department allocation data yet
                  </div>
                )}
              </div>
              <div className="card">
                <h3 className="text-lg font-semibold text-foreground mb-4">Department Details</h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {departments.length === 0 ? (
                    <p className="text-text-secondary text-sm">No department data</p>
                  ) : departments.map(dept => (
                    <div key={dept.department_id} className="flex justify-between items-center py-2 border-b border-border-color last:border-0">
                      <span className="text-foreground text-sm font-medium">{dept.department_name}</span>
                      <span className="text-primary font-bold">{dept.total_allocations}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Booking Trends Tab */}
          {reportType === 'bookings' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="card">
                <h3 className="text-lg font-semibold text-foreground mb-4">Bookings by Hour of Day</h3>
                {heatmapChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={heatmapChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="hour" {...AXIS_STYLE} />
                      <YAxis {...AXIS_STYLE} />
                      <Tooltip contentStyle={CHART_STYLE} />
                      <Bar dataKey="bookings" fill="#00d4ff" name="Bookings" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[280px] text-text-secondary text-sm">
                    No booking data yet
                  </div>
                )}
              </div>
              <div className="card">
                <h3 className="text-lg font-semibold text-foreground mb-4">Most Booked Resources</h3>
                {mostUsedChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={mostUsedChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" {...AXIS_STYLE} />
                      <YAxis {...AXIS_STYLE} />
                      <Tooltip contentStyle={CHART_STYLE} />
                      <Bar dataKey="uses" fill="#ff6b35" name="Total Bookings" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[280px] text-text-secondary text-sm">
                    No booking data yet
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Insights */}
      <div className="card bg-accent/5 border border-accent/30">
        <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <TrendingUp size={20} className="text-primary" />
          Insights & Recommendations
        </h3>
        <ul className="space-y-2 text-text-secondary text-sm">
          {utilization && utilization.utilization_rate < 0.5 && (
            <li className="flex items-start gap-2">
              <AlertCircle size={14} className="text-warning mt-0.5 shrink-0" />
              Utilization is below 50% — consider reallocating idle assets or reviewing department needs
            </li>
          )}
          {utilization && utilization.under_maintenance > 0 && (
            <li className="flex items-start gap-2">
              <AlertCircle size={14} className="text-warning mt-0.5 shrink-0" />
              {utilization.under_maintenance} asset(s) under maintenance — check for overdue resolution
            </li>
          )}
          {maintenanceRetirement?.due_for_maintenance?.length > 0 && (
            <li className="flex items-start gap-2">
              <AlertCircle size={14} className="text-danger mt-0.5 shrink-0" />
              {maintenanceRetirement.due_for_maintenance.length} asset(s) are due for scheduled maintenance
            </li>
          )}
          {maintenanceRetirement?.nearing_retirement?.length > 0 && (
            <li className="flex items-start gap-2">
              <AlertCircle size={14} className="text-danger mt-0.5 shrink-0" />
              {maintenanceRetirement.nearing_retirement.length} asset(s) nearing end of expected lifespan — plan replacements
            </li>
          )}
          <li>• Peak booking hours show demand patterns — schedule maintenance during off-peak windows</li>
          <li>• Review idle assets periodically and consider reallocation or disposal to optimize costs</li>
        </ul>
      </div>
    </MainLayout>
  )
}
