import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  ArrowRight, Shield, Award, Users, 
  Layers, CheckCircle, BarChart3, Database, 
  Workflow, FileSpreadsheet, Globe, ChevronDown 
} from 'lucide-react'
import LandingNavbar from '../components/layout/LandingNavbar'
import CornerBorders from '../components/ui/CornerBorders'

// Lightweight viewport counter component
function NumberCounter({ value, suffix = '', duration = 1.5 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0
        const end = parseInt(value)
        if (start === end) return
        
        let totalMiliseconds = duration * 1000
        let incrementTime = Math.max(Math.floor(totalMiliseconds / end), 12)
        
        let timer = setInterval(() => {
          start += Math.ceil(end / (totalMiliseconds / incrementTime))
          if (start >= end) {
            clearInterval(timer)
            setCount(end)
          } else {
            setCount(start)
          }
        }, incrementTime)
        
        return () => clearInterval(timer)
      }
    }, { threshold: 0.1 })
    
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value, duration])
  
  return (
    <span ref={ref} className="font-bold text-4xl sm:text-5xl text-foreground">
      {count.toLocaleString()}{suffix}
    </span>
  )
}

export default function LandingPage() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [maskState, setMaskState] = useState('initial')
  const [langOpen, setLangOpen] = useState(false)
  const [lang, setLang] = useState('EN')

  // Set up mouse move tracker for reactive elements
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Set up scroll tracker
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight
      if (totalScroll > 0) {
        setScrollProgress(window.scrollY / totalScroll)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Trigger Apple mask reveal
  useEffect(() => {
    const timer = setTimeout(() => {
      setMaskState('animate')
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  const maskVariants = {
    initial: {
      width: '65vw',
      height: '70vh',
      borderRadius: '48px',
      opacity: 0,
      scale: 0.82,
      filter: 'blur(20px)',
    },
    animate: {
      width: '100vw',
      height: '100vh',
      borderRadius: '0px',
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 1.6,
        ease: [0.16, 1, 0.3, 1] // Power4.Out equivalent
      }
    }
  }

  // Staggered word animation
  const titleText = "Next-Generation Enterprise Asset Flow."
  const titleWords = titleText.split(' ')

  const wordVariants = {
    hidden: { opacity: 0, y: 60, filter: 'blur(15px)' },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        delay: 0.5 + i * 0.08,
        duration: 0.8,
        ease: 'easeOut'
      }
    })
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative selection:bg-primary selection:text-white bg-grid-pattern">

      {/* Dynamic Cursor Blob Follower */}
      <motion.div
        className="cursor-blob hidden md:block"
        animate={{ x: mousePos.x, y: mousePos.y }}
        transition={{ type: 'spring', damping: 35, stiffness: 220, mass: 0.4 }}
        style={{ left: 0, top: 0, position: 'fixed' }}
      />

      {/* Dotted Scroll Progress Indicator */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4 items-center hidden sm:flex">
        <span className="text-[9px] text-text-secondary/50 rotate-90 mb-5 font-mono tracking-widest uppercase">Scroll</span>
        <div className="w-[1.5px] h-32 bg-border-color relative">
          <motion.div
            className="absolute top-0 w-full bg-primary shadow-[0_0_10px_var(--accent)]"
            style={{ height: `${scrollProgress * 100}%` }}
          />
        </div>
        <div className="flex flex-col gap-2 mt-4">
          <div className={`w-1.5 h-1.5 rounded-full transition-colors ${scrollProgress < 0.25 ? 'bg-primary shadow-[0_0_6px_var(--accent)]' : 'bg-border-color'}`} />
          <div className={`w-1.5 h-1.5 rounded-full transition-colors ${scrollProgress >= 0.25 && scrollProgress < 0.65 ? 'bg-primary shadow-[0_0_6px_var(--accent)]' : 'bg-border-color'}`} />
          <div className={`w-1.5 h-1.5 rounded-full transition-colors ${scrollProgress >= 0.65 ? 'bg-primary shadow-[0_0_6px_var(--accent)]' : 'bg-border-color'}`} />
        </div>
      </div>

      {/* Floating Language Switcher */}
      <div className="fixed left-6 bottom-6 z-50">
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-lux text-xs font-semibold text-text-secondary hover:text-foreground border border-border-color hover:border-primary/40 transition-all duration-300"
          >
            <Globe size={12} className="text-primary" />
            <span>{lang}</span>
            <ChevronDown size={10} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {langOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: -8, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full left-0 mb-2 w-24 rounded-lg glass-lux p-1 shadow-2xl border border-border-color text-xs flex flex-col gap-1 overflow-hidden"
              >
                {['EN', 'AE', 'DE', 'FR'].map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLang(l); setLangOpen(false); }}
                    className={`w-full py-1.5 px-2 rounded text-left hover:bg-bg-tertiary transition-colors ${lang === l ? 'text-primary font-bold bg-bg-tertiary' : 'text-text-secondary'}`}
                  >
                    {l === 'AE' ? 'العربية' : l}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Landing Navbar */}
      <LandingNavbar />

      {/* HERO SECTION */}
      <div className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-background">

        {/* Apple-style Mask Reveal Wrapper around the 3D Canvas */}
        <motion.div
          variants={maskVariants}
          initial="initial"
          animate={maskState}
          className="absolute overflow-hidden bg-background flex items-center justify-center shadow-2xl shadow-accent/10 border border-border-color"
        >
          {/* Static visual fallback replaces the WebGL scene */}
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(232,98,44,0.16)_0%,rgba(245,241,234,0.55)_38%,rgba(245,241,234,0.96)_72%)]" />
          <div className="absolute inset-0 z-0 opacity-80 bg-[linear-gradient(135deg,rgba(91,138,114,0.12),transparent_35%,rgba(212,162,76,0.10)_70%,transparent_100%)]" />
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_42%,rgba(43,43,40,0.05)_0,transparent_18%),radial-gradient(circle_at_50%_58%,rgba(91,138,114,0.14)_0,transparent_24%)]" />

          {/* Visual gradient overlays for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-transparent to-background/85 z-10 pointer-events-none" />

          {/* Hero Content */}
          <div className="relative z-20 max-w-5xl mx-auto px-6 text-center flex flex-col items-center">

            {/* Soft floating glow indicators */}
            <div className="absolute -top-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            {/* Sub-header badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bg-secondary border border-border-color text-chart-5 text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-md"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_6px_var(--accent)]" />
              Enterprise Management Reimagined
            </motion.div>

            {/* Headline with word-by-word reveal */}
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tight leading-[1.05] text-foreground">
              {titleWords.map((word, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={wordVariants}
                  initial="hidden"
                  animate="visible"
                  className="inline-block mr-2 sm:mr-4 text-gradient-lux"
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            {/* Subtext description */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="mt-6 text-base sm:text-xl text-text-secondary max-w-2xl text-center leading-relaxed"
            >
              Streamline and control corporate hardware registries, conflict-free scheduling, maintenance pipelines, and compliance audits with high-performance visualization.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.8 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center w-full sm:w-auto"
            >
              <Link
                to="/login"
                className="btn-primary w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-accent to-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-accent/30 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-300 group"
              >
                <span>Get Started Now</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto px-8 py-4 bg-bg-secondary border border-border-color hover:border-primary/40 font-semibold rounded-xl text-foreground hover:bg-bg-tertiary hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center backdrop-blur-md"
              >
                Explore Features
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* FEATURE GRID SECTION */}
      <section id="features" className="py-24 relative z-20 max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Parallax Floating Mesh background elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Architected For Scalability</h2>
          <p className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Enterprise tools tailored for speed and accuracy
          </p>
          <div className="w-16 h-[2px] bg-gradient-to-r from-accent to-primary mx-auto mt-6" />
        </div>

        {/* 12-Column Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Card 1: Asset Directory (6 columns) */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="md:col-span-6 cursor-pointer"
          >
            <CornerBorders className="glass-lux-card p-8 h-full glow-hover rounded-xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
                  <Database size={24} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Centralized Asset Directory</h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-6">
                  Catalog and monitor every item inside your organization. Filter by custodian, department, status, or asset model in an instant with real-time reactive lookup tables.
                </p>
              </div>
              <div className="border-t border-border-color pt-4 flex items-center justify-between text-xs text-primary font-semibold">
                <span>REACTIVE MOCK DATA INSTALLED</span>
                <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">Details <ArrowRight size={12} /></span>
              </div>
            </CornerBorders>
          </motion.div>

          {/* Card 2: Bookings (6 columns) */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="md:col-span-6 cursor-pointer"
          >
            <CornerBorders className="glass-lux-card p-8 h-full glow-hover rounded-xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-chart-5/10 border border-chart-5/20 flex items-center justify-center text-chart-5 mb-6">
                  <Workflow size={24} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Conflict-Free Bookings</h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-6">
                  Schedule assets dynamically with calendar overlays. The platform auto-detects schedule collisions and overlapping dates, preventing dual-custody errors before they occur.
                </p>
              </div>
              <div className="border-t border-border-color pt-4 flex items-center justify-between text-xs text-chart-5 font-semibold">
                <span>SCHEDULER ENGINE ACTIVE</span>
                <span className="flex items-center gap-1">Details <ArrowRight size={12} /></span>
              </div>
            </CornerBorders>
          </motion.div>

          {/* Card 3: Kanban maintenance (7 columns) */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="md:col-span-7 cursor-pointer"
          >
            <CornerBorders className="glass-lux-card p-8 h-full glow-hover rounded-xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-6">
                  <Layers size={24} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Kanban Maintenance Board</h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-6">
                  Track repair operations across five stages: Pending, Approved, Assigned, In Progress, and Resolved. Drag cards to update statuses and trigger email notifications instantly.
                </p>
              </div>
              <div className="border-t border-border-color pt-4 flex items-center justify-between text-xs text-accent font-semibold">
                <span>INTERACTIVE DRAG-N-DROP</span>
                <span className="flex items-center gap-1">Details <ArrowRight size={12} /></span>
              </div>
            </CornerBorders>
          </motion.div>

          {/* Card 4: Reports & Audits (5 columns) */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="md:col-span-5 cursor-pointer"
          >
            <CornerBorders className="glass-lux-card p-8 h-full glow-hover rounded-xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-chart-4/10 border border-chart-4/20 flex items-center justify-center text-chart-4 mb-6">
                  <BarChart3 size={24} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Audits & Reports</h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-6">
                  Run scheduled audits to flag discrepancy items and export PDF summaries. Track deprecation rates and hardware statuses with Recharts interactive panels.
                </p>
              </div>
              <div className="border-t border-border-color pt-4 flex items-center justify-between text-xs text-chart-4 font-semibold">
                <span>PDF EXPORTER INTEGRATED</span>
                <span className="flex items-center gap-1">Details <ArrowRight size={12} /></span>
              </div>
            </CornerBorders>
          </motion.div>
        </div>
      </section>

      {/* PRODUCT SHOWCASE SECTION */}
      <section className="py-20 relative z-20 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-semibold text-accent uppercase tracking-widest mb-3">Seamless Control</h2>
          <p className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            High-Performance Dashboard
          </p>
          <p className="text-text-secondary mt-4 text-sm max-w-xl mx-auto">
            Get an instant bird's-eye view of hardware asset depreciation, allocations, and compliance levels with a responsive, modern interface.
          </p>
        </div>

        {/* Mock dashboard display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative rounded-2xl glass-lux border border-border-color p-4 md:p-6 overflow-hidden shadow-2xl shadow-accent/5"
        >
          {/* Top chrome control buttons */}
          <div className="flex items-center gap-2 mb-4 border-b border-border-color pb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-danger/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-warning/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-success/80" />
            <span className="text-[10px] text-text-secondary/40 font-mono ml-4">assetops.enterprise/dashboard</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Sidebar Mock (3 columns) */}
            <div className="lg:col-span-3 hidden lg:flex flex-col gap-2.5 border-r border-border-color pr-6 text-sm">
              <div className="p-3 bg-bg-tertiary text-foreground font-semibold rounded-lg flex items-center gap-2 border border-border-color">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Operational Control</span>
              </div>
              {['Asset Registry', 'Resource Scheduler', 'Kanban Board', 'Audit Cycles', 'Analytics Reports', 'Department Settings'].map((menu, i) => (
                <div key={i} className="p-2.5 hover:bg-bg-tertiary text-text-secondary hover:text-foreground rounded-lg flex items-center gap-2 cursor-pointer transition-colors text-xs">
                  <div className="w-1 h-1 rounded-full bg-border-color" />
                  <span>{menu}</span>
                </div>
              ))}
            </div>

            {/* Dashboard Mock Content (9 columns) */}
            <div className="lg:col-span-9 flex flex-col gap-6">
              
              {/* Top stats widgets */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Hardware Stock', value: '4,821 Units', change: '+12% MoM', color: 'text-primary' },
                  { label: 'Active Custodians', value: '1,498 Staff', change: '+3% MoM', color: 'text-chart-5' },
                  { label: 'Pending Repairs', value: '14 Tickets', change: '-28% Weekly', color: 'text-accent' },
                  { label: 'Compliance Level', value: '98.4%', change: 'Grade A Audit', color: 'text-chart-4' },
                ].map((stat, i) => (
                  <div key={i} className="p-4 bg-bg-tertiary rounded-xl border border-border-color">
                    <span className="text-[10px] text-text-secondary">{stat.label}</span>
                    <h4 className={`text-sm sm:text-base font-bold mt-1 ${stat.color}`}>{stat.value}</h4>
                    <span className="text-[9px] text-text-secondary/40 block mt-1">{stat.change}</span>
                  </div>
                ))}
              </div>

              {/* Graphic Asset Mockups Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Mock Card 1: Asset Workstation */}
                <div className="glass-lux-card rounded-xl overflow-hidden border border-border-color flex flex-col">
                  <div className="relative h-44 overflow-hidden bg-bg-tertiary">
                    <img
                      src="https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=600&q=80"
                      alt="Workstation Asset"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 px-2 py-0.5 bg-primary/90 text-white text-[10px] font-bold uppercase rounded-md tracking-wider">
                      Available
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] text-primary font-mono uppercase tracking-widest">ID: ASSET-88219</span>
                      <h4 className="text-sm font-bold text-foreground mt-1">Apple Mac Studio (M2 Ultra, 64GB)</h4>
                      <p className="text-[11px] text-text-secondary mt-1">Allocated to Engineering Division. Track deployment history and licensing compliance records.</p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-text-secondary/50 mt-4 border-t border-border-color pt-3">
                      <span>Depreciation: 15% Yr</span>
                      <span>Assignee: Sarah Jenkins</span>
                    </div>
                  </div>
                </div>

                {/* Mock Card 2: Server Assets */}
                <div className="glass-lux-card rounded-xl overflow-hidden border border-border-color flex flex-col">
                  <div className="relative h-44 overflow-hidden bg-bg-tertiary">
                    <img
                      src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80"
                      alt="Server Node Asset"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 px-2 py-0.5 bg-accent/90 text-white text-[10px] font-bold uppercase rounded-md tracking-wider">
                      Allocated
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] text-accent font-mono uppercase tracking-widest">ID: ASSET-90114</span>
                      <h4 className="text-sm font-bold text-foreground mt-1">Dell PowerEdge R760 Rack Server</h4>
                      <p className="text-[11px] text-text-secondary mt-1">Hosted in Dublin HQ datacenter. Monitors temperature, performance metrics, and service warranty cycles.</p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-text-secondary/50 mt-4 border-t border-border-color pt-3">
                      <span>Depreciation: 20% Yr</span>
                      <span>Custodian: DevOps Team</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </motion.div>
      </section>

      {/* METRICS / STATS SECTION (Animated counters) */}
      <section id="metrics" className="py-20 relative z-20 border-t border-b border-lux-border bg-lux-bg/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 text-center">
            
            <div className="flex flex-col items-center">
              <div className="mb-3 text-lux-cyan">
                <Shield size={32} />
              </div>
              <NumberCounter value={9840} suffix="+" />
              <span className="text-text-secondary/70 text-xs uppercase tracking-widest font-semibold mt-2">Assets Managed</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="mb-3 text-lux-sky">
                <Users size={32} />
              </div>
              <NumberCounter value={120} suffix="+" />
              <span className="text-text-secondary/70 text-xs uppercase tracking-widest font-semibold mt-2">Enterprise Clients</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="mb-3 text-lux-magenta">
                <Award size={32} />
              </div>
              <NumberCounter value={99.9} suffix="%" />
              <span className="text-text-secondary/70 text-xs uppercase tracking-widest font-semibold mt-2">Uptime Reliability</span>
            </div>

          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-32 relative z-20 max-w-5xl mx-auto px-6 text-center">
        
        {/* Soft backdrop glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.06)_0%,transparent_50%)] pointer-events-none -z-10" />

        <h2 className="text-3xl sm:text-5xl font-black mb-6">
          Ready to streamline your hardware ecosystem?
        </h2>
        <p className="text-text-secondary max-w-xl mx-auto text-sm sm:text-base leading-relaxed mb-10">
          Sign up with your enterprise credentials to manage lifecycle audits, schedule resources, and assign workstations immediately.
        </p>

        <Link 
          to="/login"
          className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-bold text-white rounded-xl group bg-gradient-to-br from-lux-purple to-lux-cyan hover:shadow-lg hover:shadow-lux-purple/30 transition-shadow duration-300"
        >
          <span className="relative px-8 py-4 transition-all ease-in duration-75 bg-lux-bg rounded-lg group-hover:bg-opacity-0 flex items-center gap-2">
            Launch Platform Hub
            <ArrowRight size={16} />
          </span>
        </Link>
      </section>

      {/* FOOTER */}
      <footer id="about" className="py-12 border-t border-lux-border relative z-20 text-center text-xs text-text-secondary/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">AssetOps</span>
            <span>© {new Date().getFullYear()} Keshav Corporation. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
