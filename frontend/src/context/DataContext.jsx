import React, { createContext, useContext, useState, useCallback } from 'react'

const DataContext = createContext()

export const mockAssets = [
  {
    id: 'AF-0012',
    name: 'Dell Laptop',
    category: 'Electronics',
    status: 'Allocated',
    location: 'Bengaluru',
    allocatedTo: 'Priya Shah',
    purchaseDate: '2023-01-15',
    value: 85000
  },
  {
    id: 'AF-0062',
    name: 'Projector',
    category: 'Electronics',
    status: 'Maintenance',
    location: 'HQ Floor 2',
    allocatedTo: null,
    purchaseDate: '2022-06-20',
    value: 45000
  },
  {
    id: 'AF-0201',
    name: 'Office Chair',
    category: 'Furniture',
    status: 'Available',
    location: 'Warehouse',
    allocatedTo: null,
    purchaseDate: '2023-03-10',
    value: 12000
  },
  {
    id: 'AF-0003',
    name: 'Bell Laptop',
    category: 'Electronics',
    status: 'Available',
    location: 'Desk E12',
    allocatedTo: null,
    purchaseDate: '2023-09-05',
    value: 92000
  },
  {
    id: 'AF-0321',
    name: 'Office Desk',
    category: 'Furniture',
    status: 'Allocated',
    location: 'Floor 1',
    allocatedTo: 'Arjun Patel',
    purchaseDate: '2022-11-12',
    value: 18000
  }
]

export const mockDepartments = [
  {
    id: 1,
    name: 'Engineering',
    head: 'Aditya Rao',
    parentDept: null,
    status: 'Active'
  },
  {
    id: 2,
    name: 'Facilities',
    head: 'Rohan Mehta',
    parentDept: null,
    status: 'Active'
  },
  {
    id: 3,
    name: 'Field Ops (East)',
    head: 'Soma Iqbal',
    parentDept: 'Facilities',
    status: 'Inactive'
  }
]

export const mockCategories = ['Electronics', 'Furniture', 'Vehicles', 'Equipment', 'Software']

export const mockEmployees = [
  { id: 1, name: 'Priya Shah', department: 'Engineering', email: 'priya@company.com', role: 'Manager' },
  { id: 2, name: 'Arjun Patel', department: 'Facilities', email: 'arjun@company.com', role: 'Technician' },
  { id: 3, name: 'Soma Iqbal', department: 'Field Ops', email: 'soma@company.com', role: 'Lead' },
  { id: 4, name: 'Aditya Rao', department: 'Engineering', email: 'aditya@company.com', role: 'Head' }
]

export const mockBookings = [
  {
    id: 'B001',
    resource: 'Conference room B2',
    bookedBy: 'Priya Shah',
    date: '2024-01-10',
    timeSlot: '9:00 - 10:00',
    status: 'Booked'
  },
  {
    id: 'B002',
    resource: 'Projector AF-0062',
    bookedBy: 'Arjun Patel',
    date: '2024-01-11',
    timeSlot: '14:30 - 16:30',
    status: 'Requested',
    conflict: true
  }
]

export const mockMaintenanceItems = [
  {
    id: 'MF-0062',
    asset: 'Bell Laptop',
    status: 'Pending',
    priority: 'High'
  },
  {
    id: 'MF-003',
    asset: 'AC Unit',
    status: 'Approved',
    priority: 'Medium'
  },
  {
    id: 'MF-0079',
    asset: 'Forklift',
    status: 'In Progress',
    priority: 'High',
    assignedTo: 'R. Varma'
  }
]

export const mockNotifications = [
  {
    id: 1,
    type: 'allocation',
    title: 'Laptop AF-0014 assigned to Priya shah - IT dept',
    timestamp: '2m ago',
    read: false
  },
  {
    id: 2,
    type: 'booking',
    title: 'Maintenance request AF-0055 approved',
    timestamp: '19m ago',
    read: true
  },
  {
    id: 3,
    type: 'booking',
    title: 'Booking confirmed : Room B2 : 2:00 to 3:00 PM',
    timestamp: '1h ago',
    read: true
  }
]

export function DataProvider({ children }) {
  const [assets, setAssets] = useState(mockAssets)
  const [departments, setDepartments] = useState(mockDepartments)
  const [employees, setEmployees] = useState(mockEmployees)
  const [bookings, setBookings] = useState(mockBookings)
  const [maintenanceItems, setMaintenanceItems] = useState(mockMaintenanceItems)
  const [notifications, setNotifications] = useState(mockNotifications)

  const addAsset = useCallback((asset) => {
    const newAsset = {
      ...asset,
      id: `AF-${Date.now().toString().slice(-4)}`
    }
    setAssets(prev => [newAsset, ...prev])
    return newAsset
  }, [])

  const updateAsset = useCallback((id, updates) => {
    setAssets(prev => prev.map(asset => asset.id === id ? { ...asset, ...updates } : asset))
  }, [])

  const transferAsset = useCallback((assetId, toEmployee) => {
    setAssets(prev => prev.map(asset =>
      asset.id === assetId
        ? { ...asset, allocatedTo: toEmployee, status: 'Allocated' }
        : asset
    ))
  }, [])

  const addDepartment = useCallback((dept) => {
    const newDept = { ...dept, id: Date.now() }
    setDepartments(prev => [newDept, ...prev])
    return newDept
  }, [])

  const addEmployee = useCallback((emp) => {
    const newEmp = { ...emp, id: Date.now() }
    setEmployees(prev => [newEmp, ...prev])
    return newEmp
  }, [])

  const addBooking = useCallback((booking) => {
    const newBooking = { ...booking, id: `B${Date.now().toString().slice(-3)}` }
    setBookings(prev => [newBooking, ...prev])
    return newBooking
  }, [])

  const addMaintenanceItem = useCallback((item) => {
    const newItem = { ...item, id: `MF-${Date.now().toString().slice(-4)}` }
    setMaintenanceItems(prev => [newItem, ...prev])
    return newItem
  }, [])

  const addNotification = useCallback((notif) => {
    const newNotif = { ...notif, id: Date.now(), timestamp: 'now', read: false }
    setNotifications(prev => [newNotif, ...prev])
  }, [])

  return (
    <DataContext.Provider value={{
      assets,
      departments,
      employees,
      bookings,
      maintenanceItems,
      notifications,
      addAsset,
      updateAsset,
      transferAsset,
      addDepartment,
      addEmployee,
      addBooking,
      addMaintenanceItem,
      addNotification
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within DataProvider')
  }
  return context
}
