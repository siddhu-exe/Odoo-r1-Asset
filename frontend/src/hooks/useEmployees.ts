import { useEffect, useState } from 'react'

import { apiClient } from '@/api'
import type { Employee, PaginatedResponse } from '@/types'

export function useEmployees(page: number = 1) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    apiClient
      .get<PaginatedResponse<Employee>>('/employees', { params: { page } })
      .then((response) => {
        setEmployees(response.data.items)
        setTotal(response.data.total)
      })
      .catch(() => setError('Failed to load employees'))
      .finally(() => setIsLoading(false))
  }, [page])

  return { employees, total, isLoading, error }
}
