import React from 'react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import MainLayout from '../../components/layout/MainLayout'
import { Link } from 'react-router-dom'
import { 
  Package, Calendar, Wrench, BarChart3, Plus, 
  TrendingUp, Activity, Sliders, Layers, ShieldCheck,
  ChevronRight, ArrowRight, Server, Terminal, Laptop, Monitor
} from 'lucide-react'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts'
import { motion } from 'framer-motion'

export default function Dashboard() {
  const { assets, bookings, maintenanceItems, notifications } = useData()
  const { user } = useAuth()

  // Calculate statistics
  const totalAssets = assets.length
  const allocatedAssets = assets.filter(a => a.status === 'Allocated').length
  const availableAssets = assets.filter(a => a.status === 'Available').length
  const maintenanceCount = maintenanceItems.filter(m => m.status === 'Pending').length

  // Chart values (using Render themes)
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

  // Render color system: Vibrant Green, Electric Purple, Vibrant Magenta
  const COLORS = ['#00c48c', '#7c3aed', '#d946ef']

  return (
    <MainLayout>
      {/* 5. Persistent Status Bar (Breadcrumb Strip) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#334155] pb-4 mb-6 text-xs text-text-secondary">
        <span className="font-mono uppercase tracking-wider text-text-secondary/40 mr-2 flex items-center gap-1.5">
          <Activity size={12} className="text-primary" /> Active Queries:
        </span>
        {['Region: Global ✕', 'Category: Electronics ✕', 'Status: Active ✕', 'Level: Enterprise ✕'].map((filter, i) => (
          <span 
            key={i} 
            className="px-2.5 py-1 rounded-full bg-[#0d0d12] border border-white/10 hover:border-primary hover:text-white transition-all cursor-pointer font-medium"
          >
            {filter}
          </span>
        ))}
      </div>

      {/* Main Structural Grid split between Sidebar and Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
        
        {/* 2. Configurable Metric Modifier (Left Sidebar) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Layer Selector panel */}
          <div className="card border-[#7c3aed]/20">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-mono flex items-center gap-2">
              <Layers size={14} className="text-accent animate-pulse" /> Layer Selector
            </h3>
            <div className="flex flex-col gap-3 text-xs">
              {[
                { label: 'Hardware Registry', checked: true },
                { label: 'Pending Repair Nodes', checked: true },
                { label: 'Custody Transfer Vectors', checked: false }
              ].map((layer, i) => (
                <label key={i} className="flex items-center gap-2.5 cursor-pointer text-text-secondary hover:text-white transition-colors">
                  <input 
                    type="checkbox" 
                    defaultChecked={layer.checked} 
                    className="rounded border-white/10 bg-[#060608] text-primary focus:ring-primary/20 w-4 h-4"
                  />
                  <span>{layer.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Quantitative ranges */}
          <div className="card border-[#00c48c]/20">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-mono flex items-center gap-2">
              <Sliders size={14} className="text-primary" /> Value Threshold
            </h3>
            <div className="flex flex-col gap-2">
              <input 
                type="range" 
                min="0" 
                max="10000" 
                defaultValue="4200" 
                className="w-full h-1 bg-[#060608] rounded-lg appearance-none cursor-pointer accent-primary border border-white/5" 
              />
              <div className="flex justify-between text-[10px] text-text-secondary/50 font-mono">
                <span>$0</span>
                <span>$4,200 Limit</span>
                <span>$10k+</span>
              </div>
            </div>
          </div>

          {/* Operational metrics checkboxes */}
          <div className="card border-[#d946ef]/20">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-mono flex items-center gap-2">
              <ShieldCheck size={14} className="text-lux-magenta" /> Operations Status
            </h3>
            <div className="flex flex-col gap-3 text-xs">
              {[
                { label: 'Available stock', color: 'bg-primary', checked: true },
                { label: 'Allocated assets', color: 'bg-accent', checked: true },
                { label: 'In maintenance', color: 'bg-warning', checked: false },
                { label: 'Anomalies flagged', color: 'bg-danger', checked: false },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-text-secondary">
                  <span className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                    {item.label}
                  </span>
                  <input 
                    type="checkbox" 
                    defaultChecked={item.checked} 
                    className="rounded border-white/10 bg-[#060608] text-primary focus:ring-primary/20 w-4 h-4"
                  />
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 3. Core Analytical Viewport (Central Canvas) */}
        <div className="lg:col-span-9 flex flex-col gap-8">
          
          {/* Main welcome titles with Terminal Tag */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1 flex items-center gap-3">
                Welcome, <span className="text-gradient">{user?.name}</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary text-background font-mono text-[10px] font-bold rounded-md shadow-md animate-pulse">
                  $ status: active
                </span>
              </h1>
              <p className="text-sm text-text-secondary">Enterprise asset flow and operations overview.</p>
            </div>
          </div>

          {/* Visual Grid Stats Cards (With color highlights & custom borders) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Assets', val: totalAssets, sub: '+2 this month', icon: Package, iconColor: 'text-accent', border: 'border-[#7c3aed]/30 hover:border-[#7c3aed]/60 shadow-[#7c3aed]/5' },
              { label: 'Allocated', val: allocatedAssets, sub: `${Math.round(allocatedAssets / (totalAssets || 1) * 100)}% utilization`, icon: TrendingUp, iconColor: 'text-primary', border: 'border-[#00c48c]/30 hover:border-[#00c48c]/60 shadow-[#00c48c]/5' },
              { label: 'Available', val: availableAssets, sub: `${bookings.length} pending bookings`, icon: Calendar, iconColor: 'text-lux-magenta', border: 'border-[#d946ef]/30 hover:border-[#d946ef]/60 shadow-[#d946ef]/5' },
              { label: 'Maintenance', val: maintenanceCount, sub: 'Needs attention', icon: Wrench, iconColor: 'text-danger', border: 'border-danger/30 hover:border-danger/60 shadow-danger/5' },
            ].map((stat, idx) => {
              const IconComp = stat.icon
              return (
                <div key={idx} className={`card group hover:scale-[1.02] transition-all duration-300 shadow-md ${stat.border}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider">{stat.label}</p>
                      <p className="text-3xl font-bold text-white mt-1.5">{stat.val}</p>
                    </div>
                    <div className={`p-2.5 rounded-lg bg-white/5 ${stat.iconColor} group-hover:scale-110 transition-transform`}>
                      <IconComp size={20} />
                    </div>
                  </div>
                  <p className={`text-[10px] font-semibold mt-3 ${
                    idx === 3 && stat.val > 0 ? 'text-danger' : 'text-text-secondary/60'
                  }`}>{stat.sub}</p>
                </div>
              )
            })}
          </div>

          {/* Analytics Charts (Using Glowing Green Area Gradient) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Asset Utilization Trend (8 columns) */}
            <div className="lg:col-span-8 card border-[#00c48c]/20">
              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider font-mono flex items-center gap-2">
                <TrendingUp size={16} className="text-primary" /> Asset Utilization Trend
              </h3>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={utilizationData}>
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00c48c" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#00c48c" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ 
                        background: '#0d0d12', 
                        border: '1px solid rgba(255,255,255,0.07)', 
                        borderRadius: '8px', 
                        color: '#ffffff',
                        fontSize: '12px'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="utilization" 
                      stroke="#00c48c" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#chartGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Ratio Pie (4 columns) */}
            <div className="lg:col-span-4 card border-[#7c3aed]/20 flex flex-col justify-between">
              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider font-mono flex items-center gap-2">
                <Activity size={16} className="text-accent" /> Category Ratio
              </h3>
              <div className="w-full h-44 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={categoryData} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={48} 
                      outerRadius={68} 
                      paddingAngle={4} 
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        background: '#0d0d12', 
                        border: '1px solid rgba(255,255,255,0.07)', 
                        borderRadius: '8px', 
                        color: '#ffffff',
                        fontSize: '11px'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-1.5 text-[10px] text-text-secondary/70 border-t border-white/10 pt-3 mt-3">
                {categoryData.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      {cat.name}
                    </span>
                    <span className="font-mono text-white font-bold">{cat.value} items</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Quick Actions & Recent Activity widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Quick Actions panel */}
            <div className="card">
              <h3 className="text-sm font-bold text-white mb-5 uppercase tracking-wider font-mono">Platform Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Register Asset', path: '/assets', icon: Plus, bg: 'bg-[#00c48c]/10 border-[#00c48c]/30 hover:bg-[#00c48c]/20 text-[#00c48c] hover:border-[#00c48c]' },
                  { label: 'Book Resource', path: '/bookings', icon: Calendar, bg: 'bg-[#7c3aed]/10 border-[#7c3aed]/30 hover:bg-[#7c3aed]/20 text-[#7c3aed] hover:border-[#7c3aed]' },
                  { label: 'File Repair', path: '/maintenance', icon: Wrench, bg: 'bg-[#F59E0B]/10 border-[#F59E0B]/30 hover:bg-[#F59E0B]/20 text-[#F59E0B] hover:border-[#F59E0B]' },
                  { label: 'Pull Reports', path: '/reports', icon: BarChart3, bg: 'bg-[#10B981]/10 border-[#10B981]/30 hover:bg-[#10B981]/20 text-[#10B981] hover:border-[#10B981]' }
                ].map((action, i) => {
                  const Icon = action.icon
                  return (
                    <Link
                      key={i}
                      to={action.path}
                      className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all hover:scale-[1.03] text-center gap-2 ${action.bg}`}
                    >
                      <Icon size={18} />
                      <span className="text-xs font-bold text-white">{action.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Recent Notification Feed */}
            <div className="card flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white mb-5 uppercase tracking-wider font-mono">Logistics Feed</h3>
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((notif) => (
                    <div key={notif.id} className="flex gap-3 pb-3 border-b border-white/5 last:border-0 last:pb-0 items-start text-xs">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.read ? 'bg-text-secondary/30' : 'bg-primary shadow-[0_0_6px_#00c48c]'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{notif.title}</p>
                        <p className="text-[10px] text-text-secondary/50 mt-0.5">{notif.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Link to="/notifications" className="text-primary hover:text-white text-xs font-semibold mt-4 inline-flex items-center gap-1">
                View audit trail <ArrowRight size={12} />
              </Link>
            </div>

          </div>

          {/* 4. Inline Trend Aggregators (Bottom Floating Layer) */}
          <div className="bg-[#0d0d12]/75 border border-white/10 backdrop-blur-md rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center text-xs shadow-2xl hover:border-[#00c48c]/30 transition-colors duration-300">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
              <span className="text-text-secondary font-medium font-mono uppercase tracking-wider">Operational Summary</span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-[11px]">
              <div>
                <span className="text-text-secondary/60">Asset Depreciation: </span>
                <span className="text-white font-bold font-mono">14.2% YoY</span>
              </div>
              <div>
                <span className="text-text-secondary/60">Allocation Velocity: </span>
                <span className="text-white font-bold font-mono text-primary">+8.4% MoM</span>
              </div>
              <div>
                <span className="text-text-secondary/60">Active Vector Transfers: </span>
                <span className="text-white font-bold font-mono text-accent">5 Streams</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Render-Style Technology Bar (Horizontal Purple Brand blocks, matching Screenshot 3) */}
      <div className="mt-8 border-t border-white/5 pt-8">
        <h3 className="text-[10px] font-bold text-text-secondary/40 uppercase tracking-widest mb-4 font-mono text-center">
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
                className="flex items-center gap-2.5 px-4 py-3 bg-[#7c3aed] text-white rounded-lg font-mono text-xs font-bold shadow-lg shadow-[#7c3aed]/10 hover:scale-105 hover:bg-[#8b5cf6] transition-all cursor-pointer"
              >
                <Icon size={14} />
                <span>{tech.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </MainLayout>
  )
}
