export interface Project {
  id: string
  githubId: number
  fullName: string
  name: string
  description: string | null
  homepageUrl: string | null
  htmlUrl: string
  stars: number
  forks: number
  watchers: number
  openIssues: number
  primaryLanguage: string | null
  languageStats: Record<string, number> | null
  license: string | null
  topics: string[]
  readmeContent: string | null
  readmeHtml: string | null
  contributorCount: number
  githubCreatedAt: string | null
  githubUpdatedAt: string | null
  pushedAt: string | null
  isArchived: boolean
  isFork: boolean
  status: string
  source: string
  avgRating: number | null
  reviewCount: number
  categoryId: string | null
  viewCount: number
  createdAt: string
  updatedAt: string
  category?: Category | null
  tags?: ProjectTag[]
  isCollected?: boolean
}

export interface ProjectTag {
  projectId: string
  tagId: string
  source: string
  tag: Tag
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  parentId?: string
  children?: Category[]
}

export interface Tag {
  id: string
  name: string
  slug: string
  usageCount: number
}

export interface User {
  id: string
  username: string
  email: string | null
  role: string | null
  avatarUrl: string | null
  bio?: string
  createdAt: string
  lastLoginAt: string | null
}

export interface Collection {
  id: string
  userId: string
  projectId: string
  groupName: string
  note: string | null
  project?: Project
  createdAt: string
}

export interface Review {
  id: string
  userId: string
  projectId: string
  rating: number
  title: string | null
  content: string | null
  usageScenario: string | null
  createdAt: string
  user?: User
}

export interface Comment {
  id: string
  userId: string
  projectId: string
  parentId: string | null
  content: string
  createdAt: string
  user?: User
  replies?: Comment[]
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
}

export interface AuthResult {
  accessToken: string
  user: User
}
