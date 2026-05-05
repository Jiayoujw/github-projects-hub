import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Project, PaginatedResponse } from '@/types'
import { projectApi } from '@/api'

export const useProjectStore = defineStore('project', () => {
  const projects = ref<Project[]>([])
  const total = ref(0)
  const loading = ref(false)

  async function fetchProjects(params?: Record<string, any>) {
    loading.value = true
    try {
      const res = await projectApi.getProjects(params)
      const data = res.data.data as PaginatedResponse<Project>
      projects.value = data.items
      total.value = data.total
    } finally {
      loading.value = false
    }
  }

  return { projects, total, loading, fetchProjects }
})
