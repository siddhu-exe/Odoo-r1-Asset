import axios from 'axios'

const API_BASE = 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
})

// Auto-login with seeded admin credentials to get a token
let tokenPromise = null

function getToken() {
  if (!tokenPromise) {
    const saved = localStorage.getItem('api_access_token')
    if (saved) {
      tokenPromise = Promise.resolve(saved)
    } else {
      tokenPromise = axios.post(`${API_BASE}/auth/login`, {
        email: 'admin@assetflow.com',
        password: 'Admin@1234'
      }).then(res => {
        const token = res.data.access_token
        localStorage.setItem('api_access_token', token)
        return token
      }).catch(err => {
        console.error('Auto-login failed:', err)
        tokenPromise = null
        throw err
      })
    }
  }
  return tokenPromise
}

// Attach token to every request
api.interceptors.request.use(async (config) => {
  try {
    const token = await getToken()
    config.headers.Authorization = `Bearer ${token}`
  } catch {
    // continue without token
  }
  return config
})

// On 401, clear cached token and retry once
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true
      localStorage.removeItem('api_access_token')
      tokenPromise = null
      try {
        const token = await getToken()
        err.config.headers.Authorization = `Bearer ${token}`
        return api(err.config)
      } catch {
        return Promise.reject(err)
      }
    }
    return Promise.reject(err)
  }
)

export default api
