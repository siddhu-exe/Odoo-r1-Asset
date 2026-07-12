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
  ChevronRight,
  LayoutDashboard,
  Bell,
  Activity,
  TrendingUp
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

            <div className="rounded-[24px] bg-white border border-black/5 shadow-[0_14px_34px_rgba(17,17,17,0.06)] p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-black mb-5">Platform Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                      className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-black/5 bg-white p-5 text-center shadow-[0_4px_12px_rgba(17,17,17,0.02)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(17,17,17,0.08)]"
                    >
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${action.bg} transition-transform group-hover:scale-110`}>
                        <Icon size={20} />
                      </div>
                      <span className="text-xs font-semibold text-black/85 tracking-wide">{action.label}</span>
                    </Link>
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