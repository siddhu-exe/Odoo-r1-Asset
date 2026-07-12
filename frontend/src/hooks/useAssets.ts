import { useEffect, useState } from 'react'

import { apiClient } from '@/api'
import type { Asset, PaginatedResponse } from '@/types'

export function useAssets(page: number = 1) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    apiClient
      .get<PaginatedResponse<Asset>>('/assets', { params: { page } })
      .then((response) => {
        setAssets(response.data.items)
        setTotal(response.data.total)
      })
      .catch(() => setError('Failed to load assets'))
      .finally(() => setIsLoading(false))
  }, [page])

  return { assets, total, isLoading, error }
}
