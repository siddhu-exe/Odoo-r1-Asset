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
    'Missing': 'bg-danger/10 text-danger border border-danger/30'
  }
  return colors[status] || 'bg-text-secondary/10 text-text-secondary border border-text-secondary/30'
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
  const colors = ['#00d4ff', '#ff6b35', '#00d98e', '#ffa500', '#ff4757']
  return colors[Math.floor(Math.random() * colors.length)]
}

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const truncate = (str, length) => {
  return str.length > length ? str.substring(0, length) + '...' : str
}
