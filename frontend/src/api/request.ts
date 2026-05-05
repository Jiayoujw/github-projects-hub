import axios from 'axios'
import type { ApiResponse } from '@/types'

const pendingRequests = new Set<AbortController>()

export function cancelAllRequests(reason = 'navigation') {
  pendingRequests.forEach((ctrl) => ctrl.abort(reason))
  pendingRequests.clear()
}

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 15000,
})

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  const ctrl = new AbortController()
  config.signal = ctrl.signal
  pendingRequests.add(ctrl)
  return config
})

request.interceptors.response.use(
  (response) => {
    const data = response.data as ApiResponse
    if (data.code !== 200 && data.code !== 201) {
      return Promise.reject(new Error(data.message || 'Request failed'))
    }
    return response
  },
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error)
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

// Clean up controller after request completes
request.interceptors.response.use(
  (response) => {
    if (response.config.signal) {
      pendingRequests.forEach((ctrl) => {
        if (ctrl.signal === response.config.signal) pendingRequests.delete(ctrl)
      })
    }
    return response
  },
  (error) => {
    if (error.config?.signal) {
      pendingRequests.forEach((ctrl) => {
        if (ctrl.signal === error.config.signal) pendingRequests.delete(ctrl)
      })
    }
    return Promise.reject(error)
  },
)

export default request
