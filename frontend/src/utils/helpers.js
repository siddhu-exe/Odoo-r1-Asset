export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ')
}

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

export const getStatusColor = (status) => {
  const colors = {
    // Asset lifecycle statuses (from backend enum)
    'available': 'bg-success/10 text-success border border-success/30',
    'allocated': 'bg-primary/10 text-primary border border-primary/30',
    'reserved': 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
    'under_maintenance': 'bg-warning/10 text-warning border border-warning/30',
    'lost': 'bg-danger/10 text-danger border border-danger/30',
    'retired': 'bg-text-secondary/10 text-text-secondary border border-text-secondary/30',
    'disposed': 'bg-text-secondary/10 text-text-secondary border border-text-secondary/30',
    // Allocation statuses
    'active': 'bg-primary/10 text-primary border border-primary/30',
    'returned': 'bg-success/10 text-success border border-success/30',
    'overdue': 'bg-danger/10 text-danger border border-danger/30',
    // Maintenance statuses
    'pending': 'bg-warning/10 text-warning border border-warning/30',
    'approved': 'bg-success/10 text-success border border-success/30',
    'rejected': 'bg-danger/10 text-danger border border-danger/30',
    'assigned': 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
    'in_progress': 'bg-primary/10 text-primary border border-primary/30',
    'resolved': 'bg-success/10 text-success border border-success/30',
    // Entity statuses
    'inactive': 'bg-danger/10 text-danger border border-danger/30',
    // Legacy display labels (mixed-case, kept for compatibility)
    'Available': 'bg-success/10 text-success border border-success/30',
    'Allocated': 'bg-primary/10 text-primary border border-primary/30',
    'Maintenance': 'bg-warning/10 text-warning border border-warning/30',
    'Pending': 'bg-warning/10 text-warning border border-warning/30',
    'Approved': 'bg-success/10 text-success border border-success/30',
    'In Progress': 'bg-primary/10 text-primary border border-primary/30',
    'Resolved': 'bg-success/10 text-success border border-success/30',
    'Inactive': 'bg-danger/10 text-danger border border-danger/30',
    'Active': 'bg-success/10 text-success border border-success/30',
    'Booked': 'bg-success/10 text-success border border-success/30',
    'Requested': 'bg-warning/10 text-warning border border-warning/30',
    'Damaged': 'bg-danger/10 text-danger border border-danger/30',
    'Verified': 'bg-success/10 text-success border border-success/30',
    'Missing': 'bg-danger/10 text-danger border border-danger/30',
  }
  return colors[status] || 'bg-text-secondary/10 text-text-secondary border border-text-secondary/30'
}

export const formatStatus = (status) => {
  if (!status) return '-'
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export const getIcon = (type) => {
  const icons = {
    alert: '⚠️',
    success: '✓',
    error: '✕',
    info: 'ⓘ',
    pending: '⏳',
    approved: '✓',
    rejected: '✕'
  }
  return icons[type] || 'ℹ'
}

export const calculateDaysSince = (date) => {
  const now = new Date()
  const past = new Date(date)
  const diff = now - past
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

export const getRandomColor = () => {
  const colors = ['#FF5A3C', '#8B7FE8', '#C9CCD3', '#111111', '#6B7280']
  return colors[Math.floor(Math.random() * colors.length)]
}

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const truncate = (str, length) => {
  return str.length > length ? str.substring(0, length) + '...' : str
}
