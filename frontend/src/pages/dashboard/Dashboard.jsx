import React, { useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import MainLayout from '../../components/layout/MainLayout'
import {
  Package,
  Calendar,
  Wrench,
  BarChart3,
  Plus,
  TrendingUp,
  Activity,
  Layers,
  ChevronRight,
  ArrowRight,
  Server,
  Terminal,
  Laptop,
  Monitor,
  LayoutDashboard,
  Bell
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList
} from 'recharts'

export default function Dashboard() {
  const { assets, bookings, maintenanceItems, notifications } = useData()
  const { user } = useAuth()
  const location = useLocation()

  useEffect(() => {
    document.body.classList.add('dashboard-page')
    return () => {
      document.body.classList.remove('dashboard-page')
    }
  }, [])

  const totalAssets = assets.length
  const allocatedAssets = assets.filter(a => a.status === 'Allocated').length
  const availableAssets = assets.filter(a => a.status === 'Available').length
  const maintenanceCount = maintenanceItems.filter(m => m.status === 'Pending').length

  const utilizationData = [
    { month: 'Jan', utilization: 62 },
    { month: 'Feb', utilization: 74 },
    { month: 'Mar', utilization: 69 },
    { month: 'Apr', utilization: 81 },
    { month: 'May', utilization: 88 },
    { month: 'Jun', utilization: 85 }
  ]

  const categoryData = [
    { name: 'IT Devices', value: assets.filter(a => a.category === 'Electronics').length || 3 },
    { name: 'Infrastructure', value: assets.filter(a => a.category === 'Furniture').length || 2 },
    { name: 'Licensing/Other', value: assets.filter(a => !['Electronics', 'Furniture'].includes(a.category)).length || 1 }
  ]

  const barData = [
    { label: 'Mon', value: 48 },
    { label: 'Tue', value: 58 },
    { label: 'Wed', value: 51 },
    { label: 'Thu', value: 68 },
    { label: 'Fri', value: 64 },
    { label: 'Sat', value: 76 },
    { label: 'Today', value: 88, highlight: true }
  ]

  const donutData = [
    { name: 'Neutral category', value: 46, color: '#C9CCD3' },
    { name: 'Purple', value: 31, color: '#8B7FE8' },
    { name: 'Orange', value: 23, color: '#FF5A3C' }
  ]

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Assets', path: '/assets', icon: Package },
    { label: 'Allocation & Transfer', path: '/allocation', icon: ChevronRight },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
    { label: 'Notifications', path: '/notifications', icon: Bell }
  ]

  const eventRows = [
    { initials: 'AS', label: 'Asset sync review', tone: '#FF5A3C' },
    { initials: 'PR', label: 'Procurement approval', tone: '#8B7FE8' },
    { initials: 'OP', label: 'Operations handoff', tone: '#FF5A3C' }
  ]

  const renderTodayLabel = ({ x, y, width, payload }) => {
    if (!payload?.highlight) return null

    return (
      <g>
        <rect x={x + width / 2 - 28} y={y - 30} width={56} height={22} rx={11} fill="#FF5A3C" />
        <text x={x + width / 2} y={y - 15} textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">
          Today
        </text>
      </g>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-full -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8 bg-background relative">
        <div className="flex flex-wrap items-center gap-2 border-b border-black/10 pb-4 mb-6 text-xs text-[#6B7280]">
          <span className="font-mono uppercase tracking-wider text-black/35 mr-2 flex items-center gap-1.5">
            <Activity size={12} className="text-primary" /> Active Queries:
          </span>
          {['Region: Global ✕', 'Category: Electronics ✕', 'Status: Active ✕', 'Level: Enterprise ✕'].map((filter, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-full bg-white border border-black/10 text-black/70 hover:border-primary hover:text-primary transition-all cursor-pointer font-medium shadow-[0_6px_20px_rgba(17,17,17,0.04)]"
            >
              {filter}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="bg-[#EFEFEF] rounded-[24px] border border-black/5 shadow-[0_14px_34px_rgba(17,17,17,0.06)] p-5 relative overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-white"
                  />
                  <div className="absolute -left-1 -bottom-1 rounded-full bg-[#FF5A3C] text-white text-[10px] font-bold px-2.5 py-1 shadow-[0_8px_20px_rgba(255,90,60,0.28)]">
                    4.9
                  </div>
                </div>
                <div className="min-w-0 pt-1">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-black/45 font-semibold">Profile</p>
                  <h2 className="text-lg font-black text-black truncate mt-1">{user?.name}</h2>
                  <p className="text-sm text-[#6B7280] truncate">{user?.department}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/75 px-4 py-3 text-xs text-black/70">
                <span className="font-medium">Operations score</span>
                <span className="font-bold text-black">92%</span>
              </div>
            </div>

            <div className="bg-white rounded-[24px] border border-black/5 shadow-[0_14px_34px_rgba(17,17,17,0.06)] p-5">
              <p className="text-[11px] uppercase tracking-[0.28em] text-black/45 font-semibold mb-4">Navigation</p>
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const active = location.pathname === item.path

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`relative flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors ${
                        active ? 'bg-[#FFF2EE] text-[#FF5A3C]' : 'text-black/65 hover:bg-black/5'
                      }`}
                    >
                      {active && <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-[#FF5A3C]" />}
                      <Icon size={18} className={active ? 'text-[#FF5A3C]' : 'text-black/55'} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            <div className="rounded-[24px] bg-[#111111] text-white shadow-[0_18px_40px_rgba(17,17,17,0.18)] p-5">
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/55 font-semibold">Focus</p>
              <h3 className="mt-3 text-xl font-black leading-tight">Check the latest queue before approving transfers.</h3>
              <p className="mt-3 text-sm text-white/70">Keep the workflow clean, then move to the next batch.</p>
              <button className="mt-5 inline-flex items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-[1.02] active:scale-[0.98]">
                Check Now
              </button>
            </div>

            <div className="rounded-[24px] bg-white border border-black/5 shadow-[0_14px_34px_rgba(17,17,17,0.06)] p-5">
              <h3 className="text-sm font-black text-black uppercase tracking-[0.24em] mb-4 flex items-center gap-2">
                <Layers size={14} className="text-[#FF5A3C]" /> Layer Selector
              </h3>
              <div className="flex flex-col gap-3 text-xs">
                {[
                  { label: 'Hardware Registry', checked: true },
                  { label: 'Pending Repair Nodes', checked: true },
                  { label: 'Custody Transfer Vectors', checked: false }
                ].map((layer, i) => (
                  <label key={i} className="flex items-center gap-2.5 cursor-pointer text-black/65 hover:text-black transition-colors">
                    <input
                      type="checkbox"
                      defaultChecked={layer.checked}
                      className="rounded border-black/20 bg-white text-[#FF5A3C] focus:ring-[#FF5A3C]/20 w-4 h-4"
                    />
                    <span>{layer.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] bg-white border border-black/5 shadow-[0_14px_34px_rgba(17,17,17,0.06)] p-5">
              <h3 className="text-sm font-black text-black uppercase tracking-[0.24em] mb-4 flex items-center gap-2">
                <TrendingUp size={14} className="text-[#FF5A3C]" /> Value Threshold
              </h3>
              <div className="flex flex-col gap-2">
                <input
                  type="range"
                  min="0"
                  max="10000"
                  defaultValue="4200"
                  className="w-full h-1.5 bg-black/10 rounded-lg appearance-none cursor-pointer accent-[#FF5A3C]"
                />
                <div className="flex justify-between text-[10px] text-black/45 font-mono">
                  <span>$0</span>
                  <span>$4,200 Limit</span>
                  <span>$10k+</span>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] bg-white border border-black/5 shadow-[0_14px_34px_rgba(17,17,17,0.06)] p-5">
              <h3 className="text-sm font-black text-black uppercase tracking-[0.24em] mb-4 flex items-center gap-2">
                <Activity size={14} className="text-[#8B7FE8]" /> Operations Status
              </h3>
              <div className="flex flex-col gap-3 text-xs">
                {[
                  { label: 'Available stock', color: 'bg-[#FF5A3C]', checked: true },
                  { label: 'Allocated assets', color: 'bg-[#8B7FE8]', checked: true },
                  { label: 'In maintenance', color: 'bg-black', checked: false },
                  { label: 'Anomalies flagged', color: 'bg-[#C9CCD3]', checked: false }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-black/65">
                    <span className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                      {item.label}
                    </span>
                    <input
                      type="checkbox"
                      defaultChecked={item.checked}
                      className="rounded border-black/20 bg-white text-[#FF5A3C] focus:ring-[#FF5A3C]/20 w-4 h-4"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] bg-white border border-black/5 shadow-[0_14px_34px_rgba(17,17,17,0.06)] p-5">
              <h3 className="text-sm font-black text-black uppercase tracking-[0.24em] mb-4">Platform Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Register Asset', icon: Plus, bg: 'bg-[#FF5A3C] text-white' },
                  { label: 'Book Resource', icon: Calendar, bg: 'bg-[#8B7FE8] text-white' },
                  { label: 'File Repair', icon: Wrench, bg: 'bg-black text-white' },
                  { label: 'Pull Reports', icon: BarChart3, bg: 'bg-black/5 text-black' }
                ].map((action) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={action.label}
                      className="flex flex-col items-center justify-center gap-2 rounded-[22px] border border-black/5 bg-white px-4 py-4 text-center shadow-[0_10px_24px_rgba(17,17,17,0.05)] transition-transform hover:scale-[1.02]"
                    >
                      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${action.bg}`}>
                        <Icon size={18} />
                      </div>
                      <span className="text-xs font-semibold text-black/80">{action.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-[24px] bg-white border border-black/5 shadow-[0_14px_34px_rgba(17,17,17,0.06)] p-5">
              <h3 className="text-sm font-black text-black uppercase tracking-[0.24em] mb-4">Logistics Feed</h3>
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notif) => (
                  <div key={notif.id} className="flex gap-3 pb-3 border-b border-black/5 last:border-0 last:pb-0 items-start text-xs">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.read ? 'bg-black/20' : 'bg-[#FF5A3C] shadow-[0_0_6px_rgba(255,90,60,0.28)]'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-black font-medium truncate">{notif.title}</p>
                      <p className="text-[10px] text-black/45 mt-0.5">{notif.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/notifications" className="text-[#FF5A3C] hover:text-black text-xs font-semibold mt-4 inline-flex items-center gap-1">
                View audit trail <ArrowRight size={12} />
              </Link>
            </div>

            <div className="rounded-[24px] bg-white border border-black/5 shadow-[0_14px_34px_rgba(17,17,17,0.06)] p-4 flex flex-col sm:flex-row gap-4 justify-between items-center text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#FF5A3C] animate-pulse" />
                <span className="text-black/55 font-medium font-mono uppercase tracking-wider">Operational Summary</span>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-[11px]">
                <div>
                  <span className="text-black/45">Asset Depreciation: </span>
                  <span className="text-black font-bold font-mono">14.2% YoY</span>
                </div>
                <div>
                  <span className="text-black/45">Allocation Velocity: </span>
                  <span className="text-[#FF5A3C] font-bold font-mono">+8.4% MoM</span>
                </div>
                <div>
                  <span className="text-black/45">Active Vector Transfers: </span>
                  <span className="text-[#8B7FE8] font-bold font-mono">5 Streams</span>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] bg-white border border-black/5 shadow-[0_14px_34px_rgba(17,17,17,0.06)] p-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-black/45 text-center mb-4">
                Verified Asset Architectures & Ecosystem Integrations
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { label: 'Dell Server Rack', icon: Server },
                  { label: 'Apple Mac Studio', icon: Laptop },
                  { label: 'Cisco Routing Hub', icon: Activity },
                  { label: 'Samsung Displays', icon: Monitor },
                  { label: 'Android Mobile SDK', icon: Terminal },
                  { label: 'Docker container', icon: Layers }
                ].map((tech, idx) => {
                  const Icon = tech.icon
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 rounded-full border border-black/5 bg-white px-4 py-3 text-xs font-semibold text-black/70 shadow-[0_8px_20px_rgba(17,17,17,0.04)]"
                    >
                      <Icon size={14} className="text-[#FF5A3C]" />
                      <span>{tech.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-9 flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-[38px] sm:text-[40px] font-black text-black tracking-tight">Dashboard</h1>
                <p className="mt-2 text-sm text-[#6B7280]">Enterprise asset flow and operations overview.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: 'Total Assets',
                  val: totalAssets,
                  sub: '+2 this month',
                  icon: Package,
                  tone: 'orange'
                },
                {
                  label: 'Allocated',
                  val: allocatedAssets,
                  sub: `${Math.round(allocatedAssets / (totalAssets || 1) * 100)}% utilization`,
                  icon: TrendingUp,
                  tone: 'purple'
                },
                {
                  label: 'Available',
                  val: availableAssets,
                  sub: `${bookings.length} pending bookings`,
                  icon: Calendar,
                  tone: 'light'
                },
                {
                  label: 'Maintenance',
                  val: maintenanceCount,
                  sub: 'Needs attention',
                  icon: Wrench,
                  tone: 'dark'
                }
              ].map((stat, idx) => {
                const IconComp = stat.icon

                const toneClasses = {
                  orange: 'bg-[#FF5A3C] text-white',
                  purple: 'bg-[#8B7FE8] text-white',
                  light: 'bg-white text-black border border-black/8',
                  dark: 'bg-[#1A1A1A] text-white'
                }

                const iconBoxClasses = {
                  orange: 'bg-white/18 text-white border border-white/18',
                  purple: 'bg-white/18 text-white border border-white/18',
                  light: 'bg-[#FFF1EC] text-[#FF5A3C]',
                  dark: 'bg-white/12 text-white border border-white/12'
                }

                return (
                  <div
                    key={idx}
                    className={`rounded-[24px] p-5 shadow-[0_14px_34px_rgba(17,17,17,0.08)] ${toneClasses[stat.tone]}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className={`text-sm font-medium ${stat.tone === 'light' ? 'text-black/55' : 'text-white/75'}`}>
                          {stat.label}
                        </p>
                        <p className={`mt-2 text-[34px] leading-none font-black ${stat.tone === 'light' ? 'text-black' : 'text-white'}`}>
                          {stat.val}
                        </p>
                        <p className={`mt-3 text-sm ${stat.tone === 'light' ? 'text-black/55' : 'text-white/75'}`}>
                          {stat.sub}
                        </p>
                      </div>
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconBoxClasses[stat.tone]}`}>
                        <IconComp size={20} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 rounded-[24px] bg-white border border-black/5 shadow-[0_14px_34px_rgba(17,17,17,0.06)] p-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-black mb-6 flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#FF5A3C]" /> Daily Activity
                </h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 28, right: 6, left: -8, bottom: 0 }}>
                      <XAxis dataKey="label" axisLine={false} tickLine={false} stroke="#6B7280" fontSize={12} />
                      <YAxis axisLine={false} tickLine={false} stroke="#6B7280" fontSize={12} />
                      <Tooltip
                        cursor={{ fill: 'rgba(255, 90, 60, 0.08)' }}
                        contentStyle={{
                          background: '#FFFFFF',
                          border: '1px solid #E5E7EB',
                          borderRadius: '16px',
                          color: '#111111',
                          fontSize: '12px',
                          boxShadow: '0 14px 30px rgba(17,17,17,0.08)'
                        }}
                      />
                      <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={28}>
                        {barData.map((entry, index) => (
                          <Cell key={`bar-${index}`} fill={entry.highlight ? '#FF5A3C' : '#1A1A1A'} />
                        ))}
                        <LabelList content={renderTodayLabel} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-4 rounded-[24px] bg-white border border-black/5 shadow-[0_14px_34px_rgba(17,17,17,0.06)] p-6 flex flex-col">
                <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-black mb-6 flex items-center gap-2">
                  <Activity size={16} className="text-[#8B7FE8]" /> Asset Mix
                </h3>
                <div className="flex-1 min-h-[230px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={74} outerRadius={108} paddingAngle={3}>
                        {donutData.map((entry, index) => (
                          <Cell key={`donut-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: '#FFFFFF',
                          border: '1px solid #E5E7EB',
                          borderRadius: '16px',
                          color: '#111111',
                          fontSize: '12px',
                          boxShadow: '0 14px 30px rgba(17,17,17,0.08)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-3 border-t border-black/5 pt-4">
                  {donutData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2.5 text-black/75">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-semibold text-black">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-[24px] bg-white border border-black/5 shadow-[0_14px_34px_rgba(17,17,17,0.06)] p-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-black mb-5">Platform Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Register Asset', path: '/assets', icon: Plus, bg: 'bg-[#FFF2EE] text-[#FF5A3C]' },
                    { label: 'Book Resource', path: '/bookings', icon: Calendar, bg: 'bg-[#F0ECFF] text-[#8B7FE8]' },
                    { label: 'File Repair', path: '/maintenance', icon: Wrench, bg: 'bg-black/5 text-black' },
                    { label: 'Pull Reports', path: '/reports', icon: BarChart3, bg: 'bg-black text-white' }
                  ].map((action, i) => {
                    const Icon = action.icon
                    return (
                      <Link
                        key={i}
                        to={action.path}
                        className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-black/5 p-4 text-center transition-transform hover:scale-[1.02]"
                      >
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${action.bg}`}>
                          <Icon size={18} />
                        </div>
                        <span className="text-xs font-semibold text-black/80">{action.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-[24px] bg-white border border-black/5 shadow-[0_14px_34px_rgba(17,17,17,0.06)] p-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-black mb-5">Today's Events</h3>
                <div className="relative pl-3">
                  <div className="absolute left-5 top-2 bottom-2 border-l-2 border-dashed border-black/12" />
                  <div className="space-y-4">
                    {eventRows.map((event, index) => (
                      <div key={event.label} className="relative flex items-center gap-3">
                        <div
                          className="absolute left-0 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-[11px] font-bold text-white shadow-[0_10px_24px_rgba(17,17,17,0.12)]"
                          style={{ backgroundColor: event.tone }}
                        >
                          {event.initials}
                        </div>
                        <div className="ml-10 flex-1 rounded-full px-4 py-3 text-white shadow-[0_10px_24px_rgba(17,17,17,0.08)]" style={{ backgroundColor: event.tone }}>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-sm font-semibold">{event.label}</span>
                            <span className="text-[11px] font-medium text-white/80">
                              {index === 0 ? '09:30' : index === 1 ? '11:00' : '14:30'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] bg-white border border-black/5 shadow-[0_14px_34px_rgba(17,17,17,0.06)] p-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-black/45 text-center mb-4">
                Verified Asset Architectures & Ecosystem Integrations
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { label: 'Dell Server Rack', icon: Server },
                  { label: 'Apple Mac Studio', icon: Laptop },
                  { label: 'Cisco Routing Hub', icon: Activity },
                  { label: 'Samsung Displays', icon: Monitor },
                  { label: 'Android Mobile SDK', icon: Terminal },
                  { label: 'Docker container', icon: Layers }
                ].map((tech, idx) => {
                  const Icon = tech.icon
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 rounded-full border border-black/5 bg-black/3 px-4 py-3 text-xs font-semibold text-black/70 shadow-[0_8px_20px_rgba(17,17,17,0.04)]"
                    >
                      <Icon size={14} className="text-[#FF5A3C]" />
                      <span>{tech.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}