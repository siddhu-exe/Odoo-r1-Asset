export type UserRole = 'admin' | 'asset_manager' | 'department_head' | 'employee'

export type AssetStatus =
  | 'available'
  | 'allocated'
  | 'reserved'
  | 'under_maintenance'
  | 'lost'
  | 'retired'
  | 'disposed'

export type AllocationStatus = 'active' | 'returned' | 'overdue'

export type BookingStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled'

export type MaintenanceStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'assigned'
  | 'in_progress'
  | 'resolved'

export type AuditStatus = 'open' | 'in_progress' | 'closed'

export interface Employee {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string | null
  role: UserRole
  status: 'active' | 'inactive'
  department_id: string | null
  created_at: string
  updated_at: string
}

export interface Department {
  id: string
  name: string
  code: string
  description: string | null
  status: 'active' | 'inactive'
  parent_id: string | null
  head_id: string | null
  created_at: string
  updated_at: string
}

export interface AssetCategory {
  id: string
  name: string
  description: string | null
  custom_fields: Record<string, unknown> | null
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface Asset {
  id: string
  name: string
  asset_tag: string
  serial_number: string | null
  category_id: string
  condition: 'excellent' | 'good' | 'fair' | 'poor'
  status: AssetStatus
  location: string | null
  is_bookable: boolean
  acquisition_date: string | null
  acquisition_cost: string | null
  photo_url: string | null
  document_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Allocation {
  id: string
  asset_id: string
  employee_id: string | null
  department_id: string | null
  allocated_by: string
  status: AllocationStatus
  expected_return_date: string | null
  returned_at: string | null
  condition_on_return: string | null
  return_notes: string | null
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  asset_id: string
  booked_by: string
  start_time: string
  end_time: string
  status: BookingStatus
  purpose: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
}

export interface MaintenanceRequest {
  id: string
  asset_id: string
  raised_by: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: MaintenanceStatus
  technician_id: string | null
  approved_by: string | null
  photo_url: string | null
  resolved_at: string | null
  resolution_notes: string | null
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  employee_id: string
  type: string
  title: string
  message: string
  is_read: boolean
  entity_type: string | null
  entity_id: string | null
  created_at: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}
