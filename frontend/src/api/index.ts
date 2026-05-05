import request from './request'
import type { ApiResponse, PaginatedResponse, Project, AuthResult, LoginPayload, RegisterPayload } from '@/types'

export const projectApi = {
  getProjects(params?: Record<string, any>) {
    return request.get<ApiResponse<PaginatedResponse<Project>>>('/projects', { params })
  },
  getProject(id: string) {
    return request.get<ApiResponse<Project>>(`/projects/${id}`)
  },
  getReadme(id: string) {
    return request.get<ApiResponse<{ readmeContent: string | null; readmeHtml: string | null }>>(`/projects/${id}/readme`)
  },
  getRelated(id: string) {
    return request.get<ApiResponse<Project[]>>(`/projects/${id}/related`)
  },
  getLanguages() {
    return request.get<ApiResponse<string[]>>('/projects/languages')
  },
  getAnalytics() {
    return request.get<ApiResponse<any>>('/projects/analytics')
  },
  submitProject(data: { githubUrl: string; note?: string }) {
    return request.post<ApiResponse<Project>>('/projects/submit', data)
  },
  toggleCollect(projectId: string) {
    return request.post<ApiResponse<{ collected: boolean }>>(`/projects/${projectId}/collect`)
  },
}

export const authApi = {
  login(data: LoginPayload) {
    return request.post<ApiResponse<AuthResult>>('/auth/login', data)
  },
  register(data: RegisterPayload) {
    return request.post<ApiResponse<AuthResult>>('/auth/register', data)
  },
  githubLogin() {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/github`
  },
}

export const searchApi = {
  search(params: { keyword: string; page?: number; pageSize?: number }) {
    return request.get<ApiResponse<PaginatedResponse<Project>>>('/search', { params })
  },
  suggest(keyword: string) {
    return request.get<ApiResponse<string[]>>('/search/suggest', { params: { keyword } })
  },
  hot() {
    return request.get<ApiResponse<string[]>>('/search/hot')
  },
}

export const trendingApi = {
  daily(page?: number, pageSize?: number) {
    return request.get<ApiResponse<PaginatedResponse<Project>>>('/trending/daily', { params: { page, pageSize } })
  },
  weekly(page?: number, pageSize?: number) {
    return request.get<ApiResponse<PaginatedResponse<Project>>>('/trending/weekly', { params: { page, pageSize } })
  },
  monthly(page?: number, pageSize?: number) {
    return request.get<ApiResponse<PaginatedResponse<Project>>>('/trending/monthly', { params: { page, pageSize } })
  },
  allTime(page?: number, pageSize?: number) {
    return request.get<ApiResponse<PaginatedResponse<Project>>>('/trending/all-time', { params: { page, pageSize } })
  },
  rising(page?: number, pageSize?: number) {
    return request.get<ApiResponse<PaginatedResponse<Project>>>('/trending/rising', { params: { page, pageSize } })
  },
  projectTrend(projectId: string) {
    return request.get<ApiResponse<any>>(`/trending/projects/${projectId}/trend`)
  },
}

export const userApi = {
  getProfile() {
    return request.get<ApiResponse<any>>('/users/me')
  },
  updateProfile(data: any) {
    return request.put<ApiResponse<any>>('/users/me', data)
  },
  getCollections(params?: { page?: number; pageSize?: number; groupName?: string }) {
    return request.get<ApiResponse<PaginatedResponse<any>>>(`/users/me/collections`, { params })
  },
  updateCollection(id: string, data: { groupName?: string; note?: string }) {
    return request.put<ApiResponse<any>>(`/users/me/collections/${id}`, data)
  },
  deleteCollection(id: string) {
    return request.delete<ApiResponse<any>>(`/users/me/collections/${id}`)
  },
  batchDeleteCollections(ids: string[]) {
    return request.post<ApiResponse<any>>('/users/me/collections/batch-delete', { ids })
  },
  getReviews(params?: { page?: number; pageSize?: number }) {
    return request.get<ApiResponse<PaginatedResponse<any>>>(`/users/me/reviews`, { params })
  },
  getHistory() {
    return request.get<ApiResponse<any[]>>('/users/me/history')
  },
  recordView(projectId: string) {
    return request.post<ApiResponse<any>>('/users/me/history', { projectId })
  },
}

export const notificationApi = {
  getNotifications(params?: { page?: number; pageSize?: number }) {
    return request.get<ApiResponse<any>>('/users/me/notifications', { params })
  },
  getUnreadCount() {
    return request.get<ApiResponse<number>>('/users/me/notifications/unread-count')
  },
  markRead(id: string) {
    return request.put<ApiResponse<any>>(`/users/me/notifications/${id}/read`)
  },
  markAllRead() {
    return request.put<ApiResponse<any>>('/users/me/notifications/read-all')
  },
  getSubscriptions() {
    return request.get<ApiResponse<any[]>>('/users/me/subscriptions')
  },
  addSubscription(type: string, value: string) {
    return request.post<ApiResponse<any>>('/users/me/subscriptions', { type, value })
  },
  toggleSubscription(id: string, enabled: boolean) {
    return request.put<ApiResponse<any>>(`/users/me/subscriptions/${id}`, { enabled })
  },
  removeSubscription(id: string) {
    return request.delete<ApiResponse<any>>(`/users/me/subscriptions/${id}`)
  },
}

export const crawlerApi = {
  sync() {
    return request.post<ApiResponse<any>>('/crawler/sync')
  },
  update() {
    return request.post<ApiResponse<any>>('/crawler/update')
  },
}

export const commentApi = {
  getComments(projectId: string) {
    return request.get<ApiResponse<any[]>>(`/projects/${projectId}/comments`)
  },
  createComment(projectId: string, data: { content: string; parentId?: string }) {
    return request.post<ApiResponse<any>>(`/projects/${projectId}/comments`, data)
  },
  deleteComment(id: string) {
    return request.delete<ApiResponse<any>>(`/comments/${id}`)
  },
}

export const reviewApi = {
  getReviews(projectId: string) {
    return request.get<ApiResponse<any[]>>(`/projects/${projectId}/reviews`)
  },
  createReview(projectId: string, data: { rating: number; title?: string; content?: string }) {
    return request.post<ApiResponse<any>>(`/projects/${projectId}/reviews`, data)
  },
  updateReview(id: string, data: any) {
    return request.put<ApiResponse<any>>(`/reviews/${id}`, data)
  },
  deleteReview(id: string) {
    return request.delete<ApiResponse<any>>(`/reviews/${id}`)
  },
}

export const adminApi = {
  getProjects(params?: any) {
    return request.get<ApiResponse<any>>('/admin/projects', { params })
  },
  updateProject(id: string, data: any) {
    return request.put<ApiResponse<any>>(`/admin/projects/${id}`, data)
  },
  deleteProject(id: string) {
    return request.delete<ApiResponse<any>>(`/admin/projects/${id}`)
  },
  getPending(params?: any) {
    return request.get<ApiResponse<any>>('/admin/pending', { params })
  },
  reviewProject(id: string, approved: boolean) {
    return request.put<ApiResponse<any>>(`/admin/pending/${id}`, { approved })
  },
  getUsers(params?: any) {
    return request.get<ApiResponse<any>>('/admin/users', { params })
  },
  updateUserRole(id: string, role: string) {
    return request.put<ApiResponse<any>>(`/admin/users/${id}`, { role })
  },
  getStats() {
    return request.get<ApiResponse<any>>('/admin/stats')
  },
  getTags() {
    return request.get<ApiResponse<any>>('/admin/tags')
  },
  createTag(data: { name: string; slug: string }) {
    return request.post<ApiResponse<any>>('/admin/tags', data)
  },
  updateTag(id: string, data: any) {
    return request.put<ApiResponse<any>>(`/admin/tags/${id}`, data)
  },
  deleteTag(id: string) {
    return request.delete<ApiResponse<any>>(`/admin/tags/${id}`)
  },
  getCategories() {
    return request.get<ApiResponse<any>>('/admin/categories')
  },
  createCategory(data: any) {
    return request.post<ApiResponse<any>>('/admin/categories', data)
  },
  updateCategory(id: string, data: any) {
    return request.put<ApiResponse<any>>(`/admin/categories/${id}`, data)
  },
  deleteCategory(id: string) {
    return request.delete<ApiResponse<any>>(`/admin/categories/${id}`)
  },
}
